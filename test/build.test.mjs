// The build and what ships: main.js and styles.css are up to date with
// src/, the bundle is made only from src/, nothing private is anywhere in
// the repository, and the manifest keeps the directory's rules.
//
// The private check: nothing in the repository may name the home folder of
// the machine running the test. Given ISFAHAN_PRIVATE_VAULT (the folder of a
// vault this plugin grew out of), it also fails on that vault's own folder
// names and the names of its work projects, which it reads from there at
// test time, so they're never written into this repository; and
// ISFAHAN_PRIVATE_DIRS (folders, ":"-separated) adds the names of the folders
// inside each, a projects folder, say.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, readdirSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { ROOT, build, buildText } from "../tools/build.mjs";

const fresh = await build(mkdtempSync(path.join(os.tmpdir(), "isfahan-build-")));

test("main.js and styles.css are built from the current src/", () => {
  for (const f of ["main.js", "styles.css"]) assert.equal(readFileSync(path.join(ROOT, f), "utf8"), readFileSync(path.join(fresh, f), "utf8"), `${f}: run node tools/build.mjs`);
});

test("the bundle is made only from src/", async () => {
  const { inputs } = await buildText();
  assert.deepEqual(inputs.filter((f) => !path.resolve(f).startsWith(path.join(ROOT, "src") + path.sep)), []);
});

// Every text file in the repository, skipping dependencies and fonts.
function files(dir = ROOT, out = []) {
  for (const name of readdirSync(dir)) {
    if ([".git", "node_modules", "fonts"].includes(name)) continue;
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) files(p, out);
    else if (/\.(js|mjs|cjs|css|json|md|txt)$/.test(name)) out.push(p);
  }
  return out;
}

test("nothing private in the repository", () => {
  const texts = files().map((f) => [path.relative(ROOT, f), readFileSync(f, "utf8")]);
  const home = os.homedir();
  assert.deepEqual(texts.filter(([, t]) => t.includes(home)).map(([f]) => f), [], "the home folder's path");
  const vault = process.env.ISFAHAN_PRIVATE_VAULT;
  if (!vault) return;
  // That vault's numbered top-level folders, and the folders inside ISFAHAN_PRIVATE_DIRS.
  const dirs = (d) => (existsSync(d) ? readdirSync(d, { withFileTypes: true }).filter((e) => e.isDirectory() && !/^[._]/.test(e.name)).map((e) => e.name) : []);
  const extra = (process.env.ISFAHAN_PRIVATE_DIRS || "").split(":").filter(Boolean);
  const names = [...dirs(vault).filter((n) => /^\d+-/.test(n)), ...extra.flatMap(dirs)];
  assert.ok(names.length > 0, `no folders found in ${vault}`);
  const found = texts.flatMap(([f, t]) => names.filter((n) => t.toLowerCase().includes(n.toLowerCase())).map((n) => `${f}: ${n}`));
  assert.deepEqual(found, [], "the private vault's folder or project names");
});

test("the manifest keeps the directory's rules", () => {
  const m = JSON.parse(readFileSync(path.join(ROOT, "manifest.json"), "utf8"));
  assert.equal(m.id, "isfahan-look");
  assert.match(m.version, /^\d+\.\d+\.\d+$/);
  assert.ok(!/obsidian/i.test(m.id), "an id can't contain 'obsidian'");
  // A description: an action first, a period last, no emoji, at most 250 characters.
  assert.ok(m.description.length <= 250 && m.description.endsWith(".") && !/\p{Extended_Pictographic}/u.test(m.description));
});

// Obsidian installs main.js, manifest.json and styles.css only: the fonts
// ride inside main.js, with their licence.
test("every bundled font is inlined in main.js, with its licence", () => {
  const js = readFileSync(path.join(ROOT, "main.js"), "utf8");
  const fonts = readdirSync(path.join(ROOT, "src/fonts")).filter((f) => f.endsWith(".woff2"));
  assert.equal(fonts.length, 4);
  for (const f of fonts) assert.ok(js.includes(readFileSync(path.join(ROOT, "src/fonts", f)).toString("base64")), `${f} not inlined`);
  assert.ok(js.startsWith("/* Isfahan") && js.includes("SIL OPEN FONT LICENSE Version 1.1"));
});

// Older Obsidian installers' Chromium knows only the -webkit- mask properties.
test("styles: every mask declaration has its -webkit- twin", () => {
  const css = readFileSync(path.join(ROOT, "styles.css"), "utf8");
  const count = (re) => (css.match(re) || []).length;
  const plain = count(/(?<![-\w])mask(?:-[a-z]+)?\s*:/g);
  assert.ok(plain > 0);
  assert.equal(count(/-webkit-mask(?:-[a-z]+)?\s*:/g), plain);
  assert.doesNotMatch(css, /-webkit-mask-composite:\s*intersect/);
});

test("styles: every class-list placeholder filled", () => {
  const css = readFileSync(path.join(ROOT, "styles.css"), "utf8");
  assert.doesNotMatch(css, /__no-(page|band)/);
  assert.match(css, /\.no-page/);
});

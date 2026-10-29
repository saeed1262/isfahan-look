// Builds Isfahan: src/ bundled by esbuild into main.js, and src/styles/
// joined into styles.css, next to manifest.json in the repository's root:
// the three files Obsidian loads, and a release attaches.
//   node tools/build.mjs [outDir]
// esbuild is pinned to one version, so every build gives the same bytes.
import { createRequire } from "node:module";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NO_BAND_CLASSES, NO_PAGE_CLASSES } from "../src/core/classes.js";

export const ESBUILD_VERSION = "0.28.2";
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// esbuild from the repository's own node_modules, else from ISFAHAN_DEV.
function loadEsbuild() {
  for (const from of [path.join(ROOT, "node_modules/"), path.join(process.env.ISFAHAN_DEV || path.join(os.homedir(), ".cache/isfahan-dev"), "node_modules/")]) {
    try { return createRequire(from)("esbuild"); } catch { /* try the next */ }
  }
  throw new Error(`esbuild ${ESBUILD_VERSION} not found: run npm install`);
}
const esbuild = loadEsbuild();
if (esbuild.version !== ESBUILD_VERSION) throw new Error(`esbuild ${esbuild.version} found, ${ESBUILD_VERSION} expected`);

export const OPTIONS = {
  entryPoints: [path.join(ROOT, "src/public.js")],
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "es2022",
  external: ["obsidian", "electron"],
  charset: "utf8", // keep any non-ASCII text in the code readable
  loader: { ".woff2": "dataurl" }, // the fonts, inlined (src/fonts.js)
  legalComments: "none",
  logLevel: "warning",
  // The fonts' licences travel with them: Obsidian installs main.js alone.
  banner: { js: `/* Isfahan: built from src/ by tools/build.mjs. Edit src/, not this file.\n\n${readFileSync(path.join(ROOT, "src/fonts/OFL.txt"), "utf8").trim()}\n*/` },
};

// Obsidian on an older installer runs a Chromium (before 120) that only
// knows the -webkit- mask properties, and without them every masked tile
// band and motif would paint as a solid block. So each mask declaration
// gets a -webkit- twin just before it (mask-composite's keywords renamed to
// the old ones). Values are read up to the first ; or } outside quotes and
// brackets, since some masks are inline SVG data URLs.
const OLD_COMPOSITE = { add: "source-over", subtract: "source-out", intersect: "source-in", exclude: "xor" };
export function prefixMasks(css) {
  const re = /(^|[;{\s])(mask(?:-image|-size|-repeat|-position|-origin|-clip|-composite)?)\s*:/g;
  let out = "", last = 0, m;
  while ((m = re.exec(css))) {
    const start = m.index + m[1].length;
    let i = re.lastIndex, depth = 0, quote = null;
    for (; i < css.length; i++) {
      const c = css[i];
      if (quote) { if (c === quote) quote = null; continue; }
      if (c === '"' || c === "'") quote = c;
      else if (c === "(") depth++;
      else if (c === ")") depth--;
      else if (depth === 0 && (c === ";" || c === "}")) break;
    }
    let value = css.slice(re.lastIndex, i).trim();
    if (m[2] === "mask-composite") value = value.split(/\s*,\s*/).map((k) => OLD_COMPOSITE[k] ?? k).join(", ");
    out += css.slice(last, start) + `-webkit-${m[2]}: ${value}; `;
    last = start;
    re.lastIndex = i;
  }
  return out + css.slice(last);
}

// styles.css: the files in src/styles/ joined in name order. Plain
// concatenation, so rules come out exactly as written (plus the mask twins
// above); `.__no-page` and `.__no-band` stand for the class lists in
// src/core/classes.js.
export function buildCss() {
  const dir = path.join(ROOT, "src/styles");
  const list = (names) => names.map((n) => `.${n}`).join(", ");
  return "/* Isfahan: built from src/styles/ by tools/build.mjs. Edit src/styles/, not this file. */\n"
    + prefixMasks(readdirSync(dir).filter((f) => f.endsWith(".css")).sort().map((f) => readFileSync(path.join(dir, f), "utf8")).join("")
      .replaceAll(".__no-page", list(NO_PAGE_CLASSES))
      .replaceAll(".__no-band", list(NO_BAND_CLASSES)));
}

// The bundle as text, and the source files it was made from (the tests read both).
export async function buildText() {
  const r = await esbuild.build({ ...OPTIONS, write: false, metafile: true });
  return { text: r.outputFiles[0].text, inputs: Object.keys(r.metafile.inputs) };
}

export async function build(out = ROOT) {
  mkdirSync(out, { recursive: true });
  await esbuild.build({ ...OPTIONS, outfile: path.join(out, "main.js") });
  writeFileSync(path.join(out, "styles.css"), buildCss());
  if (out !== ROOT) writeFileSync(path.join(out, "manifest.json"), readFileSync(path.join(ROOT, "manifest.json")));
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(`built ${await build(path.resolve(process.argv[2] || ROOT))}`);

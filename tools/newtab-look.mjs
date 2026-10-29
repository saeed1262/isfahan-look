// Isfahan's new tab, drawn by the plugin's own code (main.js) on a sample
// vault and a sample forecast, then photographed in headless Chrome with
// Obsidian's own app.css and this repository's styles.css, in each of the
// four phases: newtab-<phase>.png in OUT (default $TMPDIR/isfahan-newtab-look).
//   node tools/newtab-look.mjs [OUT]
// Needs jsdom and lucide-static (ISFAHAN_TEST_DEPS, or npm install) and
// Obsidian's app.css (cached by tools/clean-look.mjs, or ISFAHAN_APP_CSS).
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FACES } from "../src/core/settings.js";

// The sample is set in Isfahan, on Isfahan's clock, whatever this machine's.
process.env.TZ = "Asia/Tehran";
const PLACE = { name: "Isfahan", label: "Isfahan, Iran", lat: 32.65, lon: 51.67 };

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.resolve(process.argv[2] || path.join(os.tmpdir(), "isfahan-newtab-look"));
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const DEPS = existsSync(path.join(ROOT, "node_modules/lucide-static")) ? path.join(ROOT, "node_modules") : process.env.ISFAHAN_TEST_DEPS || path.join(os.homedir(), ".cache/isfahan-guide/node_modules");
const ICONS = path.join(DEPS, "lucide-static/icons");
const dev = process.env.ISFAHAN_DEV || path.join(os.homedir(), ".cache/isfahan-dev");
const APP_CSS = process.env.ISFAHAN_APP_CSS || readdirSync(dev).filter((f) => /^obsidian-app-.*\.css$/.test(f)).sort().map((f) => path.join(dev, f)).at(-1);
if (!APP_CSS || !existsSync(APP_CSS)) throw new Error("Obsidian's app.css not found: run tools/clean-look.mjs once, or set ISFAHAN_APP_CSS");
mkdirSync(OUT, { recursive: true });

const dom = require("../test/helpers/dom.cjs");
const { window, document } = dom.makeWindow();
globalThis.window = window; globalThis.document = document; globalThis.createDiv = window.createDiv;
const icon = (el, name) => {
  const n = String(name).replace(/^lucide-/, "");
  const f = path.join(ICONS, `${({ home: "house", "more-horizontal": "ellipsis" })[n] || n}.svg`);
  el.innerHTML = existsSync(f) ? readFileSync(f, "utf8").replace(/<!--[\s\S]*?-->/g, "").replace(/class="[^"]*"/, `class="svg-icon lucide-${n}"`) : "";
};

// A sample vault: a few notes, an empty tab, Obsidian's Plugin as far as loading goes.
class TFile { constructor(p) { this.path = p; this.basename = path.basename(p, ".md"); this.stat = { mtime: 0 }; } }
const notes = ["Reading/Artemis.md", "Projects/Garden plan.md", "Daily/2026-10-27.md", "Recipes/Saffron rice.md", "Ideas/Tile patterns.md"].map((p) => new TFile(p));
const pane = document.createElement("div");
pane.className = "workspace-leaf-content";
pane.dataset.type = "empty";
const content = pane.createDiv({ cls: "view-content" });
content.createDiv({ cls: "empty-state" });
const leaf = { view: { containerEl: pane, contentEl: content, getViewType: () => "empty" }, detach() {} };
const on = () => ({ off() {} });
const app = {
  workspace: { on, onLayoutReady: (fn) => fn(), getLeavesOfType: (t) => (t === "empty" ? [leaf] : []), getLastOpenFiles: () => notes.map((f) => f.path), getActiveViewOfType: () => null, iterateAllLeaves: () => {}, trigger: () => {} },
  vault: { on, getAbstractFileByPath: (p) => notes.find((f) => f.path === p) ?? null, getMarkdownFiles: () => notes, getName: () => "Sample", getConfig: () => "obsidian", adapter: { getResourcePath: (p) => p } },
  metadataCache: { on, getFileCache: () => null },
};
class Plugin {
  constructor(a, manifest) { this.app = a; this.manifest = manifest; }
  async loadData() { return null; }
  async saveData() {}
  register() {} registerEvent() {} registerDomEvent() {} registerInterval(id) { return id; } registerMarkdownPostProcessor() {}
  addCommand() {} addSettingTab() {}
  addStatusBarItem() { return document.body.createDiv({ cls: "status-bar-item" }); }
}
const { loadPlugin, obsidianStub } = require("../test/helpers/load.cjs");
const { P } = loadPlugin({ file: path.join(ROOT, "main.js"), obsidian: obsidianStub({ Plugin, TFile, setIcon: icon, setTooltip: () => {}, addIcon: () => {} }), globals: { window, document } });
const p = new P(app, { id: "isfahan-look", dir: ".obsidian/plugins/isfahan-look" });
document.hasFocus = () => true;

// A sample forecast for the sample place: partly cloudy, rain later.
const now = new Date(2026, 9, 27, 10, 20);
const hours = Array.from({ length: 24 }, (_, i) => ({ t: new Date(2026, 9, 27, 10 + i, 0), temp: 15 + 5 * Math.sin((i - 2) / 4), rain: i > 8 && i < 13 ? 60 : 5 }));
const weather = (day) => ({ at: Date.now(), where: `${PLACE.lat},${PLACE.lon}`, data: { temp: 17.4, code: 2, day, hi: 21, lo: 8, sun: [{ rise: new Date(2026, 9, 27, 6, 19), set: new Date(2026, 9, 27, 17, 17) }], hours } });

const fonts = FACES.map((f) => `@font-face{font-family:"${f.family}";src:url("file://${ROOT}/src/fonts/${f.file}") format("woff2");font-weight:100 900;font-style:${f.style ?? "normal"};unicode-range:${f.range}}`).join("\n");
const RealDate = Date;
globalThis.Date = class extends RealDate { constructor(...a) { super(...(a.length ? a : [now.getTime()])); } static now() { return now.getTime(); } };
p.refreshWeather = async () => {}; // the sample forecast, not the network
await p.onload();
await p.update({ place: PLACE });
for (const phase of ["dawn", "workday", "evening", "night"]) {
  p.settings.mode = phase;
  p.settings.weather = "scene";
  p.weather = weather(!["evening", "night"].includes(phase));
  p.apply();
  p.markNewTabs();
  // Without il-enter: the new tab as it rests, not halfway through fading in.
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}</style><link rel="stylesheet" href="file://${APP_CSS}"><link rel="stylesheet" href="file://${ROOT}/styles.css"><style>body{margin:0;height:100vh}</style></head><body class="obsidian-app mod-macos is-focused ${document.body.className}"><div class="app-container"><div class="horizontal-main-container"><div class="workspace"><div class="workspace-split mod-vertical mod-root"><div class="workspace-tabs mod-top mod-active"><div class="workspace-tab-container"><div class="workspace-leaf mod-active">${pane.outerHTML.replace(/\bil-enter\b/g, "")}</div></div></div></div></div></div></div></body></html>`;
  const file = path.join(OUT, `newtab-${phase}.html`);
  writeFileSync(file, html);
  execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files", "--window-size=1100,900", "--force-device-scale-factor=1", "--virtual-time-budget=6000", `--screenshot=${path.join(OUT, `newtab-${phase}.png`)}`, `file://${file}`], { stdio: "ignore" });
}
globalThis.Date = RealDate;
p.onunload();
console.log(`Wrote ${OUT}/newtab-<phase>.png for dawn, workday, evening and night.`);
process.exit(0); // the sample's timers, which a stub plugin can't clear, would keep it running

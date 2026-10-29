// How Isfahan's look holds up on Obsidian's own theme: one sample app page (ribbon, tabs, the file
// explorer, a note in Reading view with properties, headings, callouts,
// tasks, a table, code and a footnote, and the status bar) photographed in
// each of the four phases, in headless Chrome:
//   clean: Obsidian's app.css and Isfahan only (the default theme, no
//          snippets), as a new user has it;
//   vault: with ISFAHAN_PRIVATE_VAULT set, also that vault's whole stack
//          (app.css, Isfahan, its other plugins, its theme and snippets, in
//          Obsidian's order), side by side, to compare.
// Writes vault-<phase>.png, clean-<phase>.png and a side-by-side
// sheet-<phase>.png per phase into OUT (default $TMPDIR/isfahan-clean-look).
//   node tools/clean-look.mjs [OUT] [path/to/styles.css]   (default: this repository's styles.css)
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FACES } from "../src/core/settings.js";

const PLUGIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAULT = process.env.ISFAHAN_PRIVATE_VAULT || null;
const OUT = path.resolve(process.argv[2] || path.join(os.tmpdir(), "isfahan-clean-look"));
const CSS = path.resolve(process.argv[3] || path.join(PLUGIN, "styles.css"));
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const dev = process.env.ISFAHAN_DEV || path.join(os.homedir(), ".cache/isfahan-dev");
// Dependencies from npm install, else ISFAHAN_TEST_DEPS (or its default).
const DEPS = existsSync(path.join(PLUGIN, "node_modules/lucide-static")) ? path.join(PLUGIN, "node_modules") : process.env.ISFAHAN_TEST_DEPS || path.join(os.homedir(), ".cache/isfahan-guide/node_modules");
const ICONS = path.join(DEPS, "lucide-static/icons");
mkdirSync(OUT, { recursive: true });

// Obsidian's own app.css, from the installed app (cached per version, as style-diff does).
function appCss() {
  const support = path.join(os.homedir(), "Library/Application Support/obsidian");
  const asars = existsSync(support) ? readdirSync(support).filter((f) => /^obsidian-[\d.]+\.asar$/.test(f)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) : [];
  const asar = asars.length ? path.join(support, asars.at(-1)) : "/Applications/Obsidian.app/Contents/Resources/obsidian.asar";
  const out = path.join(dev, `obsidian-app-${path.basename(asar, ".asar")}.css`);
  if (!existsSync(out)) writeFileSync(out, createRequire(existsSync(path.join(PLUGIN, "node_modules/@electron/asar")) ? path.join(PLUGIN, "node_modules/") : path.join(dev, "node_modules/"))("@electron/asar").extractFile(asar, "app.css"));
  return out;
}
const STACKS = { clean: [appCss(), CSS] };
let snippets = [];
if (VAULT) {
  const appearance = JSON.parse(readFileSync(path.join(VAULT, ".obsidian/appearance.json"), "utf8"));
  const theme = appearance.cssTheme ? path.join(VAULT, ".obsidian/themes", appearance.cssTheme, "theme.css") : null;
  snippets = (appearance.enabledCssSnippets || []).map((s) => path.join(VAULT, ".obsidian/snippets", `${s}.css`)).filter(existsSync);
  const enabled = JSON.parse(readFileSync(path.join(VAULT, ".obsidian/community-plugins.json"), "utf8"));
  const pluginCss = enabled.filter((id) => !id.startsWith("isfahan")).map((id) => path.join(VAULT, ".obsidian/plugins", id, "styles.css")).filter(existsSync);
  STACKS.vault = [appCss(), CSS, ...pluginCss, ...(theme && existsSync(theme) ? [theme] : []), ...snippets];
}
// The fonts Isfahan bundles, as the plugin declares them (theme.js fontFaces).
const fonts = FACES.map((f) => `@font-face{font-family:"${f.family}";src:url("file://${PLUGIN}/src/fonts/${f.file}") format("woff2");font-weight:100 900;font-style:${f.style ?? "normal"};unicode-range:${f.range}}`).join("\n");

const icon = (n) => {
  const f = path.join(ICONS, `${n}.svg`);
  return existsSync(f) ? readFileSync(f, "utf8").replace(/<!--[\s\S]*?-->/g, "").replace(/class="[^"]*"/, `class="svg-icon lucide-${n}"`) : '<svg class="svg-icon" viewBox="0 0 24 24"></svg>';
};
const ribbon = `<div class="workspace-ribbon side-dock-ribbon mod-left"><div class="side-dock-actions">${["files", "search", "calendar-days", "star", "layout-dashboard", "settings"].map((n) => `<div class="clickable-icon side-dock-ribbon-action">${icon(n)}</div>`).join("")}</div></div>`;
const tab = (title, ico, active) => `<div class="workspace-tab-header${active ? " is-active mod-active" : ""}"><div class="workspace-tab-header-inner"><div class="workspace-tab-header-inner-icon">${icon(ico)}</div><div class="workspace-tab-header-inner-title">${title}</div><div class="workspace-tab-header-inner-close-button">${icon("x")}</div></div></div>`;
const tabs = (inner) => `<div class="workspace-tab-header-container"><div class="workspace-tab-header-container-inner">${inner}</div></div>`;
const file = (p, t, folder = false, open = false) => `<div class="tree-item ${folder ? "nav-folder" : "nav-file"}${folder && !open ? " is-collapsed" : ""}"><div class="tree-item-self ${folder ? "nav-folder-title mod-collapsible" : "nav-file-title"} is-clickable${p === "Reading/Artemis.md" ? " is-active" : ""}" data-path="${p}">${folder ? `<div class="tree-item-icon collapse-icon">${icon("chevron-down")}</div>` : ""}<div class="tree-item-inner ${folder ? "nav-folder-title-content" : "nav-file-title-content"}">${t}</div></div></div>`;
const explorer = `<div class="workspace-leaf mod-active"><div class="workspace-leaf-content" data-type="file-explorer"><div class="nav-header"><div class="nav-buttons-container">${["square-pen", "folder-plus", "arrow-up-narrow-wide", "chevrons-up-down"].map((n) => `<div class="clickable-icon nav-action-button">${icon(n)}</div>`).join("")}</div></div><div class="nav-files-container"><div>${file("Inbox", "Inbox", true)}${file("Daily", "Daily", true)}${file("Projects", "Projects", true)}${file("Reading", "Reading", true, true)}${file("Reading/Artemis.md", "Artemis")}${file("Reading/Dune.md", "Dune")}${file("Templates", "Templates", true)}</div></div></div></div>`;
const prop = (key, type, ico, value) => `<div class="metadata-property" tabindex="0" data-property-key="${key}" data-property-type="${type}"><div class="metadata-property-key"><span class="metadata-property-icon">${icon(ico)}</span><input class="metadata-property-key-input" type="text" value="${key}"></div><div class="metadata-property-value">${value}</div></div>`;
const props = `<div class="metadata-container" data-property-count="4"><div class="metadata-properties-heading"><div class="metadata-properties-title">Properties</div></div><div class="metadata-content"><div class="metadata-properties">${[
  prop("author", "text", "text", '<div class="metadata-input-longtext mod-truncate">Andy Weir</div>'),
  prop("pages", "number", "binary", '<input class="metadata-input metadata-input-number" type="number" value="322">'),
  prop("started", "date", "calendar", '<input class="metadata-input metadata-input-text mod-date" type="date" value="2026-10-14">'),
  prop("tags", "multitext", "tags", '<div class="multi-select-container"><div class="multi-select-pill"><div class="multi-select-pill-content"><span>reading</span></div></div><div class="multi-select-pill"><div class="multi-select-pill-content"><span>sci-fi</span></div></div></div>'),
].join("")}</div></div></div>`;
const callout = (type, title, ico, text) => `<div class="callout" data-callout="${type}"><div class="callout-title"><div class="callout-icon">${icon(ico)}</div><div class="callout-title-inner">${title}</div></div><div class="callout-content"><p>${text}</p></div></div>`;
const note = [
  '<div><h2>The setting</h2></div>',
  '<div><p>Artemis is the first city on the Moon, a cluster of five domes on the near side, linked by tunnels. Jazz Bashara grew up there; she smuggles small luxuries for a living, and dreams of the money that would buy her out of a coffin-sized room<sup class="footnote-ref"><a class="footnote-link" href="#fn-1">[1]</a></sup>.</p></div>',
  '<div><p>Weir writes it with <strong>engineering</strong> in every chapter, <em>and</em> a heist plot pulling it along; see <a class="internal-link" href="#">The Martian</a> for the same voice, and <code>#reading</code> notes for <mark>the quotes</mark>.</p></div>',
  `<div>${callout("note", "Why it's on the list", "pencil", "A friend's pick: lighter than The Martian, the same love of how things work.")}</div>`,
  '<div><h3>Notes so far</h3></div>',
  '<div><ul class="contains-task-list"><li class="task-list-item is-checked" data-task="x"><input type="checkbox" class="task-list-item-checkbox" checked> Part one, the smuggling</li><li class="task-list-item" data-task=" "><input type="checkbox" class="task-list-item-checkbox"> Part two, the job</li><li class="task-list-item" data-task=" "><input type="checkbox" class="task-list-item-checkbox"> Write the review</li></ul></div>',
  '<div><blockquote><p>"Welding is like sex. Easy to do, hard to do well."</p></blockquote></div>',
  '<div><table><thead><tr><th>Dome</th><th>Who lives there</th><th>Gravity</th></tr></thead><tbody><tr><td>Aldrin</td><td>The rich and the tourists</td><td>1/6 g</td></tr><tr><td>Conrad</td><td>Workers, Jazz</td><td>1/6 g</td></tr></tbody></table></div>',
  `<div>${callout("tip", "Reading pace", "flame", "About 40 pages a day finishes it by the 25th.")}</div>`,
  '<div><pre class="language-js"><code class="language-js is-loaded"><span class="token keyword">const</span> pages <span class="token operator">=</span> <span class="token number">322</span><span class="token punctuation">;</span></code></pre></div>',
  '<div><hr></div>',
  '<div class="footnotes"><section class="footnotes"><ol><li id="fn-1" class="footnote"><p>A "coffin" is a capsule room, the cheapest bed in Conrad dome.</p></li></ol></section></div>',
].join("");
const reading = `<div class="workspace-leaf mod-active"><div class="workspace-leaf-content" data-type="markdown" data-mode="preview"><div class="view-header"><div class="view-header-left"><div class="view-header-nav-buttons">${icon("arrow-left")}${icon("arrow-right")}</div></div><div class="view-header-title-container"><div class="view-header-title-parent">Reading /</div><div class="view-header-title">Artemis</div></div><div class="view-actions">${icon("book-open")}${icon("more-horizontal")}</div></div><div class="view-content"><div class="markdown-reading-view"><div class="markdown-preview-view markdown-rendered is-readable-line-width show-properties page"><div class="markdown-preview-sizer markdown-preview-section"><div class="markdown-preview-pusher"></div><div class="mod-header"><div class="inline-title">Artemis</div>${props}</div>${note}</div></div></div></div></div></div>`;
const app = (phase) => `<div class="app-container"><div class="horizontal-main-container">${ribbon}<div class="workspace is-left-sidedock-open"><div class="workspace-split mod-horizontal mod-sidedock mod-left-split" style="width:250px"><div class="workspace-tabs mod-top mod-top-left-space">${tabs(tab("Files", "folder-closed", true) + tab("Search", "search") + tab("Bookmarks", "bookmark"))}<div class="workspace-tab-container">${explorer}</div></div></div><div class="workspace-split mod-vertical mod-root"><div class="workspace-tabs mod-top mod-active">${tabs(tab("Artemis", "file-text", true) + tab("Dune", "file-text") + tab("Daily note", "calendar"))}<div class="workspace-tab-container">${reading}</div></div></div></div></div><div class="status-bar"><div class="status-bar-item">322 words</div><div class="status-bar-item isfahan-status mod-clickable"><span class="isfahan-status-icon">${icon("sun")}</span><span>${phase[0].toUpperCase()}${phase.slice(1)}</span></div></div></div>`;
// The body's classes, as Isfahan sets them with its defaults (theme.js).
const body = (phase) => `obsidian-app mod-macos is-focused show-inline-title show-view-header show-ribbon isfahan isfahan-${phase} ${["dawn", "workday"].includes(phase) ? "theme-light" : "theme-dark"} isfahan-motifs isfahan-serif isfahan-pages isfahan-pages-all isfahan-props-tile`;

const shot = (name, html, w, h) => {
  const file = path.join(OUT, `${name}.html`);
  writeFileSync(file, html);
  execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files", `--window-size=${w},${h}`, "--force-device-scale-factor=1", "--virtual-time-budget=6000", `--screenshot=${path.join(OUT, `${name}.png`)}`, `file://${file}`], { stdio: "ignore" });
};
for (const phase of ["dawn", "workday", "evening", "night"]) {
  for (const [stack, sheets] of Object.entries(STACKS)) {
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}</style>${sheets.map((p) => `<link rel="stylesheet" href="file://${p}">`).join("")}<style>body{margin:0;height:100vh}*,*::before,*::after{transition:none!important;animation:none!important}</style></head><body class="${body(phase)}">${app(phase)}</body></html>`;
    shot(`${stack}-${phase}`, html, 1400, 940);
  }
  if (!STACKS.vault) continue;
  const label = (t) => `<div style="font:600 22px -apple-system;padding:10px 4px;color:#222">${t}</div>`;
  shot(`sheet-${phase}`, `<!doctype html><html><body style="margin:0;background:#e9e9ee;display:flex;gap:16px;padding:12px"><div>${label(`The private vault (its theme + ${snippets.length} snippets) · ${phase}`)}<img src="vault-${phase}.png" width="1120"></div><div>${label(`Clean vault (default theme, Isfahan only) · ${phase}`)}<img src="clean-${phase}.png" width="1120"></div></body></html>`, 2290, 820);
}
console.log(`Wrote ${OUT}: clean-${VAULT ? ", vault- and sheet-" : ""}<phase>.png for dawn, workday, evening and night.`);

// Loads the plugin's main.js outside Obsidian: with a stand-in for the
// "obsidian" module, and whatever globals the caller passes (the picture
// renderer passes jsdom's window and document). Returns the plugin class as
// `P` and everything main.js exports in `internals`, spread alongside.
// `file` picks another copy of main.js (the picture compare loads an older
// one); a copy from before the internals export gets the few names the
// picture renderer needs added on the fly.
const fs = require("fs"), path = require("path");

// ISFAHAN_MAIN: a candidate build to test before it ships (tools/check.sh).
const DEFAULT_FILE = process.env.ISFAHAN_MAIN || path.join(__dirname, "../../main.js");
const OLD_NAMES = "cleanSettings, dailyPath, PATHS, IsfahanCard, phaseSpans, getPlace: () => here, setPlace: (p) => { here = p; }";

// Obsidian's classes and functions, as far as loading and pure calls need:
// anything else is an empty class, so `extends` and `new` still work.
function obsidianStub(extra = {}) {
  return new Proxy({
    Plugin: class {}, PluginSettingTab: class {}, Modal: class {}, Component: class { load() {} unload() {} },
    MarkdownRenderChild: class {}, Setting: class {}, Notice: class {}, Menu: class {},
    TFile: class {}, TFolder: class {},
    setIcon: () => {}, addIcon: () => {}, setTooltip: () => {},
    requestUrl: async () => { throw new Error("no network in tests"); },
    MarkdownRenderer: { render: async () => {} },
    ...extra,
  }, { get: (t, k) => (k in t ? t[k] : class {}) });
}

function loadPlugin({ file = DEFAULT_FILE, obsidian = obsidianStub(), globals = {} } = {}) {
  const src = fs.readFileSync(file, "utf8");
  const run = (code) => {
    const mod = { exports: {} };
    const names = Object.keys(globals);
    const req = (id) => (id === "obsidian" ? obsidian : require(id));
    new Function("require", "module", "exports", "__filename", "__dirname", ...names, code)(req, mod, mod.exports, file, path.dirname(file), ...names.map((n) => globals[n]));
    return mod.exports;
  };
  let exp = run(src);
  if (!exp.internals) exp = run(`${src}\nmodule.exports.internals = { ${OLD_NAMES} };\n`); // a copy from before the export
  const P = exp.default ?? exp;
  return { P, ...exp.internals };
}

module.exports = { loadPlugin, obsidianStub, DEFAULT_FILE };

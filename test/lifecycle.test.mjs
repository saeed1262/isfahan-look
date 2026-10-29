// Loading and unloading the plugin, twice, against a stand-in Obsidian: it
// starts, and unloading leaves nothing behind (no timers or observers
// running, no Isfahan classes, styles or elements in the page). Needs jsdom
// (npm install, or ISFAHAN_TEST_DEPS); skipped without it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const dom = require("./helpers/dom.cjs");
const skip = !dom.available && "jsdom isn't installed (npm install)";

test("load, unload, load, unload: nothing left running or in the page", { skip }, async () => {
  const { window, document } = dom.makeWindow();
  globalThis.window = window; globalThis.document = document; globalThis.createDiv = window.createDiv;
  const live = { timeouts: new Set(), intervals: new Set(), observers: 0 };
  const { setTimeout: st, clearTimeout: ct, setInterval: si, clearInterval: ci } = window;
  window.setTimeout = (fn, ms) => { const id = st(() => { live.timeouts.delete(id); fn(); }, ms); live.timeouts.add(id); return id; };
  window.clearTimeout = (id) => { live.timeouts.delete(id); ct(id); };
  window.setInterval = (fn, ms) => { const id = si(fn, ms); live.intervals.add(id); return id; };
  window.clearInterval = (id) => { live.intervals.delete(id); ci(id); };
  const MO = window.MutationObserver;
  window.MutationObserver = class extends MO { observe(...a) { live.observers++; this.on = true; return super.observe(...a); } disconnect() { if (this.on) { live.observers--; this.on = false; } return super.disconnect(); } };
  globalThis.MutationObserver = window.MutationObserver;

  // Obsidian's Plugin, as far as registering and unloading go.
  class Plugin {
    constructor(app, manifest) { this.app = app; this.manifest = manifest; this.cleanups = []; this.commands = []; }
    async loadData() { return null; }
    async saveData() {}
    register(fn) { this.cleanups.push(fn); }
    registerEvent(ref) { this.cleanups.push(() => ref.off()); }
    registerDomEvent(el, type, fn) { el.addEventListener(type, fn); this.cleanups.push(() => el.removeEventListener(type, fn)); }
    registerInterval(id) { this.cleanups.push(() => window.clearInterval(id)); return id; }
    registerMarkdownPostProcessor() {}
    addCommand(c) { this.commands.push(c); }
    addSettingTab() {}
    addStatusBarItem() { const el = document.body.createDiv({ cls: "status-bar-item" }); this.cleanups.push(() => el.remove()); return el; }
    unloadAll() { this.onunload(); for (const fn of this.cleanups.splice(0)) fn(); }
  }
  const handlers = new Map();
  const on = (ev, fn) => { (handlers.get(ev) ?? handlers.set(ev, new Set()).get(ev)).add(fn); return { off: () => handlers.get(ev).delete(fn) }; };
  const app = {
    workspace: { on, onLayoutReady: (fn) => fn(), getLeavesOfType: () => [], iterateAllLeaves: () => {}, getActiveFile: () => null, getActiveViewOfType: () => null, trigger: () => {} },
    vault: { on, getAbstractFileByPath: () => null, getName: () => "v", getConfig: () => "obsidian", adapter: { getResourcePath: (p) => `app://${p}` } },
    metadataCache: { on, getFileCache: () => null },
  };
  const { loadPlugin, obsidianStub } = require("./helpers/load.cjs");
  const { P } = loadPlugin({ obsidian: obsidianStub({ Plugin, setIcon: () => {}, addIcon: () => {} }), globals: { window, document } });

  for (const round of [1, 2]) {
    const p = new P(app, { id: "isfahan-look", dir: ".obsidian/plugins/isfahan-look" });
    await p.onload();
    assert.ok(document.body.classList.contains("isfahan"), `round ${round}: the look is on`);
    assert.ok(document.getElementById("isfahan-fonts"), `round ${round}: the fonts are in`);
    assert.ok(p.commands.length >= 8, `round ${round}: the commands are registered`);
    p.unloadAll();
    assert.equal(live.intervals.size, 0, `round ${round}: intervals left running`);
    assert.equal(live.timeouts.size, 0, `round ${round}: timeouts left pending`);
    assert.equal(live.observers, 0, `round ${round}: observers left watching`);
    assert.deepEqual([...document.body.classList].filter((c) => c.startsWith("isfahan")), [], `round ${round}: Isfahan classes left on the page`);
    assert.equal(document.getElementById("isfahan-fonts"), null, `round ${round}: the fonts' style left behind`);
    assert.equal(document.querySelector(".isfahan-status"), null, `round ${round}: the status bar item left behind`);
    assert.equal([...handlers.values()].reduce((n, s) => n + s.size, 0), 0, `round ${round}: event handlers left registered`);
  }
});

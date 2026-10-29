// The new tab: while Isfahan is on (and its new tab setting is), an empty tab
// shows the time, the date and the phase, the weather and the next 12
// hours, a search over the vault and the notes opened last, with a few
// actions under them. Optionally, the weather painted as a sky behind it.
// Each part is only redrawn when it changed.
import { MarkdownView, TFile, setIcon, setTooltip } from "obsidian";
import { COMMANDS, omnisearch, runCommand } from "../compat.js";
import { asOf, hhmm, longDate, pad2 } from "../core/dates.js";
import { getPlace } from "../core/sun.js";
import { rainText, weatherLook } from "../core/weather.js";
import { pressable } from "../ui.js";

export const LAUNCH_RECENT = 5;
export const LAUNCH_RESULTS = 7;
export const SVG_NS = "http://www.w3.org/2000/svg";
export const svgEl = (tag, attrs = {}) => {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
};
// The folder a note is in, for a result's or a recent note's second line.
const folderOf = (p) => (p.includes("/") ? p.slice(0, p.lastIndexOf("/")).split("/").pop() : "");

export const NewTab = {
  newTabOn() { return this.settings.enabled && this.settings.newTab; },

  // Every empty tab gets the new tab while it's on; off gives Obsidian's own
  // page back. Runs on every tab switch, so the date and the recent list
  // stay current.
  markNewTabs() {
    for (const leaf of this.app.workspace.getLeavesOfType("empty")) {
      const host = leaf.view?.contentEl;
      if (!host) continue;
      let l = this.launcherOf(host);
      if (!this.newTabOn()) { if (l) { l.el.remove(); this.clearSky(leaf); } continue; }
      if (!l) {
        host.querySelector(":scope > .isfahan-launcher")?.remove();
        l = this.buildLauncher(leaf, host);
      }
      this.fillLauncher(l);
    }
  },

  // A tab's launcher: its state (the parts it fills, what was last drawn),
  // kept apart from the page, keyed by its element, and gone with it.
  launcherOf(host) {
    const el = host?.querySelector(":scope > .isfahan-launcher");
    return (el && this.launchers?.get(el)) || null;
  },

  buildLauncher(leaf, host) {
    const el = host.createDiv({ cls: "isfahan-launcher" });
    const l = { el, isfahanLeaf: leaf };
    (this.launchers ??= new WeakMap()).set(el, l);
    const pane = leaf.view?.containerEl;
    pane?.addClass("isfahan-newtab-pane");
    if (pane && !pane.querySelector(":scope > .il-sky")) {
      const sky = pane.createDiv({ cls: "il-sky" });
      for (const k of ["a", "b", "c", "d", "e", "f"]) sky.createDiv({ cls: `il-sky-${k}` });
    }
    // Every new tab fades its parts up in turn.
    el.addClass("il-enter");
    this.later(() => el.removeClass("il-enter"), 1400);
    const top = el.createDiv({ cls: "il-top" });
    l.clockEl = top.createDiv({ cls: "il-clock-wrap" }).createDiv({ cls: "il-clock" });
    const head = top.createDiv({ cls: "il-head" });
    l.dateEl = head.createSpan({ cls: "il-date" });
    l.phaseEl = head.createSpan({ cls: "il-phase" });
    l.weatherEl = top.createDiv({ cls: "il-weather is-empty" });
    l.hoursEl = top.createDiv({ cls: "il-hours is-empty" });
    // Everything under the clock sits on one raised island.
    const isl = el.createDiv({ cls: "il-island" });
    const box = isl.createDiv({ cls: "il-search" });
    setIcon(box.createSpan({ cls: "il-search-icon" }), "search");
    const input = box.createEl("input", { cls: "il-input", attr: { type: "search", placeholder: "Search the vault…", spellcheck: "false" } });
    l.resultsEl = isl.createDiv({ cls: "il-results" });
    l.homeEl = isl.createDiv({ cls: "il-home" });
    l.recentEl = l.homeEl.createDiv({ cls: "il-recent" });
    const acts = isl.createDiv({ cls: "il-actions" });
    for (const [icon, text, key, fn] of [
      ["square-pen", "New note", "⌘N", () => runCommand(this.app, COMMANDS.newNote)],
      ["file-search", "Find a note", "⌘O", () => runCommand(this.app, COMMANDS.findNote)],
      ["settings", "Settings", "⌘,", () => runCommand(this.app, COMMANDS.settings)],
      ["x", "Close", "", () => leaf.detach()],
    ]) {
      const b = acts.createEl("button", { cls: "il-action" });
      setIcon(b.createSpan({ cls: "il-action-icon" }), icon);
      b.createSpan({ text });
      if (key) b.createSpan({ cls: "il-key", text: key });
      b.onclick = fn;
    }

    // Typing swaps the recent notes for results; arrows move, Enter opens
    // here, Cmd+Enter in a new tab, Esc clears.
    let seq = 0, timer = null;
    l.items = [];
    l.sel = 0;
    const run = async () => {
      const q = input.value.trim();
      const mine = ++seq;
      el.toggleClass("is-searching", !!q);
      if (!q) { l.items = []; l.resultsEl.empty(); return; }
      const items = await this.launcherSearch(q);
      if (mine !== seq) return;
      l.items = items;
      l.sel = 0;
      this.paintResults(l);
    };
    input.addEventListener("input", () => { window.clearTimeout(timer); timer = window.setTimeout(run, 150); });
    input.addEventListener("keydown", (e) => {
      const n = l.items.length;
      if ((e.key === "ArrowDown" || e.key === "ArrowUp") && n) {
        e.preventDefault();
        l.sel = (l.sel + (e.key === "ArrowDown" ? 1 : -1) + n) % n;
        this.paintResults(l);
      } else if (e.key === "Enter" && l.items[l.sel]) {
        e.preventDefault();
        this.openFromLauncher(leaf, l.items[l.sel], e.metaKey || e.ctrlKey);
      } else if (e.key === "Escape" && input.value) {
        e.preventDefault();
        input.value = "";
        run();
      }
    });
    return l;
  },

  // The new tabs on screen: in a visible pane, with Obsidian in front.
  // Background tabs and a hidden window aren't redrawn; switching to a tab
  // fills it (markNewTabs).
  visibleLaunchers() {
    if (document.hidden || !document.hasFocus()) return [];
    const out = [];
    for (const leaf of this.app.workspace.getLeavesOfType("empty")) {
      const host = leaf.view?.contentEl;
      const l = this.launcherOf(host);
      if (l && (host.isShown ? host.isShown() : host.offsetParent !== null)) out.push(l);
    }
    return out;
  },
  fillVisibleLaunchers() { for (const l of this.visibleLaunchers()) this.fillLauncher(l); },
  queueLauncherFill() {
    if (this.fillTimer) return;
    this.fillTimer = this.later(() => { this.fillTimer = null; this.fillVisibleLaunchers(); }, 500);
  },
  minuteTick() {
    this.fillVisibleLaunchers();
    this.later(() => this.minuteTick(), 60000 - (Date.now() % 60000) + 50);
  },

  fillLauncher(l) {
    const now = new Date();
    const clock = hhmm(now);
    if (l.clockEl.textContent !== clock) l.clockEl.textContent = clock;
    this.paintWeather(l);
    this.refreshWeather();
    const date = longDate(now);
    if (l.dateEl.textContent !== date) l.dateEl.textContent = date;
    const phase = this.phase().name;
    if (l.phaseEl.textContent !== phase) l.phaseEl.textContent = phase;
    this.paintHours(l, now);
    const pane = l.isfahanLeaf?.view?.containerEl;
    if (pane) pane.dataset.ilMorning = now.getHours() < 12 ? "1" : "0";
    const recent = this.app.workspace.getLastOpenFiles()
      .map((p) => this.app.vault.getAbstractFileByPath(p))
      .filter((f) => f instanceof TFile)
      .slice(0, LAUNCH_RECENT);
    const key = recent.map((f) => f.path).join("|");
    if (l.recentKey === key) return;
    l.recentKey = key;
    l.recentEl.empty();
    if (!recent.length) return;
    l.recentEl.createDiv({ cls: "il-label", text: "Recent" });
    for (const f of recent) {
      this.launcherRow(l.recentEl, { path: f.path, title: f.basename }).onclick = (e) =>
        this.openFromLauncher(l.isfahanLeaf, { path: f.path }, e.metaKey || e.ctrlKey);
    }
  },

  clearSky(leaf) {
    const pane = leaf.view?.containerEl;
    if (!pane) return;
    pane.querySelector(":scope > .il-sky")?.remove();
    pane.removeClass("isfahan-newtab-pane");
    delete pane.dataset.ilWeather;
    delete pane.dataset.ilDaylight;
    delete pane.dataset.ilMorning;
  },

  // The next 12 hours: one rounded bar per hour in a pressed well, taller
  // and a stronger gold for the warmer hours of this window, the current
  // hour lit, and a sun mark under the hour of a sunrise or sunset.
  paintHours(l, now) {
    const w = this.weatherNow();
    const hrs = (w?.hours || []).filter((h) => h.t >= new Date(now.getTime() - 3600000)).slice(0, 13);
    if (hrs.length < 4) { l.hoursEl.addClass("is-empty"); return; }
    const cur = w.temp;
    const key = `${Math.round(cur)}|` + hrs.map((h) => `${h.t.getHours()}:${Math.round(h.temp)}`).join("|");
    if (l.hoursKey === key) return;
    l.hoursKey = key;
    l.hoursEl.removeClass("is-empty");
    l.hoursEl.empty();
    const W = 330, H = 84, pad = 6, top = 16, bot = 58;
    // Heights from 2° under the window's low, and at least a 4° span, so a
    // flat night doesn't swing from empty to full bars.
    const temps = hrs.map((h) => h.temp), lo = Math.min(...temps) - 2, span = Math.max(Math.max(...temps) - lo, 4);
    const slot = (W - 2 * pad) / hrs.length, bw = slot * 0.52;
    const sunAt = [];
    for (const s of w.sun || []) for (const [when, name] of [[s.rise, "rise"], [s.set, "set"]]) sunAt.push({ when, name });
    const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true" });
    hrs.forEach((h, i) => {
      const f = (h.temp - lo) / span, ht = 6 + f * (bot - top - 6), x = pad + i * slot + (slot - bw) / 2, y = bot - ht, cx = x + bw / 2;
      const bar = svgEl("rect", { class: `il-hours-bar${i ? "" : " is-now"}`, x, y, width: bw, height: ht, rx: bw / 2 });
      bar.style.setProperty("--warm", `${Math.round(30 + f * 55)}%`);
      svg.appendChild(bar);
      if (!i) svg.appendChild(svgEl("rect", { class: "il-hours-halo", x: x - 3, y: y - 3, width: bw + 6, height: ht + 6, rx: bw / 2 + 3 }));
      if (i % 3 === 0) {
        const tv = svgEl("text", { class: `il-hours-temp${i ? "" : " is-now"}`, x: cx, y: y - 6, "text-anchor": "middle" });
        tv.textContent = `${Math.round(i || cur == null ? h.temp : cur)}°`;
        const tl = svgEl("text", { class: `il-hours-time${i ? "" : " is-now"}`, x: cx, y: H - 2, "text-anchor": "middle" });
        tl.textContent = i ? pad2(h.t.getHours()) : "now";
        svg.append(tv, tl);
      }
      for (const s of sunAt) if (s.when.getHours() === h.t.getHours() && s.when.toDateString() === h.t.toDateString()) {
        const g = svgEl("g", { class: `il-hours-sun il-hours-${s.name}`, transform: `translate(${cx.toFixed(1)},${bot + 9})` });
        g.append(svgEl("path", { d: "M-4,0 A4,4 0 0 1 4,0 Z" }), svgEl("line", { x1: -6, x2: 6, y1: 0.5, y2: 0.5 }));
        svg.appendChild(g);
      }
    });
    l.hoursEl.appendChild(svg);
    const inWindow = sunAt.filter((s) => s.when >= hrs[0].t && s.when < new Date(hrs.at(-1).t.getTime() + 3600000));
    const tip = ["Next 12 hours", ...inWindow.map((s) => `${s.name === "rise" ? "Sunrise" : "Sunset"} ${hhmm(s.when)}`)].join(" · ");
    setTooltip(l.hoursEl, tip, { delay: 300 });
  },

  // The forecast line, and with the "scene" weather setting the sky behind
  // the tab (data attributes the styles paint).
  paintWeather(l) {
    const w = this.weatherNow();
    const pane = l.isfahanLeaf?.view?.containerEl;
    if (pane) {
      const kind = w && this.settings.weather === "scene" ? weatherLook(w.code, w.day).kind : null;
      if (kind) { pane.dataset.ilWeather = kind; pane.dataset.ilDaylight = w.day ? "day" : "night"; }
      else { delete pane.dataset.ilWeather; delete pane.dataset.ilDaylight; }
    }
    const rain = w ? rainText(w.hours, new Date()) : "";
    const key = w ? `${w.temp}|${w.code}|${w.day}|${w.hi}|${w.lo}|${w.stale}|${getPlace().name}|${rain}` : "";
    if (l.weatherKey === key) return;
    l.weatherKey = key;
    l.weatherEl.empty();
    l.weatherEl.toggleClass("is-empty", !w);
    l.weatherEl.toggleClass("is-stale", !!w?.stale);
    if (!w) return;
    const look = weatherLook(w.code, w.day);
    setIcon(l.weatherEl.createSpan({ cls: "il-w-icon" }), look.icon);
    l.weatherEl.createSpan({ cls: "il-w-temp", text: `${Math.round(w.temp)}°` });
    if (look.text) l.weatherEl.createSpan({ text: look.text });
    l.weatherEl.createSpan({ cls: "il-w-sep", text: "·" });
    l.weatherEl.createSpan({ text: `H ${Math.round(w.hi)}° L ${Math.round(w.lo)}°` });
    if (rain) {
      l.weatherEl.createSpan({ cls: "il-w-sep", text: "·" });
      l.weatherEl.createSpan({ cls: "il-w-rain", text: rain });
    }
    l.weatherEl.createSpan({ cls: "il-w-sep", text: "·" });
    l.weatherEl.createSpan({ cls: "il-w-place", text: getPlace().name });
    if (w.stale) {
      l.weatherEl.createSpan({ cls: "il-w-sep", text: "·" });
      l.weatherEl.createSpan({ cls: "il-w-asof", text: `as of ${asOf(w.stale)}` });
    }
  },

  launcherRow(list, it) {
    const row = list.createDiv({ cls: "il-row" });
    row.createSpan({ cls: "il-row-title", text: it.title });
    const folder = folderOf(it.path);
    if (folder) row.createSpan({ cls: "il-row-area", text: folder });
    return pressable(row);
  },

  paintResults(l) {
    l.resultsEl.empty();
    if (!l.items.length) { l.resultsEl.createDiv({ cls: "il-empty", text: "No matches." }); return; }
    l.items.forEach((it, i) => {
      const row = this.launcherRow(l.resultsEl, it);
      row.toggleClass("is-selected", i === l.sel);
      row.onclick = (e) => this.openFromLauncher(l.isfahanLeaf, it, e.metaKey || e.ctrlKey);
      row.onmousemove = () => {
        if (l.sel === i) return;
        l.sel = i;
        l.resultsEl.querySelectorAll(".il-row").forEach((r, k) => r.toggleClass("is-selected", k === i));
      };
    });
  },

  // Omnisearch's results when it's installed, else notes whose names match.
  async launcherSearch(q) {
    const api = omnisearch();
    if (api) {
      try {
        const res = await api.search(q);
        return (res ?? []).slice(0, LAUNCH_RESULTS).map((r) => ({ path: r.path, title: r.basename, match: r.matches?.[0] }));
      } catch (e) { /* fall back to note names */ }
    }
    const ql = q.toLowerCase();
    return this.app.vault.getMarkdownFiles()
      .filter((f) => f.basename.toLowerCase().includes(ql))
      .sort((a, b) => b.stat.mtime - a.stat.mtime)
      .slice(0, LAUNCH_RESULTS)
      .map((f) => ({ path: f.path, title: f.basename }));
  },

  // Opens in the new tab itself (a fresh tab with Cmd), and for a search
  // result selects the first match.
  async openFromLauncher(leaf, it, newTab) {
    const file = this.app.vault.getAbstractFileByPath(it.path);
    if (!(file instanceof TFile)) return;
    const target = newTab ? this.app.workspace.getLeaf("tab") : leaf;
    await target.openFile(file, { active: true });
    const view = target.view, m = it.match;
    if (!m || !(view instanceof MarkdownView)) return;
    if (view.getMode() !== "source") {
      if (m.offset >= 0) view.setEphemeralState({ line: (await this.app.vault.cachedRead(file)).slice(0, m.offset).split("\n").length - 1 });
      return;
    }
    const ed = view.editor, text = ed.getValue(), w = String(m.match ?? "");
    let at = m.offset;
    if (!(at >= 0) || text.substr(at, w.length).toLowerCase() !== w.toLowerCase()) at = text.toLowerCase().indexOf(w.toLowerCase());
    if (at < 0 || !w) return;
    const from = ed.offsetToPos(at), to = ed.offsetToPos(at + w.length);
    ed.setSelection(from, to);
    ed.scrollIntoView({ from, to }, true);
  },

  startNewTab() {
    this.registerEvent(this.app.vault.on("modify", () => this.queueLauncherFill()));
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        if (leaf?.view?.getViewType?.() !== "empty") return;
        this.markNewTabs();
        leaf.view.contentEl?.querySelector(":scope > .isfahan-launcher .il-input")?.focus();
      })
    );
    this.app.workspace.onLayoutReady(() => { this.markNewTabs(); this.minuteTick(); });
    this.registerDomEvent(window, "focus", () => this.fillVisibleLaunchers());
  },

  stopNewTab() {
    for (const leaf of this.app.workspace.getLeavesOfType("empty")) {
      leaf.view?.contentEl?.querySelector(":scope > .isfahan-launcher")?.remove();
      this.clearSky(leaf);
    }
  },
};

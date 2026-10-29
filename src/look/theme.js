// The look: the phase and its palette on the body, light or dark, the fonts,
// the status bar and its menu.

import { openPluginSettings, userPrefersDark } from "../compat.js";
import { addIcon, Menu, Notice, setIcon, TFile } from "obsidian";
import { hhmm } from "../core/dates.js";
import { FONT_URLS } from "../fonts.js";
import { FACES, PATTERNS, RIBBONS } from "../core/settings.js";
import { PHASES, hours, nextPhaseChange, phaseAt } from "../core/sun.js";

export const TICK_MS = 60 * 1000;

// Eight-petal rosette on Obsidian's 100x100 icon grid.
export const ROSETTE = `<g fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round">
  <circle cx="50" cy="50" r="10"/>
  <path d="M50 10 L58 33 L50 40 L42 33 Z"/><path d="M50 90 L58 67 L50 60 L42 67 Z"/>
  <path d="M10 50 L33 42 L40 50 L33 58 Z"/><path d="M90 50 L67 42 L60 50 L67 58 Z"/>
  <path d="M22 22 L42 34.5 L41 41 L34.5 42 Z"/><path d="M78 78 L58 65.5 L59 59 L65.5 58 Z"/>
  <path d="M78 22 L65.5 42 L59 41 L58 34.5 Z"/><path d="M22 78 L34.5 58 L41 59 L42 65.5 Z"/>
</g>`;

export const Theme = {
  // A phase picked in the status-bar menu holds until the next scheduled
  // change (holdUntil), then the sun takes over again; one picked in the
  // settings stays.
  phase() {
    const now = new Date();
    if (this.settings.mode !== "auto" && this.settings.holdUntil && now.getTime() >= this.settings.holdUntil) {
      this.settings.mode = "auto";
      this.settings.holdUntil = null;
      this.saveData(this.settings);
    }
    if (this.settings.mode === "auto") return phaseAt(now);
    return PHASES.find((p) => p.id === this.settings.mode) ?? phaseAt(now);
  },

  apply() {
    // Margin notes are added while reading view renders, so switching
    // Isfahan or Page mode on or off re-renders open notes to match.
    const renderKey = `${this.settings.enabled}|${this.settings.pageMode}|${this.settings.pageScope}`;
    const rerender = this.renderKey !== undefined && this.renderKey !== renderKey;
    this.renderKey = renderKey;
    // The minute tick lands here too: everything is redone only on the first
    // run or a settings change (the badges, on every pass, roll over at midnight).
    const settingsKey = JSON.stringify(this.settings);
    const scope = this.settingsKey !== settingsKey ? "all" : "active";
    this.settingsKey = settingsKey;
    if (!this.settings.enabled) {
      this.clear();
      this.renderStatus(null);
      this.queuePageState(scope);
      if (rerender) this.rerenderPreviews();
      return;
    }
    const phase = this.phase();
    const body = document.body;
    this.applying = true;
    try {
      body.addClass("isfahan");
      for (const p of PHASES) body.toggleClass(`isfahan-${p.id}`, p === phase);
      body.toggleClass("isfahan-motifs", this.settings.motifs);
      for (const pt of PATTERNS) body.toggleClass(`isfahan-pattern-${pt.id}`, pt.id === this.settings.pattern && pt.id !== "girih");
      body.toggleClass("isfahan-serif", this.settings.serifHeadings);
      body.toggleClass("isfahan-pages", this.settings.pageMode);
      body.toggleClass("isfahan-pages-all", this.settings.pageMode && this.settings.pageScope === "all");
      for (const r of RIBBONS) body.toggleClass(`isfahan-props-${r.id}`, r.id === this.settings.propertyRibbon && r.id !== "off");
      const baseChanged = this.setBase(phase.dark);
      // Anything that follows the theme (the terminal plugin reads the
      // background, text and accent colors) only re-reads on css-change,
      // so announce every phase change, not only light/dark flips.
      if (baseChanged || this.lastPhase !== phase.id) this.app.workspace.trigger("css-change");
      this.lastPhase = phase.id;
    } finally {
      this.applying = false;
    }
    this.renderStatus(phase);
    this.queuePageState(scope);
    if (rerender) this.rerenderPreviews();
  },

  // Remove every class and put back the user's own light/dark choice.
  clear() {
    const body = document.body;
    if (!body.hasClass("isfahan")) return;
    this.applying = true;
    try {
      body.removeClass(
        "isfahan",
        "isfahan-motifs",
        "isfahan-serif",
        "isfahan-pages",
        "isfahan-pages-all",
        ...RIBBONS.map((r) => `isfahan-props-${r.id}`),
        ...PATTERNS.map((pt) => `isfahan-pattern-${pt.id}`),
        ...PHASES.map((p) => `isfahan-${p.id}`)
      );
      this.setBase(userPrefersDark(this.app, this.darkBefore));
      this.lastPhase = null;
      this.app.workspace.trigger("css-change"); // the palette is gone either way
    } finally {
      this.applying = false;
    }
  },

  // Returns whether anything changed; callers announce it with css-change.
  setBase(dark) {
    const body = document.body;
    if (body.hasClass("theme-dark") === dark && body.hasClass("theme-light") === !dark) return false;
    body.toggleClass("theme-dark", dark);
    body.toggleClass("theme-light", !dark);
    return true;
  },

  rerenderPreviews() {
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      leaf.view?.previewMode?.rerender?.(true);
    }
  },

  fontFaces() {
    return FACES.map((f) => {
      const url = FONT_URLS[f.file];
      return `@font-face { font-family: "${f.family}"; src: url("${url}") format("woff2"); font-weight: 100 900; font-style: ${f.style ?? "normal"}; font-display: swap; unicode-range: ${f.range}; }`;
    }).join("\n");
  },

  renderStatus(phase) {
    const el = this.statusEl;
    if (!el) return;
    el.empty();
    setIcon(el.createSpan({ cls: "isfahan-status-icon" }), "isfahan-rosette");
    if (!phase) {
      el.createSpan({ text: "Isfahan off" });
      el.addClass("is-off");
      el.setAttr("aria-label", "Isfahan is off. Click to turn it on.");
      return;
    }
    el.removeClass("is-off");
    el.createSpan({ text: phase.name });
    const how = this.settings.mode === "auto" ? "following the sun"
      : this.settings.holdUntil ? `held until ${hhmm(new Date(this.settings.holdUntil))}` : "fixed";
    el.setAttr("aria-label", `Isfahan: ${phase.name} (${hours(phase)} today), ${how}. Click to change.`);
  },

  openMenu(evt) {
    const menu = new Menu();
    const { enabled, mode } = this.settings;
    menu.addItem((i) =>
      i
        .setTitle("Follow the sun")
        .setChecked(enabled && mode === "auto")
        .onClick(() => this.update({ enabled: true, mode: "auto", holdUntil: null }))
    );
    // A phase from here holds until the next scheduled change; to keep one
    // for good, pick it in the settings.
    const until = nextPhaseChange(new Date());
    for (const p of PHASES) {
      menu.addItem((i) =>
        i
          .setTitle(`${p.name} until ${hhmm(until)}`)
          .setChecked(enabled && mode === p.id)
          .onClick(() => this.update({ enabled: true, mode: p.id, holdUntil: until.getTime() }))
      );
    }
    // The day cards and the settings, which were only commands before.
    menu.addSeparator();
    menu.addSeparator();
    // The how-to for all of the above, one click from wherever you are.
    menu.addItem((i) => i.setTitle("Isfahan settings").setIcon("settings").onClick(() => openPluginSettings(this.app, this.manifest.id)));
    menu.addItem((i) =>
      i.setTitle(enabled ? "Turn Isfahan off" : "Turn Isfahan on").onClick(() => this.update({ enabled: !enabled }))
    );
    menu.showAtMouseEvent(evt);
  },

  // The look's commands (Obsidian lists them as "Isfahan: …", so the names
  // leave the plugin's name out): on and off, follow the sun, the next tile
  // pattern and property ribbon, and each phase.
  registerLookCommands() {
    this.addCommand({
      id: "toggle",
      name: "Turn the look on or off",
      callback: () => this.update({ enabled: !this.settings.enabled }),
    });
    this.addCommand({
      id: "follow-clock",
      name: "Follow the sun",
      callback: () => this.update({ enabled: true, mode: "auto", holdUntil: null }),
    });
    this.addCommand({
      id: "cycle-tile-pattern",
      name: "Next tile pattern",
      callback: () => {
        const i = PATTERNS.findIndex((pt) => pt.id === this.settings.pattern);
        const next = PATTERNS[(i + 1) % PATTERNS.length];
        this.update({ pattern: next.id, motifs: true });
        new Notice(`Tile pattern: ${next.name}`);
      },
    });
    this.addCommand({
      id: "cycle-property-ribbon",
      name: "Next property ribbon style",
      callback: () => {
        const i = RIBBONS.findIndex((r) => r.id === this.settings.propertyRibbon);
        this.update({ propertyRibbon: RIBBONS[(i + 1) % RIBBONS.length].id });
      },
    });
    for (const p of PHASES) {
      this.addCommand({
        id: `use-${p.id}`,
        name: `Use ${p.name}`,
        callback: () => this.update({ enabled: true, mode: p.id }),
      });
    }
  },

  // The look's wiring: the fonts, the status-bar item, the phase re-checked
  // every minute, and Obsidian's own light/dark reset undone.
  startTheme() {
    this.darkBefore = document.body.hasClass("theme-dark"); // the user's look, should their setting be unreadable later
    addIcon("isfahan-rosette", ROSETTE);
    this.fontsEl = document.head.createEl("style", { attr: { id: "isfahan-fonts" } });
    this.fontsEl.textContent = this.fontFaces();
    this.statusEl = this.addStatusBarItem();
    this.statusEl.addClass("isfahan-status", "mod-clickable");
    this.registerDomEvent(this.statusEl, "click", (evt) => this.openMenu(evt));
    this.registerInterval(window.setInterval(() => this.apply(), TICK_MS));
    // Obsidian re-sets its own light/dark classes when the base theme
    // setting or the OS appearance changes; put the phase's back. The
    // guard skips the css-change that setBase() itself triggers.
    this.registerEvent(
      this.app.workspace.on("css-change", () => {
        if (!this.applying) this.apply();
      })
    );
  },

  stopTheme() {
    this.clear();
    this.fontsEl?.remove();
  },
};

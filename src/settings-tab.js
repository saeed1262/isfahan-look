// The settings tab.

import { PluginSettingTab, Setting } from "obsidian";
import { hhmmOfMinutes, pad2 } from "./core/dates.js";
import { PATTERNS, RIBBONS } from "./core/settings.js";
import { PHASES, hours, placeKey } from "./core/sun.js";
import { findPlaces } from "./services/weather.js";

export class IsfahanSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.matches = null; // the last place search, offered as a dropdown
  }

  hide() {
    this.matches = null;
    super.hide?.();
  }

  // A change that alters other rows (the phase hours follow the place)
  // redraws the tab.
  async change(patch) {
    await this.plugin.update(patch);
    this.display();
  }

  async findPlace(name, desc) {
    name = name.trim();
    if (!name) return;
    desc.setText("Looking…");
    try {
      const found = await findPlaces(name);
      if (!found.length) { desc.setText(`Nothing found for "${name}". Try the town's name alone.`); return; }
      this.matches = found;
      await this.change({ place: found[0] });
    } catch (e) {
      console.warn("Isfahan: place search failed", e);
      desc.setText("Couldn't reach the place search (offline?). The place hasn't changed.");
    }
  }

  display() {
    const { containerEl } = this;
    const s = this.plugin.settings;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Isfahan")
      .setDesc("Off brings back your plain look and your own light/dark setting. The Turn the look on or off command does the same.")
      .addToggle((t) => t.setValue(s.enabled).onChange((v) => this.plugin.update({ enabled: v })));

    new Setting(containerEl)
      .setName("Sample page")
      .setDesc("A new note that shows the look on a page: the property ribbon, the drop cap, margin notes, callouts, a quote and a table. Delete it whenever you like.")
      .addButton((b) => b.setButtonText("Create").onClick(() => this.plugin.createSamplePage()));

    new Setting(containerEl)
      .setName("Time of day")
      .setDesc("Following the sun: light from sunrise to sunset (dawn, then workday), dark after (evening, then night). A phase picked here stays; one picked from the status bar holds until the next change.")
      .addDropdown((d) => {
        d.addOption("auto", "Follow the sun");
        for (const p of PHASES) d.addOption(p.id, `${p.name} · ${hours(p)} today`);
        d.setValue(s.mode).onChange((v) => this.plugin.update({ mode: v, holdUntil: null }));
      });

    // A town name, looked up on Enter or with the button; the best match is
    // used at once and the others stay in a dropdown for a wrong guess.
    const place = new Setting(containerEl).setName("Place (sun and weather)");
    const desc = place.descEl.createSpan({ text: `Sunrise, sunset and the forecast are for ${s.place.label}. Type a town to change it; only the name is sent, to Open-Meteo.` });
    let input;
    place.addText((t) => {
      input = t.inputEl;
      t.setPlaceholder(s.place.name);
      t.inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); this.findPlace(t.getValue(), desc); }
      });
    });
    place.addButton((b) => b.setButtonText("Find").onClick(() => this.findPlace(input.value, desc)));
    if (this.matches?.length > 1) {
      place.addDropdown((d) => {
        this.matches.forEach((m, i) => d.addOption(String(i), m.label));
        const at = this.matches.findIndex((m) => placeKey(m) === placeKey(s.place));
        d.setValue(String(Math.max(at, 0))).onChange((v) => this.change({ place: this.matches[Number(v)] }));
      });
    }

    new Setting(containerEl).setName("Look").setHeading();

    new Setting(containerEl)
      .setName("Serif headings")
      .setDesc("Cormorant Garamond for the note title, H1 and H2.")
      .addToggle((t) => t.setValue(s.serifHeadings).onChange((v) => this.plugin.update({ serifHeadings: v })));

    new Setting(containerEl)
      .setName("Tile motifs")
      .setDesc(
        "The tile band behind note titles, the lattice in the file explorer, diamond checkboxes, and the arch on [!mihrab] callouts. The colors change either way."
      )
      .addToggle((t) => t.setValue(s.motifs).onChange((v) => this.plugin.update({ motifs: v })));

    new Setting(containerEl)
      .setName("Tile pattern")
      .setDesc("The pattern those motifs use, everywhere at once. The Next tile pattern command cycles through them.")
      .addDropdown((d) => {
        for (const pt of PATTERNS) d.addOption(pt.id, pt.name);
        d.setValue(s.pattern).onChange((v) => this.plugin.update({ pattern: v }));
      });

    new Setting(containerEl)
      .setName("Property ribbon")
      .setDesc("How the Properties block looks in Reading view: one line, in the phase colors. Editing view keeps Obsidian's normal list. The Next property ribbon style command cycles these.")
      .addDropdown((d) => {
        for (const r of RIBBONS) d.addOption(r.id, r.name);
        d.setValue(s.propertyRibbon).onChange((v) => this.plugin.update({ propertyRibbon: v }));
      });

    new Setting(containerEl).setName("Reading").setHeading();

    new Setting(containerEl)
      .setName("Page mode")
      .setDesc(
        "Notes read like a printed page in Reading view: book typography, and footnotes moved into the margin beside their line. Editing stays normal."
      )
      .addToggle((t) => t.setValue(s.pageMode).onChange((v) => this.plugin.update({ pageMode: v })));

    new Setting(containerEl)
      .setName("Page mode applies to")
      .setDesc("All notes, except notes with `cssclasses: no-page`; or only notes with `cssclasses: page`.")
      .addDropdown((d) => {
        d.addOption("all", "All notes");
        d.addOption("pages", "Page notes only");
        d.setValue(s.pageScope).onChange((v) => this.plugin.update({ pageScope: v }));
      });

    new Setting(containerEl)
      .setName("Quiet chrome on pages")
      .setDesc("While reading a page note, the sidebars, tabs and status bar fade until you hover over them.")
      .addToggle((t) => t.setValue(s.quietChrome).onChange((v) => this.plugin.update({ quietChrome: v })));

    new Setting(containerEl).setName("New tab").setHeading();

    new Setting(containerEl)
      .setName("Isfahan's new tab")
      .setDesc("An empty tab shows the time, the date and the phase, the weather, a search over the vault and the notes you opened last. Off gives Obsidian's own empty tab back.")
      .addToggle((t) => t.setValue(s.newTab).onChange((v) => this.change({ newTab: v })));

    new Setting(containerEl)
      .setName("Weather")
      .setDesc("The forecast line and the next 12 hours on the new tab, for the place above. Only its coordinates are sent, to Open-Meteo (free, no account). Text and sky also paints the weather behind the new tab.")
      .setDisabled(!s.newTab)
      .addDropdown((d) => {
        d.addOption("off", "Off (nothing is fetched)");
        d.addOption("text", "Text");
        d.addOption("scene", "Text and sky");
        d.setValue(s.weather).onChange((v) => this.plugin.update({ weather: v }));
        d.setDisabled(!s.newTab);
      });
  }
}

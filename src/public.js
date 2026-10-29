// Isfahan: lapis and turquoise tilework as the vault's look, shifting from
// dawn to night with the sun at your place. The plugin class, its parts
// (look/theme.js, look/reading.js, newtab/launcher.js and the weather)
// joined onto it, and its settings tab.
// tools/build.mjs bundles it into main.js.
import { Plugin } from "obsidian";
import { Base } from "./base.js";
import { cleanSettings } from "./core/settings.js";
import { setPlace } from "./core/sun.js";
import { localPlace } from "./core/zones.js";
import { Reading } from "./look/reading.js";
import { Sample } from "./sample.js";
import { NewTab } from "./newtab/launcher.js";
import { WeatherService } from "./services/weather.js";
import { Theme } from "./look/theme.js";
import { IsfahanSettingTab } from "./settings-tab.js";

export default class Isfahan extends Plugin {
  async onload() {
    const saved = await this.loadData();
    this.settings = cleanSettings(saved);
    // Until a place is picked, the time zone's city (worked out each load).
    if (!saved?.place || this.settings.place.guessed) this.settings.place = localPlace();
    setPlace(this.settings.place);
    this.startTheme();
    this.addSettingTab(new IsfahanSettingTab(this.app, this));
    this.startReading();
    this.startNewTab();
    this.registerLookCommands();
    this.registerSampleCommand();
    this.apply();
  }

  onunload() {
    this.unloaded = true;
    for (const id of this.timers ?? []) window.clearTimeout(id);
    this.stopNewTab();
    this.stopTheme();
    this.stopReading();
  }
}

Object.assign(Isfahan.prototype, Base, Theme, Reading, NewTab, WeatherService, Sample);
// For the tests' loader, which reads the plugin's internals from here.
export const internals = {};

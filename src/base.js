// What the plugin class shares with its parts: one-off timers that die with
// the plugin, and saving a settings change.
import { setPlace } from "./core/sun.js";

export const Base = {
  // A one-off timer that's cleared when the plugin unloads, and that doesn't
  // start once it has. Intervals go through registerInterval instead.
  later(fn, ms) {
    if (this.unloaded) return null;
    this.timers = this.timers || new Set();
    const id = window.setTimeout(() => { this.timers.delete(id); if (!this.unloaded) fn(); }, ms);
    this.timers.add(id);
    return id;
  },

  async update(patch) {
    Object.assign(this.settings, patch);
    setPlace(this.settings.place);
    await this.saveData(this.settings);
    this.apply();
    this.queueLauncherFill?.(); // the new tab, where there is one: the weather and the phase follow at once
  },
};

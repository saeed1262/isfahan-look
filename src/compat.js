// Everything Isfahan relies on that isn't Obsidian's public API, or belongs
// to another plugin, in one place, each with a fallback where one exists,
// so an Obsidian or plugin update that changes one is fixed here alone.

import { Notice } from "obsidian";

// Commands Isfahan runs that belong to Obsidian: the new tab's actions, and
// opening the settings.
const OPEN_SETTINGS = { id: "app:open-settings", name: "Open settings" };
export const COMMANDS = {
  newNote: { id: "file-explorer:new-file", name: "New note" },
  findNote: { id: "switcher:open", name: "Quick switcher" },
  settings: OPEN_SETTINGS,
};

// Omnisearch's search, when it's installed (it puts its API on globalThis);
// the new tab's search falls back to note names without it.
export const omnisearch = () => globalThis.omnisearch ?? null;
// Runs one; when it isn't there, a notice says which (or `missing`, when given).
export function runCommand(app, cmd, missing = null) {
  const id = typeof cmd === "string" ? cmd : cmd.id;
  if (app.commands?.executeCommandById?.(id)) return true;
  new Notice(missing ?? `Isfahan: the command "${typeof cmd === "string" ? cmd : cmd.name}" isn't available.`, 8000);
  return false;
}


// Whether the user's own appearance is dark: the vault's "theme" setting
// (getConfig, undocumented); without it, how the page looked before Isfahan
// first painted it (startTheme notes that), else the system's.
export function userPrefersDark(app, before) {
  if (typeof app.vault.getConfig === "function") {
    const theme = app.vault.getConfig("theme");
    return theme === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches : theme !== "moonstone";
  }
  if (typeof before === "boolean") return before;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}


// Opens a plugin's settings tab: app.setting (undocumented), else just the
// Settings window.
export function openPluginSettings(app, id) {
  if (typeof app.setting?.openTabById === "function") { app.setting.open(); app.setting.openTabById(id); return; }
  runCommand(app, OPEN_SETTINGS);
}








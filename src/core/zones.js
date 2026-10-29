// A first place for a new install: the main city of the user's time zone
// (zone-table.js), so the phases follow roughly the right sun from the
// first minute, without asking anything or touching the network. The
// settings' place search replaces it with a real town.
// Plain logic, nothing from Obsidian: the tests import it directly.
import { ZONE_TABLE } from "./zone-table.js";

// Older names some systems still report, for zones the table lists under
// their current one. Zones moved into a subfolder (America/Indianapolis)
// are found by their city instead.
const RENAMED = {
  "Asia/Calcutta": "Asia/Kolkata", "Asia/Saigon": "Asia/Ho_Chi_Minh", "Asia/Katmandu": "Asia/Kathmandu",
  "Asia/Rangoon": "Asia/Yangon", "Asia/Dacca": "Asia/Dhaka", "Asia/Ulan_Bator": "Asia/Ulaanbaatar",
  "Europe/Kiev": "Europe/Kyiv", "Atlantic/Faeroe": "Atlantic/Faroe", "America/Godthab": "America/Nuuk",
  "Pacific/Truk": "Pacific/Chuuk", "Pacific/Ponape": "Pacific/Pohnpei", "Pacific/Enderbury": "Pacific/Kanton",
  "Africa/Asmera": "Africa/Asmara",
};

let zones = null;
const table = () => {
  if (!zones) {
    zones = new Map();
    for (const row of ZONE_TABLE.trim().split("\n")) {
      const [zone, lat, lon] = row.split(" ");
      zones.set(zone, { lat: Number(lat), lon: Number(lon) });
    }
  }
  return zones;
};
const city = (zone) => zone.split("/").at(-1);

// The place for a time zone (an IANA name), marked `guessed` so it's
// worked out again on the next load until the user picks one. A zone the
// table doesn't know (UTC, Etc/GMT+5) gives a point on the sun's path for
// the clock's offset from UTC (offsetMinutes, as Date's getTimezoneOffset).
export function placeFromZone(zone, offsetMinutes = 0) {
  const name = RENAMED[zone] ?? zone ?? "";
  let hit = table().get(name) && name;
  if (!hit) hit = [...table().keys()].find((z) => city(z) === city(name));
  if (hit) {
    const town = city(hit).replaceAll("_", " ");
    return { name: town, label: `${town} (your time zone)`, ...table().get(hit), guessed: true };
  }
  const h = -offsetMinutes / 60 || 0; // never -0
  const utc = `UTC${h === 0 ? "" : (h > 0 ? "+" : "−") + Math.abs(h)}`;
  return { name: utc, label: `${utc} (your clock)`, lat: 45, lon: Math.max(-180, Math.min(180, h * 15)), guessed: true };
}

// The place for this computer's own time zone.
export function localPlace() {
  let zone = null;
  try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { /* no Intl time zones */ }
  return placeFromZone(zone, new Date().getTimezoneOffset());
}

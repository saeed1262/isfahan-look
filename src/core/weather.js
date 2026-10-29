// Weather words, icons and scenes, and the rain line.
// Plain logic, nothing from Obsidian: the tests import it directly.

import { hhmm } from "./dates.js";

export const WEATHER_TTL = 30 * 60 * 1000;
// A forecast from a while back (offline since, say) is shown for what it is:
// past WEATHER_STALE it's dimmed and says when it's from; past WEATHER_GONE
// it isn't shown at all, nor the hours strip or the scene.
export const WEATHER_STALE = 3 * 3600 * 1000;
export const WEATHER_GONE = 24 * 3600 * 1000;
// The best chance of rain in the hours strip's window (this hour and the
// next 12), when it's RAIN_SHOWN or more: "40% rain at 15:00", "now" for
// this hour, snow where that hour is at or below freezing. "No rain" when
// nothing reaches it ("No snow" when every hour is freezing); nothing when
// the forecast has no hours for the window.
export const RAIN_SHOWN = 30;
export function rainText(hours, now) {
  const from = now.getTime() - 3600000;
  const win = (hours || []).filter((h) => h.t.getTime() > from && h.rain != null).slice(0, 13);
  const best = win.reduce((a, h) => (h.rain > (a?.rain ?? -1) ? h : a), null);
  if (!best) return "";
  if (best.rain < RAIN_SHOWN) return win.every((h) => h.temp <= 0) ? "No snow" : "No rain";
  const when = best.t.getTime() <= now.getTime() ? "now" : `at ${hhmm(best.t)}`;
  return `${best.rain}% ${best.temp <= 0 ? "snow" : "rain"} ${when}`;
}
// WMO weather codes -> words and a Lucide icon (day / night where it matters).
// `kind` picks the new tab's background scene (styles.css, "WEATHER SKY").
export function weatherLook(code, day) {
  const c = Number(code);
  if (c === 0) return { text: "Clear", icon: day ? "sun" : "moon", kind: "clear" };
  if (c === 1 || c === 2) return { text: c === 1 ? "Mostly clear" : "Partly cloudy", icon: day ? "cloud-sun" : "cloud-moon", kind: "partly" };
  if (c === 3) return { text: "Cloudy", icon: "cloud", kind: "cloudy" };
  if (c === 45 || c === 48) return { text: "Fog", icon: "cloud-fog", kind: "fog" };
  if (c >= 51 && c <= 57) return { text: "Drizzle", icon: "cloud-drizzle", kind: "rain" };
  if ((c >= 61 && c <= 67) || (c >= 80 && c <= 82)) return { text: c >= 80 ? "Showers" : "Rain", icon: "cloud-rain", kind: "rain" };
  if ((c >= 71 && c <= 77) || c === 85 || c === 86) return { text: "Snow", icon: "cloud-snow", kind: "snow" };
  if (c >= 95) return { text: "Thunderstorms", icon: "cloud-lightning", kind: "storm" };
  return { text: "", icon: "cloud", kind: "cloudy" };
}
export const SKY_KINDS = ["clear", "partly", "cloudy", "fog", "rain", "snow", "storm"];

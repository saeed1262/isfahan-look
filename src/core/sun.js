// The sun and the four phases: sunrise and sunset worked out on the Mac, the
// phases they give, and the place they're for (set from the settings).
// Plain logic, nothing from Obsidian: the tests import it directly.

import { hhmm } from "./dates.js";

// The phases follow the sun at the settings' place (getPlace): light
// from sunrise to sunset, dark otherwise. Dawn is the first DAWN_MS after
// sunrise, workday runs to sunset, evening the EVENING_MS after it, night
// to the next sunrise (phaseSpans). Late October in Toronto: 07:40, 10:40,
// 18:15, 20:15; December 07:45 to 16:45; June 05:36 to 21:00.
export const PHASES = [
  { id: "dawn", name: "Dawn", dark: false },
  { id: "workday", name: "Workday", dark: false },
  { id: "evening", name: "Evening", dark: true },
  { id: "night", name: "Night", dark: true },
];
export const DAWN_MS = 3 * 3600 * 1000;
export const EVENING_MS = 2 * 3600 * 1000;

// The place the sun and the forecast are read for: the settings' place,
// kept in step by the plugin (setPlace). The forecast is Open-Meteo's (free,
// no account; only the coordinates are sent), fetched while a launcher is
// showing and at most every 30 minutes.
export const DEFAULT_PLACE = { name: "Toronto", label: "Toronto, Ontario, Canada", lat: 43.6532, lon: -79.3832 };
let here = DEFAULT_PLACE;
export const getPlace = () => here;
export const setPlace = (p) => { here = p; };
export const placeKey = (p) => `${p.lat},${p.lon}`;
// Sunrise and sunset on a day at a place, as Dates: NOAA's approximation,
// worked out on the Mac (no network), within a few minutes of the almanac.
export function sunTimes(day, lat, lon) {
  const rad = Math.PI / 180;
  const y = day.getFullYear(), m = day.getMonth(), d = day.getDate();
  const n = Math.round((Date.UTC(y, m, d) - Date.UTC(y, 0, 0)) / 86400000);
  const g = (2 * Math.PI / 365) * (n - 1 + 0.5);
  const eqt = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const cosH = (Math.cos(90.833 * rad) - Math.sin(lat * rad) * Math.sin(decl)) / (Math.cos(lat * rad) * Math.cos(decl));
  const ha = Math.acos(Math.max(-1, Math.min(1, cosH))) / rad;
  const at = (min) => new Date(Date.UTC(y, m, d) + min * 60000);
  return { rise: at(720 - 4 * (lon + ha) - eqt), set: at(720 - 4 * (lon - ha) - eqt) };
}

// Each phase's start and end around `date`: the night before today's
// sunrise, then dawn, workday and evening, then the night to tomorrow's.
export function phaseSpans(date) {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const sun = (dd) => sunTimes(dd, here.lat, here.lon);
  // The days either side by the calendar, not by 24 hours: the days the
  // clocks change are 23 and 25 hours long.
  const today = sun(day), yest = sun(new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1)), tom = sun(new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1));
  const dawnEnd = new Date(Math.min(today.rise.getTime() + DAWN_MS, today.set.getTime()));
  return [
    { id: "night", from: new Date(yest.set.getTime() + EVENING_MS), to: today.rise },
    { id: "dawn", from: today.rise, to: dawnEnd },
    { id: "workday", from: dawnEnd, to: today.set },
    { id: "evening", from: today.set, to: new Date(today.set.getTime() + EVENING_MS) },
    { id: "night", from: new Date(today.set.getTime() + EVENING_MS), to: tom.rise },
  ];
}
export const spanAt = (date) => phaseSpans(date).find((sp) => date >= sp.from && date < sp.to) ?? phaseSpans(date).at(-1);
export function phaseAt(date) {
  const id = spanAt(date).id;
  return PHASES.find((p) => p.id === id);
}
// When the phase changes next, from `date` on.
export const nextPhaseChange = (date) => spanAt(date).to;
// A phase's hours today ("07:40 – 10:40"); night is the one running now or next.
export function hours(p, date = new Date()) {
  const spans = phaseSpans(date).filter((sp) => sp.id === p.id);
  const sp = spans.find((x) => date < x.to) ?? spans.at(-1);
  return `${hhmm(sp.from)} – ${hhmm(sp.to)}`;
}

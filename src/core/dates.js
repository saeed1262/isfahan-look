// Dates and times: ISO weeks as the habit tracker keys them, weekdays, and
// the small formatters the cards and the new tab use.
// Plain logic, nothing from Obsidian: the tests import it directly.

export const agoText = (ms) => {
  if (!ms) return "";
  const m = Math.round((Date.now() - ms) / 60000);
  return m < 1 ? "just now" : m < 60 ? `${m} min ago` : m < 48 * 60 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`;
};
// "14:20" today, "Thu 14:20" another day: when a stale reading was taken.
export const asOf = (ms) => {
  const t = new Date(ms), hm = t.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return ymdOf(t) === ymdOf(new Date()) ? hm : `${t.toLocaleDateString("en-GB", { weekday: "short" })} ${hm}`;
};
// The ISO week (Monday first; week 1 holds the year's first Thursday) and the
// year it belongs to, which differs from the date's around New Year.
export function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const year = t.getUTCFullYear();
  return { year, week: Math.ceil(((t - new Date(Date.UTC(year, 0, 1))) / 86400000 + 1) / 7) };
}
// The week key and weekday index exactly as the habit tracker writes them
// ("2026-W41", Monday = 0).
export function isoWeekKey(d) {
  const { year, week } = isoWeek(d);
  return `${year}-W${week}`;
}
export const weekdayIdx = (d) => (d.getDay() === 0 ? 6 : d.getDay() - 1);
export const mondayOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - weekdayIdx(d));
// "Monday, 26 October": the date the new tab, the cards and daily notes show.
export const longDate = (d) => `${d.toLocaleDateString("en-GB", { weekday: "long" })}, ${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "long" })}`;

export const hhmm = (t) => t.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
export const hhmmOfMinutes = (m) => `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;

// "45 min", "7 h 05 m".
export const durText = (ms) => {
  const m = Math.floor(Math.max(0, ms) / 60000);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${pad2(m % 60)} m`;
};

export const pad2 = (n) => String(n).padStart(2, "0");
export const ymdOf = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
export const monthName = (ym) => new Date(`${ym}-01T12:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
export const prevMonth = (d) => { const p = new Date(d.getFullYear(), d.getMonth() - 1, 1); return `${p.getFullYear()}-${pad2(p.getMonth() + 1)}`; };
export const isWeekday = (d) => d.getDay() >= 1 && d.getDay() <= 5;
// The month's first weekday: the briefing's Wrapped day.
export const isFirstWeekday = (d) => isWeekday(d) && [...Array(d.getDate() - 1)].every((_, i) => !isWeekday(new Date(d.getFullYear(), d.getMonth(), i + 1)));

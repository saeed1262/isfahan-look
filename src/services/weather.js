// The forecast (Open-Meteo), shared by the new tab and the briefing, and the
// place search the settings use.

import { requestUrl } from "obsidian";
import { getPlace, hours, placeKey } from "../core/sun.js";
import { WEATHER_GONE, WEATHER_STALE, WEATHER_TTL } from "../core/weather.js";

// Up to five places matching a name, from Open-Meteo's geocoding (only the
// name is sent): "Toronto, Ontario, Canada" and its coordinates.
export async function findPlaces(name) {
  const r = await requestUrl({ url: `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5&language=en&format=json` });
  const round = (n) => Math.round(n * 1e4) / 1e4;
  return (r.json?.results || []).map((p) => ({
    name: p.name,
    label: [p.name, p.admin1, p.country].filter((x, i, a) => x && a.indexOf(x) === i).join(", "),
    lat: round(p.latitude),
    lon: round(p.longitude),
  }));
}

export const WeatherService = {
  // The cached forecast, or null when there's none, it's for another place,
  // the weather is off, or it's past WEATHER_GONE;
  // `stale` is when it was fetched, once it's past WEATHER_STALE (else 0).
  weatherNow() {
    const w = this.weather;
    if (!w || this.settings.weather === "off" || w.where !== placeKey(getPlace())) return null;
    const age = Date.now() - w.at;
    return age > WEATHER_GONE ? null : { ...w.data, stale: age > WEATHER_STALE ? w.at : 0 };
  },

  // One request at a time, at most every WEATHER_TTL per place, none while
  // the weather is off; a failure (offline, say) keeps the last forecast, or
  // no line at all, and tries again later. A new place fetches at once.
  async refreshWeather() {
    if (this.settings.weather === "off") return;
    const where = placeKey(getPlace());
    const fresh = this.weather?.where === where && Date.now() - this.weather.at < WEATHER_TTL;
    if (this.weatherBusy || fresh) return;
    if (this.weatherFailedAt && this.weatherFailedWhere === where && Date.now() - this.weatherFailedAt < 5 * 60 * 1000) return;
    this.weatherBusy = true;
    try {
      const q = `latitude=${getPlace().lat}&longitude=${getPlace().lon}&timezone=auto&timeformat=unixtime`;
      const r = await requestUrl({
        url: `https://api.open-meteo.com/v1/forecast?${q}&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&hourly=temperature_2m,precipitation_probability&forecast_days=2`,
      });
      const j = r.json, c = j.current, d = j.daily, h = j.hourly;
      // Times come back as Unix seconds, right wherever the place is;
      // timezone=auto makes "today" (the high and low) the place's own day.
      const sun = (d.sunrise || []).map((rise, i) => ({ rise: new Date(rise * 1000), set: new Date(d.sunset[i] * 1000) }));
      const hours = (h?.time || []).map((t, i) => ({ t: new Date(t * 1000), temp: h.temperature_2m[i], rain: h.precipitation_probability?.[i] ?? null }));
      this.weather = {
        at: Date.now(),
        where,
        data: { temp: c.temperature_2m, code: c.weather_code, day: !!c.is_day, hi: d.temperature_2m_max[0], lo: d.temperature_2m_min[0], sun, hours },
      };
      this.weatherFailedAt = 0;
      for (const leaf of this.app.workspace.getLeavesOfType("empty")) {
        const l = this.launcherOf(leaf.view?.contentEl);
        if (l) this.paintWeather(l);
      }
    } catch (e) {
      this.weatherFailedAt = Date.now();
      this.weatherFailedWhere = where;
      console.warn("Isfahan: weather unavailable", e);
    } finally {
      this.weatherBusy = false;
    }
  },
};

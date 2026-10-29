// The settings: their defaults, the choices they offer, and the check every
// saved copy goes through on load.
// Plain logic, nothing from Obsidian: the tests import it directly.

import { DEFAULT_PLACE, PHASES } from "./sun.js";

// Bundled in src/fonts/ and inlined into main.js (src/fonts.js), so nothing
// loads from the network. unicode-range keeps them on Latin characters, so
// other scripts fall through to the theme's own font. Each face claims
// every weight so a bold heading uses the real glyphs instead of a
// synthesized bold.
export const LATIN = "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2212, U+FEFF, U+FFFD";
export const FACES = [
  { family: "Isfahan Cormorant", file: "cormorant-garamond-latin-600-normal.woff2", range: LATIN },
  { family: "Isfahan Cormorant", file: "cormorant-garamond-latin-500-italic.woff2", range: LATIN, style: "italic" },
  { family: "Isfahan Literata", file: "literata-latin-wght-normal.woff2", range: LATIN },
  { family: "Isfahan Literata", file: "literata-latin-wght-italic.woff2", range: LATIN, style: "italic" },
];

export const DEFAULTS = {
  enabled: true,
  mode: "auto", // "auto" (follow the sun) or a phase id
  holdUntil: null, // a phase picked from the status bar lapses at this time (ms)
  serifHeadings: true,
  motifs: true,
  pattern: "girih", // a PATTERNS id
  pageMode: true, // notes read as a printed page in Reading view
  pageScope: "all", // "all" notes (minus `no-page` ones), or only "pages" (`cssclasses: page`)
  quietChrome: true, // fade the app chrome while reading such a note
  place: DEFAULT_PLACE, // where the sun and the weather are read
  weather: "text", // the forecast: "off" (nothing fetched), "text", or "scene" (text, and the sky painted behind the new tab)
  propertyRibbon: "tile", // "off" | "tile" | "slim" | "seals"
  newTab: true, // an empty tab shows the clock, the weather, search and recent notes
};

// Saved settings checked against DEFAULTS: a value of the wrong type or
// outside its choices (an old or hand-edited data.json) falls back to the
// default, and keys no longer used are dropped. The old on/off weather
// scene becomes the three-way weather setting.
export function cleanSettings(saved) {
  const raw = saved && typeof saved === "object" ? { ...saved } : {};
  if (raw.weather === undefined && typeof raw.weatherSky === "boolean") raw.weather = raw.weatherSky ? "scene" : "text";
  const choices = {
    mode: ["auto", ...PHASES.map((p) => p.id)],
    pattern: PATTERNS.map((pt) => pt.id),
    pageScope: ["all", "pages"],
    weather: ["off", "text", "scene"],
    propertyRibbon: RIBBONS.map((r) => r.id),
  };
  const ranges = {};
  const out = {};
  for (const [k, def] of Object.entries(DEFAULTS)) {
    const v = raw[k];
    let ok = v !== undefined && typeof v === typeof def;
    if (k === "holdUntil") ok = v === null || Number.isFinite(v);
    else if (choices[k]) ok = choices[k].includes(v);
    else if (ranges[k]) ok = Number.isInteger(v) && v >= ranges[k][0] && v <= ranges[k][1];
    else if (k === "place") ok = ok && !!v && typeof v.name === "string" && v.name !== "" && Math.abs(v.lat) <= 90 && Math.abs(v.lon) <= 180;
    out[k] = ok ? v : def && typeof def === "object" ? { ...def } : def;
  }
  if (typeof out.place.label !== "string") out.place = { ...out.place, label: out.place.name };
  return out;
}

// The tile pattern behind titles and in the file explorer:
// one CSS variable (--isfahan-girih), swapped by a body class (styles.css,
// "TILE PATTERNS"). Each is a seamless 60x60 tile with its motif centred.
export const PATTERNS = [
  { id: "girih", name: "Girih lattice" },
  { id: "khatam", name: "Star & cross" },
  { id: "shamseh", name: "Shamseh rosettes" },
  { id: "rings", name: "Rings" },
  { id: "jali", name: "Jali screen" },
  { id: "bannai", name: "Banna'i fret" },
  { id: "dots", name: "Quiet dots" },
];

// Styles for the Properties block in Reading view ("off" keeps the cards).
export const RIBBONS = [
  { id: "off", name: "Off (Properties as cards)" },
  { id: "tile", name: "Tile ribbon" },
  { id: "slim", name: "Slim ribbon" },
  { id: "seals", name: "Seals" },
];

// The class a note opts into Page mode with (frontmatter `cssclasses`),
// when Page mode is set to page notes only.
export const PAGE_CLASS = "page";
// The notes that never get Page mode or the title band, by class (./classes.js).
export { NO_BAND_CLASSES, NO_PAGE_CLASSES } from "./classes.js";

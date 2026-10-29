/* Isfahan: built from src/ by tools/build.mjs. Edit src/, not this file.

Isfahan bundles subsets of these font families, from Fontsource
(https://fontsource.org), each under the SIL Open Font License 1.1:

Cormorant Garamond: Copyright 2015 The Cormorant Project Authors (github.com/CatharsisFonts/Cormorant)
Literata: Copyright 2017 The Literata Project Authors (https://github.com/googlefonts/literata)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
*/
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/public.js
var public_exports = {};
__export(public_exports, {
  default: () => Isfahan,
  internals: () => internals
});
module.exports = __toCommonJS(public_exports);
var import_obsidian8 = require("obsidian");

// src/core/dates.js
var asOf = (ms) => {
  const t = new Date(ms), hm = t.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return ymdOf(t) === ymdOf(/* @__PURE__ */ new Date()) ? hm : `${t.toLocaleDateString("en-GB", { weekday: "short" })} ${hm}`;
};
var longDate = (d) => `${d.toLocaleDateString("en-GB", { weekday: "long" })}, ${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "long" })}`;
var hhmm = (t) => t.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
var pad2 = (n) => String(n).padStart(2, "0");
var ymdOf = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

// src/core/sun.js
var PHASES = [
  { id: "dawn", name: "Dawn", dark: false },
  { id: "workday", name: "Workday", dark: false },
  { id: "evening", name: "Evening", dark: true },
  { id: "night", name: "Night", dark: true }
];
var DAWN_MS = 3 * 3600 * 1e3;
var EVENING_MS = 2 * 3600 * 1e3;
var DEFAULT_PLACE = { name: "Toronto", label: "Toronto, Ontario, Canada", lat: 43.6532, lon: -79.3832 };
var here = DEFAULT_PLACE;
var getPlace = () => here;
var setPlace = (p) => {
  here = p;
};
var placeKey = (p) => `${p.lat},${p.lon}`;
function sunTimes(day, lat, lon) {
  const rad = Math.PI / 180;
  const y = day.getFullYear(), m = day.getMonth(), d = day.getDate();
  const n = Math.round((Date.UTC(y, m, d) - Date.UTC(y, 0, 0)) / 864e5);
  const g = 2 * Math.PI / 365 * (n - 1 + 0.5);
  const eqt = 229.18 * (75e-6 + 1868e-6 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 6918e-6 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 6758e-6 * Math.cos(2 * g) + 907e-6 * Math.sin(2 * g) - 2697e-6 * Math.cos(3 * g) + 148e-5 * Math.sin(3 * g);
  const cosH = (Math.cos(90.833 * rad) - Math.sin(lat * rad) * Math.sin(decl)) / (Math.cos(lat * rad) * Math.cos(decl));
  const ha = Math.acos(Math.max(-1, Math.min(1, cosH))) / rad;
  const at = (min) => new Date(Date.UTC(y, m, d) + min * 6e4);
  return { rise: at(720 - 4 * (lon + ha) - eqt), set: at(720 - 4 * (lon - ha) - eqt) };
}
function phaseSpans(date) {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const sun = (dd) => sunTimes(dd, here.lat, here.lon);
  const today = sun(day), yest = sun(new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1)), tom = sun(new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1));
  const dawnEnd = new Date(Math.min(today.rise.getTime() + DAWN_MS, today.set.getTime()));
  return [
    { id: "night", from: new Date(yest.set.getTime() + EVENING_MS), to: today.rise },
    { id: "dawn", from: today.rise, to: dawnEnd },
    { id: "workday", from: dawnEnd, to: today.set },
    { id: "evening", from: today.set, to: new Date(today.set.getTime() + EVENING_MS) },
    { id: "night", from: new Date(today.set.getTime() + EVENING_MS), to: tom.rise }
  ];
}
var spanAt = (date) => phaseSpans(date).find((sp) => date >= sp.from && date < sp.to) ?? phaseSpans(date).at(-1);
function phaseAt(date) {
  const id = spanAt(date).id;
  return PHASES.find((p) => p.id === id);
}
var nextPhaseChange = (date) => spanAt(date).to;
function hours(p, date = /* @__PURE__ */ new Date()) {
  const spans = phaseSpans(date).filter((sp2) => sp2.id === p.id);
  const sp = spans.find((x) => date < x.to) ?? spans.at(-1);
  return `${hhmm(sp.from)} – ${hhmm(sp.to)}`;
}

// src/base.js
var Base = {
  // A one-off timer that's cleared when the plugin unloads, and that doesn't
  // start once it has. Intervals go through registerInterval instead.
  later(fn, ms) {
    if (this.unloaded) return null;
    this.timers = this.timers || /* @__PURE__ */ new Set();
    const id = window.setTimeout(() => {
      this.timers.delete(id);
      if (!this.unloaded) fn();
    }, ms);
    this.timers.add(id);
    return id;
  },
  async update(patch) {
    Object.assign(this.settings, patch);
    setPlace(this.settings.place);
    await this.saveData(this.settings);
    this.apply();
    this.queueLauncherFill?.();
  }
};

// src/core/classes.js
var NO_PAGE_CLASSES = ["no-page"];

// src/core/settings.js
var LATIN = "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2212, U+FEFF, U+FFFD";
var FACES = [
  { family: "Isfahan Cormorant", file: "cormorant-garamond-latin-600-normal.woff2", range: LATIN },
  { family: "Isfahan Cormorant", file: "cormorant-garamond-latin-500-italic.woff2", range: LATIN, style: "italic" },
  { family: "Isfahan Literata", file: "literata-latin-wght-normal.woff2", range: LATIN },
  { family: "Isfahan Literata", file: "literata-latin-wght-italic.woff2", range: LATIN, style: "italic" }
];
var DEFAULTS = {
  enabled: true,
  mode: "auto",
  // "auto" (follow the sun) or a phase id
  holdUntil: null,
  // a phase picked from the status bar lapses at this time (ms)
  serifHeadings: true,
  motifs: true,
  pattern: "girih",
  // a PATTERNS id
  pageMode: true,
  // notes read as a printed page in Reading view
  pageScope: "all",
  // "all" notes (minus `no-page` ones), or only "pages" (`cssclasses: page`)
  quietChrome: true,
  // fade the app chrome while reading such a note
  place: DEFAULT_PLACE,
  // where the sun and the weather are read
  weather: "text",
  // the forecast: "off" (nothing fetched), "text", or "scene" (text, and the sky painted behind the new tab)
  propertyRibbon: "tile",
  // "off" | "tile" | "slim" | "seals"
  newTab: true
  // an empty tab shows the clock, the weather, search and recent notes
};
function cleanSettings(saved) {
  const raw = saved && typeof saved === "object" ? { ...saved } : {};
  if (raw.weather === void 0 && typeof raw.weatherSky === "boolean") raw.weather = raw.weatherSky ? "scene" : "text";
  const choices = {
    mode: ["auto", ...PHASES.map((p) => p.id)],
    pattern: PATTERNS.map((pt) => pt.id),
    pageScope: ["all", "pages"],
    weather: ["off", "text", "scene"],
    propertyRibbon: RIBBONS.map((r) => r.id)
  };
  const ranges = {};
  const out = {};
  for (const [k, def] of Object.entries(DEFAULTS)) {
    const v = raw[k];
    let ok = v !== void 0 && typeof v === typeof def;
    if (k === "holdUntil") ok = v === null || Number.isFinite(v);
    else if (choices[k]) ok = choices[k].includes(v);
    else if (ranges[k]) ok = Number.isInteger(v) && v >= ranges[k][0] && v <= ranges[k][1];
    else if (k === "place") ok = ok && !!v && typeof v.name === "string" && v.name !== "" && Math.abs(v.lat) <= 90 && Math.abs(v.lon) <= 180;
    out[k] = ok ? v : def && typeof def === "object" ? { ...def } : def;
  }
  if (typeof out.place.label !== "string") out.place = { ...out.place, label: out.place.name };
  return out;
}
var PATTERNS = [
  { id: "girih", name: "Girih lattice" },
  { id: "khatam", name: "Star & cross" },
  { id: "shamseh", name: "Shamseh rosettes" },
  { id: "rings", name: "Rings" },
  { id: "jali", name: "Jali screen" },
  { id: "bannai", name: "Banna'i fret" },
  { id: "dots", name: "Quiet dots" }
];
var RIBBONS = [
  { id: "off", name: "Off (Properties as cards)" },
  { id: "tile", name: "Tile ribbon" },
  { id: "slim", name: "Slim ribbon" },
  { id: "seals", name: "Seals" }
];
var PAGE_CLASS = "page";

// src/core/zone-table.js
var ZONE_TABLE = `
Africa/Abidjan 5.32 -4.03
Africa/Accra 5.55 -0.22
Africa/Addis_Ababa 9.03 38.7
Africa/Algiers 36.78 3.05
Africa/Asmara 15.33 38.88
Africa/Bamako 12.65 -8
Africa/Bangui 4.37 18.58
Africa/Banjul 13.47 -16.65
Africa/Bissau 11.85 -15.58
Africa/Blantyre -15.78 35
Africa/Brazzaville -4.27 15.28
Africa/Bujumbura -3.38 29.37
Africa/Cairo 30.05 31.25
Africa/Casablanca 33.65 -7.58
Africa/Ceuta 35.88 -5.32
Africa/Conakry 9.52 -13.72
Africa/Dakar 14.67 -17.43
Africa/Dar_es_Salaam -6.8 39.28
Africa/Djibouti 11.6 43.15
Africa/Douala 4.05 9.7
Africa/El_Aaiun 27.15 -13.2
Africa/Freetown 8.5 -13.25
Africa/Gaborone -24.65 25.92
Africa/Harare -17.83 31.05
Africa/Johannesburg -26.25 28
Africa/Juba 4.85 31.62
Africa/Kampala 0.32 32.42
Africa/Khartoum 15.6 32.53
Africa/Kigali -1.95 30.07
Africa/Kinshasa -4.3 15.3
Africa/Lagos 6.45 3.4
Africa/Libreville 0.38 9.45
Africa/Lome 6.13 1.22
Africa/Luanda -8.8 13.23
Africa/Lubumbashi -11.67 27.47
Africa/Lusaka -15.42 28.28
Africa/Malabo 3.75 8.78
Africa/Maputo -25.97 32.58
Africa/Maseru -29.47 27.5
Africa/Mbabane -26.3 31.1
Africa/Mogadishu 2.07 45.37
Africa/Monrovia 6.3 -10.78
Africa/Nairobi -1.28 36.82
Africa/Ndjamena 12.12 15.05
Africa/Niamey 13.52 2.12
Africa/Nouakchott 18.1 -15.95
Africa/Ouagadougou 12.37 -1.52
Africa/Porto-Novo 6.48 2.62
Africa/Sao_Tome 0.33 6.73
Africa/Tripoli 32.9 13.18
Africa/Tunis 36.8 10.18
Africa/Windhoek -22.57 17.1
America/Adak 51.88 -176.66
America/Anchorage 61.22 -149.9
America/Anguilla 18.2 -63.07
America/Antigua 17.05 -61.8
America/Araguaina -7.2 -48.2
America/Argentina/Buenos_Aires -34.6 -58.45
America/Argentina/Catamarca -28.47 -65.78
America/Argentina/Cordoba -31.4 -64.18
America/Argentina/Jujuy -24.18 -65.3
America/Argentina/La_Rioja -29.43 -66.85
America/Argentina/Mendoza -32.88 -68.82
America/Argentina/Rio_Gallegos -51.63 -69.22
America/Argentina/Salta -24.78 -65.42
America/Argentina/San_Juan -31.53 -68.52
America/Argentina/San_Luis -33.32 -66.35
America/Argentina/Tucuman -26.82 -65.22
America/Argentina/Ushuaia -54.8 -68.3
America/Aruba 12.5 -69.97
America/Asuncion -25.27 -57.67
America/Atikokan 48.76 -91.62
America/Bahia -12.98 -38.52
America/Bahia_Banderas 20.8 -105.25
America/Barbados 13.1 -59.62
America/Belem -1.45 -48.48
America/Belize 17.5 -88.2
America/Blanc-Sablon 51.42 -57.12
America/Boa_Vista 2.82 -60.67
America/Bogota 4.6 -74.08
America/Boise 43.61 -116.2
America/Cambridge_Bay 69.11 -105.05
America/Campo_Grande -20.45 -54.62
America/Cancun 21.08 -86.77
America/Caracas 10.5 -66.93
America/Cayenne 4.93 -52.33
America/Cayman 19.3 -81.38
America/Chicago 41.85 -87.65
America/Chihuahua 28.63 -106.08
America/Ciudad_Juarez 31.73 -106.48
America/Costa_Rica 9.93 -84.08
America/Coyhaique -45.57 -72.07
America/Creston 49.1 -116.52
America/Cuiaba -15.58 -56.08
America/Curacao 12.18 -69
America/Danmarkshavn 76.77 -18.67
America/Dawson 64.07 -139.42
America/Dawson_Creek 55.77 -120.23
America/Denver 39.74 -104.98
America/Detroit 42.33 -83.05
America/Dominica 15.3 -61.4
America/Edmonton 53.55 -113.47
America/Eirunepe -6.67 -69.87
America/El_Salvador 13.7 -89.2
America/Fort_Nelson 58.8 -122.7
America/Fortaleza -3.72 -38.5
America/Glace_Bay 46.2 -59.95
America/Goose_Bay 53.33 -60.42
America/Grand_Turk 21.47 -71.13
America/Grenada 12.05 -61.75
America/Guadeloupe 16.23 -61.53
America/Guatemala 14.63 -90.52
America/Guayaquil -2.17 -79.83
America/Guyana 6.8 -58.17
America/Halifax 44.65 -63.6
America/Havana 23.13 -82.37
America/Hermosillo 29.07 -110.97
America/Indiana/Indianapolis 39.77 -86.16
America/Indiana/Knox 41.3 -86.62
America/Indiana/Marengo 38.38 -86.34
America/Indiana/Petersburg 38.49 -87.28
America/Indiana/Tell_City 37.95 -86.76
America/Indiana/Vevay 38.75 -85.07
America/Indiana/Vincennes 38.68 -87.53
America/Indiana/Winamac 41.05 -86.6
America/Inuvik 68.35 -133.72
America/Iqaluit 63.73 -68.47
America/Jamaica 17.97 -76.79
America/Juneau 58.3 -134.42
America/Kentucky/Louisville 38.25 -85.76
America/Kentucky/Monticello 36.83 -84.85
America/Kralendijk 12.15 -68.28
America/La_Paz -16.5 -68.15
America/Lima -12.05 -77.05
America/Los_Angeles 34.05 -118.24
America/Lower_Princes 18.05 -63.05
America/Maceio -9.67 -35.72
America/Managua 12.15 -86.28
America/Manaus -3.13 -60.02
America/Marigot 18.07 -63.08
America/Martinique 14.6 -61.08
America/Matamoros 25.83 -97.5
America/Mazatlan 23.22 -106.42
America/Menominee 45.11 -87.61
America/Merida 20.97 -89.62
America/Metlakatla 55.13 -131.58
America/Mexico_City 19.4 -99.15
America/Miquelon 47.05 -56.33
America/Moncton 46.1 -64.78
America/Monterrey 25.67 -100.32
America/Montevideo -34.91 -56.21
America/Montserrat 16.72 -62.22
America/Nassau 25.08 -77.35
America/New_York 40.71 -74.01
America/Nome 64.5 -165.41
America/Noronha -3.85 -32.42
America/North_Dakota/Beulah 47.26 -101.78
America/North_Dakota/Center 47.12 -101.3
America/North_Dakota/New_Salem 46.85 -101.41
America/Nuuk 64.18 -51.73
America/Ojinaga 29.57 -104.42
America/Panama 8.97 -79.53
America/Paramaribo 5.83 -55.17
America/Phoenix 33.45 -112.07
America/Port-au-Prince 18.53 -72.33
America/Port_of_Spain 10.65 -61.52
America/Porto_Velho -8.77 -63.9
America/Puerto_Rico 18.47 -66.11
America/Punta_Arenas -53.15 -70.92
America/Rankin_Inlet 62.82 -92.08
America/Recife -8.05 -34.9
America/Regina 50.4 -104.65
America/Resolute 74.7 -94.83
America/Rio_Branco -9.97 -67.8
America/Santarem -2.43 -54.87
America/Santiago -33.45 -70.67
America/Santo_Domingo 18.47 -69.9
America/Sao_Paulo -23.53 -46.62
America/Scoresbysund 70.48 -21.97
America/Sitka 57.18 -135.3
America/St_Barthelemy 17.88 -62.85
America/St_Johns 47.57 -52.72
America/St_Kitts 17.3 -62.72
America/St_Lucia 14.02 -61
America/St_Thomas 18.35 -64.93
America/St_Vincent 13.15 -61.23
America/Swift_Current 50.28 -107.83
America/Tegucigalpa 14.1 -87.22
America/Thule 76.57 -68.78
America/Tijuana 32.53 -117.02
America/Toronto 43.65 -79.38
America/Tortola 18.45 -64.62
America/Vancouver 49.27 -123.12
America/Whitehorse 60.72 -135.05
America/Winnipeg 49.88 -97.15
America/Yakutat 59.55 -139.73
Antarctica/Casey -66.28 110.52
Antarctica/Davis -68.58 77.97
Antarctica/DumontDUrville -66.67 140.02
Antarctica/Macquarie -54.5 158.95
Antarctica/Mawson -67.6 62.88
Antarctica/McMurdo -77.83 166.6
Antarctica/Palmer -64.8 -64.1
Antarctica/Rothera -67.57 -68.13
Antarctica/Syowa -69.01 39.59
Antarctica/Troll -72.01 2.53
Antarctica/Vostok -78.4 106.9
Arctic/Longyearbyen 78 16
Asia/Aden 12.75 45.2
Asia/Almaty 43.25 76.95
Asia/Amman 31.95 35.93
Asia/Anadyr 64.75 177.48
Asia/Aqtau 44.52 50.27
Asia/Aqtobe 50.28 57.17
Asia/Ashgabat 37.95 58.38
Asia/Atyrau 47.12 51.93
Asia/Baghdad 33.35 44.42
Asia/Bahrain 26.38 50.58
Asia/Baku 40.38 49.85
Asia/Bangkok 13.75 100.52
Asia/Barnaul 53.37 83.75
Asia/Beirut 33.88 35.5
Asia/Bishkek 42.9 74.6
Asia/Brunei 4.93 114.92
Asia/Chita 52.05 113.47
Asia/Colombo 6.93 79.85
Asia/Damascus 33.5 36.3
Asia/Dhaka 23.72 90.42
Asia/Dili -8.55 125.58
Asia/Dubai 25.3 55.3
Asia/Dushanbe 38.58 68.8
Asia/Famagusta 35.12 33.95
Asia/Gaza 31.5 34.47
Asia/Hebron 31.53 35.1
Asia/Ho_Chi_Minh 10.75 106.67
Asia/Hong_Kong 22.28 114.15
Asia/Hovd 48.02 91.65
Asia/Irkutsk 52.27 104.33
Asia/Jakarta -6.17 106.8
Asia/Jayapura -2.53 140.7
Asia/Jerusalem 31.78 35.22
Asia/Kabul 34.52 69.2
Asia/Kamchatka 53.02 158.65
Asia/Karachi 24.87 67.05
Asia/Kathmandu 27.72 85.32
Asia/Khandyga 62.66 135.55
Asia/Kolkata 22.53 88.37
Asia/Krasnoyarsk 56.02 92.83
Asia/Kuala_Lumpur 3.17 101.7
Asia/Kuching 1.55 110.33
Asia/Kuwait 29.33 47.98
Asia/Macau 22.2 113.54
Asia/Magadan 59.57 150.8
Asia/Makassar -5.12 119.4
Asia/Manila 14.59 120.97
Asia/Muscat 23.6 58.58
Asia/Nicosia 35.17 33.37
Asia/Novokuznetsk 53.75 87.12
Asia/Novosibirsk 55.03 82.92
Asia/Omsk 55 73.4
Asia/Oral 51.22 51.35
Asia/Phnom_Penh 11.55 104.92
Asia/Pontianak -0.03 109.33
Asia/Pyongyang 39.02 125.75
Asia/Qatar 25.28 51.53
Asia/Qostanay 53.2 63.62
Asia/Qyzylorda 44.8 65.47
Asia/Riyadh 24.63 46.72
Asia/Sakhalin 46.97 142.7
Asia/Samarkand 39.67 66.8
Asia/Seoul 37.55 126.97
Asia/Shanghai 31.23 121.47
Asia/Singapore 1.28 103.85
Asia/Srednekolymsk 67.47 153.72
Asia/Taipei 25.05 121.5
Asia/Tashkent 41.33 69.3
Asia/Tbilisi 41.72 44.82
Asia/Tehran 35.67 51.43
Asia/Thimphu 27.47 89.65
Asia/Tokyo 35.65 139.74
Asia/Tomsk 56.5 84.97
Asia/Ulaanbaatar 47.92 106.88
Asia/Urumqi 43.8 87.58
Asia/Ust-Nera 64.56 143.23
Asia/Vientiane 17.97 102.6
Asia/Vladivostok 43.17 131.93
Asia/Yakutsk 62 129.67
Asia/Yangon 16.78 96.17
Asia/Yekaterinburg 56.85 60.6
Asia/Yerevan 40.18 44.5
Atlantic/Azores 37.73 -25.67
Atlantic/Bermuda 32.28 -64.77
Atlantic/Canary 28.1 -15.4
Atlantic/Cape_Verde 14.92 -23.52
Atlantic/Faroe 62.02 -6.77
Atlantic/Madeira 32.63 -16.9
Atlantic/Reykjavik 64.15 -21.85
Atlantic/South_Georgia -54.27 -36.53
Atlantic/St_Helena -15.92 -5.7
Atlantic/Stanley -51.7 -57.85
Australia/Adelaide -34.92 138.58
Australia/Brisbane -27.47 153.03
Australia/Broken_Hill -31.95 141.45
Australia/Darwin -12.47 130.83
Australia/Eucla -31.72 128.87
Australia/Hobart -42.88 147.32
Australia/Lindeman -20.27 149
Australia/Lord_Howe -31.55 159.08
Australia/Melbourne -37.82 144.97
Australia/Perth -31.95 115.85
Australia/Sydney -33.87 151.22
Europe/Amsterdam 52.37 4.9
Europe/Andorra 42.5 1.52
Europe/Astrakhan 46.35 48.05
Europe/Athens 37.97 23.72
Europe/Belgrade 44.83 20.5
Europe/Berlin 52.5 13.37
Europe/Bratislava 48.15 17.12
Europe/Brussels 50.83 4.33
Europe/Bucharest 44.43 26.1
Europe/Budapest 47.5 19.08
Europe/Busingen 47.7 8.68
Europe/Chisinau 47 28.83
Europe/Copenhagen 55.67 12.58
Europe/Dublin 53.33 -6.25
Europe/Gibraltar 36.13 -5.35
Europe/Guernsey 49.45 -2.54
Europe/Helsinki 60.17 24.97
Europe/Isle_of_Man 54.15 -4.47
Europe/Istanbul 41.02 28.97
Europe/Jersey 49.18 -2.11
Europe/Kaliningrad 54.72 20.5
Europe/Kirov 58.6 49.65
Europe/Kyiv 50.43 30.52
Europe/Lisbon 38.72 -9.13
Europe/Ljubljana 46.05 14.52
Europe/London 51.51 -0.13
Europe/Luxembourg 49.6 6.15
Europe/Madrid 40.4 -3.68
Europe/Malta 35.9 14.52
Europe/Mariehamn 60.1 19.95
Europe/Minsk 53.9 27.57
Europe/Monaco 43.7 7.38
Europe/Moscow 55.76 37.62
Europe/Oslo 59.92 10.75
Europe/Paris 48.87 2.33
Europe/Podgorica 42.43 19.27
Europe/Prague 50.08 14.43
Europe/Riga 56.95 24.1
Europe/Rome 41.9 12.48
Europe/Samara 53.2 50.15
Europe/San_Marino 43.92 12.47
Europe/Sarajevo 43.87 18.42
Europe/Saratov 51.57 46.03
Europe/Simferopol 44.95 34.1
Europe/Skopje 41.98 21.43
Europe/Sofia 42.68 23.32
Europe/Stockholm 59.33 18.05
Europe/Tallinn 59.42 24.75
Europe/Tirane 41.33 19.83
Europe/Ulyanovsk 54.33 48.4
Europe/Vaduz 47.15 9.52
Europe/Vatican 41.9 12.45
Europe/Vienna 48.22 16.33
Europe/Vilnius 54.68 25.32
Europe/Volgograd 48.73 44.42
Europe/Warsaw 52.25 21
Europe/Zagreb 45.8 15.97
Europe/Zurich 47.38 8.53
Indian/Antananarivo -18.92 47.52
Indian/Chagos -7.33 72.42
Indian/Christmas -10.42 105.72
Indian/Cocos -12.17 96.92
Indian/Comoro -11.68 43.27
Indian/Kerguelen -49.35 70.22
Indian/Mahe -4.67 55.47
Indian/Maldives 4.17 73.5
Indian/Mauritius -20.17 57.5
Indian/Mayotte -12.78 45.23
Indian/Reunion -20.87 55.47
Pacific/Apia -13.83 -171.73
Pacific/Auckland -36.87 174.77
Pacific/Bougainville -6.22 155.57
Pacific/Chatham -43.95 -176.55
Pacific/Chuuk 7.42 151.78
Pacific/Easter -27.15 -109.43
Pacific/Efate -17.67 168.42
Pacific/Fakaofo -9.37 -171.23
Pacific/Fiji -18.13 178.42
Pacific/Funafuti -8.52 179.22
Pacific/Galapagos -0.9 -89.6
Pacific/Gambier -23.13 -134.95
Pacific/Guadalcanal -9.53 160.2
Pacific/Guam 13.47 144.75
Pacific/Honolulu 21.31 -157.86
Pacific/Kanton -2.78 -171.72
Pacific/Kiritimati 1.87 -157.33
Pacific/Kosrae 5.32 162.98
Pacific/Kwajalein 9.08 167.33
Pacific/Majuro 7.15 171.2
Pacific/Marquesas -9 -139.5
Pacific/Midway 28.22 -177.37
Pacific/Nauru -0.52 166.92
Pacific/Niue -19.02 -169.92
Pacific/Norfolk -29.05 167.97
Pacific/Noumea -22.27 166.45
Pacific/Pago_Pago -14.27 -170.7
Pacific/Palau 7.33 134.48
Pacific/Pitcairn -25.07 -130.08
Pacific/Pohnpei 6.97 158.22
Pacific/Port_Moresby -9.5 147.17
Pacific/Rarotonga -21.23 -159.77
Pacific/Saipan 15.2 145.75
Pacific/Tahiti -17.53 -149.57
Pacific/Tarawa 1.42 173
Pacific/Tongatapu -21.13 -175.2
Pacific/Wake 19.28 166.62
Pacific/Wallis -13.3 -176.17
`;

// src/core/zones.js
var RENAMED = {
  "Asia/Calcutta": "Asia/Kolkata",
  "Asia/Saigon": "Asia/Ho_Chi_Minh",
  "Asia/Katmandu": "Asia/Kathmandu",
  "Asia/Rangoon": "Asia/Yangon",
  "Asia/Dacca": "Asia/Dhaka",
  "Asia/Ulan_Bator": "Asia/Ulaanbaatar",
  "Europe/Kiev": "Europe/Kyiv",
  "Atlantic/Faeroe": "Atlantic/Faroe",
  "America/Godthab": "America/Nuuk",
  "Pacific/Truk": "Pacific/Chuuk",
  "Pacific/Ponape": "Pacific/Pohnpei",
  "Pacific/Enderbury": "Pacific/Kanton",
  "Africa/Asmera": "Africa/Asmara"
};
var zones = null;
var table = () => {
  if (!zones) {
    zones = /* @__PURE__ */ new Map();
    for (const row of ZONE_TABLE.trim().split("\n")) {
      const [zone, lat, lon] = row.split(" ");
      zones.set(zone, { lat: Number(lat), lon: Number(lon) });
    }
  }
  return zones;
};
var city = (zone) => zone.split("/").at(-1);
function placeFromZone(zone, offsetMinutes = 0) {
  const name = RENAMED[zone] ?? zone ?? "";
  let hit = table().get(name) && name;
  if (!hit) hit = [...table().keys()].find((z) => city(z) === city(name));
  if (hit) {
    const town = city(hit).replaceAll("_", " ");
    return { name: town, label: `${town} (your time zone)`, ...table().get(hit), guessed: true };
  }
  const h = -offsetMinutes / 60 || 0;
  const utc = `UTC${h === 0 ? "" : (h > 0 ? "+" : "−") + Math.abs(h)}`;
  return { name: utc, label: `${utc} (your clock)`, lat: 45, lon: Math.max(-180, Math.min(180, h * 15)), guessed: true };
}
function localPlace() {
  let zone = null;
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
  }
  return placeFromZone(zone, (/* @__PURE__ */ new Date()).getTimezoneOffset());
}

// src/look/reading.js
var import_obsidian = require("obsidian");

// src/core/notes.js
function footnoteRefs(src) {
  const clean = src.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
  const out = [];
  const re = /\[\^([^\]\s]+)\](?!:)|\^\[/g;
  let m;
  while (m = re.exec(clean)) out.push(m[1] ?? null);
  return out;
}
function footnoteDefs(src) {
  const defs = /* @__PURE__ */ new Map();
  for (const m of src.matchAll(/^\[\^([^\]\s]+)\]:[ \t]?(.*)$/gm)) defs.set(m[1], m[2]);
  return defs;
}
function readingMarks(cache) {
  const secs = cache?.sections ?? [];
  const h2 = new Set((cache?.headings ?? []).filter((h) => h.level === 2).map((h) => h.position.start.line));
  let dropLine = null;
  for (let i = 0; i + 1 < secs.length; i++) {
    if (secs[i].type === "heading" && h2.has(secs[i].position.start.line) && secs[i + 1].type === "paragraph") {
      dropLine = secs[i + 1].position.start.line;
      break;
    }
  }
  return { hasNotes: !!(cache?.footnoteRefs?.length || cache?.footnotes?.length), dropLine };
}

// src/core/text.js
function frontmatterClasses(fm) {
  const c = fm?.cssclasses ?? fm?.cssclass;
  if (Array.isArray(c)) return c.map(String);
  if (typeof c === "string") return c.split(/[\s,]+/);
  return [];
}

// src/look/reading.js
var Reading = {
  pageActive() {
    return this.settings.enabled && this.settings.pageMode;
  },
  isPageNote(fm) {
    const cls = frontmatterClasses(fm);
    if (cls.includes(PAGE_CLASS)) return true;
    return this.settings.pageScope === "all" && !cls.some((c) => NO_PAGE_CLASSES.includes(c));
  },
  isPageFile(file) {
    if (!file || file.extension !== "md") return false;
    return this.isPageNote(this.app.metadataCache.getFileCache(file)?.frontmatter);
  },
  // Page mode: put each footnote beside the line that references it.
  // Reading view only (post-processors don't run in Live Preview). The
  // footnote text comes from the note's source rather than the rendered
  // footnotes section, because reading view renders a long note in pieces
  // and that section may not exist yet when an early paragraph renders.
  sidenotes(el, ctx) {
    if (!this.pageActive()) return;
    const fm = ctx.frontmatter ?? this.app.metadataCache.getCache(ctx.sourcePath)?.frontmatter;
    if (!this.isPageNote(fm)) return;
    const sups = el.querySelectorAll("sup.footnote-ref, sup[data-footnote-id]");
    if (!sups.length) return;
    const info = ctx.getSectionInfo(el);
    if (!info) return;
    const block = info.text.split("\n").slice(info.lineStart, info.lineEnd + 1).join("\n");
    const labels = footnoteRefs(block);
    const defs = footnoteDefs(info.text);
    sups.forEach((sup, i) => {
      const md = labels[i] != null ? defs.get(labels[i]) : void 0;
      if (md === void 0) return;
      const note = createSpan({ cls: "isfahan-sidenote" });
      const n = sup.textContent.match(/\d+/)?.[0] ?? String(i + 1);
      note.dataset.n = n;
      const link = sup.querySelector("a");
      if (link) link.textContent = n;
      if (/^\s*\*\*[^*]+\*\*/.test(md)) note.addClass("is-gloss");
      else if (/\]\(vscode:\/\//.test(md)) note.addClass("is-ref");
      const child = new import_obsidian.MarkdownRenderChild(note);
      ctx.addChild(child);
      sup.after(note);
      import_obsidian.MarkdownRenderer.render(this.app, md, note, ctx.sourcePath, child).then(() => {
        const only = note.childElementCount === 1 ? note.firstElementChild : null;
        if (only?.tagName === "P") only.replaceWith(...only.childNodes);
      });
    });
  },
  // Page mode: the drop cap goes on the note's opening paragraph, the first
  // one straight after a ## heading; readingMarks finds its line.
  dropCap(el, ctx) {
    if (!this.pageActive()) return;
    const p = el.firstElementChild;
    if (p?.tagName !== "P") return;
    const file = this.app.vault.getAbstractFileByPath(ctx.sourcePath);
    const cache = file instanceof import_obsidian.TFile ? this.app.metadataCache.getFileCache(file) : null;
    if (!this.isPageNote(cache?.frontmatter)) return;
    const info = ctx.getSectionInfo(el);
    const { dropLine } = readingMarks(cache);
    if (info && dropLine !== null && info.lineStart === dropLine) p.addClass("isfahan-dropcap");
  },
  // Page state comes in bursts (two or three events per tab switch, one per
  // autosave while typing), so the events are gathered into one pass a
  // moment later. "active" redoes the note in front and the explorer badges;
  // "all" also every open note's date title and the new tabs.
  queuePageState(scope = "all") {
    this.pageScope = this.pageScope === "all" || scope === "all" ? "all" : "active";
    if (this.pageTimer) return;
    this.pageTimer = this.later(() => {
      const sc = this.pageScope;
      this.pageTimer = null;
      this.pageScope = null;
      this.updatePageState(sc);
    }, 50);
  },
  // Quiet chrome + progress line follow whichever page note is being read.
  updatePageState(scope = "all") {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (scope === "all") {
      this.markNotesColumn();
      this.markNewTabs();
    } else if (view) this.markNotesColumn(view.leaf);
    const reading = !!view && view.getMode() === "preview" && this.pageActive() && this.isPageFile(view.file);
    document.body.toggleClass("isfahan-reading-page", reading && this.settings.quietChrome);
    this.trackProgress(reading ? view : null);
  },
  // A note with footnotes keeps its margin column; one without gets the
  // centered column (styles.css). A class on the reading view, from
  // Obsidian's index, in place of a :has() over the whole view.
  markNotesColumn(onlyLeaf = null) {
    for (const leaf of onlyLeaf ? [onlyLeaf] : this.app.workspace.getLeavesOfType("markdown")) {
      const pv = leaf.view?.containerEl?.querySelector(".markdown-reading-view .markdown-preview-view");
      if (!pv || !leaf.view.file) continue;
      pv.toggleClass("isfahan-has-notes", readingMarks(this.app.metadataCache.getFileCache(leaf.view.file)).hasNotes);
    }
  },
  // A thin reading-progress line along the top of the note being read.
  trackProgress(view) {
    if (this.progress && this.progress.view === view) return;
    if (this.progress) {
      this.progress.scroller.removeEventListener("scroll", this.progress.onScroll);
      this.progress.bar.remove();
      this.progress = null;
    }
    const scroller = view?.previewMode?.containerEl?.querySelector(".markdown-preview-view");
    if (!scroller) return;
    const bar = view.contentEl.createDiv({ cls: "isfahan-progress" });
    let queued = false;
    const paint = () => {
      queued = false;
      const max = scroller.scrollHeight - scroller.clientHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scroller.scrollTop / max) : 0})`;
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        window.requestAnimationFrame(paint);
      }
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    paint();
    this.progress = { view, scroller, bar, onScroll };
  },
  // Reading view's wiring: the post-processors, and the page state redone on
  // tab switches, file opens and saves of the note in front (that note only)
  // and on layout changes, including reading/editing switches (everything).
  startReading() {
    this.registerMarkdownPostProcessor((el, ctx) => this.sidenotes(el, ctx));
    this.registerMarkdownPostProcessor((el, ctx) => this.dropCap(el, ctx));
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.queuePageState("active")));
    this.registerEvent(this.app.workspace.on("layout-change", () => this.queuePageState("all")));
    this.registerEvent(this.app.workspace.on("file-open", () => this.queuePageState("active")));
    this.registerEvent(
      this.app.metadataCache.on("changed", (file) => {
        if (file === this.app.workspace.getActiveFile()) this.queuePageState("active");
      })
    );
  },
  stopReading() {
    document.querySelectorAll(".isfahan-day-title").forEach((x) => x.remove());
    this.trackProgress(null);
    document.body.removeClass("isfahan-reading-page");
    this.rerenderPreviews();
  }
};

// src/sample.js
var import_obsidian2 = require("obsidian");
var SAMPLE_NAME = "Isfahan sample page";
var samplePage = (today) => `---
cssclasses: page
kind: Sample page
made: ${today}
tags:
  - isfahan
  - sample
---

## A page in Isfahan

This note shows what Isfahan does to a page. The plugin is named after the city in central Iran whose mosques gave it its colors: lapis and turquoise tile over warm brick.[^1] Switch to editing view to see how each part is written, then back to Reading view to see it as a page.

## Four phases

The colors follow the sun where you live. *Dawn* is warm paper, *Workday* crisp lapis, *Evening* deep indigo and gold, and *Night* midnight blue. Click the phase in the status bar to try one, or run **Follow the sun** to go back. ==Every phase keeps the page easy to read.==

| Phase | When | Mode |
|---|---|---|
| Dawn | the three hours after sunrise | light |
| Workday | from then until sunset | light |
| Evening | the two hours after sunset | dark |
| Night | from then until sunrise | dark |

> [!pull] Pull quote
> The tiles of Isfahan change with the light all day. Your vault can too.

## Margin notes

Footnotes move into the margin beside their line, the way a printed book sets them.[^2] In a narrow window they drop in under their paragraph instead.

> [!tip] Make any note a page
> Page mode covers every note unless you set it to page notes only. Then add \`page\` to a note's \`cssclasses\`, as this one has. Add \`no-page\` to keep a note plain.

> Isfahan is half the world.
>
> (An old Persian saying about the city.)

> [!mihrab] The arch
> A mihrab is the arched niche in a mosque wall. This callout borrows its shape.

## Try it

- [x] Open the sample page
- [ ] Click the phase in the status bar
- [ ] Pick a tile pattern in the settings
- [ ] Open a new tab to see the clock and the weather

Tagged #isfahan, so you can find this note again or delete it when you're done.

[^1]: Isfahan was the capital of Safavid Persia from 1598, when Shah Abbas I moved his court there.
[^2]: **Margin notes** that start with a bold word, like this one, read as a gloss.
`;
var Sample = {
  // A new note beside the user's other new notes, numbered if the name is
  // taken, opened in Reading view so Page mode shows at once.
  async createSamplePage() {
    const parent = this.app.fileManager.getNewFileParent("");
    const dir = parent.path === "/" ? "" : `${parent.path}/`;
    let path = `${dir}${SAMPLE_NAME}.md`;
    for (let n = 2; this.app.vault.getAbstractFileByPath(path); n++) path = `${dir}${SAMPLE_NAME} ${n}.md`;
    let file;
    try {
      file = await this.app.vault.create(path, samplePage(ymdOf(/* @__PURE__ */ new Date())));
    } catch (e) {
      new import_obsidian2.Notice(`Couldn't create the sample page: ${e.message}`);
      return;
    }
    if (!(file instanceof import_obsidian2.TFile)) return;
    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.openFile(file, { active: true, state: { mode: "preview" } });
  },
  registerSampleCommand() {
    this.addCommand({ id: "create-sample-page", name: "Create a sample page", callback: () => this.createSamplePage() });
  }
};

// src/newtab/launcher.js
var import_obsidian4 = require("obsidian");

// src/compat.js
var import_obsidian3 = require("obsidian");
var OPEN_SETTINGS = { id: "app:open-settings", name: "Open settings" };
var COMMANDS = {
  newNote: { id: "file-explorer:new-file", name: "New note" },
  findNote: { id: "switcher:open", name: "Quick switcher" },
  settings: OPEN_SETTINGS
};
var omnisearch = () => globalThis.omnisearch ?? null;
function runCommand(app, cmd, missing = null) {
  const id = typeof cmd === "string" ? cmd : cmd.id;
  if (app.commands?.executeCommandById?.(id)) return true;
  new import_obsidian3.Notice(missing ?? `Isfahan: the command "${typeof cmd === "string" ? cmd : cmd.name}" isn't available.`, 8e3);
  return false;
}
function userPrefersDark(app, before) {
  if (typeof app.vault.getConfig === "function") {
    const theme = app.vault.getConfig("theme");
    return theme === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches : theme !== "moonstone";
  }
  if (typeof before === "boolean") return before;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function openPluginSettings(app, id) {
  if (typeof app.setting?.openTabById === "function") {
    app.setting.open();
    app.setting.openTabById(id);
    return;
  }
  runCommand(app, OPEN_SETTINGS);
}

// src/core/weather.js
var WEATHER_TTL = 30 * 60 * 1e3;
var WEATHER_STALE = 3 * 3600 * 1e3;
var WEATHER_GONE = 24 * 3600 * 1e3;
var RAIN_SHOWN = 30;
function rainText(hours2, now) {
  const from = now.getTime() - 36e5;
  const win = (hours2 || []).filter((h) => h.t.getTime() > from && h.rain != null).slice(0, 13);
  const best = win.reduce((a, h) => h.rain > (a?.rain ?? -1) ? h : a, null);
  if (!best) return "";
  if (best.rain < RAIN_SHOWN) return win.every((h) => h.temp <= 0) ? "No snow" : "No rain";
  const when = best.t.getTime() <= now.getTime() ? "now" : `at ${hhmm(best.t)}`;
  return `${best.rain}% ${best.temp <= 0 ? "snow" : "rain"} ${when}`;
}
function weatherLook(code, day) {
  const c = Number(code);
  if (c === 0) return { text: "Clear", icon: day ? "sun" : "moon", kind: "clear" };
  if (c === 1 || c === 2) return { text: c === 1 ? "Mostly clear" : "Partly cloudy", icon: day ? "cloud-sun" : "cloud-moon", kind: "partly" };
  if (c === 3) return { text: "Cloudy", icon: "cloud", kind: "cloudy" };
  if (c === 45 || c === 48) return { text: "Fog", icon: "cloud-fog", kind: "fog" };
  if (c >= 51 && c <= 57) return { text: "Drizzle", icon: "cloud-drizzle", kind: "rain" };
  if (c >= 61 && c <= 67 || c >= 80 && c <= 82) return { text: c >= 80 ? "Showers" : "Rain", icon: "cloud-rain", kind: "rain" };
  if (c >= 71 && c <= 77 || c === 85 || c === 86) return { text: "Snow", icon: "cloud-snow", kind: "snow" };
  if (c >= 95) return { text: "Thunderstorms", icon: "cloud-lightning", kind: "storm" };
  return { text: "", icon: "cloud", kind: "cloudy" };
}

// src/ui.js
function pressable(el) {
  if (!el || el.tagName === "BUTTON" || el.tagName === "A" && el.hasAttribute("href")) return el;
  el.tabIndex = 0;
  if (!el.getAttribute("role")) el.setAttribute("role", "button");
  el.addEventListener("keydown", (e) => {
    if (e.target !== el || e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    el.click();
  });
  return el;
}

// src/newtab/launcher.js
var LAUNCH_RECENT = 5;
var LAUNCH_RESULTS = 7;
var SVG_NS = "http://www.w3.org/2000/svg";
var svgEl = (tag, attrs = {}) => {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
};
var folderOf = (p) => p.includes("/") ? p.slice(0, p.lastIndexOf("/")).split("/").pop() : "";
var NewTab = {
  newTabOn() {
    return this.settings.enabled && this.settings.newTab;
  },
  // Every empty tab gets the new tab while it's on; off gives Obsidian's own
  // page back. Runs on every tab switch, so the date and the recent list
  // stay current.
  markNewTabs() {
    for (const leaf of this.app.workspace.getLeavesOfType("empty")) {
      const host = leaf.view?.contentEl;
      if (!host) continue;
      let l = this.launcherOf(host);
      if (!this.newTabOn()) {
        if (l) {
          l.el.remove();
          this.clearSky(leaf);
        }
        continue;
      }
      if (!l) {
        host.querySelector(":scope > .isfahan-launcher")?.remove();
        l = this.buildLauncher(leaf, host);
      }
      this.fillLauncher(l);
    }
  },
  // A tab's launcher: its state (the parts it fills, what was last drawn),
  // kept apart from the page, keyed by its element, and gone with it.
  launcherOf(host) {
    const el = host?.querySelector(":scope > .isfahan-launcher");
    return el && this.launchers?.get(el) || null;
  },
  buildLauncher(leaf, host) {
    const el = host.createDiv({ cls: "isfahan-launcher" });
    const l = { el, isfahanLeaf: leaf };
    (this.launchers ??= /* @__PURE__ */ new WeakMap()).set(el, l);
    const pane = leaf.view?.containerEl;
    pane?.addClass("isfahan-newtab-pane");
    if (pane && !pane.querySelector(":scope > .il-sky")) {
      const sky = pane.createDiv({ cls: "il-sky" });
      for (const k of ["a", "b", "c", "d", "e", "f"]) sky.createDiv({ cls: `il-sky-${k}` });
    }
    el.addClass("il-enter");
    this.later(() => el.removeClass("il-enter"), 1400);
    const top = el.createDiv({ cls: "il-top" });
    l.clockEl = top.createDiv({ cls: "il-clock-wrap" }).createDiv({ cls: "il-clock" });
    const head = top.createDiv({ cls: "il-head" });
    l.dateEl = head.createSpan({ cls: "il-date" });
    l.phaseEl = head.createSpan({ cls: "il-phase" });
    l.weatherEl = top.createDiv({ cls: "il-weather is-empty" });
    l.hoursEl = top.createDiv({ cls: "il-hours is-empty" });
    const isl = el.createDiv({ cls: "il-island" });
    const box = isl.createDiv({ cls: "il-search" });
    (0, import_obsidian4.setIcon)(box.createSpan({ cls: "il-search-icon" }), "search");
    const input = box.createEl("input", { cls: "il-input", attr: { type: "search", placeholder: "Search the vault…", spellcheck: "false" } });
    l.resultsEl = isl.createDiv({ cls: "il-results" });
    l.homeEl = isl.createDiv({ cls: "il-home" });
    l.recentEl = l.homeEl.createDiv({ cls: "il-recent" });
    const acts = isl.createDiv({ cls: "il-actions" });
    for (const [icon, text, key, fn] of [
      ["square-pen", "New note", "⌘N", () => runCommand(this.app, COMMANDS.newNote)],
      ["file-search", "Find a note", "⌘O", () => runCommand(this.app, COMMANDS.findNote)],
      ["settings", "Settings", "⌘,", () => runCommand(this.app, COMMANDS.settings)],
      ["x", "Close", "", () => leaf.detach()]
    ]) {
      const b = acts.createEl("button", { cls: "il-action" });
      (0, import_obsidian4.setIcon)(b.createSpan({ cls: "il-action-icon" }), icon);
      b.createSpan({ text });
      if (key) b.createSpan({ cls: "il-key", text: key });
      b.onclick = fn;
    }
    let seq = 0, timer = null;
    l.items = [];
    l.sel = 0;
    const run = async () => {
      const q = input.value.trim();
      const mine = ++seq;
      el.toggleClass("is-searching", !!q);
      if (!q) {
        l.items = [];
        l.resultsEl.empty();
        return;
      }
      const items = await this.launcherSearch(q);
      if (mine !== seq) return;
      l.items = items;
      l.sel = 0;
      this.paintResults(l);
    };
    input.addEventListener("input", () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(run, 150);
    });
    input.addEventListener("keydown", (e) => {
      const n = l.items.length;
      if ((e.key === "ArrowDown" || e.key === "ArrowUp") && n) {
        e.preventDefault();
        l.sel = (l.sel + (e.key === "ArrowDown" ? 1 : -1) + n) % n;
        this.paintResults(l);
      } else if (e.key === "Enter" && l.items[l.sel]) {
        e.preventDefault();
        this.openFromLauncher(leaf, l.items[l.sel], e.metaKey || e.ctrlKey);
      } else if (e.key === "Escape" && input.value) {
        e.preventDefault();
        input.value = "";
        run();
      }
    });
    return l;
  },
  // The new tabs on screen: in a visible pane, with Obsidian in front.
  // Background tabs and a hidden window aren't redrawn; switching to a tab
  // fills it (markNewTabs).
  visibleLaunchers() {
    if (document.hidden || !document.hasFocus()) return [];
    const out = [];
    for (const leaf of this.app.workspace.getLeavesOfType("empty")) {
      const host = leaf.view?.contentEl;
      const l = this.launcherOf(host);
      if (l && (host.isShown ? host.isShown() : host.offsetParent !== null)) out.push(l);
    }
    return out;
  },
  fillVisibleLaunchers() {
    for (const l of this.visibleLaunchers()) this.fillLauncher(l);
  },
  queueLauncherFill() {
    if (this.fillTimer) return;
    this.fillTimer = this.later(() => {
      this.fillTimer = null;
      this.fillVisibleLaunchers();
    }, 500);
  },
  minuteTick() {
    this.fillVisibleLaunchers();
    this.later(() => this.minuteTick(), 6e4 - Date.now() % 6e4 + 50);
  },
  fillLauncher(l) {
    const now = /* @__PURE__ */ new Date();
    const clock = hhmm(now);
    if (l.clockEl.textContent !== clock) l.clockEl.textContent = clock;
    this.paintWeather(l);
    this.refreshWeather();
    const date = longDate(now);
    if (l.dateEl.textContent !== date) l.dateEl.textContent = date;
    const phase = this.phase().name;
    if (l.phaseEl.textContent !== phase) l.phaseEl.textContent = phase;
    this.paintHours(l, now);
    const pane = l.isfahanLeaf?.view?.containerEl;
    if (pane) pane.dataset.ilMorning = now.getHours() < 12 ? "1" : "0";
    const recent = this.app.workspace.getLastOpenFiles().map((p) => this.app.vault.getAbstractFileByPath(p)).filter((f) => f instanceof import_obsidian4.TFile).slice(0, LAUNCH_RECENT);
    const key = recent.map((f) => f.path).join("|");
    if (l.recentKey === key) return;
    l.recentKey = key;
    l.recentEl.empty();
    if (!recent.length) return;
    l.recentEl.createDiv({ cls: "il-label", text: "Recent" });
    for (const f of recent) {
      this.launcherRow(l.recentEl, { path: f.path, title: f.basename }).onclick = (e) => this.openFromLauncher(l.isfahanLeaf, { path: f.path }, e.metaKey || e.ctrlKey);
    }
  },
  clearSky(leaf) {
    const pane = leaf.view?.containerEl;
    if (!pane) return;
    pane.querySelector(":scope > .il-sky")?.remove();
    pane.removeClass("isfahan-newtab-pane");
    delete pane.dataset.ilWeather;
    delete pane.dataset.ilDaylight;
    delete pane.dataset.ilMorning;
  },
  // The next 12 hours: one rounded bar per hour in a pressed well, taller
  // and a stronger gold for the warmer hours of this window, the current
  // hour lit, and a sun mark under the hour of a sunrise or sunset.
  paintHours(l, now) {
    const w = this.weatherNow();
    const hrs = (w?.hours || []).filter((h) => h.t >= new Date(now.getTime() - 36e5)).slice(0, 13);
    if (hrs.length < 4) {
      l.hoursEl.addClass("is-empty");
      return;
    }
    const cur = w.temp;
    const key = `${Math.round(cur)}|` + hrs.map((h) => `${h.t.getHours()}:${Math.round(h.temp)}`).join("|");
    if (l.hoursKey === key) return;
    l.hoursKey = key;
    l.hoursEl.removeClass("is-empty");
    l.hoursEl.empty();
    const W = 330, H = 84, pad = 6, top = 16, bot = 58;
    const temps = hrs.map((h) => h.temp), lo = Math.min(...temps) - 2, span = Math.max(Math.max(...temps) - lo, 4);
    const slot = (W - 2 * pad) / hrs.length, bw = slot * 0.52;
    const sunAt = [];
    for (const s of w.sun || []) for (const [when, name] of [[s.rise, "rise"], [s.set, "set"]]) sunAt.push({ when, name });
    const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true" });
    hrs.forEach((h, i) => {
      const f = (h.temp - lo) / span, ht = 6 + f * (bot - top - 6), x = pad + i * slot + (slot - bw) / 2, y = bot - ht, cx = x + bw / 2;
      const bar = svgEl("rect", { class: `il-hours-bar${i ? "" : " is-now"}`, x, y, width: bw, height: ht, rx: bw / 2 });
      bar.style.setProperty("--warm", `${Math.round(30 + f * 55)}%`);
      svg.appendChild(bar);
      if (!i) svg.appendChild(svgEl("rect", { class: "il-hours-halo", x: x - 3, y: y - 3, width: bw + 6, height: ht + 6, rx: bw / 2 + 3 }));
      if (i % 3 === 0) {
        const tv = svgEl("text", { class: `il-hours-temp${i ? "" : " is-now"}`, x: cx, y: y - 6, "text-anchor": "middle" });
        tv.textContent = `${Math.round(i || cur == null ? h.temp : cur)}°`;
        const tl = svgEl("text", { class: `il-hours-time${i ? "" : " is-now"}`, x: cx, y: H - 2, "text-anchor": "middle" });
        tl.textContent = i ? pad2(h.t.getHours()) : "now";
        svg.append(tv, tl);
      }
      for (const s of sunAt) if (s.when.getHours() === h.t.getHours() && s.when.toDateString() === h.t.toDateString()) {
        const g = svgEl("g", { class: `il-hours-sun il-hours-${s.name}`, transform: `translate(${cx.toFixed(1)},${bot + 9})` });
        g.append(svgEl("path", { d: "M-4,0 A4,4 0 0 1 4,0 Z" }), svgEl("line", { x1: -6, x2: 6, y1: 0.5, y2: 0.5 }));
        svg.appendChild(g);
      }
    });
    l.hoursEl.appendChild(svg);
    const inWindow = sunAt.filter((s) => s.when >= hrs[0].t && s.when < new Date(hrs.at(-1).t.getTime() + 36e5));
    const tip = ["Next 12 hours", ...inWindow.map((s) => `${s.name === "rise" ? "Sunrise" : "Sunset"} ${hhmm(s.when)}`)].join(" · ");
    (0, import_obsidian4.setTooltip)(l.hoursEl, tip, { delay: 300 });
  },
  // The forecast line, and with the "scene" weather setting the sky behind
  // the tab (data attributes the styles paint).
  paintWeather(l) {
    const w = this.weatherNow();
    const pane = l.isfahanLeaf?.view?.containerEl;
    if (pane) {
      const kind = w && this.settings.weather === "scene" ? weatherLook(w.code, w.day).kind : null;
      if (kind) {
        pane.dataset.ilWeather = kind;
        pane.dataset.ilDaylight = w.day ? "day" : "night";
      } else {
        delete pane.dataset.ilWeather;
        delete pane.dataset.ilDaylight;
      }
    }
    const rain = w ? rainText(w.hours, /* @__PURE__ */ new Date()) : "";
    const key = w ? `${w.temp}|${w.code}|${w.day}|${w.hi}|${w.lo}|${w.stale}|${getPlace().name}|${rain}` : "";
    if (l.weatherKey === key) return;
    l.weatherKey = key;
    l.weatherEl.empty();
    l.weatherEl.toggleClass("is-empty", !w);
    l.weatherEl.toggleClass("is-stale", !!w?.stale);
    if (!w) return;
    const look = weatherLook(w.code, w.day);
    (0, import_obsidian4.setIcon)(l.weatherEl.createSpan({ cls: "il-w-icon" }), look.icon);
    l.weatherEl.createSpan({ cls: "il-w-temp", text: `${Math.round(w.temp)}°` });
    if (look.text) l.weatherEl.createSpan({ text: look.text });
    l.weatherEl.createSpan({ cls: "il-w-sep", text: "·" });
    l.weatherEl.createSpan({ text: `H ${Math.round(w.hi)}° L ${Math.round(w.lo)}°` });
    if (rain) {
      l.weatherEl.createSpan({ cls: "il-w-sep", text: "·" });
      l.weatherEl.createSpan({ cls: "il-w-rain", text: rain });
    }
    l.weatherEl.createSpan({ cls: "il-w-sep", text: "·" });
    l.weatherEl.createSpan({ cls: "il-w-place", text: getPlace().name });
    if (w.stale) {
      l.weatherEl.createSpan({ cls: "il-w-sep", text: "·" });
      l.weatherEl.createSpan({ cls: "il-w-asof", text: `as of ${asOf(w.stale)}` });
    }
  },
  launcherRow(list, it) {
    const row = list.createDiv({ cls: "il-row" });
    row.createSpan({ cls: "il-row-title", text: it.title });
    const folder = folderOf(it.path);
    if (folder) row.createSpan({ cls: "il-row-area", text: folder });
    return pressable(row);
  },
  paintResults(l) {
    l.resultsEl.empty();
    if (!l.items.length) {
      l.resultsEl.createDiv({ cls: "il-empty", text: "No matches." });
      return;
    }
    l.items.forEach((it, i) => {
      const row = this.launcherRow(l.resultsEl, it);
      row.toggleClass("is-selected", i === l.sel);
      row.onclick = (e) => this.openFromLauncher(l.isfahanLeaf, it, e.metaKey || e.ctrlKey);
      row.onmousemove = () => {
        if (l.sel === i) return;
        l.sel = i;
        l.resultsEl.querySelectorAll(".il-row").forEach((r, k) => r.toggleClass("is-selected", k === i));
      };
    });
  },
  // Omnisearch's results when it's installed, else notes whose names match.
  async launcherSearch(q) {
    const api = omnisearch();
    if (api) {
      try {
        const res = await api.search(q);
        return (res ?? []).slice(0, LAUNCH_RESULTS).map((r) => ({ path: r.path, title: r.basename, match: r.matches?.[0] }));
      } catch (e) {
      }
    }
    const ql = q.toLowerCase();
    return this.app.vault.getMarkdownFiles().filter((f) => f.basename.toLowerCase().includes(ql)).sort((a, b) => b.stat.mtime - a.stat.mtime).slice(0, LAUNCH_RESULTS).map((f) => ({ path: f.path, title: f.basename }));
  },
  // Opens in the new tab itself (a fresh tab with Cmd), and for a search
  // result selects the first match.
  async openFromLauncher(leaf, it, newTab) {
    const file = this.app.vault.getAbstractFileByPath(it.path);
    if (!(file instanceof import_obsidian4.TFile)) return;
    const target = newTab ? this.app.workspace.getLeaf("tab") : leaf;
    await target.openFile(file, { active: true });
    const view = target.view, m = it.match;
    if (!m || !(view instanceof import_obsidian4.MarkdownView)) return;
    if (view.getMode() !== "source") {
      if (m.offset >= 0) view.setEphemeralState({ line: (await this.app.vault.cachedRead(file)).slice(0, m.offset).split("\n").length - 1 });
      return;
    }
    const ed = view.editor, text = ed.getValue(), w = String(m.match ?? "");
    let at = m.offset;
    if (!(at >= 0) || text.substr(at, w.length).toLowerCase() !== w.toLowerCase()) at = text.toLowerCase().indexOf(w.toLowerCase());
    if (at < 0 || !w) return;
    const from = ed.offsetToPos(at), to = ed.offsetToPos(at + w.length);
    ed.setSelection(from, to);
    ed.scrollIntoView({ from, to }, true);
  },
  startNewTab() {
    this.registerEvent(this.app.vault.on("modify", () => this.queueLauncherFill()));
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        if (leaf?.view?.getViewType?.() !== "empty") return;
        this.markNewTabs();
        leaf.view.contentEl?.querySelector(":scope > .isfahan-launcher .il-input")?.focus();
      })
    );
    this.app.workspace.onLayoutReady(() => {
      this.markNewTabs();
      this.minuteTick();
    });
    this.registerDomEvent(window, "focus", () => this.fillVisibleLaunchers());
  },
  stopNewTab() {
    for (const leaf of this.app.workspace.getLeavesOfType("empty")) {
      leaf.view?.contentEl?.querySelector(":scope > .isfahan-launcher")?.remove();
      this.clearSky(leaf);
    }
  }
};

// src/services/weather.js
var import_obsidian5 = require("obsidian");
async function findPlaces(name) {
  const r = await (0, import_obsidian5.requestUrl)({ url: `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5&language=en&format=json` });
  const round = (n) => Math.round(n * 1e4) / 1e4;
  return (r.json?.results || []).map((p) => ({
    name: p.name,
    label: [p.name, p.admin1, p.country].filter((x, i, a) => x && a.indexOf(x) === i).join(", "),
    lat: round(p.latitude),
    lon: round(p.longitude)
  }));
}
var WeatherService = {
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
    if (this.weatherFailedAt && this.weatherFailedWhere === where && Date.now() - this.weatherFailedAt < 5 * 60 * 1e3) return;
    this.weatherBusy = true;
    try {
      const q = `latitude=${getPlace().lat}&longitude=${getPlace().lon}&timezone=auto&timeformat=unixtime`;
      const r = await (0, import_obsidian5.requestUrl)({
        url: `https://api.open-meteo.com/v1/forecast?${q}&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&hourly=temperature_2m,precipitation_probability&forecast_days=2`
      });
      const j = r.json, c = j.current, d = j.daily, h = j.hourly;
      const sun = (d.sunrise || []).map((rise, i) => ({ rise: new Date(rise * 1e3), set: new Date(d.sunset[i] * 1e3) }));
      const hours2 = (h?.time || []).map((t, i) => ({ t: new Date(t * 1e3), temp: h.temperature_2m[i], rain: h.precipitation_probability?.[i] ?? null }));
      this.weather = {
        at: Date.now(),
        where,
        data: { temp: c.temperature_2m, code: c.weather_code, day: !!c.is_day, hi: d.temperature_2m_max[0], lo: d.temperature_2m_min[0], sun, hours: hours2 }
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
  }
};

// src/look/theme.js
var import_obsidian6 = require("obsidian");

// src/fonts/cormorant-garamond-latin-600-normal.woff2
var cormorant_garamond_latin_600_normal_default = "data:font/woff2;base64,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";

// src/fonts/cormorant-garamond-latin-500-italic.woff2
var cormorant_garamond_latin_500_italic_default = "data:font/woff2;base64,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";

// src/fonts/literata-latin-wght-normal.woff2
var literata_latin_wght_normal_default = "data:font/woff2;base64,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";

// src/fonts/literata-latin-wght-italic.woff2
var literata_latin_wght_italic_default = "data:font/woff2;base64,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";

// src/fonts.js
var FONT_URLS = {
  "cormorant-garamond-latin-600-normal.woff2": cormorant_garamond_latin_600_normal_default,
  "cormorant-garamond-latin-500-italic.woff2": cormorant_garamond_latin_500_italic_default,
  "literata-latin-wght-normal.woff2": literata_latin_wght_normal_default,
  "literata-latin-wght-italic.woff2": literata_latin_wght_italic_default
};

// src/look/theme.js
var TICK_MS = 60 * 1e3;
var ROSETTE = `<g fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round">
  <circle cx="50" cy="50" r="10"/>
  <path d="M50 10 L58 33 L50 40 L42 33 Z"/><path d="M50 90 L58 67 L50 60 L42 67 Z"/>
  <path d="M10 50 L33 42 L40 50 L33 58 Z"/><path d="M90 50 L67 42 L60 50 L67 58 Z"/>
  <path d="M22 22 L42 34.5 L41 41 L34.5 42 Z"/><path d="M78 78 L58 65.5 L59 59 L65.5 58 Z"/>
  <path d="M78 22 L65.5 42 L59 41 L58 34.5 Z"/><path d="M22 78 L34.5 58 L41 59 L42 65.5 Z"/>
</g>`;
var Theme = {
  // A phase picked in the status-bar menu holds until the next scheduled
  // change (holdUntil), then the sun takes over again; one picked in the
  // settings stays.
  phase() {
    const now = /* @__PURE__ */ new Date();
    if (this.settings.mode !== "auto" && this.settings.holdUntil && now.getTime() >= this.settings.holdUntil) {
      this.settings.mode = "auto";
      this.settings.holdUntil = null;
      this.saveData(this.settings);
    }
    if (this.settings.mode === "auto") return phaseAt(now);
    return PHASES.find((p) => p.id === this.settings.mode) ?? phaseAt(now);
  },
  apply() {
    const renderKey = `${this.settings.enabled}|${this.settings.pageMode}|${this.settings.pageScope}`;
    const rerender = this.renderKey !== void 0 && this.renderKey !== renderKey;
    this.renderKey = renderKey;
    const settingsKey = JSON.stringify(this.settings);
    const scope = this.settingsKey !== settingsKey ? "all" : "active";
    this.settingsKey = settingsKey;
    if (!this.settings.enabled) {
      this.clear();
      this.renderStatus(null);
      this.queuePageState(scope);
      if (rerender) this.rerenderPreviews();
      return;
    }
    const phase = this.phase();
    const body = document.body;
    this.applying = true;
    try {
      body.addClass("isfahan");
      for (const p of PHASES) body.toggleClass(`isfahan-${p.id}`, p === phase);
      body.toggleClass("isfahan-motifs", this.settings.motifs);
      for (const pt of PATTERNS) body.toggleClass(`isfahan-pattern-${pt.id}`, pt.id === this.settings.pattern && pt.id !== "girih");
      body.toggleClass("isfahan-serif", this.settings.serifHeadings);
      body.toggleClass("isfahan-pages", this.settings.pageMode);
      body.toggleClass("isfahan-pages-all", this.settings.pageMode && this.settings.pageScope === "all");
      for (const r of RIBBONS) body.toggleClass(`isfahan-props-${r.id}`, r.id === this.settings.propertyRibbon && r.id !== "off");
      const baseChanged = this.setBase(phase.dark);
      if (baseChanged || this.lastPhase !== phase.id) this.app.workspace.trigger("css-change");
      this.lastPhase = phase.id;
    } finally {
      this.applying = false;
    }
    this.renderStatus(phase);
    this.queuePageState(scope);
    if (rerender) this.rerenderPreviews();
  },
  // Remove every class and put back the user's own light/dark choice.
  clear() {
    const body = document.body;
    if (!body.hasClass("isfahan")) return;
    this.applying = true;
    try {
      body.removeClass(
        "isfahan",
        "isfahan-motifs",
        "isfahan-serif",
        "isfahan-pages",
        "isfahan-pages-all",
        ...RIBBONS.map((r) => `isfahan-props-${r.id}`),
        ...PATTERNS.map((pt) => `isfahan-pattern-${pt.id}`),
        ...PHASES.map((p) => `isfahan-${p.id}`)
      );
      this.setBase(userPrefersDark(this.app, this.darkBefore));
      this.lastPhase = null;
      this.app.workspace.trigger("css-change");
    } finally {
      this.applying = false;
    }
  },
  // Returns whether anything changed; callers announce it with css-change.
  setBase(dark) {
    const body = document.body;
    if (body.hasClass("theme-dark") === dark && body.hasClass("theme-light") === !dark) return false;
    body.toggleClass("theme-dark", dark);
    body.toggleClass("theme-light", !dark);
    return true;
  },
  rerenderPreviews() {
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      leaf.view?.previewMode?.rerender?.(true);
    }
  },
  fontFaces() {
    return FACES.map((f) => {
      const url = FONT_URLS[f.file];
      return `@font-face { font-family: "${f.family}"; src: url("${url}") format("woff2"); font-weight: 100 900; font-style: ${f.style ?? "normal"}; font-display: swap; unicode-range: ${f.range}; }`;
    }).join("\n");
  },
  renderStatus(phase) {
    const el = this.statusEl;
    if (!el) return;
    el.empty();
    (0, import_obsidian6.setIcon)(el.createSpan({ cls: "isfahan-status-icon" }), "isfahan-rosette");
    if (!phase) {
      el.createSpan({ text: "Isfahan off" });
      el.addClass("is-off");
      el.setAttr("aria-label", "Isfahan is off. Click to turn it on.");
      return;
    }
    el.removeClass("is-off");
    el.createSpan({ text: phase.name });
    const how = this.settings.mode === "auto" ? "following the sun" : this.settings.holdUntil ? `held until ${hhmm(new Date(this.settings.holdUntil))}` : "fixed";
    el.setAttr("aria-label", `Isfahan: ${phase.name} (${hours(phase)} today), ${how}. Click to change.`);
  },
  openMenu(evt) {
    const menu = new import_obsidian6.Menu();
    const { enabled, mode } = this.settings;
    menu.addItem(
      (i) => i.setTitle("Follow the sun").setChecked(enabled && mode === "auto").onClick(() => this.update({ enabled: true, mode: "auto", holdUntil: null }))
    );
    const until = nextPhaseChange(/* @__PURE__ */ new Date());
    for (const p of PHASES) {
      menu.addItem(
        (i) => i.setTitle(`${p.name} until ${hhmm(until)}`).setChecked(enabled && mode === p.id).onClick(() => this.update({ enabled: true, mode: p.id, holdUntil: until.getTime() }))
      );
    }
    menu.addSeparator();
    menu.addSeparator();
    menu.addItem((i) => i.setTitle("Isfahan settings").setIcon("settings").onClick(() => openPluginSettings(this.app, this.manifest.id)));
    menu.addItem(
      (i) => i.setTitle(enabled ? "Turn Isfahan off" : "Turn Isfahan on").onClick(() => this.update({ enabled: !enabled }))
    );
    menu.showAtMouseEvent(evt);
  },
  // The look's commands (Obsidian lists them as "Isfahan: …", so the names
  // leave the plugin's name out): on and off, follow the sun, the next tile
  // pattern and property ribbon, and each phase.
  registerLookCommands() {
    this.addCommand({
      id: "toggle",
      name: "Turn the look on or off",
      callback: () => this.update({ enabled: !this.settings.enabled })
    });
    this.addCommand({
      id: "follow-clock",
      name: "Follow the sun",
      callback: () => this.update({ enabled: true, mode: "auto", holdUntil: null })
    });
    this.addCommand({
      id: "cycle-tile-pattern",
      name: "Next tile pattern",
      callback: () => {
        const i = PATTERNS.findIndex((pt) => pt.id === this.settings.pattern);
        const next = PATTERNS[(i + 1) % PATTERNS.length];
        this.update({ pattern: next.id, motifs: true });
        new import_obsidian6.Notice(`Tile pattern: ${next.name}`);
      }
    });
    this.addCommand({
      id: "cycle-property-ribbon",
      name: "Next property ribbon style",
      callback: () => {
        const i = RIBBONS.findIndex((r) => r.id === this.settings.propertyRibbon);
        this.update({ propertyRibbon: RIBBONS[(i + 1) % RIBBONS.length].id });
      }
    });
    for (const p of PHASES) {
      this.addCommand({
        id: `use-${p.id}`,
        name: `Use ${p.name}`,
        callback: () => this.update({ enabled: true, mode: p.id })
      });
    }
  },
  // The look's wiring: the fonts, the status-bar item, the phase re-checked
  // every minute, and Obsidian's own light/dark reset undone.
  startTheme() {
    this.darkBefore = document.body.hasClass("theme-dark");
    (0, import_obsidian6.addIcon)("isfahan-rosette", ROSETTE);
    this.fontsEl = document.head.createEl("style", { attr: { id: "isfahan-fonts" } });
    this.fontsEl.textContent = this.fontFaces();
    this.statusEl = this.addStatusBarItem();
    this.statusEl.addClass("isfahan-status", "mod-clickable");
    this.registerDomEvent(this.statusEl, "click", (evt) => this.openMenu(evt));
    this.registerInterval(window.setInterval(() => this.apply(), TICK_MS));
    this.registerEvent(
      this.app.workspace.on("css-change", () => {
        if (!this.applying) this.apply();
      })
    );
  },
  stopTheme() {
    this.clear();
    this.fontsEl?.remove();
  }
};

// src/settings-tab.js
var import_obsidian7 = require("obsidian");
var IsfahanSettingTab = class extends import_obsidian7.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.matches = null;
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
      if (!found.length) {
        desc.setText(`Nothing found for "${name}". Try the town's name alone.`);
        return;
      }
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
    new import_obsidian7.Setting(containerEl).setName("Isfahan").setDesc("Off brings back your plain look and your own light/dark setting. The Turn the look on or off command does the same.").addToggle((t) => t.setValue(s.enabled).onChange((v) => this.plugin.update({ enabled: v })));
    new import_obsidian7.Setting(containerEl).setName("Sample page").setDesc("A new note that shows the look on a page: the property ribbon, the drop cap, margin notes, callouts, a quote and a table. Delete it whenever you like.").addButton((b) => b.setButtonText("Create").onClick(() => this.plugin.createSamplePage()));
    new import_obsidian7.Setting(containerEl).setName("Time of day").setDesc("Following the sun: light from sunrise to sunset (dawn, then workday), dark after (evening, then night). A phase picked here stays; one picked from the status bar holds until the next change.").addDropdown((d) => {
      d.addOption("auto", "Follow the sun");
      for (const p of PHASES) d.addOption(p.id, `${p.name} · ${hours(p)} today`);
      d.setValue(s.mode).onChange((v) => this.plugin.update({ mode: v, holdUntil: null }));
    });
    const place = new import_obsidian7.Setting(containerEl).setName("Place (sun and weather)");
    const desc = place.descEl.createSpan({ text: `Sunrise, sunset and the forecast are for ${s.place.label}. Type a town to change it; only the name is sent, to Open-Meteo.` });
    let input;
    place.addText((t) => {
      input = t.inputEl;
      t.setPlaceholder(s.place.name);
      t.inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.findPlace(t.getValue(), desc);
        }
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
    new import_obsidian7.Setting(containerEl).setName("Look").setHeading();
    new import_obsidian7.Setting(containerEl).setName("Serif headings").setDesc("Cormorant Garamond for the note title, H1 and H2.").addToggle((t) => t.setValue(s.serifHeadings).onChange((v) => this.plugin.update({ serifHeadings: v })));
    new import_obsidian7.Setting(containerEl).setName("Tile motifs").setDesc(
      "The tile band behind note titles, the lattice in the file explorer, diamond checkboxes, and the arch on [!mihrab] callouts. The colors change either way."
    ).addToggle((t) => t.setValue(s.motifs).onChange((v) => this.plugin.update({ motifs: v })));
    new import_obsidian7.Setting(containerEl).setName("Tile pattern").setDesc("The pattern those motifs use, everywhere at once. The Next tile pattern command cycles through them.").addDropdown((d) => {
      for (const pt of PATTERNS) d.addOption(pt.id, pt.name);
      d.setValue(s.pattern).onChange((v) => this.plugin.update({ pattern: v }));
    });
    new import_obsidian7.Setting(containerEl).setName("Property ribbon").setDesc("How the Properties block looks in Reading view: one line, in the phase colors. Editing view keeps Obsidian's normal list. The Next property ribbon style command cycles these.").addDropdown((d) => {
      for (const r of RIBBONS) d.addOption(r.id, r.name);
      d.setValue(s.propertyRibbon).onChange((v) => this.plugin.update({ propertyRibbon: v }));
    });
    new import_obsidian7.Setting(containerEl).setName("Reading").setHeading();
    new import_obsidian7.Setting(containerEl).setName("Page mode").setDesc(
      "Notes read like a printed page in Reading view: book typography, and footnotes moved into the margin beside their line. Editing stays normal."
    ).addToggle((t) => t.setValue(s.pageMode).onChange((v) => this.plugin.update({ pageMode: v })));
    new import_obsidian7.Setting(containerEl).setName("Page mode applies to").setDesc("All notes, except notes with `cssclasses: no-page`; or only notes with `cssclasses: page`.").addDropdown((d) => {
      d.addOption("all", "All notes");
      d.addOption("pages", "Page notes only");
      d.setValue(s.pageScope).onChange((v) => this.plugin.update({ pageScope: v }));
    });
    new import_obsidian7.Setting(containerEl).setName("Quiet chrome on pages").setDesc("While reading a page note, the sidebars, tabs and status bar fade until you hover over them.").addToggle((t) => t.setValue(s.quietChrome).onChange((v) => this.plugin.update({ quietChrome: v })));
    new import_obsidian7.Setting(containerEl).setName("New tab").setHeading();
    new import_obsidian7.Setting(containerEl).setName("Isfahan's new tab").setDesc("An empty tab shows the time, the date and the phase, the weather, a search over the vault and the notes you opened last. Off gives Obsidian's own empty tab back.").addToggle((t) => t.setValue(s.newTab).onChange((v) => this.change({ newTab: v })));
    new import_obsidian7.Setting(containerEl).setName("Weather").setDesc("The forecast line and the next 12 hours on the new tab, for the place above. Only its coordinates are sent, to Open-Meteo (free, no account). Text and sky also paints the weather behind the new tab.").setDisabled(!s.newTab).addDropdown((d) => {
      d.addOption("off", "Off (nothing is fetched)");
      d.addOption("text", "Text");
      d.addOption("scene", "Text and sky");
      d.setValue(s.weather).onChange((v) => this.plugin.update({ weather: v }));
      d.setDisabled(!s.newTab);
    });
  }
};

// src/public.js
var Isfahan = class extends import_obsidian8.Plugin {
  async onload() {
    const saved = await this.loadData();
    this.settings = cleanSettings(saved);
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
};
Object.assign(Isfahan.prototype, Base, Theme, Reading, NewTab, WeatherService, Sample);
var internals = {};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  internals
});

// Writes src/core/zone-table.js: every time zone in the tz database's
// zone.tab with the coordinates of its main city, so a new install can
// start at the user's own time-zone city without asking the network.
//   node tools/make-zones.mjs [zone.tab]   (default /usr/share/zoneinfo/zone.tab)
// The tz database is in the public domain.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = process.argv[2] || "/usr/share/zoneinfo/zone.tab";
// ISO 6709: ±DDMM or ±DDMMSS, then ±DDDMM or ±DDDMMSS.
const deg = (s, d) => {
  const sign = s[0] === "-" ? -1 : 1;
  const n = s.slice(1);
  const [D, M, S] = [n.slice(0, d), n.slice(d, d + 2), n.slice(d + 2) || "0"].map(Number);
  return Math.round(sign * (D + M / 60 + S / 3600) * 100) / 100;
};
const rows = readFileSync(src, "utf8").split("\n").filter((l) => l && !l.startsWith("#")).map((l) => {
  const [, coords, zone] = l.split("\t");
  const m = coords.match(/^([+-]\d+)([+-]\d+)$/);
  return `${zone} ${deg(m[1], 2)} ${deg(m[2], 3)}`;
}).sort();
writeFileSync(path.join(ROOT, "src/core/zone-table.js"), `// Made by tools/make-zones.mjs from the tz database's zone.tab (public
// domain): each time zone, and the latitude and longitude of its main city.
export const ZONE_TABLE = \`
${rows.join("\n")}
\`;
`);
console.log(`${rows.length} zones written`);

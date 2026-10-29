// The first place a new install starts at: its time zone's city.
import { test } from "node:test";
import assert from "node:assert/strict";
import { placeFromZone } from "../src/core/zones.js";

test("a time zone gives its main city, marked as guessed", () => {
  assert.deepEqual(placeFromZone("Europe/Berlin", -60), { name: "Berlin", label: "Berlin (your time zone)", lat: 52.5, lon: 13.37, guessed: true });
  assert.equal(placeFromZone("America/New_York", 240).name, "New York");
});

test("older and moved zone names still find their city", () => {
  assert.equal(placeFromZone("Asia/Calcutta", -330).name, "Kolkata");
  assert.equal(placeFromZone("America/Indianapolis", 300).name, "Indianapolis");
  assert.equal(placeFromZone("America/Buenos_Aires", 180).name, "Buenos Aires");
});

test("an unknown zone falls back to the clock's offset from UTC", () => {
  assert.deepEqual(placeFromZone("UTC", 0), { name: "UTC", label: "UTC (your clock)", lat: 45, lon: 0, guessed: true });
  assert.equal(placeFromZone("Etc/GMT-3", -180).lon, 45);
  assert.equal(placeFromZone(null, 300).name, "UTC−5");
});

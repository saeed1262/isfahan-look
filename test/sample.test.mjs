// The sample page: every part it promises is in it, and it's English only.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { footnoteDefs, footnoteRefs } from "../src/core/notes.js";

// sample.js imports from "obsidian", so the note's text is read from the source.
const src = readFileSync(new URL("../src/sample.js", import.meta.url), "utf8");
const note = src.match(/export const samplePage = \(today\) => `([\s\S]*?)`;\n/)[1].replace("${today}", "2026-10-29").replaceAll("\\`", "`");

test("the sample page shows each part of the look", () => {
  assert.match(note, /^---\ncssclasses: page\n[\s\S]*?\n---\n\n## /, "frontmatter, then a ## heading for the drop cap");
  assert.deepEqual(footnoteRefs(note), ["1", "2"]);
  assert.deepEqual([...footnoteDefs(note).keys()], ["1", "2"]);
  for (const part of ["> [!pull]", "> [!tip]", "> [!mihrab]", "- [x] ", "- [ ] ", "|---|", "==", "#isfahan"]) assert.ok(note.includes(part), part);
});

test("the sample page is in English only", () => {
  assert.doesNotMatch(note, /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/);
});

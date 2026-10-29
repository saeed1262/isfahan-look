// Readers of note text for Page mode: footnotes, and where the drop cap goes.
// Plain logic, nothing from Obsidian: the tests import it directly.

// Footnote labels referenced in a block of markdown, in reading order.
// Definitions ("[^x]: ...") are not references, and code is stripped first
// so a literal "[^x]" inside it doesn't shift the count. An inline footnote
// (^[...]) still takes a slot, as null: it renders as a numbered ref too,
// but Page mode leaves it where it is.
export function footnoteRefs(src) {
  const clean = src.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
  const out = [];
  const re = /\[\^([^\]\s]+)\](?!:)|\^\[/g;
  let m;
  while ((m = re.exec(clean))) out.push(m[1] ?? null);
  return out;
}

// Footnote definitions in the whole note: label -> its (one-line) markdown.
export function footnoteDefs(src) {
  const defs = new Map();
  for (const m of src.matchAll(/^\[\^([^\]\s]+)\]:[ \t]?(.*)$/gm)) defs.set(m[1], m[2]);
  return defs;
}

// From Obsidian's own index of a note (no file read): whether it has
// footnotes (the margin column needs them), and the line its drop cap goes
// on: the first paragraph straight after a ## heading, or null. Replaces two
// :has() rules in styles.css that cost more the longer the note.
export function readingMarks(cache) {
  const secs = cache?.sections ?? [];
  const h2 = new Set((cache?.headings ?? []).filter((h) => h.level === 2).map((h) => h.position.start.line));
  let dropLine = null;
  for (let i = 0; i + 1 < secs.length; i++) {
    if (secs[i].type === "heading" && h2.has(secs[i].position.start.line) && secs[i + 1].type === "paragraph") { dropLine = secs[i + 1].position.start.line; break; }
  }
  return { hasNotes: !!(cache?.footnoteRefs?.length || cache?.footnotes?.length), dropLine };
}

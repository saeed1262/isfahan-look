// Text helpers: a note's frontmatter classes.
// Plain logic, nothing from Obsidian: the tests import it directly.

export function frontmatterClasses(fm) {
  const c = fm?.cssclasses ?? fm?.cssclass;
  if (Array.isArray(c)) return c.map(String);
  if (typeof c === "string") return c.split(/[\s,]+/);
  return [];
}

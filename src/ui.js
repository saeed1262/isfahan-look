// Small UI helpers shared by the parts.

// Makes a clickable element that isn't a button reachable and usable from
// the keyboard: in the tab order, with a role, Enter and Space clicking it.
export function pressable(el) {
  if (!el || el.tagName === "BUTTON" || (el.tagName === "A" && el.hasAttribute("href"))) return el;
  el.tabIndex = 0;
  if (!el.getAttribute("role")) el.setAttribute("role", "button");
  el.addEventListener("keydown", (e) => {
    if (e.target !== el || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault();
    el.click();
  });
  return el;
}

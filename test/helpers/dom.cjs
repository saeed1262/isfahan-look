// A stand-in for Obsidian's window: jsdom, with the element helpers Obsidian
// adds (createDiv, setText, toggleClass and the like), for loading the
// plugin outside Obsidian. jsdom from the repository's node_modules, else
// from ISFAHAN_TEST_DEPS.
const os = require("os"), path = require("path");
function jsdom() {
  for (const dir of [path.join(__dirname, "../../node_modules"), process.env.ISFAHAN_TEST_DEPS || path.join(os.homedir(), ".cache/isfahan-guide/node_modules")]) {
    try { return require(path.join(dir, "jsdom")); } catch { /* try the next */ }
  }
  return null;
}
const lib = jsdom();
function makeWindow() {
  const { window } = new lib.JSDOM("<!doctype html><html><head></head><body></body></html>", { url: "https://x.test/", pretendToBeVisual: true });
  const { document } = window;
  const mk = (parent, tag, o = {}) => {
    const e = document.createElement(tag);
    if (typeof o === "string") o = { cls: o };
    if (o.cls) e.className = Array.isArray(o.cls) ? o.cls.filter(Boolean).join(" ") : o.cls;
    if (o.text != null) e.textContent = o.text;
    for (const [k, v] of Object.entries(o.attr || {})) e.setAttribute(k, v);
    parent.appendChild(e);
    return e;
  };
  for (const proto of [window.HTMLElement.prototype, window.DocumentFragment.prototype, window.SVGElement.prototype]) {
    proto.createDiv = function (o) { return mk(this, "div", o); };
    proto.createSpan = function (o) { return mk(this, "span", o); };
    proto.createEl = function (t, o) { return mk(this, t, o); };
  }
  for (const proto of [window.HTMLElement.prototype, window.SVGElement.prototype]) {
    proto.setText = function (t) { this.textContent = t; };
    proto.addClass = function (...c) { this.classList.add(...c.flatMap((x) => String(x).split(" ").filter(Boolean))); };
    proto.removeClass = function (...c) { this.classList.remove(...c); };
    proto.toggleClass = function (c, v) { this.classList.toggle(c, !!v); };
    proto.hasClass = function (c) { return this.classList.contains(c); };
    proto.empty = function () { this.innerHTML = ""; };
    proto.appendText = function (t) { this.appendChild(document.createTextNode(t)); };
    proto.setAttr = function (k, v) { this.setAttribute(k, v); };
  }
  window.createDiv = (o) => mk(document.createDocumentFragment(), "div", o);
  return { window, document };
}
module.exports = { available: !!lib, makeWindow };

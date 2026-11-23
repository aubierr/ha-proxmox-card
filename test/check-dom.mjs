// Checks the in-place DOM update of the card (patchChildren): it must change only what differs, keep every
// unchanged node (icons, focus, scroll anchors) and leave custom elements' own content alone.
// Node has no DOM, so a minimal one is built here (only what patchChildren uses).
// Usage: node test/check-dom.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const src = readFileSync(new URL("../dist/proxmox-card.js", import.meta.url), "utf8");
const a = src.indexOf("function patchChildren");
const b = src.indexOf("function fmtDate");
if (a < 0 || b < 0) throw new Error("patchChildren not found in dist/proxmox-card.js");

class FakeNode {
  constructor(type, name, value = null) {
    this.nodeType = type; this.localName = name; this.nodeName = type === 1 ? name.toUpperCase() : name;
    this.nodeValue = value; this.childNodes = []; this.attrs = new Map();
  }
  get attributes() { return [...this.attrs].map(([name, value]) => ({ name, value })); }
  get lastChild() { return this.childNodes[this.childNodes.length - 1]; }
  getAttribute(n) { return this.attrs.has(n) ? this.attrs.get(n) : null; }
  setAttribute(n, v) { this.attrs.set(n, String(v)); }
  hasAttribute(n) { return this.attrs.has(n); }
  removeAttribute(n) { this.attrs.delete(n); }
  appendChild(c) { this.childNodes.push(c); return c; }
  removeChild(c) { this.childNodes.splice(this.childNodes.indexOf(c), 1); return c; }
  replaceChild(n, o) { this.childNodes[this.childNodes.indexOf(o)] = n; return o; }
  clone() {
    const c = new FakeNode(this.nodeType, this.localName, this.nodeValue);
    for (const [k, v] of this.attrs) c.attrs.set(k, v);
    c.childNodes = this.childNodes.map((x) => x.clone());
    return c;
  }
}
const el = (name, attrs = {}, ...kids) => { const n = new FakeNode(1, name); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); n.childNodes = kids; return n; };
const tx = (v) => new FakeNode(3, "#text", v);
const frag = (...kids) => el("#fragment", {}, ...kids);
const document = { importNode: (n) => n.clone() };
const { patchChildren } = new Function("document", `${src.slice(a, b)}; return { patchChildren };`)(document);

// 1. a changed text keeps its element (and the element keeps its identity)
let root = frag(el("div", { class: "g" }, el("b", {}, tx("23%"))));
let div = root.childNodes[0], b0 = div.childNodes[0], t = b0.childNodes[0];
patchChildren(root, frag(el("div", { class: "g" }, el("b", {}, tx("24%")))));
assert.equal(root.childNodes[0], div); assert.equal(div.childNodes[0], b0); assert.equal(b0.childNodes[0], t);
assert.equal(t.nodeValue, "24%");

// 2. attributes: changed, added, removed on a normal element
root = frag(el("div", { class: "g off", title: "x", "data-old": "1" }));
div = root.childNodes[0];
patchChildren(root, frag(el("div", { class: "g", title: "x", "aria-label": "y" })));
assert.equal(root.childNodes[0], div);
assert.equal(div.getAttribute("class"), "g"); assert.equal(div.getAttribute("aria-label"), "y"); assert.equal(div.hasAttribute("data-old"), false);

// 3. custom elements: their own attributes and their rendered content survive an update with an empty template
const icon = el("ha-icon", { icon: "mdi:server", "data-drawn": "1" }, el("svg", {}, el("path", { d: "M0" })));
root = frag(el("span", {}, icon));
patchChildren(root, frag(el("span", {}, el("ha-icon", { icon: "mdi:server" }))));
assert.equal(root.childNodes[0].childNodes[0], icon);
assert.equal(icon.getAttribute("data-drawn"), "1");
assert.equal(icon.childNodes.length, 1);
patchChildren(root, frag(el("span", {}, el("ha-icon", { icon: "mdi:power" }))));
assert.equal(icon.getAttribute("icon"), "mdi:power"); // attribute change still applied, same element

// 4. lists: extra children removed, new ones appended, existing ones kept
root = frag(el("ul", {}, el("li", {}, tx("a")), el("li", {}, tx("b")), el("li", {}, tx("c"))));
const ul = root.childNodes[0], first = ul.childNodes[0];
patchChildren(root, frag(el("ul", {}, el("li", {}, tx("a")))));
assert.equal(ul.childNodes.length, 1); assert.equal(ul.childNodes[0], first);
patchChildren(root, frag(el("ul", {}, el("li", {}, tx("a")), el("li", {}, tx("d")))));
assert.equal(ul.childNodes.length, 2); assert.equal(ul.childNodes[1].childNodes[0].nodeValue, "d");

// 5. a different element type (or text instead of an element) is replaced
root = frag(el("div", {}, el("span", {}, tx("x"))));
patchChildren(root, frag(el("div", {}, el("b", {}, tx("x")))));
assert.equal(root.childNodes[0].childNodes[0].localName, "b");
patchChildren(root, frag(el("div", {}, tx("plain"))));
assert.equal(root.childNodes[0].childNodes[0].nodeType, 3);

// 6. the template is never modified (its nodes are cloned, not moved)
const tpl = frag(el("p", {}, tx("t")));
patchChildren(frag(), tpl);
assert.equal(tpl.childNodes.length, 1);

console.log("✓ DOM update checks passed");

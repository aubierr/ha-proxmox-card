// Checks that every language of the card and of the editor defines all the texts.
// Usage: node test/check-i18n.mjs
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../dist/proxmox-card.js", import.meta.url), "utf8");
const a = src.indexOf("const STRING_KEYS");
const b = src.indexOf("const LANGUAGES");
const c = src.indexOf("const EDITOR_KEYS");
const d = src.indexOf("\n});\n", src.indexOf("const EDITOR_LABELS")) + 5;
if ([a, b, c, d].some((i) => i < 0)) throw new Error("i18n blocks not found in dist/proxmox-card.js");

const { STRINGS, EDITOR_LABELS, STRING_KEYS, EDITOR_KEYS, PLURALS, PLURAL_KEYS, PLURAL_CATS } = new Function(`${src.slice(a, b)}${src.slice(c, d)}; return { STRINGS, EDITOR_LABELS, STRING_KEYS, EDITOR_KEYS, PLURALS, PLURAL_KEYS, PLURAL_CATS };`)();

let errors = 0;
for (const [name, table, keys] of [["card", STRINGS, STRING_KEYS], ["editor", EDITOR_LABELS, EDITOR_KEYS]]) {
  const langs = Object.keys(table);
  for (const lang of langs) {
    const missing = keys.filter((k) => typeof table[lang][k] !== "string" || table[lang][k].trim() === "");
    if (missing.length) { errors++; console.error(`✗ ${name}/${lang}: missing ${missing.join(", ")}`); }
  }
  // the editor must have exactly the same languages as the card
  console.log(`${name}: ${langs.length} languages, ${keys.length} texts each`);
}
if (Object.keys(STRINGS).join() !== Object.keys(EDITOR_LABELS).join()) { errors++; console.error("✗ the card and the editor do not have the same languages"); }
// plural forms: every language, every counted text, and as many forms as the language has categories (1 = no plural)
if (Object.keys(PLURALS).join() !== Object.keys(STRINGS).join()) { errors++; console.error("✗ the plural forms do not cover the same languages"); }
for (const [lang, table] of Object.entries(PLURALS)) {
  for (const k of PLURAL_KEYS) {
    const f = table[k], n = (PLURAL_CATS[lang] || ["one", "other"]).length;
    if (!Array.isArray(f) || !f.every((x) => typeof x === "string" && x.trim()) || (f.length !== 1 && f.length !== n)) { errors++; console.error(`✗ plural/${lang}: ${k} must have 1 or ${n} forms`); }
  }
  // the categories the language really uses for whole numbers must all be covered by PLURAL_CATS
  const used = new Set(Array.from({ length: 200 }, (_, i) => new Intl.PluralRules(lang).select(i)));
  const cats = PLURAL_CATS[lang] || ["one", "other"];
  if (table[PLURAL_KEYS[0]].length > 1 && [...used].some((x) => !cats.includes(x))) { errors++; console.error(`✗ plural/${lang}: categories ${[...used]} not all in ${cats}`); }
}
console.log(`plurals: ${Object.keys(PLURALS).length} languages, ${PLURAL_KEYS.length} texts each`);
if (errors) process.exit(1);
console.log("✓ all languages are complete");

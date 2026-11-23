// Checks that the version announced by the card, the first entry of the changelog and (on a tag) the tag all agree.
// Usage: node test/check-version.mjs            (GITHUB_REF_TYPE=tag GITHUB_REF_NAME=v1.2.3 on a tag build)
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../dist/proxmox-card.js", import.meta.url), "utf8");
const log = readFileSync(new URL("../CHANGELOG.md", import.meta.url), "utf8");
const card = src.match(/^const VERSION = "([^"]+)";/m)?.[1];
const top = log.match(/^## (\d+\.\d+\.\d+)\b/m)?.[1];
const errors = [];
if (!card) errors.push("VERSION not found in dist/proxmox-card.js");
if (!top) errors.push("no “## x.y.z” entry in CHANGELOG.md");
if (card && top && card !== top) errors.push(`the card says ${card} but the first changelog entry is ${top}`);
if (process.env.GITHUB_REF_TYPE === "tag" && process.env.GITHUB_REF_NAME !== `v${card}`) errors.push(`tag ${process.env.GITHUB_REF_NAME} does not match the card version v${card}`);
if (errors.length) { for (const e of errors) console.error(`✗ ${e}`); process.exit(1); }
console.log(`✓ version ${card} (card, changelog${process.env.GITHUB_REF_TYPE === "tag" ? ", tag" : ""})`);

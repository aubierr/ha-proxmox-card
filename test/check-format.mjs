// Unit checks for the size / unit formatting and the network rate helpers of the card.
// Usage: node test/check-format.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const src = readFileSync(new URL("../dist/proxmox-card.js", import.meta.url), "utf8");
const a = src.indexOf("const BYTES");
const b = src.indexOf("/** Sparkline paths");
if (a < 0 || b < 0) throw new Error("format helpers not found in dist/proxmox-card.js");
const { BYTES, fmtScaled, fmtUsedTotal, unitFactor, nextNet, RATE_BYTES, RATE_BITS, SIZES } = new Function(
  `${src.slice(a, b)}; return { BYTES, fmtScaled, fmtUsedTotal, unitFactor, nextNet, RATE_BYTES, RATE_BITS, SIZES };`)();

// formatting, including the rounding boundaries
assert.equal(fmtScaled(0, SIZES), "0 B");
assert.equal(fmtScaled(999, SIZES), "999 B");
assert.equal(fmtScaled(1000, SIZES), "1.00 kB");
assert.equal(fmtScaled(12_500_000, RATE_BYTES), "12.5 MB/s");
assert.equal(fmtScaled(150e6 * 8, RATE_BITS), "1.20 Gbit/s");
assert.equal(fmtUsedTotal(2.5e9, 4e9), "2.50 / 4.00 GB");
assert.equal(fmtUsedTotal(512e9, 1.5e12), "0.51 / 1.50 TB");

// units: "" = bytes, unknown = null (never a silent wrong scale)
assert.equal(unitFactor({ attributes: {} }), 1);
assert.equal(unitFactor({ attributes: { unit_of_measurement: "GiB" } }), 1073741824);
assert.equal(unitFactor({ attributes: { unit_of_measurement: "Go" } }), null);

// network rate
const t0 = 1_000_000;
let rec = nextNet(undefined, { b: 1000, t: t0 }, t0);
assert.equal(rec.rate, null); // first sample: no rate yet
rec = nextNet(rec, { b: 31_000, t: t0 + 30_000 }, t0 + 30_000);
assert.equal(rec.rate, 1000); // 30 000 bytes in 30 s
assert.equal(nextNet(rec, { b: 31_000, t: t0 + 30_000 }, t0 + 60_000).rate, 1000); // within a few polls: unchanged
assert.equal(nextNet(rec, { b: 31_000, t: t0 + 30_000 }, t0 + 30_000 + 200_000).rate, 0); // idle: no new sample for too long
assert.equal(nextNet(rec, { b: 100, t: t0 + 60_000 }, t0 + 60_000).rate, null); // counter reset
assert.equal(nextNet(rec, { b: 5, t: t0 + 30_000 + 0 }, t0 + 30_000).b, 31_000); // same timestamp: sample ignored

console.log("✓ format and network rate checks passed");

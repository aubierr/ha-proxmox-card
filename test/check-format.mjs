// Unit checks for the size / unit formatting, the network rate and the storage fill forecast helpers of the card.
// Usage: node test/check-format.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const src = readFileSync(new URL("../dist/proxmox-card.js", import.meta.url), "utf8");
const a = src.indexOf("const BYTES");
const b = src.indexOf("/** Sparkline paths");
if (a < 0 || b < 0) throw new Error("format helpers not found in dist/proxmox-card.js");
const { BYTES, fmtScaled, fmtUsedTotal, unitFactor, nextNet, RATE_BYTES, RATE_BITS, SIZES, fitSlope, daysToFull, counterRates, durSeconds, fmtDur, vzGuests } = new Function(
  `${src.slice(a, b)}; return { BYTES, fmtScaled, fmtUsedTotal, unitFactor, nextNet, RATE_BYTES, RATE_BITS, SIZES, fitSlope, daysToFull, counterRates, durSeconds, fmtDur, vzGuests };`)();

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

// storage fill forecast: slope of hourly means over a week, in % per day
const H = 3600e3, DAY = 24 * H, w0 = Date.UTC(2026, 0, 1);
const week = (f) => Array.from({ length: 7 * 24 * 4 }, (_, i) => ({ t: w0 + i * H / 4, v: f(i / 96) })); // 4 samples per hour, i / 96 = days
const near = (x, y, eps = 0.02) => assert.ok(Math.abs(x - y) <= eps, `${x} is not close to ${y}`);
near(fitSlope(week((d) => 50 + 2 * d)), 2);                    // steady growth: 2 % per day
near(fitSlope(week((d) => 80 - 0.5 * d)), -0.5);               // a storage being emptied
near(fitSlope(week(() => 42)), 0);                              // flat
near(fitSlope(week((d) => 60 + d + 3 * Math.sin(d * 40))), 1, 0.1); // noisy growth
assert.equal(fitSlope(week((d) => 50 + d).slice(0, 4 * 5)), null);  // 5 hours only: not enough
assert.equal(fitSlope(week((d) => 50 + d).slice(0, 4 * 20)), null); // 6+ hours but less than a day
assert.equal(fitSlope([{ t: NaN, v: 1 }, { t: w0, v: NaN }]), null); // unreadable samples are skipped
// samples before the start of the window count as the first hour (the recorder's "state at start")
near(fitSlope([{ t: w0 - 30 * DAY, v: 50 }, ...week((d) => 50 + d).slice(4)], w0), 1, 0.05);
assert.equal(daysToFull(2, 60), 20);
assert.equal(daysToFull(0.5, 99.9), 0);
assert.equal(daysToFull(0.1, 50), null);     // 500 days: more than a year away
assert.equal(daysToFull(-1, 50), null);      // emptying
assert.equal(daysToFull(0.005, 50), null);   // flat within noise
assert.equal(daysToFull(2, null), null);
assert.equal(daysToFull(null, 50), null);

// network curve of a guest: throughput per bucket from a cumulative counter
const ev = [{ t: 0, v: 0 }, { t: 30e3, v: 30e3 }, { t: 60e3, v: 60e3 }, { t: 90e3, v: 150e3 }, { t: 150e3, v: 10 }];
assert.deepEqual(counterRates(ev, 0, 60e3, 3), [1000, 1500, null]); // 60 kB in 60 s, then 90 kB; the reset (150 kB -> 10 B) gives null
assert.deepEqual(counterRates([{ t: 200e3, v: 5 }], 0, 60e3, 2), [null, null]); // no data yet in the first buckets
assert.deepEqual(counterRates(ev, 0, 60e3, 1), [1000]);

// backups: duration of the "Backup duration" entity, compact durations, guests of a vzdump run
assert.equal(durSeconds(14.5, "min"), 870);
assert.equal(durSeconds(2, "h"), 7200);
assert.equal(durSeconds(30, undefined), 30);   // no unit: seconds, the integration's native unit
assert.equal(durSeconds(5, "weeks"), null);    // unknown unit: nothing rather than a wrong value
assert.equal(durSeconds(null, "min"), null);
assert.equal(fmtDur(45), "45 s");
assert.equal(fmtDur(12 * 60 + 20), "12 min");
assert.equal(fmtDur(3600 + 5 * 60), "1 h 05");
assert.equal(fmtDur(2 * 3600), "2 h");
assert.equal(fmtDur(3600 + 59.8 * 60), "2 h");  // 1 h 59.8 min rounds up to the hour, not "1 h 60"
assert.equal(fmtDur(3 * 86400 + 2 * 3600, "j"), "3 j 2 h");
assert.equal(fmtDur(2 * 86400 + 23.8 * 3600, "d"), "3 d");
assert.equal(fmtDur(-5), ""); assert.equal(fmtDur(NaN), "");
assert.deepEqual(vzGuests("100,101"), ["100", "101"]);
assert.deepEqual(vzGuests("104"), ["104"]);
assert.equal(vzGuests(""), null);     // empty id: a job that backs up the whole node
assert.equal(vzGuests(null), null);
assert.equal(vzGuests("all"), null);

console.log("✓ format, network rate, forecast, network curve and backup checks passed");

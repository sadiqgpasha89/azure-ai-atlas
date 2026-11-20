import test from 'node:test';
import assert from 'node:assert/strict';
import { loadAtlas } from './helpers/load.mjs';

const fo = loadAtlas().finops;
const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} !== ${b}`);

test('TCO matches a hand calculation for the defaults', () => {
  const t = fo.calculateTCO(fo.tcoDefaults);
  // queries = 2500 x 12 x 30.5; effective input = 0.15 x 0.6 + 0.075 x 0.4 = 0.12 $/1M
  close(t.monthlyQueries, 915000);
  close(t.effectiveInputPer1M, 0.12);
  close(t.input, 915000 * 1800 / 1e6 * 0.12);
  close(t.output, 915000 * 450 / 1e6 * 0.6);
  close(t.telemetry, 915 * 0.15);
  close(t.total, 197.64 + 247.05 + 490 + 108 + 45 + 137.25);
  close(t.perUser, t.total / 2500);
  close(t.perQuery, t.total / 915000);
});

test('TCO treats 0 as a real value, not as "use the default"', () => {
  const noCache = fo.calculateTCO({ ...fo.tcoDefaults, cacheHitPct: 0 });
  close(noCache.effectiveInputPer1M, fo.tcoDefaults.inputPer1M);
  const noUsers = fo.calculateTCO({ ...fo.tcoDefaults, users: 0 });
  close(noUsers.inference, 0);
  assert.equal(noUsers.perUser, null);
  assert.equal(noUsers.perQuery, null);
  close(noUsers.total, 490 + 108 + 45);
  const free = fo.calculateTCO({ ...fo.tcoDefaults, searchMonthly: 0, hostingMonthly: 0, stateMonthly: 0, telemetryPer1kQueries: 0 });
  close(free.total, free.inference);
});

test('TCO never returns NaN or Infinity when any single input is zero', () => {
  for (const k of Object.keys(fo.tcoDefaults)) {
    const t = fo.calculateTCO({ ...fo.tcoDefaults, [k]: 0 });
    for (const [name, v] of Object.entries(t)) if (typeof v === 'number') assert.ok(Number.isFinite(v), `${k}=0 -> ${name}=${v}`);
  }
});

test('TCO clamps an out-of-range cache rate instead of producing negative cost', () => {
  assert.ok(fo.calculateTCO({ ...fo.tcoDefaults, cacheHitPct: 250 }).input >= 0);
  assert.ok(fo.calculateTCO({ ...fo.tcoDefaults, cacheHitPct: -50 }).input >= 0);
});

test('ROI includes the one-time build cost and the realization discount', () => {
  const r = fo.calculateROI(fo.roiDefaults);
  const labor = 450 * 2.5 * 48 * 65;
  close(r.laborBenefit, labor);
  close(r.adjustedBenefit, (labor + 75000) * 0.85);
  close(r.totalYear1Cost, 85000 + 110000 + 250000);
  close(r.netYear1, r.adjustedBenefit - r.totalYear1Cost);
  close(r.roiPercentage, r.netYear1 / r.totalYear1Cost * 100);
  close(r.paybackMonths, r.totalYear1Cost / (r.adjustedBenefit / 12));
});

test('ROI break-even hours really is the zero-net point', () => {
  const r = fo.calculateROI(fo.roiDefaults);
  const atBreakEven = fo.calculateROI({ ...fo.roiDefaults, hoursSavedWeekly: r.breakEvenHoursWeekly });
  close(atBreakEven.netYear1, 0, 1e-4);
});

test('ROI responds to every input it claims to use', () => {
  const base = fo.calculateROI(fo.roiDefaults).netYear1;
  for (const k of Object.keys(fo.roiDefaults)) {
    const bumped = fo.calculateROI({ ...fo.roiDefaults, [k]: fo.roiDefaults[k] + 10 }).netYear1;
    assert.notEqual(bumped, base, `changing ${k} did not change net year 1`);
  }
});

test('ROI with all-zero inputs returns finite numbers or null, never NaN', () => {
  const zero = Object.fromEntries(Object.keys(fo.roiDefaults).map(k => [k, 0]));
  for (const [k, v] of Object.entries(fo.calculateROI(zero))) assert.ok(v === null || Number.isFinite(v), `${k}=${v}`);
  assert.equal(fo.calculateROI(zero).roiPercentage, null);
});

test('prices are flagged illustrative until they carry a source and date', () => {
  assert.equal(fo.priceStatus.state, 'illustrative-unverified');
  assert.ok(/^https:\/\/azure\.microsoft\.com\//.test(fo.priceStatus.officialPricing));
});

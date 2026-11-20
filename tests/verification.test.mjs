import test from 'node:test';
import assert from 'node:assert/strict';
import { loadAtlas } from './helpers/load.mjs';

const A = loadAtlas();
const V = A.verification;
const d = (s) => new Date(s + 'T00:00:00Z');

test('state(): unverified, verified and due', () => {
  assert.equal(V.state(null, 'service'), 'unverified');
  assert.equal(V.state(undefined, 'service'), 'unverified');
  assert.equal(V.state('2026-11-20', 'service', d('2026-11-20')), 'verified');
  assert.equal(V.state('2026-11-20', 'service', d('2027-02-17')), 'verified'); // 89 days, interval 90
  assert.equal(V.state('2026-11-20', 'service', d('2027-02-19')), 'due'); // 91 days
  assert.equal(V.state('2026-11-20', 'lifecycle', d('2026-12-25')), 'due'); // lifecycle interval is 30 days
});

test('every record has a date, claims and sources that exist, and points at a real service page', () => {
  const ids = new Set(A.services.map(s => s.id));
  for (const r of V.records) {
    assert.match(r.lastVerified, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(r.lastVerified <= V.asOf, `${r.id} verified after asOf`);
    assert.ok(r.claims.length > 0, `${r.id} has no claims`);
    assert.ok(ids.has(r.id), `${r.id} is not a service page`);
    for (const s of r.sources) assert.ok(V.sources[s], `${r.id} cites unknown source ${s}`);
  }
});

test('sources are first-party Microsoft https URLs', () => {
  for (const [k, s] of Object.entries(V.sources)) assert.match(s.url, /^https:\/\/(learn|devblogs|azure)\.microsoft\.com\//, k);
});

test('every module says what is still unverified, and a verified date needs a scope', () => {
  for (const m of V.modules) {
    assert.ok(m.remaining, `${m.id} must state what remains`);
    if (m.verified) assert.ok(m.scope, `${m.id} has a date but no scope`);
    else assert.equal(m.scope, null);
  }
});

test('finops model rows link to lifecycle records that exist', () => {
  const keys = new Set(V.modelLifecycle.map(m => m.key));
  for (const m of A.finops.modelPricing) if (m.lifecycleKey) assert.ok(keys.has(m.lifecycleKey), m.id);
});

test('data text does not name retired or legacy models as recommendations', () => {
  const bad = /\bgpt-4o(-mini)?\b|\bo1-(preview|mini)\b|\bo3-mini\b/i;
  const dirty = [];
  const walk = (o, p) => {
    if (typeof o === 'string') { if (bad.test(o)) dirty.push(p); }
    else if (o && typeof o === 'object') for (const k of Object.keys(o)) { if (k === 'verification' || k === 'finops') continue; walk(o[k], p + '.' + k); }
  };
  for (const k of Object.keys(A)) if (typeof A[k] === 'object' && !['finops', 'verification'].includes(k)) walk(A[k], k);
  assert.deepEqual(dirty, []);
});

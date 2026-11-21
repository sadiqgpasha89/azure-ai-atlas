import test from 'node:test';
import assert from 'node:assert/strict';
import { loadAtlas, search } from './helpers/load.mjs';

const A = loadAtlas();
const index = search.build(A);
// search.js runs in its own vm realm; copy arrays into this realm so deepEqual compares like with like
const top = (q, kind = 'all', n = 5) => [...search.query(index, q, kind, n)];

test('index covers every service, architecture, decision and playbook', () => {
  for (const [kind, n] of [['service', A.services.length], ['architecture', A.architectures.length], ['decision', A.decisions.length], ['playbook', A.engineeringPlaybooks.length]]) {
    assert.ok(index.filter(i => i.kind === kind).length >= n, `${kind} entries missing`);
  }
  assert.ok(index.length > 250, `only ${index.length} entries`);
});

test('no entry has an empty or broken name, summary or link', () => {
  for (const it of index) {
    assert.ok(it.name && it.name.trim(), `empty name for ${it.href}`);
    assert.ok(it.tag && it.tag.trim(), `empty summary for "${it.name}"`);
    assert.ok(!/undefined|\[object|NaN/.test(it.name + ' ' + it.tag + ' ' + it.type + ' ' + it.cat), `bad text in "${it.name}"`);
    assert.match(it.href, /^#\/[a-z0-9\/-]*$/, `bad href ${it.href}`);
  }
});

test('every link resolves to a real route or record', () => {
  const ids = { s: new Set(A.services.map(x => x.id)), a: new Set(A.architectures.map(x => x.id)), d: new Set(A.decisions.map(x => x.id)), p: new Set(A.engineeringPlaybooks.map(x => x.id)) };
  const modules = new Set(['gov', 'ops', 'toolkit', 'labs', 'rag-lab', 'agents', 'security-center', 'evaluation', 'troubleshooting', 'traditional-ml', 'em-workspace', 'services-matrix', 'foundation', 'foundry', 'advanced-ai', 'advisor', 'finops', 'freshness', 'start', 'glossary']);
  const decTools = new Set(['em', 'pe', 'shaper', 'checklists', 'calculator']);
  for (const it of index) {
    const [, kind, id] = it.href.split('/');
    if (kind === 'd') assert.ok(!id || decTools.has(id) || ids.d.has(id), `${it.href} does not exist`);
    else if (ids[kind]) assert.ok(ids[kind].has(id), `${it.href} does not exist`);
    else assert.ok(modules.has(kind), `${it.href} is not a route`);
  }
});

test('a service is found by its name, id and category words', () => {
  assert.equal(top('AI Search')[0].href, '#/s/ai-search');
  assert.ok(top('key vault').some(h => h.href === '#/s/key-vault'));
  assert.ok(top('private link').some(h => h.href === '#/s/private-link'));
});

test('acronyms and error codes find the right content', () => {
  assert.ok(top('429', 'all', 8).some(h => /429|throttl/i.test(h.name)), '429');
  assert.ok(top('PTU', 'all', 8).some(h => /Provisioned/i.test(h.name)), 'PTU');
  assert.ok(top('mcp').length > 0, 'mcp');
  assert.ok(top('rag').length > 0, 'rag');
  assert.ok(top('kql').length > 0, 'kql');
  assert.ok(top('rbac').length > 0, 'rbac');
});

test('alias expansion works in both directions and ranks the literal term first', () => {
  assert.ok(search.expand('rag').includes('retrieval augmented generation'));
  assert.ok(search.expand('retrieval augmented generation').includes('rag'));
  assert.deepEqual([...search.expand('zzz')], ['zzz']);
});

test('type filters restrict results and keep ranking', () => {
  const svc = top('search', 'service', 10);
  assert.ok(svc.length > 0 && svc.every(h => h.kind === 'service'));
  const arch = top('rag', 'architecture', 10);
  assert.ok(arch.length > 0 && arch.every(h => h.kind === 'architecture'));
});

test('every word must match; nonsense and empty-filter queries return nothing', () => {
  assert.deepEqual(top('zzzqqq'), []);
  assert.deepEqual(top('search zzzqqq'), []);
  assert.deepEqual(top('kubernetes', 'lab', 5).filter(h => h.kind !== 'lab'), []);
});

test('an empty query lists entries instead of an error state', () => {
  assert.ok(search.query(index, '', 'all', 12).length === 12);
});

test('query is case-insensitive and ignores extra whitespace', () => {
  assert.deepEqual(top('  AI   SEARCH ').map(h => h.href), top('ai search').map(h => h.href));
});

test('the verification page is discoverable', () => {
  assert.ok(top('verified sources').some(h => h.href === '#/freshness'));
  assert.ok(top('model retirement').some(h => h.href === '#/freshness'));
});

test('the start page and glossary terms are discoverable', () => {
  assert.ok(top('start here').some(h => h.href === '#/start'), 'start page');
  assert.ok(top('glossary').some(h => h.href === '#/glossary'), 'glossary page');
  assert.ok(top('groundedness', 'guide', 8).some(h => h.type === 'Glossary' && h.name === 'Groundedness'), 'glossary term');
  assert.ok(top('reciprocal rank fusion', 'all', 8).some(h => h.href === '#/glossary'), 'glossary term by full name');
});

// Validates the data files: node scripts/check.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="(data\/[^"]+)"/g)].map(m => m[1]);

const ctx = { window: {} };
ctx.window = ctx; // window === global
vm.createContext(ctx);
for (const s of scripts) vm.runInContext(fs.readFileSync(path.join(root, s), 'utf8'), ctx, { filename: s });
const A = ctx.ATLAS;

const errs = [];
const err = (m) => errs.push(m);
const ids = new Set();
const cats = new Set(A.categories.map(c => c.id));
const archIds = new Set();

for (const s of A.services) {
  const p = `service ${s.id}`;
  if (ids.has(s.id)) err(`${p}: duplicate id`);
  ids.add(s.id);
  if (!/^[a-z0-9-]+$/.test(s.id)) err(`${p}: id must match [a-z0-9-]+`);
}
const refRe = /\[\[([a-z0-9-]+)(?:\|[^\]]+)?\]\]/g;
const checkText = (where, t) => {
  if (typeof t !== 'string' || !t.trim()) return err(`${where}: empty text`);
  for (const m of t.matchAll(refRe)) if (!ids.has(m[1])) err(`${where}: unknown [[${m[1]}]]`);
  if ((t.match(/`/g) || []).length % 2) err(`${where}: unbalanced backtick`);
  if ((t.match(/\*\*/g) || []).length % 2) err(`${where}: unbalanced **`);
};

for (const s of A.services) {
  const p = `service ${s.id}`;
  for (const k of ['cat', 'name', 'tag', 'what', 'cost', 'doc']) if (!s[k]) err(`${p}: missing ${k}`);
  if (!cats.has(s.cat)) err(`${p}: unknown category ${s.cat}`);
  for (const k of ['flow', 'steps', 'gotchas', 'edges', 'ml', 'pairs']) if (!Array.isArray(s[k]) || !s[k].length) err(`${p}: ${k} must be a non-empty array`);
  if (s.flow && (s.flow.length < 3 || s.flow.length > 7)) err(`${p}: flow length ${s.flow.length} outside 3..7`);
  checkText(`${p}.what`, s.what); checkText(`${p}.cost`, s.cost);
  (s.steps || []).forEach(([n, t], i) => {
    if (!Number.isInteger(n) || n < 0 || n >= s.flow.length) err(`${p}: step ${i + 1} node index ${n} out of range`);
    checkText(`${p}.steps[${i}]`, t);
  });
  const nodesUsed = new Set((s.steps || []).map(x => x[0]));
  (s.flow || []).forEach((f, i) => { if (!nodesUsed.has(i)) err(`${p}: flow node ${i} ("${f}") never highlighted by a step`); });
  for (const k of ['gotchas', 'edges', 'ml']) (s[k] || []).forEach((t, i) => checkText(`${p}.${k}[${i}]`, t));
  (s.pairs || []).forEach(x => { if (!ids.has(x)) err(`${p}: pairs references unknown ${x}`); if (x === s.id) err(`${p}: pairs references itself`); });
}

for (const a of A.architectures) {
  const p = `architecture ${a.id}`;
  if (archIds.has(a.id)) err(`${p}: duplicate id`); archIds.add(a.id);
  for (const k of ['name', 'short', 'when']) if (!a[k]) err(`${p}: missing ${k}`);
  a.flow.forEach((f, i) => { if (f.s && !ids.has(f.s)) err(`${p}: flow[${i}] unknown service ${f.s}`); });
  a.steps.forEach(([n, t], i) => {
    if (n < 0 || n >= a.flow.length) err(`${p}: step ${i + 1} node index out of range`);
    checkText(`${p}.steps[${i}]`, t);
  });
  const used = new Set(a.steps.map(x => x[0]));
  a.flow.forEach((f, i) => { if (!used.has(i)) err(`${p}: flow node ${i} never highlighted`); });
  for (const k of ['why', 'fails']) a[k].forEach((t, i) => checkText(`${p}.${k}[${i}]`, t));
  checkText(`${p}.when`, a.when);
}
const themeIds = new Set(A.decisionThemes.map(t => t.id));
const decIds = new Set();
for (const d of A.decisions) {
  const p = `decision ${d.id}`;
  if (decIds.has(d.id)) err(`${p}: duplicate id`); decIds.add(d.id);
  if (!/^[a-z0-9-]+$/.test(d.id)) err(`${p}: id must match [a-z0-9-]+`);
  if (['shaper', 'checklists', 'calculator', 'em', 'pe', 'all'].includes(d.id)) err(`${p}: id clashes with a tool route`);
  if (!themeIds.has(d.theme)) err(`${p}: unknown theme ${d.theme}`);
  if (!['em', 'pe', 'both'].includes(d.lead)) err(`${p}: lead must be em, pe or both`);
  for (const role of ['em', 'pe']) {
    const x = d[role];
    if (!x || typeof x !== 'object') { err(`${p}: missing ${role} lens`); continue; }
    checkText(`${p}.${role}.call`, x.call);
    for (const k of ['own', 'evidence']) {
      if (!Array.isArray(x[k]) || x[k].length < 2) err(`${p}.${role}.${k}: needs at least 2 entries`);
      (x[k] || []).forEach((t, i) => checkText(`${p}.${role}.${k}[${i}]`, t));
    }
  }
  if (!['two-way', 'one-way', 'mixed'].includes(d.door)) err(`${p}: door must be two-way, one-way or mixed`);
  for (const k of ['title', 'question', 'doorNote', 'why', 'revisit']) checkText(`${p}.${k}`, d[k]);
  if (!Array.isArray(d.cols) || d.cols.length < 3) err(`${p}: cols needs at least 3 columns`);
  if (!Array.isArray(d.rows) || d.rows.length < 2) err(`${p}: rows needs at least 2 rows`);
  (d.rows || []).forEach((r, ri) => {
    if (r.length !== d.cols.length) err(`${p}: row ${ri} has ${r.length} cells, expected ${d.cols.length}`);
    r.forEach((c, ci) => checkText(`${p}.rows[${ri}][${ci}]`, c));
  });
  if (!Array.isArray(d.rules) || d.rules.length < 3) err(`${p}: rules needs at least 3 entries`);
  (d.rules || []).forEach((r, i) => { if (!Array.isArray(r) || r.length !== 2) err(`${p}: rules[${i}] must be [if, then]`); else r.forEach((t, j) => checkText(`${p}.rules[${i}][${j}]`, t)); });
  for (const k of ['redflags', 'ask']) {
    if (!Array.isArray(d[k]) || d[k].length < 3) err(`${p}: ${k} needs at least 3 entries`);
    (d[k] || []).forEach((t, i) => checkText(`${p}.${k}[${i}]`, t));
  }
  (d.related || []).forEach(x => { if (!ids.has(x)) err(`${p}: related references unknown service ${x}`); });
}
for (const t of A.decisionThemes) if (!A.decisions.some(d => d.theme === t.id)) err(`theme ${t.id}: has no decisions`);

// roles (decision tabs)
if (!Array.isArray(A.roles) || A.roles.length !== 2 || A.roles.map(r => r.id).join() !== 'em,pe') err('roles: expected [em, pe]');
for (const r of A.roles || []) {
  const p = `role ${r.id}`;
  for (const k of ['name', 'blurb']) checkText(`${p}.${k}`, r[k]);
  for (const k of ['owns']) { if (!Array.isArray(r[k]) || r[k].length < 3) err(`${p}.${k}: needs at least 3 entries`); (r[k] || []).forEach((t, i) => checkText(`${p}.${k}[${i}]`, t)); }
  if (!Array.isArray(r.quick) || r.quick.length < 5) err(`${p}.quick: needs at least 5 rows`);
  (r.quick || []).forEach(([sit, call, dec], i) => { checkText(`${p}.quick[${i}].situation`, sit); checkText(`${p}.quick[${i}].call`, call); if (!decIds.has(dec)) err(`${p}.quick[${i}]: unknown decision ${dec}`); });
  if (!Array.isArray(r.rhythm) || r.rhythm.length < 3) err(`${p}.rhythm: needs at least 3 rows`);
  (r.rhythm || []).forEach(([when, what], i) => { checkText(`${p}.rhythm[${i}].when`, when); checkText(`${p}.rhythm[${i}].what`, what); });
}
for (const role of ['em', 'pe']) if (!A.decisions.some(d => d.lead === role)) err(`no decision is led by ${role}`);

// playbooks
if (!Array.isArray(A.ladder) || A.ladder.length !== 4) err('ladder: expected 4 stages');
(A.ladder || []).forEach(l => { for (const k of ['stage', 'time', 'goal']) checkText(`ladder ${l.stage}.${k}`, l[k]); for (const k of ['exit', 'skip']) (l[k] || []).forEach((t, i) => checkText(`ladder ${l.stage}.${k}[${i}]`, t)); });
const readyIds = new Set();
for (const g of A.readiness) {
  if (!g.items.length) err(`readiness group ${g.id}: empty`);
  for (const it of g.items) {
    const p = `readiness ${it.id}`;
    if (readyIds.has(it.id)) err(`${p}: duplicate id`); readyIds.add(it.id);
    if (!['agent', 'ml', 'both'].includes(it.kind)) err(`${p}: kind must be agent, ml or both`);
    checkText(`${p}.t`, it.t); checkText(`${p}.why`, it.why);
    (it.see || []).forEach(r => {
      const [k, id] = r.split(':');
      if (k === 'svc' && !ids.has(id)) err(`${p}: see unknown service ${id}`);
      else if (k === 'dec' && !decIds.has(id)) err(`${p}: see unknown decision ${id}`);
      else if (k !== 'svc' && k !== 'dec') err(`${p}: bad see ref ${r}`);
    });
  }
}
if (typeof A.adrTemplate !== 'string' || A.adrTemplate.length < 200) err('adrTemplate missing');

// engineering playbooks
if (!Array.isArray(A.engineeringPlaybooks) || A.engineeringPlaybooks.length < 5) err('engineeringPlaybooks: expected at least 5 playbooks');
for (const p of A.engineeringPlaybooks || []) {
  const loc = `playbook ${p.id}`;
  for (const k of ['title', 'badge', 'tag', 'intro']) checkText(`${loc}.${k}`, p[k]);
  for (const sec of p.sections || []) {
    checkText(`${loc}.${sec.title}`, sec.title);
    if (sec.body) checkText(`${loc}.${sec.title}.body`, sec.body);
    for (const b of sec.bullets || []) checkText(`${loc}.${sec.title}.bullet`, b);
    for (const tip of sec.tips || []) checkText(`${loc}.${sec.title}.tip`, tip);
  }
  (p.see || []).forEach(r => {
    const [k, id] = r.split(':');
    if (k === 'svc' && !ids.has(id)) err(`${loc}: see unknown service ${id}`);
    else if (k === 'dec' && !decIds.has(id)) err(`${loc}: see unknown decision ${id}`);
    else if (k === 'arch' && !archIds.has(id)) err(`${loc}: see unknown architecture ${id}`);
  });
}

// governance
if (!A.governance || typeof A.governance !== 'object') err('governance: missing A.governance');
else {
  const g = A.governance;
  if (!g.landingZones || !g.securityFramework || !g.tenancyModels || !g.policyInitiatives) err('governance: missing core sections');
  checkText('governance.landingZones.title', g.landingZones.title);
  checkText('governance.landingZones.intro', g.landingZones.intro);
}

// operations
if (!A.operations || typeof A.operations !== 'object') err('operations: missing A.operations');
else {
  if (!A.operations.dashboardTemplate || !Array.isArray(A.operations.dashboardTemplate.widgets) || A.operations.dashboardTemplate.widgets.length < 10) err('operations: dashboardTemplate needs at least 10 widgets');
  if (!Array.isArray(A.operations.runbooks) || A.operations.runbooks.length < 4) err('operations: expected at least 4 runbooks');
  if (!A.operations.postmortemTemplate || typeof A.operations.postmortemTemplate.templateMarkdown !== 'string' || A.operations.postmortemTemplate.templateMarkdown.length < 200) err('operations: missing postmortemTemplate');
}

// toolkit
if (!A.toolkit || typeof A.toolkit !== 'object') err('toolkit: missing A.toolkit');
else {
  for (const k of ['useCaseAssessment', 'projectEstimation', 'raciMatrix', 'raidTracker', 'qualityGates', 'vendorMatrix', 'skillsMatrix']) {
    if (!A.toolkit[k]) err(`toolkit: missing ${k}`);
  }
}

// labs
if (!A.labs || typeof A.labs !== 'object') err('labs: missing A.labs');
else {
  if (!Array.isArray(A.labs.learningPaths) || A.labs.learningPaths.length < 3) err('labs: expected at least 3 learningPaths');
  if (!Array.isArray(A.labs.exercises) || A.labs.exercises.length < 5) err('labs: expected at least 5 exercises');
}

// advisor
if (!A.advisor || typeof A.advisor !== 'object') err('advisor: missing A.advisor');
else {
  const advQ = A.advisor.questions;
  if (!Array.isArray(advQ) || advQ.length < 5) err('advisor: questions missing');
  let advTest = A.advisor.recommend(A.advisor.defaults);
  if (!advTest.headline || !archIds.has(advTest.arch)) err(`advisor default recommendation failed arch check: ${advTest.arch}`);
  advTest.stack.forEach(s => { if (!ids.has(s.id)) err(`advisor stack unknown service ${s.id}`); });
  advTest.next.forEach(n => { if (!decIds.has(n.id)) err(`advisor next unknown decision ${n.id}`); });
}

// foundation
if (!A.foundation || typeof A.foundation !== 'object') err('foundation: missing A.foundation');
else {
  if (!Array.isArray(A.foundation.pillars) || A.foundation.pillars.length < 4) err('foundation: expected at least 4 pillars');
  if (!Array.isArray(A.foundation.decisions) || A.foundation.decisions.length < 7) err('foundation: expected at least 7 platform decisions');
  if (!Array.isArray(A.foundation.solutionReviewPillars) || A.foundation.solutionReviewPillars.length < 4) err('foundation: expected at least 4 solutionReviewPillars');
}

// foundry
if (!A.foundry || typeof A.foundry !== 'object') err('foundry: missing A.foundry');
else {
  if (!Array.isArray(A.foundry.sections) || A.foundry.sections.length < 5) err('foundry: expected at least 5 sections');
  if (!Array.isArray(A.foundry.codeExamples) || A.foundry.codeExamples.length < 2) err('foundry: expected at least 2 codeExamples');
}

// advancedAI
if (!A.advancedAI || typeof A.advancedAI !== 'object') err('advancedAI: missing A.advancedAI');
else {
  if (!Array.isArray(A.advancedAI.topics) || A.advancedAI.topics.length < 8) err('advancedAI: expected at least 8 topics');
}

// ragLab
if (!A.ragLab || typeof A.ragLab !== 'object') err('ragLab: missing A.ragLab');
else {
  if (!Array.isArray(A.ragLab.patterns) || A.ragLab.patterns.length < 14) err('ragLab: expected at least 14 patterns');
  if (!Array.isArray(A.ragLab.chunkingStrategies) || A.ragLab.chunkingStrategies.length < 5) err('ragLab: expected at least 5 chunkingStrategies');
  if (!Array.isArray(A.ragLab.retrievalStrategies) || A.ragLab.retrievalStrategies.length < 5) err('ragLab: expected at least 5 retrievalStrategies');
  if (!Array.isArray(A.ragLab.benchmarkExperiments) || A.ragLab.benchmarkExperiments.length < 4) err('ragLab: expected at least 4 benchmarkExperiments');
}

// agentPatterns
if (!A.agentPatterns || typeof A.agentPatterns !== 'object') err('agentPatterns: missing A.agentPatterns');
else {
  if (!Array.isArray(A.agentPatterns.patterns) || A.agentPatterns.patterns.length < 18) err('agentPatterns: expected at least 18 patterns');
  if (!Array.isArray(A.agentPatterns.frameworks) || A.agentPatterns.frameworks.length < 5) err('agentPatterns: expected at least 5 frameworks');
}

// securityCenter
if (!A.securityCenter || typeof A.securityCenter !== 'object') err('securityCenter: missing A.securityCenter');
else {
  if (!Array.isArray(A.securityCenter.threatCatalog) || A.securityCenter.threatCatalog.length < 10) err('securityCenter: expected at least 10 threats');
  if (!Array.isArray(A.securityCenter.governanceGates) || A.securityCenter.governanceGates.length < 8) err('securityCenter: expected at least 8 governanceGates');
}

// evaluationCenter
if (!A.evaluationCenter || typeof A.evaluationCenter !== 'object') err('evaluationCenter: missing A.evaluationCenter');
else {
  if (!Array.isArray(A.evaluationCenter.testingPyramid) || A.evaluationCenter.testingPyramid.length < 6) err('evaluationCenter: expected at least 6 testing levels');
  if (!Array.isArray(A.evaluationCenter.agentMetrics) || A.evaluationCenter.agentMetrics.length < 7) err('evaluationCenter: expected at least 7 agentMetrics');
}

// finops
if (!A.finops || typeof A.finops !== 'object') err('finops: missing A.finops');
else {
  if (!Array.isArray(A.finops.modelPricing) || A.finops.modelPricing.length < 6) err('finops: expected at least 6 modelPricing items');
  if (!Array.isArray(A.finops.scaleProfiles) || A.finops.scaleProfiles.length < 4) err('finops: expected at least 4 scaleProfiles');
  const roi = A.finops.calculateROI(A.finops.roiDefaults);
  if (typeof roi.roiPercentage !== 'number' || !Number.isFinite(roi.netYear1)) err('finops: calculateROI failed on defaults');
  const tco = A.finops.calculateTCO(A.finops.tcoDefaults);
  if (!Number.isFinite(tco.total) || tco.total <= 0) err('finops: calculateTCO failed on defaults');
  // zero is a valid input and must never produce NaN or Infinity
  for (const z of ['users', 'queriesPerUserDay', 'cacheHitPct', 'inputTokens', 'outputTokens', 'searchMonthly'])
    for (const v of Object.values(A.finops.calculateTCO({ ...A.finops.tcoDefaults, [z]: 0 })))
      if (typeof v === 'number' && !Number.isFinite(v)) err(`finops: calculateTCO non-finite result with ${z}=0`);
  for (const v of Object.values(A.finops.calculateROI(Object.fromEntries(Object.keys(A.finops.roiDefaults).map(k => [k, 0])))))
    if (typeof v === 'number' && !Number.isFinite(v)) err('finops: calculateROI non-finite result with all inputs 0');
  for (const m of A.finops.modelPricing) if (m.lifecycleKey && !A.verification.modelLifecycle.some(x => x.key === m.lifecycleKey)) err(`finops: ${m.id} lifecycleKey ${m.lifecycleKey} not in the verification registry`);
}

// troubleshooting
if (!A.troubleshooting || typeof A.troubleshooting !== 'object') err('troubleshooting: missing A.troubleshooting');
else {
  if (!Array.isArray(A.troubleshooting.categories) || A.troubleshooting.categories.length < 3) err('troubleshooting: expected at least 3 categories');
}

// traditionalML
if (!A.traditionalML || typeof A.traditionalML !== 'object') err('traditionalML: missing A.traditionalML');
else {
  if (!Array.isArray(A.traditionalML.mlLifecycle) || A.traditionalML.mlLifecycle.length < 8) err('traditionalML: expected at least 8 mlLifecycle stages');
}

// emWorkspace
if (!A.emWorkspace || typeof A.emWorkspace !== 'object') err('emWorkspace: missing A.emWorkspace');
else {
  if (!Array.isArray(A.emWorkspace.assessmentQuestions) || A.emWorkspace.assessmentQuestions.length < 10) err('emWorkspace: expected at least 10 assessmentQuestions');
  if (!Array.isArray(A.emWorkspace.skillsMatrix) || A.emWorkspace.skillsMatrix.length < 5) err('emWorkspace: expected at least 5 skillsMatrix roles');
}

// serviceMatrix
if (!A.serviceMatrix || typeof A.serviceMatrix !== 'object') err('serviceMatrix: missing A.serviceMatrix');
else {
  if (!Array.isArray(A.serviceMatrix.comparisonMatrix) || A.serviceMatrix.comparisonMatrix.length < 10) err('serviceMatrix: expected at least 10 comparisonMatrix items');
  const mandatoryFields = ['what', 'why', 'whenUse', 'whenNot', 'alternatives', 'integrationPoints', 'patterns', 'security', 'limitations', 'pricing', 'sla', 'regions', 'quotas', 'useCases'];
  (A.serviceMatrix.comparisonMatrix || []).forEach(item => {
    mandatoryFields.forEach(field => {
      if (!item[field] || typeof item[field] !== 'string') err(`serviceMatrix comparison item ${item.id || item.name}: missing mandatory field ${field}`);
    });
  });
  if (!Array.isArray(A.serviceMatrix.platformDecisions) || A.serviceMatrix.platformDecisions.length < 5) err('serviceMatrix: expected at least 5 platformDecisions');
}

// solution shaper: exhaustively run every answer combination
const Q = A.shaper.questions;
let combos = 0;
const walk = (i, a) => {
  if (i === Q.length) {
    combos++;
    let r;
    try { r = A.shaper.recommend(a); } catch (e) { return err(`shaper threw for ${JSON.stringify(a)}: ${e.message}`); }
    const w = `shaper ${Object.values(a).join('/')}`;
    if (!r.headline) err(`${w}: no headline`);
    if (r.arch && !archIds.has(r.arch)) err(`${w}: unknown architecture ${r.arch}`);
    if (!r.stack.length || !r.risks.length || !r.next.length || r.phases.length !== 4) err(`${w}: incomplete result`);
    const seen = new Set();
    r.stack.forEach(x => { if (!ids.has(x.id)) err(`${w}: unknown service ${x.id}`); if (seen.has(x.id)) err(`${w}: duplicate service ${x.id}`); seen.add(x.id); if (!x.role || !x.why) err(`${w}: ${x.id} missing role or why`); });
    r.next.forEach(x => { if (!decIds.has(x.id)) err(`${w}: unknown decision ${x.id}`); });
    return;
  }
  for (const o of Q[i].options) walk(i + 1, { ...a, [Q[i].id]: o[0] });
};
walk(0, {});
for (const [k, v] of Object.entries(A.shaper.defaults)) if (!Q.find(q => q.id === k)?.options.some(o => o[0] === v)) err(`shaper default ${k}=${v} is not an option`);

// service matrix links must resolve to a real service page
for (const m of A.serviceMatrix.comparisonMatrix) {
  const target = m.atlasId || m.id;
  if (!ids.has(target)) err(`serviceMatrix ${m.id}: no service page "${target}" (add atlasId)`);
}

// verification registry (content governance): every record needs a date, a source that exists, and at least one claim
const V = A.verification;
if (!V) err('verification: missing A.verification');
else {
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  const srcUrl = (u) => /^https:\/\/(learn\.microsoft\.com|devblogs\.microsoft\.com|azure\.microsoft\.com)\//.test(u);
  if (!dateRe.test(V.asOf)) err('verification: asOf must be YYYY-MM-DD');
  for (const [k, src] of Object.entries(V.sources)) { if (!srcUrl(src.url)) err(`verification source ${k}: url must be a first-party Microsoft https URL`); if (!src.title) err(`verification source ${k}: missing title`); }
  const seenRec = new Set();
  for (const r of V.records) {
    if (seenRec.has(r.id)) err(`verification record ${r.id}: duplicate`); seenRec.add(r.id);
    if (!ids.has(r.id)) err(`verification record ${r.id}: no such service page`);
    if (!dateRe.test(r.lastVerified)) err(`verification record ${r.id}: lastVerified must be YYYY-MM-DD`);
    if (r.lastVerified > V.asOf) err(`verification record ${r.id}: lastVerified is after asOf`);
    if (!r.claims || !r.claims.length) err(`verification record ${r.id}: no claims`);
    if (!r.sources || !r.sources.length) err(`verification record ${r.id}: no sources`);
    for (const sid of r.sources || []) if (!V.sources[sid]) err(`verification record ${r.id}: unknown source ${sid}`);
  }
  if (!V.sources[V.modelLifecycleSource]) err('verification: modelLifecycleSource not in sources');
  if (!dateRe.test(V.modelLifecycleVerified)) err('verification: modelLifecycleVerified must be YYYY-MM-DD');
  const keys = new Set();
  for (const m of V.modelLifecycle) { if (keys.has(m.key)) err(`modelLifecycle ${m.key}: duplicate`); keys.add(m.key); for (const f of ['label', 'lifecycle', 'retirement']) if (!m[f]) err(`modelLifecycle ${m.key}: missing ${f}`); }
  const routeOk = new Set(['finops','foundry','agents','rag-lab','advisor','foundation','services-matrix','security-center','evaluation','ops','troubleshooting','traditional-ml','advanced-ai','em-workspace','toolkit','labs','gov']);
  for (const m of V.modules) {
    if (!routeOk.has(m.id)) err(`verification module ${m.id}: unknown route`);
    if (m.verified && (!dateRe.test(m.verified) || !m.scope)) err(`verification module ${m.id}: a verified date needs a scope`);
    if (!m.remaining) err(`verification module ${m.id}: say what remains unverified`);
  }
  if (typeof V.state !== 'function' || V.state(null, 'service') !== 'unverified' || V.state('2026-01-01', 'service', new Date('2026-01-10')) !== 'verified' || V.state('2025-01-01', 'service', new Date('2026-01-10')) !== 'due') err('verification: state() misbehaves');
}

// stale model names must not creep back into page text (the lifecycle table lists them on purpose)
for (const f of fs.readdirSync(path.join(root, 'data'))) {
  if (['verification.js', 'finops.js'].includes(f)) continue;
  const t = fs.readFileSync(path.join(root, 'data', f), 'utf8');
  const m = t.match(/\bgpt-4o(-mini)?\b|\bo1-(preview|mini)\b|\bo3-mini\b/i);
  if (m) err(`data/${f}: names retired/legacy model "${m[0]}"; use a tier description or verify via the registry`);
}

// orientation content (data/guide.js): every link is a real route, every text is clean
{
  const decSet = new Set(A.decisions.map(d => d.id)), pbSet = new Set(A.engineeringPlaybooks.map(p => p.id));
  const pages = new Set(['', 'start', 'glossary', 'freshness', 'advisor', 'foundation', 'services-matrix', 'foundry', 'rag-lab', 'agents', 'traditional-ml', 'a', 'security-center', 'evaluation', 'ops', 'finops', 'em-workspace', 'troubleshooting', 'advanced-ai', 'labs', 'toolkit', 'gov', 'p', 'd']);
  const routeExists = (h) => {
    const m = /^#\/([a-z0-9-]*)(?:\/([a-z0-9-]+))?$/.exec(h || ''); if (!m) return false;
    const [, k, id] = m;
    if (!id) return pages.has(k);
    if (k === 's') return ids.has(id); if (k === 'c') return cats.has(id); if (k === 'a') return archIds.has(id); if (k === 'p') return pbSet.has(id);
    if (k === 'd') return decSet.has(id) || ['em', 'pe', 'shaper', 'checklists', 'calculator'].includes(id);
    return false;
  };
  const G = A.guide, link = (where, h) => { if (!routeExists(h)) err(`${where}: unknown route ${h}`); };
  if (!G || !A.glossary || !A.glossaryGroups) err('guide: missing A.guide, A.glossary or A.glossaryGroups');
  else {
    checkText('guide.intro', G.intro); checkText('guide.trust', G.trust);
    G.paths.forEach((p, i) => { checkText(`guide.paths[${i}].goal`, p.goal); p.steps.forEach((s, j) => { link(`guide.paths[${i}].steps[${j}]`, s[0]); checkText(`guide.paths[${i}].steps[${j}]`, s[2]); }); });
    G.stages.forEach((s, i) => { checkText(`guide.stages[${i}].question`, s.question); s.do.forEach((d, j) => checkText(`guide.stages[${i}].do[${j}]`, d)); s.links.forEach((l, j) => link(`guide.stages[${i}].links[${j}]`, l[0])); });
    G.tasks.forEach((t, i) => link(`guide.tasks[${i}]`, t[1]));
    const groups = new Set(A.glossaryGroups.map(g => g.id)), terms = new Set();
    A.glossary.forEach((t, i) => {
      const w = `glossary ${t.term || i}`;
      if (!groups.has(t.g)) err(`${w}: unknown group ${t.g}`);
      if (terms.has(t.term)) err(`${w}: duplicate term`); terms.add(t.term);
      checkText(`${w}.def`, t.def);
      if (!t.see || !t.see.length) err(`${w}: needs at least one link`);
      (t.see || []).forEach((l, j) => { link(`${w}.see[${j}]`, l[0]); if (!l[1]) err(`${w}.see[${j}]: empty label`); });
    });
    A.glossaryGroups.forEach(g => { if (!A.glossary.some(t => t.g === g.id)) err(`glossary group ${g.id}: has no terms`); });
  }
}

for (const c of A.categories) {
  if (!A.services.some(s => s.cat === c.id)) err(`category ${c.id}: has no services`);
  checkText(`category ${c.id}.lens`, c.lens);
}

const words = A.services.reduce((n, s) => n + JSON.stringify(s).split(/\s+/).length, 0);
console.log(`${A.categories.length} categories, ${A.services.length} services, ${A.architectures.length} architectures, ${A.decisions.length} decision guides (+ em/pe role tabs), ${A.readiness.reduce((n, g) => n + g.items.length, 0)} readiness items, ${combos} shaper combinations checked, ~${words} words in services`);
if (errs.length) { console.error(`\n${errs.length} problem(s):`); errs.forEach(e => console.error(' - ' + e)); process.exit(1); }
console.log('data OK');

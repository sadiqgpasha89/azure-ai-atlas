/* Atlas search: index builder + query function. Pure (no DOM), so tests/search.test.mjs can load it in Node.
   Records are indexed by collecting every string they contain, so the index never depends on field names
   (an earlier version read fields that did not exist and produced "undefined" results). */
(function (root) {
  'use strict';

  /* kind -> filter label. Order is the order of the filter chips. */
  var KINDS = [
    ['service', 'Services'], ['architecture', 'Architectures'], ['decision', 'Decisions'], ['playbook', 'Playbooks'],
    ['runbook', 'Runbooks'], ['security', 'Security'], ['tool', 'Tools'], ['lab', 'Labs'], ['guide', 'Guides']
  ];

  /* Acronyms and alternate terms. A query word that equals any member also matches every other member. */
  var ALIASES = [
    ['rag', 'retrieval augmented generation', 'retrieval-augmented generation'],
    ['mcp', 'model context protocol'],
    ['ptu', 'provisioned throughput', 'provisioned throughput units'],
    ['rbac', 'role based access control', 'role-based access control'],
    ['adr', 'architecture decision record', 'decision record'],
    ['slo', 'service level objective', 'service level objectives'],
    ['sla', 'service level agreement'],
    ['llm', 'large language model', 'language model'],
    ['kql', 'kusto', 'kusto query language'],
    ['iac', 'infrastructure as code', 'bicep', 'terraform'],
    ['hitl', 'human in the loop', 'human-in-the-loop'],
    ['finops', 'cost management', 'cost optimization', 'tco'],
    ['mlops', 'genaiops', 'llmops'],
    ['aks', 'kubernetes'],
    ['aca', 'container apps'],
    ['apim', 'api management'],
    ['entra', 'entra id', 'azure ad', 'active directory'],
    ['429', 'throttling', 'rate limit', 'rate limiting'],
    ['hnsw', 'vector index', 'approximate nearest neighbor'],
    ['bm25', 'keyword search', 'lexical search'],
    ['pii', 'personal data', 'sensitive data'],
    ['owasp', 'llm top 10'],
    ['dr', 'disaster recovery'],
    ['cdc', 'change data capture'],
    ['ocr', 'document intelligence', 'text extraction'],
    ['sdk', 'client library'],
    ['identity-aware', 'permission-aware', 'security trimming', 'document level security', 'acl'],
    ['idp', 'intelligent document processing', 'document processing']
  ];

  function flat(o, out) {
    if (o == null) return out;
    var t = typeof o;
    if (t === 'string') out.push(o);
    else if (t === 'number') out.push(String(o));
    else if (Array.isArray(o)) o.forEach(function (x) { flat(x, out); });
    else if (t === 'object') Object.keys(o).forEach(function (k) { flat(o[k], out); });
    return out;
  }

  function build(A) {
    var byId = {};
    A.services.forEach(function (s) { byId[s.id] = s; });
    function plain(s) {
      return String(s).replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, function (m, id, label) { return label || (byId[id] ? byId[id].name : id); });
    }
    function hayOf(o) { return plain(flat(o, []).join(' ')).replace(/[`*]/g, '').toLowerCase(); }
    var out = [];
    function add(kind, type, href, name, tag, cat, obj, extra) {
      if (!name) return;
      out.push({ kind: kind, type: type, href: href, name: String(name), tag: String(tag || ''), cat: cat, id: href,
        hay: hayOf(obj) + (extra ? ' ' + String(extra).toLowerCase() : '') });
    }
    var catById = {}; A.categories.forEach(function (c) { catById[c.id] = c; });

    A.services.forEach(function (s) { add('service', 'Service', '#/s/' + s.id, s.name, s.tag, catById[s.cat].name, s, s.id); });
    A.architectures.forEach(function (a) { add('architecture', 'Architecture', '#/a/' + a.id, a.name, a.short, 'Architecture', a, a.id); });
    A.decisions.forEach(function (d) { add('decision', 'Decision', '#/d/' + d.id, d.title, d.question, 'Decision guide', d, d.id); });
    A.engineeringPlaybooks.forEach(function (p) { add('playbook', 'Playbook', '#/p/' + p.id, p.title, p.tag, 'Playbook', p, p.id); });

    /* Tools and top-level modules (static descriptions; extra keywords widen discovery). */
    [
      ['#/d/em', 'Decisions for engineering managers', 'Default calls, evidence to ask for, and the guides you lead', 'Decision tab', 'manager budget headcount risk launch gate quick calls'],
      ['#/d/pe', 'Decisions for principal engineers', 'Default designs, trade-offs and the tests to demand', 'Decision tab', 'principal architect design review adr trade-off quick calls'],
      ['#/d/shaper', 'Solution shaper', 'Get a starting stack, risks and next decisions for your use case', 'Tool', 'recommend stack wizard rag agent starting point'],
      ['#/d/checklists', 'Readiness checklists', 'Maturity ladder, production readiness and decision record template', 'Tool', 'production readiness launch checklist adr decision record maturity prototype pilot scale'],
      ['#/d/calculator', 'Cost per task calculator', 'Unit economics for LLM features and the levers that cut cost', 'Tool', 'price tokens caching batch unit economics budget'],
      ['#/freshness', 'Content freshness and sources', 'What has been verified against Microsoft documentation, when, and what has not', 'Tool', 'verified verification lastverified sources freshness lifecycle model retirement deprecated stale review'],
      ['#/advisor', 'Architecture Advisor & Solution Generator', 'Guided intake to stack recommendation, diagram and ADR generator', 'Tool', 'advisor recommend stack intake adr decision requirements generator blueprint interactive'],
      ['#/start', 'Start here', 'Paths by role and the six stages from idea to production', 'Guide', 'start getting started orientation onboarding path role manager architect engineer workflow lifecycle'],
      ['#/glossary', 'Glossary', 'Plain-language definitions of the terms used across the atlas', 'Guide', 'glossary terms definitions vocabulary meaning what is'],
      ['#/finops', 'AI FinOps & Cost Engineering Center', 'Token pricing inputs, monthly TCO calculator, scale profiles and ROI model', 'Tool', 'finops cost calculator tco pricing ptu payg token optimization budget roi payback financial economics scale']
    ].forEach(function (t) { add('tool', 'Tool', t[0], t[1], t[2], t[3], null, t[4]); });
    [
      ['#/gov', 'Enterprise AI Governance & Landing Zones', 'security', 'CAF landing zones, network isolation, security framework, tenancy models', A.governance, 'landing zone caf hierarchy vnet private link firewall tenancy azure policy'],
      ['#/ops', 'Production AI Operations Centre', 'guide', 'Dashboard template, KQL queries, SRE runbooks, postmortem template', A.operations, 'dashboard kql runbook 429 throttling postmortem incident sre latency'],
      ['#/toolkit', 'AI Engineering Manager Toolkit', 'tool', 'Use-case assessment, estimation, RACI, RAID, quality gates, skills matrix', A.toolkit, 'toolkit assessment estimation raci raid quality gates vendor skills executive status report template'],
      ['#/labs', 'Hands-on Labs & Learning Roadmaps', 'lab', 'Role roadmaps, implementation labs, Microsoft Learn links', A.labs, 'labs exercises tutorial roadmaps learn curriculum hands-on'],
      ['#/rag-lab', 'RAG Engineering Lab', 'guide', 'RAG patterns, ingestion, chunking, retrieval scoring and quality calculator', A.ragLab, 'rag lab chunking hnsw bm25 rrf semantic ranker evaluation groundedness recall benchmark'],
      ['#/agents', 'Agent Pattern Explorer', 'guide', 'Agent patterns, frameworks and orchestration trade-offs', A.agentPatterns, 'agents patterns multi-agent semantic kernel langgraph mcp tools delegation reflection routing human in the loop'],
      ['#/security-center', 'AI Security & Threat Defense Center', 'security', 'Threat catalog and interactive governance gate checklist', A.securityCenter, 'security owasp threat prompt injection jailbreak exfiltration poisoning governance audit guardrails'],
      ['#/evaluation', 'AI Evaluation & Quality Center', 'guide', 'Testing pyramid, quality dimensions, agent metrics and release gate calculator', A.evaluationCenter, 'evaluation testing pyramid quality gates hallucination benchmark regression metrics red teaming'],
      ['#/troubleshooting', 'Production Troubleshooting Catalog', 'runbook', 'Diagnostic workflows, root causes, resolutions and KQL queries', null, 'troubleshooting errors 429 rate limit timeout hallucination loop kql failure root cause diagnostics runbook'],
      ['#/traditional-ml', 'Traditional ML & Enterprise Integrations', 'guide', 'ML lifecycle, Azure ML comparison, resilience patterns and ERP/CRM connectors', A.traditionalML, 'traditional ml mlops lifecycle training azure ml fabric databricks sap salesforce dynamics'],
      ['#/em-workspace', 'Engineering Manager Workspace', 'tool', 'Project review questions, complexity estimator, delivery lifecycle and skills matrix', A.emWorkspace, 'em workspace manager project review staffing estimator skills matrix competency portfolio prioritization'],
      ['#/services-matrix', 'Azure Service Decision Matrix', 'guide', '14-field comparison across Azure AI services and platform trade-off guides', A.serviceMatrix, 'service matrix comparison aca aks functions blob adls managed identity private endpoints consumption ptu'],
      ['#/foundation', 'Azure Cloud Foundation', 'guide', 'Networking, identity, storage, compute and platform decisions', A.foundation, 'foundation networking vnet private endpoint entra identity storage compute landing zone'],
      ['#/foundry', 'Microsoft Foundry Deep Dive', 'guide', 'Foundry resources, model catalog, deployments, agents and evaluation', A.foundry, 'foundry hub project model catalog deployment agent service ptu quota'],
      ['#/advanced-ai', 'Advanced AI Engineering', 'guide', 'Graph RAG, multimodal, fine-tuning, small models, routing and red teaming', A.advancedAI, 'advanced graph rag multimodal lora fine tuning slm routing memory red teaming pyrit']
    ].forEach(function (m) { add(m[2], m[2] === 'security' ? 'Security' : (m[2] === 'lab' ? 'Labs' : 'Module'), m[0], m[1], m[3], 'Module', m[4], m[5]); });

    /* Individual items inside modules. They link to the module page. */
    function each(arr, fn) { (arr || []).forEach(fn); }
    each(A.foundation && A.foundation.pillars, function (p) { add('guide', 'Foundation', '#/foundation', p.name, p.summary, 'Cloud Foundation', p); });
    each(A.foundation && A.foundation.decisions, function (d) { add('decision', 'Platform decision', '#/foundation', d.title, d.recommendation, 'Cloud Foundation', d); });
    each(A.foundry && A.foundry.sections, function (s) { add('guide', 'Foundry', '#/foundry', s.name, s.desc, 'Microsoft Foundry', s); });
    each(A.advancedAI && A.advancedAI.topics, function (t) { add('guide', 'Advanced AI', '#/advanced-ai', t.name, t.summary, 'Advanced AI', t); });
    each(A.ragLab && A.ragLab.patterns, function (p) { add('guide', 'RAG pattern', '#/rag-lab', p.name, p.useCase, 'RAG pattern', p); });
    each(A.agentPatterns && A.agentPatterns.patterns, function (p) { add('guide', 'Agent pattern', '#/agents', p.name, p.bestFit, 'Agent pattern', p); });
    each(A.securityCenter && A.securityCenter.threatCatalog, function (t) { add('security', 'Threat', '#/security-center', t.id + ': ' + t.name, t.attackVector, 'Security threat', t); });
    each(A.securityCenter && A.securityCenter.governanceGates, function (g) { add('security', 'Governance gate', '#/security-center', g.name, g.question, 'Governance gate', g); });
    each(A.troubleshooting && A.troubleshooting.categories, function (c) {
      each(c.issues, function (i) { add('runbook', 'Troubleshooting', '#/troubleshooting', i.title, i.symptom, c.name, i); });
    });
    each(A.operations && A.operations.runbooks, function (r) { add('runbook', 'Runbook', '#/ops', r.title, r.trigger, 'Operations', r); });
    each(A.operations && A.operations.dashboardBlueprints, function (b) { add('guide', 'Dashboard', '#/ops', b.name, b.audience, 'Operations', b); });
    each(A.serviceMatrix && A.serviceMatrix.comparisonMatrix, function (m) { add('guide', 'Service matrix', '#/services-matrix', m.name, m.what, 'Service matrix', m); });
    each(A.serviceMatrix && A.serviceMatrix.platformDecisions, function (d) { add('decision', 'Platform decision', '#/services-matrix', d.title, d.winner, 'Platform decision', d); });
    each(A.labs && A.labs.exercises, function (e) { add('lab', 'Lab', '#/labs', e.title, e.goal, 'Labs', e); });
    each(A.labs && A.labs.learningPaths, function (p) { add('lab', 'Learning path', '#/labs', p.role, p.objective, 'Labs', p); });
    each(A.evaluationCenter && A.evaluationCenter.testingPyramid, function (l) { add('guide', 'Evaluation', '#/evaluation', l.name, l.scope, 'Evaluation', l); });
    each(A.evaluationCenter && A.evaluationCenter.agentMetrics, function (m) { add('guide', 'Agent metric', '#/evaluation', m.metric, m.desc, 'Evaluation', m); });
    each(A.emWorkspace && A.emWorkspace.skillsMatrix, function (s) { add('tool', 'Skills matrix', '#/em-workspace', s.role, s.focus, 'EM workspace', s); });
    each(A.glossary, function (g) { add('guide', 'Glossary', '#/glossary', g.term, g.def, 'Glossary', g); });
    ['useCaseAssessment', 'projectEstimation', 'architectureReview', 'raciMatrix', 'raidTracker', 'qualityGates', 'vendorMatrix', 'skillsMatrix', 'executiveReportTemplate'].forEach(function (k) {
      var t = A.toolkit && A.toolkit[k]; if (t) add('tool', 'Toolkit', '#/toolkit', t.title, t.intro, 'Manager toolkit', t);
    });
    return out;
  }

  function expand(term) {
    var alts = [term];
    ALIASES.forEach(function (g) { if (g.indexOf(term) > -1) g.forEach(function (m) { if (alts.indexOf(m) < 0) alts.push(m); }); });
    return alts;
  }

  /* Returns up to `limit` entries. kind = 'all' or a KINDS key. Ranking: name prefix 100, name contains 70,
     id contains 55, tag contains 30, body contains 10, summed across query words; every word must match. */
  function query(index, text, kind, limit) {
    var terms = String(text || '').toLowerCase().split(/\s+/).filter(Boolean);
    var alts = terms.map(expand);
    var res = index.filter(function (it) { return !kind || kind === 'all' || it.kind === kind; }).map(function (it) {
      var score = 0, ok = true, nm = it.name.toLowerCase(), tg = it.tag.toLowerCase();
      alts.forEach(function (as) {
        var best = 0;
        as.forEach(function (t, i) {
          var s = 0;
          if (nm.indexOf(t) === 0) s = 100; else if (nm.indexOf(t) > -1) s = 70; else if (it.id.toLowerCase().indexOf(t) > -1) s = 55;
          else if (tg.indexOf(t) > -1) s = 30; else if (it.hay.indexOf(t) > -1) s = 10;
          if (i > 0 && s) s = Math.round(s * 0.9); /* the literal term outranks its aliases */
          if (s > best) best = s;
        });
        if (!best) ok = false; score += best;
      });
      return { it: it, score: terms.length ? (ok ? score : 0) : 1 };
    }).filter(function (h) { return h.score > 0; });
    res.sort(function (a, b) { return b.score - a.score || a.it.name.localeCompare(b.it.name); });
    return res.slice(0, limit || 20).map(function (h) { return h.it; });
  }

  var api = { build: build, query: query, expand: expand, KINDS: KINDS, ALIASES: ALIASES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AtlasSearch = api;
})(typeof window !== 'undefined' ? window : globalThis);

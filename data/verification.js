/* Content governance registry (plan Phase 18).
   Records ONLY facts that were checked against first-party Microsoft pages, with the exact URL and the date
   of the check. Anything not listed here is UNVERIFIED and is shown that way in the UI (#/freshness and on
   each service page). Add a record only after reading the source; never copy a date forward without a re-check.

   Schema
     sources[id]        { title, url, pageUpdated? }   pageUpdated = date shown on the source page, if any
     records[]          { id, kind:'service', lastVerified:'YYYY-MM-DD', status, claims:[], sources:[ids], caveats? }
     modelLifecycle[]   { key, label, lifecycle, retirement, replacement?, note?, source }
     modules[]          page-level modules: { id, name, route, file, verified, scope, remaining }
   Review policy: see docs/content-governance.md. A record is "due" when lastVerified is older than
   reviewIntervalDays for its kind. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.verification = {
  asOf: '2026-11-20',
  reviewIntervalDays: { service: 90, lifecycle: 30, pricing: 30 },

  sources: {
    'model-retirement': {
      title: 'Model retirement schedule - Microsoft Foundry',
      url: 'https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule',
      pageUpdated: '2026-11-18'
    },
    'model-lifecycle-policy': {
      title: 'Foundry Models lifecycle and support policy',
      url: 'https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirements'
    },
    'af-overview': {
      title: 'Microsoft Agent Framework Overview',
      url: 'https://learn.microsoft.com/en-us/agent-framework/overview/'
    },
    'af-1-0': {
      title: 'Microsoft Agent Framework Version 1.0 (Agent Framework devblog)',
      url: 'https://devblogs.microsoft.com/agent-framework/microsoft-agent-framework-version-1-0/'
    },
    'af-migration': {
      title: 'Agent Framework migration guide (Semantic Kernel, AutoGen)',
      url: 'https://learn.microsoft.com/en-us/agent-framework/migration-guide/'
    },
    'af-foundry-hosted': {
      title: 'Foundry Hosted Agents (Agent Framework docs)',
      url: 'https://learn.microsoft.com/en-us/agent-framework/hosting/foundry-hosted-agent'
    },
    'foundry-what-is': {
      title: 'What is Microsoft Foundry?',
      url: 'https://learn.microsoft.com/en-us/azure/foundry/what-is-foundry'
    },
    'foundry-agents-overview': {
      title: 'What is Microsoft Foundry Agent Service?',
      url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/overview'
    },
    'search-limits': {
      title: 'Service limits in Foundry IQ (Azure AI Search)',
      url: 'https://learn.microsoft.com/en-us/azure/search/search-limits-quotas-capacity'
    },
    'search-upgrade': {
      title: 'Upgrade your Azure AI Search service in the Azure portal',
      url: 'https://learn.microsoft.com/en-us/azure/search/search-how-to-upgrade'
    },
    'search-sku': {
      title: 'Choose a pricing model and service tier in Foundry IQ (Azure AI Search)',
      url: 'https://learn.microsoft.com/en-us/azure/search/search-sku-tier'
    }
  },

  records: [
    {
      id: 'agent-framework', kind: 'service', lastVerified: '2026-11-20', status: 'GA (v1.0)',
      claims: [
        'Version 1.0 is the production-ready release for both .NET and Python, with stable APIs and a long-term-support commitment (announced April 2026).',
        'Microsoft describes Agent Framework as the next generation of both Semantic Kernel and AutoGen; migration guides exist for each.',
        'Agents and workflows are the two main building blocks; model providers include Microsoft Foundry, Azure OpenAI, OpenAI, Anthropic and Ollama.'
      ],
      sources: ['af-overview', 'af-1-0', 'af-migration'],
      caveats: 'Individual integrations and packages can carry their own release status. Check the package you install.'
    },
    {
      id: 'foundry', kind: 'service', lastVerified: '2026-11-20', status: null,
      claims: [
        'The platform is named Microsoft Foundry. It unifies agents, models and tools under one management grouping, with unified RBAC, networking and policy.',
        'Documentation now refers to Azure AI Search as "Foundry IQ (Azure AI Search)" in page titles; the Azure resource is still Azure AI Search.'
      ],
      sources: ['foundry-what-is'],
      caveats: 'The checked page does not give a GA/preview label for the platform as a whole, so none is shown. Status is per feature.'
    },
    {
      id: 'foundry-agent-service', kind: 'service', lastVerified: '2026-11-20', status: 'Mixed: check per feature',
      claims: [
        'Managed platform for building, deploying and scaling agents. You can define a prompt agent, package your own code as a hosted agent, or call the Responses API from an agent you run elsewhere.',
        'Microsoft Learn (Agent Framework hosting page) states that Foundry Hosted Agents is generally available.'
      ],
      sources: ['foundry-agents-overview', 'af-foundry-hosted'],
      caveats: 'The April 2026 Agent Framework 1.0 announcement listed memory and Toolbox in Foundry as preview. Re-check current status before depending on either.'
    },
    {
      id: 'ai-search', kind: 'service', lastVerified: '2026-11-20', status: null,
      claims: [
        'Dedicated tiers: Basic, Standard S1/S2/S3 (plus S3 HD), Storage Optimized L1/L2, and a Free tier with limited capability.',
        'Basic supports production workloads and can meet SLA requirements with up to three replicas.',
        'Per-partition storage after upgrade or on newer services: Basic 15 GB, S1 160 GB, S2 512 GB, S3 1 TB. Older services keep the lower limits (Basic 2 GB, S1 25 GB, S2 100 GB, S3 200 GB) until upgraded.',
        'Basic services created before 2024-04-03 were limited to one partition; newer ones support three.'
      ],
      sources: ['search-limits', 'search-upgrade', 'search-sku'],
      caveats: 'Limits depend on service creation date and Region. The limits page also lists a serverless pricing model that this Atlas does not cover yet. Prices are deliberately not recorded here.'
    }
  ],

  /* Azure OpenAI / Foundry Models lifecycle, copied from the retirement schedule (page updated 2026-11-18). */
  modelLifecycleSource: 'model-retirement',
  modelLifecycleVerified: '2026-11-20',
  modelLifecycle: [
    { key: 'gpt-4o', label: 'gpt-4o', lifecycle: 'Deprecated / Legacy', retirement: '2027-01-14 (2024-05-13); 2027-04-14 (2024-08-06, 2024-11-20)', replacement: 'gpt-5.1',
      note: 'Regional Standard deployments of 2024-05-13 already retired on 2026-03-31. Provisioned deployments are not upgraded automatically.' },
    { key: 'gpt-4o-mini', label: 'gpt-4o-mini', lifecycle: 'Deprecated', retirement: '2027-04-14 (2024-07-18)', replacement: null, note: 'No replacement is named on the schedule.' },
    { key: 'o1', label: 'o1', lifecycle: 'Deprecated', retirement: '2026-11-19 (2024-12-17)', replacement: 'gpt-5.6-sol, where available for your deployment type and Region', note: 'Retirement date has passed or is imminent. Verify your subscription.' },
    { key: 'o3-mini', label: 'o3-mini', lifecycle: 'Deprecated', retirement: '2026-11-19 (2025-01-31)', replacement: 'gpt-5.6-terra, where available for your deployment type and Region', note: 'Retirement date has passed or is imminent. Verify your subscription.' },
    { key: 'text-embedding-3-small', label: 'text-embedding-3-small', lifecycle: 'GA', retirement: '2028-02-09', replacement: null },
    { key: 'text-embedding-3-large', label: 'text-embedding-3-large', lifecycle: 'GA', retirement: '2028-02-09', replacement: null }
  ],
  modelLifecycleCurrentFamily: 'The schedule lists the GPT-5 family (gpt-5 through gpt-5.6-luna/sol/terra) as GA, with retirement dates between 2027-02-09 and 2028-01-11.',

  /* Page-level modules. `verified` is set only where a specific, narrow scope was checked. */
  modules: [
    { id: 'finops', name: 'AI FinOps & Cost Engineering', route: '#/finops', file: 'data/finops.js', verified: '2026-11-20', scope: 'Model lifecycle labels; AI Search per-partition storage limits.', remaining: 'All prices are illustrative and unsourced; scale profiles and optimization percentages are not benchmarks.' },
    { id: 'foundry', name: 'Microsoft Foundry Deep Dive', route: '#/foundry', file: 'data/foundry.js', verified: '2026-11-20', scope: 'Platform name; model lifecycle notice.', remaining: 'Model catalog size, PTU sizing, quota, tool list and capability claims.' },
    { id: 'agents', name: 'Agent Pattern Explorer', route: '#/agents', file: 'data/agentpatterns.js', verified: '2026-11-20', scope: 'Agent Framework status and Semantic Kernel/AutoGen positioning; model lifecycle notice.', remaining: 'Framework comparison for LangGraph, LangChain, MCP and OpenAPI; per-pattern model recommendations.' },
    { id: 'rag-lab', name: 'RAG Engineering Lab', route: '#/rag-lab', file: 'data/raglab.js', verified: null, scope: null, remaining: 'Everything, including benchmark figures that read as measurements.' },
    { id: 'advisor', name: 'Architecture Advisor', route: '#/advisor', file: 'data/advisor.js', verified: null, scope: null, remaining: 'Rule outputs name specific models; review against the lifecycle table.' },
    { id: 'foundation', name: 'Cloud Foundation & Networking', route: '#/foundation', file: 'data/foundation.js', verified: null, scope: null, remaining: 'Everything.' },
    { id: 'services-matrix', name: 'Azure Service Decision Matrix', route: '#/services-matrix', file: 'data/servicematrix.js', verified: null, scope: null, remaining: 'Pricing models, SLA, regions and quotas fields.' },
    { id: 'security-center', name: 'AI Security & Threat Defense Center', route: '#/security-center', file: 'data/securitycenter.js', verified: null, scope: null, remaining: 'Everything.' },
    { id: 'evaluation', name: 'AI Evaluation & Quality Center', route: '#/evaluation', file: 'data/evaluationcenter.js', verified: null, scope: null, remaining: 'Everything, including tool and SDK references.' },
    { id: 'ops', name: 'Production Operations', route: '#/ops', file: 'data/operations.js', verified: null, scope: null, remaining: 'KQL queries and table names, runbook steps, model deprecation runbook.' },
    { id: 'troubleshooting', name: 'Troubleshooting & KQL', route: '#/troubleshooting', file: 'data/troubleshooting.js', verified: null, scope: null, remaining: 'Everything.' },
    { id: 'traditional-ml', name: 'Traditional ML & MLOps', route: '#/traditional-ml', file: 'data/mltraditional.js', verified: null, scope: null, remaining: 'Everything.' },
    { id: 'advanced-ai', name: 'Advanced AI Topics', route: '#/advanced-ai', file: 'data/advancedai.js', verified: null, scope: null, remaining: 'Everything.' },
    { id: 'em-workspace', name: 'Engineering Manager Workspace', route: '#/em-workspace', file: 'data/emworkspace.js', verified: null, scope: null, remaining: 'Tool names in the skills matrix.' },
    { id: 'toolkit', name: 'Manager Toolkit', route: '#/toolkit', file: 'data/toolkit.js', verified: null, scope: null, remaining: 'Vendor/model matrix names current models.' },
    { id: 'labs', name: 'Labs & Roadmaps', route: '#/labs', file: 'data/labs.js', verified: null, scope: null, remaining: 'Lab steps, repository references and Microsoft Learn links have not been run or link-checked.' },
    { id: 'gov', name: 'Landing Zones & Governance', route: '#/gov', file: 'data/governance.js', verified: null, scope: null, remaining: 'Everything.' }
  ],

  /* Freshness state for a verification date. Pure; `now` is injectable so tests are deterministic.
     Returns 'unverified' (no date), 'verified' (within the review interval) or 'due' (older than it). */
  state: function (lastVerified, kind, now) {
    if (!lastVerified) return 'unverified';
    var days = this.reviewIntervalDays[kind] || 90;
    var age = ((now || new Date()).getTime() - new Date(lastVerified + 'T00:00:00Z').getTime()) / 864e5;
    return age > days ? 'due' : 'verified';
  }
};

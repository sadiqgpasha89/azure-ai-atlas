/* Domain 14: AI Cost Engineering, FinOps & Unit Economics
   Interactive multi-model pricing engine, RAG and agent cost modeling,
   monthly TCO estimation across scale tiers, and enterprise ROI calculations. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.finops = {
  title: 'AI FinOps & Cost Engineering Center',
  lede: 'Model token unit economics, RAG infrastructure capacity, agent execution multipliers, and business ROI across prototype, pilot, and enterprise scale.',

  // Price data below is an ILLUSTRATIVE, UNSOURCED snapshot of unknown date. It is kept only as editable
  // placeholder input for the calculators. Verify every price on the official Azure pricing page for your
  // model, deployment type and Region before using any figure. Do not present these as current list prices.
  priceStatus: {
    state: 'illustrative-unverified',
    note: 'Azure prices change by model, deployment type, Region and agreement. Use the override fields.',
    officialPricing: 'https://azure.microsoft.com/pricing/details/cognitive-services/openai-service/'
  },

  modelPricing: [
    { id: 'gpt-4o', lifecycleKey: 'gpt-4o', name: 'GPT-4o (Omni Frontier)', input1M: 2.50, cached1M: 1.25, output1M: 10.00, batchDiscount: 0.50, bestFor: 'Complex multi-step reasoning, supervisor synthesis, multimodal diagrams' },
    { id: 'gpt-4o-mini', lifecycleKey: 'gpt-4o-mini', name: 'GPT-4o-mini (Fast & Efficient)', input1M: 0.15, cached1M: 0.075, output1M: 0.60, batchDiscount: 0.50, bestFor: 'Query routing, classification, summarization, high-volume extraction' },
    { id: 'o1', lifecycleKey: 'o1', name: 'o1 (Deep Reasoning)', input1M: 15.00, cached1M: 7.50, output1M: 60.00, batchDiscount: 0.50, bestFor: 'Architecture planning, complex code generation, mathematical proofs' },
    { id: 'o3-mini', lifecycleKey: 'o3-mini', name: 'o3-mini (High-Speed Reasoning)', input1M: 1.10, cached1M: 0.55, output1M: 4.40, batchDiscount: 0.50, bestFor: 'STEM reasoning, multi-turn coding agents, structured planning' },
    { id: 'phi-4', lifecycleKey: null, name: 'Phi-4 (14B Small Language Model)', input1M: 0.10, cached1M: 0.05, output1M: 0.35, batchDiscount: 0.50, bestFor: 'Edge workloads, low-cost classification, offline privacy tasks' },
    { id: 'llama-3-3-70b', lifecycleKey: null, name: 'Meta Llama 3.3 70B (Foundry Catalog)', input1M: 0.70, cached1M: 0.35, output1M: 2.40, batchDiscount: 0.50, bestFor: 'Open-weights requirement, vendor-neutral enterprise deployment' },
    { id: 'text-embedding-3-small', lifecycleKey: 'text-embedding-3-small', name: 'text-embedding-3-small', input1M: 0.02, cached1M: 0.02, output1M: 0.00, batchDiscount: 0.0, bestFor: 'High-volume vector search, low storage footprint (1536 dims)' },
    { id: 'text-embedding-3-large', lifecycleKey: 'text-embedding-3-large', name: 'text-embedding-3-large', input1M: 0.13, cached1M: 0.13, output1M: 0.00, batchDiscount: 0.0, bestFor: 'Maximum semantic retrieval precision (3072 dims or truncated)' }
  ],

  // Per-partition storage reflects Microsoft Learn "Service limits" / "Upgrade" tables as of 2026-11-20:
  // services created after 2024-04-03 in most regions get the higher limit; older services or a few regions
  // keep the lower one. Prices are intentionally not stored here: take them from the Azure pricing page.
  searchTiers: [
    { tier: 'Basic', storagePerPartitionGB: 15, legacyStoragePerPartitionGB: 2, maxPartitions: 3, maxReplicas: 3, bestFor: 'Small internal pilots and dev environments; can meet SLA requirements with up to three replicas' },
    { tier: 'Standard S1', storagePerPartitionGB: 160, legacyStoragePerPartitionGB: 25, maxPartitions: 12, maxReplicas: 12, bestFor: 'Default production tier for most enterprise RAG workloads' },
    { tier: 'Standard S2', storagePerPartitionGB: 512, legacyStoragePerPartitionGB: 100, maxPartitions: 12, maxReplicas: 12, bestFor: 'Larger corpora and higher query throughput' },
    { tier: 'Standard S3', storagePerPartitionGB: 1024, legacyStoragePerPartitionGB: 200, maxPartitions: 12, maxReplicas: 12, bestFor: 'Very large corpora; S3 High Density trades storage for many more indexes' }
  ],
  searchTiersSource: { title: 'Upgrade your Azure AI Search service (limits tables)', url: 'https://learn.microsoft.com/en-us/azure/search/search-how-to-upgrade', verified: '2026-11-20' },

  costDrivers: [
    { component: 'LLM Inference', driver: 'Input prompt tokens, output completion tokens, model selection (larger vs smaller models), provisioned-throughput reservations.' },
    { component: 'Embeddings Generation', driver: 'Document corpus size, chunking token volume, re-indexing frequency, embedding dimension (1536 vs 3072).' },
    { component: 'Azure AI Search', driver: 'Search Unit (SU) tier, number of partitions (storage), number of replicas (QPS SLA), Semantic Ranker query units.' },
    { component: 'Document Ingestion (OCR)', driver: 'Page volume cracked via Document Intelligence (per-page pricing varies by model; check the pricing page).' },
    { component: 'Agent Execution Multipliers', driver: 'Number of agent reasoning loops, tool call rounds, and parallel sub-agent workers per user session.' },
    { component: 'Cloud Compute & Hosting', driver: 'Azure Container Apps vCPU/GB seconds, Azure Functions executions, Redis Managed Cache cluster size.' },
    { component: 'Storage & Data Lake', driver: 'Raw document volume in ADLS Gen2, Hot/Cool lifecycle tiers, cross-region replication (GRS/GZRS).' },
    { component: 'Observability & Telemetry', driver: 'Application Insights and Log Analytics log ingestion volume (GB/day) and retention policy duration.' },
    { component: 'Networking & Data Egress', driver: 'Cross-region data transfer fees, Azure Private Link endpoint hours, Azure Firewall data processed.' }
  ],

  scaleProfiles: [
    {
      name: 'Prototype / Sandbox',
      users: 50,
      dailyQueries: 200,
      monthlyTokens: '15 Million',
      searchTier: 'Basic (1 SU)',
      compute: 'ACA Consumption (Scaled to zero)',
      estimatedMonthlyTCO: '$250 – $500',
      costPerTask: '$0.04',
      assumptions: '100% pay-as-you-go, a small and a large model blended, minimal log retention.'
    },
    {
      name: 'Departmental Pilot',
      users: 500,
      dailyQueries: 3000,
      monthlyTokens: '250 Million',
      searchTier: 'Standard S1 (2 SUs: 1P x 2R for 99.9% SLA)',
      compute: 'ACA 2 replicas + Azure Managed Redis Basic',
      estimatedMonthlyTCO: '$1,800 – $3,200',
      costPerTask: '$0.03',
      assumptions: 'Hybrid search with Semantic Ranker, Prompt Caching enabled, 30-day log retention.'
    },
    {
      name: 'Enterprise Production',
      users: 5000,
      dailyQueries: 35000,
      monthlyTokens: '3.5 Billion',
      searchTier: 'Standard S1 (6 SUs: 2P x 3R for high QPS)',
      compute: 'ACA 6 replicas + Azure Managed Redis Standard + APIM',
      estimatedMonthlyTCO: '$12,000 – $22,000',
      costPerTask: '$0.02',
      assumptions: 'Intelligent model routing (about 70% small model, 30% larger model), active semantic caching.'
    },
    {
      name: 'Enterprise Scale (Mission-Critical)',
      users: 25000,
      dailyQueries: 250000,
      monthlyTokens: '25 Billion',
      searchTier: 'Standard S2 (12 SUs: 3P x 4R multi-region)',
      compute: 'Provisioned Throughput Units (100 PTUs) + Multi-region APIM',
      estimatedMonthlyTCO: '$65,000 – $110,000',
      costPerTask: '$0.012',
      assumptions: 'Dedicated PTU reservation, Batch API for offline jobs, aggressive token minification.'
    }
  ],

  optimizationStrategies: [
    { strategy: '1. Intelligent Model Routing', impact: '50 – 70% Token Savings', desc: 'Route routine questions (summaries, formatting, triage) to a smaller, cheaper model and reserve the larger model for complex multi-step synthesis. Measure the quality impact with your own evaluation set before shifting traffic.' },
    { strategy: '2. Automatic Prompt Caching', impact: 'Reduced input-token cost on cache hits (varies by model)', desc: 'Structure system prompts, few-shot examples, and RAG schemas with identical, stable prefixes so prompt caching can apply. Caching thresholds and discounts vary by model and deployment type, so check the current documentation.' },
    { strategy: '3. Semantic Context Compression', impact: '30 – 40% Token Reduction', desc: 'Extract and inject only the top-scoring sentences from retrieved chunks rather than dumping raw 1,000-token passages into the prompt.' },
    { strategy: '4. Semantic Caching with Redis', impact: '100% Token Elimination on Cache Hit', desc: 'Cache query embeddings in Azure Managed Redis; return cached answers immediately when user queries have cosine similarity >0.96 with past requests.' },
    { strategy: '5. Batch Inference API (50% Off)', impact: 'Batch pricing discount (varies by model)', desc: 'Submit non-real-time offline summarization, bulk document evaluation, and catalog enrichment jobs via the Batch API, which has a longer completion window.' },
    { strategy: '6. Agent Loop & Iteration Caps', impact: 'Prevents $50+ Runaway Sessions', desc: 'Hardcode strict iteration bounds (e.g. max 8 tool calls) and token budgets ($0.80 per session) in agent orchestrators.' },
    { strategy: '7. Azure AI Search Tier Rightsizing', impact: 'Avoids paying for an unneeded higher tier', desc: 'Fill Standard S1 partitions effectively before jumping to S2/S3 (per-partition storage differs by service age and Region; see the tier table), and clean up stale index versions.' },
    { strategy: '8. Log Analytics Retention Tuning', impact: '40% Observability Savings', desc: 'Reduce raw trace retention in Log Analytics from 365 days to 30 days, archiving raw JSON payloads to Cool Blob storage.' },
    { strategy: '9. Embedding Model Truncation', impact: '50% Vector Storage Reduction', desc: 'Use `text-embedding-3-large` with dimension truncation (e.g. 1536 dims instead of 3072) with <1% loss in retrieval precision.' },
    { strategy: '10. Token-Aware Prompt Minification', impact: '15 – 25% Prompt Reduction', desc: 'Strip verbose instructions, repetitive guidelines, and bloated JSON schema descriptions from production system prompts.' },
    { strategy: '11. Document Ingestion Deduplication', impact: 'Prevents 2x-5x OCR & Vector Bloat', desc: 'Compute SHA-256 hashes on source files to prevent cracking and indexing duplicate copies of identical corporate policies.' },
    { strategy: '12. Scale-to-Zero on Ingestion Workers', impact: 'Saves $200-$500/month Idle Compute', desc: 'Run document cracking and embedding generation on Azure Container Apps with KEDA scaling to zero when queue is empty.' },
    { strategy: '13. Pre-Filtered Retrieval Before Reranking', impact: 'Reduces Semantic Ranker Query Units', desc: 'Apply security ACL and department metadata filters first to narrow candidates to 50 items before invoking the Semantic Ranker.' },
    { strategy: '14. FinOps Cost Attribution Labels', impact: '100% Billing Visibility', desc: 'Tag every Azure OpenAI deployment and Container App with `CostCenter`, `Environment`, and `Project` for automated chargeback.' }
  ],

  /* ---------------- Calculators: pure functions (unit-tested in tests/finops.test.mjs) ----------------
     Every input is explicit. A value of 0 is a valid input and is never replaced by a default.
     Results are planning estimates, not Azure quotes. */

  tcoDefaults: {
    users: 2500, queriesPerUserDay: 12, inputTokens: 1800, outputTokens: 450, cacheHitPct: 40, daysPerMonth: 30.5,
    inputPer1M: 0.15, cachedPer1M: 0.075, outputPer1M: 0.60,
    searchMonthly: 490, hostingMonthly: 108, stateMonthly: 45, telemetryPer1kQueries: 0.15
  },

  calculateTCO: function (p) {
    var q = p.users * p.queriesPerUserDay * p.daysPerMonth;
    var cache = Math.min(100, Math.max(0, p.cacheHitPct)) / 100;
    var effectiveInputPer1M = p.inputPer1M * (1 - cache) + p.cachedPer1M * cache;
    var input = q * p.inputTokens / 1e6 * effectiveInputPer1M;
    var output = q * p.outputTokens / 1e6 * p.outputPer1M;
    var telemetry = q / 1000 * p.telemetryPer1kQueries;
    var total = input + output + p.searchMonthly + p.hostingMonthly + p.stateMonthly + telemetry;
    return {
      monthlyQueries: q, effectiveInputPer1M: effectiveInputPer1M,
      input: input, output: output, inference: input + output,
      search: p.searchMonthly, hosting: p.hostingMonthly, state: p.stateMonthly, telemetry: telemetry,
      total: total,
      perUser: p.users > 0 ? total / p.users : null,
      perQuery: q > 0 ? total / q : null
    };
  },

  roiDefaults: {
    employees: 450, hoursSavedWeekly: 2.5, hourlyWage: 65, weeksPerYear: 48, directCostSavings: 75000,
    annualCloudCost: 85000, annualEngineeringMaintenance: 110000, oneTimeBuildCost: 250000, realizationDiscountPct: 15
  },

  calculateROI: function (p) {
    var d = Math.min(100, Math.max(0, p.realizationDiscountPct)) / 100;
    var laborBenefit = p.employees * p.hoursSavedWeekly * p.weeksPerYear * p.hourlyWage;
    var grossBenefit = laborBenefit + p.directCostSavings;
    var adjustedBenefit = grossBenefit * (1 - d);
    var recurringCost = p.annualCloudCost + p.annualEngineeringMaintenance;
    var totalYear1Cost = recurringCost + p.oneTimeBuildCost;
    var netYear1 = adjustedBenefit - totalYear1Cost;
    var laborBase = p.employees * p.weeksPerYear * p.hourlyWage;
    // Hours saved per employee per week at which year-1 net benefit is exactly zero.
    var breakEvenHoursWeekly = (laborBase > 0 && d < 1) ? Math.max(0, (totalYear1Cost / (1 - d) - p.directCostSavings) / laborBase) : null;
    return {
      laborBenefit: laborBenefit, grossBenefit: grossBenefit, adjustedBenefit: adjustedBenefit,
      recurringCost: recurringCost, totalYear1Cost: totalYear1Cost, netYear1: netYear1,
      roiPercentage: totalYear1Cost > 0 ? netYear1 / totalYear1Cost * 100 : null,
      paybackMonths: adjustedBenefit > 0 ? totalYear1Cost / (adjustedBenefit / 12) : null,
      breakEvenHoursWeekly: breakEvenHoursWeekly
    };
  }
};

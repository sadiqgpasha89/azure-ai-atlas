/* Domain 14: AI Cost Engineering, FinOps & Unit Economics
   Interactive multi-model pricing engine, RAG and agent cost modeling,
   monthly TCO estimation across scale tiers, and enterprise ROI calculations. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.finops = {
  title: 'AI FinOps & Cost Engineering Center',
  lede: 'Model token unit economics, RAG infrastructure capacity, agent execution multipliers, and business ROI across prototype, pilot, and enterprise scale.',

  modelPricing: [
    { id: 'gpt-4o', name: 'GPT-4o (Omni Frontier)', input1M: 2.50, cached1M: 1.25, output1M: 10.00, batchDiscount: 0.50, bestFor: 'Complex multi-step reasoning, supervisor synthesis, multimodal diagrams' },
    { id: 'gpt-4o-mini', name: 'GPT-4o-mini (Fast & Efficient)', input1M: 0.15, cached1M: 0.075, output1M: 0.60, batchDiscount: 0.50, bestFor: 'Query routing, classification, summarization, high-volume extraction' },
    { id: 'o1', name: 'o1 (Deep Reasoning)', input1M: 15.00, cached1M: 7.50, output1M: 60.00, batchDiscount: 0.50, bestFor: 'Architecture planning, complex code generation, mathematical proofs' },
    { id: 'o3-mini', name: 'o3-mini (High-Speed Reasoning)', input1M: 1.10, cached1M: 0.55, output1M: 4.40, batchDiscount: 0.50, bestFor: 'STEM reasoning, multi-turn coding agents, structured planning' },
    { id: 'phi-4', name: 'Phi-4 (14B Small Language Model)', input1M: 0.10, cached1M: 0.05, output1M: 0.35, batchDiscount: 0.50, bestFor: 'Edge workloads, low-cost classification, offline privacy tasks' },
    { id: 'llama-3-3-70b', name: 'Meta Llama 3.3 70B (Foundry Catalog)', input1M: 0.70, cached1M: 0.35, output1M: 2.40, batchDiscount: 0.50, bestFor: 'Open-weights requirement, vendor-neutral enterprise deployment' },
    { id: 'text-embedding-3-small', name: 'text-embedding-3-small', input1M: 0.02, cached1M: 0.02, output1M: 0.00, batchDiscount: 0.0, bestFor: 'High-volume vector search, low storage footprint (1536 dims)' },
    { id: 'text-embedding-3-large', name: 'text-embedding-3-large', input1M: 0.13, cached1M: 0.13, output1M: 0.00, batchDiscount: 0.0, bestFor: 'Maximum semantic retrieval precision (3072 dims or truncated)' }
  ],

  searchTiers: [
    { tier: 'Basic', monthlyPerSU: 73.00, maxStoragePerPartitionGB: 2, maxPartitions: 3, maxReplicas: 3, bestFor: 'Small internal pilots and dev environments' },
    { tier: 'Standard S1', monthlyPerSU: 245.00, maxStoragePerPartitionGB: 25, maxPartitions: 12, maxReplicas: 12, bestFor: 'Standard enterprise RAG (up to 300GB with 12 partitions)' },
    { tier: 'Standard S2', monthlyPerSU: 980.00, maxStoragePerPartitionGB: 100, maxPartitions: 12, maxReplicas: 12, bestFor: 'High-volume corpora with high QPS throughput' },
    { tier: 'Standard S3', monthlyPerSU: 1960.00, maxStoragePerPartitionGB: 200, maxPartitions: 12, maxReplicas: 12, bestFor: 'Multi-terabyte enterprise knowledge retrieval' }
  ],

  costDrivers: [
    { component: 'LLM Inference', driver: 'Input prompt tokens, output completion tokens, model selection (GPT-4o vs mini), PTU reservations.' },
    { component: 'Embeddings Generation', driver: 'Document corpus size, chunking token volume, re-indexing frequency, embedding dimension (1536 vs 3072).' },
    { component: 'Azure AI Search', driver: 'Search Unit (SU) tier, number of partitions (storage), number of replicas (QPS SLA), Semantic Ranker query units.' },
    { component: 'Document Ingestion (OCR)', driver: 'Page volume cracked via Document Intelligence ($1.50/1k pages for Layout; $10-$50/1k for Prebuilt).' },
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
      assumptions: '100% pay-as-you-go, GPT-4o-mini + GPT-4o blended, minimal log retention.'
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
      assumptions: 'Intelligent model routing (70% mini, 30% GPT-4o), active semantic caching.'
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
    { strategy: '1. Intelligent Model Routing', impact: '50 – 70% Token Savings', desc: 'Route 70% of routine questions (summaries, formatting, triage) to GPT-4o-mini ($0.15/M) and reserve GPT-4o ($2.50/M) strictly for complex multi-step synthesis.' },
    { strategy: '2. Automatic Prompt Caching', impact: '50% Input Token Discount', desc: 'Structure system prompts, few-shot examples, and RAG schemas with identical prefixes >1,024 tokens to trigger Azure OpenAI automatic prompt caching.' },
    { strategy: '3. Semantic Context Compression', impact: '30 – 40% Token Reduction', desc: 'Extract and inject only the top-scoring sentences from retrieved chunks rather than dumping raw 1,000-token passages into the prompt.' },
    { strategy: '4. Semantic Caching with Redis', impact: '100% Token Elimination on Cache Hit', desc: 'Cache query embeddings in Azure Managed Redis; return cached answers immediately when user queries have cosine similarity >0.96 with past requests.' },
    { strategy: '5. Batch Inference API (50% Off)', impact: '50% Token Price Discount', desc: 'Submit non-real-time offline summarization, bulk document evaluation, and catalog enrichment jobs via the 24-hour Batch API.' },
    { strategy: '6. Agent Loop & Iteration Caps', impact: 'Prevents $50+ Runaway Sessions', desc: 'Hardcode strict iteration bounds (e.g. max 8 tool calls) and token budgets ($0.80 per session) in agent orchestrators.' },
    { strategy: '7. Azure AI Search Tier Rightsizing', impact: 'Up to $1,500/month per Index', desc: 'Use Standard S1 partitions (25GB each) effectively before jumping to S2/S3; clean up stale index versions.' },
    { strategy: '8. Log Analytics Retention Tuning', impact: '40% Observability Savings', desc: 'Reduce raw trace retention in Log Analytics from 365 days to 30 days, archiving raw JSON payloads to Cool Blob storage.' },
    { strategy: '9. Embedding Model Truncation', impact: '50% Vector Storage Reduction', desc: 'Use `text-embedding-3-large` with dimension truncation (e.g. 1536 dims instead of 3072) with <1% loss in retrieval precision.' },
    { strategy: '10. Token-Aware Prompt Minification', impact: '15 – 25% Prompt Reduction', desc: 'Strip verbose instructions, repetitive guidelines, and bloated JSON schema descriptions from production system prompts.' },
    { strategy: '11. Document Ingestion Deduplication', impact: 'Prevents 2x-5x OCR & Vector Bloat', desc: 'Compute SHA-256 hashes on source files to prevent cracking and indexing duplicate copies of identical corporate policies.' },
    { strategy: '12. Scale-to-Zero on Ingestion Workers', impact: 'Saves $200-$500/month Idle Compute', desc: 'Run document cracking and embedding generation on Azure Container Apps with KEDA scaling to zero when queue is empty.' },
    { strategy: '13. Pre-Filtered Retrieval Before Reranking', impact: 'Reduces Semantic Ranker Query Units', desc: 'Apply security ACL and department metadata filters first to narrow candidates to 50 items before invoking the Semantic Ranker.' },
    { strategy: '14. FinOps Cost Attribution Labels', impact: '100% Billing Visibility', desc: 'Tag every Azure OpenAI deployment and Container App with `CostCenter`, `Environment`, and `Project` for automated chargeback.' }
  ],

  calculateROI: function (params) {
    var employees = params.employees || 500;
    var hourlyWage = params.hourlyWage || 45;
    var hoursSavedPerWeekPerEmp = params.hoursSaved || 2.5;
    var weeksPerYear = 48;
    var annualLaborBenefit = employees * hoursSavedPerWeekPerEmp * weeksPerYear * hourlyWage;
    
    var errorReductionBenefit = (params.errorSavings || 50000);
    var totalAnnualBenefit = annualLaborBenefit + errorReductionBenefit;

    var cloudCostAnnual = (params.monthlyCloudCost || 2500) * 12;
    var engineeringMaintenanceAnnual = (params.annualMaintenance || 30000);
    var initialDevCostOneTime = (params.devCost || 60000);
    var totalYear1Cost = cloudCostAnnual + engineeringMaintenanceAnnual + initialDevCostOneTime;

    var netYear1Profit = totalAnnualBenefit - totalYear1Cost;
    var roiPercentage = totalYear1Cost > 0 ? (netYear1Profit / totalYear1Cost) * 100 : 0;
    var paybackMonths = totalAnnualBenefit > 0 ? (totalYear1Cost / (totalAnnualBenefit / 12)) : 0;

    return {
      annualLaborBenefit: annualLaborBenefit,
      totalAnnualBenefit: totalAnnualBenefit,
      totalYear1Cost: totalYear1Cost,
      netYear1Profit: netYear1Profit,
      roiPercentage: Math.round(roiPercentage),
      paybackMonths: Number(paybackMonths.toFixed(1))
    };
  }
};

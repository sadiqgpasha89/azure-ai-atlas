/* AI Cost Engineering, FinOps & Unit Economics
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
    { tier: 'Standard S2', monthlyPerSU: 980.00, maxStoragePerPartitionGB: 100, maxPartitions: 12, maxReplicas: 12, bestFor: 'Large corpora (1.2TB), high QPS production search' },
    { tier: 'Standard S3', monthlyPerSU: 1960.00, maxStoragePerPartitionGB: 200, maxPartitions: 12, maxReplicas: 12, bestFor: 'Multi-terabyte enterprise knowledge repositories' }
  ],

  platformBaselines: {
    docIntelligencePer1kPages: 10.00, // Prebuilt Layout model
    semanticRankerPer1kQueries: 1.00,
    containerAppsReplicaMonthly: 36.00, // 0.5 vCPU, 1GB RAM baseline
    cosmosDBBaselineMonthly: 25.00, // 400 RU/s autoscale
    azureMonitorPerGB: 2.30,
    egressPerGB: 0.087
  },

  scaleProfiles: [
    {
      id: 'prototype',
      name: 'Prototype / PoC',
      users: 50,
      queriesPerUserDay: 5,
      tokensPerQueryInput: 800,
      tokensPerQueryOutput: 250,
      model: 'gpt-4o-mini',
      monthlyEst: '$75 – $220 / mo',
      primaryDriver: 'Model tokens and dev Azure AI Search Basic tier.'
    },
    {
      id: 'pilot',
      name: 'Departmental Pilot',
      users: 500,
      queriesPerUserDay: 10,
      tokensPerQueryInput: 1500,
      tokensPerQueryOutput: 400,
      model: 'gpt-4o-mini + gpt-4o',
      monthlyEst: '$850 – $2,200 / mo',
      primaryDriver: 'AI Search S1 tier ($245/SU) and frontier model synthesis calls.'
    },
    {
      id: 'production',
      name: 'Enterprise Production',
      users: 5000,
      queriesPerUserDay: 15,
      tokensPerQueryInput: 2000,
      tokensPerQueryOutput: 500,
      model: 'gpt-4o with prompt caching',
      monthlyEst: '$6,500 – $14,000 / mo',
      primaryDriver: 'Frontier LLM tokens, 2x AI Search S1 replicas for HA SLA, Application Insights logs.'
    },
    {
      id: 'scale',
      name: 'Global Enterprise Scale',
      users: 50000,
      queriesPerUserDay: 20,
      tokensPerQueryInput: 2500,
      tokensPerQueryOutput: 600,
      model: 'PTU (Provisioned Throughput)',
      monthlyEst: '$45,000 – $95,000 / mo',
      primaryDriver: 'Dedicated PTU reservations ($25k+/mo), multi-region active-active deployment.'
    }
  ],

  calculateROI: function (p) {
    var employees = p.employees || 500;
    var hoursSavedWeekly = p.hoursSavedWeekly || 2.5;
    var hourlyWage = p.hourlyWage || 55.0;
    var weeksPerYear = 48;
    var annualLaborBenefit = employees * hoursSavedWeekly * weeksPerYear * hourlyWage;

    var directCostSavings = p.directCostSavings || 50000;
    var totalAnnualBenefit = annualLaborBenefit + directCostSavings;

    var annualCloudCost = p.annualCloudCost || 72000;
    var annualEngineeringMaintenance = p.annualEngineeringMaintenance || 90000;
    var totalAnnualCost = annualCloudCost + annualEngineeringMaintenance;

    var riskDiscount = p.riskDiscount || 0.85; // 15% discount for adoption ramp
    var adjustedBenefit = totalAnnualBenefit * riskDiscount;

    var netBenefit = adjustedBenefit - totalAnnualCost;
    var roiPercentage = (netBenefit / (totalAnnualCost || 1)) * 100;
    var paybackMonths = (totalAnnualCost / (adjustedBenefit / 12 || 1));

    return {
      annualLaborBenefit: annualLaborBenefit,
      totalAnnualBenefit: totalAnnualBenefit,
      adjustedBenefit: adjustedBenefit,
      totalAnnualCost: totalAnnualCost,
      netBenefit: netBenefit,
      roiPercentage: roiPercentage,
      paybackMonths: Math.max(0.5, paybackMonths)
    };
  }
};

/* Domain 11, 12 & 13: Production AI Operations, Observability & Platform Engineering
   Operational dashboards, 4 specialized dashboard blueprints, SRE runbooks,
   AI DevOps CI/CD pipeline, 13 versioned artifacts, and postmortem templates. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.operations = {
  title: 'Production AI Operations & Platform Engineering Centre',
  lede: 'Operating generative AI and agentic systems requires moving from traditional server health monitoring to stochastic system reliability: tracking token economics, prompt drift, retrieval quality, tool error rates, 429 throttling spikes, and automated CI/CD quality gates.',

  dashboardTemplate: {
    title: 'Mandatory Production AI Operations Dashboard Template',
    subtitle: 'The 10 critical operational indicators that every production AI application must monitor in real time.',
    widgets: [
      {
        id: 'task-throughput',
        title: 'Task Throughput & Completion Rate',
        metric: '98.4%',
        sub: '14,280 Total Tasks · 14,052 Succeeded · 228 Failed',
        status: 'ok',
        target: 'Target: >95% successful task completion rate',
        kusto: 'requests | where timestamp > ago(24h) | summarize Total=count(), Succeeded=countif(success == true) by bin(timestamp, 1h) | extend SuccessRate = (Succeeded * 100.0) / Total'
      },
      {
        id: 'ttft-latency',
        title: 'Time to First Token (TTFT)',
        metric: '820ms',
        sub: 'P50: 640ms · P95: 1,420ms · P99: 2,150ms',
        status: 'ok',
        target: 'Target: P95 TTFT < 1,500ms for streaming UX',
        kusto: 'dependencies | where type == "Azure OpenAI" | summarize P50=percentile(duration, 50), P95=percentile(duration, 95) by bin(timestamp, 15m)'
      },
      {
        id: 'token-burn',
        title: 'Token Consumption & Cache Efficiency',
        metric: '18.4M',
        sub: 'Prompt: 12.1M (42% Cached) · Completion: 6.3M',
        status: 'ok',
        target: 'Target: >35% prompt cache hit rate on repeated prefixes',
        kusto: 'customMetrics | where name in ("PromptTokens", "CompletionTokens", "CachedTokens") | summarize sum(value) by name, bin(timestamp, 1h)'
      },
      {
        id: 'throttling-429',
        title: 'Model Throttling Events (HTTP 429)',
        metric: '14 events',
        sub: '0.09% of all requests · 100% absorbed by gateway failover',
        status: 'ok',
        target: 'Target: <0.1% throttling rate; zero user-facing 429 errors',
        kusto: 'requests | where resultCode == "429" | summarize Throttles=count() by bin(timestamp, 5m), targetDeployment'
      },
      {
        id: 'rag-quality',
        title: 'RAG Retrieval & Groundedness Score',
        metric: '96.2%',
        sub: 'Recall@5: 91.4% · Groundedness: 96.2% · Relevance: 94.1%',
        status: 'ok',
        target: 'Target: >95% groundedness; >88% Recall@5',
        kusto: 'customMetrics | where name == "GroundednessScore" | summarize AvgGroundedness=avg(value) by bin(timestamp, 6h)'
      },
      {
        id: 'tool-failures',
        title: 'Agent Tool-Call Failure Rate',
        metric: '1.2%',
        sub: '42 failures out of 3,500 tool dispatches · 0 loops detected',
        status: 'ok',
        target: 'Target: <2.0% tool failure rate; 0 infinite loops',
        kusto: 'customEvents | where name == "AgentToolCall" | summarize Total=count(), Failed=countif(customDimensions.status != "success") by bin(timestamp, 1h)'
      },
      {
        id: 'cost-per-task',
        title: 'Cost per Successful Task',
        metric: '$0.0142',
        sub: 'Daily Spend: $203.40 · Forecast Month: $6,102',
        status: 'ok',
        target: 'Target: Unit cost below $0.020 per completed task',
        kusto: 'customMetrics | where name == "TaskCostUSD" | summarize CostPerTask=avg(value), DailyTotal=sum(value) by bin(timestamp, 1d)'
      },
      {
        id: 'eval-trend',
        title: 'Automated Evaluation Score Trend',
        metric: '92.8 / 100',
        sub: '+1.4 pts vs last model release · 0 critical safety violations',
        status: 'ok',
        target: 'Target: Quality score stable or improving across releases',
        kusto: 'customMetrics | where name == "CompositeQualityScore" | summarize QualityScore=avg(value) by tostring(customDimensions.promptVersion)'
      },
      {
        id: 'safety-shields',
        title: 'Content Safety & Prompt Shield Triggers',
        metric: '0.04%',
        sub: '12 blocks: 8 Prompt Injection · 4 Hate/Violence · 0 Data Leaks',
        status: 'ok',
        target: 'Target: <0.1% trigger rate; 100% blocked at perimeter',
        kusto: 'customEvents | where name in ("PromptShieldBlocked", "ContentSafetyFilter") | summarize Blocks=count() by bin(timestamp, 1h), tostring(customDimensions.category)'
      },
      {
        id: 'dependency-health',
        title: 'AI Dependency Availability & Health',
        metric: '99.98%',
        sub: 'OpenAI: 99.99% · AI Search: 100% · Cosmos DB: 99.99%',
        status: 'ok',
        target: 'Target: >99.95% multi-region composite dependency availability',
        kusto: 'dependencies | where target in ("Azure OpenAI", "Azure AI Search", "CosmosDB") | summarize Availability = (countif(success == true) * 100.0) / count() by bin(timestamp, 1h)'
      }
    ]
  },

  dashboardBlueprints: [
    {
      id: 'db-app',
      name: '1. AI Application Health Dashboard',
      audience: 'Product Engineers, SREs, App Owners',
      metrics: [
        'Requests per minute (RPM) and concurrency',
        'Overall request success rate & HTTP error distribution (4xx, 5xx)',
        'P50, P95, P99 end-to-end response latency',
        'Model inference latency vs upstream gateway latency',
        'Search retrieval latency and candidate chunk count',
        'Token usage per minute (Prompt vs Completion vs Cached)'
      ],
      kql: 'requests\n| summarize Total=count(), Succeeded=countif(success==true), P95Latency=percentile(duration, 95) by bin(timestamp, 5m)\n| extend SuccessRate=(Succeeded*100.0)/Total'
    },
    {
      id: 'db-agent',
      name: '2. Agent Workflow & Execution Dashboard',
      audience: 'AI Engineers, Agent Architects',
      metrics: [
        'Total tasks initiated vs successfully completed',
        'Task completion percentage (%)',
        'Average reasoning steps / loop turns per task',
        'Tool call distribution and tool invocation count',
        'Tool execution failure rate & schema validation errors',
        'Agent retries, fallback activations, and human escalations',
        'Average token cost per completed agent task'
      ],
      kql: 'customEvents\n| where name == "AgentTaskCompleted"\n| summarize AvgTurns=avg(todouble(customDimensions["step_count"])), CompletionRate=avg(todouble(customDimensions["success"]))*100.0, CostPerTask=avg(todouble(customDimensions["cost_usd"])) by bin(timestamp, 1h)'
    },
    {
      id: 'db-rag',
      name: '3. RAG Search & Grounding Dashboard',
      audience: 'Data Engineers, Search Specialists, Domain SMEs',
      metrics: [
        'Search query latency P50, P95 (BM25 vs Vector vs Semantic Ranker)',
        'Search success rate and empty result percentage (ResultCount == 0)',
        'Top-K score distribution and cosine similarity threshold hits',
        'Retrieval Precision@5 and Recall@5 on production sampled traffic',
        'Groundedness and Faithfulness score trend over time',
        'Citation verification accuracy and missing citation rate'
      ],
      kql: 'AzureDiagnostics\n| where Category == "SearchQueries"\n| summarize TotalQueries=count(), ZeroHits=countif(ResultCount_d==0), P95Duration=percentile(Duration_s, 95) by bin(TimeGenerated, 15m)'
    },
    {
      id: 'db-finops',
      name: '4. AI FinOps & Capacity Dashboard',
      audience: 'Engineering Managers, Finance Directors, FinOps Leads',
      metrics: [
        'Spend per foundation model (frontier vs small vs reasoning vs Phi-family models)',
        'Spend per deployment and application environment (Dev / Stage / Prod)',
        'Prompt caching cost savings percentage',
        'Cost per request, cost per user, and cost per successful business task',
        'PTU reservation utilization percentage vs burst overage fees',
        'Forecasted monthly cloud expenditure vs budget threshold'
      ],
      kql: 'customMetrics\n| where name in ("ModelCostUSD", "SearchCostUSD", "ComputeCostUSD")\n| summarize TotalSpend=sum(value) by name, tostring(customDimensions["Environment"]), bin(timestamp, 1d)'
    }
  ],

  devopsLifecycle: {
    title: 'GenAIOps CI/CD Pipeline & Promotion Lifecycle',
    flow: [
      '1. Code / Prompt / Agent Change committed to feature branch in Git',
      '2. Pull Request triggers automated GitHub Actions / Azure DevOps pipeline',
      '3. Static Analysis & Linting (Python Black, flake8, ESLint, Bicep linting)',
      '4. Deterministic Unit Tests (JSON schema parsers, regex filters, tool functions)',
      '5. Security & Secret Scan (Gitleaks, Checkov, Trivy container scanning)',
      '6. Automated AI Evaluation (Runs 200+ case golden benchmark dataset via Azure AI Evaluation SDK)',
      '7. Quality Gate Enforcement (Blocks PR if Groundedness <95% or Relevance <90%)',
      '8. Deploy to Development Environment (Automated Bicep / Terraform IaC execution)',
      '9. Component Integration Tests in private VNet',
      '10. Deploy to Staging Environment with sanitized production data mirroring',
      '11. Security Red-Team Scan (PyRIT automated adversarial jailbreak suite)',
      '12. Production Release Approval (EM sign-off on cost, quality, and security)',
      '13. Canary Deployment (Route 10% traffic via APIM; monitor for 429 and latency regressions)',
      '14. 100% General Availability with Continuous Telemetry and Automated Rollback'
    ],
    artifactsToVersion: [
      { artifact: 'Application Code', tool: 'Git (GitHub / Azure Repos)', format: 'Python, TypeScript, C#' },
      { artifact: 'Prompts & System Messages', tool: 'Prompt Registry / Git', format: 'Jinja2, Mustache, Markdown' },
      { artifact: 'Agent Instructions & Tools', tool: 'Foundry Agent Registry', format: 'JSON Schema, YAML specs' },
      { artifact: 'Workflow Graphs & Logic', tool: 'Git / State Machines', format: 'LangGraph, Agent Framework DAGs' },
      { artifact: 'Model Deployment Configs', tool: 'Bicep / Terraform IaC', format: 'Model name, version, TPM/RPM, PTU' },
      { artifact: 'Embedding Model Versions', tool: 'Search Index Schema', format: 'text-embedding-3-large v1 (1536 dims)' },
      { artifact: 'Chunking Configurations', tool: 'Ingestion Pipeline Config', format: 'Strategy, token size, overlap %' },
      { artifact: 'Retrieval Configurations', tool: 'Search Index Definition', format: 'HNSW params, BM25 weights, RRF k' },
      { artifact: 'Evaluation Datasets', tool: 'Azure ML Data Assets', format: 'Golden Q&A JSONL, ground-truth citations' },
      { artifact: 'Evaluation Run Results', tool: 'MLflow / Foundry Run History', format: 'Historical metrics, score trends' },
      { artifact: 'Search Index Schemas', tool: 'Bicep / Azure AI Search API', format: 'Fields, vector profiles, scoring profiles' },
      { artifact: 'Infrastructure as Code', tool: 'Bicep / Azure Verified Modules', format: 'VNets, Private Endpoints, IAM roles' },
      { artifact: 'Content Safety Blocklists', tool: 'Content Safety Studio', format: 'Custom regex, restricted words lists' }
    ],
    environmentStrategy: [
      {
        env: 'Development',
        purpose: 'Rapid experimentation, prompt prototyping, individual testing.',
        configuration: 'Single-region, Pay-as-you-go models, synthetic mock datasets, relaxed rate limits, shared search index.'
      },
      {
        env: 'Staging / Pre-Prod',
        purpose: 'Integration testing, automated golden evaluation benchmark runs, load testing, security scans.',
        configuration: 'Exact mirror of production private VNet, isolated staging search index, full Private Link isolation, automated quality gate execution.'
      },
      {
        env: 'Production',
        purpose: 'Live customer-facing workloads, mission-critical business transactions.',
        configuration: 'Multi-region APIM pool, PTU reservations or high-quota pools, automated Canary deployments, 24/7 SRE monitoring and alerting.'
      }
    ]
  },

  runbooks: [
    {
      id: 'rb-429-throttling',
      title: 'Runbook 1: Mitigating Model Throttling & 429 Outages',
      severity: 'P1 / P2',
      trigger: 'API Gateway reports >1% HTTP 429 responses over 5 minutes, or user-facing requests fail with capacity exhaustion.',
      steps: [
        '**Step 1: Check Multi-Region Failover Status:** Verify in [[apim|API Management]] that traffic has automatically spilled over to secondary deployment regions. If secondary deployment is disabled, immediately enable it in APIM backend pool configuration.',
        '**Step 2: Inspect Token Consumption Bursts:** Query Log Analytics to identify whether a single tenant, runaway loop, or scheduled batch job is consuming tokens disproportionately.',
        '**Step 3: Activate Emergency Semantic Caching:** In [[app-configuration|Azure App Configuration]], toggle aggressive semantic caching (`cache_threshold=0.88`) to answer repeat queries from [[redis]] without hitting model endpoints.',
        '**Step 4: Shift Non-Urgent Work to Batch:** Route asynchronous background jobs, document indexing, and offline evals to Global Batch endpoints.',
        '**Step 5: Request Quota / Scale PTU:** If traffic represents organic growth, submit an emergency Azure Quota increase request or allocate temporary Provisioned Throughput Units (PTU).'
      ]
    },
    {
      id: 'rb-quality-regression',
      title: 'Runbook 2: Diagnosing Quality Regressions & Low Groundedness',
      severity: 'P2',
      trigger: 'Online evaluation telemetry shows Groundedness dropping below 90% or user negative feedback spikes by >3x.',
      steps: [
        '**Step 1: Isolate the Failure Layer (Retrieval vs Model):** Inspect sample traces. If retrieved chunks do not contain the answer, the defect is in retrieval. If chunks contain the answer but the model generated hallucinations, the defect is in prompting or model behavior.',
        '**Step 2: Check Azure AI Search Index Freshness:** Verify that [[ai-search|AI Search]] indexers are running and not stalled. Check for indexer run failures, credential expiration, or storage ingestion backlogs in [[blob]].',
        '**Step 3: Review Recent Prompt / Config Commits:** Check [[azure-devops|Git commit history]] for prompt template changes, system instruction modifications, or model version updates released in the last 24 hours.',
        '**Step 4: Roll Back via Feature Flag:** If a prompt regression is confirmed, use [[app-configuration|App Configuration]] to immediately revert the active prompt version to the previous stable release hash without redeploying code.',
        '**Step 5: Add Regressed Cases to Golden Eval Set:** Capture failed user sessions, sanitize PII, and add them to the permanent automated regression evaluation dataset.'
      ]
    },
    {
      id: 'rb-agent-loops',
      title: 'Runbook 3: Handling Agent Tool Failures and Infinite Loops',
      severity: 'P1',
      trigger: 'Alert fires for agent session exceeding 5 tool turns, or token spend per session exceeds $1.00.',
      steps: [
        '**Step 1: Terminate Stuck Sessions:** The gateway or orchestrator automatically enforces hard step caps (max 5 turns) and returns an apologetic fallback message to the user.',
        '**Step 2: Inspect Tool Error Logs:** Check whether a specific downstream tool (e.g. database query function, search API) is returning HTTP 500 errors, schema mismatches, or connection timeouts that cause the agent to retry endlessly.',
        '**Step 3: Trip the Circuit Breaker:** If a downstream tool is degraded, use [[app-configuration|App Configuration]] to disable that specific tool from the agent\'s tool manifest dynamically.',
        '**Step 4: Review Agent Reasoning Traces:** Inspect the model\'s internal thought trace in [[azure-monitor]] to understand why it chose to loop or repeat identical queries.',
        '**Step 5: Update Tool Descriptions:** Clarify tool schemas, input parameters, and negative examples in the agent instructions to prevent future tool choice confusion.'
      ]
    },
    {
      id: 'rb-model-retirement',
      title: 'Runbook 4: Managing Model Deprecations and Upgrades',
      severity: 'P3 (Planned)',
      trigger: 'Microsoft announces retirement date for an active model version (e.g. GPT-4-0613 retirement or Content Safety groundedness retirement April 30, 2027).',
      steps: [
        '**Step 1: Inventory Active Deployments:** Identify every subscription, region, and application currently pinned to the retiring model version.',
        '**Step 2: Deploy Candidate Successor in Staging:** Deploy the recommended successor model named in the Microsoft retirement table alongside the retiring version in a staging environment.',
        '**Step 3: Execute Full Regression Eval Suite:** Run the 500+ case golden evaluation dataset against both models simultaneously. Compare Groundedness, Relevance, Latency, and Token Consumption side by side.',
        '**Step 4: Fine-Tune System Prompts:** Successor models often follow instructions differently (e.g. more concise, stricter safety); adjust system prompts to re-align output formatting.',
        '**Step 5: Canary Rollout:** Route 10% production traffic to the new model via [[apim]]; monitor error rates for 1 week before completing the 100% cutover.'
      ]
    }
  ],

  postmortemTemplate: {
    title: 'Incident Postmortem Template for AI & Stochastic Systems',
    intro: 'Standard postmortems assume deterministic software bugs. Incidents in generative AI systems often involve probabilistic failures, prompt drift, unexpected real-world distributions, or model provider rate limiting. Use this template for post-incident reviews.',
    templateMarkdown: `# AI Incident Postmortem: [Incident Title]

**Date:** YYYY-MM-DD
**Incident Lead:** [Engineering Manager / Incident Commander]
**Principal Reviewer:** [Principal Engineer / Architect]
**Severity:** P1 / P2
**Duration:** [Start Time] to [Resolution Time] (Total: X minutes)

---

## 1. Executive Summary
A brief 3-sentence summary: what happened, what was the customer and financial impact, and what resolved the issue.

## 2. Customer & Financial Impact
- **Affected Users / Tenants:** [Number of users or percentage of traffic affected]
- **Task Failure Rate:** [Peak percentage of failed or degraded tasks]
- **Token / Financial Cost Impact:** [Unplanned token burn or billing impact]
- **SLA Breach:** [Was customer availability or latency SLA breached?]

## 3. Incident Timeline (UTC)
- **HH:MM** - Anomaly detected by alert [Alert Name] or reported by [Team].
- **HH:MM** - Incident channel opened; on-call engineer paged.
- **HH:MM** - Root cause isolated to [Component: Model / Retrieval / Tool / Gateway].
- **HH:MM** - Mitigation applied [e.g. Traffic rerouted via APIM / Prompt rolled back in App Config].
- **HH:MM** - Error rates returned to normal baseline; monitoring verified.
- **HH:MM** - Incident declared resolved.

## 4. Root Cause Analysis: The 5 Whys (AI Specific)
1. **Why did the failure occur?** (e.g. The customer assistant hallucinated incorrect pricing data.)
2. **Why was incorrect data generated?** (e.g. The retrieval step returned outdated 2023 pricing sheets.)
3. **Why did retrieval return outdated data?** (e.g. The Blob Storage change-feed indexer stalled 48 hours ago.)
4. **Why was the indexer stall not detected?** (e.g. No alert was configured on AI Search indexer status telemetry.)
5. **Why was there no alert?** (e.g. The indexer was provisioned manually in the portal rather than via Bicep with monitoring policies.)

## 5. Failure Classification
- [ ] Retrieval Failure (Missing context, bad chunking, stale index)
- [ ] Model Hallucination / Grounding Failure (Model ignored context)
- [ ] Adversarial / Prompt Injection Attack
- [ ] Capacity / Rate Limiting (HTTP 429 throttling)
- [ ] Agent Loop / Tool Invocation Error
- [ ] Infrastructure / Network / DNS Failure

## 6. Corrective Actions & Prevention (Owner & Due Date)
| Action Item | Type | Owner | Due Date | Ticket / PR |
| :--- | :--- | :--- | :--- | :--- |
| Add Azure Monitor alert on indexer failure status | Prevention | SRE Lead | YYYY-MM-DD | #1234 |
| Add regressed incident queries to golden eval set | Quality | AI Engineer | YYYY-MM-DD | #1235 |
| Implement APIM multi-region circuit breaker | Resilience | Principal Eng | YYYY-MM-DD | #1236 |
`
  }
};

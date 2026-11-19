/* Observability & Operations */
S({
  id: 'azure-monitor', cat: 'ops', name: 'Azure Monitor (Log Analytics & Application Insights)', doc: 'azure/azure-monitor/',
  tag: 'Metrics, logs and traces for every layer, from GPU nodes to agent steps.',
  what: 'Azure Monitor is the platform for telemetry. **Metrics** are numeric time series; **logs** go to **Log Analytics** workspaces and are queried with KQL; **Application Insights** collects application traces and dependencies through **OpenTelemetry**; **alerts** and **workbooks** act on and display them. Most Azure services send platform metrics automatically and logs when you enable **diagnostic settings**.\n\nFor AI systems the telemetry that matters spans three layers: infrastructure (GPU utilisation, node health, queue depth), service (latency, errors, throttling, tokens) and quality (evaluation scores, filter hits, drift). Agent frameworks emit **traces** of each model and tool call, which is how you debug non-deterministic failures.',
  flow: ['Services emit', 'Diagnostic settings', 'Log Analytics / metrics', 'Queries + workbooks', 'Alert rules', 'Action group'],
  steps: [
    [0, 'Services emit platform metrics, and apps emit logs and **OpenTelemetry traces** with prompt, tool and token attributes.'],
    [1, '**Diagnostic settings** route resource logs (for example model request logs or search query logs) to a Log Analytics workspace.'],
    [2, 'Data is stored in tables (metrics in a time-series store); retention and table plans control cost.'],
    [3, 'KQL queries and **workbooks** show tokens, latency percentiles, throttling and cost by caller.'],
    [4, '**Alert rules** evaluate metrics or log queries on a schedule.'],
    [5, 'An **action group** pages the on-call, opens a ticket or runs automation, with a runbook for each alert.']
  ],
  gotchas: [
    '**Prompts and outputs are sensitive.** Logging full text puts personal data in a log table many people can read. Log metadata by default and treat content logging as a deliberate, restricted choice.',
    '**Log volume is the surprise bill.** Verbose traces from agents and GPUs add up fast. Sample, filter and use cheaper table plans for low-value data.',
    '**Alerts without owners are noise.** Every alert needs a named responder and a runbook.',
    '**Averages hide pain.** Track p95 and p99 latency, and time to first token for streaming.',
    '**Ingestion delay** means logs lag by minutes; use metrics for fast alerts.'
  ],
  edges: [
    'Managed Prometheus and Grafana collect GPU metrics (such as DCGM exporter data) from [[aks]] clusters.',
    'Cross-workspace queries let a platform team see across applications while workspaces stay separate for access control.',
    'Smart detection and anomaly rules can find latency and failure spikes without hand-tuned thresholds.'
  ],
  ml: [
    'Dashboards for tokens per minute, throttled requests, queue age and GPU utilisation.',
    'Per-run agent traces to find where a multi-step task went wrong.',
    'Alerts on model-quality proxies such as content-filter hit rate and thumbs-down rate.',
    'Evidence for [[aml-monitoring|monitoring]] and for capacity planning in [[quotas]].'
  ],
  pairs: ['foundry', 'apim', 'aks', 'aml-monitoring', 'cost-management', 'defender'],
  cost: 'Log Analytics bills per GB ingested (with cheaper plans for low-value tables) plus retention; Application Insights data goes to the same workspace. Alert rules and metrics queries have small charges. Control ingestion volume first.'
});

S({
  id: 'cost-management', cat: 'ops', name: 'Cost Management, budgets & reservations', doc: 'azure/cost-management-billing/',
  tag: 'See, attribute and control spend: tags, budgets, reservations and savings plans.',
  what: 'Microsoft Cost Management shows spend by subscription, resource group, resource and tag, lets you set **budgets** with alerts, and exports data for analysis. **Reservations** and **savings plans** lower the price of steady compute in return for a commitment, and **Azure Advisor** recommends right-sizing and removal of idle resources.\n\nIn AI systems the bill is dominated by tokens, GPUs and search capacity. Cost Management shows resource-level cost, but attributing token spend to a **feature or tenant** needs extra telemetry, usually from your [[apim|AI gateway]] or application logs.',
  flow: ['Usage metered', 'Cost data (with tags)', 'Analysis + exports', 'Budgets + alerts', 'Action group / automation', 'Commitments'],
  steps: [
    [0, 'Every resource meters its usage (tokens, VM hours, search units) into Azure billing.'],
    [1, 'Cost data is aggregated and enriched with **tags** and scope (management group, subscription, resource group).'],
    [2, 'You analyse it in the portal or export it to storage for FinOps reporting and joins with business data.'],
    [3, 'A **budget** compares actual and forecast spend to a threshold and sends alerts at set percentages.'],
    [4, 'An action group can notify owners or trigger automation, such as scaling down a non-production environment.'],
    [5, 'For steady workloads you buy **reservations or savings plans**; PTU capacity for models has its own reservation options.']
  ],
  gotchas: [
    '**Budgets alert, they do not stop spend.** A runaway agent can exceed a budget before anyone reads the email. Add rate limits and automation for hard stops.',
    '**Cost data lags.** Billing data can be hours behind. Use metrics and gateway token counts for fast signals.',
    '**Untagged resources are unowned.** Enforce tags with [[azure-policy]] from day one.',
    '**Shared resources hide attribution.** One model deployment serving many teams needs per-caller metrics to charge back.',
    '**Commitments are bets.** Reserve after you know the steady baseline, not before.'
  ],
  edges: [
    'Savings plans are flexible across VM families; reservations are cheaper but tied to a SKU and Region.',
    'Provisioned throughput for models is billed hourly and can be covered by reservations; compare against pay-per-token at your real volume.',
    'Cost anomaly alerts flag unexpected jumps without a fixed threshold.'
  ],
  ml: [
    'Track cost per successful task by combining Azure cost data with application traces.',
    'Find idle GPU clusters and endpoints through Advisor and usage reports.',
    'Decide between pay-per-token and provisioned capacity from measured usage.',
    'Show leaders the unit economics of each AI feature.'
  ],
  pairs: ['apim', 'foundry-models', 'gpu-vms', 'azure-policy', 'azure-monitor'],
  cost: 'Cost Management is free for Azure resources. The value comes from what it prevents: forgotten GPUs, unbounded token spend and unused commitments.'
});

S({
  id: 'bicep', cat: 'ops', name: 'Bicep & Azure Developer CLI', doc: 'azure/azure-resource-manager/bicep/',
  tag: 'Infrastructure as code for the platform: reviewable, repeatable, drift-resistant.',
  what: 'Bicep is Azure\'s domain-specific language for declaring resources, compiled to ARM templates. You describe the desired state (a Foundry resource, model deployments, private endpoints, role assignments) and Azure reconciles it. **Azure Developer CLI (`azd`)** adds ready-made templates for AI applications that provision resources and deploy code together. Terraform is a common alternative with Azure providers.\n\nInfrastructure as code matters more in AI work than most because the pieces multiply (resources, deployments, quotas, identities, networking) and manual setups are impossible to audit or rebuild.',
  flow: ['Bicep files in Git', 'Pull request + what-if', 'Pipeline deploy', 'ARM applies state', 'Policy check', 'Drift review'],
  steps: [
    [0, 'Engineers describe infrastructure in Bicep modules stored in Git.'],
    [1, 'A pull request runs **what-if** to show exactly what would change, and reviewers approve it.'],
    [2, 'A pipeline deploys using a workload identity, not a person\'s credentials.'],
    [3, 'Azure Resource Manager creates or updates the resources.'],
    [4, '[[azure-policy|Policies]] evaluate the result and block non-compliant changes.'],
    [5, 'Scheduled what-if runs or deployment stacks detect and report drift from the declared state.']
  ],
  gotchas: [
    '**Quota and capacity are not in the template.** A perfectly valid deployment can fail because GPU or model quota is missing; check [[quotas]] first.',
    '**Model deployments are resources too.** Version pinning and capacity settings belong in code, or they drift.',
    '**Secrets must not live in parameters.** Use [[key-vault]] references and managed identities.',
    '**Some changes are destructive.** Renaming or changing an immutable property recreates the resource and can lose data; read what-if carefully.',
    '**Portal edits cause drift.** Restrict production changes to the pipeline.'
  ],
  edges: [
    '**Azure Verified Modules** provide tested, reusable modules for common resources.',
    '**Deployment stacks** can manage and clean up a set of resources as one unit.',
    '`azd` templates for AI chat and agent apps are a fast route to a working baseline you can then harden.'
  ],
  ml: [
    'Reproducible environments for Foundry, search, networking and identities across dev, test and production.',
    'Reviewed changes to model deployments, capacity and content filters.',
    'Repeatable recovery of a platform in a new Region.',
    'A starting point from `azd` AI templates that you adapt to your standards.'
  ],
  pairs: ['azure-policy', 'key-vault', 'quotas', 'entra-id', 'foundry'],
  cost: 'Bicep and ARM are free. The payoff is avoided waste and faster recovery: environments you can create and destroy on demand, and no orphaned resources nobody remembers owning.'
});

S({
  id: 'quotas', cat: 'ops', name: 'Azure Quotas & capacity', doc: 'azure/quotas/',
  tag: 'The limits that decide whether a launch works: GPU vCPUs, tokens per minute and provisioned capacity.',
  what: 'Quotas are limits on what a subscription can deploy: **vCPUs per VM family per Region** (the GPU quota behind [[gpu-vms]] and [[aml-training]]), **tokens and requests per minute per model per Region** for [[foundry-models]], **PTU quota** for provisioned deployments, and many service-specific limits. The **Azure Quotas** experience shows usage against limits and lets you request increases, and Foundry has its own quota view for models.\n\nThe key idea is that **quota is permission, not capacity**. Approved quota does not guarantee that hardware or model capacity is free in that Region at that moment. Planning for both is the difference between a smooth launch and an incident.',
  flow: ['Estimate peak', 'Check current quota', 'Request increase', 'Approval', 'Capacity check at deploy', 'Monitor usage'],
  steps: [
    [0, 'You estimate peak demand: GPU count by VM family, or tokens per minute from requests per minute times average tokens.'],
    [1, 'You compare it with current quota in Azure Quotas (compute) or the Foundry quota pane (models).'],
    [2, 'You submit an increase request with the Region, family or model, and a business justification.'],
    [3, 'Small increases may be approved automatically; large GPU or PTU requests go through review and take days.'],
    [4, 'When you deploy, Azure still needs real capacity; a capacity shortfall can fail the deployment even with quota.'],
    [5, 'You track utilisation and alert when approaching limits, and re-forecast with growth.']
  ],
  gotchas: [
    '**Quota requests take days, capacity is a separate question.** Ask early, and for scarce SKUs ask for a capacity reservation or provisioned deployment where the service offers it.',
    '**Quota is per Region and per family.** Moving to another Region or SKU starts from zero.',
    '**Model quota is shared across a subscription\'s deployments** of that model in that Region; one team can starve another.',
    '**Over-requesting without use** can be reclaimed. Keep requests tied to real forecasts.',
    '**Retries multiply load.** Throttled clients that retry immediately make a shortage worse; use jittered backoff.'
  ],
  edges: [
    'Spreading across several Regions (and deployment types) raises effective throughput but changes data-residency posture.',
    'Capacity reservations for VMs guarantee capacity for a price, whether or not you run.',
    'Enterprise agreements and account teams can help with scarce accelerators.'
  ],
  ml: [
    'A pre-launch checklist item: quota covers peak in every Region used, plus a fallback.',
    'Capacity planning for fine-tuning and training bursts.',
    'Deciding between pay-per-token and provisioned deployments from measured peak demand.',
    'Alerting on quota utilisation to avoid surprise throttling.'
  ],
  pairs: ['gpu-vms', 'foundry-models', 'aml-training', 'aks', 'apim', 'cost-management'],
  cost: 'Quota itself is free. Capacity reservations, provisioned throughput and unused committed capacity are what cost money, so match them to a measured baseline.'
});

/* Production Architecture Troubleshooting & Failure Patterns
   Diagnostic workflows, root-cause analyses, resolution steps, and KQL queries
   for RAG systems, autonomous agent loops, and Azure platform infrastructure. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.troubleshooting = {
  title: 'Production Troubleshooting & Failure Catalog',
  lede: 'Actionable root-cause analyses, diagnostics, resolution procedures, and KQL queries for production AI incidents.',

  categories: [
    {
      id: 'rag',
      name: 'RAG & Retrieval Failures',
      issues: [
        {
          id: 'rag-hallucination',
          title: 'Answers Hallucinating Despite Retrieval',
          symptom: 'Model generates plausible but factually incorrect assertions that are completely absent from the retrieved passages.',
          rootCauses: 'Retrieved chunks are tangentially related but do not contain the specific answer; system prompt lacks strict groundedness instructions; temperature is too high (>0.3).',
          diagnostics: 'Inspect the exact retrieved chunk payload sent to the LLM in Application Insights. Verify whether the ground-truth fact exists in any retrieved chunk.',
          azureTools: 'Azure AI Foundry Tracing, Application Insights request telemetry, Azure AI Evaluation SDK (Groundedness metric).',
          resolution: '1. Set model temperature to 0.0. 2. Enforce strict system prompt instruction: "Answer ONLY using the provided facts in <context>. If context does not contain the answer, reply: I do not have enough information." 3. Enable Azure AI Search Semantic Ranker.',
          prevention: 'Integrate automated CI/CD evaluation gate checking Groundedness >95% on 200 unanswerable test questions.',
          kql: 'traces\n| where customDimensions["genai.system"] == "azure_openai"\n| extend groundedness = todouble(customDimensions["eval.groundedness"])\n| where groundedness < 0.8\n| project timestamp, operation_Id, message, groundedness\n| order by timestamp desc'
        },
        {
          id: 'rag-recall-fail',
          title: 'Relevant Documents Not Found (Low Recall)',
          symptom: 'User queries return "I do not have enough information" even though the required document exists in Blob storage.',
          rootCauses: '1. Chunk size too small or too large, diluting query embedding. 2. Query uses synonyms not matched by pure BM25 or domain acronyms not matched by pure vector search. 3. Overly restrictive security filters eliminating the document.',
          diagnostics: 'Run raw queries in Azure AI Search Search Explorer using pure vector, pure BM25, and hybrid search. Inspect the `count` of returned documents and check filter syntax.',
          azureTools: 'Azure AI Search Search Explorer, Indexer execution history, Cognitive Search REST API.',
          resolution: '1. Upgrade to Hybrid Search (BM25 + text-embedding-3-large with RRF). 2. Add an upstream Query Rewriter / Multi-Query LLM step. 3. Verify security group ACL filter values.',
          prevention: 'Measure Recall@5 on a golden test dataset of 100 enterprise queries weekly.',
          kql: 'AzureDiagnostics\n| where Category == "SearchQueries"\n| where ResultCount_d == 0\n| project TimeGenerated, Query_s, SearchService_s\n| summarize EmptyQueries = count() by bin(TimeGenerated, 1h)\n| render timechart'
        },
        {
          id: 'rag-slow-retrieval',
          title: 'High Search Latency (> 2,000ms)',
          symptom: 'End-to-end response time exceeds 4 seconds, with search retrieval taking 2,000ms+ before LLM generation even begins.',
          rootCauses: 'Search service under-provisioned (Standard S1 with high QPS); complex regex or wildcards on large indexes; cold Semantic Ranker cross-encoder under concurrency.',
          diagnostics: 'Check Azure AI Search Metrics: Search QPS, Search Latency, and Search Throttle Percentage.',
          azureTools: 'Azure Monitor Metrics (`SearchLatency`, `ThrottledSearchQueriesPercentage`), AI Search Diagnostic Logs.',
          resolution: '1. Add search service Replicas (scaling replicas distributes query read traffic and improves latency). 2. Limit `$top` candidates to 20 before semantic reranking. 3. Cache frequent query embeddings in Redis.',
          prevention: 'Set alert rule when Azure AI Search `ThrottledSearchQueriesPercentage` > 1% over 5 minutes.',
          kql: 'AzureMetrics\n| where ResourceProvider == "MICROSOFT.SEARCH"\n| where MetricName in ("SearchLatency", "ThrottledSearchQueriesPercentage")\n| summarize AvgLatency = avg(Average), MaxThrottling = max(Maximum) by bin(TimeGenerated, 5m), Resource\n| render timechart'
        },
        {
          id: 'rag-broken-tables',
          title: 'Jumbled Numbers from PDF Table Cracking',
          symptom: 'Financial tables extracted from PDF reports produce scrambled rows, wrong column associations, and incorrect math.',
          rootCauses: 'Naive text splitter treated PDF text streams linearly without parsing 2D bounding boxes and table cells.',
          diagnostics: 'Examine raw cracked text in the search index; if table rows appear as disjointed words, standard text extraction was used.',
          azureTools: 'Azure AI Document Intelligence Studio (`prebuilt-layout`).',
          resolution: 'Replace standard PDF indexer with Azure AI Document Intelligence layout model (`prebuilt-layout`) which generates structured Markdown tables with preserved row/column headers.',
          prevention: 'Enforce table-aware chunking pipeline rule in CI/CD document ingestion validation.',
          kql: 'traces\n| where customDimensions["document.type"] == "pdf"\n| where customDimensions["table.extracted"] == "false"\n| count'
        }
      ]
    },
    {
      id: 'agent',
      name: 'Agentic AI & Orchestration Failures',
      issues: [
        {
          id: 'agent-infinite-loop',
          title: 'Agent Trapped in Infinite Tool Loop',
          symptom: 'Agent repeatedly calls the same tool with identical or slightly modified parameters until hitting maximum timeout or token limit.',
          rootCauses: '1. Tool error message is ambiguous or returns null without actionable explanation. 2. Missing stop condition or loop detection in the agent framework. 3. System prompt tells the agent to keep trying indefinitely.',
          diagnostics: 'Inspect the OpenTelemetry distributed trace in Application Insights. Look for repeated spans with identical tool names.',
          azureTools: 'Azure Application Insights Application Map and End-to-end Transaction Details.',
          resolution: '1. Enforce strict `max_turns = 5` in the orchestrator. 2. Implement loop detection: if the same tool is invoked 3 times with the same hash, force an escalation branch. 3. Return structured error messages from tools (e.g. `{"status": "error", "reason": "item_not_found", "suggested_action": "ask_user_for_clarification"}`).',
          prevention: 'Unit test agents against simulated failing tool stubs and verify deterministic termination.',
          kql: 'dependencies\n| where target contains "tool"\n| summarize ToolCalls = count() by operation_Id, name\n| where ToolCalls > 6\n| order by ToolCalls desc'
        },
        {
          id: 'agent-wrong-tool',
          title: 'Incorrect Tool Selection & Hallucinated Parameters',
          symptom: 'Agent selects an inappropriate tool or passes parameters that violate the tool\'s OpenAPI / JSON schema.',
          rootCauses: 'Tool descriptions in system prompt are overlapping, vague, or lack concrete examples; model reasoning capability is too low for the tool count.',
          diagnostics: 'Review tool schema definitions and model prompt logs in Foundry Tracing.',
          azureTools: 'Microsoft Foundry Tracing, PromptFlow execution logs.',
          resolution: '1. Rewrite tool descriptions with explicit "Use this tool when X, do NOT use for Y" instructions. 2. Reduce tool catalog size per agent by introducing a Router / Triage agent. 3. Upgrade tool-calling model from mini to full frontier model (GPT-4o).',
          prevention: 'Run automated tool-calling benchmark evaluation verifying 95%+ selection accuracy across 100 test prompts.',
          kql: 'exceptions\n| where outerMessage contains "tool_call_validation_failed" or outerMessage contains "schema_error"\n| summarize ErrorCount = count() by operation_Name, bin(timestamp, 1h)\n| render columnchart'
        },
        {
          id: 'agent-high-cost',
          title: 'Token Spend Runaway in Multi-Agent Swarms',
          symptom: 'Daily Azure OpenAI token costs surge by 5x-10x following deployment of a multi-agent feature.',
          rootCauses: 'Agents passing complete unabridged conversational history back and forth across every turn; excessive parallel subagents; lack of prompt caching.',
          diagnostics: 'Examine Cost Management cost breakdown by resource and token usage metrics in APIM.',
          azureTools: 'Azure Cost Management, Azure API Management analytics, FinOps Toolkit.',
          resolution: '1. Implement conversational context summarization between agent handoffs. 2. Route classification and lightweight sub-tasks to GPT-4o-mini or Phi-4. 3. Structure system prompts to ensure static text appears at the top for prompt caching (>50% discount).',
          prevention: 'Set budget alerts in Azure Cost Management with automated webhook triggers to suspend non-critical endpoints at 110% budget.',
          kql: 'AzureDiagnostics\n| where ResourceProvider == "MICROSOFT.APIMANAGEMENT"\n| extend TotalTokens = toint(parse_json(BackendResponseBody)["usage"]["total_tokens"])\n| summarize DailyTokens = sum(TotalTokens) by bin(TimeGenerated, 1d)\n| render timechart'
        }
      ]
    },
    {
      id: 'azure',
      name: 'Azure Platform & Infrastructure Failures',
      issues: [
        {
          id: 'platform-429-throttling',
          title: 'HTTP 429 Too Many Requests (Token Rate Limiting)',
          symptom: 'Applications receive HTTP 429 errors from Azure OpenAI: "Requests to the OpenAI API have been throttled due to rate limits."',
          rootCauses: 'Application traffic exceeds the provisioned Tokens Per Minute (TPM) or Requests Per Minute (RPM) quota for the target deployment.',
          diagnostics: 'Inspect the `x-ratelimit-remaining-tokens` and `retry-after` response headers from Azure OpenAI.',
          azureTools: 'Azure Monitor Metrics (`BlockedCallCount`), APIM gateway logs.',
          resolution: '1. Request a TPM quota increase in the Azure portal. 2. Implement Azure API Management multi-region load balancing pool with round-robin or priority failover. 3. Apply exponential backoff with random jitter in client SDKs. 4. Upgrade high-volume production workloads to Provisioned Throughput Units (PTU).',
          prevention: 'Configure APIM token limit policy to throttle non-critical users before the shared Azure OpenAI backend quota is exhausted.',
          kql: 'AzureDiagnostics\n| where ResourceProvider == "MICROSOFT.COGNITIVESERVICES"\n| where ResultSignature == "429"\n| summarize ThrottledRequests = count() by bin(TimeGenerated, 5m), Resource\n| render timechart'
        },
        {
          id: 'platform-private-dns-fail',
          title: 'Private DNS Resolution Failure in Hub-and-Spoke',
          symptom: 'Container Apps or Functions cannot connect to Azure OpenAI or AI Search, throwing hostname not found (`NameResolutionFailure`) or 403 Forbidden.',
          rootCauses: 'Spoke Virtual Network is not linked to the Private DNS Zone (`privatelink.openai.azure.com` or `privatelink.search.windows.net`), or Azure Private DNS Resolver is missing.',
          diagnostics: 'Run `nslookup your-service.openai.azure.com` inside a container or debug VM in the spoke subnet. If it returns a public IP instead of a private 10.x.x.x IP, DNS linkage is broken.',
          azureTools: 'Azure Network Watcher IP Flow Verify, VNet DNS configuration blade, Azure CLI.',
          resolution: '1. Link the spoke VNet to the central Private DNS Zone in the hub. 2. Verify that the Private Endpoint has an active A record pointing to the network interface IP. 3. If using custom DNS servers, verify conditional forwarding to Azure DNS (168.63.129.16).',
          prevention: 'Enforce Azure Policy initiative that automatically links spoke VNets to enterprise private DNS zones during subscription vending.',
          kql: 'AzureDiagnostics\n| where Category == "NetworkSecurityGroupRuleCounter"\n| where Direction_s == "Outbound" and Action_s == "Deny"\n| summarize DeniedCount = count() by bin(TimeGenerated, 15m), DestinationIP_s'
        },
        {
          id: 'platform-managed-id-403',
          title: 'Managed Identity 403 Authorization Denied',
          symptom: 'Application receives HTTP 403 Forbidden when calling Azure AI Search or Azure OpenAI: "The principal does not have authorization to perform action."',
          rootCauses: 'System-assigned or user-assigned Managed Identity is missing the required Azure RBAC role assignment on the target resource (e.g. `Cognitive Services OpenAI User` or `Search Index Data Reader`).',
          diagnostics: 'Check the client App ID and Object ID in the failed request token and inspect Access Control (IAM) role assignments on the target Azure AI resource.',
          azureTools: 'Azure portal Access Control (IAM) Check Access tab, Azure Activity Log.',
          resolution: 'Assign the precise built-in RBAC role: `Cognitive Services OpenAI User` (for inference), `Search Index Data Contributor` (for writing chunks), or `Search Index Data Reader` (for retrieval). Allow 5-10 minutes for RBAC replication.',
          prevention: 'Automate role assignments declaratively in Bicep / Terraform infrastructure templates.',
          kql: 'AzureActivity\n| where OperationNameValue contains "RoleAssignment"\n| where ActivityStatusValue == "Success"\n| project TimeGenerated, Caller, Properties'
        }
      ]
    }
  ]
};

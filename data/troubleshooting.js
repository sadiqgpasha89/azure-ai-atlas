/* Domain 22: Production Architecture Troubleshooting & Failure Patterns
   Diagnostic workflows, root-cause analyses, resolution steps, and KQL queries
   for RAG systems, autonomous agent loops, and Azure platform infrastructure. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.troubleshooting = {
  title: 'Production Troubleshooting & Failure Catalog',
  lede: 'Actionable root-cause analyses, diagnostics, resolution procedures, and ready-to-run KQL queries for production AI incidents.',

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
          title: 'High Search Retrieval Latency (> 2,000ms)',
          symptom: 'End-to-end response time exceeds 4 seconds, with search retrieval taking 2,000ms+ before LLM generation even begins.',
          rootCauses: 'Search service under-provisioned (Standard S1 with high QPS); complex regex or wildcards on large indexes; cold Semantic Ranker cross-encoder under concurrency.',
          diagnostics: 'Check Azure AI Search metrics in Azure Monitor: Search Latency, Throttled Search Queries Percentage, and Search Queries Per Second.',
          azureTools: 'Azure Monitor Metrics, Search Service diagnostic settings, Log Analytics.',
          resolution: '1. Scale out Search Replicas (add replicas to increase QPS capacity). 2. Switch vector algorithm from Exhaustive KNN to HNSW with `m=8`. 3. Cache high-frequency query embeddings in Azure Managed Redis.',
          prevention: 'Set up Azure Monitor alert on `SearchQueries.AverageLatency > 500ms`.',
          kql: 'AzureDiagnostics\n| where Category == "SearchQueries"\n| where Duration_s > 2000\n| project TimeGenerated, OperationName, Duration_s, SearchService_s\n| summarize P95Duration = percentile(Duration_s, 95) by bin(TimeGenerated, 15m)\n| render timechart'
        },
        {
          id: 'rag-duplicate-answers',
          title: 'Duplicate Chunks & Redundant Responses',
          symptom: 'Synthesizer repeats identical sentences multiple times; retrieved context contains multiple copies of the exact same paragraph.',
          rootCauses: 'Duplicate files indexed from multiple folders (e.g. `/v1/policy.pdf` and `/v2/policy.pdf`); sliding window chunking overlap too high (e.g. 50%).',
          diagnostics: 'Inspect search results for identical text with different document IDs; check indexing pipelines for missing deduplication step.',
          azureTools: 'Azure AI Search index explorer, Document hashing script in ingestion worker.',
          resolution: '1. Implement SHA-256 content deduplication in ingestion pipeline. 2. Tune chunk overlap down to 10-15%. 3. Apply post-retrieval MMR (Maximal Marginal Relevance) deduplication.',
          prevention: 'Automate duplicate detection in data ingestion pipeline before writing vectors to search.',
          kql: 'traces\n| where message contains "retrieval_chunk"\n| summarize ChunkCount = count() by tostring(customDimensions["chunk_hash"])\n| where ChunkCount > 1'
        },
        {
          id: 'rag-missing-citations',
          title: 'Missing or Fabricated Citations',
          symptom: 'Model answers correctly but omits citation links, or references hallucinated page numbers and document titles.',
          rootCauses: 'System prompt does not enforce structural citation format (e.g. `[doc-1]`); retrieved chunk payloads do not include clean `title` and `sourceUrl` metadata.',
          diagnostics: 'Inspect the system prompt injection format; verify that metadata fields are populated in Azure AI Search payload.',
          azureTools: 'Azure AI Foundry Prompt Playground, Azure AI Evaluation SDK (Citation Correctness metric).',
          resolution: '1. Format injected chunks with explicit XML delimiters: `<doc id="1" title="HR Policy" page="4">...</doc>`. 2. Instruct model: "Every factual claim must cite its source using [doc-id]." 3. Validate citations in code before streaming.',
          prevention: 'Add automated CI/CD test verifying Citation Correctness >98% on test suite.',
          kql: 'traces\n| where customDimensions["genai.system"] == "azure_openai"\n| extend citations_valid = tobool(customDimensions["eval.citations_valid"])\n| where citations_valid == false'
        }
      ]
    },
    {
      id: 'agents',
      name: 'Agentic Workflow Failures',
      issues: [
        {
          id: 'agent-infinite-loop',
          title: 'Agent Trapped in Infinite Tool Execution Loop',
          symptom: 'Agent repeatedly invokes the same tool with slightly altered parameters until hitting the runtime execution timeout (10 minutes).',
          rootCauses: 'Tool error message is ambiguous ("Error 500"); system prompt lacks stopping criteria; no maximum turn counter enforced.',
          diagnostics: 'Inspect the agent trajectory trace in Application Insights. Look for repeated tool call names with identical inputs.',
          azureTools: 'Application Insights OpenTelemetry agent traces, Foundry Agent Service monitoring dashboard.',
          resolution: '1. Enforce hard iteration limit (max 8 steps) in the orchestrator runtime. 2. Ensure tools return clear, informative error observations. 3. Instruct model: "If a tool fails twice, stop and ask the user for clarification."',
          prevention: 'Add automated unit tests asserting agent convergence within 5 steps on typical edge cases.',
          kql: 'traces\n| where customDimensions["agent.step_count"] > 10\n| project timestamp, operation_Id, customDimensions["agent.name"], customDimensions["agent.step_count"]\n| order by timestamp desc'
        },
        {
          id: 'agent-wrong-tool',
          title: 'Agent Selecting Wrong Tool or Hallucinating Parameters',
          symptom: 'Agent calls the `DeleteUser` tool instead of `FindUser`, or passes invalid JSON parameter formats.',
          rootCauses: 'Tool descriptions in OpenAPI / JSON schema are vague or overlapping; model is an SLM not fine-tuned for tool calling.',
          diagnostics: 'Review tool JSON Schema definitions against OpenAI function calling guidelines.',
          azureTools: 'Foundry Agent Service tool playground, JSON Schema validator.',
          resolution: '1. Rewrite tool descriptions with explicit "Use this tool WHEN..." guidance and examples. 2. Enforce strict JSON schema types with `additionalProperties: false`. 3. Upgrade the agent to a more capable frontier-tier or reasoning-tier model.',
          prevention: 'Evaluate Tool Selection Accuracy (>98%) across 100 sample user intents during PR review.',
          kql: 'traces\n| where customDimensions["tool.status"] == "schema_validation_failed"\n| summarize Failures = count() by tostring(customDimensions["tool.name"])'
        },
        {
          id: 'agent-unsafe-actions',
          title: 'Agent Executing Unsafe or Unauthorized Actions',
          symptom: 'Agent writes directly to customer records, modifies production database rows, or issues refunds without authorization.',
          rootCauses: 'Missing Human-in-the-Loop approval gate; tool has write permissions using elevated service principal credentials.',
          diagnostics: 'Audit agent tool privileges in Azure Entra ID and API Management access policies.',
          azureTools: 'Entra ID RBAC audit logs, Azure API Management policy inspector.',
          resolution: '1. Restrict all agent tools to read-only queries by default. 2. Insert mandatory Human-in-the-Loop (HITL) approval webhook before any mutation tool. 3. Enforce On-Behalf-Of (OBO) token propagation.',
          prevention: 'Enforce architecture gate: zero autonomous write tools allowed without two-party human approval.',
          kql: 'AzureActivity\n| where OperationNameValue contains "write" or OperationNameValue contains "delete"\n| where Caller contains "agent-managed-identity"'
        },
        {
          id: 'agent-high-cost',
          title: 'Agent Cost Runaway ($10+ per Task)',
          symptom: 'Single customer sessions consume 150,000+ tokens, driving average task cost beyond business ROI viability.',
          rootCauses: 'Agent carries entire multi-turn tool history into every prompt without pruning; excessive parallel sub-agent spawning; using frontier-tier model for simple JSON parsing.',
          diagnostics: 'Check Token Usage breakdown per turn in Foundry Tracing.',
          azureTools: 'Azure Cost Management, Azure AI Foundry Usage & Quotas.',
          resolution: '1. Implement context pruning: retain only the last 3 tool observations in prompt. 2. Enforce hard session budget ($0.75 max). 3. Route formatting and extraction sub-tasks to small-tier model ($0.15/1M).',
          prevention: 'Configure daily cost alerts in Azure Cost Management per agent application.',
          kql: 'traces\n| extend tokens = toint(customDimensions["genai.usage.total_tokens"])\n| summarize TotalTokens = sum(tokens), TotalCost = sum(tokens) * 0.000005 by tostring(customDimensions["session_id"])\n| where TotalCost > 5.0'
        }
      ]
    },
    {
      id: 'platform',
      name: 'Azure Platform & Infrastructure Incidents',
      issues: [
        {
          id: 'azure-429-throttling',
          title: 'Azure OpenAI HTTP 429 Throttling (Rate Limit Exceeded)',
          symptom: 'API calls fail with `Requests to the OpenAI service have been blocked. Status: 429 RateLimitExceeded`.',
          rootCauses: 'Spike in token throughput exceeding subscribed TPM (Tokens Per Minute) or RPM (Requests Per Minute) quota; un-jittered retries flooding endpoint.',
          diagnostics: 'Inspect Azure OpenAI metrics in Azure Monitor: `Processed Prompt Tokens`, `Processed Inference Tokens`, and `Client Errors (429)`.',
          azureTools: 'Azure Monitor Metrics, Azure API Management token bucket policies, Azure AI Foundry Quotas.',
          resolution: '1. Implement exponential backoff with full jitter in client SDK. 2. Deploy Azure API Management in front of 2-3 regional Azure OpenAI instances with priority load balancing. 3. Upgrade to Provisioned Throughput Units (PTU).',
          prevention: 'Set up multi-region APIM pool (East US + Sweden Central) with automatic failover upon receiving 429.',
          kql: 'AzureDiagnostics\n| where ResourceProvider == "MICROSOFT.COGNITIVESERVICES"\n| where httpStatusCode_d == 429\n| summarize ThrottledCalls = count() by bin(TimeGenerated, 5m), DeploymentName_s\n| render timechart'
        },
        {
          id: 'azure-auth-managed-identity',
          title: 'Managed Identity Authentication Failure (401 / 403 Forbidden)',
          symptom: 'Application crashes on startup with `ClientAuthenticationError: DefaultAzureCredential failed to retrieve a token`.',
          rootCauses: 'System-Assigned Managed Identity not assigned `Cognitive Services OpenAI User` RBAC role; local developer environment missing Azure CLI login; VNet firewall blocking Entra ID endpoint.',
          diagnostics: 'Inspect Entra ID Sign-In logs; verify RBAC role assignment on Azure OpenAI resource.',
          azureTools: 'Entra ID Sign-in logs, Azure portal Access Control (IAM) pane, `az role assignment list`.',
          resolution: '1. Assign `Cognitive Services OpenAI User` role to the Container App / Function managed identity. 2. Ensure Private DNS Zone links allow resolution of `login.microsoftonline.com`. 3. For local dev, run `az login`.',
          prevention: 'Include RBAC role assignments in Infrastructure as Code (Bicep/Terraform) templates.',
          kql: 'SigninLogs\n| where AppDisplayName contains "OpenAI" or AppDisplayName contains "Foundry"\n| where ResultType != 0\n| project TimeGenerated, UserPrincipalName, AppDisplayName, ResultDescription'
        },
        {
          id: 'azure-private-dns-resolution',
          title: 'Private Endpoint DNS Resolution Failure',
          symptom: 'Compute instances fail to reach Azure OpenAI with `NameResolutionFailure` or route to public IP address instead of private 10.x IP.',
          rootCauses: 'Virtual Network link missing between compute VNet and Azure Private DNS Zone (`privatelink.openai.azure.com`); custom DNS server not forwarding to 168.63.129.16.',
          diagnostics: 'Run `nslookup <openai-name>.openai.azure.com` inside the compute container; check if returned IP is public or private (10.x.x.x).',
          azureTools: 'Azure Network Watcher IP Flow Verify, Private DNS Zone Virtual Network links blade.',
          resolution: '1. Link the Private DNS Zone `privatelink.openai.azure.com` to the compute VNet. 2. If using custom enterprise DNS, configure conditional forwarders pointing to Azure Private DNS Resolver.',
          prevention: 'Automate Private DNS Zone VNet linking via central Hub landing zone deployment.',
          kql: 'AzureDiagnostics\n| where Category == "NetworkSecurityGroupRuleCounter"\n| where Direction_s == "Outbound" and Action_s == "Deny"\n| project TimeGenerated, SourceIP_s, DestinationIP_s, DestinationPort_d'
        },
        {
          id: 'azure-regional-stockout',
          title: 'Regional Model Deployment Capacity Unavailable',
          symptom: 'Foundry deployment fails with `The model deployment cannot be provisioned due to insufficient capacity in this region`.',
          rootCauses: 'Global high demand for newest frontier or reasoning model SKU in a specific target region.',
          diagnostics: 'Check Azure Service Health and Foundry Model Catalog availability map.',
          azureTools: 'Azure Service Health, Azure AI Foundry portal deployment wizard.',
          resolution: '1. Deploy the model to an alternate paired region (e.g. Sweden Central, West Europe, Australia East). 2. Use Global Standard deployment type which pools cross-region capacity automatically. 3. Contact Microsoft account team for quota reservation.',
          prevention: 'Architect all enterprise AI systems with multi-region deployment configurations from day 1.',
          kql: 'AzureActivity\n| where OperationNameValue contains "deployments/write"\n| where ActivityStatusValue == "Failed"'
        }
      ]
    }
  ]
};

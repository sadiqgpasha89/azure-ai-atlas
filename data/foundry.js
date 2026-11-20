/* Domain 3: Microsoft Foundry Deep Dive
   Platform hierarchy, Model Catalog, PTU capacity planning, Agent Service runtime,
   evaluation engine, and production operations for enterprise GenAI. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.foundry = {
  title: 'Microsoft Foundry Deep Dive & Platform Architecture',
  lede: 'Microsoft Foundry is the unified enterprise platform for model selection, agent orchestration, safety guardrails, scientific evaluation, and production observability. Master both web portal and code-first SDK workflows.',

  sections: [
    {
      id: 'fundamentals',
      name: 'A. Platform Fundamentals & Hierarchy',
      desc: 'Understanding the Foundry resource model, tenancy boundaries, connections, and developer workflows.',
      subsections: [
        {
          title: 'Foundry Hub and Project Hierarchy',
          content: 'A Foundry Hub is the top-level Azure resource managing billing, network security (Private Endpoints, VNet integration), Customer-Managed Keys (CMK), and shared connections (Azure AI Search, Blob, Cosmos DB). Multiple Foundry Projects live within a single Hub, representing individual applications, development teams, or business domains. Projects share security policies while maintaining isolated model deployments, agent definitions, evaluation datasets, and run histories.'
        },
        {
          title: 'Resource Boundaries & Multi-Tenancy',
          content: 'Foundry enforces strong multi-tenant boundaries at the subscription, resource group, and Hub levels. Compute clusters for fine-tuning and evaluation run within the customer VNet. Data stored in connected storage accounts remains encrypted and customer-owned. Cross-project data access is strictly governed by Entra ID RBAC roles (`Azure AI Developer`, `Azure AI Administrator`).'
        },
        {
          title: 'Connections & Enterprise Integrations',
          content: 'Connections decouple application code from underlying data stores and API credentials. Built-in connection types include Azure AI Search, Azure Blob Storage, Azure Cosmos DB, Microsoft Fabric OneLake, and custom REST/OpenAPI webhooks. Authentication is managed via Managed Identity or Key Vault references, eliminating hardcoded keys across team projects.'
        },
        {
          title: 'Portal vs Code-First Workflows (`azure-ai-projects`)',
          content: 'The Foundry web portal (`ai.azure.com`) is optimized for exploratory prompt tuning, visual model benchmarking, and non-technical stakeholder reviews. Production engineering mandates the code-first SDK (`azure-ai-projects`, `azure-ai-evaluation`, `azure-identity`) and CI/CD automation via Bicep/Terraform and GitHub Actions, ensuring all deployments, prompts, and agent definitions are versioned in Git.'
        }
      ]
    },
    {
      id: 'catalog',
      name: 'B. Model Catalog & Selection Strategy',
      desc: 'Navigating 1,800+ models across frontier LLMs, open-weights, reasoning engines, and edge SLMs.',
      subsections: [
        {
          title: 'Model Categories & Trade-Offs',
          content: '• Frontier and small OpenAI models: Industry standard for complex general reasoning, tool calling, and multimodal vision.\n• Deep Reasoning Models: Chain-of-thought planning, algorithmic reasoning, complex code generation, and mathematical validation.\n• Open-Source / Open-Weight Models (Meta Llama 3.3 70B, Mistral Large, DeepSeek): Unrestricted model weights, vendor-neutral deployments, and fine-tuning freedom.\n• Small Language Models (Phi-4 14B): High-throughput, low-latency, cost-effective models optimized for classification, summarization, and edge deployment.\n• Specialized Models: text-embedding-3-large (3072 dims), Cohere Rerank, Document Intelligence layout models.'
        },
        {
          title: 'Serverless API vs Managed Compute Deployments',
          content: '• Serverless API (Pay-as-you-go): Deployed via Microsoft-managed infrastructure. Billed strictly per token consumed. Zero compute to manage, automatic scaling, immediate availability, but subject to regional quota ceilings.\n• Managed Compute (Dedicated GPU): Deployed onto dedicated Azure ML virtual machines (e.g. Standard_ND96asr_v4 with 8x A100/H100). Billed per VM-hour regardless of token traffic. Full control over vLLM server parameters, max context length, speculative decoding, and dedicated high-QPS throughput.'
        },
        {
          title: 'Tool Calling & Structured Output Optimization',
          content: 'Not all models excel at agentic tool calling. Many frontier, reasoning-tier and large open-weight models provide native JSON schema validation and function calling support with low schema failure rates (<0.5%). Smaller or unaligned models often require explicit parsing wrappers, retry loops, and schema reflection prompts.'
        }
      ]
    },
    {
      id: 'inference',
      name: 'C. Inference Economics & Capacity Planning',
      desc: 'Provisioned Throughput Units (PTU), TPM/RPM rate limits, fallback routing, and latency tuning.',
      subsections: [
        {
          title: 'Pay-as-you-go vs Provisioned Throughput (PTU)',
          content: 'Pay-as-you-go shares global capacity pools; requests are metered per 1,000 tokens and can receive HTTP 429 when regional tenant load surges. Provisioned Throughput Units (PTU) reserve dedicated tensor processing capacity on Microsoft hardware. One PTU provides predictable throughput and guaranteed latency bounds. Sized based on peak concurrency: e.g. 100 PTUs of frontier-tier model supports ~60-80 concurrent active sessions.'
        },
        {
          title: 'Batch Inference API (50% Cost Discount)',
          content: 'For non-real-time workloads (nightly document summarization, catalog enrichment, bulk evaluation runs), Foundry provides the Batch Inference API. Jobs are submitted via Blob Storage and complete within a 24-hour SLA window at exactly 50% of the standard token price, with separate non-competing batch quotas.'
        },
        {
          title: 'Token & Request Quota Governance (TPM & RPM)',
          content: 'Quotas are assigned per model SKU per subscription/region. Teams must implement client-side token bucket rate limiters, configure Azure API Management throttling policies, and design automated failover to alternate regions or fallback models (e.g. primary East US frontier-tier model -> secondary Sweden Central frontier-tier model -> fallback small-tier model) when 429 status codes occur.'
        },
        {
          title: 'Latency Optimization Techniques',
          content: '1. Streaming Server-Sent Events (SSE): Reduces Time to First Token (TTFT) from 2,500ms to <300ms, improving perceived user responsiveness.\n2. Prompt Caching: Automatic 50% cost and latency discount when prompts share prefixes >1,024 tokens (system prompts, few-shot examples, large schemas).\n3. Speculative Decoding: Leverages a small draft model (Phi-4) to propose tokens verified by a larger model (frontier-tier model), boosting generation speed by 1.8x.'
        }
      ]
    },
    {
      id: 'agents',
      name: 'D. Foundry Agent Service Capabilities',
      desc: 'Fully managed enterprise agent runtime with hosted tools, stateful threads, and identity delegation.',
      subsections: [
        {
          title: 'Hosted Tools & Sandboxed Execution',
          content: 'Foundry Agent Service provides built-in enterprise tools requiring zero custom container management:\n• Code Interpreter: Executes Python in a secure, isolated sandbox to analyze CSVs, generate charts, and solve mathematical equations.\n• Hosted File Search: Integrated vector search over uploaded customer documents with automated chunking, embeddings, and citation extraction.\n• Bing Web Search: Grounding agent queries against live internet data with citation URLs.\n• Function Tools & OpenAPI: Connects to arbitrary enterprise REST APIs defined by OpenAPI 3.0 specs.'
        },
        {
          title: 'Model Context Protocol (MCP) Integration',
          content: 'Foundry Agent Service supports the Model Context Protocol (MCP), allowing agents to discover and invoke tools, query external databases (SQL, Postgres), and access enterprise systems (Salesforce, Jira) over standardized JSON-RPC protocols with perimeter security.'
        },
        {
          title: 'Agent Identity & Token Delegation',
          content: 'Agents execute under a designated Entra ID Managed Identity. When interacting with downstream enterprise APIs (Microsoft Graph, SharePoint, internal databases), the agent uses the On-Behalf-Of (OBO) token flow, ensuring the agent inherits the exact access permissions of the human user initiating the session.'
        },
        {
          title: 'Agent Lifecycle, Versioning & Publishing',
          content: 'Agents maintain versioned system prompts, tool attachment lists, and temperature settings. Changes are staged in development environments, evaluated against automated regression test suites, and published as immutable endpoints accessible via SDK or REST API.'
        }
      ]
    },
    {
      id: 'evaluation',
      name: 'E. Evaluation, Tracing & Monitoring',
      desc: 'Scientific prompt experimentation, multi-metric benchmarking, and OpenTelemetry distributed tracing.',
      subsections: [
        {
          title: 'Dataset-Driven Evaluation Suites',
          content: 'Foundry provides automated evaluation against golden benchmark test sets. Evaluates both generative outputs (Groundedness, Relevance, Fluency, Coherence) and safety/risk dimensions (Hate/Unfairness, Sexual content, Violence, Self-harm, Protected material, Indirect prompt attack resistance).'
        },
        {
          title: 'Agent Workflow & Trajectory Evaluation',
          content: 'Evaluates multi-step agent trajectories: Did the agent choose the correct tool? Did it supply valid JSON parameters? Did it converge within expected loop iterations? Did it reach the stated goal without infinite looping or unnecessary tool calls?'
        },
        {
          title: 'Foundry Tracing with Application Insights & OpenTelemetry',
          content: 'Foundry features native OpenTelemetry instrumentation. Traces capture the full call graph: incoming user prompt -> intent classifier -> vector search query -> retrieved chunks -> LLM completion -> tool calls -> final output, recording token counts, latency, and model parameters at every hop.'
        }
      ]
    }
  ],

  codeExamples: [
    {
      title: 'Python SDK: Initializing Foundry Project & Agent Client',
      language: 'python',
      code: `from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

# Authenticate via Entra ID Managed Identity / Azure CLI
credential = DefaultAzureCredential()

# Connect to Foundry Project via connection string
project_client = AIProjectClient.from_connection_string(
    credential=credential,
    conn_str="<region>.api.azureml.ms;<subscription_id>;<resource_group>;<project_name>"
)

# List available deployments in the project
deployments = project_client.deployments.list()
for dep in deployments:
    print(f"Deployment: {dep.name} | Model: {dep.model}")`
    },
    {
      title: 'Python SDK: Creating a Code-Interpreter Agent with File Search',
      language: 'python',
      code: `from azure.ai.projects.models import CodeInterpreterTool, FileSearchTool

# Define agent with Code Interpreter and File Search tools
agent = project_client.agents.create_agent(
    model="<your-deployment-name>",
    name="financial-analyst-agent",
    instructions="You are an expert financial analyst. Analyze uploaded earnings PDFs and execute Python code to generate summary metrics and growth charts.",
    tools=[CodeInterpreterTool(), FileSearchTool()]
)

print(f"Created Agent ID: {agent.id}")`
    }
  ]
};

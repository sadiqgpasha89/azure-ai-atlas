/* Domain 1: Azure Cloud Foundation
   Core cloud infrastructure, networking, identity, storage, compute,
   and essential platform trade-off decisions for enterprise AI workloads. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.foundation = {
  title: 'Azure Cloud Foundation for AI Systems',
  lede: 'Enterprise AI workloads are only as reliable, secure, and performant as the underlying Azure platform infrastructure. Master virtual networking, Entra ID zero-trust identity, scalable storage, and compute primitives.',

  pillars: [
    {
      id: 'networking',
      name: 'Networking & Private Perimeter',
      color: '212',
      summary: 'Isolating models, vector stores, and datasets within private network perimeters without internet traversal.',
      topics: [
        {
          name: 'Azure Virtual Network (VNet) & Subnets',
          desc: 'The fundamental building block for private networks in Azure. AI subnets should be dedicated (e.g. `/24` or `/23`) to support private endpoints for Azure OpenAI, AI Search, Storage, and Key Vault alongside compute subnets with service delegations for Container Apps or AKS.'
        },
        {
          name: 'Network Security Groups (NSGs)',
          desc: 'Stateful packet filters applied at subnet and NIC levels. NSG rules must restrict inbound access to front-door gateways (APIM, Application Gateway) and block outbound internet access from AI compute subnets to prevent data exfiltration.'
        },
        {
          name: 'Azure Private Endpoints & Private Link',
          desc: 'Assigns private IP addresses from your VNet to Azure PaaS services (Azure OpenAI, Azure AI Search, Blob Storage, Cosmos DB). Ensures client traffic never traverses public internet, completely eliminating public IP exposure.'
        },
        {
          name: 'Azure Private DNS Zones',
          desc: 'Enables private name resolution for PaaS private endpoints (e.g. `privatelink.openai.azure.com`, `privatelink.search.windows.net`). Requires VNet links to all spoke VNets and hub resolver infrastructure.'
        },
        {
          name: 'VNet Peering & Hub-and-Spoke Topology',
          desc: 'Connects central connectivity hub (housing Azure Firewall, VPN/ExpressRoute, and Private DNS Resolvers) to spoke VNets (housing AI inference, agent runtimes, and data ingestion pipelines) with microsecond latency.'
        },
        {
          name: 'VPN Gateway & ExpressRoute',
          desc: 'Secure cross-premises connectivity linking on-premises enterprise data centers to Azure. ExpressRoute provides dedicated private fiber connections for high-volume database synchronization and SAP/mainframe integration.'
        },
        {
          name: 'Azure Firewall & User-Defined Routes (UDR)',
          desc: 'Route tables forcing all egress traffic through Azure Firewall or an NVA for deep packet inspection, TLS inspection, and FQDN filtering (e.g. restricting outbound agent web search tools to approved enterprise domains).'
        }
      ]
    },
    {
      id: 'identity',
      name: 'Identity & Access Management (Zero-Trust)',
      color: '268',
      summary: 'Securing AI services, agent tools, and user access via Microsoft Entra ID without hardcoded secrets.',
      topics: [
        {
          name: 'Microsoft Entra ID (Formerly Azure AD)',
          desc: 'Enterprise identity authority providing single sign-on, multi-factor authentication, and unified identity for humans, applications, and autonomous agents.'
        },
        {
          name: 'Managed Identities (System- & User-Assigned)',
          desc: 'Eliminates developer credential handling. Compute workloads (ACA, AKS, Functions) receive an automatic Entra ID identity rotated by Azure to authenticate directly to Azure OpenAI, AI Search, and Storage.'
        },
        {
          name: 'Azure Role-Based Access Control (RBAC)',
          desc: 'Fine-grained data plane roles replacing legacy connection strings: `Cognitive Services OpenAI User` (inference), `Search Index Data Contributor` (query & index), `Storage Blob Data Reader` (document access).'
        },
        {
          name: 'Conditional Access Policies',
          desc: 'Evaluates user risk, device compliance, geographic location, and MFA before granting access to AI applications, portals, and Foundry development environments.'
        },
        {
          name: 'Workload Identity Federation',
          desc: 'Enables GitHub Actions CI/CD pipelines and external Kubernetes pods to authenticate securely to Azure using short-lived OIDC tokens without persistent client secrets or passwords.'
        },
        {
          name: 'Service Principals & App Registrations',
          desc: 'Used when external third-party services or on-premises daemon applications need to call Azure AI APIs. Requires strict secret lifecycle management in Key Vault with automated certificate rotation.'
        },
        {
          name: 'OAuth 2.0 On-Behalf-Of (OBO) Flow',
          desc: 'Propagates the calling end-user identity through the API gateway and agent orchestrator down to the search index and storage layer, enforcing document-level security trimming based on user permissions.'
        }
      ]
    },
    {
      id: 'storage',
      name: 'Storage & Data Lake Foundation',
      color: '185',
      summary: 'High-throughput object storage and hierarchical data lakes powering training, RAG indexing, and model weights.',
      topics: [
        {
          name: 'Azure Blob Storage',
          desc: 'Massively scalable object storage for unstructured data (raw documents, PDFs, audio recordings, prompt traces, and model checkpoints). Supports hot, cool, cold, and archive access tiers.'
        },
        {
          name: 'ADLS Gen2 (Hierarchical Namespace)',
          desc: 'Enables file-system semantics with genuine directories on top of Blob storage. Crucial for big data analytics (Fabric, Databricks, Spark) because directory renames and atomic moves are O(1) metadata updates.'
        },
        {
          name: 'Azure Files & Managed Lustre',
          desc: 'Azure Files provides fully managed SMB/NFS file shares. Azure Managed Lustre provides ultra-high-throughput parallel POSIX file systems (>100 GB/s) for high-performance GPU cluster training in Azure ML.'
        },
        {
          name: 'Lifecycle Management Policies',
          desc: 'Automates cost optimization by transitioning raw training datasets and evaluation logs from Hot to Cool tier after 30 days, Cold tier after 90 days, and Archive tier after 180 days.'
        },
        {
          name: 'Storage Encryption & Customer-Managed Keys (CMK)',
          desc: 'All data is encrypted by default with 256-bit AES. Highly regulated industries enforce CMK stored in Azure Key Vault Managed HSM with automated key rotation and immutable soft-delete.'
        },
        {
          name: 'Replication Models (LRS, ZRS, GRS, GZRS)',
          desc: 'Zone-redundant storage (ZRS) synchronously replicates across three availability zones within a region. Geo-zone-redundant storage (GZRS) adds asynchronous cross-region disaster recovery replication.'
        }
      ]
    },
    {
      id: 'compute',
      name: 'Compute Platforms & Runtimes',
      color: '150',
      summary: 'Hosting AI microservices, agent orchestrators, streaming ingestion workers, and high-performance inference servers.',
      topics: [
        {
          name: 'Azure Container Apps (ACA)',
          desc: 'Serverless container platform powered by Kubernetes and KEDA. Autoscale from zero to hundreds of replicas based on HTTP concurrency, CPU/memory, or Service Bus queue depth. Ideal for 90% of AI APIs and agent workers.'
        },
        {
          name: 'Azure Kubernetes Service (AKS)',
          desc: 'Enterprise Kubernetes for large-scale, complex workloads. Required for custom GPU scheduling (NVIDIA A100/H100), InfiniBand multi-node distributed training, custom DaemonSets, and cross-cloud standardization.'
        },
        {
          name: 'Azure Functions (Flex Consumption & Premium)',
          desc: 'Event-driven serverless execution. Excels at asynchronous document parsing triggers (Blob created -> Document Intelligence OCR) and lightweight webhook integrations.'
        },
        {
          name: 'Azure App Service',
          desc: 'Fully managed web application hosting for corporate AI portals and conversational web UIs with built-in Entra ID authentication and custom domain SSL management.'
        },
        {
          name: 'GPU Virtual Machines (NC/ND-series)',
          desc: 'Specialized IaaS compute instances equipped with NVIDIA H100, A100, or L40S GPUs with InfiniBand networking for custom open-weight model hosting (vLLM) and deep fine-tuning.'
        },
        {
          name: 'Azure Container Registry (ACR)',
          desc: 'Private enterprise Docker registry integrated with Microsoft Defender for Cloud for container vulnerability scanning, content trust signing, and geo-replication.'
        }
      ]
    }
  ],

  decisions: [
    {
      title: 'Azure Container Apps (ACA) vs Azure Kubernetes Service (AKS)',
      category: 'Compute',
      question: 'Where should we host our AI backends, agent orchestrators, and MCP tool servers?',
      recommendation: 'Default to Azure Container Apps (ACA) unless custom GPU clusters or specialized Kubernetes primitives are required.',
      comparison: [
        ['Operational Overhead', 'Near Zero (Managed serverless; no node pools, ingress controllers, or control plane patching)', 'High (Requires dedicated platform team for upgrades, CNI networking, ingress, and security patches)'],
        ['Autoscaling', 'KEDA built-in (instant scale-to-zero based on HTTP requests, queue depth, or cron)', 'KEDA & HPA supported; scale-to-zero requires virtual nodes or Karpenter/node autoscaling'],
        ['GPU Support', 'Limited GPU SKUs available in selected regions for inference', 'Full support for NC/ND-series GPU node pools with InfiniBand and NVIDIA Operator'],
        ['Networking & Mesh', 'Native Envoy ingress, VNet injection, and Dapr microservice building blocks', 'Full control over CNI (Azure CNI / Cilium), Service Mesh (Istio), and network policies'],
        ['Best Workloads', 'Python FastAPI RAG backends, LangGraph agents, Semantic Kernel services, MCP servers', 'Multi-node GPU training, high-throughput vLLM hosting, enterprise-wide Kubernetes standards']
      ],
      redFlags: 'Choosing AKS without a dedicated Kubernetes operations team; choosing ACA for distributed multi-node LLM training.'
    },
    {
      title: 'Azure Functions vs Azure Container Apps (ACA)',
      category: 'Compute',
      question: 'When should we use serverless Functions versus containerized microservices?',
      recommendation: 'Use Functions for stateless event-driven triggers; use Container Apps for long-running processes, WebSockets, and complex Python frameworks.',
      comparison: [
        ['Execution Model', 'Stateless event handlers invoked by triggers (HTTP, Blob, Service Bus, Event Grid)', 'Persistent or dynamic container instances running standard web servers or workers'],
        ['Timeout Limits', '5-10 minutes on Consumption; up to 60 minutes on Flex/Premium', 'No timeout limits for background workers; HTTP request timeout configurable up to 30 minutes'],
        ['Streaming & WebSockets', 'Limited support for long-running streaming HTTP connections', 'Native bidirectional WebSockets and HTTP/2 Server-Sent Events (SSE) for LLM streaming'],
        ['Cold Starts', 'Can experience 2-5 second cold starts on Python Consumption plans', 'Fast startup with minimum replica settings (minReplicas=1) eliminating cold starts entirely'],
        ['Best Workloads', 'Document ingestion triggers, queue-based image OCR, scheduled database sync', 'RAG query APIs, multi-turn agent execution loops, LangGraph state machines, MCP servers']
      ],
      redFlags: 'Hosting a complex multi-turn conversational agent with in-memory state on Consumption Functions.'
    },
    {
      title: 'Azure Blob Storage vs ADLS Gen2 (Hierarchical Namespace)',
      category: 'Storage',
      question: 'Should we enable Hierarchical Namespace on our storage accounts for AI workloads?',
      recommendation: 'Enable ADLS Gen2 (Hierarchical Namespace) if data will be processed by big data analytics (Fabric, Databricks, Synapse); keep flat Blob Storage for pure RAG document stores and model weights.',
      comparison: [
        ['Namespace Structure', 'Flat namespace with virtual directory delimiters (virtual folders)', 'True hierarchical directory tree with genuine directories and atomic operations'],
        ['Rename & Move Operations', 'Requires copying every individual blob and deleting the originals ($O(N)$ operations)', 'Atomic directory rename and move operations executed in constant time ($O(1)$)'],
        ['Analytics Integration', 'Supported via Blob connector, but suboptimal throughput for large Spark jobs', 'Native integration with Microsoft Fabric OneLake, Azure Databricks Delta Lake, and Synapse'],
        ['Access Control', 'Storage Account keys, SAS tokens, and Azure RBAC (role assignments at container level)', 'POSIX Access Control Lists (ACLs) at granular folder and file levels + Azure RBAC'],
        ['Cost & Limitations', 'Standard object storage pricing; lowest management complexity', 'Slightly higher transaction cost for directory operations; some Blob features have limitations']
      ],
      redFlags: 'Attempting to run large-scale Delta Lake ETL pipelines on flat Blob Storage without hierarchical namespace.'
    },
    {
      title: 'Public Endpoints with Firewalls vs Azure Private Link',
      category: 'Networking',
      question: 'Is an IP-allowlisted public endpoint sufficient for enterprise AI deployments?',
      recommendation: 'Mandate Azure Private Link for all production enterprise AI workloads; restrict public endpoints strictly to transient sandbox development.',
      comparison: [
        ['Traffic Routing', 'Traverses the public internet before hitting Microsoft edge IP firewall', 'Remains entirely within Microsoft private global backbone network via private IP addresses'],
        ['Exfiltration Risk', 'High risk of data exfiltration if credentials or SAS tokens are leaked externally', 'Zero exfiltration risk: services reject all traffic originating outside the authorized VNet'],
        ['DNS Architecture', 'Standard public DNS resolution (resolves to public VIP)', 'Requires Private DNS Zones (`privatelink.openai.azure.com`) and internal DNS forwarders'],
        ['Regulatory Compliance', 'Fails strict banking, healthcare, and defense audits (HIPAA, PCI-DSS, FedRAMP)', 'Complies with enterprise Zero-Trust and strict perimeter defense requirements'],
        ['Setup Complexity', 'Low (enter CIDR IP ranges in Azure portal)', 'Medium-High (requires VNet planning, private endpoints, DNS linking, and VPN/ExpressRoute)']
      ],
      redFlags: 'Deploying an Azure OpenAI instance containing sensitive customer PII on a public endpoint with only a firewall rule.'
    },
    {
      title: 'Managed Identity vs Azure Key Vault Secrets',
      category: 'Identity',
      question: 'How should our AI services authenticate to each other?',
      recommendation: 'Mandate Managed Identity for all Azure-to-Azure communication; reserve Key Vault secrets strictly for third-party SaaS APIs.',
      comparison: [
        ['Credential Storage', 'Zero stored secrets; tokens obtained dynamically in memory from Entra ID', 'API keys, connection strings, or certificates stored in secure Key Vault secrets'],
        ['Rotation Lifecycle', 'Managed automatically by Azure platform; zero downtime, zero manual rotation', 'Requires automated rotation scripts, Event Grid notifications, and application reloads'],
        ['Credential Leakage Risk', 'Impossible to leak via source code, logs, environment variables, or config dumps', 'Risk of credential leakage if developer logs connection string or checks in code'],
        ['Auditing & Governance', 'Every request logged in Entra ID sign-in logs with exact service identity', 'Logs show Key Vault secret retrieval, but subsequent API calls appear as shared API key'],
        ['Supported Scenarios', 'Azure services supporting Entra ID (OpenAI, AI Search, Blob, Cosmos DB, SQL)', 'External APIs (OpenAI direct, Anthropic, SendGrid, Twilio, external vector databases)']
      ],
      redFlags: 'Storing an Azure OpenAI API key in `local.settings.json` or Kubernetes Secret instead of using Managed Identity.'
    },
    {
      title: 'Consumption (Pay-as-you-go) vs Provisioned Throughput Units (PTU)',
      category: 'Economics & Capacity',
      question: 'When should we commit to Provisioned Throughput Units (PTU) for Azure OpenAI?',
      recommendation: 'Start on Pay-as-you-go (Standard) during prototyping and early pilot; migrate to PTU when sustained load exceeds 20 requests/sec or when HTTP 429 throttling impairs business operations.',
      comparison: [
        ['Billing Mechanism', 'Pay strictly per 1,000 input and output tokens consumed', 'Fixed hourly reservation fee per Provisioned Throughput Unit (minimum 50-100 PTUs)'],
        ['Throughput Guarantee', 'Shared tenant capacity; subject to dynamic rate limits and HTTP 429 throttling', 'Dedicated reserved model processing capacity guaranteed 100% of the time'],
        ['Latency Consistency', 'Variable latency; P99 can spike significantly during high regional tenant load', 'Consistent, predictable latency profile with bounded response times'],
        ['Commitment Period', 'None (cancel or scale down at any second)', 'Hourly reservation, 1-month commitment, or 1-year reservation discounts'],
        ['Economic Crossover', 'Cheaper for low, bursty, or unpredictable traffic (<$5,000/month in tokens)', 'Cost-effective when sustained token utilization exceeds 65-70% of provisioned capacity']
      ],
      redFlags: 'Purchasing 100 PTUs ($20,000+/month) for a departmental chatbot with 50 internal users during business hours.'
    },
    {
      title: 'Single-Region Deployment vs Multi-Region High Availability',
      category: 'Resilience',
      question: 'Should our enterprise AI system span multiple Azure regions?',
      recommendation: 'Deploy multi-region active-active pools via Azure API Management for mission-critical customer-facing workloads; use single-region with Availability Zones for internal productivity apps.',
      comparison: [
        ['High Availability SLA', '99.9% single-region availability (subject to regional capacity shortages)', '99.99% multi-region active-active availability with automated health probe failover'],
        ['Capacity & Quota Ceiling', 'Bound to single-region TPM/RPM quotas; vulnerable to regional quota exhaustion', 'Aggregates quotas across 2+ regions (e.g. East US + Sweden Central), doubling throughput'],
        ['Data Residency', 'Strictly within single sovereign jurisdiction (e.g. Switzerland North)', 'Requires data processing agreements across multiple regions or geo-pinned pairs'],
        ['Architectural Complexity', 'Simple (single VNet, single Private DNS, single search index)', 'Requires Azure Front Door / APIM routing, dual search index synchronization, multi-region CI/CD'],
        ['Cost Impact', 'Base infrastructure costs only', 'Duplicated search partitions, cross-region egress charges, multi-region gateway fees']
      ],
      redFlags: 'Building a mission-critical Tier-1 customer banking chatbot deployed in a single region with no fallback gateway.'
    }
  ],

  solutionReviewPillars: [
    {
      pillar: '1. Infrastructure & Networking Risk',
      questions: [
        'Are all Azure OpenAI, AI Search, and Storage endpoints configured with Private Endpoints and disabled public network access?',
        'Are NSGs and Azure Firewall UDRs blocking unauthorized outbound internet traversal from compute subnets?',
        'Is the Private DNS Zone linked across all spokes with dedicated private DNS resolver endpoints?'
      ]
    },
    {
      pillar: '2. Security & Zero-Trust Identity',
      questions: [
        'Is all service-to-service communication authenticated via Entra ID Managed Identity without static connection strings?',
        'Does the architecture implement OAuth 2.0 On-Behalf-Of (OBO) flow to preserve user identity down to vector search security trimming?',
        'Are Customer-Managed Keys (CMK) enabled for sensitive document storage and vector index encryption at rest?'
      ]
    },
    {
      pillar: '3. Resilience & Capacity SLAs',
      questions: [
        'Does the API Gateway implement exponential backoff with jitter and automated fallback model routing on HTTP 429?',
        'Is the RTO and RPO aligned with the business criticality tier (Availability Zones vs Multi-Region APIM Pool)?',
        'Have peak token throughput (TPM) and request rates (RPM) been modeled against subscription quotas?'
      ]
    },
    {
      pillar: '4. Operational & Cost Governance',
      questions: [
        'Is distributed tracing enabled with OpenTelemetry and Application Insights capturing LLM tokens, search latency, and tool calls?',
        'Is an automated cost alert configured in Azure Cost Management with budget thresholds per environment?',
        'Are storage lifecycle policies configured to transition ingestion raw files from Hot to Cool/Archive tiers?'
      ]
    }
  ]
};

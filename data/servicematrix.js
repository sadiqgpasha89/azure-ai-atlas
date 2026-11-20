/* Azure AI & Platform Services Decision Matrix
   Deep 14-field comparison matrix across core Azure AI and platform services,
   and definitive Azure platform decision guides (Container Apps vs AKS, Functions vs ACA, etc.). */
window.ATLAS = window.ATLAS || {};
window.ATLAS.serviceMatrix = {
  title: 'Azure Service Decision Matrix',
  lede: 'Compare Azure AI and platform services across 14 rigorous dimensions to make defensible engineering and capacity choices.',

  comparisonMatrix: [
    {
      id: 'foundry-models',
      name: 'Microsoft Foundry Models / Azure OpenAI',
      category: 'Foundation Models',
      what: 'Managed API gateway providing enterprise access to OpenAI (GPT-4o, o1, o3) and open-weight catalog models (Llama 3, Mistral, Phi-4).',
      why: 'Provides state-of-the-art LLMs with enterprise compliance, Zero Customer Data Retention, Private Link, and SLAs.',
      whenUse: 'Text reasoning, code generation, summarization, conversational agents, multimodal analysis without managing GPU infrastructure.',
      whenNot: 'Simple tabular calculations, sub-5ms low latency, or when strict offline hardware air-gapping is mandated.',
      alternatives: 'Self-hosted vLLM on AKS GPU clusters, small SLMs on edge VMs.',
      integrationPoints: 'Azure AI Search, Foundry Agent Service, API Management, Semantic Kernel, Microsoft Agent Framework.',
      patterns: 'RAG, Agentic RAG, Supervisor-Worker Swarm, LLM Gateway.',
      security: 'Entra ID RBAC, Private Endpoints, Customer-Managed Keys (CMK), Zero Customer Data Retention (ZCDR).',
      limitations: 'Regional model availability constraints, token per minute (TPM) quota limits, non-deterministic latency spikes.',
      pricing: 'Pay-as-you-go per 1M tokens (Prompt/Completion) or Provisioned Throughput Units (PTU) reserved hourly.',
      sla: '99.9% uptime for Pay-as-you-go; 99.9% throughput commitment on PTU.',
      regions: 'Available in major regions (East US, Sweden Central, West Europe, Australia East).',
      quotas: 'Subscribed TPM and RPM limits per model SKU with auto-quota scaling.',
      useCases: 'Enterprise knowledge assistants, automated document underwriting, call center analytics, code generation copilots.'
    },
    {
      id: 'foundry-agent-service',
      name: 'Microsoft Foundry Agent Service',
      category: 'Agent Platforms',
      what: 'Fully managed runtime for hosting, executing, and monitoring autonomous AI agents with state persistence and built-in tools.',
      why: 'Eliminates the need to build and maintain custom container runtimes, execution loops, memory databases, and tool sandboxes.',
      whenUse: 'Building managed agents that need out-of-the-box file search, code interpretation, and enterprise tool execution.',
      whenNot: 'Deterministic business workflows that require 100% predictable execution paths, or custom low-level loop controls.',
      alternatives: 'Microsoft Agent Framework in Container Apps, Semantic Kernel on App Service, LangGraph.',
      integrationPoints: 'Azure AI Search, Azure Functions, OpenAPI / REST APIs, Cosmos DB, Application Insights.',
      patterns: 'Agentic RAG, Multi-Agent Handoff, Supervisor-Worker.',
      security: 'Managed Identity execution, Entra ID user token propagation, isolated sandbox for code interpreter.',
      limitations: 'Subject to managed runtime timeouts (10 minutes) and regional service limits.',
      pricing: 'Pay-per-session execution fees + underlying foundation model token consumption.',
      sla: '99.9% managed service SLA.',
      regions: 'Selected Foundry-enabled regions.',
      quotas: 'Concurrent active agent sessions per subscription.',
      useCases: 'Customer support agents, automated research analysts, data analytics copilots executing sandboxed Python code.'
    },
    {
      id: 'ai-search',
      name: 'Azure AI Search',
      category: 'Search & Retrieval',
      what: 'Enterprise hybrid search service combining BM25 keyword search, HNSW dense vector search, and deep cross-encoder semantic reranking.',
      why: 'Provides purpose-built retrieval with integrated vectorization, document cracking, and document-level security trimming at enterprise scale.',
      whenUse: 'Knowledge retrieval for RAG, unstructured document discovery across SharePoint/Blob, multi-lingual enterprise search.',
      whenNot: 'Transactional OLTP database queries, real-time logging search, or pure key-value caching.',
      alternatives: 'Cosmos DB NoSQL with vector indexing, Azure Database for PostgreSQL with pgvector, Elastic on Azure.',
      integrationPoints: 'Blob Storage, Document Intelligence, Foundry Models, Entra ID, Power Virtual Agents.',
      patterns: 'Traditional RAG, Agentic RAG, GraphRAG, Multimodal RAG.',
      security: 'Private Endpoints, CMK encryption, document-level security filtering (ACLs), role-based search data access.',
      limitations: 'Maximum index partition limits (25GB to 200GB per partition depending on tier); index rebuild time on schema alterations.',
      pricing: 'Search Units (SU) billed hourly based on tier (Basic, Standard S1, S2, S3) × Partitions × Replicas + Semantic Ranker request units.',
      sla: '99.9% for read-only index queries with 2+ replicas; 99.9% for read-write with 3+ replicas.',
      regions: 'Available in virtually all commercial Azure regions.',
      quotas: 'Partitions (up to 12 per service), Replicas (up to 12 per service), Indexes (up to 50 on S1).',
      useCases: 'Enterprise knowledge bases, policy handbooks, customer self-service search, contract discovery.'
    },
    {
      id: 'doc-intelligence',
      name: 'Azure AI Document Intelligence',
      category: 'Document AI',
      what: 'Machine learning API that extracts text, bounding boxes, key-value pairs, tables, and document structures from PDFs, scans, and forms.',
      why: 'Standard text extraction jumbles columns and tables into unreadable text; Document Intelligence preserves visual layout and tabular markdown.',
      whenUse: 'Processing scanned forms, financial 10-K tables, invoices, receipts, identity documents, and contracts before chunking.',
      whenNot: 'Pure plain-text files (TXT, clean Markdown) where simple splitters are 100x faster and free.',
      alternatives: 'Open-source OCR (Tesseract), basic PyPDF/pdfplumber (fails on complex layouts).',
      integrationPoints: 'Azure AI Search indexers, Azure Functions, Blob Storage, Logic Apps, Power Automate.',
      patterns: 'Document Intelligence Pipeline, Multimodal RAG.',
      security: 'Private Link, Customer-Managed Keys (CMK), Zero Customer Data Retention.',
      limitations: 'Page limit per API call (typically up to 2,000 pages per document depending on SKU); processing latency scales with page count.',
      pricing: 'Per 1,000 pages processed (e.g. $10 per 1,000 pages for prebuilt-layout model).',
      sla: '99.9% API uptime.',
      regions: 'Broad regional availability.',
      quotas: 'Requests Per Minute (RPM) and concurrent transactions per tier.',
      useCases: 'Invoice extraction, tax form processing, medical record parsing, high-fidelity RAG ingestion.'
    },
    {
      id: 'aml-workspace',
      name: 'Azure Machine Learning',
      category: 'ML Platform & MLOps',
      what: 'Enterprise platform for training, tuning, registering, deploying, and governing custom classical ML models and deep neural networks.',
      why: 'Provides reproducible pipelines, distributed GPU training clusters, feature store, MLflow registry, and automated drift monitoring.',
      whenUse: 'Custom model training, tabular forecasting, fine-tuning open-weight LLMs, feature engineering, and enterprise MLOps.',
      whenNot: 'Simple prompting of existing OpenAI frontier models (use Foundry Models instead).',
      alternatives: 'Azure Databricks, self-hosted Kubeflow on AKS.',
      integrationPoints: 'Microsoft Fabric, ADLS Gen2, Azure Container Registry, Azure Monitor, Key Vault.',
      patterns: 'GenAIOps & MLOps Lifecycle, Real-time Feature Store, Training Pipeline.',
      security: 'Managed Virtual Network, private storage endpoints, Entra ID RBAC, Purview governance.',
      limitations: 'Compute provisioning cold-start time (3-5 minutes for new GPU nodes); complex workspace infrastructure setup.',
      pricing: 'Free orchestration layer; pay only for underlying compute (VMs), storage, and networking resources consumed.',
      sla: '99.9% for managed online endpoints.',
      regions: 'Global availability across all major compute regions.',
      quotas: 'GPU core family quotas (e.g. Standard NCasT4_v3, Standard ND A100) per subscription/region.',
      useCases: 'Predictive churn modeling, financial fraud detection, supply chain forecasting, custom model fine-tuning.'
    },
    {
      id: 'container-apps',
      name: 'Azure Container Apps (ACA)',
      category: 'Compute & Hosting',
      what: 'Fully managed serverless container platform built on Kubernetes (AKS) and KEDA with automated scaling to zero.',
      why: 'Offers Kubernetes-grade scaling and Dapr microservice capabilities without the operational overhead of managing AKS clusters.',
      whenUse: 'Microservice APIs, background event-driven agent workers, Python FastAPIs, and lightweight MCP servers.',
      whenNot: 'Massive distributed GPU training, low-level Kubernetes DaemonSets, or workloads requiring specialized host access.',
      alternatives: 'Azure Kubernetes Service (AKS), Azure Functions, Azure App Service.',
      integrationPoints: 'Azure Container Registry (ACR), Azure Monitor, Event Grid, Service Bus, Virtual Networks.',
      patterns: 'Agent Platform, AI Gateway, Microservice Backends.',
      security: 'Internal Virtual Network injection, Private Endpoints, Managed Identity, secret volume mounting.',
      limitations: 'Limited GPU support compared to raw AKS; maximum execution time limits on standard HTTP requests.',
      pricing: 'Consumption pricing per vCPU-second and GiB-second active + idle allocations.',
      sla: '99.95% availability.',
      regions: 'Available in all major regions.',
      quotas: 'Replica limits and core allocations per environment.',
      useCases: 'Hosting Python RAG backends, LangGraph agents, semantic caching microservices, async queue workers.'
    }
  ],

  platformDecisions: [
    {
      decision: 'Azure Container Apps vs Azure Kubernetes Service (AKS)',
      lens: 'Operational Overhead vs Deep Control',
      summary: 'Choose Container Apps for 90% of AI backends, APIs, and agent workers to eliminate cluster patching, ingress controller management, and Kubernetes upgrades. Choose AKS when you require specialized GPU scheduling, InfiniBand multi-node training, custom DaemonSets, or cross-cloud Kubernetes standardization.'
    },
    {
      decision: 'Azure Functions vs Azure Container Apps',
      lens: 'Event-Driven Micro-Tasks vs Stateful Microservices',
      summary: 'Use Azure Functions for short, stateless, event-triggered executions (e.g. an image arrives in Blob storage -> crack OCR -> emit event). Use Container Apps for long-running processes, WebSockets, persistent agent memory loops, and containerized Python frameworks.'
    },
    {
      decision: 'Azure Blob Storage vs ADLS Gen2 (Hierarchical Namespace)',
      lens: 'Flat Object Storage vs High-Throughput Analytics',
      summary: 'Use standard Blob Storage for raw model weights, simple document dumps, and backup files. Enable Hierarchical Namespace (ADLS Gen2) whenever files are accessed by big data analytics engines (Fabric, Databricks, Synapse) because directory renames and atomic moves are O(1) operations.'
    },
    {
      decision: 'Managed Identity vs Azure Key Vault Secrets',
      lens: 'Zero-Secret Architecture vs External Third-Party Keys',
      summary: 'Always mandate Managed Identity (System- or User-Assigned) for all Azure-to-Azure communication (App Service -> Azure OpenAI -> Search -> Blob). Store credentials in Key Vault only for external third-party SaaS APIs (e.g. SendGrid, Twilio, third-party LLM providers) that do not support Microsoft Entra ID.'
    },
    {
      decision: 'Public Endpoints with Firewalls vs Azure Private Link',
      lens: 'Network Exposure vs Regulated Compliance',
      summary: 'Public endpoints with IP allowlists are acceptable only for rapid sandbox prototyping. Production enterprise AI systems must mandate Azure Private Link to ensure all model prompts, document vectors, and database tokens remain entirely on the Microsoft private backbone.'
    },
    {
      decision: 'Consumption (Pay-as-you-go) vs Provisioned Throughput (PTU)',
      lens: 'Variable Demand vs Guaranteed Capacity & Latency',
      summary: 'Use Pay-as-you-go during development, pilot phases, and bursty workloads with under 20 requests/sec. Upgrade to Provisioned Throughput Units (PTU) when sustained production concurrency risks HTTP 429 throttling, or when strict latency consistency (SLA) is required.'
    },
    {
      decision: 'Single-Region Deployment vs Multi-Region Failover',
      lens: 'Cost Efficiency vs High Availability & Quota Resilience',
      summary: 'Single-region deployment is susceptible to regional Azure OpenAI capacity shortages and service outages. Mission-critical enterprise applications should deploy API Management in front of a multi-region deployment pool (e.g. East US + Sweden Central) with automated priority failover.'
    }
  ]
};

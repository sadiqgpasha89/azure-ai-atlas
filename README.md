# Azure AI Atlas — The AI Engineering Management Operating System

A static, zero-dependency, client-side web application designed for AI Engineering Managers, Principal Architects, and Staff Engineers delivering enterprise generative AI and multi-agent systems on Microsoft Azure.

Live site: [https://sadiqgpasha89.github.io/azure-ai-atlas/](https://sadiqgpasha89.github.io/azure-ai-atlas/)

---

## The 8 Pillars of the AI Engineering Operating System

The Atlas is structured around eight foundational operational pillars that span the entire lifecycle of enterprise AI delivery:

### 1. Azure Services Catalogue (59 Services across 11 Categories)
Comprehensive coverage of the core Azure AI/ML ecosystem across compute, storage, databases, analytics, streaming, generative AI, ML platform, AI services, networking, security, and observability.
- Each service contains: what it is, interactive animated isometric workflow, step-by-step technical execution, production gotchas, edge cases, agent & ML integration patterns, architecture pairings, and cost model notes.
- Expanded to include core platform services: **Azure Container Registry (ACR)**, **Azure App Service**, **Azure Firewall & Application Gateway**, **Azure DevOps & GitHub Actions**, **Azure App Configuration**, and **Azure Managed Grafana & Prometheus**.

### 2. Architecture Reference Library (13 Reference Architectures)
End-to-end interactive blueprints for production AI systems with step-through packet animations:
1. **Traditional RAG**: Ingestion, document cracking, chunking, embeddings, hybrid search (BM25 + vector), Reciprocal Rank Fusion (RRF), semantic reranking, grounded generation.
2. **Agentic RAG**: Multi-query decomposition, parallel retrieval tools, iterative reflection, reranking, and answer synthesis.
3. **GraphRAG**: Knowledge graph construction, entity extraction, relationship triples, community summaries, and graph-guided retrieval.
4. **Multimodal RAG**: Document Intelligence layout extraction, table Markdown conversion, Content Understanding visual bounds, and multimodal embeddings.
5. **Secure Multi-Tenant RAG**: Entra ID user identity propagation, document-level security trimming (ACLs), tenant isolation, and private endpoint routing.
6. **Multi-Agent Orchestration**: Microsoft Agent Framework & Foundry Agent Service implementing sequential, supervisor, handoff, and group-chat patterns with state persistence in Cosmos DB.
7. **GenAIOps & MLOps Lifecycle**: 8-stage operational pipeline: prompt versioning in Git, MLflow tracking, automated evaluation gates in CI/CD, canary releases, and online telemetry.
8. **RAG Assistant**: Classic pattern connecting App Service, Azure AI Search, and Azure OpenAI.
9. **LLM Serving & Gateway**: API Management token rate limiting, circuit breakers, caching, and fallback deployments.
10. **Training & MLOps**: Azure ML pipeline orchestrating distributed GPU compute, Model Registry, and managed endpoints.
11. **Agent Platform**: Container Apps event-driven agent workers with Cosmos DB state persistence.
12. **Document Intelligence Pipeline**: Large-scale asynchronous document extraction into structured schemas.
13. **Real-time Feature Store**: Event Hubs streaming ingestion into Redis and Cosmos DB for sub-10ms feature lookup.

### 3. Architecture Decision Centre (23 Decision Guides)
Exhaustive decision guides across Strategy, Architecture, and Risk, marked with one-way and two-way door reversibility markers:
- **Dedicated Role Lenses**:
  - *Engineering Manager Lens*: Default call, what to decide, team operating rhythm, quick calls, budget implications, and evidence to ask for.
  - *Principal Engineer Lens*: Default design, what to own, design trade-offs, quick calls, and evidence to demand in design reviews.
- **Includes 9 New Mission-Critical AI Decisions**:
  - `vector-hybrid-search`: Vector vs Hybrid Search
  - `classic-vs-agentic-rag`: Classic vs Agentic RAG
  - `search-vs-cosmos`: Azure AI Search vs Cosmos DB for Vectors
  - `chunking-strategy`: Fixed vs Semantic vs Hierarchical Chunking
  - `reranking-tradeoff`: Semantic Reranking Quality vs Latency
  - `graphrag-vs-vector`: GraphRAG vs Vector RAG
  - `index-tenancy`: Shared vs Isolated Search Indexes
  - `workflow-vs-agent`: Deterministic Workflows vs Autonomous Agents
  - `model-deployment-capacity`: PTU vs Pay-as-you-go vs Batch Inference
- Plus interactive tools: **Solution Shaper**, **Readiness Checklists**, and **Cost-per-Task Calculator**.

### 4. AI Engineering Playbooks (`#/p`)
In-depth production playbooks providing technical guidelines, measurable metrics, and engineering rules:
1. **RAG Engineering Playbook**: Document cracking via Document Intelligence, layout-aware Markdown chunking, hybrid search tuning (RRF), semantic reranking, and measurable quality indicators (Recall@K, MRR, NDCG, Groundedness, Answer Relevance, Citation Quality).
2. **Multi-Agent Engineering Playbook**: Seven orchestration patterns (Sequential, Concurrent, Supervisor, Handoff, Group Chat, Magentic-One, HITL), framework comparisons (Microsoft Agent Framework vs Foundry Agent Service vs Semantic Kernel vs Durable Functions), memory lifecycles, and tool authorization.
3. **GenAIOps & Production MLOps Playbook**: 8-stage lifecycle, prompt versioning in Git, MLflow experiment tracking, automated PR evaluation gates, canary releases, and model drift monitoring.
4. **Enterprise AI Security & Hardening Playbook**: Identity delegation (OBO), document security trimming, Content Safety Prompt Shields, private link isolation, and firewall egress filtering.
5. **Performance, Reliability & SRE Playbook**: Latency budgets (TTFT < 1.2s), token economics (prompt caching, semantic caching, global batch), 429 throttling mitigation, and capacity planning.

### 5. Enterprise Security & Governance (`#/gov`)
Architecture frameworks aligning Azure AI workloads with corporate enterprise standards:
- **Cloud Adoption Framework (CAF) AI Landing Zones**: Enterprise management group hierarchy, separating platform subscription services from decentralized workload subscriptions.
- **Zero-Trust Network Topology**: Hub-and-spoke Virtual WAN with Azure Firewall, Private Endpoints for all PaaS services, and user-defined routes (UDR) for egress filtering.
- **8-Pillar Security Framework**: Identity, Authorization, Data Protection, Network Isolation, Content Safety, Agent Boundaries, Model & IP Protection, and Continuous Red Teaming.
- **Tenancy Architecture Models**: Pooled/Shared Index vs Index-per-Tenant vs Service-per-Tenant evaluation.
- **Recommended Azure Policy Initiatives**: Programmatic guardrails enforcing private networking, CMK encryption, approved model catalogs, and diagnostic logging.

### 6. Production Operations Centre (`#/ops`)
Telemetry, incident management, and SRE runbooks for stochastic AI systems:
- **Mandatory 10-Widget Operations Dashboard**: Real-time widgets tracking Task Throughput, Time to First Token (TTFT), Token Consumption, HTTP 429 Throttling, RAG Groundedness, Tool Failure Rate, Unit Cost per Task, Evaluation Trends, Content Safety Triggers, and Dependency Availability.
- **Ready-to-Run KQL Queries**: Expandable Kusto queries with copy buttons for direct deployment to Azure Monitor and Log Analytics workspaces.
- **Production SRE Runbooks**: Actionable remediation procedures for 429 throttling outages, Groundedness regressions, agent infinite loops, and emergency multi-region failovers.
- **AI Incident Postmortem Template**: Specialized postmortem template with AI-specific 5 Whys and probabilistic failure classification.

### 7. AI Engineering Manager Toolkit (`#/toolkit`)
Leadership artifacts, frameworks, and copyable templates:
- **AI Use-Case Assessment Matrix**: Value vs Feasibility scoring framework across 8 dimensions.
- **AI Project Estimation Framework**: 4-phase headcount allocation model (Discovery, Architecture Spike, Hardening, Launch Readiness).
- **AI Team RACI Matrix**: Clear role ownership across EM, PE, AI Engineer, MLOps, Security, Product, and Business Stakeholders.
- **AI RAID Tracker**: Core enterprise risks, assumptions, issues, and dependencies with mitigation strategies.
- **Production Quality Gates**: Formal exit criteria across Prototype, Pilot, Production, and Scale.
- **Vendor & Framework Matrix**: Microsoft Foundry vs Self-Hosted Open-Source (vLLM) vs Third-Party SaaS.
- **AI Team Skills Matrix**: Competency definitions across Foundation, Proficient, and Expert tiers.
- **Copyable Leadership Templates**: Architecture Review Template, Executive Monthly Status Report Template, and ADR Record Template.

### 8. Hands-on Labs & Learning Roadmaps (`#/labs`)
Curated learning paths and hands-on implementation exercises:
- **3 Progressive Role Roadmaps**:
  - *Engineering Manager*: 4-week curriculum covering AI strategy, RAG/Agent trade-offs, GenAIOps quality gates, and FinOps unit economics.
  - *Principal AI Architect*: 6-week curriculum on advanced retrieval, multi-agent state persistence, and enterprise security.
  - *Production AI Engineer*: 4-week curriculum on Azure SDKs, vector search schemas, agent loops, and automated evaluation suites.
- **5 End-to-End Hands-on Labs**:
  - Lab 1: End-to-End Enterprise RAG with Azure AI Search & Foundry IQ
  - Lab 2: Multi-Agent Orchestration with Microsoft Agent Framework
  - Lab 3: Automated Quality Evaluation in CI/CD with Foundry Evaluation SDK
  - Lab 4: Securing Enterprise RAG with Document ACLs & Private Endpoints
  - Lab 5: Production Monitoring, Throttling Resilience & Cost Optimization
- **Official Microsoft Learn Architecture Hubs**: Direct links to authoritative Microsoft architecture centers and documentation.

---

## Local Development & Validation

Run locally without build tools or external dependencies:

```sh
# Start local server
python3 -m http.server 8000   # Open http://localhost:8000

# Validate all data structures, cross-references, and markdown formatting
node scripts/check.mjs
```

## Repository Structure

```
index.html              Application shell, fonts, styles, and data script loaders
assets/
  app.js                Client-side hash router, page renderers, search engine, calculator
  style.css             Design system, responsive layout, dark/light theme, dashboard cards
data/
  core.js               Categories, themes, and global namespace initialization
  compute.js            Compute services (GPU VMs, AKS, Batch, ACA, Functions, ACR, App Service)
  storage.js            Storage services (Blob, Files, ADLS Gen2, Managed Lustre)
  databases.js          Database services (Cosmos DB, Azure SQL, PostgreSQL, Managed Redis)
  analytics.js          Analytics services (Fabric, Databricks, Synapse, Purview)
  streaming.js          Streaming services (Event Hubs, Service Bus, Event Grid)
  genai.js              GenAI services (Foundry, Azure OpenAI, Foundry Agent Service, Agent Framework)
  mlplatform.js         ML platform services (AML Workspace, Compute, Endpoints, Pipelines, MLflow)
  aiservices.js         Cognitive services (AI Search, Doc Intelligence, Speech, Vision, Content Safety)
  networking.js         Networking services (Private Link, VNet, ExpressRoute, Front Door, Firewall)
  security.js           Security services (Entra ID, Key Vault, Defender for Cloud, Azure Policy)
  observability.js      Observability services (Azure Monitor, APIM, App Config, Grafana, DevOps)
  architectures.js      13 production reference architectures with step-through flows
  decisions.js          23 architectural decision guides with EM and PE lenses
  roles.js              Engineering Manager and Principal Engineer quick calls and rhythms
  playbooks.js          5 production AI engineering playbooks
  governance.js         CAF landing zones, 8-pillar security framework, tenancy models, policies
  operations.js         10-widget dashboard template, KQL queries, SRE runbooks, postmortems
  toolkit.js            Assessment matrix, estimation model, RACI, RAID, quality gates, templates
  labs.js               3 role learning roadmaps, 5 hands-on labs, Microsoft Learn links
scripts/
  check.mjs             Comprehensive data validator and schema checker (runs in CI)
```

---

## Independent Educational Resource

This project is an independent educational architecture reference and engineering management guide. It is not affiliated with, sponsored by, or endorsed by Microsoft Corporation. All trademarks, service marks, and trade names belong to their respective owners. Always verify current quotas, pricing, and regional feature availability in the official [Microsoft Learn documentation](https://learn.microsoft.com/).

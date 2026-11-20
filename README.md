# Azure AI Atlas — The Azure AI Engineering Management Operating System

A static, zero-dependency, client-side web application designed for **AI Engineering Managers, Principal AI Architects, and Staff Engineers** delivering mission-critical enterprise Generative AI, Multi-Agent Systems, RAG, and Machine Learning solutions on Microsoft Azure.

**Live Application:** [https://sadiqgpasha89.github.io/azure-ai-atlas/](https://sadiqgpasha89.github.io/azure-ai-atlas/)

---

## Executive Overview

Operating as an enterprise AI Engineering Manager requires answering five fundamental questions before writing a single line of code:
1. **What Azure service or technology should we use?**
2. **How should we architect the solution end-to-end?**
3. **Why should we choose this approach over viable alternatives?**
4. **How do we deploy, secure, evaluate, scale, and operate it in production?**
5. **How do we estimate cost, capacity, team staffing, risks, and delivery timeline?**

The **Azure AI Atlas** transforms standard cloud documentation into an active **Engineering Operating System** that equips engineering leadership with the frameworks, architectural blueprints, interactive calculators, governance models, and troubleshooting runbooks needed to design and govern enterprise AI systems.

---

## Core Capabilities & Centers

### 1. Architecture Advisor & Solution Generator (`#/advisor`)
Guided interactive intake engine that takes workload requirements and generates a production architecture:
- **Guided Assessment**: Select workload type, data sensitivity, retrieval complexity, scale/throughput, agent autonomy, and latency sensitivity.
- **Recommended Architecture**: Matches workload to a reference architecture with visual SVG topology.
- **Service Stack Selection**: Primary Azure services with explicit trade-offs and viable alternatives.
- **Security & Network Posture**: Private endpoints, Entra ID managed identities, customer-managed keys (CMK), and egress filtering.
- **Data Flow & Reliability Plan**: Step-by-step ingestion and query paths with circuit breaker fallbacks and retry policies.
- **Evaluation & Deployment Strategy**: Pre-deployment quality gates, synthetic golden datasets, and canary release schedule.
- **Risk Register**: High-impact enterprise risks and mitigation actions.
- **Automated ADR Generator**: Produces an exportable 15-section Architecture Decision Record in Markdown format ready for design review.

### 2. Expanded Architecture Reference Library (20 Blueprints — `#/a`)
End-to-end reference blueprints featuring step-through packet flow animations, production gotchas, and component mappings:
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
14. **Voice AI & Real-Time Speech Agent**: Low-latency bidirectional audio streaming, Whisper/Azure Speech STT, Azure OpenAI GPT-4o Realtime API, Neural TTS, and telephony SIP integration via Azure Communication Services.
15. **Vision & Content Understanding Pipeline**: Multimodal visual analysis, Azure AI Vision, Content Understanding document parsing, Florence/GPT-4o vision indexing, and video frame extraction.
16. **Event-Driven AI Workflow Automation**: Service Bus topic fan-out, Azure Functions and Container Apps event-driven workers, and Logic Apps enterprise ERP connectors.
17. **High-Throughput Batch Inference Platform**: Global batch processing with Azure Batch, Azure OpenAI Batch API (50% discount), and Azure Storage blob queues.
18. **Predictive ML & Hybrid AI Platform**: Dual-pipeline architecture coupling Azure ML tabular training (LightGBM/XGBoost) with LLM explanatory synthesis and Azure AI Search context enrichment.
19. **AI-Assisted Decision Support Engine**: Multi-criteria scoring engine combining deterministic business rules, ML risk models, and generative LLM rationale generation with human-in-the-loop sign-off.
20. **Enterprise AI Knowledge & Discovery Platform**: Universal enterprise search combining Purview data governance, Fabric lakehouse ingestion, Azure AI Search semantic index, and unified access control.

### 3. RAG Engineering Lab (`#/rag-lab`)
Engineering workbench for designing and optimizing enterprise retrieval pipelines:
- **Chunking Strategy Matrix**: Fixed-size, Sentence-based, Markdown-aware, Semantic similarity, Hierarchical (parent-child), and Document layout-aware chunking with token ranges, pros, cons, and best use cases.
- **Retrieval & Scoring Comparison**: HNSW vector search, BM25 keyword search, Hybrid search with Reciprocal Rank Fusion (RRF), Semantic Ranker (cross-encoder), and Knowledge Graph traversal.
- **Interactive RAG Quality Calculator**: Real-time simulation of Recall@5, Mean Reciprocal Rank (MRR), Groundedness, Answer Relevance, End-to-End Latency, and Estimated Cost per Query based on strategy selections.
- **Golden Benchmark Reference Experiments**: Documented outcomes across financial SEC 10-K analysis, legal contract discovery, clinical EHR guidelines, and technical codebases.

### 4. Agent Pattern Explorer (`#/agents`)
Comprehensive taxonomy of autonomous and collaborative agent architectures:
- **18 Architectural Patterns**: Single-Agent (ReAct, Plan-and-Solve, Reflection, Tool Use, Guarded Agent), Multi-Agent (Supervisor, Sequential Pipeline, Hierarchical Delegation, Dynamic Swarm, Group Chat Debate, Round Robin Consensus, Competitive Ensemble), and Human-in-the-Loop (Approval Gate, Dual Control, Interactive Clarification, Sandbox Execution, Escalation Circuit Breaker).
- **Agent Framework Decision Matrix**: Objective evaluation of Microsoft Agent Framework, Azure AI Foundry Agent Service, Semantic Kernel, AutoGen, LangGraph, and Model Context Protocol (MCP) across state management, enterprise readiness, Azure integration, and multi-agent ergonomics.
- **7 Orchestration Modes**: Comparative breakdown of latency, token cost, failure risk, and best applications.

### 5. AI Security & Threat Defense Center (`#/security-center`)
Defense-in-depth architecture adhering to the OWASP Top 10 for LLMs:
- **12 Threat Catalog Cards**: Detailed threat definitions, attack vectors, business impact, and native Azure mitigations for Prompt Injection (LLM01), Sensitive Information Disclosure (LLM02), Supply Chain Vulnerabilities (LLM03), Data & Model Poisoning (LLM04), Improper Output Handling (LLM05), Excessive Agency (LLM06), System Prompt Leakage (LLM07), Vector / RAG Poisoning (LLM08), Overreliance & Hallucination (LLM09), Model Theft & IP Extraction (LLM10), Denial of Service / Token Exhaustion, and Insecure Tool/Plugin Integration.
- **Interactive 10-Gate AI Governance Checklist**: Live compliance assessment meter across Model Provenance, Content Safety, Network Isolation, Identity & RBAC, Data Protection, Agent Authorization, Observability & Audit, Evaluation Gates, Incident Response, and Legal & Compliance.

### 6. AI Evaluation & Quality Center (`#/evaluation`)
Rigorous, scientific quality assurance framework for stochastic AI systems:
- **7-Level AI Testing Pyramid**: Level 1 (Unit & Prompt Assertions), Level 2 (Synthetic RAG Retrieval Testing), Level 3 (Agent Step & Trajectory Testing), Level 4 (End-to-End Golden Dataset Evals), Level 5 (Automated Red Teaming & Safety), Level 6 (Human-in-the-Loop Expert Review), and Level 7 (Production Online Observability).
- **14 Quality Dimensions**: Complete metric dictionary spanning Groundedness, Context Relevance, Answer Relevance, Citation Precision, Hallucination Rate, Tool Call Accuracy, Trajectory Efficiency, Task Completion Rate, Harmful Content Detection, Jailbreak Resistance, Latency, Token Efficiency, Cross-Turn Consistency, and Domain-Specific Factual Correctness.
- **Interactive Release Quality Gate Calculator**: Input measured test scores against release thresholds with configurable presets (Tier 1 Mission-Critical, Tier 2 Internal Enterprise, Tier 3 Experimental/Internal POC) yielding an automated Pass/Warn/Fail deployment decision.

### 7. AI FinOps & Cost Engineering Center (`#/finops`)
Unit economics, financial modeling, and capacity management:
- **Multi-Model Token Pricing Reference**: Up-to-date input and output token rates, cached token discounts, and batch pricing across GPT-4o, GPT-4o-mini, o1, o3-mini, text-embedding-3-large, and Semantic Ranker.
- **Interactive Monthly Enterprise TCO Calculator**: Computes full stack infrastructure costs including LLM tokens, Azure AI Search storage units, Container Apps compute, Cosmos DB RU/s, Content Safety calls, and APIM gateway fees.
- **4 Scale Profiles**: Instant baselines for Startup / Innovation POC, Growth / Production Team, Enterprise Core, and Global Mission-Critical workloads.
- **Corporate ROI & Payback Horizon Model**: Projects annual financial savings, net operating ROI percentage, and months to capital payback based on employee efficiency gains and error reduction.

### 8. Production Troubleshooting & Failure Catalog (`#/troubleshooting` & `#/ops`)
Diagnostic playbooks and actionable SRE runbooks for production incidents:
- **RAG Pipeline Failure Modes**: Low groundedness/hallucinations, retrieval miss/irrelevant context, and slow end-to-end latency with symptoms, root-cause diagnostics, resolution procedures, and ready-to-run KQL queries.
- **Agentic System Failure Modes**: Infinite reasoning loops, tool execution failures, and context window exhaustion.
- **Azure Platform & Infrastructure Failure Modes**: HTTP 429 Too Many Requests / Quota Throttling, private endpoint DNS resolution failures, and Entra ID Managed Identity token expiry.
- **10-Widget Operations Dashboard & KQL Queries**: Kusto queries ready for Azure Monitor and Log Analytics workspaces.

### 9. Traditional ML & Enterprise Integrations (`#/traditional-ml`)
Predictive AI capabilities and core enterprise systems connectivity:
- **10-Phase Predictive ML Lifecycle**: Problem formulation, Data ingestion, Feature engineering, Experimentation, Model training, Validation, Deployment, Monitoring, Retraining, and Governance.
- **Platform Comparison**: Azure Machine Learning vs Microsoft Fabric vs Azure Databricks.
- **Resilience Engineering**: Architectural patterns for Circuit Breakers, Fallback LLM Models, Token Bucket Rate Limiters, and Compensating Transactions.
- **6 Enterprise Connectors**: Proven integration blueprints for SAP S/4HANA, Salesforce CRM, Microsoft Dynamics 365, Oracle Cloud ERP, Workday HCM, and ServiceNow ITSM.

### 10. Engineering Manager Workspace (`#/em-workspace`)
Executive delivery toolkit and leadership decision instruments:
- **Guided 14-Point Project Intake Assessment**: Evaluates problem clarity, data readiness, accuracy requirements, team capability, and business value.
- **Solution Architecture Review Checklist**: Formal verification across Architecture & Design, Security & Compliance, Operational Readiness, and Business & Delivery.
- **Algorithmic Complexity & Staffing Estimator**: Calculates estimated development weeks, recommended team headcount by role (EM, Lead Architect, AI Engineers, MLOps, Data Engineer, QA), and phased delivery sprints.
- **8-Role Team Competency Heatmap**: Detailed skill matrix across 8 roles (EM, Principal Architect, AI Engineer, MLOps Engineer, Data Engineer, Evaluation & QA, Security Architect, Product Manager) and 5 mastery levels (Foundational, Working, Practitioner, Advanced, Principal/Lead).
- **3x3 Strategic Portfolio Prioritization**: Categorizes AI initiatives into Quick Wins, Strategic Bets, Low-Hanging Fruit, and High-Risk Moonshots.

### 11. Azure Service Decision Matrix (`#/services-matrix`)
Rigorous side-by-side technical evaluation:
- **14-Field Comparison Matrix**: What it does, Why it exists, When to use, When NOT to use, Viable alternatives, Integration points, Architecture patterns, Security considerations, Operational limitations, Pricing model, SLA, Regional availability, Quotas, and Production use cases.
- **7 Foundational Platform Trade-Off Guides**:
  1. *Container Apps (ACA) vs Azure Kubernetes Service (AKS)*
  2. *Azure Functions vs Azure Container Apps*
  3. *Azure Blob Storage vs ADLS Gen2 Hierarchical Namespace*
  4. *Entra ID Managed Identities vs Key Vault Secrets*
  5. *Public Network Endpoints vs Private Endpoints & Virtual WAN*
  6. *Pay-as-you-go Consumption vs Provisioned Throughput Units (PTU)*
  7. *Single-Region vs Multi-Region Active-Active Deployments*

---

## Complete Services Catalogue (59 Services)

| Category | Services Included |
| :--- | :--- |
| **Compute** | Azure Container Apps (ACA), AKS, Azure Functions, App Service, Azure Batch, GPU Virtual Machines, Container Registry (ACR) |
| **Storage** | Azure Blob Storage, ADLS Gen2, Azure Files, Managed Lustre |
| **Databases** | Cosmos DB, Azure SQL Database, Azure Database for PostgreSQL, Azure Managed Redis |
| **Analytics** | Microsoft Fabric, Azure Databricks, Azure Synapse Analytics, Microsoft Purview |
| **Streaming** | Event Hubs, Azure Service Bus, Event Grid |
| **Generative AI** | Azure AI Foundry, Azure OpenAI Service, Foundry Agent Service, Microsoft Agent Framework |
| **ML Platform** | Azure Machine Learning (AML Workspace), AML Managed Compute, AML Managed Online Endpoints, AML Pipelines, MLflow Integration |
| **AI Services** | Azure AI Search, Azure AI Document Intelligence, Azure AI Speech, Azure AI Vision, Azure AI Content Safety, Language Service, Translator |
| **Networking** | Virtual Network (VNet), Azure Private Link & Endpoints, ExpressRoute, Azure Front Door, Azure Firewall, Application Gateway |
| **Security** | Microsoft Entra ID, Azure Key Vault, Microsoft Defender for Cloud, Azure Policy |
| **Observability** | Azure Monitor & Application Insights, API Management (APIM), Azure App Configuration, Managed Grafana & Prometheus, Azure DevOps & GitHub Actions |

---

## Local Development & Verification

The project is built entirely with vanilla JavaScript, HTML5, and CSS3. It requires zero compilation, zero bundlers, and zero npm runtime dependencies.

```sh
# Clone repository
git clone https://github.com/sadiqgpasha89/azure-ai-atlas.git
cd azure-ai-atlas

# Run local development server
python3 -m http.server 8000
# Open http://localhost:8000 in your browser

# Run the schema and data integrity test suite
node scripts/check.mjs
```

### Schema & Verification Test Output
The automated test runner (`scripts/check.mjs`) validates:
- All 59 services across 11 categories
- All 20 reference architectures and flow steps
- All 23 decision guides, role tabs, and cross-links
- All 10 capability centers (Advisor, RAG Lab, Agents, Security, Evaluation, FinOps, Troubleshooting, Traditional ML, EM Workspace, Service Matrix)
- Balanced backticks, Markdown syntax, and valid URL hashes

```text
11 categories, 59 services, 20 architectures, 23 decision guides (+ em/pe role tabs), 38 readiness items, 5832 shaper combinations checked, ~23602 words in services
data OK
```

---

## Repository Architecture

```
azure-ai-atlas/
├── index.html                   # HTML5 application shell & responsive navigation
├── assets/
│   ├── app.js                   # Client-side router, search engine, interactive calculators
│   └── style.css                # CSS variables, dark/light theme, responsive cards, heatmaps
├── data/
│   ├── core.js                  # Global namespace ATLAS, categories, and tags
│   ├── compute.js               # Compute services (ACA, AKS, Functions, App Service, Batch, VMs, ACR)
│   ├── storage.js               # Storage services (Blob, ADLS Gen2, Files, Lustre)
│   ├── databases.js             # Database services (Cosmos DB, SQL, PostgreSQL, Redis)
│   ├── analytics.js             # Analytics services (Fabric, Databricks, Synapse, Purview)
│   ├── streaming.js             # Streaming services (Event Hubs, Service Bus, Event Grid)
│   ├── genai.js                 # GenAI services (Foundry, Azure OpenAI, Agent Service, Agent Framework)
│   ├── mlplatform.js            # ML platform (AML Workspace, Compute, Endpoints, Pipelines, MLflow)
│   ├── aiservices.js            # Cognitive services (AI Search, Doc Intelligence, Speech, Vision, Safety)
│   ├── networking.js            # Networking (VNet, Private Link, ExpressRoute, Front Door, Firewall)
│   ├── security.js              # Security (Entra ID, Key Vault, Defender for Cloud, Azure Policy)
│   ├── observability.js         # Observability (Azure Monitor, APIM, App Config, Grafana, DevOps)
│   ├── architectures.js         # 20 reference architectures with packet flows
│   ├── decisions.js             # 23 architecture decision guides with EM & PE lenses
│   ├── roles.js                 # Engineering Manager and Principal Engineer operating rhythms
│   ├── playbooks.js             # 5 production AI engineering playbooks
│   ├── governance.js            # CAF landing zones, 8-pillar security framework, tenancy models
│   ├── operations.js            # 10-widget dashboard template, KQL queries, SRE runbooks
│   ├── toolkit.js               # Assessment matrix, estimation model, RACI, RAID, quality gates
│   ├── labs.js                  # Role learning roadmaps, 5 hands-on labs, Microsoft Learn links
│   ├── advisor.js               # Interactive Architecture Advisor & ADR generator
│   ├── raglab.js                # RAG Engineering Lab (chunking, hybrid search, RRF, calculator)
│   ├── agentpatterns.js         # 18 agent design patterns & 6-framework decision matrix
│   ├── securitycenter.js        # OWASP Top 10 for LLMs threat catalog & 10-Gate checklist
│   ├── evaluationcenter.js      # 7-level testing pyramid, 14 dimensions, quality gate calculator
│   ├── finops.js                # Multi-model pricing, TCO calculator, ROI model
│   ├── troubleshooting.js       # Production failure catalog, root-cause analyses, KQL queries
│   ├── mltraditional.js         # 10-phase ML lifecycle, platform comparison, ERP connectors
│   ├── emworkspace.js           # 14-question project intake, complexity estimator, skills matrix
│   └── servicematrix.js         # 14-field comparison matrix & 7 platform decision guides
└── scripts/
    └── check.mjs                # Node.js data validator & test suite
```

---

## Independent Educational Resource

This project is an independent educational architecture reference and engineering management guide created for technology leaders and AI engineers. It is not affiliated with, sponsored by, or endorsed by Microsoft Corporation. All trademarks, service marks, and trade names belong to their respective owners. Always verify current quotas, pricing, and regional feature availability in the official [Microsoft Learn documentation](https://learn.microsoft.com/).

/* Azure AI Architecture Advisor Engine
   Guided requirements intake -> comprehensive end-to-end architectural recommendation,
   diagram flow, service stack with alternatives, security design, network topology,
   evaluation strategy, deployment plan, cost assumptions, risk register, and 15-section ADR. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.advisor = {
  title: 'Azure AI Architecture Advisor',
  lede: 'Translate business requirements, latency targets, and compliance constraints into production-ready Azure AI architecture blueprints with complete decision records.',

  questions: [
    {
      id: 'workload',
      label: '1. What primary AI workload pattern are you designing?',
      options: [
        ['rag-knowledge', 'Enterprise Knowledge Assistant / RAG (Internal documentation, policies, domain search)'],
        ['multi-agent', 'Autonomous Multi-Agent System (Complex reasoning, supervisor-worker orchestration, research)'],
        ['doc-intel', 'Document AI & Content Extraction (Large-scale PDF cracking, invoice/form processing, table modeling)'],
        ['voice-speech', 'Conversational Voice AI & Speech (Real-time sub-second audio transcription & synthesis)'],
        ['workflow-auto', 'Business Workflow Automation (Event-driven triage, CRM/ERP integration, human approval)'],
        ['predictive-ml', 'Classical Predictive ML & MLOps (Tabular forecasting, churn, fraud, feature store)'],
        ['batch-llm', 'High-Throughput Batch Processing (Offline backfills, catalog summarization at scale)']
      ]
    },
    {
      id: 'data',
      label: '2. What is the primary data source and format?',
      options: [
        ['docs', 'Unstructured enterprise documents (PDF, Word, Excel, PowerPoint, Markdown)'],
        ['relational', 'Relational databases & Lakehouse (Azure SQL, PostgreSQL, Databricks Delta, Fabric)'],
        ['nosql', 'NoSQL documents & graph relationships (Cosmos DB, knowledge graphs, entities)'],
        ['streaming', 'Real-time streaming telemetry & events (Event Hubs, Kafka, IoT sensors)'],
        ['multimodal', 'Multimodal images, diagrams, video, or scanned handwritten forms']
      ]
    },
    {
      id: 'scale',
      label: '3. What is the target user scale and concurrency?',
      options: [
        ['pilot', 'Pilot / Departmental (<1,000 active users, <10 concurrent requests/sec)'],
        ['enterprise', 'Enterprise-wide (5,000–25,000 users, 20–100 requests/sec, sustained daily load)'],
        ['highscale', 'High-Scale Consumer or Global (50,000+ users, 100+ requests/sec, bursty spikes)']
      ]
    },
    {
      id: 'latency',
      label: '4. What is the latency requirement?',
      options: [
        ['subsecond', 'Ultra-low latency streaming (Time-to-First-Token < 1.2s, real-time voice or search)'],
        ['interactive', 'Standard interactive response (2.0–4.0s total generation time, acceptable for chat)'],
        ['async', 'Asynchronous / Background processing (Minutes or hours, batch SLAs)']
      ]
    },
    {
      id: 'security',
      label: '5. What is the security, compliance & network isolation tier?',
      options: [
        ['standard', 'Standard Enterprise (Entra ID auth, managed identity, standard encryption)'],
        ['multitenant', 'Multi-Tenant with Document ACLs (Strict security trimming, zero cross-tenant leakage)'],
        ['zerotrust', 'Highly Regulated Zero-Trust (Private Link only, no public egress, CMK, ZCDR, EU Data Boundary)']
      ]
    },
    {
      id: 'autonomy',
      label: '6. What level of agent autonomy is required?',
      options: [
        ['deterministic', 'Deterministic workflow (Hard-coded steps, model used purely for extraction or synthesis)'],
        ['tools', 'Single agent with tool calling (Model decides which read-only tools to invoke dynamically)'],
        ['multi-agent', 'Multi-agent orchestration (Supervisor delegating to specialized worker agents)'],
        ['hitl', 'Autonomous write actions with Human-in-the-Loop (Approval gates for irreversible transactions)']
      ]
    },
    {
      id: 'budget',
      label: '7. What is your cost and capacity strategy?',
      options: [
        ['frugal', 'Cost-optimized / Pay-as-you-go (Small models like GPT-4o-mini, serverless compute, aggressive caching)'],
        ['balanced', 'Balanced (Frontier models for reasoning, small models for routing, semantic caching)'],
        ['reserved', 'High-throughput / Dedicated (Provisioned Throughput Units (PTU) or reserved GPU clusters)']
      ]
    }
  ],

  defaults: {
    workload: 'rag-knowledge',
    data: 'docs',
    scale: 'enterprise',
    latency: 'subsecond',
    security: 'zerotrust',
    autonomy: 'tools',
    budget: 'balanced'
  },

  recommend: function (a) {
    var w = a.workload || 'rag-knowledge';
    var d = a.data || 'docs';
    var s = a.scale || 'enterprise';
    var l = a.latency || 'subsecond';
    var sec = a.security || 'zerotrust';
    var aut = a.autonomy || 'tools';
    var b = a.budget || 'balanced';

    var arch = 'traditional-rag';
    var headline = 'Enterprise Hybrid RAG Assistant with Managed Grounding';
    var rationale = '';

    if (w === 'multi-agent' || aut === 'multi-agent') {
      arch = 'multiagent-orchestration';
      headline = 'Autonomous Multi-Agent System with Supervisor Orchestration and Cosmos DB State';
      rationale = 'Your requirement for multi-step reasoning with specialized sub-tasks demands an orchestrator-worker pattern built on Microsoft Agent Framework and Foundry Agent Service.';
    } else if (w === 'voice-speech') {
      arch = 'voice-ai';
      headline = 'Real-Time Conversational Voice Assistant with WebSockets and Neural Speech';
      rationale = 'Sub-second real-time voice demands streaming WebSockets on Container Apps with partial speech-to-text recognition and concurrent neural audio synthesis.';
    } else if (w === 'doc-intel' || d === 'multimodal') {
      arch = (d === 'multimodal') ? 'multimodal-rag' : 'document-intelligence';
      headline = 'High-Fidelity Document Intelligence and Multimodal Extraction Pipeline';
      rationale = 'Extracting structured data from tables, forms, and diagrams requires Document Intelligence layout cracking combined with multimodal vision models.';
    } else if (w === 'workflow-auto' || aut === 'hitl') {
      arch = 'ai-workflow-automation';
      headline = 'Event-Driven AI Business Workflow Automation with Human Approval Gates';
      rationale = 'Automating irreversible enterprise actions across ERP/CRM systems requires reliable Service Bus messaging, Logic Apps orchestration, and formal human-in-the-loop sign-off.';
    } else if (w === 'predictive-ml') {
      arch = 'predictive-ml';
      headline = 'Enterprise Predictive ML Platform with Feature Store and Continuous MLOps';
      rationale = 'Numerical forecasting and tabular risk prediction are best addressed with specialized gradient boosting and AutoML models on Azure Machine Learning rather than LLMs.';
    } else if (w === 'batch-llm' || l === 'async') {
      arch = 'ai-batch-processing';
      headline = 'High-Throughput Global Batch AI Inference with Azure ML Batch Endpoints';
      rationale = 'Processing millions of items asynchronously achieves a 50% cost discount using the Azure OpenAI Global Batch API and Azure ML batch pipelines.';
    } else if (sec === 'multitenant') {
      arch = 'secure-multitenant-rag';
      headline = 'Secure Multi-Tenant RAG with Entra ID Identity Propagation and Security Trimming';
      rationale = 'Multi-tenant enterprise access requires document-level security filtering, Entra ID token propagation, and cryptographic customer-managed keys (CMK).';
    } else if (d === 'nosql' || aut === 'tools') {
      arch = 'agentic-rag';
      headline = 'Agentic RAG with Dynamic Query Decomposition and Tool Orchestration';
      rationale = 'Complex multi-domain retrieval requires an agent to dynamically formulate sub-queries, invoke specialized search tools, and synthesize grounded responses.';
    } else {
      arch = 'traditional-rag';
      headline = 'Enterprise Hybrid RAG with AI Search Semantic Ranker and Content Safety';
      rationale = 'The gold standard for enterprise document retrieval balances BM25 lexical precision with dense vector recall, re-ranked by the Azure AI Search Semantic Ranker.';
    }

    // Recommended Service Stack
    var stack = [];
    if (b === 'reserved' && (s === 'enterprise' || s === 'highscale')) {
      stack.push({ id: 'foundry-models', role: 'Foundation Model Inference', why: 'Provisioned Throughput Units (PTU) for guaranteed latency and zero 429 throttling under high enterprise concurrency.', alt: 'Pay-as-you-go global standard (costly at steady volume, subject to throttling).' });
    } else if (b === 'frugal') {
      stack.push({ id: 'foundry-models', role: 'Foundation Model Inference', why: 'Pay-as-you-go GPT-4o-mini and Phi-4 with prompt caching for minimal token expenditure.', alt: 'Large frontier models like GPT-4o (10x token cost).' });
    } else {
      stack.push({ id: 'foundry-models', role: 'Foundation Model Inference', why: 'Tiered deployment: GPT-4o for complex synthesis, GPT-4o-mini for query routing and extraction.', alt: 'Self-hosted open models on AKS (requires dedicated GPU maintenance).' });
    }

    if (w === 'predictive-ml') {
      stack.push({ id: 'aml-workspace', role: 'MLOps & Model Registry', why: 'Central hub for experiment tracking, model lineage, and automated deployment.', alt: 'Databricks MLflow alone (lacks native Azure endpoint hosting).' });
      stack.push({ id: 'aml-feature-store', role: 'Curated Feature Store', why: 'Eliminates train-serve skew for online and batch feature lookup.', alt: 'Raw SQL queries during real-time inference (adds 50ms latency).' });
      stack.push({ id: 'aml-endpoints', role: 'Managed Online Endpoints', why: 'Sub-10ms real-time scoring with blue/green deployment traffic splitting.', alt: 'AKS custom cluster (higher operational overhead).' });
    } else {
      stack.push({ id: 'ai-search', role: 'Enterprise Knowledge Retrieval', why: 'Hybrid search (BM25 + Dense Vectors) with L2 Semantic Reranker and Integrated Vectorization.', alt: 'Pure vector stores like pgvector (lacks lexical BM25 and native security trimming).' });
    }

    if (sec === 'zerotrust' || sec === 'multitenant') {
      stack.push({ id: 'private-link', role: 'Zero-Trust Network Isolation', why: 'Ensures all traffic between application backends and Azure AI endpoints stays on the Microsoft backbone.', alt: 'Public internet endpoints with IP allowlists (unacceptable for regulated enterprise data).' });
      stack.push({ id: 'entra-id', role: 'Identity & Access Management', why: 'Enforces Managed Identity between Azure services and OAuth OBO token delegation for end users.', alt: 'Shared API keys in connection strings (high breach and rotation risk).' });
    }

    stack.push({ id: 'apim', role: 'AI API Gateway', why: 'Centralized token rate limiting, multi-region fallback pools, and semantic response caching.', alt: 'Direct client calls to OpenAI endpoints (no circuit breaking or centralized cost controls).' });

    if (aut === 'multi-agent' || aut === 'tools') {
      stack.push({ id: 'agent-framework', role: 'Code-First Agent Runtime', why: 'Lightweight, type-safe agent workflows with native MCP tool calling and state persistence.', alt: 'Heavy monolithic agent frameworks with excessive memory overhead.' });
      stack.push({ id: 'cosmos', role: 'Conversational State & Memory', why: 'Multi-region distributed state store for agent thread checkpoints, memory, and audit trails.', alt: 'In-memory process state (lost on container restart).' });
    } else {
      stack.push({ id: 'container-apps', role: 'Microservice Application Hosting', why: 'Serverless container execution that scales to zero with integrated Dapr and VNet injection.', alt: 'Azure Kubernetes Service (AKS) (overkill for standard microservices).' });
    }

    stack.push({ id: 'content-safety', role: 'AI Guardrails & Moderation', why: 'Real-time Prompt Shields blocking direct and indirect prompt injection before model execution.', alt: 'Relying purely on system prompt instructions (easily bypassed by jailbreaks).' });
    stack.push({ id: 'azure-monitor', role: 'Full-Stack Observability', why: 'End-to-end distributed tracing across user requests, retrieval queries, and LLM token metrics.', alt: 'Isolated log files without correlation IDs.' });

    // Next Decisions
    var next = [];
    if (w === 'rag-knowledge') {
      next.push({ id: 'chunking-strategy', why: 'Select chunking size and overlap based on document structure.' });
      next.push({ id: 'reranking-tradeoff', why: 'Balance semantic reranking relevance gains against 100-250ms latency.' });
      next.push({ id: 'index-tenancy', why: 'Decide between shared index with security filters vs isolated index per tenant.' });
    } else if (w === 'multi-agent') {
      next.push({ id: 'workflow-vs-agent', why: 'Verify whether autonomous agents or deterministic workflows are appropriate.' });
      next.push({ id: 'human-in-loop', why: 'Establish approval gates for state-modifying tool actions.' });
      next.push({ id: 'agent-runtime', why: 'Compare Microsoft Agent Framework vs Foundry Agent Service.' });
    } else {
      next.push({ id: 'model-deployment-capacity', why: 'Plan between provisioned throughput (PTU) and pay-as-you-go capacity.' });
      next.push({ id: 'cost-levers', why: 'Implement prompt caching and model routing to control unit economics.' });
      next.push({ id: 'evaluation', why: 'Establish automated evaluation gates in your CI/CD release pipeline.' });
    }

    // Risks
    var risks = [];
    if (sec === 'zerotrust') {
      risks.push('Private DNS zone resolution misconfiguration in hub-and-spoke VNets preventing services from connecting to Azure OpenAI.');
      risks.push('Sub-resource Private Endpoint provisioning delays across multi-region landing zones.');
    } else {
      risks.push('HTTP 429 Rate Limiting throttling production users during peak hours without APIM multi-region pooling.');
    }
    if (w === 'rag-knowledge') {
      risks.push('Retrieval recall failure: documents successfully cracked but relevant passages ranked outside Top-5.');
      risks.push('Cross-tenant data exposure caused by missing server-side security trimming filters.');
    } else {
      risks.push('Agent recursive loop runaway generating high token costs and latency without strict iteration caps.');
      risks.push('Indirect prompt injection attacks embedded inside untrusted retrieved enterprise data.');
    }

    // Phasing
    var phases = [
      'Phase 1: Architecture Spike & Golden Dataset (Weeks 1-3) — Define 150 test queries, establish Groundedness baseline (>90%), configure Azure AI Search index.',
      'Phase 2: Platform & Security Hardening (Weeks 4-6) — Provision Private Endpoints, configure Entra ID managed identities, implement APIM rate limiting and Prompt Shields.',
      'Phase 3: Integration & CI/CD Evaluation Gates (Weeks 7-9) — Deploy GitHub Actions evaluation pipelines, connect business tools, and validate multi-region failover.',
      'Phase 4: Production Pilot & FinOps Optimization (Weeks 10-12) — Roll out canary traffic to 500 users, optimize prompt caching hit rate (>40%), and staff on-call SRE runbooks.'
    ];

    // Complete 15-Section ADR Markdown
    var adrMarkdown = [
      '# Architecture Decision Record (ADR): ' + headline,
      '',
      '**Status:** Approved for Implementation',
      '**Date:** ' + new Date().toISOString().split('T')[0],
      '**Deciders:** AI Engineering Manager, Principal AI Architect, Lead InfoSec Architect',
      '',
      '---',
      '',
      '## 1. Decision Title',
      'Architecture Blueprint for ' + headline,
      '',
      '## 2. Business Problem & Context',
      'The organization requires a production-grade AI solution for ' + w + ' supporting ' + s + ' scale with ' + l + ' latency targets and ' + sec + ' security posture. ' + rationale,
      '',
      '## 3. Requirements & Constraints',
      '- **Functional:** Deliver high-precision answers/actions grounded in enterprise data with traceable citations.',
      '- **Performance (SLO):** P95 Time-to-First-Token ' + (l === 'subsecond' ? '< 1,200ms' : '< 3,000ms') + '; HTTP 429 throttling rate < 0.1%.',
      '- **Security:** ' + (sec === 'zerotrust' ? 'Strict Zero-Trust with Private Link, CMK, and no public IP endpoints.' : 'Entra ID OAuth authentication with least-privilege RBAC.'),
      '- **Governance:** Zero Customer Data Retention (ZCDR) with Microsoft; automated release quality gates.',
      '',
      '## 4. Options Considered',
      '- **Option A (Selected):** ' + headline + ' leveraging managed Azure AI platform services.',
      '- **Option B:** Self-hosted open-weight models (vLLM) on Azure Kubernetes Service (rejected due to high operational maintenance and GPU provisioning lead times).',
      '- **Option C:** Pure SaaS third-party AI platform (rejected due to enterprise data residency, governance, and private networking mandates).',
      '',
      '## 5. Architectural Decision',
      'We adopt ' + headline + ' centered on Azure AI Search, Microsoft Foundry models, and Azure Container Apps, fronted by Azure API Management.',
      '',
      '## 6. Architectural Rationale',
      rationale + ' This architecture maximizes developer velocity while meeting stringent enterprise security and latency requirements.',
      '',
      '## 7. Component Diagram & Data Flow',
      '```',
      'Client -> [Front Door / APIM] (Auth & Rate Limit)',
      '           |',
      '           +--> [Container Apps / Agent Runtime] (Orchestration & State in Cosmos DB)',
      '                  |',
      '                  +--> [Azure AI Search] (Hybrid BM25 + Dense Vectors + Semantic Ranker)',
      '                  |',
      '                  +--> [Content Safety] (Prompt Shields Input/Output Inspection)',
      '                  |',
      '                  +--> [Foundry Models / Azure OpenAI] (Grounded Generation & Reasoning)',
      '```',
      '',
      '## 8. Selected Azure Services & Responsibilities',
      stack.map(function (x) { return '- **' + x.id + '**: ' + x.role + ' — ' + x.why; }).join('\n'),
      '',
      '## 9. Security, Identity & Network Architecture',
      '- **Identity:** Managed Identity for all service-to-service calls; Entra ID user token propagation (OBO).',
      '- **Networking:** ' + (sec === 'zerotrust' ? 'All PaaS services connected via Azure Private Link into dedicated subnets. Public network access disabled.' : 'VNet injection with NSGs and private endpoints for storage and search.'),
      '- **Data Protection:** Customer-Managed Keys (CMK) in Azure Key Vault; automated document security trimming.',
      '- **Guardrails:** Azure AI Content Safety Prompt Shields filtering input prompts and retrieved context.',
      '',
      '## 10. AI Quality, Testing & Evaluation Strategy',
      '- **Golden Dataset:** 150+ curated multi-turn enterprise test queries maintained in Git.',
      '- **Automated Gates:** CI/CD build blocks pull requests if Groundedness falls below 95% or Relevance below 90%.',
      '- **Continuous Monitoring:** Online sampling of 5% of production traces evaluated by Azure AI Evaluation SDK.',
      '',
      '## 11. Cost Modeling & FinOps Assumptions',
      '- **Inference Strategy:** ' + (b === 'reserved' ? 'Provisioned Throughput Units (PTU) for predictable high volume.' : 'Pay-as-you-go with prompt caching (>35% hit rate target) and tiered model routing.'),
      '- **Estimated Monthly Cost:** Dependent on token volume; baseline platform infrastructure is estimated at $1,200–$4,500/month.',
      '',
      '## 12. Risk Register & Mitigations',
      risks.map(function (r, i) { return (i + 1) + '. **Risk:** ' + r; }).join('\n'),
      '',
      '## 13. Rejected Alternatives & Trade-offs',
      '- Self-hosting embeddings on CPU VMs was rejected in favor of Azure AI Search integrated vectorization to reduce pipeline maintenance.',
      '- Relying solely on vector similarity was rejected in favor of Hybrid Search with Semantic Ranker to prevent acronym and exact-match failures.',
      '',
      '## 14. Operational Consequences & Production Checklist',
      '- **Positive:** Centralized policy management, automated scaling, zero credential leak risk via Managed Identity.',
      '- **Negative:** Requires strict monitoring of token budgets and regional Azure OpenAI TPM quotas.',
      '',
      '## 15. Review Schedule & Governance Owner',
      '- **Review Cadence:** Quarterly review or upon major model version deprecation.',
      '- **Owner:** AI Engineering Manager & Cloud Architecture Review Board.'
    ].join('\n');

    return {
      headline: headline,
      arch: arch,
      rationale: rationale,
      stack: stack,
      next: next,
      risks: risks,
      phases: phases,
      adrMarkdown: adrMarkdown
    };
  }
};

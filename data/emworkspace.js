/* Domain 17, 18 & 19: AI Engineering Manager Workspace & Strategic Toolkit
   Project assessment engine, solution review checklist, project complexity & staffing estimator,
   8-role team skills matrix, delivery lifecycle, AI portfolio scoring, and ROI model. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.emWorkspace = {
  title: 'AI Engineering Manager Workspace & Leadership Toolkit',
  lede: 'Defensible operational frameworks, staffing models, risk registers, and portfolio prioritization tools designed specifically for AI Engineering Managers and Technical Directors.',

  assessmentQuestions: [
    { id: 'q1', text: '1. What is the specific business problem, and what is the baseline cost or metric of doing nothing?' },
    { id: 'q2', text: '2. Is AI strictly necessary, or can deterministic business rules / standard SQL achieve 80% of the outcome?' },
    { id: 'q3', text: '3. Is classical predictive ML (e.g. tabular classification) more appropriate than an expensive generative LLM?' },
    { id: 'q4', text: '4. Does the solution require generative synthesis, conversational interaction, or document understanding?' },
    { id: 'q5', text: '5. Does the use case require multi-step autonomous tool execution (AI Agents), or is a fixed pipeline sufficient?' },
    { id: 'q6', text: '6. Does the system require domain-specific enterprise knowledge retrieval (RAG) across private corpora?' },
    { id: 'q7', text: '7. If agents are proposed, is multi-agent orchestration justified over a well-engineered single agent with tools?' },
    { id: 'q8', text: '8. Is the enterprise data clean, accessible via APIs, and cataloged with clear data ownership in Microsoft Purview?' },
    { id: 'q9', text: '9. Are downstream enterprise system integrations (APIs, ERP, CRM) documented and accessible within a private VNet?' },
    { id: 'q10', text: '10. What are the regulatory and security constraints (Zero Customer Data Retention, HIPAA, PCI-DSS, EU AI Act)?' },
    { id: 'q11', text: '11. What is the allocated monthly operational cloud budget (tokens, search compute, database hosting)?' },
    { id: 'q12', text: '12. What is the target end-to-end P95 latency SLA (sub-second streaming vs asynchronous background batch)?' },
    { id: 'q13', text: '13. Can the business tolerate probabilistic accuracy (e.g. 95% with human escalation), or is 100% precision required?' },
    { id: 'q14', text: '14. What is the expected net annual return on investment (ROI) after cloud, licensing, and engineering costs?' }
  ],

  reviewChecklist: [
    {
      category: '1. Business & Product Framing',
      items: [
        'Business problem clearly stated with quantified baseline and success criteria.',
        'Deterministic alternatives evaluated and proven insufficient.',
        'Business sponsor approved the acceptable accuracy threshold (e.g. 95% with human fallback).',
        'Unit economics (cost per completed task) modeled and financially viable.'
      ]
    },
    {
      category: '2. Architecture & Service Selection',
      items: [
        'Selected Azure services justified against managed vs self-hosted alternatives.',
        'Data flow and end-to-end component boundaries fully documented with sequence diagram.',
        'Asynchronous queue buffering implemented for bursty ingestion or slow tool calls.',
        'Single-region vs multi-region failover justified based on RTO and RPO requirements.'
      ]
    },
    {
      category: '3. RAG & Agent Design',
      items: [
        'Chunking strategy matched to document geometry (e.g. table-aware for financial PDFs).',
        'Hybrid search (BM25 + dense vectors with RRF) and semantic reranking configured.',
        'Agent autonomy strictly bounded with maximum iteration limits (e.g. max 10 steps).',
        'Human-in-the-Loop (HITL) approval gates enforced before any state-modifying action.'
      ]
    },
    {
      category: '4. Security & Compliance',
      items: [
        'All Azure PaaS endpoints secured behind Azure Private Link with public access disabled.',
        'Zero-trust Entra ID Managed Identity used for all service-to-service communication.',
        'Azure AI Content Safety prompt shields deployed to intercept direct & indirect prompt injection.',
        'Customer-Managed Keys (CMK) configured for sensitive data encryption at rest.'
      ]
    },
    {
      category: '5. Operations & SRE',
      items: [
        'OpenTelemetry distributed tracing configured capturing prompt tokens and tool latencies.',
        'SRE runbooks and diagnostic KQL queries authored for HTTP 429 throttling and search timeouts.',
        'Automated alerts configured in Azure Monitor with PagerDuty / Opsgenie escalation paths.',
        'Postmortem template and disaster recovery failover drill scheduled.'
      ]
    },
    {
      category: '6. FinOps & Capacity',
      items: [
        'Monthly token spend, vector search partitions, and compute capacity modeled.',
        'Batch Inference API (50% discount) utilized for non-real-time offline processing.',
        'Provisioned Throughput Units (PTU) evaluated if peak concurrency risks 429 throttling.',
        'Azure Cost Management budget alerts and anomaly detection configured per environment.'
      ]
    }
  ],

  complexityEstimator: {
    factors: [
      { id: 'data', name: 'Data Complexity', low: 'Clean structured databases', med: 'Mixed text and markdown wikis', high: 'Messy scanned PDFs, multi-row tables, audio' },
      { id: 'rag', name: 'RAG Architecture', low: 'None / Simple single-index', med: 'Hybrid search with semantic reranker', high: 'Multi-index GraphRAG or multimodal pipelines' },
      { id: 'agent', name: 'Agent Autonomy', low: 'Stateless single-prompt completion', med: 'Single agent with 3-5 deterministic tools', high: 'Autonomous multi-agent swarm with dynamic handoff' },
      { id: 'integration', name: 'Enterprise Integration', low: 'Single internal REST API', med: 'Multiple SaaS APIs with OAuth 2.0', high: 'Legacy on-premise SAP / Mainframe via ExpressRoute' },
      { id: 'security', name: 'Security & Compliance', low: 'Standard cloud tenant security', med: 'Private Endpoints & Managed Identity', high: 'Regulated banking/healthcare (HIPAA, CMK, FedRAMP)' },
      { id: 'eval', name: 'Evaluation Rigor', low: 'Manual spot-checks on 20 prompts', med: 'Automated CI/CD suite with 200 questions', high: 'Scientific multi-metric benchmark + PyRIT red team' },
      { id: 'scale', name: 'Scale & Concurrency', low: '<1,000 users (<5 req/sec)', med: '5,000–25,000 users (20–100 req/sec)', high: 'Mission-critical >100 req/sec (Global multi-region)' },
      { id: 'reliability', name: 'Reliability SLA', low: '99.0% best-effort internal tool', med: '99.9% business-hours operational system', high: '99.99% 24/7 mission-critical customer-facing system' }
    ],
    calculate: function (scores) {
      var total = 0, count = 0;
      for (var k in scores) { total += parseInt(scores[k], 10) || 1; count++; }
      var max = (count || 8) * 3;
      var pct = Math.round((total / max) * 100);
      var tier = 'Low Complexity (Sprint Spike)';
      var weeks = '2 – 4 Weeks';
      var team = '1 AI Engineer (Full-time) + 0.2 Cloud Architect';
      if (pct > 65) {
        tier = 'High Complexity / Mission-Critical Enterprise';
        weeks = '12 – 18 Weeks';
        team = '1 Lead AI Architect, 2 AI Engineers, 1 Data Engineer, 1 Backend/DevOps, 0.5 Security Specialist';
      } else if (pct > 40) {
        tier = 'Moderate Complexity (Standard Production RAG / Agent)';
        weeks = '6 – 10 Weeks';
        team = '1 Senior AI Engineer, 1 Full-stack/Backend Engineer, 0.5 DevOps/Platform Engineer';
      }
      return {
        score: total,
        maxScore: max,
        percentage: pct,
        tier: tier,
        estimatedWeeks: weeks,
        recommendedTeam: team
      };
    }
  },

  deliveryLifecycle: [
    { phase: 'Phase 01: Discovery & Value Framing', duration: 'Weeks 1–2', deliverables: 'Problem statement, quantified baseline, deterministic vs AI justification, data readiness assessment, preliminary ROI model.' },
    { phase: 'Phase 02: Proof of Concept (POC)', duration: 'Weeks 3–5', deliverables: 'Rapid prototype on 50 sample documents, basic prompt tuning, retrieval accuracy baseline, stakeholder feasibility demo.' },
    { phase: 'Phase 03: Minimum Viable Product (MVP)', duration: 'Weeks 6–9', deliverables: 'Containerized service in Azure Container Apps, Private Link networking, 200-question evaluation benchmark, basic feedback UI.' },
    { phase: 'Phase 04: Security & Compliance Audit', duration: 'Weeks 10–11', deliverables: 'PyRIT adversarial red-team scan, Entra ID least-privilege RBAC audit, CMK encryption verification, 10-Gate AI Governance sign-off.' },
    { phase: 'Phase 05: Enterprise Pilot Launch', duration: 'Weeks 12–15', deliverables: 'Canary rollout to 200 business users, token consumption telemetry, user thumbs-up/down feedback collection, prompt refinement.' },
    { phase: 'Phase 06: Production Launch & Scaling', duration: 'Weeks 16+', deliverables: 'Full general availability, multi-region failover gateway, automated retraining pipelines, continuous drift monitoring, quarterly ROI review.' }
  ],

  skillsMatrix: [
    {
      role: 'AI Engineer',
      focus: 'LLM orchestration, prompt engineering, RAG pipelines, agent frameworks, evaluation suites.',
      skills: ['Foundry SDK', 'Semantic Kernel', 'LangGraph', 'Azure AI Search', 'RAG Evaluation', 'Prompt Shields', 'OpenAI API'],
      levels: ['Level 1: Basic prompt calls', 'Level 2: Standard RAG pipelines', 'Level 3: Custom agents with tools', 'Level 4: Multi-agent state graphs', 'Level 5: SOTA architecture & mentoring'],
      competencyLevels: ['Level 1: Awareness', 'Level 2: Working Knowledge', 'Level 3: Independent', 'Level 4: Advanced Design', 'Level 5: SME & Mentoring']
    },
    {
      role: 'ML Engineer',
      focus: 'Classical ML models, model training, feature stores, MLOps automation, model registries.',
      skills: ['Azure Machine Learning', 'MLflow', 'Scikit-learn', 'LightGBM / XGBoost', 'Model Drift', 'AutoML', 'DeepSpeed / LoRA'],
      levels: ['Level 1: Jupyter notebooks', 'Level 2: Automated training jobs', 'Level 3: End-to-end MLOps pipelines', 'Level 4: Distributed GPU training', 'Level 5: Enterprise ML platform architect'],
      competencyLevels: ['Level 1: Awareness', 'Level 2: Working Knowledge', 'Level 3: Independent', 'Level 4: Advanced Design', 'Level 5: SME & Mentoring']
    },
    {
      role: 'Data Engineer',
      focus: 'Big data ingestion, ETL/ELT pipelines, Lakehouse architecture, data cleaning, feature stores.',
      skills: ['Microsoft Fabric', 'Azure Databricks', 'Delta Lake', 'Azure Data Factory', 'ADLS Gen2', 'PySpark', 'Purview'],
      levels: ['Level 1: SQL queries & views', 'Level 2: Spark data cleaning', 'Level 3: Medallion lakehouse pipelines', 'Level 4: Real-time streaming ETL', 'Level 5: Enterprise data lake architect'],
      competencyLevels: ['Level 1: Awareness', 'Level 2: Working Knowledge', 'Level 3: Independent', 'Level 4: Advanced Design', 'Level 5: SME & Mentoring']
    },
    {
      role: 'Backend Engineer',
      focus: 'API microservices, integration gateways, asynchronous message queues, data validation.',
      skills: ['Python / FastAPI', 'C# / .NET', 'Azure Container Apps', 'Azure Functions', 'Azure Service Bus', 'Cosmos DB', 'OpenAPI'],
      levels: ['Level 1: CRUD endpoints', 'Level 2: Async queue consumers', 'Level 3: Resilient API microservices', 'Level 4: High-concurrency event systems', 'Level 5: Core platform architect'],
      competencyLevels: ['Level 1: Awareness', 'Level 2: Working Knowledge', 'Level 3: Independent', 'Level 4: Advanced Design', 'Level 5: SME & Mentoring']
    },
    {
      role: 'Platform & DevOps Engineer',
      focus: 'Infrastructure as Code (IaC), CI/CD pipelines, container orchestration, networking, secrets.',
      skills: ['Bicep / Terraform', 'GitHub Actions', 'Azure Virtual Network', 'Private Link', 'Azure Key Vault', 'Docker / ACR', 'Azure Monitor'],
      levels: ['Level 1: Manual portal setup', 'Level 2: Modular Bicep scripts', 'Level 3: Automated multi-stage CI/CD', 'Level 4: Zero-Trust landing zones', 'Level 5: Enterprise cloud architect'],
      competencyLevels: ['Level 1: Awareness', 'Level 2: Working Knowledge', 'Level 3: Independent', 'Level 4: Advanced Design', 'Level 5: SME & Mentoring']
    },
    {
      role: 'AI Architect',
      focus: 'End-to-end system topology, technology trade-offs, security postures, scalability, ADR authoring.',
      skills: ['Solution Architecture', 'Azure CAF Landing Zones', 'ADR Authoring', 'Threat Modeling', 'Cost Optimization', 'Disaster Recovery'],
      levels: ['Level 1: Component design', 'Level 2: Application topology', 'Level 3: Enterprise system design', 'Level 4: Multi-region resilient platforms', 'Level 5: Chief AI Architect'],
      competencyLevels: ['Level 1: Awareness', 'Level 2: Working Knowledge', 'Level 3: Independent', 'Level 4: Advanced Design', 'Level 5: SME & Mentoring']
    },
    {
      role: 'QA & Evaluation Engineer',
      focus: 'AI quality engineering, golden test dataset curation, regression testing, automated eval suites.',
      skills: ['Azure AI Evaluation SDK', 'PromptFlow', 'Ragas', 'PyTest', 'Dataset Curation', 'Metrics (NDCG, Faithfulness)'],
      levels: ['Level 1: Manual chat testing', 'Level 2: Automated test runs', 'Level 3: Statistical evaluation suites', 'Level 4: Continuous production eval', 'Level 5: AI Quality Director'],
      competencyLevels: ['Level 1: Awareness', 'Level 2: Working Knowledge', 'Level 3: Independent', 'Level 4: Advanced Design', 'Level 5: SME & Mentoring']
    },
    {
      role: 'Security & Governance Engineer',
      focus: 'AI threat modeling, zero-trust perimeter enforcement, regulatory compliance, adversarial red teaming.',
      skills: ['PyRIT', 'Entra ID RBAC', 'Private Link', 'Content Safety', 'OWASP Top 10 for LLMs', 'Purview', 'EU AI Act'],
      levels: ['Level 1: Basic password/secret audit', 'Level 2: RBAC & Private Link setup', 'Level 3: Adversarial jailbreak scanning', 'Level 4: Enterprise AI threat modeling', 'Level 5: Chief Information Security Officer'],
      competencyLevels: ['Level 1: Awareness', 'Level 2: Working Knowledge', 'Level 3: Independent', 'Level 4: Advanced Design', 'Level 5: SME & Mentoring']
    }
  ],

  portfolioCategories: [
    { category: 'Productivity & Copilots', examples: 'Employee search assistant, internal email summarizer, executive briefing agent.' },
    { category: 'Enterprise Knowledge RAG', examples: 'Technical manual search, legal contract discovery, HR policy assistant.' },
    { category: 'Autonomous Agent Workflows', examples: 'Automated invoice reconciliation, multi-system IT ticket resolution, loan underwriting.' },
    { category: 'Predictive Forecasting', examples: 'Supply chain demand forecasting, customer churn prediction, predictive maintenance.' },
    { category: 'Decision Support & Underwriting', examples: 'Commercial insurance underwriting, credit risk scoring, fraud ring analysis.' },
    { category: 'Intelligent Operations & SRE', examples: 'Automated log anomaly detection, database index tuning copilot, cloud incident responder.' },
    { category: 'Customer Experience & Voice', examples: 'Sub-second voice support agent, multilingual customer service portal, interactive concierge.' },
    { category: 'Document Processing & OCR', examples: 'Automated tax form extraction, mortgage document cracking, receipt auditing.' },
    { category: 'Software Engineering Accelerators', examples: 'Legacy COBOL-to-Java migration, automated unit test generation, PR review assistant.' },
    { category: 'AI Analytics & Insights', examples: 'Natural language database querying (Text-to-SQL), executive dashboard anomaly explanations.' }
  ],

  portfolioPrioritization: [
    { name: 'Internal Policy & Benefits RAG Assistant', value: 4.8, feasibility: 4.5, category: 'Quick Win', action: 'Build and launch in Sprint 1-2 using Azure AI Search + Foundry.' },
    { name: 'Automated Invoice Reconciliation Agent', value: 4.6, feasibility: 4.0, category: 'Strategic Initiative', action: 'Plan 8-week delivery with SAP OData connector and HITL approval.' },
    { name: 'Predictive Customer Churn Pipeline', value: 4.2, feasibility: 4.4, category: 'Quick Win', action: 'Train LightGBM model on Databricks/Azure ML and deploy to Managed Endpoint.' },
    { name: 'Unbounded Autonomous Code Refactoring Swarm', value: 3.2, feasibility: 2.1, category: 'Research / Timebox', action: 'Run 2-week timeboxed exploratory spike before committing production budget.' },
    { name: 'Customer Service Sub-Second Voice Agent', value: 4.7, feasibility: 3.8, category: 'Strategic Initiative', action: 'Deploy Azure AI Speech streaming WebSockets with GPT-4o Realtime.' }
  ]
};

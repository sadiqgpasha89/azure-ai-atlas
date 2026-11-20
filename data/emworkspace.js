/* AI Engineering Manager Workspace
   Leadership operating system: guided project assessment, solution review checklist,
   complexity & staffing estimator, team competency heatmap, and portfolio prioritization matrix. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.emWorkspace = {
  title: 'AI Engineering Manager Workspace',
  lede: 'An integrated command center for AI Engineering Managers to scope projects, estimate delivery effort, staff teams, and review production architectures.',

  assessmentQuestions: [
    { id: 'q1', text: '1. What core business problem does this solve, and what is the measurable metric (hours saved, revenue, CSAT)?' },
    { id: 'q2', text: '2. Is an AI model strictly necessary, or can deterministic rules / standard software solve this 10x cheaper?' },
    { id: 'q3', text: '3. Is classical ML (predictive tabular models) or Generative AI (LLMs / Multimodal) more appropriate?' },
    { id: 'q4', text: '4. Does the solution require RAG to ground responses in dynamic, proprietary enterprise knowledge?' },
    { id: 'q5', text: '5. Does the application require autonomous tool execution (Agentic AI) or simple prompt completion?' },
    { id: 'q6', text: '6. If multi-agent architecture is proposed, is the complexity justified over a single modular prompt or workflow?' },
    { id: 'q7', text: '7. Is enterprise data clean, permissioned, and accessible via automated APIs with clear document ownership?' },
    { id: 'q8', text: '8. Are target line-of-business APIs (SAP, Salesforce, internal microservices) documented with stable schemas?' },
    { id: 'q9', text: '9. What are the regulatory, data sovereignty, and security constraints (GDPR, HIPAA, Zero-Trust, Private Link)?' },
    { id: 'q10', text: '10. What is the latency tolerance (real-time sub-second voice/streaming vs 3-second chat vs overnight batch)?' },
    { id: 'q11', text: '11. What is the approved cloud and token budget, and what is the modeled unit economics cost per task?' },
    { id: 'q12', text: '12. Can the business tolerate probabilistic accuracy (e.g. 95%) with human escalation, or is 100% precision required?' },
    { id: 'q13', text: '13. Who is the executive business sponsor committed to operational rollout and change management?' },
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
        'Failure modes, retries, and fallback model degradation paths established.',
        'Latency budget broken down across networking, retrieval, inference, and UI rendering.'
      ]
    },
    {
      category: '3. RAG & Agent Engineering',
      items: [
        'Document cracking, table handling, and chunking strategy validated on complex enterprise files.',
        'Hybrid search (BM25 + Dense Vectors) and Semantic Ranker tested against lexical edge cases.',
        'Agent tool allowlist strictly limited to minimum necessary permissions; writes gated by human approval.',
        'Hard caps enforced on agent iteration loops (max 5 turns) and wall-clock execution timeouts.'
      ]
    },
    {
      category: '4. Security & Compliance',
      items: [
        'Threat modeling completed against OWASP Top 10 for LLMs (prompt injection, indirect injection).',
        'All service-to-service communication authenticated via Entra ID Managed Identity (zero keys).',
        'Azure Private Link enabled on all AI endpoints with public network ingress disabled.',
        'Document-level security trimming (ACLs) enforced server-side before vector retrieval.'
      ]
    },
    {
      category: '5. Quality & Operations Readiness',
      items: [
        'Golden evaluation dataset of 150+ representative queries versioned in Git.',
        'Automated evaluation gates (Groundedness >95%, Relevance >90%) integrated into CI/CD build pipeline.',
        'Azure Monitor dashboard active with alerts for HTTP 429 throttling, P95 latency, and token spikes.',
        'On-call SRE runbooks staffed with clear escalation paths and rollback procedures.'
      ]
    }
  ],

  complexityEstimator: {
    factors: [
      { name: 'Data Complexity', low: 'Clean structured databases', med: 'Mixed text & standard PDFs', high: 'Complex scanned tables, handwriting, multi-source' },
      { name: 'RAG Retrieval Depth', low: 'None / In-Context prompt', med: 'Single hybrid index', high: 'Multi-source, parent-child, GraphRAG, security trimming' },
      { name: 'Agent Autonomy', low: 'Deterministic prompt chaining', med: 'Single agent with read-only tools', high: 'Multi-agent swarm with autonomous writes & HITL' },
      { name: 'Enterprise Integrations', low: '1 REST API endpoint', med: '3-4 standard microservices', high: 'Legacy ERP (SAP), CRM (Salesforce), complex auth' },
      { name: 'Security & Compliance', low: 'Internal standard Entra ID', med: 'Multi-tenant data partitioning', high: 'Zero-Trust Private Link, CMK, HIPAA/FedRAMP' },
      { name: 'Evaluation Rigor', low: 'Basic manual spot checks', med: 'Automated golden eval set (100)', high: 'Continuous CI/CD gates, PyRIT red-teaming, drift' },
      { name: 'Scale & Concurrency', low: '<500 users, low QPS', med: '5,000 users, 20 QPS peak', high: '50,000+ users, global multi-region PTU' },
      { name: 'Reliability Requirement', low: 'Standard 99% business hours', med: 'Production 99.9% with monitoring', high: 'Mission-critical 99.99% multi-region active-active' }
    ],
    calculate: function (scores) {
      var total = Object.values(scores).reduce(function (a, b) { return a + Number(b); }, 0);
      var max = 24; // 8 factors * 3 (high=3)
      var pct = Math.round((total / max) * 100);

      var tier = 'Low Complexity (Sprint Project)';
      var weeks = '3 – 5 Weeks';
      var team = '1 AI Engineer, 0.5 Full-Stack Engineer, 0.25 EM';
      if (pct > 65) {
        tier = 'High / Critical Complexity (Enterprise Initiative)';
        weeks = '12 – 18 Weeks';
        team = '2 AI Engineers, 1 Principal Architect, 1 Data Engineer, 1 MLOps/DevOps, 1 Full-Stack, 1 EM';
      } else if (pct > 40) {
        tier = 'Medium Complexity (Standard Product Feature)';
        weeks = '6 – 10 Weeks';
        team = '1 AI Engineer, 1 Data/Backend Engineer, 0.5 MLOps, 0.5 EM';
      }

      return { score: total, percentage: pct, tier: tier, estimatedWeeks: weeks, recommendedTeam: team };
    }
  },

  skillsMatrix: [
    {
      role: 'AI Engineer',
      skills: ['Prompt Engineering & Few-Shot Design', 'RAG Retrieval Optimization (HNSW, BM25, RRF)', 'Microsoft Agent Framework & Tool Calling', 'Azure AI Evaluation SDK & Synthetic Datasets'],
      competencyLevels: ['Awareness', 'Working Knowledge', 'Independent Implementation', 'Advanced Design', 'Subject Matter Expert']
    },
    {
      role: 'ML Engineer / Data Scientist',
      skills: ['Classical ML (LightGBM, XGBoost, Scikit-learn)', 'Azure ML Pipelines & AutoML', 'Feature Engineering & Azure ML Feature Store', 'Model Drift Detection & Retraining Automations'],
      competencyLevels: ['Awareness', 'Working Knowledge', 'Independent Implementation', 'Advanced Design', 'Subject Matter Expert']
    },
    {
      role: 'Data Engineer',
      skills: ['ADLS Gen2 & Blob Storage Hierarchies', 'Microsoft Fabric Lakehouse / Databricks Delta Tables', 'Document Cracking via Document Intelligence', 'Streaming Pipelines (Event Hubs, Stream Analytics)'],
      competencyLevels: ['Awareness', 'Working Knowledge', 'Independent Implementation', 'Advanced Design', 'Subject Matter Expert']
    },
    {
      role: 'Platform & DevOps Engineer',
      skills: ['Infrastructure as Code (Azure Bicep / Terraform)', 'Azure API Management AI Gateway Policies', 'Azure Container Apps & AKS Orchestration', 'GitHub Actions / Azure DevOps CI/CD Pipelines'],
      competencyLevels: ['Awareness', 'Working Knowledge', 'Independent Implementation', 'Advanced Design', 'Subject Matter Expert']
    },
    {
      role: 'AI Architect / Principal Engineer',
      skills: ['End-to-End Solution Architecture Design', 'Zero-Trust Networking (Private Link, Hub-Spoke)', 'Multi-Region High Availability & DR Patterns', 'Architecture Decision Records (ADRs) & Trade-offs'],
      competencyLevels: ['Awareness', 'Working Knowledge', 'Independent Implementation', 'Advanced Design', 'Subject Matter Expert']
    },
    {
      role: 'Security & Governance Engineer',
      skills: ['AI Threat Modeling (OWASP Top 10 for LLMs)', 'Microsoft Purview Data Lineage & Classification', 'Azure AI Content Safety Prompt Shields', 'Customer-Managed Keys (CMK) & Zero Data Retention'],
      competencyLevels: ['Awareness', 'Working Knowledge', 'Independent Implementation', 'Advanced Design', 'Subject Matter Expert']
    },
    {
      role: 'AI Engineering Manager',
      skills: ['AI Use-Case Scoping & Feasibility Assessment', 'FinOps Unit Economics (Cost per Task Modeling)', 'AI Delivery Lifecycles & Team Capacity Planning', 'Cross-Functional Stakeholder Alignment & Executive Reporting'],
      competencyLevels: ['Awareness', 'Working Knowledge', 'Independent Implementation', 'Advanced Design', 'Subject Matter Expert']
    }
  ],

  portfolioPrioritization: [
    { name: 'Internal Knowledge RAG Search', value: 4, feasibility: 5, category: 'Quick Win', action: 'Fund immediately. High business value with low technical implementation barrier.' },
    { name: 'Multi-Agent Autonomous Underwriting', value: 5, feasibility: 3, category: 'Strategic Initiative', action: 'Plan for Q3. Requires extensive data curation and architecture spike first.' },
    { name: 'Call Center Real-Time Voice Copilot', value: 5, feasibility: 4, category: 'Strategic Initiative', action: 'High ROI. Focus engineering on sub-second audio latency and streaming.' },
    { name: 'Customer Email Auto-Responder with Write Access', value: 3, feasibility: 2, category: 'Caution / Re-scope', action: 'High regulatory and reputational risk. Re-scope into human-in-the-loop review draft.' },
    { name: 'Predictive Customer Churn Forecasting', value: 4, feasibility: 5, category: 'Quick Win', action: 'Deploy classical tabular AutoML on Azure ML; proven high ROI with low latency.' },
    { name: 'Autonomous Unbounded Web Research Swarm', value: 2, feasibility: 2, category: 'Research / Deprioritized', action: 'Deprioritize for production. High token cost with low deterministic business yield.' }
  ]
};

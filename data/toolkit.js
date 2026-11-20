/* AI Engineering Manager's Toolkit: Delivery, Governance, Templates & Frameworks */
window.ATLAS.toolkit = {
  title: 'AI Engineering Manager\'s Toolkit',
  lede: 'Practical artifacts, calculators, and decision templates designed for engineering managers and principal engineers delivering production AI systems.',

  useCaseAssessment: {
    title: 'AI Use-Case Assessment Matrix (Value vs Feasibility)',
    intro: 'Evaluate candidate AI initiatives across business impact and technical feasibility before committing engineering headcount. Score each dimension 1 to 5.',
    dimensions: [
      {
        category: 'Business Value (Weight: 50%)',
        criteria: [
          { name: 'Direct ROI / Cost Savings', desc: 'Measurable labor hours saved, operational cost reduced, or cycle time shortened.' },
          { name: 'Revenue & Competitive Differentiation', desc: 'Direct revenue generation, customer retention, or unique market advantage.' },
          { name: 'Strategic Alignment', desc: 'Directly supports primary corporate executive OKRs and board priorities.' },
          { name: 'Stakeholder & Executive Sponsorship', desc: 'Committed business unit owner ready to test and champion user adoption.' }
        ]
      },
      {
        category: 'Technical Feasibility (Weight: 50%)',
        criteria: [
          { name: 'Data Readiness & Quality', desc: 'Curated, clean, permissioned enterprise documents and structured data exist.' },
          { name: 'Deterministic Accuracy Tolerance', desc: 'Can business tolerate 95% accuracy with human fallback, or is 100% precision required?' },
          { name: 'Reasoning Complexity', desc: 'Simple lookup/summary (high feasibility) vs autonomous multi-step reasoning (lower feasibility).' },
          { name: 'Security & Regulatory Risk', desc: 'Low risk (internal FAQ) vs high risk (financial transactions, healthcare PII).' }
        ]
      }
    ],
    scoringMatrix: [
      { range: 'Score 18-20', verdict: 'Priority 1: Immediate Win', action: 'Fund immediately. High value, low technical complexity. Start rapid prototype.' },
      { range: 'Score 14-17', verdict: 'Priority 2: Strategic Investment', action: 'Plan for next quarter. Requires data curation or architecture spike first.' },
      { range: 'Score 10-13', verdict: 'Caution: Re-scope or Simplify', action: 'Complexity exceeds near-term value. Re-scope into a narrow deterministic workflow.' },
      { range: 'Below 10', verdict: 'Reject / Deprioritize', action: 'Do not fund. Unclear value or extreme technical/regulatory risk.' }
    ]
  },

  projectEstimation: {
    title: 'AI Project Estimation Framework',
    intro: 'Standard software estimation models fail on AI projects because data preparation, prompt experimentation, and evaluation sweeps consume more time than writing application glue.',
    phases: [
      {
        name: 'Phase 1: Discovery & Eval Set Curation (2-3 Weeks)',
        alloc: '20% Headcount',
        deliverables: 'Curating 100-200 representative test questions; labeling ground truth; establishing baseline score on simple prompt.'
      },
      {
        name: 'Phase 2: RAG / Tool Architecture Spike (3-4 Weeks)',
        alloc: '35% Headcount',
        deliverables: 'Document cracking via Document Intelligence; schema indexing in Azure AI Search; building tool functions; testing hybrid search recall.'
      },
      {
        name: 'Phase 3: Security & Enterprise Hardening (2-3 Weeks)',
        alloc: '25% Headcount',
        deliverables: 'Entra ID identity propagation; private endpoint networking; document security trimming; prompt shields; APIM rate limits.'
      },
      {
        name: 'Phase 4: Operations & Launch Readiness (2 Weeks)',
        alloc: '20% Headcount',
        deliverables: 'Canary deployment setup; Azure Monitor dashboards; on-call runbooks; quota approvals; load and failure testing.'
      }
    ]
  },

  architectureReview: {
    title: 'AI Architecture Review Template',
    intro: 'Standardized questionnaire to evaluate AI solution designs during formal engineering architecture reviews.',
    templateMarkdown: `# AI Architecture Review: [System Name]

**Review Date:** YYYY-MM-DD
**Engineering Manager:** [Name]
**Principal Engineer / Lead Architect:** [Name]
**Product Manager:** [Name]
**Review Status:** [Approved / Approved with Conditions / Rejected]

---

## 1. System Overview & Problem Statement
- What business problem does this solve, and why is an AI model required over deterministic code?
- Target user personas, expected concurrent users, and peak query volume (requests per second).

## 2. Model & Hosting Strategy
- **Selected Models:** (e.g. your approved frontier, small and embedding models-large).
- **Deployment Type:** [Global Standard / Global Provisioned (PTU) / Data Zone / Regional / Self-hosted on AKS].
- **Residency & Sovereignty:** Does this workload process data outside the primary region?
- **Quota & Capacity:** Are approved tokens per minute (TPM) sufficient for 3x anticipated launch peak?

## 3. Data & Retrieval Layer (RAG)
- **Document Ingestion:** How are documents cracked and chunked? Is Document Intelligence used for tables?
- **Search Strategy:** Pure vector or Hybrid (BM25 + Dense Vectors) + Semantic Reranker?
- **Tenancy & Security Trimming:** How are document-level permissions enforced? Are filters injected server-side?

## 4. Agentic Architecture & Autonomy Controls
- **Orchestration Pattern:** [Sequential / Supervisor / Handoff / Deterministic Workflow with LLM].
- **Tool Authorization:** Do tools execute with user-delegated tokens or shared service credentials?
- **Blast Radius & Approval Gates:** Which tools perform writes, and how is human authorization enforced?
- **Safety Budgets:** What are the hard caps on tool iterations (max turns) and wall-clock timeout?

## 5. Security & Governance
- **Network Isolation:** Are all AI endpoints on Private Link with public access disabled?
- **Guardrails:** Are Azure AI Content Safety Prompt Shields enabled for both input and retrieved context?
- **Zero Customer Data Retention (ZCDR):** Is contractual zero data retention enabled?

## 6. Observability, Evals & Operations
- **Evaluation Baseline:** What is the current Recall@K, Groundedness, and Relevance score on the golden dataset?
- **Production Dashboard:** Are P95 TTFT, 429 throttling spikes, and tool error rates instrumented?
- **Cost per Task:** What is the modeled unit economics cost per successful task?
- **Rollback Mechanism:** How is a broken prompt or bad model version rolled back within 5 minutes?
`
  },

  raciMatrix: {
    title: 'AI Engineering RACI Matrix',
    intro: 'Clarifies engineering accountability, ownership, and advisory roles across AI projects.',
    roles: ['Engineering Manager (EM)', 'Principal Engineer (PE)', 'AI / ML Engineer', 'Data Engineer', 'Product Manager (PM)', 'InfoSec / Compliance'],
    matrix: [
      { task: 'Use-case scoping and business ROI definition', raci: ['A', 'C', 'I', 'I', 'R', 'C'] },
      { task: 'Golden evaluation dataset creation & labeling', raci: ['A', 'C', 'R', 'C', 'R', 'I'] },
      { task: 'Model selection & deployment type (PTU vs Standard)', raci: ['A', 'R', 'C', 'I', 'I', 'C'] },
      { task: 'RAG retrieval architecture (hybrid, reranking, chunking)', raci: ['I', 'A', 'R', 'C', 'I', 'I'] },
      { task: 'Data pipeline ingestion & document cracking', raci: ['I', 'C', 'C', 'R/A', 'I', 'I'] },
      { task: 'Agent tool authorization & security boundary design', raci: ['A', 'R', 'C', 'I', 'I', 'C'] },
      { task: 'Data privacy, PII masking & residency compliance', raci: ['A', 'C', 'I', 'I', 'I', 'R/A'] },
      { task: 'CI/CD pipeline & automated evaluation gates', raci: ['I', 'A', 'R', 'I', 'I', 'I'] },
      { task: 'Operational dashboards, runbooks & on-call rota', raci: ['A', 'R', 'C', 'I', 'I', 'I'] },
      { task: 'Cost per task optimization & FinOps levers', raci: ['A', 'R', 'C', 'I', 'C', 'I'] }
    ]
  },

  raidTracker: {
    title: 'AI Project RAID Tracker (Risks, Assumptions, Issues, Dependencies)',
    intro: 'Pre-populated RAID template highlighting the typical failure modes in enterprise generative AI initiatives.',
    items: [
      { type: 'Risk', title: 'HTTP 429 rate limiting at launch', mitigation: 'Request quota 4 weeks prior; implement APIM multi-region failover pool.' },
      { type: 'Risk', title: 'Prompt injection via retrieved customer documents', mitigation: 'Deploy Content Safety Prompt Shields; delimit untrusted text in system prompt.' },
      { type: 'Risk', title: 'Uncontrolled cost explosion from multi-agent loops', mitigation: 'Enforce hard limits on maximum tool turns (max 5) and session timeout.' },
      { type: 'Assumption', title: 'Enterprise documents contain accurate, up-to-date knowledge', validation: 'Audit document owners and Purview data catalog before ingestion.' },
      { type: 'Assumption', title: 'End users accept 95% accuracy with human escalation path', validation: 'Confirm with product stakeholders and user research in pre-pilot phase.' },
      { type: 'Issue', title: 'Naive chunker destroys tables in financial PDF reports', resolution: 'Replace standard text splitter with Azure AI Document Intelligence layout models.' },
      { type: 'Dependency', title: 'Enterprise Entra ID security group sync for document ACLs', resolution: 'Coordinate with Identity Team to ensure group SIDs are available in OAuth claims.' },
      { type: 'Dependency', title: 'GPU quota approval for Azure ML fine-tuning cluster', resolution: 'Submit Azure Quota increase request across two candidate regions.' }
    ]
  },

  qualityGates: {
    title: 'Maturity Quality Gates & Exit Criteria',
    intro: 'Measurable acceptance criteria required to promote an AI feature across stages.',
    stages: [
      {
        stage: 'Gate 1: Prototype -> Pilot',
        criteria: [
          'Golden evaluation dataset of at least 100 representative cases exists in Git.',
          'Baseline Groundedness score exceeds 90% on golden evaluation set.',
          'Initial cost per task modeled and accepted by business owner.',
          'All tool actions are read-only or gated behind manual human approvals.',
          'Basic prompt injection defense verified with red-team test suite.'
        ]
      },
      {
        stage: 'Gate 2: Pilot -> Production',
        criteria: [
          'Evaluation dataset expanded to 500+ real-world cases; Groundedness >95%, Relevance >90%.',
          'Automated evaluation gates integrated into CI/CD build pipeline.',
          'Model quota approved for 3x peak; multi-region APIM fallback verified under load.',
          'Document-level security trimming verified with zero cross-tenant query leakage.',
          'Zero Customer Data Retention (ZCDR) confirmed with Microsoft.',
          'Production dashboard active in Azure Monitor; on-call rota and runbooks staffed.'
        ]
      },
      {
        stage: 'Gate 3: Production -> Scale',
        criteria: [
          'Unit economics optimized: prompt caching active (>35% hit rate) and semantic caching tested.',
          'Cost per successful task is stable under 10x traffic projections.',
          'Continuous drift monitoring detects quality regression within 1 hour.',
          'Quarterly model retirement and upgrade evaluation schedule established.'
        ]
      }
    ]
  },

  vendorMatrix: {
    title: 'Model & Platform Assessment Matrix',
    intro: 'Comparing foundation model options and deployment paths available on Azure.',
    models: [
      {
        family: 'OpenAI frontier models',
        strengths: 'Industry-leading reasoning, complex multimodal analysis, excellent tool-calling compliance.',
        tradeoffs: 'Higher cost per token, subject to regional quota allocations.',
        bestFit: 'Multi-agent supervisor agents, complex contract analysis, multimodal diagrams.'
      },
      {
        family: 'OpenAI small models',
        strengths: 'Extremely fast, fraction of the cost, excellent at classification and structured extraction.',
        tradeoffs: 'Lower multi-step reasoning depth; prone to drift on complex open-ended instructions.',
        bestFit: 'Query routing, text summarization, data extraction, high-volume chatbot triage.'
      },
      {
        family: 'Partner & Open-Weight Models (Meta Llama 3, Mistral, Cohere)',
        strengths: 'Available in Foundry Catalog; pay-per-token or self-hosted; prevents single-vendor lock-in.',
        tradeoffs: 'Tool-calling schemas vary; self-hosting requires managing GPU infrastructure.',
        bestFit: 'Specialized domain tasks, compliance mandates requiring open-source auditability.'
      },
      {
        family: 'Small Language Models (Microsoft Phi-3 / Phi-4)',
        strengths: 'High performance-to-size ratio; runs on edge devices or low-cost CPU/GPU VMs.',
        tradeoffs: 'Limited general knowledge; requires focused fine-tuning or narrow prompt scope.',
        bestFit: 'Embedded edge devices, offline privacy-critical extraction, cost-sensitive classification.'
      }
    ]
  },

  skillsMatrix: {
    title: 'AI Engineering Team Skills & Capability Matrix',
    intro: 'Assess current team capabilities and identify hiring or training gaps across the AI engineering lifecycle.',
    competencies: [
      {
        area: 'RAG & Search Engineering',
        skills: 'Document parsing, layout analysis, vector indexing algorithms (HNSW), hybrid search, semantic reranking, metadata filtering.',
        levelTarget: 'Advanced (Essential for all knowledge assistants)'
      },
      {
        area: 'Agent Architecture & Orchestration',
        skills: 'Microsoft Agent Framework, state persistence, checkpointing, tool interface design, MCP protocol, human-in-the-loop flows.',
        levelTarget: 'Intermediate to Advanced (Essential for multi-agent systems)'
      },
      {
        area: 'GenAIOps & Evaluation',
        skills: 'MLflow tracking, synthetic dataset generation, automated LLM-as-a-judge scoring, CI/CD evaluation gates, drift detection.',
        levelTarget: 'Advanced (Mandatory for production release confidence)'
      },
      {
        area: 'AI Security & Governance',
        skills: 'Entra ID Workload Identity, prompt shield integration, indirect injection mitigations, document ACLs, private networking.',
        levelTarget: 'Intermediate (Essential for enterprise compliance)'
      },
      {
        area: 'Cloud Platform & FinOps',
        skills: 'Azure Bicep, API Management AI gateway policies, PTU sizing, prompt caching economics, Azure Monitor telemetry.',
        levelTarget: 'Intermediate to Advanced (Essential for scalability and budget control)'
      }
    ]
  },

  executiveReportTemplate: {
    title: 'Executive AI Status Report Template',
    intro: 'One-page monthly executive reporting template for leadership, steering committees, and business sponsors.',
    templateMarkdown: `# Executive AI Status Report: [Project Name]

**Reporting Period:** [Month, Year]
**Engineering Manager:** [Name]
**Product Sponsor:** [Name]
**Overall Health:** [Green / Amber / Red]

---

## 1. Business Value & Milestone Highlights
- **Key Achievements:** [Top 2-3 business outcomes delivered this month].
- **Production Adoption:** [Active users, tasks completed, user satisfaction rating].
- **Efficiency Impact:** [Hours saved or revenue influenced].

## 2. Quality & Reliability Scorecard
| Metric | Target | Current | Trend | Status |
| :--- | :--- | :--- | :--- | :--- |
| Task Completion Rate | >95% | 97.8% | +0.6% | On Target |
| Groundedness (Evals) | >95% | 96.2% | +0.4% | On Target |
| P95 Response Latency | <2,000ms | 1,420ms | -180ms | On Target |
| HTTP 429 Throttling Rate | <0.1% | 0.05% | -0.02% | On Target |

## 3. Financial Performance (FinOps)
- **Monthly Cloud & Token Spend:** $X,XXX (Budget: $Y,YYY · Variance: Z%).
- **Unit Economics (Cost per Task):** $0.0142 (Target: <$0.020).
- **Optimization Impact:** Prompt caching and model cascading saved $X,XXX this month.

## 4. Key Risks & Delivery Blockers
- **Blocker 1:** [Description, business impact, owner, required leadership decision].
- **Risk 1:** [Upcoming risk e.g. quota limit, vendor model retirement, or compliance review].

## 5. Next Month Priorities
1. [Milestone 1: e.g. Expanding pilot to 500 business users].
2. [Milestone 2: e.g. Deploying automated PR evaluation gate in GitHub Actions].
3. [Milestone 3: e.g. Integrating document security trimming with Entra ID groups].
`
  }
};

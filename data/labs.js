/* Hands-on Labs, Progressive Learning Roadmaps & Microsoft Learn Resource Hub */
window.ATLAS.labs = {
  title: 'Hands-on Labs & Learning Roadmaps',
  lede: 'Practical implementation exercises, structured role-based learning roadmaps, and direct links to authoritative Microsoft Learn architecture documentation.',

  learningPaths: [
    {
      id: 'path-em',
      role: 'AI Engineering Manager',
      duration: '4-Week Progressive Curriculum',
      objective: 'Master the operating rhythm: build vs buy evaluation, risk appetite, team staffing, unit economics, and production launch gates.',
      modules: [
        { week: 'Week 1: AI Strategy & Governance', topics: 'Build vs buy framework, Cloud Adoption Framework for AI, management group hierarchy, Entra ID zero-trust identity.' },
        { week: 'Week 2: RAG & Agent Architecture Foundations', topics: 'Classic vs agentic RAG trade-offs, deterministic workflows vs autonomous agents, human-in-the-loop controls.' },
        { week: 'Week 3: GenAIOps & Quality Engineering', topics: 'Evaluation sets, statistical quality indicators (Recall@K, Groundedness), automated CI/CD release gates.' },
        { week: 'Week 4: FinOps, Capacity & Production Operations', topics: 'Unit economics (cost per task), PTU vs pay-as-you-go, 429 throttling mitigation, executive reporting.' }
      ]
    },
    {
      id: 'path-pe',
      role: 'Principal AI Architect',
      duration: '6-Week Advanced Architecture Curriculum',
      objective: 'Design scalable, multi-tenant AI systems with fault tolerance, low-latency streaming, and strict compliance boundaries.',
      modules: [
        { week: 'Weeks 1-2: Advanced Retrieval & Graph Architecture', topics: 'Document cracking via Document Intelligence, layout chunking, hybrid search tuning (RRF), Turing semantic reranker, GraphRAG community extraction.' },
        { week: 'Weeks 3-4: Multi-Agent Systems & State Persistence', topics: 'Microsoft Agent Framework, supervisor and handoff patterns, state persistence in Cosmos DB, MCP tool servers, agent failure recovery.' },
        { week: 'Weeks 5-6: Enterprise Security & Multi-Region Resilience', topics: 'Document-level security trimming, private link networking, APIM multi-region circuit breakers, zero customer data retention.' }
      ]
    },
    {
      id: 'path-eng',
      role: 'Production AI Engineer',
      duration: '4-Week Practical Implementation Curriculum',
      objective: 'Build, test, evaluate, and deploy production-grade RAG and agent applications using Azure SDKs.',
      modules: [
        { week: 'Week 1: SDK Fundamentals & Ingestion', topics: 'Azure OpenAI client, text-embedding-3 models, Azure AI Document Intelligence SDK, structuring Markdown output.' },
        { week: 'Week 2: Indexing & Search Implementation', topics: 'Azure AI Search SDK, vector index schemas, HNSW parameters, push vs pull indexers, implementing hybrid queries.' },
        { week: 'Week 3: Agent Development & MCP Tools', topics: 'Microsoft Agent Framework in Python/C#, defining tool schemas, managing conversation history, connecting MCP endpoints.' },
        { week: 'Week 4: Automated Testing & Evaluation', topics: 'Microsoft Foundry evaluation SDK, synthetic test generation, writing PyTest evaluation suites, GitHub Actions automation.' }
      ]
    }
  ],

  exercises: [
    {
      id: 'lab-rag-foundry-iq',
      title: 'Lab 1: End-to-End Enterprise RAG with Azure AI Search & Foundry IQ',
      level: 'Intermediate',
      time: '60 mins',
      goal: 'Build a production RAG pipeline using Azure AI Document Intelligence for layout extraction and Azure AI Search for hybrid vector search with semantic reranking.',
      steps: [
        'Upload sample enterprise PDF policies with tables and headers to Azure Blob Storage.',
        'Run Azure AI Document Intelligence `prebuilt-layout` model to extract Markdown tables and hierarchical sections.',
        'Chunk text using layout boundaries and generate embeddings using `text-embedding-3-small`.',
        'Create an Azure AI Search index configured with BM25 text fields, vector fields, and a Semantic Configuration.',
        'Execute a hybrid query combining vector similarity and keyword search; inspect Reciprocal Rank Fusion (RRF) scores.',
        'Enable the Semantic Reranker and verify that top-ranked passages contain verified table data.',
        'Send retrieved passages with citation instructions to GPT-4o; verify answer groundedness and footnote citations.'
      ]
    },
    {
      id: 'lab-multiagent-framework',
      title: 'Lab 2: Building Autonomous Multi-Agent Workflows with Microsoft Agent Framework',
      level: 'Advanced',
      time: '90 mins',
      goal: 'Implement a Supervisor-Worker multi-agent system with parallel tool calling, durable state persistence, and human approval gates.',
      steps: [
        'Initialize a Python project with Microsoft Agent Framework (`azure-ai-projects` and `semantic-kernel`).',
        'Define a Research Agent equipped with an Azure AI Search retrieval tool and a Calculation Agent with Python function tools.',
        'Configure a Supervisor Agent that parses complex user inquiries and dispatches sub-tasks to workers.',
        'Implement an approval gate using an event callback: pause execution before executing sensitive mock database writes.',
        'Persist conversational state and thread history to Azure Cosmos DB.',
        'Simulate tool errors and verify that the supervisor executes graceful retry logic without entering infinite loops.',
        'Export execution traces to Azure Monitor and inspect the distributed waterfall diagram in Application Insights.'
      ]
    },
    {
      id: 'lab-security-trimming',
      title: 'Lab 3: Document-Level Security Trimming with Entra ID Claims',
      level: 'Advanced',
      time: '45 mins',
      goal: 'Enforce document-level access control in Azure AI Search so users only retrieve documents matching their security group memberships.',
      steps: [
        'Index documents in Azure AI Search with a collection field: `security_groups: ["finance", "executive"]`.',
        'Simulate two user identities with different Entra ID security group claims in JWT tokens.',
        'Construct a backend search proxy that extracts caller security claims from the authorization header.',
        'Inject a mandatory OData filter: `search.in(security_groups, \'finance\')` into the search request.',
        'Verify that user A (finance) retrieves financial data while user B (marketing) receives zero results on identical queries.',
        'Verify that semantic caching keys include user security hashes to prevent cache leakage.'
      ]
    },
    {
      id: 'lab-genaiops-pipeline',
      title: 'Lab 4: GenAIOps: Automated PR Evaluation Pipeline with GitHub Actions',
      level: 'Intermediate',
      time: '60 mins',
      goal: 'Set up a continuous integration pipeline that runs automated LLM evaluation gates on every prompt pull request.',
      steps: [
        'Create a repository containing prompt templates, a golden dataset of 50 test queries, and ground-truth references.',
        'Configure GitHub Actions with Workload Identity Federation (OIDC) to authenticate to Azure without secrets.',
        'Write an evaluation script using the Microsoft Foundry Evaluation SDK measuring Groundedness and Relevance.',
        'Configure the GitHub Actions workflow to run evaluations on every pull request targeting `main`.',
        'Add a quality gate check: fail the pull request build if Groundedness drops below 92%.',
        'Simulate a prompt regression that introduces hallucinations; verify that the pipeline automatically blocks the merge.'
      ]
    },
    {
      id: 'lab-resilient-gateway',
      title: 'Lab 5: Resilient AI Gateway with APIM & Multi-Region Failover',
      level: 'Intermediate',
      time: '45 mins',
      goal: 'Configure Azure API Management as an AI Gateway with rate limiting, prompt caching, and multi-region spillover pools.',
      steps: [
        'Deploy two Azure OpenAI deployments in different regions (e.g. East US and Sweden Central).',
        'Create an Azure API Management instance and configure an AI Gateway backend pool containing both deployments.',
        'Apply an `azure-openai-token-limit` policy enforcing per-client TPM limits and emitting usage metrics.',
        'Apply a `semantic-cache-store` policy integrated with Azure Managed Redis to cache answers for repeated queries.',
        'Simulate heavy traffic to force HTTP 429 throttling on the primary region; verify that APIM automatically fails over to the secondary region with zero dropped requests.'
      ]
    }
  ],

  officialResources: [
    {
      title: 'Azure AI/ML Architecture Center',
      url: 'https://learn.microsoft.com/en-us/azure/architecture/ai-ml/',
      desc: 'Official Microsoft reference architectures, design patterns, and deployment guides for generative AI and machine learning.'
    },
    {
      title: 'Microsoft Agent Framework Documentation',
      url: 'https://learn.microsoft.com/agent-framework/',
      desc: 'Official documentation for Microsoft Agent Framework, workflows, multi-agent orchestration, MCP tools, and state management.'
    },
    {
      title: 'RAG and Generative AI — Foundry IQ',
      url: 'https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview',
      desc: 'Authoritative guidance on Azure AI Search, knowledge bases, agentic retrieval, chunking, and semantic reranking.'
    },
    {
      title: 'Cloud Adoption Framework for AI (CAF)',
      url: 'https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/scenarios/ai/ready',
      desc: 'Enterprise landing zones, governance hierarchies, subscription strategies, and security baselines for AI platforms.'
    },
    {
      title: 'Evaluation in Microsoft Foundry',
      url: 'https://learn.microsoft.com/en-us/azure/foundry/concepts/evaluation-overview',
      desc: 'Comprehensive guide to offline evaluation datasets, quality metrics (groundedness, relevance, coherence), and CI/CD integration.'
    },
    {
      title: 'Microsoft Cloud Security Benchmark — AI Security',
      url: 'https://learn.microsoft.com/en-us/security/benchmark/azure/mcsb-v2-artificial-intelligence-security',
      desc: 'Official enterprise controls, security baselines, and identity guidelines for artificial intelligence workloads.'
    }
  ]
};

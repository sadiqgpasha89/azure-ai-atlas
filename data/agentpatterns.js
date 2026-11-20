/* Agentic AI Architecture Patterns, Frameworks & Orchestration
   Comprehensive reference covering 18 agent architecture patterns,
   framework comparisons (Agent Framework, Foundry Agent Service, Semantic Kernel, LangGraph),
   memory lifecycles, and tool authorization. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.agentPatterns = {
  title: 'Agentic AI Architecture Patterns',
  lede: 'Production design patterns, framework trade-offs, and state orchestration for autonomous single- and multi-agent systems on Microsoft Azure.',

  patterns: [
    {
      id: 'single-tools',
      num: '01',
      name: 'Single Agent with Tools',
      flowType: 'Direct ReAct Loop',
      summary: 'A single foundation model operating in a Thought-Action-Observation loop with registered tool functions.',
      execution: 'User query -> LLM reasoning -> Tool call specification -> Runtime tool execution -> Observation fed back -> Final synthesis.',
      azureImplementation: 'Microsoft Agent Framework / Foundry Agent Service with Azure Functions or OpenAPI tool plugins.',
      tradeoffs: 'Simplest to implement and debug; degrades when tool count exceeds 15-20 or tasks require multi-step branching.',
      bestFit: 'Customer support FAQ with CRM lookup, database inquiry assistant, lightweight personal productivity bots.'
    },
    {
      id: 'dynamic-retrieval',
      num: '02',
      name: 'Agent with Dynamic Retrieval (Agentic RAG)',
      flowType: 'Dynamic Tooling',
      summary: 'Agent determines at runtime whether retrieval is necessary, formulates tailored sub-queries, and verifies retrieved context.',
      execution: 'Prompt -> Query analyzer -> Search tool call (Azure AI Search) -> Relevance reflection -> Secondary search if needed -> Answer.',
      azureImplementation: 'Foundry Agent Service connected to Azure AI Search as a managed Knowledge Tool with hybrid vector filtering.',
      tradeoffs: 'Significantly higher answer accuracy and lower hallucinations; adds 1-2 extra LLM round-trips.',
      bestFit: 'Technical documentation assistants, legal compliance analyzers, dynamic competitive intelligence portals.'
    },
    {
      id: 'supervisor-worker',
      num: '03',
      name: 'Supervisor & Worker Agents',
      flowType: 'Centralized Orchestration',
      summary: 'A central supervisor agent evaluates incoming goals, breaks them into sub-tasks, delegates to specialized domain workers, and compiles the final result.',
      execution: 'Goal -> Supervisor Agent -> Dispatches Sub-task 1 to Worker A, Sub-task 2 to Worker B -> Workers execute tools -> Supervisor synthesizes outputs.',
      azureImplementation: 'Microsoft Agent Framework `Workflow` or Foundry Agent Service multi-agent group with Cosmos DB session state.',
      tradeoffs: 'High specialization and modularity; supervisor represents a single point of failure and bottleneck.',
      bestFit: 'Enterprise research reports, multi-system IT support triage, financial portfolio analysis across asset classes.'
    },
    {
      id: 'planner-executor',
      num: '04',
      name: 'Planner and Executor',
      flowType: 'Two-Stage Separation',
      summary: 'Separates planning from execution: a high-reasoning model produces an immutable step-by-step plan, and an execution engine runs each step.',
      execution: 'User Goal -> Planner LLM -> Structured JSON Plan -> Executor Worker iterates through steps -> Replanning triggered only on hard failure.',
      azureImplementation: 'o1/o3-mini or GPT-4o planner model orchestrating Azure Functions microservices in Container Apps.',
      tradeoffs: 'Drastically reduces hallucinations and unbounded loops; less flexible when initial environment assumptions are invalid.',
      bestFit: 'Data migration pipelines, code refactoring agents, automated infrastructure provisioning.'
    },
    {
      id: 'sequential-pipeline',
      num: '05',
      name: 'Sequential Agent Pipeline (Chaining)',
      flowType: 'Linear Assembly',
      summary: 'Output of Agent N becomes the direct input of Agent N+1 in a deterministic assembly line.',
      execution: 'Raw input -> Extraction Agent -> Normalization Agent -> Verification Agent -> Polishing Agent -> Final Output.',
      azureImplementation: 'Azure Durable Functions orchestrator calling Microsoft Agent Framework workers with durable checkpoints.',
      tradeoffs: 'Predictable execution cost and latency, easy unit testing; errors in early stages compound down the chain.',
      bestFit: 'Multi-lingual content publishing, document summarization into standardized regulatory forms, automated resume parsing.'
    },
    {
      id: 'parallel-agents',
      num: '06',
      name: 'Parallel Agents (Fan-Out / Fan-In)',
      flowType: 'Concurrent Workers',
      summary: 'Independent tasks dispatched concurrently across multiple worker agents, with outputs aggregated by a reducer agent.',
      execution: 'Input Query -> Router fan-out -> Worker 1 (Risk), Worker 2 (Legal), Worker 3 (Finance) execute simultaneously -> Aggregator fan-in.',
      azureImplementation: 'Azure Container Apps / Service Bus parallel workers aggregated by a Foundry orchestrator.',
      tradeoffs: 'Lowest wall-clock latency for multi-faceted tasks; multiplies token consumption and requires parallel model quotas.',
      bestFit: 'Vendor risk assessment, contract multi-clause analysis, parallel web search across diverse news sources.'
    },
    {
      id: 'router-agent',
      num: '07',
      name: 'Router / Triage Agent',
      flowType: 'Classification Gate',
      summary: 'A fast, inexpensive classifier agent inspects the user input and routes it to the single best specialist agent or deterministic workflow.',
      execution: 'Inbound message -> Fast Router (GPT-4o-mini / Phi-4) -> Classifies intent -> Routes to Billing Agent, Technical Agent, or FAQ.',
      azureImplementation: 'Azure API Management or lightweight Azure Function hosting the router prompt with direct HTTP dispatch.',
      tradeoffs: 'Cost-efficient and fast; misclassifications in the router route users to the wrong specialist.',
      bestFit: 'Customer service desk front doors, multi-department enterprise copilots, omnichannel ticketing.'
    },
    {
      id: 'hierarchical-agents',
      num: '08',
      name: 'Hierarchical Multi-Tier Agents',
      flowType: 'Multi-Level Management',
      summary: 'Nested management hierarchy where executive agents supervise team-lead agents who in turn manage specialized worker agents.',
      execution: 'Corporate Objective -> Executive Agent -> Department Leads (Eng, Marketing) -> Task Workers -> Results bubble back up.',
      azureImplementation: 'Microsoft Agent Framework with recursive sub-workflows and Cosmos DB state isolation per team.',
      tradeoffs: 'Capable of handling massive enterprise complexity; high latency and token cost, difficult to trace root causes.',
      bestFit: 'Enterprise autonomous product planning, software development teams (Product Manager -> Architect -> Developer -> QA).'
    },
    {
      id: 'agent-handoff',
      num: '09',
      name: 'Agent Handoff (Swarm / Peer Routing)',
      flowType: 'Stateful Peer Transfer',
      summary: 'Agents hand off conversational control directly to peer agents without returning to a central supervisor, passing active context.',
      execution: 'User speaks with Triage Agent -> Handoff to Sales Agent -> Sales determines technical question -> Handoff to Solutions Architect Agent.',
      azureImplementation: 'Microsoft Agent Framework / OpenAI Swarm primitives with thread state preservation in Cosmos DB.',
      tradeoffs: 'Natural conversational flow without supervisor bottleneck; risk of circular handoffs between confused peers.',
      bestFit: 'Complex consultative sales, collaborative customer onboarding, multi-specialist medical intake.'
    },
    {
      id: 'debate-agents',
      num: '10',
      name: 'Debate / Multi-Perspective Agents',
      flowType: 'Adversarial Dialectic',
      summary: 'Two or more agents argue opposing viewpoints or approaches, evaluated by an impartial judge agent to surface blind spots.',
      execution: 'Proposal -> Pro-Agent argues benefits -> Con-Agent attacks assumptions -> Round 2 rebuttal -> Judge Agent issues verdict.',
      azureImplementation: 'Container Apps running automated debate rounds with MLflow metric logging for consensus tracking.',
      tradeoffs: 'Exceptional error detection and bias mitigation; 3-5x token cost overhead compared to single prompt.',
      bestFit: 'Investment committee decision support, architectural design reviews, high-stakes medical diagnosis review.'
    },
    {
      id: 'critic-evaluator',
      num: '11',
      name: 'Generator-Critic / Evaluator Agent',
      flowType: 'Dual-Agent Refinement',
      summary: 'Generator agent drafts an artifact; a separate Critic agent evaluates it against a strict rubric and returns actionable feedback.',
      execution: 'Prompt -> Generator produces Draft 1 -> Critic evaluates against rubric -> If score < threshold, returns feedback -> Generator refines.',
      azureImplementation: 'Foundry Evaluation SDK paired with Microsoft Agent Framework with iteration loop counters.',
      tradeoffs: 'Substantially elevates artifact quality; requires well-defined, objective evaluation rubrics to prevent cycling.',
      bestFit: 'Automated code generation with unit-test verification, marketing copy compliance, legal clause drafting.'
    },
    {
      id: 'reflection-agent',
      num: '12',
      name: 'Self-Reflection / Self-Correction Agent',
      flowType: 'Single-Agent Introspection',
      summary: 'A single agent inspects its own tool output or generated response, critiques errors, and self-corrects before returning to the user.',
      execution: 'Draft response -> Self-reflection prompt ("Check citations and code execution") -> Identified mistakes -> Corrected response.',
      azureImplementation: 'Prompt engineering chaining in Microsoft Foundry with internal scratchpad reasoning.',
      tradeoffs: 'No multi-agent coordination overhead; model may double down on hallucinations if underlying knowledge is absent.',
      bestFit: 'SQL query generation with syntax error recovery, mathematical reasoning, structured JSON extraction.'
    },
    {
      id: 'hitl-workflow',
      num: '13',
      name: 'Human-in-the-Loop (HITL) Approval Workflow',
      flowType: 'Gated Execution',
      summary: 'Agent autonomously prepares actions, but execution of high-blast-radius actions pauses until a human approves via webhook or UI.',
      execution: 'Agent plans wire transfer -> Pauses execution -> Generates approval card in Microsoft Teams -> Human clicks Approve -> Agent completes.',
      azureImplementation: 'Azure Logic Apps / Durable Functions external event waiting paired with Microsoft Teams Adaptive Cards.',
      tradeoffs: 'Guarantees compliance and safety for irreversible transactions; introduces human latency into automated workflows.',
      bestFit: 'Payment authorizations, cloud infrastructure deletions, automated email sends to enterprise customers, medical prescription changes.'
    },
    {
      id: 'stateful-conversational',
      num: '14',
      name: 'Stateful Conversational Agent with Memory',
      flowType: 'Memory-Augmented Chat',
      summary: 'Maintains short-term conversational context, working memory scratchpads, and long-term semantic memory across user sessions.',
      execution: 'User query -> Retrieve user long-term preferences (Cosmos DB) -> Load active session thread -> Reasoning -> Update memory state.',
      azureImplementation: 'Cosmos DB for session threads and profile state + Azure Managed Redis for low-latency active turn caching.',
      tradeoffs: 'Personalized, context-aware experience; requires privacy controls, data retention policies, and context window compression.',
      bestFit: 'Executive personal assistants, long-term tutoring copilots, ongoing health coaching.'
    },
    {
      id: 'event-driven-agents',
      num: '15',
      name: 'Event-Driven Background Agents',
      flowType: 'Reactive Asynchronous',
      summary: 'Agents triggered by cloud events (file arrival, telemetry alerts, webhook) rather than user chat prompts.',
      execution: 'Blob created event -> Event Grid -> Azure Function -> Agent analyzes document -> Stores insight -> Emits completion event.',
      azureImplementation: 'Event Grid + Service Bus queues triggering Container Apps agent jobs with KEDA autoscaling.',
      tradeoffs: 'Fully automated, decouples user interfaces from long-running AI tasks; requires robust dead-letter handling.',
      bestFit: 'Continuous security threat log analysis, automated document processing upon upload, anomaly remediation.'
    },
    {
      id: 'long-running-agents',
      num: '16',
      name: 'Durable Long-Running Agents',
      flowType: 'Stateful Checkpointed Workflows',
      summary: 'Agents executing multi-day tasks across asynchronous system boundaries with automatic recovery from crashes.',
      execution: 'Task initiated -> State checkpointed in durable storage -> Agent waits on external system -> Resumes on event -> Finishes.',
      azureImplementation: 'Azure Durable Functions orchestrating Agent Framework sessions with Azure Storage table checkpointing.',
      tradeoffs: 'Survives platform restarts, timeouts, and multi-hour network disconnects; requires deterministic orchestrator code.',
      bestFit: 'Clinical trial patient matching, legal discovery across millions of files, multi-week regulatory filings.'
    },
    {
      id: 'agent-swarm',
      num: '17',
      name: 'Agent Swarm (Magentic-One / Emergent Collaboration)',
      flowType: 'Decentralized Emergence',
      summary: 'Multiple specialized autonomous agents (Web Surfer, File Surfer, Coder, Terminal) collaborating dynamically on open-ended problems.',
      execution: 'Complex open-ended task -> Agents observe shared whiteboard state -> Bid on sub-tasks -> Cooperate dynamically to converge.',
      azureImplementation: 'Magentic-One or AutoGen runtime deployed on Azure Container Apps with Cosmos DB shared state.',
      tradeoffs: 'Solves complex unbounded tasks; highest non-determinism, unpredictable execution cost, and potential loop divergence.',
      bestFit: 'Autonomous deep market research, software repository migration, automated penetration testing.'
    },
    {
      id: 'hybrid-workflow-agent',
      num: '18',
      name: 'Hybrid Deterministic Workflow + AI Agent',
      flowType: 'Bounded Autonomy',
      summary: 'Strict business workflow handles routing, auditing, and database writes; AI agent is invoked only inside bounded decision sandboxes.',
      execution: 'Deterministic step 1 -> Step 2 -> AI Agent sandbox (extract & classify) -> Verified output -> Deterministic step 3 (database write).',
      azureImplementation: 'Azure Logic Apps / Functions managing business state, calling Azure OpenAI strictly for bounded reasoning tasks.',
      tradeoffs: 'Gold standard for enterprise compliance; 100% auditable workflow path with generative intelligence where beneficial.',
      bestFit: 'Mortgage loan underwriting, insurance claims adjudication, supply chain PO approval.'
    }
  ],

  frameworks: [
    {
      name: 'Microsoft Agent Framework',
      type: 'Code-First SDK (Python / C#)',
      maturity: 'Primary Microsoft Strategic Direction',
      strengths: 'Lightweight, type-safe, native MCP protocol support, seamless Azure Foundry and Cosmos DB integration, high performance.',
      weaknesses: 'Evolving rapidly; newer community ecosystem than legacy Python frameworks.',
      bestUse: 'Production enterprise agents, custom microservices, high-throughput backend services.'
    },
    {
      name: 'Microsoft Foundry Agent Service',
      type: 'Fully Managed PaaS Agent Runtime',
      maturity: 'Enterprise Managed Platform',
      strengths: 'Serverless execution, hosted tools (code interpreter, file search), built-in identity delegation, enterprise compliance.',
      weaknesses: 'Less low-level execution loop control than code-first frameworks; vendor runtime boundary.',
      bestUse: 'Rapid enterprise deployment, managed security boundary, out-of-the-box knowledge grounding.'
    },
    {
      name: 'Semantic Kernel',
      type: 'Enterprise Framework (C#, Python, Java)',
      maturity: 'Mature Enterprise Ecosystem',
      strengths: 'Deep Microsoft enterprise adoption, excellent C#/.NET support, rich connector ecosystem (M365, Teams, Azure).',
      weaknesses: 'Heavier abstractions; ongoing alignment with the newer unified Agent Framework.',
      bestUse: 'Existing enterprise .NET codebases, Microsoft 365 Copilot extensions, hybrid cloud backends.'
    },
    {
      name: 'AutoGen / Magentic-One',
      type: 'Multi-Agent Research Framework',
      maturity: 'Research & Advanced Prototyping',
      strengths: 'Exceptional group-chat patterns, agent conversation dynamics, emergent problem solving.',
      weaknesses: 'Harder to constrain in production; potential for non-deterministic loop runaway.',
      bestUse: 'Advanced research, synthetic data generation, open-ended problem exploration.'
    },
    {
      name: 'LangGraph',
      type: 'State Graph Framework (Python / TS)',
      maturity: 'Cross-Platform Graph Standard',
      strengths: 'Explicit cyclical graph representation, fine-grained checkpointing, human-in-the-loop pause/resume.',
      weaknesses: 'Third-party ecosystem; requires custom integration with Azure-specific identity and security tools.',
      bestUse: 'Cross-cloud deployments, teams standardizing on LangChain ecosystem.'
    },
    {
      name: 'Model Context Protocol (MCP)',
      type: 'Open Tool & Context Protocol',
      maturity: 'Industry Open Standard',
      strengths: 'Standardized client-server protocol for exposing tools, prompts, and resources across any agent framework.',
      weaknesses: 'Requires securing tool server endpoints and managing network authorization boundaries.',
      bestUse: 'Sharing reusable toolboxes across different agent teams, secure enterprise tool integration.'
    }
  ],

  orchestrationComparison: [
    { pattern: 'Sequential Pipeline', determinism: 'High', latency: 'Linear', cost: 'Low-Medium', debuggability: 'Very Easy', bestFit: 'Fixed multi-step processing' },
    { pattern: 'Parallel / Fan-out', determinism: 'High', latency: 'Lowest', cost: 'Medium-High', debuggability: 'Easy', bestFit: 'Independent multi-source research' },
    { pattern: 'Supervisor-Worker', determinism: 'Medium-High', latency: 'Moderate', cost: 'Medium', debuggability: 'Moderate', bestFit: 'Task delegation to domain specialists' },
    { pattern: 'Peer Handoff (Swarm)', determinism: 'Moderate', latency: 'Variable', cost: 'Medium', debuggability: 'Challenging', bestFit: 'Multi-turn consultative conversations' },
    { pattern: 'Generator-Critic', determinism: 'High', latency: 'High', cost: 'High', debuggability: 'Easy', bestFit: 'High-stakes quality & code verification' },
    { pattern: 'Autonomous Swarm', determinism: 'Low', latency: 'High', cost: 'Very High', debuggability: 'Complex', bestFit: 'Unbounded discovery & exploratory research' },
    { pattern: 'Hybrid Workflow + Agent', determinism: 'Maximum', latency: 'Predictable', cost: 'Optimized', debuggability: 'Very Easy', bestFit: 'Regulated enterprise business workflows' }
  ]
};

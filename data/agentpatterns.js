/* Domain 5: Agentic AI & Multi-Agent Engineering
   Agent fundamentals, 18 architectural patterns, framework decision matrix,
   and workflow orchestration primitives on Microsoft Azure. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.agentPatterns = {
  title: 'Agentic AI Architecture Patterns & Orchestration',
  lede: 'Production design patterns, framework trade-offs, and state orchestration for autonomous single- and multi-agent systems on Microsoft Azure.',

  fundamentals: {
    title: 'Agentic AI Core Fundamentals & Distinctions',
    concepts: [
      {
        concept: 'Agent vs Chatbot vs Workflow vs Raw LLM',
        desc: '• Raw LLM: Pure stateless next-token predictor with no memory, tools, or agency.\n• Chatbot: Stateful conversational interface with prompt history, but no dynamic tool execution.\n• Workflow: Deterministic DAG with fixed branching logic and pre-programmed API steps.\n• Autonomous Agent: Goal-directed system that dynamically reasons, plans multi-step actions, calls tools, observes environment feedback, reflects, and replans to accomplish an objective.'
      },
      {
        concept: 'Autonomy, Goals & Planning',
        desc: 'Agents operate with bounded autonomy defined by system instructions. Planning strategies include ReAct (Reason + Act interleaving), Plan-and-Solve (generating an explicit step-by-step agenda upfront), and Tree of Thoughts (exploring multiple reasoning trajectories before selecting the optimal branch).'
      },
      {
        concept: 'State, Context & Memory Tiers',
        desc: '• Working Memory: In-memory runtime state tracking active tool arguments and intermediate observations.\n• Short-Term Memory: Sliding window buffer of recent dialogue turns with automated summarization.\n• Long-Term Memory: Vectorized semantic recall of past sessions and user preferences persisted in Azure Cosmos DB or Azure AI Search.'
      },
      {
        concept: 'Tools, Tool Calling & Observation',
        desc: 'Tools expose enterprise capabilities as JSON Schema contracts. The LLM emits structured tool invocation parameters; the runtime executes the tool in a secure sandbox and feeds the observation string back into the prompt for subsequent reasoning.'
      },
      {
        concept: 'Reflection, Replanning & Self-Correction',
        desc: 'Upon encountering a tool execution error (e.g. database schema mismatch or API 404), an agent reflects on the error observation, adjusts its parameters, reformulates its query, and replans the next action rather than failing immediately.'
      },
      {
        concept: 'Delegation & Swarm Coordination',
        desc: 'In multi-agent systems, tasks exceed individual model context limits. A supervisor agent decomposes high-level goals and delegates sub-tasks to specialized domain worker agents (e.g. SQL researcher, code executor, compliance auditor).'
      },
      {
        concept: 'Human Approval (Human-in-the-Loop)',
        desc: 'Enforces authorization gates before high-stakes irreversible actions (e.g. writing to production databases, issuing customer refunds, sending emails). The agent pauses execution, emits a human approval request, and resumes only after explicit sign-off.'
      },
      {
        concept: 'Termination Conditions & Loop Safeguards',
        desc: 'To prevent infinite loops and runaway token costs, agents enforce deterministic termination criteria: goal attainment, explicit maximum step count (e.g. max 10 iterations), budget limit ($1.00 per task), or timeout threshold.'
      }
    ]
  },

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
      flowType: 'Hierarchical Delegation',
      summary: 'A central supervisor agent decomposes complex goals into sub-tasks and delegates them to specialized domain worker agents.',
      execution: 'Goal -> Supervisor creates plan -> Dispatches Task A to Worker 1 & Task B to Worker 2 -> Synthesizes aggregated findings -> Output.',
      azureImplementation: 'Microsoft Agent Framework orchestrator running on Azure Container Apps with Cosmos DB state store.',
      tradeoffs: 'Excellent task separation and clean prompt scopes; supervisor can become a single point of failure or latency bottleneck.',
      bestFit: 'Comprehensive market research, multi-domain incident troubleshooting, enterprise intelligence reporting.'
    },
    {
      id: 'planner-executor',
      num: '04',
      name: 'Planner and Executor',
      flowType: 'Two-Stage Decoupling',
      summary: 'Separates planning from execution: a high-reasoning planner generates a verified step-by-step agenda executed by a fast execution model.',
      execution: 'User Request -> Planner (o3-mini / o1) creates execution plan -> Executor (GPT-4o-mini) executes each step sequentially -> Verification.',
      azureImplementation: 'Multi-model deployment in Microsoft Foundry: o1 for upfront planning + GPT-4o-mini for cost-effective execution.',
      tradeoffs: 'Much lower execution cost and deterministic audit trail; less dynamic adaptability if initial plan was flawed.',
      bestFit: 'Automated data migration pipelines, multi-step financial compliance audits, code refactoring.'
    },
    {
      id: 'sequential-pipeline',
      num: '05',
      name: 'Sequential Agent Pipeline (Chaining)',
      flowType: 'Linear Stage Flow',
      summary: 'A linear series of specialized agents where each agent transforms the previous agent\'s output.',
      execution: 'Raw input -> Extraction Agent -> Normalization Agent -> Enrichment Agent -> Summarization Agent -> Clean Output.',
      azureImplementation: 'Azure Logic Apps or Azure Durable Functions orchestrating sequential calls to Azure OpenAI model deployments.',
      tradeoffs: '100% predictable execution flow and easy unit testing; rigid and cannot handle branching or self-correction.',
      bestFit: 'Document processing workflows, structured contract ingestion, automated email triage.'
    },
    {
      id: 'parallel-agents',
      num: '06',
      name: 'Parallel Agents (Fan-Out / Fan-In)',
      flowType: 'Concurrent Fan-Out',
      summary: 'Spawns multiple agents concurrently to perform independent research or analysis across different data sources, then aggregates.',
      execution: 'Query -> Fan-out to Agent A (Search), Agent B (SQL Database), Agent C (CRM API) concurrently -> Fan-in aggregator -> Consolidated report.',
      azureImplementation: 'Python `asyncio` in Azure Container Apps invoking multiple parallel Azure OpenAI completions.',
      tradeoffs: 'Dramatically cuts total clock-time latency; increases peak token throughput (TPM) consumption.',
      bestFit: 'Competitive intelligence analysis, multi-database customer 360 lookup, multi-document cross-comparison.'
    },
    {
      id: 'router-agent',
      num: '07',
      name: 'Router / Triage Agent',
      flowType: 'Dynamic Dispatch',
      summary: 'A fast classification agent inspects incoming user queries and routes them to the single best specialist agent or deterministic workflow.',
      execution: 'User query -> Router (Phi-4 / GPT-4o-mini) classifies intent -> Dispatches directly to Billing Agent, Tech Support Agent, or Sales Agent.',
      azureImplementation: 'Semantic Kernel / Agent Framework router endpoint deployed in front of specialized agent workers.',
      tradeoffs: 'Keeps specialist agent prompts small and highly focused; router misclassification sends users down the wrong path.',
      bestFit: 'Enterprise service desks, multi-department customer contact centers, unified enterprise portals.'
    },
    {
      id: 'hierarchical-agents',
      num: '08',
      name: 'Hierarchical Multi-Tier Agents',
      flowType: 'Multi-Level Tree',
      summary: 'Multi-tiered management structure where executive agents delegate to departmental managers, who delegate to individual worker agents.',
      execution: 'Executive Agent -> Technical Lead Agent -> Backend Worker + Frontend Worker -> Aggregated review up the tree -> Final Deliverable.',
      azureImplementation: 'Microsoft Agent Framework hierarchical agent group running on Azure Container Apps with Cosmos DB thread state.',
      tradeoffs: 'Enables massive-scale automated initiatives; high orchestration overhead and compounded token latency.',
      bestFit: 'Software engineering automation, corporate strategic planning simulations, complex supply chain rebalancing.'
    },
    {
      id: 'agent-handoff',
      num: '09',
      name: 'Agent Handoff (Swarm / Peer Routing)',
      flowType: 'Peer-to-Peer Transfer',
      summary: 'Agents hand off conversation control directly to peer agents based on conversational context without returning to a central supervisor.',
      execution: 'User chatting with Triage Agent -> Agent detects refund intent -> Transfers thread state to Refund Agent -> Refund Agent finishes.',
      azureImplementation: 'Microsoft Foundry Agent Service thread handoff or OpenAI Swarm pattern with shared Cosmos DB thread ID.',
      tradeoffs: 'Natural conversational flow and low latency; risks circular handoff loops if peer routing criteria overlap.',
      bestFit: 'Consultative e-commerce sales, insurance policy selection with claims handoff.'
    },
    {
      id: 'debate-agents',
      num: '10',
      name: 'Debate / Multi-Perspective Agents',
      flowType: 'Adversarial Collaboration',
      summary: 'Two or more agents take opposing perspectives (e.g. Bull vs Bear) and debate a proposition, supervised by an impartial judge agent.',
      execution: 'Proposition -> Agent A argues Pro -> Agent B argues Con -> Multi-turn cross-examination -> Judge Agent synthesizes balanced verdict.',
      azureImplementation: 'Microsoft Agent Framework executing multi-turn debate rounds with system prompts enforcing divergent personas.',
      tradeoffs: 'Substantially reduces individual model biases and uncovers blind spots; 3x higher token consumption and latency.',
      bestFit: 'Investment committee decision support, regulatory legal risk assessment, architectural design reviews.'
    },
    {
      id: 'generator-critic',
      num: '11',
      name: 'Generator-Critic / Evaluator Agent',
      flowType: 'Iterative Refinement',
      summary: 'A generator agent creates an artifact (code, report, SQL) and an independent critic agent evaluates it against a strict rubric before acceptance.',
      execution: 'Task -> Generator produces Draft 1 -> Critic reviews against rubric -> Emits specific feedback -> Generator produces Draft 2 -> Critic approves.',
      azureImplementation: 'Two distinct Foundry model deployments: GPT-4o generator + o3-mini critic with temperature 0.0.',
      tradeoffs: 'Consistently higher code quality, fewer syntax bugs, and higher compliance; requires 2-3 iterations per output.',
      bestFit: 'Production code generation, regulatory filing drafting, automated SQL query authoring.'
    },
    {
      id: 'reflection-agent',
      num: '12',
      name: 'Self-Reflection / Self-Correction Agent',
      flowType: 'Internal Loop',
      summary: 'A single agent that critiques its own intermediate outputs, checks for reasoning errors, and revises its output prior to responding.',
      execution: 'Prompt -> Initial generation -> Self-critique prompt ("Check your work for hallucinations and logic errors") -> Revised final response.',
      azureImplementation: 'Microsoft Agent Framework with reflexive loop hooks and Azure AI Content Safety validation.',
      tradeoffs: 'Improves accuracy without needing multiple separate agent deployments; doubles the generation time for the turn.',
      bestFit: 'Complex mathematical problem solving, automated medical summarization, policy interpretation.'
    },
    {
      id: 'hitl-approval',
      num: '13',
      name: 'Human-in-the-Loop (HITL) Approval Workflow',
      flowType: 'Gated Execution',
      summary: 'Agent executes autonomous reasoning until it reaches an action with material business impact, pausing for explicit human sign-off.',
      execution: 'Agent plans action ($5,000 refund) -> Pauses execution -> Emits approval notification (Teams / Email) -> Human clicks Approve -> Agent executes.',
      azureImplementation: 'Azure Durable Functions / Logic Apps with external event suspension, or Foundry Agent Service human approval webhook.',
      tradeoffs: 'Essential for enterprise governance, liability protection, and regulatory compliance; introduces human latency bottleneck.',
      bestFit: 'Financial transactions, database schema updates, external email sending, HR candidate rejections.'
    },
    {
      id: 'stateful-conversational',
      num: '14',
      name: 'Stateful Conversational Agent with Memory',
      flowType: 'Session Memory',
      summary: 'Agent maintains multi-turn conversational context, user preferences, and episodic history across days, weeks, and multiple sessions.',
      execution: 'User query -> Retrieve user preferences & past session summaries (Cosmos DB) -> Augment prompt -> Agent conversation -> Save updated memory.',
      azureImplementation: 'Azure Cosmos DB for session thread persistence + Azure Managed Redis for low-latency working context.',
      tradeoffs: 'Delivers personalized, consultative customer experiences; requires strict memory privacy governance and GDPR right-to-be-forgotten deletion.',
      bestFit: 'Executive coaching assistants, persistent wealth management copilots, long-term technical learning tutors.'
    },
    {
      id: 'event-driven-agent',
      num: '15',
      name: 'Event-Driven Background Agents',
      flowType: 'Reactive Asynchronous',
      summary: 'Agents that sleep until triggered by cloud events (new document in Blob, database change, IoT alert), execute autonomously, and terminate.',
      execution: 'Blob created event (Azure Event Grid) -> Wakes Container App worker -> Agent extracts data & calls business API -> Worker sleeps.',
      azureImplementation: 'Azure Event Grid triggering Azure Container Apps via KEDA scale-to-zero queue scaling.',
      tradeoffs: 'Zero idle infrastructure cost; high throughput batch processing; requires robust retry handling and idempotency.',
      bestFit: 'Automated invoice processing upon upload, security log anomaly investigation, real-time customer churn alerts.'
    },
    {
      id: 'durable-long-running',
      num: '16',
      name: 'Durable Long-Running Agents',
      flowType: 'Durable Orchestration',
      summary: 'Agents designed to run for hours, days, or weeks across intermittent infrastructure failures, retaining state through durable checkpointing.',
      execution: 'Agent starts 3-day data verification -> Checkpoints state to storage at each step -> Recovers automatically after VM reboot -> Completes task.',
      azureImplementation: 'Azure Durable Entities / Azure Durable Functions or Dapr Virtual Actors hosted in Azure Container Apps.',
      tradeoffs: 'Immune to transient cloud restarts and network timeouts; requires deterministic replay design in code.',
      bestFit: 'Multi-week software dependency upgrades, deep data quality remediation campaigns, automated patent discovery.'
    },
    {
      id: 'agent-swarm',
      num: '17',
      name: 'Agent Swarm (Magentic-One / Emergent Collaboration)',
      flowType: 'Decentralized Swarm',
      summary: 'A collective of autonomous agents sharing a shared working board, dynamically bidding on tasks and collaborating to solve open-ended goals.',
      execution: 'User objective posted to shared board -> Web surfer agent gathers data -> Coder agent writes script -> File surfer agent reads results -> Synthesis.',
      azureImplementation: 'Microsoft Magentic-One / AutoGen multi-agent framework deployed on Azure Container Apps with Redis message bus.',
      tradeoffs: 'Can solve open-ended, ambiguous research problems that defeat fixed pipelines; non-deterministic and prone to runaway token consumption.',
      bestFit: 'Autonomous security penetration testing, deep scientific literature discovery, complex bug reproduction.'
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
      name: 'LangChain',
      type: 'Component & Connector Ecosystem',
      maturity: 'Broad Community Library',
      strengths: 'Vast collection of document loaders, prompt templates, vector store connectors, and community integrations.',
      weaknesses: 'Frequently changes API surface; heavy abstractions can obscure low-level latency bottlenecks.',
      bestUse: 'Rapid prototyping, data ingestion connectors, general-purpose LLM application components.'
    },
    {
      name: 'Model Context Protocol (MCP)',
      type: 'Open Tool & Context Protocol',
      maturity: 'Industry Open Standard',
      strengths: 'Standardized client-server protocol for exposing tools, prompts, and resources across any agent framework.',
      weaknesses: 'Requires securing tool server endpoints and managing network authorization boundaries.',
      bestUse: 'Sharing reusable toolboxes across different agent teams, secure enterprise tool integration.'
    },
    {
      name: 'REST & OpenAPI 3.0',
      type: 'Standard Enterprise Web APIs',
      maturity: 'Universal Enterprise Standard',
      strengths: 'Universal compatibility; leverages existing enterprise API Management, authentication, and corporate firewalls.',
      weaknesses: 'Requires strict JSON schema documentation and parameter validation to prevent agent tool invocation errors.',
      bestUse: 'Connecting agents directly to existing SAP, Salesforce, ServiceNow, and internal microservice endpoints.'
    }
  ],

  orchestrationPrimitives: {
    title: 'Agent Workflow & Orchestration Primitives',
    primitives: [
      { name: 'Workflow Graph & Nodes', desc: 'Representing agents, tools, and decision gates as discrete nodes in a directed cyclical or acyclic graph.' },
      { name: 'Edges & Conditional Routing', desc: 'Evaluating LLM outputs or deterministic rules to route execution along specific graph branches.' },
      { name: 'Parallel Execution (Fan-Out / Fan-In)', desc: 'Concurrently running independent worker tasks and synchronizing their outputs at a barrier node.' },
      { name: 'State Checkpointing & Durability', desc: 'Saving execution snapshots to Azure Cosmos DB or Blob storage at each step for crash recovery and resume.' },
      { name: 'Retries, Timeouts & Backoff', desc: 'Automated exponential retry with jitter for transient tool failures and strictly bounded timeout budgets.' },
      { name: 'Loop Limits & Termination Conditions', desc: 'Enforcing maximum turn counters (e.g. max 10 steps) to prevent costly infinite reasoning loops.' },
      { name: 'Human Approval Pauses', desc: 'Suspending workflow execution until an authorized human operator grants explicit cryptographic approval.' },
      { name: 'Agent Handoff & Protocol Passing', desc: 'Transferring conversation control and memory context seamlessly between peer agents.' }
    ]
  },

  orchestrationComparison: [
    { pattern: 'Sequential Pipeline', determinism: 'High', latency: 'Linear', cost: 'Low-Medium', debuggability: 'Very Easy', bestFit: 'Fixed multi-step processing' },
    { pattern: 'Parallel / Fan-out', determinism: 'High', latency: 'Lowest', cost: 'Medium-High', debuggability: 'Easy', bestFit: 'Independent multi-source research' },
    { pattern: 'Supervisor-Worker', determinism: 'Medium-High', latency: 'Moderate', cost: 'Medium', debuggability: 'Moderate', bestFit: 'Task delegation to domain specialists' },
    { pattern: 'Peer Handoff (Swarm)', determinism: 'Moderate', latency: 'Variable', cost: 'Medium', debuggability: 'Challenging', bestFit: 'Multi-turn consultative conversations' },
    { pattern: 'Generator-Critic', determinism: 'High', latency: 'High', cost: 'High', debuggability: 'Easy', bestFit: 'High-stakes quality & code verification' },
    { pattern: 'Autonomous Swarm', determinism: 'Low', latency: 'High', cost: 'Very High', debuggability: 'Complex', bestFit: 'Unbounded discovery & exploratory research' },
    { pattern: 'Hybrid Workflow + Agent', determinism: 'Maximum', latency: 'Predictable', cost: 'Optimized', debuggability: 'Very Easy', bestFit: 'Regulated enterprise business workflows' },
    { pattern: 'Event-Driven Reactive', determinism: 'High', latency: 'Asynchronous', cost: 'Scale-to-Zero', debuggability: 'Easy', bestFit: 'Document ingestion & webhook triage' }
  ]
};

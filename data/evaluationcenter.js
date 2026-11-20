/* Domain 10: AI Evaluation, Testing & Quality Center
   7-Level AI Testing Pyramid, 14 Evaluation Categories, 14 Agent-Specific Metrics,
   Framework Comparison Matrix, and Interactive Release Quality Gate Calculator. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.evaluationCenter = {
  title: 'AI Evaluation & Quality Center',
  lede: 'Establish rigorous, scientific quality engineering for generative AI, RAG, and agentic workflows before and after production release.',

  testingPyramid: [
    {
      level: 'Level 01',
      name: 'Deterministic Unit Tests',
      frequency: 'Every Git Commit',
      scope: 'Application glue, schema parsers, prompt template formatting, tool parameter validation functions.',
      tooling: 'pytest, Jest, Python unittest',
      passCriteria: '100% pass on code coverage and input schema validation.'
    },
    {
      level: 'Level 02',
      name: 'Component Integration Tests',
      frequency: 'Every Pull Request',
      scope: 'Vector store connectivity, search indexer pipeline execution, tool API authentication, Entra ID token acquisition.',
      tooling: 'Azure SDK integration tests, mock services',
      passCriteria: 'Zero connection timeouts, 100% success on tool contracts.'
    },
    {
      level: 'Level 03',
      name: 'LLM & Prompt Quality Evals',
      frequency: 'Every Prompt or Model Version Change',
      scope: 'Instruction adherence, output format compliance (JSON/XML), tone, brevity, domain terminology consistency.',
      tooling: 'Azure AI Evaluation SDK, PromptFlow',
      passCriteria: 'Format compliance = 100%, instruction adherence > 95% on golden benchmark.'
    },
    {
      level: 'Level 04',
      name: 'RAG Retrieval & Groundedness Evals',
      frequency: 'Nightly & Pre-Release',
      scope: 'Context recall, context precision, answer groundedness, faithfulness, citation correctness, abstention on unanswerable queries.',
      tooling: 'Azure AI Evaluation SDK, Ragas, MLflow',
      passCriteria: 'Groundedness > 95%, Relevance > 90%, Citation Correctness > 98%.'
    },
    {
      level: 'Level 05',
      name: 'Agent Workflow & Orchestration Evals',
      frequency: 'Pre-Release & Staging Verification',
      scope: 'Goal completion rate, tool selection accuracy, parameter correctness, subagent handoff accuracy, loop convergence, timeout resilience.',
      tooling: 'Microsoft Agent Framework test harness, LangSmith',
      passCriteria: 'Task completion rate > 92%, tool accuracy > 96%, average loop count < 4.'
    },
    {
      level: 'Level 06',
      name: 'Security Red Teaming & Adversarial Tests',
      frequency: 'Sprint Gate & Quarterly Audit',
      scope: 'Direct jailbreaks, indirect injection via documents, role bypasses, PII extraction, excessive agency attempts.',
      tooling: 'PyRIT (Python Risk Identification Toolkit), Azure AI Foundry Red Team',
      passCriteria: 'Zero critical bypasses, 100% block rate on harmful content categories.'
    },
    {
      level: 'Level 07',
      name: 'Continuous Production Monitoring',
      frequency: 'Real-Time Online Telemetry',
      scope: 'Online sampling of live user interactions: user thumbs up/down, P95 TTFT latency, HTTP 429 rate, drift detection over time.',
      tooling: 'Azure Monitor, Application Insights, Log Analytics',
      passCriteria: 'P95 latency < 2,000ms, HTTP 429 rate < 0.1%, negative feedback < 3%.'
    }
  ],

  evaluationCategories: [
    { category: 'Model Quality', focus: 'Raw foundation model reasoning, coding, and mathematical benchmark scores.' },
    { category: 'Prompt Adherence', focus: 'Compliance with system instructions, formatting, constraints, and negative prompt rules.' },
    { category: 'RAG Groundedness', focus: 'Degree to which generated claims are mathematically supported by retrieved context.' },
    { category: 'Retrieval Recall', focus: 'Whether the search engine successfully surfaced the required ground-truth evidence in Top-K.' },
    { category: 'Agent Tool Selection', focus: 'Whether the agent picked the optimal tool function from the registered catalog.' },
    { category: 'Tool Parameter Accuracy', focus: 'Whether arguments supplied to tools conform exactly to expected API types.' },
    { category: 'Agent Convergence', focus: 'Whether multi-turn agent loops terminate successfully within the turn budget.' },
    { category: 'Multi-Agent Handoff', focus: 'Accuracy of context passing and responsibility transfer between specialized agents.' },
    { category: 'Safety & Harms', focus: 'Content Safety evaluation: Hate, Sexual, Violence, Self-Harm, and Protected Material.' },
    { category: 'Security & Jailbreaks', focus: 'Resistance to adversarial prompt injection and indirect system prompt extraction.' },
    { category: 'System Reliability', focus: 'Resilience against API rate limits, model timeouts, and transient connection drops.' },
    { category: 'User Experience (UX)', focus: 'Time-to-First-Token (TTFT), streaming smoothness, and clear error recovery.' },
    { category: 'FinOps Unit Cost', focus: 'Token consumption per task, cache utilization, and cost per successful workflow.' },
    { category: 'Business Outcome', focus: 'Task completion rate, reduction in human handling time, customer satisfaction (CSAT).' }
  ],

  agentMetrics: [
    { metric: 'Task Completion Rate', desc: 'Percentage of agent sessions that achieve the defined business objective without human abort.', benchmark: '> 90%' },
    { metric: 'Goal Success Rate', desc: 'Ratio of multi-step goals fully satisfied according to automated or human ground-truth criteria.', benchmark: '> 92%' },
    { metric: 'Tool Selection Accuracy', desc: 'Frequency with which the agent selects the correct tool for a given intermediate sub-task.', benchmark: '> 95%' },
    { metric: 'Tool Call Success Rate', desc: 'Percentage of dispatched tool calls that return successful HTTP 200 or valid domain results.', benchmark: '> 96%' },
    { metric: 'Tool Parameter Correctness', desc: 'Ratio of tool invocations where all arguments pass strict JSON schema and business type validation.', benchmark: '> 98%' },
    { metric: 'Agent Handoff Accuracy', desc: 'In multi-agent systems, rate at which tasks are delegated to the correct specialist worker agent.', benchmark: '> 92%' },
    { metric: 'Loop Step Count', desc: 'Distribution of reasoning turns required per task; flags anomalous high-iteration patterns.', benchmark: '2.5 – 3.8 turns' },
    { metric: 'Agent Convergence Rate', desc: 'Percentage of workflows that finish within maximum allowed turns (e.g. 5 turns) without infinite loop cutoff.', benchmark: '> 98%' },
    { metric: 'Planning Accuracy', desc: 'Degree to which generated multi-step action agendas correspond to optimal execution paths.', benchmark: '> 88%' },
    { metric: 'Delegation Accuracy', desc: 'Whether subtasks assigned by the supervisor agent are scoped correctly without redundancy.', benchmark: '> 90%' },
    { metric: 'Workflow Completion Time', desc: 'End-to-end clock time from initial user prompt to final verified deliverable.', benchmark: '< 15 seconds' },
    { metric: 'Cost per Completed Task', desc: 'Total inference, tool execution, and embedding cost accumulated per successful workflow completion.', benchmark: '< $0.05 / task' },
    { metric: 'Failure Recovery Rate', desc: 'Ability of the agent to inspect a tool error message, adjust parameters, and succeed on retry.', benchmark: '> 80%' },
    { metric: 'Human Intervention Rate', desc: 'Percentage of tasks that exceed uncertainty thresholds or require human approval sign-off.', benchmark: '< 10%' }
  ],

  frameworks: [
    { name: 'Azure AI Evaluation SDK', type: 'Native Azure SDK', strengths: 'Built-in evaluators for Groundedness, Relevance, Coherence, Fluency, and Prompt Shields; direct integration with Azure AI Foundry.', bestFit: 'Production Azure deployments and CI/CD quality gates.' },
    { name: 'Microsoft Foundry Evaluations', type: 'Managed Cloud Service', strengths: 'UI-driven batch evaluation runs, comparative model sweep visualizations, automated golden dataset management.', bestFit: 'Engineering Manager & Product Manager review dashboards.' },
    { name: 'PromptFlow Evaluation & Lifecycle', type: 'Managed / Code SDK', strengths: 'Visual DAG evaluation graphs, custom Python evaluators, seamless transition from local dev to cloud batch runs.', bestFit: 'Teams standardizing on PromptFlow pipelines.' },
    { name: 'MLflow / Azure ML', type: 'Open-Source MLOps', strengths: 'Industry-standard experiment tracking, parameter logging, artifact lineage, and automated model registry promotion.', bestFit: 'Unified classic ML and LLM release pipelines.' },
    { name: 'Ragas', type: 'Open-Source RAG Framework', strengths: 'Rich synthetic test dataset generation and specialized mathematical RAG metrics (faithfulness, context recall).', bestFit: 'Deep offline RAG pipeline experimentation and optimization.' },
    { name: 'DeepEval', type: 'Open-Source Testing', strengths: 'Unit-test-like syntax (`assert_test`) for LLMs that integrates cleanly into existing pytest suites.', bestFit: 'Developer-driven local test suites.' },
    { name: 'LangSmith', type: 'Tracing & Evaluation', strengths: 'Rich visualization of multi-turn agent runs, prompt playground, and run comparison.', bestFit: 'Teams deploying LangGraph / LangChain on Azure.' },
    { name: 'OpenTelemetry GenAI Semantic Conventions', type: 'Open Telemetry Standard', strengths: 'Vendor-neutral instrumentation of spans, token counts, and LLM parameters exported to Application Insights.', bestFit: 'Standardized enterprise observability across all clouds.' }
  ],

  qualityGates: [
    {
      tier: 'Tier 1: Internal Low-Risk',
      description: 'Employee productivity tools, internal documentation search, non-customer-facing assistants.',
      requirements: {
        groundedness: 90,
        relevance: 85,
        p95LatencyMs: 3000,
        toolAccuracy: 90,
        promptInjectionBlock: 95
      }
    },
    {
      tier: 'Tier 2: Customer-Facing Enterprise',
      description: 'Customer service copilots, external product search, automated customer email drafting.',
      requirements: {
        groundedness: 95,
        relevance: 90,
        p95LatencyMs: 2000,
        toolAccuracy: 96,
        promptInjectionBlock: 99
      }
    },
    {
      tier: 'Tier 3: Mission-Critical & Regulated',
      description: 'Financial transactions, medical diagnosis support, legal contract generation, autonomous write agents.',
      requirements: {
        groundedness: 98,
        relevance: 95,
        p95LatencyMs: 1500,
        toolAccuracy: 99,
        promptInjectionBlock: 100
      }
    }
  ]
};

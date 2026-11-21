/* Orientation content: the "Start here" page and the glossary.
   Concepts only. No prices, limits, regions, model names or lifecycle states, so nothing here needs a
   verification record. Every href must be a real route; scripts/check.mjs enforces this. */
window.ATLAS = window.ATLAS || {};

ATLAS.guide = {
  intro: 'This atlas helps you decide what to build on Azure, how to shape it, and how to run it safely. It is organised in five sections that follow the life of an AI system. Pick the path for your role, or follow the six stages below from idea to production.',

  paths: [
    {
      role: 'Engineering manager',
      goal: 'Decide whether to build, size the effort and cost, and set the launch bar.',
      steps: [
        ['#/em-workspace', 'Run the project intake', 'Score problem clarity, data readiness and value before anyone writes code.'],
        ['#/d/em', 'Read the manager decision tab', 'The default calls, the evidence to ask for and the gates you own.'],
        ['#/finops', 'Model cost and return', 'Monthly cost from your own volumes and prices, then a year-one ROI.'],
        ['#/evaluation', 'Agree the quality gate', 'Pick a risk tier and the scores a release must reach.'],
        ['#/d/checklists', 'Check production readiness', 'Walk the readiness list with the team before launch.'],
        ['#/toolkit', 'Set up governance', 'RACI, RAID log and the status report template.']
      ]
    },
    {
      role: 'Architect',
      goal: 'Choose the shape of the system and defend each decision in review.',
      steps: [
        ['#/advisor', 'Describe the workload', 'Get a recommended shape, service stack, risks and a draft ADR.'],
        ['#/a', 'Compare reference architectures', 'Step through the flow of the closest blueprint.'],
        ['#/d/pe', 'Read the principal engineer tab', 'Default designs, trade-offs and the tests to demand.'],
        ['#/services-matrix', 'Compare services side by side', 'When to use each service, and when not to.'],
        ['#/foundation', 'Plan network and identity', 'Private endpoints, managed identity and the platform choices.'],
        ['#/security-center', 'Threat-model the design', 'Map each AI threat to a control before review.']
      ]
    },
    {
      role: 'Engineer',
      goal: 'Build the retrieval, agent and evaluation pieces and keep them healthy.',
      steps: [
        ['#/rag-lab', 'Design the retrieval pipeline', 'Chunking, hybrid search, reranking and the quality calculator.'],
        ['#/agents', 'Pick an agent pattern', 'Start with the simplest pattern that does the job.'],
        ['#/p/rag-engineering', 'Follow the RAG playbook', 'The build steps in order, with the usual mistakes.'],
        ['#/evaluation', 'Write the evaluation suite', 'Golden datasets, metrics and the testing pyramid.'],
        ['#/ops', 'Instrument for production', 'Dashboards, KQL queries and runbooks.'],
        ['#/troubleshooting', 'Know the failure modes', 'Symptoms, causes and fixes for common incidents.']
      ]
    }
  ],

  stages: [
    {
      name: 'Frame the problem',
      question: 'Is AI the right tool, and what does success look like?',
      do: ['Write the task, the user and the measurable outcome in one paragraph.', 'Check whether rules, search or a form would solve it without a model.', 'List the data you need and who owns it.'],
      links: [['#/em-workspace', 'Project intake'], ['#/d/build-buy-customize', 'Build, buy or customise'], ['#/d/workflow-vs-agent', 'Workflow or agent']]
    },
    {
      name: 'Choose the shape',
      question: 'Which architecture fits the task, the data and the risk?',
      do: ['Start from the closest reference architecture.', 'Choose the lowest autonomy that meets the need.', 'Record each one-way decision in an ADR.'],
      links: [['#/advisor', 'Architecture Advisor'], ['#/a', 'Reference architectures'], ['#/d/autonomy-level', 'How autonomous']]
    },
    {
      name: 'Pick the services',
      question: 'Which Azure services, and how do they connect?',
      do: ['Choose the model hosting, retrieval store and runtime.', 'Plan identity and network access from the start.', 'Check quotas and capacity for your region before you commit.'],
      links: [['#/services-matrix', 'Service comparison'], ['#/d/vector-store', 'Which vector store'], ['#/d/capacity-strategy', 'Capacity strategy']]
    },
    {
      name: 'Build and evaluate',
      question: 'Does it give correct, grounded and safe answers?',
      do: ['Build a golden dataset before you tune prompts.', 'Measure retrieval and generation separately.', 'Add evaluation to CI so a regression blocks the merge.'],
      links: [['#/rag-lab', 'RAG lab'], ['#/evaluation', 'Evaluation center'], ['#/d/evaluation', 'How will we know it works']]
    },
    {
      name: 'Secure and launch',
      question: 'Is it safe to put in front of users?',
      do: ['Threat-model prompt injection, data leakage and excessive agency.', 'Put a human approval step before any irreversible action.', 'Release behind a canary and a rollback plan.'],
      links: [['#/security-center', 'Security center'], ['#/d/human-in-loop', 'Human in the loop'], ['#/d/checklists', 'Readiness checklists']]
    },
    {
      name: 'Operate and improve',
      question: 'Is it healthy, affordable and getting better?',
      do: ['Track latency, errors, token use and quality on one dashboard.', 'Review cost per task every month.', 'Feed production failures back into the golden dataset.'],
      links: [['#/ops', 'Operations'], ['#/troubleshooting', 'Troubleshooting'], ['#/d/cost-levers', 'Cost levers']]
    }
  ],

  tasks: [
    ['Choose a vector store', '#/d/vector-store'],
    ['Decide between a workflow and an agent', '#/d/workflow-vs-agent'],
    ['Pick a chunking strategy', '#/d/chunking-strategy'],
    ['Estimate the monthly cost', '#/finops'],
    ['Secure a multi-tenant RAG app', '#/a/secure-multitenant-rag'],
    ['Set release quality gates', '#/evaluation'],
    ['Fix 429 throttling', '#/troubleshooting'],
    ['Plan team skills and staffing', '#/em-workspace'],
    ['Write an architecture decision record', '#/d/checklists'],
    ['Plan private networking', '#/foundation']
  ],

  trust: 'Azure AI changes often. Service pages show a box that says whether the listed facts were checked against Microsoft documentation, and when. "Verified" covers only the listed claims. "Review due" means the check is older than the review interval. "Unverified" means nobody has checked it yet. Prices are always illustrative. Check quotas, regions and model availability in Microsoft Learn before production.'
};

/* Glossary groups and terms. `see` holds [href, label] pairs. */
ATLAS.glossaryGroups = [
  { id: 'retrieval', name: 'Retrieval and RAG' },
  { id: 'models', name: 'Models and inference' },
  { id: 'agents', name: 'Agents' },
  { id: 'quality', name: 'Quality and safety' },
  { id: 'platform', name: 'Platform, identity and network' },
  { id: 'ops', name: 'Operations and cost' }
];

ATLAS.glossary = [
  { g: 'retrieval', term: 'Retrieval-augmented generation (RAG)', def: 'A pattern where the application first retrieves relevant passages from your own data and then asks the model to answer from those passages. It grounds answers in current, private data without retraining the model.', see: [['#/rag-lab', 'RAG lab'], ['#/a/traditional-rag', 'Traditional RAG']] },
  { g: 'retrieval', term: 'Agentic RAG', def: 'RAG where a model plans the retrieval: it splits the question, runs several searches, checks the results and searches again if needed. Better on complex questions, slower and more expensive than single-shot RAG.', see: [['#/a/agentic-rag', 'Agentic RAG'], ['#/d/classic-vs-agentic-rag', 'Classic vs agentic']] },
  { g: 'retrieval', term: 'GraphRAG', def: 'RAG over a knowledge graph of entities and relationships extracted from the documents. It helps with questions about connections and themes across many documents.', see: [['#/a/graph-rag', 'GraphRAG'], ['#/d/graphrag-vs-vector', 'GraphRAG vs vector']] },
  { g: 'retrieval', term: 'Chunking', def: 'Splitting documents into passages before indexing. Chunk size and boundaries decide what the retriever can find, so chunking is often the biggest single lever on RAG quality.', see: [['#/d/chunking-strategy', 'Chunking strategies']] },
  { g: 'retrieval', term: 'Embedding', def: 'A list of numbers that represents the meaning of a piece of text, an image or audio. Similar meanings give nearby vectors, which makes semantic search possible. Change the embedding model and you must re-embed the whole corpus.', see: [['#/rag-lab', 'RAG lab']] },
  { g: 'retrieval', term: 'Vector search', def: 'Finding the stored vectors nearest to the query vector. Good at meaning and paraphrase, weak at exact codes, names and rare terms.', see: [['#/d/vector-hybrid-search', 'Vector vs hybrid']] },
  { g: 'retrieval', term: 'HNSW', def: 'Hierarchical Navigable Small World: a graph index for approximate nearest-neighbour search. It trades a little recall for much faster queries than an exhaustive scan.', see: [['#/rag-lab', 'RAG lab']] },
  { g: 'retrieval', term: 'BM25', def: 'A classic keyword ranking function. It scores documents by term frequency and rarity, so it finds exact identifiers that vector search can miss.', see: [['#/d/vector-hybrid-search', 'Vector vs hybrid']] },
  { g: 'retrieval', term: 'Hybrid search', def: 'Running keyword and vector search together and merging the results. It is the usual default for enterprise RAG because it covers both exact terms and meaning.', see: [['#/d/vector-hybrid-search', 'Vector vs hybrid'], ['#/s/ai-search', 'Azure AI Search']] },
  { g: 'retrieval', term: 'Reciprocal Rank Fusion (RRF)', def: 'A simple way to merge ranked lists: each result scores by the reciprocal of its rank in each list, and the scores are added. It needs no score calibration between the lists.', see: [['#/rag-lab', 'RAG lab']] },
  { g: 'retrieval', term: 'Semantic reranking', def: 'A second pass where a cross-encoder model re-scores the top results against the query. It improves precision at the cost of extra latency.', see: [['#/d/reranking-tradeoff', 'Reranking trade-off']] },
  { g: 'retrieval', term: 'Security trimming', def: 'Filtering retrieval results so that each user only sees passages from documents they may read. Do it in the retrieval query, not in the prompt.', see: [['#/a/secure-multitenant-rag', 'Secure multi-tenant RAG'], ['#/d/index-tenancy', 'Index tenancy']] },

  { g: 'models', term: 'Token', def: 'The unit a language model reads and writes, usually part of a word. Cost, latency and context limits are all counted in tokens.', see: [['#/d/calculator', 'Cost per task']] },
  { g: 'models', term: 'Context window', def: 'The maximum number of tokens a model can take in one request, including the prompt, retrieved passages, history and the answer. Filling it raises cost and can lower answer quality.', see: [['#/troubleshooting', 'Troubleshooting']] },
  { g: 'models', term: 'Model tier', def: 'This atlas groups models by tier rather than by name: frontier (most capable), small (fast and cheap) and reasoning (slower, better at multi-step problems). Names change often; tiers are stable.', see: [['#/freshness', 'Model lifecycle']] },
  { g: 'models', term: 'Small language model (SLM)', def: 'A compact model that runs cheaply and quickly, sometimes on a device. Good for narrow, well-defined tasks and for routing.', see: [['#/advanced-ai', 'Advanced AI']] },
  { g: 'models', term: 'Fine-tuning', def: 'Further training a base model on your examples to change its style, format or behaviour on a task. It does not reliably add new facts; use retrieval for that.', see: [['#/d/improve-model', 'Make it better at our task']] },
  { g: 'models', term: 'LoRA', def: 'Low-Rank Adaptation: a fine-tuning method that trains small adapter matrices instead of all model weights, which cuts the cost of training and storage.', see: [['#/advanced-ai', 'Advanced AI']] },
  { g: 'models', term: 'Pay-as-you-go deployment', def: 'A model deployment billed per token with shared capacity. Simple to start, but throughput can be throttled at busy times.', see: [['#/d/capacity-strategy', 'Capacity strategy']] },
  { g: 'models', term: 'Provisioned throughput (PTU)', def: 'Reserved model capacity bought in units, billed for the time it is reserved. It gives predictable latency and throughput for steady, high-volume traffic.', see: [['#/d/model-deployment-capacity', 'Deployment and capacity'], ['#/finops', 'FinOps']] },
  { g: 'models', term: 'Model routing', def: 'Sending each request to the cheapest model that can handle it, for example a small model first and a frontier model only for hard cases.', see: [['#/advanced-ai', 'Advanced AI'], ['#/d/cost-levers', 'Cost levers']] },
  { g: 'models', term: 'Prompt caching', def: 'Reusing the processed form of a repeated prompt prefix, such as a long system prompt, so later requests cost less and return faster.', see: [['#/d/cost-levers', 'Cost levers']] },

  { g: 'agents', term: 'Agent', def: 'A model in a loop that decides which tool to call next, observes the result and continues until the goal is met. More flexible than a fixed workflow, and harder to test and bound.', see: [['#/agents', 'Agent patterns'], ['#/d/workflow-vs-agent', 'Workflow or agent']] },
  { g: 'agents', term: 'Tool calling', def: 'The model returns a structured request to run a function, such as a search or an API call. The application runs it and gives the result back to the model.', see: [['#/agents', 'Agent patterns']] },
  { g: 'agents', term: 'Model Context Protocol (MCP)', def: 'An open protocol that lets an agent discover and call tools and data sources through a standard server interface. Treat every MCP server as a trust boundary.', see: [['#/agents', 'Agent patterns'], ['#/security-center', 'Security center']] },
  { g: 'agents', term: 'ReAct', def: 'Reason and Act: a single-agent pattern that alternates a reasoning step with a tool call and an observation until it can answer.', see: [['#/agents', 'Agent patterns']] },
  { g: 'agents', term: 'Supervisor pattern', def: 'A multi-agent pattern where one coordinating agent splits the work and hands parts to specialist agents, then combines their results.', see: [['#/a/multiagent-orchestration', 'Multi-agent orchestration'], ['#/d/orchestration', 'Orchestration']] },
  { g: 'agents', term: 'Human in the loop (HITL)', def: 'A step where a person reviews or approves before the system acts. Required for actions that are irreversible, costly or regulated.', see: [['#/d/human-in-loop', 'How much do we trust it to act']] },
  { g: 'agents', term: 'Excessive agency', def: 'The risk that an agent has more tools, permissions or autonomy than its task needs, so a mistake or an attack causes real damage. Grant the least privilege per tool.', see: [['#/security-center', 'Security center']] },

  { g: 'quality', term: 'Groundedness', def: 'Whether every claim in an answer is supported by the retrieved sources. Low groundedness is the usual signal of hallucination in RAG.', see: [['#/evaluation', 'Evaluation center']] },
  { g: 'quality', term: 'Golden dataset', def: 'A curated set of questions with expected answers or sources, used to measure quality before each release. Grow it from real production failures.', see: [['#/evaluation', 'Evaluation center'], ['#/d/evaluation', 'How will we know it works']] },
  { g: 'quality', term: 'LLM-as-judge', def: 'Using a model to score another model\'s output against a rubric. Fast and scalable, but calibrate it against human ratings before you trust it.', see: [['#/evaluation', 'Evaluation center']] },
  { g: 'quality', term: 'Recall@k', def: 'The share of relevant passages that appear in the top k retrieval results. If recall is low, no prompt change will fix the answer.', see: [['#/rag-lab', 'RAG lab']] },
  { g: 'quality', term: 'Prompt injection', def: 'Text in the user input or in retrieved content that tries to override the system instructions. Indirect injection through documents and web pages is the harder case.', see: [['#/security-center', 'Security center'], ['#/s/content-safety', 'Azure AI Content Safety']] },
  { g: 'quality', term: 'Red teaming', def: 'Deliberately attacking your own system with adversarial prompts to find safety and security failures before users do. Automate a baseline and repeat it each release.', see: [['#/evaluation', 'Evaluation center'], ['#/advanced-ai', 'Advanced AI']] },
  { g: 'quality', term: 'Quality gate', def: 'A rule in the release pipeline that blocks a deployment when evaluation scores fall below agreed thresholds.', see: [['#/evaluation', 'Evaluation center']] },

  { g: 'platform', term: 'Landing zone', def: 'A pre-built, governed Azure environment with networking, identity, policy and monitoring in place, so workloads start compliant.', see: [['#/gov', 'Landing zones'], ['#/foundation', 'Cloud foundation']] },
  { g: 'platform', term: 'Hub and spoke', def: 'A network topology where shared services such as the firewall and DNS sit in a central hub network and each workload has its own spoke network peered to it.', see: [['#/gov', 'Landing zones']] },
  { g: 'platform', term: 'Private endpoint', def: 'A private IP address in your virtual network for a platform service, so traffic to that service stays off the public internet. It needs matching private DNS.', see: [['#/s/private-link', 'Virtual Network & Private Link'], ['#/foundation', 'Cloud foundation']] },
  { g: 'platform', term: 'Managed identity', def: 'An identity that Azure gives to a resource so it can call other services without a stored secret. Prefer it to keys wherever the target service supports it.', see: [['#/s/entra-id', 'Microsoft Entra ID & managed identities'], ['#/services-matrix', 'Service comparison']] },
  { g: 'platform', term: 'RBAC', def: 'Role-based access control: permissions granted as roles to identities at a scope. Give each identity the narrowest role at the narrowest scope.', see: [['#/s/entra-id', 'Microsoft Entra ID & managed identities'], ['#/s/azure-policy', 'Azure Policy & governance']] },
  { g: 'platform', term: 'Customer-managed key (CMK)', def: 'Encryption at rest with a key that you hold in your own key vault, so you control rotation and revocation.', see: [['#/s/key-vault', 'Azure Key Vault']] },
  { g: 'platform', term: 'AI gateway', def: 'An API gateway in front of model endpoints that adds authentication, token-based rate limits, load balancing across deployments, caching and usage logging.', see: [['#/s/apim', 'Azure API Management (AI gateway)'], ['#/a/llm-serving', 'LLM serving and gateway']] },

  { g: 'ops', term: 'GenAIOps', def: 'The practices that take generative AI from prototype to production: versioned prompts and data, automated evaluation in CI, staged releases and production monitoring.', see: [['#/p/genaiops-mlops', 'GenAIOps playbook'], ['#/a/genaiops-lifecycle', 'GenAIOps lifecycle']] },
  { g: 'ops', term: 'MLOps', def: 'The same discipline for classical machine learning: reproducible training, a model registry, managed deployment and monitoring for drift.', see: [['#/traditional-ml', 'Traditional ML'], ['#/a/training-mlops', 'Training and MLOps']] },
  { g: 'ops', term: 'Drift', def: 'A change over time in the input data or in the link between inputs and outcomes, which makes a model less accurate. Monitor it and retrain on a trigger.', see: [['#/s/aml-monitoring', 'Azure ML model monitoring']] },
  { g: 'ops', term: '429 throttling', def: 'The HTTP status a service returns when you exceed its rate or quota. For models, retry with back-off, spread load across deployments and plan capacity.', see: [['#/troubleshooting', 'Troubleshooting'], ['#/s/quotas', 'Azure Quotas & capacity']] },
  { g: 'ops', term: 'SLO and error budget', def: 'A service level objective is a target for a user-visible measure such as latency or success rate. The error budget is the failure the target still allows; spend it on change, not on surprises.', see: [['#/ops', 'Operations']] },
  { g: 'ops', term: 'KQL', def: 'Kusto Query Language, used to query logs and metrics in Azure Monitor and Log Analytics.', see: [['#/ops', 'Operations'], ['#/s/azure-monitor', 'Azure Monitor (Log Analytics & Application Insights)']] },
  { g: 'ops', term: 'Canary release', def: 'Sending a small share of traffic to a new version first, comparing its metrics with the current version, and widening only if it holds up.', see: [['#/p/genaiops-mlops', 'GenAIOps playbook']] },
  { g: 'ops', term: 'Cost per task', def: 'The full cost of one completed user task: model tokens, retrieval, hosting and retries. A better unit than cost per request for comparing designs.', see: [['#/d/calculator', 'Cost per task'], ['#/finops', 'FinOps']] }
];

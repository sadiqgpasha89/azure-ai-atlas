/* Generative AI */
S({
  id: 'foundry', cat: 'genai', name: 'Microsoft Foundry', doc: 'azure/foundry/',
  tag: 'The unified Azure platform for building, evaluating, governing and operating models and agents.',
  what: 'Microsoft Foundry (formerly Azure AI Foundry, and before that Azure AI Studio) is the umbrella platform for AI applications on Azure. A **Foundry resource** holds your model deployments and tools; **projects** inside it organise agents, files, connections, evaluations and traces for a team or application. A portal, SDKs and a REST API give access to all of it.\n\nThink of it as the control plane around the rest of this atlas: [[foundry-models|Foundry Models]] for calling models, [[foundry-agent-service|Agent Service]] for hosted agents, [[ai-search]] for grounding, [[content-safety]] for guardrails, and the **Foundry Tools** (document, speech, vision and language services) for prebuilt capabilities.',
  flow: ['Foundry resource', 'Project', 'Model deployments', 'Agents + tools', 'Evaluate + trace', 'Govern + monitor'],
  steps: [
    [0, 'You create a **Foundry resource** in a Region. It carries the endpoint, networking, keys or Entra access, and the deployed models.'],
    [1, 'Inside it you create a **project** for an application or team, which scopes agents, data connections and evaluations.'],
    [2, 'You **deploy models** from the catalogue (choosing a deployment type and capacity) and attach content filters.'],
    [3, 'You build agents or applications that use the models, tools such as [[ai-search]], and your own data connections.'],
    [4, 'You run **evaluations** on test sets and capture **traces** of agent runs to see what each step did.'],
    [5, 'Administrators govern access, quota, policy and cost across projects, with telemetry flowing to [[azure-monitor]].']
  ],
  gotchas: [
    '**Naming and portals have changed repeatedly.** Documentation, SDK packages and screenshots may use older names (Azure AI Studio, Azure AI Foundry, hubs). Check which resource model and API generation your code targets.',
    '**Projects share the resource\'s quota and networking.** One noisy project can starve another deployment of tokens per minute.',
    '**Region choice is sticky.** Model availability, quota, data processing location and some features differ by Region.',
    '**Role assignments are the real security boundary.** Broad roles on the resource expose every deployment and connection in it.',
    '**Preview features move.** Treat preview capabilities as subject to change in API shape and billing.'
  ],
  edges: [
    'Classic hub-based projects and the newer Foundry resource-based projects coexist; new work should follow current guidance.',
    '**Bring-your-own resources** (storage, search, Cosmos DB) for agents give you control over data location and retention.',
    'Model catalogue entries include models sold directly by Azure and partner or community models with different terms, billing and support.'
  ],
  ml: [
    'A single place for platform teams to standardise model access, safety settings and evaluations across product teams.',
    'Developer workflow: pick a model, test in the playground, wire up retrieval, evaluate, then deploy through code.',
    'Tracing and evaluation give you the evidence needed for [[aml-monitoring|monitoring]] and for change approvals.',
    'Pair with [[apim|an AI gateway]] when many apps must share model capacity under governance.'
  ],
  pairs: ['foundry-models', 'foundry-agent-service', 'ai-search', 'content-safety', 'apim', 'entra-id'],
  cost: 'The platform itself is mostly free; you pay for what you use inside it: model tokens or provisioned capacity, agent tool usage, search, storage, and evaluation or fine-tuning compute. Quota is free but limits what you can deploy.'
});

S({
  id: 'foundry-models', cat: 'genai', name: 'Foundry Models', doc: 'azure/foundry/foundry-models/concepts/deployment-types',
  tag: 'Call OpenAI and partner models through Azure endpoints, with a deployment type per data and throughput need.',
  what: 'Foundry Models is how you call foundation models on Azure: the OpenAI model family (formerly the Azure OpenAI Service), plus other providers\' models in the catalogue. You create a **deployment** of a model, then call it with the OpenAI-compatible API, using a managed identity or key.\n\nThe key design choice is the **deployment type**, which sets where prompts are processed and how you pay. **Global** types route across Azure Regions for the most capacity and the newest models. **Data Zone** types keep processing inside the US or EU zone. **Regional** (Standard) types keep it in one Region. Each comes as **Standard** (pay per token), **Provisioned** (reserved throughput in PTUs) or **Batch** (asynchronous at a discount).',
  flow: ['Your app', 'Auth + quota (TPM)', 'Content filter', 'Deployment type routing', 'Model', 'Response + usage'],
  steps: [
    [0, 'Your app calls the deployment\'s endpoint with a model deployment name, messages, tools and options, authenticating with an Entra token.'],
    [1, 'Azure checks the request against the deployment\'s quota in **tokens per minute** and requests per minute. Over the limit, the call returns HTTP 429.'],
    [2, 'The input is screened by the deployment\'s **content filter** (and optional [[content-safety|Prompt Shields]]).'],
    [3, 'The request is routed by deployment type: any Region for Global, within the zone for Data Zone, or within the Region for Standard.'],
    [4, 'The model generates tokens, streamed or returned whole; the output is filtered too.'],
    [5, 'Token usage is metered for billing and sent to [[azure-monitor]]; diagnostic logging is optional.']
  ],
  gotchas: [
    '**Throttling is the production surprise.** Quota is set per subscription, per Region and per model in tokens per minute. Request increases early, spread load across deployments and Regions, and retry with jittered backoff honouring `Retry-After`.',
    '**Deployment type changes data locality.** Global processing may handle prompts in any Azure Region; use Data Zone or Regional types where residency rules require it, and check what applies to data at rest.',
    '**Models retire.** Each model version has a retirement date. Pin versions deliberately, track retirements, and keep regression evals ready.',
    '**Standard latency varies under load.** Pay-per-token traffic is shared; use Provisioned deployments when you need steady latency.',
    '**Content filters can block legitimate requests.** Tune them with your evals rather than switching them off.'
  ],
  edges: [
    '**Provisioned throughput (PTU)** is billed hourly per PTU whether or not you use it, and is model-independent quota. Size it from real traffic (requests, input and output tokens), and keep a pay-per-token spillover.',
    '**Batch deployments** run large jobs asynchronously at a substantial discount, with a 24-hour target turnaround.',
    '**Prompt caching** discounts repeated prefixes on supported models, so put stable content (system prompt, documents) at the start.',
    'New models arrive on Global first, then Data Zone, then Regional, so residency requirements can delay access to new models.'
  ],
  ml: [
    'Default way to add LLM features without operating GPUs: chat, summarisation, extraction, classification, code and agents.',
    'Build RAG with [[ai-search]] and agents with [[foundry-agent-service]] or [[agent-framework]]; add safety with [[content-safety]].',
    'Use **Batch** for offline jobs: labelling a corpus, generating synthetic data, bulk summarisation.',
    'Evaluate candidate models side by side on your own prompts before switching, and route by task difficulty to control cost.'
  ],
  pairs: ['foundry', 'apim', 'ai-search', 'content-safety', 'foundry-agent-service', 'quotas'],
  cost: 'Standard types bill per million input and output tokens (output costs more, cached input costs less). Provisioned types bill per PTU per hour. Batch types are discounted for asynchronous work. Tokens, not infrastructure, are the bill: trim context and cache aggressively.'
});

S({
  id: 'foundry-agent-service', cat: 'genai', name: 'Foundry Agent Service', doc: 'azure/foundry/agents/',
  tag: 'Managed runtime for agents: model, tools, memory and conversation state, with enterprise controls.',
  what: 'Foundry Agent Service hosts agents so you do not build the loop, the state store or the tool plumbing. An agent combines a **model**, **instructions** and **tools**. The service runs the loop: it calls the model, executes tool calls, feeds results back and keeps **conversation state**.\n\nIt supports **prompt agents** (configured declaratively), **workflow agents** (multi-step with branching and human input) and **hosted agents** (your own code, built with a framework such as [[agent-framework]], running in a managed container). Built-in tools include file search and [[ai-search]], code interpreter, web grounding, function calling, OpenAPI and **MCP** servers.',
  flow: ['User message', 'Agent (model + instructions)', 'Tool choice', 'Tool runs', 'Result back to model', 'Final answer + trace'],
  steps: [
    [0, 'A user message arrives in a conversation. The service loads the conversation\'s history and the agent\'s instructions.'],
    [1, 'The model reasons over the message and the list of available tools.'],
    [2, 'It chooses a tool and arguments (for example, a search query or an API call).'],
    [3, 'The service executes the tool, for example [[ai-search]], a code sandbox, an OpenAPI endpoint, an MCP server or an [[functions|Azure Function]], using the right identity.'],
    [4, 'The result is returned to the model, which may call more tools or decide it has enough.'],
    [5, 'The final answer is returned and the full run is recorded as a **trace** you can inspect and evaluate.']
  ],
  gotchas: [
    '**Tool descriptions drive tool choice.** Vague names and descriptions cause wrong calls. Test tool selection separately from answer quality.',
    '**Identity decides blast radius.** Tools that run as a shared service identity can read what the user could not. Prefer user-delegated identity (on-behalf-of) and least privilege.',
    '**Prompt injection arrives through tool output and retrieved text.** Treat all tool results as untrusted data and gate writes with approval.',
    '**Loops cost tokens.** Cap steps, tokens and wall-clock time per run, and watch for repeated tool calls.',
    '**API generations differ.** Agents built on older thread-and-run APIs and the newer conversation-based APIs are not interchangeable; check the SDK you use.'
  ],
  edges: [
    '**Standard setup with your own resources** lets you keep agent state, files and search indexes in your own Cosmos DB, storage and search accounts for control over residency and retention.',
    'Agents can be exposed to other agents and clients through MCP and agent-to-agent protocols, and can consume enterprise tools published through an AI gateway.',
    'Per-agent identities allow separate permissions and audit trails for each agent.'
  ],
  ml: [
    'The fastest managed route to a tool-using assistant for a team that does not want to operate the loop.',
    'Hosted agents for teams that want code-level control with managed isolation, scaling and identity.',
    'Grounded agents using [[ai-search|knowledge bases]] and file search as retrieval tools.',
    'Evaluate and trace every run, and promote changes only when evals pass.'
  ],
  pairs: ['foundry-models', 'agent-framework', 'ai-search', 'functions', 'logic-apps', 'entra-id'],
  cost: 'You pay for model tokens, plus usage of specific tools (code interpreter sessions, search, web grounding) and the storage and search resources behind the agent. Multi-step runs multiply model calls, so measure cost per completed task, not per call.'
});

S({
  id: 'agent-framework', cat: 'genai', name: 'Microsoft Agent Framework', doc: 'agent-framework/',
  tag: 'Open-source .NET and Python framework for agents and multi-agent workflows; successor to Semantic Kernel and AutoGen.',
  what: 'Microsoft Agent Framework is an open-source SDK for building agents and orchestrating them in code. It combines the enterprise foundations of **Semantic Kernel** (connectors, middleware, telemetry) with the multi-agent patterns of **AutoGen**, in one model for .NET and Python. Version 1.0 was released in April 2026.\n\nIt provides **agents** (a model plus tools and memory) and **workflows** (graphs of agents and functions with typed messages and **checkpointing**), with built-in orchestration patterns: sequential, concurrent, handoff, group chat and Magentic-style planning. It works with many model providers, speaks **MCP** and agent-to-agent protocols, and emits OpenTelemetry traces.',
  flow: ['Input', 'Workflow graph', 'Agent / function node', 'Tool + model call', 'Checkpoint', 'Output + trace'],
  steps: [
    [0, 'Input enters a **workflow**, or a single agent, defined in code.'],
    [1, 'The workflow graph routes messages between nodes by edges, with conditions and fan-out or fan-in.'],
    [2, 'A node runs: an **agent** (model plus tools) or a plain function.'],
    [3, 'Agents call models (in [[foundry-models]] or elsewhere) and tools, including MCP servers, with middleware for logging, filters and approvals.'],
    [4, 'The framework **checkpoints** workflow state so a long run can pause for a person and resume, or recover after a failure.'],
    [5, 'Results are returned and the run is traced through OpenTelemetry to [[azure-monitor]] or Foundry tracing.']
  ],
  gotchas: [
    '**More agents is not better.** Each agent adds model calls, latency and failure modes. Start with one agent and a workflow, and add agents only when an eval shows a gain.',
    '**It is a library, not a runtime.** You choose where it runs (a container, [[container-apps]], [[aks]], or Foundry hosted agents) and you operate it.',
    '**Migration is real work.** Code on Semantic Kernel or AutoGen continues to work for now, but new agent code should target the new primitives; plan the move.',
    '**Version and preview status vary by component.** Check which pieces are stable before depending on them.',
    '**You own state and memory design.** Decide what is stored, where, for how long and for whom.'
  ],
  edges: [
    'Workflows give **deterministic structure** around non-deterministic models, which is usually what makes a system testable.',
    'Providers are pluggable, so the same agent can run on Foundry models or other model endpoints.',
    'Human-in-the-loop is a first-class concept, via request-and-response messages within workflows.'
  ],
  ml: [
    'Code-first agents with bespoke control flow, multi-agent patterns, or tools that live in your own services.',
    'Typed workflows where some steps are LLM-driven and others are plain code, for predictable behaviour.',
    'Hosting on [[foundry-agent-service|Foundry hosted agents]] for managed scale and identity without leaving the framework.',
    'Migration target for teams with existing Semantic Kernel plugins and AutoGen prototypes.'
  ],
  pairs: ['foundry-agent-service', 'foundry-models', 'ai-search', 'container-apps', 'azure-monitor', 'durable-functions'],
  cost: 'The framework is free and open source. You pay for the models and tools your agents call, and for wherever you host it. Multi-agent designs multiply model calls, so cost per completed task is the number to track.'
});

S({
  id: 'ai-search', cat: 'genai', name: 'Azure AI Search', doc: 'azure/search/',
  tag: 'Hybrid keyword and vector search with ranking, indexers and agentic retrieval for grounding.',
  what: 'Azure AI Search is a managed search service. You define an **index** (fields, vectors, scoring), fill it with documents, and query it with **keyword, vector or hybrid** search, optionally re-ranked by a **semantic ranker**. **Indexers** pull from sources such as [[blob]], [[cosmos]] and [[sql]], and **skillsets** can chunk, OCR and embed content during ingestion (integrated vectorisation).\n\nFor AI, its newest feature is **agentic retrieval**: a **knowledge base** that plans a question into sub-queries, runs them in parallel across one or more **knowledge sources**, merges the results and returns grounded passages with citations. Microsoft packages this as **Foundry IQ**. Document-level access controls can trim results to what the caller may see.',
  flow: ['Sources', 'Indexer + skillset', 'Index (text + vectors)', 'Query (hybrid)', 'Semantic rerank / agentic plan', 'Grounded passages'],
  steps: [
    [0, 'Source documents sit in [[blob]], [[cosmos]], SharePoint or another supported source.'],
    [1, 'An **indexer** pulls changes on a schedule; a **skillset** cracks documents, splits them into chunks and calls an embedding model.'],
    [2, 'Chunks, metadata (tenant, department, ACLs) and **vectors** are stored in the index.'],
    [3, 'A query runs keyword and vector searches together and fuses the rankings (reciprocal rank fusion), with filters from the caller\'s identity.'],
    [4, 'The **semantic ranker** re-orders the top results. With a **knowledge base**, a model first plans sub-queries and the engine runs them in parallel.'],
    [5, 'Top passages and citations are handed to the model in [[foundry-models]] or an agent as grounding.']
  ],
  gotchas: [
    '**Retrieval quality, not the model, is usually the problem.** Measure recall at k and answer groundedness separately, using real questions.',
    '**You cannot change a service\'s tier in place**, and changing field types or vector settings in an index means a rebuild. Plan the schema and size before loading.',
    '**Capacity is replicas and partitions.** Replicas add query throughput and availability; partitions add storage and indexing speed. Vector indexes consume memory, so vector storage quotas bite first.',
    '**Access control must be enforced in retrieval**, with security filters or document-level permissions, and tested with different users.',
    '**Agentic retrieval costs extra model tokens** (query planning and answer steps) on top of search; budget for it and choose the reasoning effort deliberately.'
  ],
  edges: [
    'Index freshness depends on the indexer schedule or push; new documents are not searchable until processed.',
    'Quantisation and dimension reduction cut vector storage at some cost in recall; test before enabling.',
    'Semantic ranker, agentic retrieval and some skills are billed separately from the base search units.'
  ],
  ml: [
    'The default retrieval layer for RAG, with hybrid search and re-ranking that usually beat pure vector search.',
    '**Knowledge bases** (Foundry IQ) as a shared, permission-aware retrieval tool for several agents.',
    'Enterprise search over documents from SharePoint, Blob and databases through one index.',
    'Pair with [[postgres]] or [[cosmos]] vectors only when a single database is a better fit than a search service.'
  ],
  pairs: ['foundry-models', 'foundry-agent-service', 'blob', 'purview', 'content-safety', 'cosmos'],
  cost: 'Billed by **search units** (replicas × partitions) at an hourly rate for the chosen tier, whether or not you query. Semantic ranking, agentic retrieval and skills (OCR, embeddings) add usage-based charges. Right-size the tier for vector memory and QPS.'
});

S({
  id: 'content-safety', cat: 'genai', name: 'Azure AI Content Safety', doc: 'azure/ai-services/content-safety/',
  tag: 'Screen inputs and outputs for harm, jailbreaks, indirect prompt attacks and ungrounded answers.',
  what: 'Content Safety is a set of detectors you apply to text and images. It scores content for categories such as hate, sexual content, violence and self-harm with **severity levels**, and offers AI-specific protections: **Prompt Shields** (jailbreaks and indirect prompt injection hidden in documents and tool output), **groundedness detection**, **protected material detection** and **custom categories**.\n\nThe same technology powers the **content filters** on [[foundry-models|Foundry Models]] deployments, so many protections apply without extra code; the standalone APIs let you screen content that does not pass through a Foundry deployment, or apply your own thresholds.',
  flow: ['User input', 'Input filter + Prompt Shields', 'Model', 'Output filter', 'Groundedness check', 'Response or block'],
  steps: [
    [0, 'A user message (and any retrieved or tool text) is prepared for the model.'],
    [1, 'The **input filter** scores it for harmful categories, and **Prompt Shields** look for jailbreak attempts and instructions hidden in documents.'],
    [2, 'If allowed, the request reaches the model in [[foundry-models]].'],
    [3, 'The **output filter** scores the generated text, and can block or annotate it.'],
    [4, 'For RAG, **groundedness detection** checks whether claims are supported by the retrieved sources.'],
    [5, 'The app returns the answer, a safe refusal, or a fallback, and logs the decision for review.']
  ],
  gotchas: [
    '**Filters are a layer, not a guarantee.** They reduce risk but do not replace least-privilege tools, approval for writes and evaluation.',
    '**Thresholds trade false positives against misses.** Tune on your own traffic, including benign edge cases from your domain.',
    '**Streaming complicates output filtering.** Filtering partial output can let early tokens through; test how your pipeline handles it.',
    '**Indirect injection happens in your data.** Apply Prompt Shields to retrieved passages and tool results, not only user input.',
    'Language and modality coverage differ by feature; check support for the languages you serve.'
  ],
  edges: [
    'Custom categories let you detect domain-specific content (for example, competitor mentions or regulated advice).',
    'Severity thresholds are set per category, and can differ between input and output.',
    'Blocklists catch exact terms that detectors might not.'
  ],
  ml: [
    'Default safety layer for any user-facing generative feature.',
    'Defence against prompt injection for agents that read web pages, emails and documents.',
    'Groundedness gates for answers that must be supported by retrieved sources.',
    'Measure false-positive and block rates as production quality metrics, and feed them into [[azure-monitor]].'
  ],
  pairs: ['foundry-models', 'foundry-agent-service', 'ai-search', 'defender', 'azure-monitor'],
  cost: 'Filters on Foundry deployments are included with model usage in typical configurations; the standalone APIs bill per text records or images analysed, with separate rates for features such as Prompt Shields and groundedness. Confirm current pricing.'
});

S({
  id: 'copilot-studio', cat: 'genai', name: 'Microsoft Copilot Studio', doc: 'microsoft-copilot-studio/',
  tag: 'Low-code agent builder for business teams, publishing to Teams, Microsoft 365 Copilot and the web.',
  what: 'Copilot Studio is a low-code environment for building agents that answer questions and take actions using **knowledge sources** (SharePoint, files, websites, Dataverse), **connectors** and **tools** (including MCP servers and Power Automate flows). Makers design in a visual canvas, with generative orchestration choosing topics and tools.\n\nIt is the "adopt and configure" end of the spectrum: right when business teams own the use case, the data is in Microsoft 365, and delivery speed matters more than custom control. Pro-code teams can connect Studio agents to [[foundry-agent-service|Foundry]] models and agents when they outgrow the canvas.',
  flow: ['Maker builds agent', 'Knowledge + tools', 'Publish channel', 'User message', 'Orchestration', 'Answer / action'],
  steps: [
    [0, 'A maker creates an agent, writes instructions, and picks a model and settings.'],
    [1, 'They add **knowledge sources** and **tools** (connectors, flows, MCP), governed by Power Platform policies.'],
    [2, 'The agent is **published** to a channel such as Microsoft Teams, Microsoft 365 Copilot, a website or another app.'],
    [3, 'A user sends a message, authenticated as themselves where configured.'],
    [4, 'Generative orchestration plans the response: it searches knowledge, calls tools and asks for confirmation on actions.'],
    [5, 'The agent answers, or performs the action, and analytics record outcomes.']
  ],
  gotchas: [
    '**Sharing equals exposure.** An agent grounded in SharePoint can surface files a user technically has access to but never knew about. Clean up permissions before rollout.',
    '**Consumption is metered in credits.** Generative answers, tool calls and actions each consume capacity; model the volume before committing.',
    '**Maker sprawl.** Easy creation leads to many untested agents. Use environments, data-loss-prevention policies and a review step before publishing broadly.',
    '**Low-code limits are real.** Complex control flow and custom evaluation are awkward; know when to move to code.',
    'Authentication choices (user versus maker credentials) decide whose permissions a tool uses; review them per connector.'
  ],
  edges: [
    'Environments and solutions give you ALM: dev, test and production with managed deployment.',
    'Agents can call other agents, and can be called from Foundry-built agents.',
    'Analytics show resolution and escalation rates, which are a starting point for measuring value.'
  ],
  ml: [
    'Internal HR, IT and policy assistants over Microsoft 365 content.',
    'Business-owned automation agents that trigger Power Automate flows with human approval.',
    'Customer-service front ends that escalate to people with context.',
    'Quick prototypes that validate demand before investing in a code-first build.'
  ],
  pairs: ['m365-copilot', 'foundry-agent-service', 'logic-apps', 'purview', 'entra-id'],
  cost: 'Licensed by capacity (a monthly pool of credits, with pay-as-you-go options) rather than per user for most scenarios; agents that serve Microsoft 365 Copilot users can be covered differently. Forecast credits per conversation and per action before launch.'
});

S({
  id: 'm365-copilot', cat: 'genai', name: 'Microsoft 365 Copilot & GitHub Copilot', doc: 'copilot/microsoft-365/',
  tag: 'Finished AI assistants for knowledge workers and developers: buy, configure and extend.',
  what: '**Microsoft 365 Copilot** is an assistant built into Word, Excel, Outlook, Teams and more. It grounds answers in your tenant\'s content through Microsoft Graph and respects existing permissions and sensitivity labels. It can be extended with **declarative agents**, connectors and custom agents. **GitHub Copilot** is the developer equivalent: code completion, chat, and an agent mode that works on issues and pull requests.\n\nThese are the "buy" end of the spectrum. For commodity needs (drafting, summarising meetings, developer productivity) they are usually faster and cheaper than building, and the work shifts to rollout, permissions hygiene and measuring adoption.',
  flow: ['User prompt in an app', 'Grounding via Graph', 'Permission + label check', 'Model response', 'Extensions / agents', 'Audit'],
  steps: [
    [0, 'A user asks Copilot for help inside Word, Teams, Outlook or the IDE.'],
    [1, 'For Microsoft 365, Copilot retrieves relevant emails, files and meetings through **Microsoft Graph**, as the user.'],
    [2, 'Only content the user can already access is used, and sensitivity labels and policies from [[purview]] apply.'],
    [3, 'The model produces a draft, summary or code suggestion.'],
    [4, 'Optional **agents and connectors** extend what Copilot can read or do, such as querying a business system.'],
    [5, 'Interactions can be audited and governed through the compliance tooling.']
  ],
  gotchas: [
    '**Oversharing becomes visible.** Copilot surfaces content that was technically accessible but practically hidden. Fix site permissions and labels before enabling it widely.',
    '**Licences are per user**, so unused seats are waste. Roll out in cohorts and measure active use.',
    '**Ungrounded trust.** Users may accept drafts uncritically; training and clear norms about review matter.',
    '**Extensibility has limits.** Heavy customisation points toward [[copilot-studio]] or a code-first agent instead.',
    '**Code assistants need policy.** Decide on repository access, suggestion filtering and review rules for AI-written code.'
  ],
  edges: [
    'Data stays within the Microsoft 365 service boundary under its commitments; confirm the terms that apply to your tenant and geography.',
    'Usage reports and adoption dashboards exist, but outcome measurement (time saved, quality) is your job.',
    'Agent mode in coding assistants can change many files; require tests and human review on the pull request.'
  ],
  ml: [
    'Baseline productivity tool: adopt before building anything that duplicates it.',
    'Grounded access to enterprise content with permissions respected, without building your own RAG.',
    'Extend with declarative agents and connectors for the few things only your systems know.',
    'Use as the front door and build custom agents behind it for differentiated workflows.'
  ],
  pairs: ['copilot-studio', 'purview', 'entra-id', 'foundry-agent-service'],
  cost: 'Priced per user per month (Microsoft 365 Copilot, GitHub Copilot) with tiers and usage-based add-ons for some agent features. The real cost includes licences for people who do not use it, plus enablement and permission clean-up.'
});

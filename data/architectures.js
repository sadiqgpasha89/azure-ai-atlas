window.ATLAS.architectures = [
  {
    id: 'rag-assistant', name: 'RAG assistant on Foundry and AI Search',
    short: 'Ground an LLM in your own documents, with citations, per-user access control and content safety.',
    when: 'You need answers grounded in private or fast-changing content, and fine-tuning is the wrong tool. Start here for most enterprise assistants.',
    flow: [
      { l: 'Documents', s: 'blob' },
      { l: 'Index + embed', s: 'ai-search' },
      { l: 'User + identity', s: 'entra-id' },
      { l: 'AI gateway', s: 'apim' },
      { l: 'Safety filters', s: 'content-safety' },
      { l: 'LLM answer', s: 'foundry-models' }
    ],
    steps: [
      [0, 'Source documents (manuals, policies, tickets) are stored in [[blob]]. An upload event or a schedule triggers ingestion.'],
      [1, 'An [[ai-search|AI Search]] indexer cracks and chunks each document and calls an embedding model; chunks, vectors and **permission metadata** (tenant, group, document ACLs) are written to the index.'],
      [2, 'A user signs in with [[entra-id|Entra ID]]; their identity and group claims travel with each request.'],
      [3, 'Requests pass through [[apim|API Management]], which applies per-user **token limits** and forwards to the app\'s retrieval step.'],
      [1, 'The question is embedded and searched (hybrid plus semantic ranking) with a **security filter** built from the user\'s claims, so they only retrieve documents they may see.'],
      [4, 'Retrieved text and the question pass through [[content-safety|Content Safety]] (Prompt Shields for indirect injection) before the model sees them.'],
      [5, '[[foundry-models|The model]] generates the answer from the retrieved passages and returns it with citations; groundedness is checked on the way out.']
    ],
    why: [
      'Knowledge stays outside the model, so updating a document updates answers without retraining.',
      'Citations make answers verifiable, which builds user trust and eases compliance.',
      'Security filters give per-user access control without a separate index per user.',
      'Every component is managed, so the team spends time on quality, not servers.'
    ],
    fails: [
      'Bad chunking or parsing: the right document is indexed but the right passage never surfaces. Measure retrieval recall on a test set.',
      'Stale index: indexer lag means new policies are not yet searchable.',
      'Access-control leak: a missing security filter returns restricted chunks. Test with users from different groups.',
      'Throttling at launch because model quota (tokens per minute) was not raised ahead of time.'
    ]
  },
  {
    id: 'llm-serving', name: 'Self-hosted LLM serving on AKS',
    short: 'Serve an open-weight or fine-tuned model on GPUs with queues, autoscaling and streaming.',
    when: 'You need a model the managed catalogue does not offer, tight cost control at steady high volume, custom serving logic, or strict data locality. Expect to own more operations.',
    flow: [
      { l: 'Edge + WAF', s: 'front-door' },
      { l: 'AI gateway', s: 'apim' },
      { l: 'Model servers (vLLM)', s: 'aks' },
      { l: 'GPU nodes', s: 'gpu-vms' },
      { l: 'Weights', s: 'blob' },
      { l: 'Metrics + scaling', s: 'azure-monitor' }
    ],
    steps: [
      [0, 'Clients reach [[front-door|Front Door]], whose WAF and rate limits block abusive callers before they cost GPU time.'],
      [1, '[[apim|API Management]] authenticates callers, applies token budgets and routes to the serving cluster, with buffering policies off so streaming works.'],
      [2, 'Pods running a serving engine (such as vLLM) batch concurrent requests continuously and stream tokens back.'],
      [3, 'Pods are scheduled on [[gpu-vms|GPU nodes]] that [[aks]] provisions on demand; reserved capacity covers the baseline.'],
      [4, 'New pods load model weights from [[blob]] (cached on local NVMe) with a workload identity.'],
      [5, 'GPU and request metrics flow to [[azure-monitor]]; autoscaling reacts to queue depth or tokens per second, not CPU.']
    ],
    why: [
      'You control the model, the serving engine and the cost per token at high steady volume.',
      'Data never leaves your network boundary, which matters for strict locality needs.',
      'Continuous batching keeps expensive GPUs busy instead of waiting on single requests.',
      'The same cluster can host agent runtimes and tool servers next to the model.'
    ],
    fails: [
      'GPU capacity: quota approved but no hardware free in the Region. Reserve baseline capacity.',
      'Slow scale-out: a new node, image pull and weight load take many minutes, so spikes become outages.',
      'Wrong autoscaling signal: scaling on CPU leaves the GPUs saturated or idle.',
      'Timeouts stack across edge, gateway and ingress, cutting long streams at the shortest one.'
    ]
  },
  {
    id: 'training-mlops', name: 'MLOps on Azure Machine Learning',
    short: 'Retrain, evaluate, register, deploy and monitor models as a routine, reviewable process.',
    when: 'You own the model: predictive ML, custom deep learning or fine-tuning, and you want reproducible training with promotion gates and monitoring.',
    flow: [
      { l: 'Data lake', s: 'adls' },
      { l: 'Pipeline run', s: 'aml-pipelines' },
      { l: 'Training compute', s: 'aml-training' },
      { l: 'Model registry', s: 'aml-workspace' },
      { l: 'Online endpoint', s: 'aml-endpoints' },
      { l: 'Monitoring', s: 'aml-monitoring' }
    ],
    steps: [
      [0, 'Curated, versioned data sits in [[adls]] (or [[fabric]] or [[databricks]]), with lineage in [[purview]].'],
      [1, 'A schedule, new data or a pull request starts an [[aml-pipelines|Azure ML pipeline]]: validate data, then train.'],
      [2, 'Training runs on [[aml-training|autoscaling compute]] (GPU where needed), logging metrics and checkpoints through MLflow.'],
      [1, 'An evaluation step compares the candidate with the production model on a fixed test set; only a passing model moves on.'],
      [3, 'The model is registered in the [[aml-workspace|registry]] with data version, code commit and metrics, and shared to production through a registry.'],
      [4, 'After approval, the model is deployed to an [[aml-endpoints|online endpoint]] as a canary with a traffic split, then promoted or rolled back.'],
      [5, '[[aml-monitoring|Monitoring]] compares production data with the baseline and raises alerts; drift beyond a threshold triggers the pipeline again.']
    ],
    why: [
      'Every production model can be traced to its data, code and metrics, which audits and incident reviews demand.',
      'Evaluation gates stop regressions from reaching users.',
      'Canary rollout and traffic splitting make deployment reversible.',
      'Retraining becomes a routine instead of a heroic effort.'
    ],
    fails: [
      'Training-serving skew: features are computed differently offline and online. Use a [[aml-feature-store|feature store]].',
      'Silent drift: no monitor, or an alert without an owner, so a decayed model keeps serving.',
      'Deployment fails for lack of spare VM quota during the blue-green update.',
      'Labels arrive late, so quality is judged on proxies for weeks.'
    ]
  },
  {
    id: 'agent-platform', name: 'Governed agent platform',
    short: 'A tool-using agent with managed runtime, narrow tools, user identity, approvals and traces.',
    when: 'The system must take actions in your systems, not just answer questions. Start read-only, add approval-gated writes, and extend autonomy only where measured accuracy supports it.',
    flow: [
      { l: 'User + identity', s: 'entra-id' },
      { l: 'AI gateway', s: 'apim' },
      { l: 'Agent runtime', s: 'foundry-agent-service' },
      { l: 'Tools (functions)', s: 'functions' },
      { l: 'Approval workflow', s: 'logic-apps' },
      { l: 'Traces + alerts', s: 'azure-monitor' }
    ],
    steps: [
      [0, 'A user signs in with [[entra-id]]. Their identity is delegated to the agent so tools act as the user, not as an administrator.'],
      [1, '[[apim|API Management]] enforces per-user token limits, content checks and routes the request to the agent.'],
      [2, 'The agent in [[foundry-agent-service|Foundry Agent Service]] (or code built with [[agent-framework]]) reasons and chooses a tool, with step, token and time caps.'],
      [3, 'Tools are narrow [[functions|Azure Functions]] (or MCP servers) that validate arguments server-side and run with least privilege; retrieval comes from [[ai-search]].'],
      [4, 'For writes and irreversible actions, a [[logic-apps|workflow]] or [[durable-functions|durable orchestration]] pauses for human approval before the tool runs.'],
      [5, 'Every run is traced step by step to [[azure-monitor]], with alerts on loops, cost and tool failures; traces become evaluation cases.']
    ],
    why: [
      'Narrow tools and user-delegated identity bound the damage when the model is wrong or manipulated.',
      'Approvals are the cheapest safety control, and can be removed per action as evidence builds.',
      'Traces make non-deterministic failures debuggable and feed evaluations.',
      'The gateway gives one place for budgets, safety and attribution across many agents.'
    ],
    fails: [
      'Prompt injection through retrieved text or tool output triggers an unintended action.',
      'Shared service identity lets the agent read data the user cannot.',
      'Loops burn tokens: no cap on steps or time per run.',
      'Vague tool descriptions cause wrong tool choices that final-answer evals do not catch.'
    ]
  },
  {
    id: 'document-intelligence', name: 'Document intelligence pipeline',
    short: 'Extract structured data from documents with OCR and models, validate it, and route low confidence to people.',
    when: 'You process forms, invoices, contracts or scans at volume and need structured, auditable output rather than a free-text summary.',
    flow: [
      { l: 'Documents land', s: 'blob' },
      { l: 'Event + queue', s: 'service-bus' },
      { l: 'Orchestrator', s: 'durable-functions' },
      { l: 'OCR + fields', s: 'doc-intelligence' },
      { l: 'Validate with LLM', s: 'foundry-models' },
      { l: 'Store results', s: 'cosmos' }
    ],
    steps: [
      [0, 'A document lands in [[blob]], emitting a `BlobCreated` event through [[event-grid]].'],
      [1, 'The event is turned into a message on [[service-bus]], which buffers bursts and protects downstream throttles.'],
      [2, 'A [[durable-functions|durable orchestration]] picks up the message and coordinates the steps with retries and timers.'],
      [3, '[[doc-intelligence|Document Intelligence]] runs OCR and extraction, returning fields with confidence scores.'],
      [4, 'PII is redacted with [[ai-language]] before any model step; [[foundry-models|a model]] maps messy fields to the target schema and checks business rules.'],
      [5, 'Validated results and status go to [[cosmos|Cosmos DB]] for downstream systems; low-confidence items wait for human review.']
    ],
    why: [
      'Specialist extraction is cheaper and more predictable than asking an LLM to read pixels.',
      'Queues and orchestration absorb bursts and failures without losing documents.',
      'Confidence thresholds and review keep error rates under control.',
      'Redaction before generative steps limits exposure of personal data.'
    ],
    fails: [
      'The LLM invents a value that is not in the document. Require each value to appear in the source text.',
      'Large backfills hit service throttles; use queue concurrency limits.',
      'Orchestrator payloads grow too large; pass blob references, not text.',
      'Review queue grows unseen when nobody owns it.'
    ]
  },
  {
    id: 'realtime-features', name: 'Real-time features and scoring',
    short: 'Stream events into fresh features and serve low-latency predictions or recommendations.',
    when: 'Predictions depend on what a user did seconds ago (fraud, recommendations, pricing) and the response must arrive in tens of milliseconds.',
    flow: [
      { l: 'Event stream', s: 'event-hubs' },
      { l: 'Stream processing', s: 'fabric' },
      { l: 'Feature store', s: 'aml-feature-store' },
      { l: 'Online cache', s: 'redis' },
      { l: 'Scoring endpoint', s: 'aml-endpoints' },
      { l: 'Feedback loop', s: 'adls' }
    ],
    steps: [
      [0, 'User and system events are published to [[event-hubs]], partitioned by user or entity key.'],
      [1, 'A stream job in [[fabric|Fabric]] (or [[databricks]]) aggregates events into features such as counts over a window.'],
      [2, 'Feature definitions live in the [[aml-feature-store|feature store]], which materialises history for training and the latest values for serving.'],
      [3, 'The latest feature values are held in [[redis|Managed Redis]] for sub-millisecond lookup by key.'],
      [4, 'The [[aml-endpoints|scoring endpoint]] receives a request, fetches features by key, scores the model and returns the result within the latency budget.'],
      [5, 'Requests, predictions and later outcomes are captured to [[adls]], closing the loop for retraining and monitoring.']
    ],
    why: [
      'Defining features once removes training-serving skew.',
      'An online cache keeps request-time latency independent of the data platform.',
      'The stream decouples producers from consumers and allows replay.',
      'Captured outcomes make the model improvable.'
    ],
    fails: [
      'Training-serving skew when feature code is duplicated rather than shared.',
      'Stale online features: materialisation lag exceeds how fast the signal changes.',
      'Cold start: new users and items have no features; provide fallbacks.',
      'Latency budget blown by feature lookups that were not load-tested.'
    ]
  },
  {
    id: 'traditional-rag', name: 'Enterprise Traditional RAG Pipeline',
    short: 'High-throughput document cracking, layout chunking, hybrid search, semantic reranking and grounded citation generation.',
    when: 'You need reliable answers grounded in static or structured enterprise documents, manuals, or policies where retrieval latency must stay under 250ms and deterministic citations are mandatory.',
    flow: [
      { l: 'Raw documents', s: 'blob' },
      { l: 'Layout analysis', s: 'doc-intelligence' },
      { l: 'Chunk & embed', s: 'foundry-models' },
      { l: 'Hybrid + rerank', s: 'ai-search' },
      { l: 'AI gateway', s: 'apim' },
      { l: 'Grounded model', s: 'foundry-models' }
    ],
    steps: [
      [0, 'Enterprise files (PDFs, Word documents, HTML reports) are uploaded to [[blob]] storage. Blob index tags track tenant and department metadata.'],
      [1, '[[doc-intelligence|Document Intelligence]] cracks document layouts, preserving tables, section headers and markdown hierarchy instead of raw text dumping.'],
      [2, 'Text chunks are passed to [[foundry-models]] text-embedding-3 models, producing 1536- or 3072-dimensional dense vector embeddings.'],
      [3, 'Chunks, metadata and vectors are written into [[ai-search]]; queries run BM25 full-text search and dense vector search combined via Reciprocal Rank Fusion (RRF), followed by Turing-based semantic reranking.'],
      [4, 'User requests enter through [[apim|API Management]] where rate limits, prompt caching and caller telemetry are applied.'],
      [5, 'Grounded passages and strict citation instructions pass to [[foundry-models]] to synthesize a verifiable response with footnote citations.']
    ],
    why: [
      'Layout-aware document cracking preserves tables and headers that naive chunkers obliterate.',
      'Hybrid search with semantic reranking consistently achieves 15-25% higher Recall@5 and NDCG@10 than pure vector search.',
      'The AI gateway provides token rate limits and caller chargeback before models are invoked.',
      'Strict grounding instructions and citations make answers verifiable for enterprise compliance.'
    ],
    fails: [
      'Table flattening: naive extraction turns tabular data into unstructured text so numerical questions hallucinate. Always use Document Intelligence for tables.',
      'Semantic reranker latency: adding the L2 reranker adds 100-200ms; monitor P95 latency against your SLA.',
      'Outdated index: missing change-detection webhooks cause search results to lag behind updated blob policies.',
      'Token overflow: injecting too many top-k passages exceeds model context limits or inflates per-task cost.'
    ]
  },
  {
    id: 'agentic-rag', name: 'Agentic RAG and Multi-Tool Retrieval',
    short: 'Query decomposition, iterative multi-hop reasoning, parallel tool retrieval and self-reflective answer synthesis.',
    when: 'User questions require multi-source synthesis, comparison across disparate databases, or iterative reasoning where single-shot vector retrieval cannot find all required facts.',
    flow: [
      { l: 'User inquiry', s: 'apim' },
      { l: 'Planner agent', s: 'foundry-agent-service' },
      { l: 'Orchestration tools', s: 'agent-framework' },
      { l: 'Foundry IQ search', s: 'ai-search' },
      { l: 'Operational data', s: 'cosmos' },
      { l: 'Reflective synthesis', s: 'foundry-models' }
    ],
    steps: [
      [0, 'Complex user inquiries enter through [[apim]], which enforces session iteration budgets and token caps.'],
      [1, 'The planner in [[foundry-agent-service|Foundry Agent Service]] analyzes the question, identifying required sub-queries and external dependencies.'],
      [2, '[[agent-framework|Microsoft Agent Framework]] coordinates parallel tool calls across specialized retrieval agents.'],
      [3, 'Enterprise policies and technical manuals are queried across [[ai-search]] / Foundry IQ knowledge bases using decomposed sub-queries.'],
      [4, 'Live operational records, user permissions and order statuses are retrieved concurrently from [[cosmos|Cosmos DB]].'],
      [5, '[[foundry-models|The model]] evaluates whether retrieved facts are sufficient (self-reflection); if gaps exist, it triggers a second retrieval pass before producing the final synthesized answer.']
    ],
    why: [
      'Decomposing multi-part questions overcomes the single-shot retrieval blind spot.',
      'Separating unstructured document knowledge from live operational database state provides comprehensive real-time answers.',
      'Self-reflection loops verify information completeness before returning an answer to users.',
      'Modularity allows adding new retrieval tools without retraining or re-indexing.'
    ],
    fails: [
      'Infinite retrieval loops: agents get stuck re-querying when information does not exist. Cap iterations to a maximum of 3 to 5.',
      'Token explosion: each intermediate reasoning step consumes prompt tokens, multiplying per-task cost by 3x to 8x.',
      'Latency degradation: multi-hop queries push end-to-end response times past 8-15 seconds; stream partial reasoning tokens.',
      'Tool hallucination: vague tool schemas cause agents to query search when they should query the database.'
    ]
  },
  {
    id: 'graph-rag', name: 'GraphRAG and Knowledge Graph Summarization',
    short: 'Extract entities and relationships into a knowledge graph, generate community summaries, and answer global corpus-wide questions.',
    when: 'You need to answer holistic questions across an entire document collection ("What are the top themes and systemic risks across all audit reports?") that traditional vector search cannot answer.',
    flow: [
      { l: 'Document corpus', s: 'blob' },
      { l: 'Graph extraction', s: 'fabric' },
      { l: 'Graph communities', s: 'cosmos' },
      { l: 'Thematic index', s: 'ai-search' },
      { l: 'Global synthesis', s: 'foundry-models' }
    ],
    steps: [
      [0, 'Thousands of enterprise documents, incident reports, or research papers are stored in [[blob]].'],
      [1, 'Batch extraction jobs in [[fabric|Microsoft Fabric]] or [[databricks|Azure Databricks]] use LLMs to extract entities, relationships, and claims.'],
      [2, 'Entity relationships and hierarchical graph communities (Leiden algorithm) are stored in [[cosmos|Cosmos DB]].'],
      [3, 'Pre-generated community summaries describing high-level themes are embedded and indexed into [[ai-search]].'],
      [4, 'User submits a broad global inquiry; [[foundry-models]] aggregates matching community reports to synthesize a comprehensive corpus-level summary with claim citations.']
    ],
    why: [
      'Vector search only retrieves localized text chunks; GraphRAG answers global corpus-level questions.',
      'Hierarchical community summaries allow fast global reasoning without stuffing millions of raw tokens into context.',
      'Claim extraction ties every summarized conclusion back to explicit supporting source evidence.',
      'Pre-computing community summaries shifts expensive reasoning from query time to offline batch time.'
    ],
    fails: [
      'High build-time cost: running LLM entity extraction over millions of chunks can cost thousands of dollars in tokens. Run cost estimation on a subset first.',
      'Graph extraction quality: ambiguous entity names (e.g. acronyms) create fragmented graphs without entity resolution.',
      'Dynamic data lag: incremental updates to a graph require recalculating community summaries, making it unsuitable for rapidly changing data.',
      'Query latency: global queries that synthesize across multiple community levels can exceed 10-20 seconds without prompt caching.'
    ]
  },
  {
    id: 'multimodal-rag', name: 'Multimodal RAG with Document and Vision Intelligence',
    short: 'Ingest and retrieve technical drawings, scanned invoices, audio recordings and charts using multimodal embeddings and models.',
    when: 'Enterprise knowledge is locked in non-textual formats: architectural diagrams, scanned forms, product inspection photos, video guides, or customer service call recordings.',
    flow: [
      { l: 'Mixed media files', s: 'blob' },
      { l: 'Document extraction', s: 'doc-intelligence' },
      { l: 'Vision & speech', s: 'content-understanding' },
      { l: 'Multimodal index', s: 'ai-search' },
      { l: 'Multimodal model', s: 'foundry-models' }
    ],
    steps: [
      [0, 'Scanned PDFs, technical diagrams, MP3 audio calls and product images land in [[blob]] storage.'],
      [1, '[[doc-intelligence|Document Intelligence]] extracts form key-value pairs, tables, and document layout into structured markdown.'],
      [2, '[[content-understanding|Content Understanding]] (or [[ai-vision]] and [[ai-speech]]) generates visual bounding box descriptions, OCR text and audio transcripts.'],
      [3, 'Multimodal vector embeddings and text representations are indexed into [[ai-search]] with vector and metadata filters.'],
      [4, 'User submits an inquiry with text or images; retrieved diagram crops and textual context pass to [[foundry-models|multimodal models (e.g. GPT-4o)]] to generate visual-grounded answers.']
    ],
    why: [
      'Extracting tables and diagrams preserves critical business information lost by plain text extractors.',
      'Cross-modal retrieval lets users query with text to find diagrams, or upload an image to find matching technical manuals.',
      'Foundry Tools handle specialized transcription and OCR at a fraction of the cost of raw LLM token processing.',
      'Multimodal LLMs reason across text and image diagrams simultaneously to resolve complex technical support questions.'
    ],
    fails: [
      'Image resolution degradation: downsampling architectural drawings or blueprints causes the model to misread fine text.',
      'Vector index size: multimodal embeddings can have higher dimensions, increasing vector memory consumption in AI Search.',
      'Inconsistent table formats: complex nested tables can cause extraction errors unless layout models are explicitly tuned.',
      'Token cost of high-resolution images: passing multiple high-res diagram crops rapidly consumes input token budgets.'
    ]
  },
  {
    id: 'secure-multitenant-rag', name: 'Secure Multi-Tenant RAG with Document ACLs',
    short: 'End-to-end identity propagation, document-level security trimming, customer-managed keys and zero data leakage.',
    when: 'You operate a B2B SaaS platform or enterprise intranet where multiple organizations or internal departments share the same RAG pipeline but must strictly isolate sensitive data.',
    flow: [
      { l: 'Entra ID identity', s: 'entra-id' },
      { l: 'Tenant AI gateway', s: 'apim' },
      { l: 'Security trimming', s: 'ai-search' },
      { l: 'Customer keys (CMK)', s: 'key-vault' },
      { l: 'Encrypted tenant data', s: 'blob' },
      { l: 'Isolated generation', s: 'foundry-models' }
    ],
    steps: [
      [0, 'The user authenticates with [[entra-id|Microsoft Entra ID]]; their security token carries tenant ID, user ID and security group claims.'],
      [1, '[[apim|API Management]] validates OAuth2 tokens, enforces per-tenant rate limits, and extracts caller authorization claims.'],
      [2, 'The query to [[ai-search]] includes mandatory server-side security filters matching the user\'s tenant and group permissions, guaranteeing zero cross-tenant leakage.'],
      [3, 'Tenant datasets and search indexes are encrypted using tenant-specific customer-managed keys stored in [[key-vault]].'],
      [4, 'Authorized document source files are accessed from [[blob]] via short-lived user-delegated SAS tokens.'],
      [5, '[[foundry-models]] generates the response with Zero Data Retention (ZCDR) enabled; tenant tokens and usage are logged to [[azure-monitor]] for chargeback.']
    ],
    why: [
      'Document-level security filters trim search results before the model ever sees them, preventing unauthorized data exposure.',
      'Customer-managed keys provide cryptographic isolation for regulated enterprise tenants.',
      'Identity propagation ensures tools and retrieval act strictly on behalf of the user, not a privileged system account.',
      'A shared index with security filtering scales to thousands of tenants without running into search service index limits.'
    ],
    fails: [
      'Client-side filter tampering: if security filters are sent from the frontend rather than injected by the backend gateway, users can bypass them.',
      'Group claim explosion: users in thousands of security groups exceed search query length limits; use pre-resolved group role tokens.',
      'Cache leakage: shared semantic caches return answers generated for Tenant A to Tenant B unless cache keys include tenant and user security context.',
      'Audit failure: lack of user attribution in model gateway logs prevents proving compliance during tenant audits.'
    ]
  },
  {
    id: 'multiagent-orchestration', name: 'Multi-Agent Orchestration Patterns',
    short: 'Supervisor, Handoff, Group Chat, Magentic-One and Human-in-the-Loop workflows with state persistence and audit trails.',
    when: 'Your application automates complex business processes requiring specialized domain agents (research, coding, evaluation, execution) with strict human approval gates.',
    flow: [
      { l: 'Task entrypoint', s: 'apim' },
      { l: 'Orchestrator agent', s: 'foundry-agent-service' },
      { l: 'Worker swarm', s: 'agent-framework' },
      { l: 'Tool microservices', s: 'functions' },
      { l: 'Approval workflow', s: 'logic-apps' },
      { l: 'Distributed trace', s: 'azure-monitor' }
    ],
    steps: [
      [0, 'Business tasks enter through [[apim]], which validates caller tokens and initializes session tracking.'],
      [1, 'The central orchestrator in [[foundry-agent-service|Foundry Agent Service]] evaluates the goal and selects the execution pattern (Supervisor, Handoff, or Magentic-One).'],
      [2, 'Specialized worker agents built with [[agent-framework|Microsoft Agent Framework]] execute parallel sub-tasks (e.g. Data Analyst querying search, Auditor validating rules).'],
      [3, 'Agents execute tools hosted as secure [[functions|Azure Functions]] or MCP servers in [[container-apps]], authenticated with managed identities.'],
      [4, 'For irreversible actions (database writes, payments, email sends), [[logic-apps|Logic Apps]] pauses execution and requests human approval via Microsoft Teams or email.'],
      [5, 'Every message, tool call, latency step and token spend is captured as an OpenTelemetry trace in [[azure-monitor]].']
    ],
    why: [
      'Specialized agents perform significantly better on narrow tasks than one gigantic general-purpose prompt.',
      'Human-in-the-loop gates ensure autonomous agents cannot execute dangerous actions without explicit authorization.',
      'Standardized MCP tool interfaces allow sharing tools across different agent frameworks and teams.',
      'Distributed tracing makes non-deterministic multi-agent failures debuggable and reproducible.'
    ],
    fails: [
      'Chat loops: two agents endlessly exchanging clarifications until token limits are reached. Always enforce maximum iteration limits.',
      'Context degradation: accumulating raw conversational history across 10+ agent turns degrades reasoning; summarize context between handoffs.',
      'Tool authorization bypass: worker agents executing actions without verifying the calling user\'s permissions.',
      'State corruption: crash during multi-turn orchestration without checkpointing causes lost task state.'
    ]
  },
  {
    id: 'genaiops-lifecycle', name: 'GenAIOps and Continuous Evaluation Pipeline',
    short: 'End-to-end prompt versioning, automated regression gates, model promotion, canary deployment and production quality monitoring.',
    when: 'You are moving generative AI from prototype to production and need reproducible release processes, automated quality testing on every PR, and continuous drift monitoring.',
    flow: [
      { l: 'Prompt & code repo', s: 'azure-devops' },
      { l: 'Automated evals', s: 'foundry' },
      { l: 'Model registry', s: 'aml-workspace' },
      { l: 'Canary endpoint', s: 'aml-endpoints' },
      { l: 'Online telemetry', s: 'azure-monitor' }
    ],
    steps: [
      [0, 'Prompts, evaluation datasets, and orchestration code are version-controlled in Git via [[azure-devops|Azure DevOps or GitHub Actions]].'],
      [1, 'Every pull request triggers automated evaluations in [[foundry]], measuring groundedness, relevance, coherence, and safety against golden datasets.'],
      [2, 'Passing models and prompt configurations are registered in the [[aml-workspace|Azure ML Model Registry]] with full data lineage and commit hashes.'],
      [3, 'Release pipelines deploy candidate models to [[aml-endpoints]] or [[foundry-models]] with 10% canary traffic behind [[apim]].'],
      [4, 'Continuous online telemetry and user feedback stream to [[azure-monitor]], triggering automated rollbacks if quality scores regress.']
    ],
    why: [
      'Automated evaluation gates prevent subtle prompt edits from causing severe downstream quality regressions.',
      'Canary rollouts allow testing candidate models on live traffic with zero risk of total system failure.',
      'Full versioning of prompts, datasets, and models satisfies enterprise compliance and auditability requirements.',
      'Continuous monitoring detects data drift and model behavior changes before customers complain.'
    ],
    fails: [
      'Subjective evaluation: relying on manual spot-checks instead of automated statistical evaluation sets.',
      'Stale golden datasets: test sets that do not reflect evolving production queries give false confidence.',
      'Long-running CI pipelines: evaluating 10,000 cases on every commit slows development; use tiered evaluation (fast sanity on PR, deep sweep on merge).',
      'Unmonitored production drift: model providers updating underlying weights silently degrade prompt performance unless continuous evaluation is active.'
    ]
  }
];

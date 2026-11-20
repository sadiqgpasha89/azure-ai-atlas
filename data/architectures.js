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
      [4, 'User submits an inquiry with text or images; retrieved diagram crops and textual context pass to [[foundry-models|multimodal models (a vision-capable deployment)]] to generate visual-grounded answers.']
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
  },
  {
    id: 'voice-ai', name: 'Real-Time Voice and Conversational Speech AI',
    short: 'Sub-second real-time speech-to-speech interaction using Speech Services, WebSockets and low-latency LLM streaming.',
    when: 'Building voice agents, call center copilots, or hands-free conversational assistants requiring TTFT under 800ms and natural barge-in.',
    flow: [
      { l: 'Audio client', s: 'container-apps' },
      { l: 'Speech-to-text', s: 'ai-speech' },
      { l: 'Streaming LLM', s: 'foundry-models' },
      { l: 'Text-to-speech', s: 'ai-speech' },
      { l: 'Audio playback', s: 'container-apps' },
      { l: 'Voice telemetry', s: 'azure-monitor' }
    ],
    steps: [
      [0, 'Audio client establishes a persistent low-latency WebSocket connection to [[container-apps]].'],
      [1, 'Audio chunks stream to [[ai-speech]] for real-time speech-to-text with partial phrase recognition.'],
      [2, 'Recognized text streams immediately into [[foundry-models]] with server-sent events for sub-second first-token generation.'],
      [3, 'Tokens stream sentence by sentence back to [[ai-speech]] neural text-to-speech synthesis with expressive voices.'],
      [4, 'Synthesized audio frames are pushed back through [[container-apps]] to the client with client-side barge-in cancellation.'],
      [5, 'Audio latency, word error rates, and user sentiment are tracked in [[azure-monitor]].']
    ],
    why: [
      'Streaming tokens sentence-by-sentence allows audio synthesis to start before the full model response finishes, keeping perceived latency under 800ms.',
      'Neural voice synthesis with custom enterprise voices maintains brand consistency across customer interactions.',
      'WebSockets on Container Apps scale from zero to thousands of concurrent audio streams seamlessly.',
      'Integrated barge-in detection cancels in-flight LLM token generation the instant the user speaks again.'
    ],
    fails: [
      'Buffering whole responses: waiting for the full LLM completion before starting text-to-speech causes multi-second pauses that destroy conversational flow.',
      'Jitter buffer starvation: fluctuating mobile networks causing audible audio dropouts unless an adaptive jitter buffer is configured.',
      'Token limit overrun: long voice conversations exhausting model context window without periodic conversation summarization.',
      'Missing cancellation: audio keeps playing after the user interrupts, leading to a frustrating user experience.'
    ]
  },
  {
    id: 'computer-vision', name: 'Multimodal Vision and Visual Inspection Pipeline',
    short: 'Automated defect detection, asset inspection and image reasoning combining Azure AI Vision and Foundry multimodal models.',
    when: 'Processing enterprise imagery, satellite photos, medical imaging or manufacturing scans with visual reasoning.',
    flow: [
      { l: 'Camera & files', s: 'blob' },
      { l: 'Edge preprocessing', s: 'container-apps' },
      { l: 'Vision features', s: 'ai-vision' },
      { l: 'Multimodal model', s: 'foundry-models' },
      { l: 'Event dispatch', s: 'event-grid' },
      { l: 'Audit telemetry', s: 'azure-monitor' }
    ],
    steps: [
      [0, 'Raw inspection images and video clips land in [[blob]] storage with lifecycle tiering.'],
      [1, 'Worker containers in [[container-apps]] resize images, crop regions of interest, and normalize pixel values.'],
      [2, 'Specialized visual features, dense image captions, and bounding boxes are extracted via [[ai-vision]].'],
      [3, 'High-resolution images and visual prompts are passed to [[foundry-models|multimodal models]] for complex anomaly reasoning and defect diagnosis.'],
      [4, 'Detection results and alerts are published to [[event-grid]] for immediate downstream business action.'],
      [5, 'Model confidence scores, processing times, and detection false-positive rates are logged to [[azure-monitor]].']
    ],
    why: [
      'Specialized vision models handle fast filtering while multimodal LLMs provide nuanced reasoning on edge cases.',
      'Blob storage provides cost-effective durability for millions of high-resolution images.',
      'Container Apps scales image processing workers based on incoming queue depth.',
      'Event Grid enables decoupled real-time alerts across manufacturing and inspection systems.'
    ],
    fails: [
      'Sending uncompressed full-resolution raw files to multimodal LLMs, causing severe latency and token budget exhaustion.',
      'Ignoring lighting variations: models trained in bright settings failing in dimly lit factory conditions.',
      'Missing bounding box coordinates when alerting human operators to defect locations.',
      'Unbounded image retention inflating storage bills without automated lifecycle archival.'
    ]
  },
  {
    id: 'ai-workflow-automation', name: 'Event-Driven AI Business Workflow Automation',
    short: 'Asynchronous event-driven document triage, ticketing resolution and ERP integration with human fallback.',
    when: 'Automating high-volume business workflows (invoices, support claims, compliance audits) that cross SAP, Salesforce, or ServiceNow.',
    flow: [
      { l: 'Business event', s: 'event-grid' },
      { l: 'Message buffer', s: 'service-bus' },
      { l: 'Orchestrator', s: 'logic-apps' },
      { l: 'AI reasoning', s: 'foundry-models' },
      { l: 'Durable state', s: 'cosmos' },
      { l: 'Audit trail', s: 'azure-monitor' }
    ],
    steps: [
      [0, 'Business events from ERP, CRM, or document uploads trigger [[event-grid]].'],
      [1, 'Messages are buffered in [[service-bus]] queues with dead-lettering to guarantee at-least-once delivery.'],
      [2, '[[logic-apps|Logic Apps]] orchestrates the multi-step workflow, manages retries, and coordinates human review approvals.'],
      [3, 'Document classification, extraction, and decision recommendations are performed by [[foundry-models]].'],
      [4, 'Workflow checkpoints, transaction logs, and execution states are persisted in [[cosmos|Cosmos DB]].'],
      [5, 'End-to-end processing metrics and compliance audit logs are tracked in [[azure-monitor]].']
    ],
    why: [
      'Service Bus buffering guarantees no business events are lost during peak traffic or downstream outages.',
      'Logic Apps provides hundreds of pre-built enterprise connectors (SAP, Salesforce, Dynamics) with visual workflow governance.',
      'Cosmos DB provides low-latency multi-region state checkpoints for long-running business workflows.',
      'Clear separation between deterministic workflow logic and generative AI extraction keeps systems auditable.'
    ],
    fails: [
      'Direct synchronous invocation without queuing: downstream AI throttles drop transactions during traffic spikes.',
      'Unbounded retries on non-transient schema errors wasting tokens and stalling queues.',
      'Missing dead-letter queue alerting allowing failed business documents to languish silently.',
      'Inadequate state checkpointing causing workflow restart from step 1 after temporary network blips.'
    ]
  },
  {
    id: 'ai-batch-processing', name: 'High-Throughput Global Batch AI Inference',
    short: 'Cost-optimized asynchronous batch processing for millions of customer records, translations or embeddings at 50% discount.',
    when: 'Processing non-real-time workloads (nightly backfills, catalog summarization, compliance scans) with huge cost savings.',
    flow: [
      { l: 'Input dataset', s: 'adls' },
      { l: 'Pipeline job', s: 'aml-pipelines' },
      { l: 'Batch endpoint', s: 'aml-endpoints' },
      { l: 'GPU compute', s: 'gpu-vms' },
      { l: 'Output sink', s: 'blob' },
      { l: 'Cost tracker', s: 'cost-management' }
    ],
    steps: [
      [0, 'Large partitioned datasets (millions of records or documents) are stored in [[adls|ADLS Gen2]].'],
      [1, '[[aml-pipelines|Azure ML Pipelines]] schedules batch jobs, validates data schemas, and chunks work items.'],
      [2, 'Work items are dispatched to [[aml-endpoints|Batch Endpoints]] or the Azure OpenAI Global Batch API.'],
      [3, 'Jobs execute across autoscale pools of [[gpu-vms]] or serverless batch compute with zero idle cost.'],
      [4, 'Enriched results, embeddings, and summaries are written to [[blob]] in Parquet format.'],
      [5, 'Batch job unit economics and token usage are monitored in [[cost-management]].']
    ],
    why: [
      'Global Batch APIs and off-peak compute provide up to 50% cost discounts compared to real-time interactive endpoints.',
      'Independent partition execution allows processing millions of records in parallel without hitting real-time rate limits.',
      'Compute clusters scale to zero when no batch jobs are queued, eliminating idle infrastructure spend.',
      'Automated retry and checkpointing ensure individual node failures do not restart the entire batch job.'
    ],
    fails: [
      'Using real-time interactive endpoints for offline workloads, paying 2x unnecessary cost and risking 429 throttling.',
      'Single monolithic batch partitions that fail completely if one record causes an out-of-memory error.',
      'Failing to monitor batch queue duration, causing SLA breaches on overnight reporting pipelines.',
      'Leaving high-memory GPU compute clusters idle between scheduled batch runs.'
    ]
  },
  {
    id: 'predictive-ml', name: 'Enterprise Predictive ML and Continuous MLOps',
    short: 'Classical ML training, automated feature engineering, model registry, online inference and automated data drift retraining.',
    when: 'Predicting numerical outcomes (churn, fraud, demand forecast, risk scoring) where tabular data and deterministic statistical models outperform LLMs.',
    flow: [
      { l: 'Feature data', s: 'fabric' },
      { l: 'Feature store', s: 'aml-feature-store' },
      { l: 'Model training', s: 'aml-training' },
      { l: 'Model registry', s: 'aml-workspace' },
      { l: 'Real-time endpoint', s: 'aml-endpoints' },
      { l: 'Drift monitor', s: 'aml-monitoring' }
    ],
    steps: [
      [0, 'Raw operational records and historical transactions are transformed in [[fabric|Microsoft Fabric]].'],
      [1, 'Curated features are published to [[aml-feature-store|Azure ML Feature Store]] to prevent train-serve skew.'],
      [2, 'Automated ML and custom gradient boosting models are trained and tuned using [[aml-training]].'],
      [3, 'Candidate models with evaluation metrics and environment dependencies are registered in [[aml-workspace]].'],
      [4, 'Approved models are deployed to managed [[aml-endpoints]] with auto-scaling and blue/green traffic splitting.'],
      [5, 'Data drift, prediction drift, and feature attribution shifts are tracked continuously by [[aml-monitoring]].']
    ],
    why: [
      'Statistical and gradient-boosted ML models provide superior accuracy, sub-10ms latency, and negligible inference cost for tabular data.',
      'A centralized feature store guarantees that feature transformations in production match training features identically.',
      'Managed online endpoints provide automated blue/green canary rollouts with zero downtime.',
      'Drift monitoring detects covariate shift and triggers automated retraining before model accuracy decays in production.'
    ],
    fails: [
      'Train-serve skew: computing features differently in Python training notebooks than in production streaming APIs.',
      'Attempting to use an expensive LLM for tabular numerical prediction where XGBoost or LightGBM is 100x faster and cheaper.',
      'Deploying without drift detection, leading to silent degradation as consumer habits or market conditions change.',
      'Lack of reproducible conda environment definitions causing deployment failures on endpoint updates.'
    ]
  },
  {
    id: 'ai-decision-support', name: 'Executive Decision Support & Causal Analytics',
    short: 'Combining analytical Lakehouse data, causal machine learning, and natural language synthesis for C-suite decision support.',
    when: 'Translating complex enterprise data warehouses into actionable executive intelligence with scenario modeling and uncertainty intervals.',
    flow: [
      { l: 'Lakehouse data', s: 'databricks' },
      { l: 'Curated store', s: 'cosmos' },
      { l: 'Reasoning agent', s: 'agent-framework' },
      { l: 'Foundry models', s: 'foundry-models' },
      { l: 'Data governance', s: 'purview' },
      { l: 'Executive UI', s: 'app-service' }
    ],
    steps: [
      [0, 'Enterprise financial, supply chain, and customer data are aggregated in [[databricks]] Delta tables.'],
      [1, 'Materialized KPIs and scenario projections are synchronized into [[cosmos|Cosmos DB]] for sub-10ms queries.'],
      [2, 'A decision-support agent built with [[agent-framework|Microsoft Agent Framework]] receives executive queries and formulates analytical query plans.'],
      [3, 'The agent queries analytical models, calculates confidence intervals, and synthesizes strategic narratives via [[foundry-models]].'],
      [4, 'Data classification, lineage, and sensitivity labels are governed by [[purview]].'],
      [5, 'Interactive scenario dashboards and natural language answers are served securely via [[app-service]].']
    ],
    why: [
      'Combines deterministic SQL and statistical modeling with natural language reasoning to eliminate hallucinations in business metrics.',
      'Executive decision-makers can interrogate complex multi-table lakehouses through conversational dialogue.',
      'Purview governance guarantees sensitive financial data and executive summaries conform to access controls.',
      'Cosmos DB caching allows instant interactive response for recurring executive queries and dashboards.'
    ],
    fails: [
      'Allowing LLMs to calculate mathematical totals directly instead of delegating math to SQL or code interpreter tools.',
      'Missing confidence intervals: presenting statistical forecasts as certainties without uncertainty boundaries.',
      'Lack of schema documentation causing the agent to query obsolete columns or misunderstood business metrics.',
      'Missing lineage: inability to show executive auditors the exact raw data rows underlying a generated recommendation.'
    ]
  },
  {
    id: 'enterprise-search', name: 'Enterprise AI Search with Integrated Vectorization',
    short: 'Unified hybrid search over SharePoint, Blob, and SQL with chunking, custom skillsets, semantic ranker and zero-trust ACLs.',
    when: 'Building organization-wide knowledge discovery across disparate silos with automated indexing schedules.',
    flow: [
      { l: 'Data sources', s: 'blob' },
      { l: 'Doc extraction', s: 'doc-intelligence' },
      { l: 'Search indexer', s: 'ai-search' },
      { l: 'Semantic ranker', s: 'ai-search' },
      { l: 'Governance', s: 'purview' },
      { l: 'Search gateway', s: 'apim' }
    ],
    steps: [
      [0, 'Internal corporate repositories, documentation, and policies reside in [[blob]] and file storage.'],
      [1, '[[doc-intelligence|Document Intelligence]] extracts structured layouts, tabular grids, and text from complex PDFs.'],
      [2, 'Integrated vectorization in [[ai-search]] generates dense embeddings and maintains the search index automatically.'],
      [3, 'Incoming user queries run hybrid search (BM25 + vectors) reranked by the [[ai-search|Semantic Ranker]] for maximum relevance.'],
      [4, 'Data discovery, sensitivity labeling, and access policies are maintained through [[purview]].'],
      [5, 'Enterprise client applications query the search index through [[apim]] with rate limiting and telemetry.']
    ],
    why: [
      'Integrated vectorization eliminates custom embedding pipeline code by generating embeddings directly inside the search indexer.',
      'Layout-aware document cracking preserves table structures and reading order across complex enterprise documents.',
      'Hybrid search with semantic reranking delivers superior NDCG relevance across both domain jargon and semantic queries.',
      'API Management provides centralized monitoring, token quotas, and security policy enforcement for search consumers.'
    ],
    fails: [
      'Relying solely on keyword search for semantic queries or solely on vector search for exact product codes and acronyms.',
      'Indexing raw OCR text without table reconstruction, resulting in jumbled numbers and lost row associations.',
      'Ignoring index partition limits: vector dimensions and document counts exceeding single-partition capacity.',
      'Missing security trimming filters allowing employees to retrieve confidential HR or executive documents.'
    ]
  }
];

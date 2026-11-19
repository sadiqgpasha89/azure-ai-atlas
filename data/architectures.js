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
  }
];

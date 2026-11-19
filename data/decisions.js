/* Decision guides for engineering managers and principal engineers.
   Schema per decision:
   id, theme ('strategy'|'architecture'|'risk'), lead ('em'|'pe'|'both'), title, question,
   door ('two-way'|'one-way'|'mixed'), doorNote, why, cols, rows, rules:[[if, then]], redflags:[], ask:[], revisit, related:[service ids],
   em: { call, own:[], evidence:[] }   // the engineering manager lens
   pe: { call, own:[], evidence:[] }   // the principal engineer lens
   Text supports `code`, **bold**, [[service-id|label]]. */
window.ATLAS.decisionThemes = [
  { id: 'strategy', name: 'Strategy & scope', blurb: 'Decide what to build, how autonomous it should be, and how to improve it. These are the decisions that set the budget and the team.' },
  { id: 'architecture', name: 'Architecture', blurb: 'Where models run, how agents are hosted, how retrieval works, and how the system copes with load and capacity.' },
  { id: 'risk', name: 'Risk, quality & cost', blurb: 'How you will know it works, how much you trust it to act, what it costs to run, and how tenants stay apart.' }
];

window.ATLAS.decisions = [
  /* ---------------- STRATEGY ---------------- */
  {
    id: 'build-buy-customize', theme: 'strategy', lead: 'em', title: 'Build, buy or customise?',
    question: 'How much of this should we build ourselves, and how much should we adopt?',
    door: 'mixed', doorNote: 'Two-way at the start. It becomes one-way once your data, workflows and people depend on the choice.',
    why: 'Every AI feature has a build cost and a run cost, and the second is the one teams under-estimate. The wrong level of build also locks in headcount: a self-managed GPU stack needs people on call for it.',
    cols: ['Path', 'First value in', 'You own', 'Fits when', 'Main risk'],
    rows: [
      ['Adopt a finished product ([[m365-copilot|Microsoft 365 Copilot, GitHub Copilot]])', 'Days', 'Rollout, permissions hygiene, training', 'Commodity needs: drafting, meeting summaries, developer productivity', 'Capability ceiling; per-seat cost; unused licences'],
      ['Low-code agents ([[copilot-studio|Copilot Studio]])', 'Days to weeks', 'Agent design, knowledge sources, governance', 'Business-owned use case over Microsoft 365 data', 'Maker sprawl; credit consumption; low-code limits'],
      ['Managed blocks ([[foundry-models|Foundry Models]] + [[ai-search|AI Search]] + [[foundry-agent-service|Agent Service]])', 'Weeks', 'Prompts, data, evals, application glue', 'A differentiated feature built on standard patterns', 'Quotas and the limits of the abstraction'],
      ['Code-first on a managed runtime ([[agent-framework|Agent Framework]] on hosted agents or [[container-apps]])', 'Weeks to a few months', 'Agent logic, tools, memory strategy', 'Bespoke control flow, multi-agent designs, any model', 'You own agent quality and its operations'],
      ['Own the model ([[aml-training|Azure Machine Learning]])', 'Months', 'Models, features, pipelines, monitoring', 'Proprietary data is the advantage; predictive models', 'MLOps burden; scarce specialist talent'],
      ['Self-managed on [[aks|AKS]] with [[gpu-vms|GPU VMs]]', 'Months or more', 'Everything, including GPU capacity', 'Extreme scale or cost pressure, strict locality, custom serving', 'Operations load; GPU supply risk']
    ],
    rules: [
      ['The capability is not a differentiator for us', 'Buy. Put the effort into rollout and data quality.'],
      ['A business team owns it and the data is in Microsoft 365', 'Start in Copilot Studio; move to code only when you hit a measured limit.'],
      ['It is differentiating and a standard pattern (RAG, tool use) covers it', 'Managed blocks. Spend your time on evals and domain data.'],
      ['The control flow is bespoke, or tools live in your own services', 'Code-first on a managed runtime, still without owning servers.'],
      ['You have a proven data advantage and a trained model beats prompting on your evals', 'Own the model on Azure Machine Learning. Not before.'],
      ['You need locality, unit cost or latency that managed services cannot meet', 'Self-managed, with a named owner for GPU capacity.']
    ],
    redflags: [
      'Fine-tuning is proposed before anyone has measured a prompt-plus-retrieval baseline.',
      'A "platform" is being built before the first use case is in production.',
      'The build-or-buy case rests on demo quality rather than on an eval set.',
      'Run cost and on-call burden are missing from the comparison.',
      'There is no exit path if the model or vendor changes in twelve months.'
    ],
    ask: [
      'Which part of this is our differentiator, and which part is plumbing?',
      'What does it cost per task at the volume we expect in a year, and who pays for it?',
      'Who is on call for it, and what do they do at 3 a.m.?',
      'If we had to swap the model or vendor next year, what would break?'
    ],
    revisit: 'Each quarter, when volume grows tenfold, or when a managed option adds the capability you built.',
    related: ['m365-copilot', 'copilot-studio', 'foundry', 'agent-framework', 'aml-training', 'aks'],
    em: {
      call: 'Default to the highest managed level that passes the eval. Fund a build only for a named differentiator.',
      own: ['Headcount and on-call load the chosen path implies.', 'The run-cost budget and who pays for it.', 'The exit plan if a vendor or model changes.'],
      evidence: ['A one-page comparison that includes run cost and operations, not just build time.', 'A baseline eval score for the simplest managed option.', 'A named owner for quality, for cost and for on-call.']
    },
    pe: {
      call: 'Prove the managed baseline first, then spend engineering effort only where the eval shows a gap.',
      own: ['The seams: keep model, retrieval and tools behind interfaces so any layer can be swapped.', 'The technical argument for any step down to a lower, more manual level.'],
      evidence: ['Prompt-plus-retrieval baseline results on the real eval set.', 'The interface boundary that makes model and vendor swap a configuration change.']
    }
  },
  {
    id: 'autonomy-level', theme: 'strategy', lead: 'both', title: 'How autonomous should it be?',
    question: 'Is this a single model call, a fixed workflow, or an agent that decides its own steps?',
    door: 'two-way', doorNote: 'Easy to move up a level later if tools sit behind clean interfaces. Hard to move down once users expect autonomy.',
    why: 'Autonomy multiplies cost, latency and the ways things go wrong. Most business problems have a known path, and a workflow with LLM steps is cheaper, faster and easier to test than an agent that rediscovers the path every time.',
    cols: ['Level', 'Pattern', 'Predictability', 'Azure building blocks', 'Cost of a failure'],
    rows: [
      ['0. Single call', 'One prompt in, one answer out (classify, summarise, extract)', 'High', '[[foundry-models]], [[functions]]', 'Low: a wrong answer'],
      ['1. Grounded answer', 'Retrieve, then generate (RAG)', 'High', '[[ai-search|AI Search]] knowledge bases, [[foundry-models]]', 'Low to medium: a confident wrong answer'],
      ['2. Workflow with LLM steps', 'A fixed path where models handle individual steps', 'High', '[[durable-functions]], [[logic-apps]], [[foundry-models]]', 'Medium: bounded by the path'],
      ['3. Agent, human approves writes', 'Model chooses tools; a person approves anything that changes state', 'Medium', '[[foundry-agent-service]] or [[agent-framework]], approval via [[logic-apps]]', 'Medium: caught at approval'],
      ['4. Agent acts within limits', 'Autonomous with scoped identity, spend caps, reversible actions', 'Lower', '[[agent-framework]], [[entra-id]], [[apim]] token limits', 'High: acts before anyone looks'],
      ['5. Multi-agent, open-ended', 'Agents delegate to other agents with little fixed structure', 'Lowest', '[[agent-framework]] orchestrations, [[foundry-agent-service]]', 'Highest: compounding errors']
    ],
    rules: [
      ['The steps are known in advance', 'Use a workflow (level 2). Models handle the fuzzy steps only.'],
      ['The task needs lookup but no actions', 'Level 1. Add tools later, after retrieval quality is measured.'],
      ['Actions change money, records or customers', 'Level 3: a person approves every write until measured accuracy justifies less.'],
      ['Accuracy on your eval is high and every action is reversible and capped', 'Level 4 may be justified, with spend and action-count caps.'],
      ['A single agent with good tools is not enough, and you can show why on evals', 'Consider multi-agent. Otherwise stay with one agent plus a workflow.']
    ],
    redflags: [
      '"Agent" is chosen because it is the fashionable word, not because the path is unknown.',
      'Multi-agent designs are proposed before a single agent has been evaluated.',
      'Write access is granted to a shared service identity instead of the user\'s.',
      'No cap on steps, tokens or wall-clock time per run.',
      'Nobody can state what the worst action the agent can take is.'
    ],
    ask: [
      'Could a fixed workflow do this? What is the evidence it cannot?',
      'What is the worst thing this agent can do, and what stops it?',
      'Which actions are reversible, and which are not?',
      'How do we step the autonomy back down if quality drops?'
    ],
    revisit: 'When measured accuracy on actions changes, after any incident, or when a new tool with side effects is added.',
    related: ['foundry-agent-service', 'agent-framework', 'durable-functions', 'logic-apps', 'entra-id', 'apim'],
    em: {
      call: 'Approve the lowest level that solves the problem. Raise it one step at a time, backed by eval numbers.',
      own: ['The risk appetite: which actions may ever be automatic.', 'The stop rule: what quality drop makes us step autonomy back down.'],
      evidence: ['A written worst-case action and its control.', 'Measured action accuracy before any approval is removed.']
    },
    pe: {
      call: 'Put deterministic structure around the model. Let the model decide only what code cannot.',
      own: ['Tool design: narrow, typed, validated server-side, least privilege.', 'Caps on steps, tokens and time, and the loop-detection logic.'],
      evidence: ['Tool-selection accuracy measured separately from answer quality.', 'Injection tests through retrieved text and tool output.']
    }
  },
  {
    id: 'improve-model', theme: 'strategy', lead: 'pe', title: 'How do we make it better at our task?',
    question: 'Quality is not good enough. Do we change the prompt, the retrieval, the model, or the weights?',
    door: 'two-way', doorNote: 'Prompt, retrieval and routing changes are cheap to undo. Fine-tuning creates a model you must maintain, retest on each base-model change, and host.',
    why: 'Teams jump to fine-tuning because it feels like real engineering. Most quality problems are in retrieval, instructions or the data, and each lever has a very different cost to try and to keep.',
    cols: ['Lever', 'Effort to try', 'Fixes', 'Cost to maintain', 'Try it when'],
    rows: [
      ['Better instructions and examples', 'Hours', 'Format, tone, missing rules', 'Low', 'Always first'],
      ['Better retrieval ([[ai-search|chunking, hybrid search, reranking, agentic retrieval]])', 'Days', 'Missing or wrong facts', 'Medium: index and pipeline upkeep', 'Answers are wrong because the right passage is not found'],
      ['A stronger or newer model ([[foundry-models]])', 'Days', 'Reasoning, long context, tool use', 'Low to medium: higher token price', 'Errors persist after instructions and retrieval are good'],
      ['Task decomposition or workflow', 'Days to weeks', 'Complex multi-step tasks', 'Medium', 'One prompt tries to do too much'],
      ['Fine-tuning a model ([[aml-training|Azure ML or Foundry fine-tuning]])', 'Weeks', 'Style, narrow classification, latency and cost via a smaller model', 'High: data upkeep, retesting, hosting or deployment limits', 'You have thousands of clean examples and a measured gap'],
      ['Train or adapt your own model ([[aml-training]])', 'Months', 'Capability the base models lack', 'Highest', 'Proprietary data is the advantage and cheaper levers are exhausted']
    ],
    rules: [
      ['Output is the wrong shape or tone', 'Fix instructions and add examples.'],
      ['The answer is wrong because facts are missing or stale', 'Fix retrieval before touching the model.'],
      ['The task needs several reasoning steps', 'Split it into a workflow with evaluated steps.'],
      ['A cheaper model needs to match a stronger one on a narrow task', 'Consider fine-tuning or distilling, after the eval set exists.'],
      ['You cannot say what is failing', 'Stop. Build the eval and error taxonomy first.']
    ],
    redflags: [
      'Fine-tuning is requested to inject knowledge. Tuning teaches style and behaviour; retrieval supplies facts.',
      'Nobody has read a sample of the failures before choosing a lever.',
      'Training data was written by the model it is meant to improve, without review.',
      'No plan exists for retesting when the base model version changes.',
      'Improvements are claimed from a handful of hand-picked examples.'
    ],
    ask: [
      'What are the top three failure categories, and how often does each occur?',
      'What is the baseline score with only the prompt and retrieval fixed?',
      'If we fine-tune, who owns the dataset and the retraining schedule?',
      'What happens to this model when the base model is retired?'
    ],
    revisit: 'When the base model changes, when failure categories shift, or when data volume doubles.',
    related: ['ai-search', 'foundry-models', 'aml-training', 'foundry'],
    em: {
      call: 'Do not fund fine-tuning without an error analysis and a written maintenance owner.',
      own: ['Whether the cost of maintaining a custom model is justified by the measured gain.', 'Staffing for dataset curation if tuning is approved.'],
      evidence: ['The failure taxonomy with counts.', 'A baseline-versus-candidate comparison on the same eval set.']
    },
    pe: {
      call: 'Work the cheap levers in order: instructions, retrieval, model, workflow, then weights.',
      own: ['The error analysis and the eval set that decide the lever.', 'The retest plan across base-model upgrades and retirements.'],
      evidence: ['Retrieval recall at k measured separately from answer quality.', 'Per-lever deltas on a held-out set, not a demo.']
    }
  },

  /* ---------------- ARCHITECTURE ---------------- */
  {
    id: 'where-model-runs', theme: 'architecture', lead: 'pe', title: 'Where should the model run?',
    question: 'Which deployment type, or hosting platform, should serve the model?',
    door: 'mixed', doorNote: 'Moving between Foundry deployment types is a configuration change. Moving to self-hosted GPUs is a platform commitment that is expensive to reverse.',
    why: 'The deployment type decides where prompts are processed, what throughput and latency you get, and who carries the operations. Data-residency rules can limit which options are allowed, and new models may arrive later on the more restricted types.',
    cols: ['Option', 'Data processing', 'Throughput and latency', 'Ops burden', 'Fits when'],
    rows: [
      ['[[foundry-models|Global Standard]] (pay per token)', 'Any Azure Region', 'Highest quota; latency varies under load', 'None', 'General workloads, newest models first'],
      ['[[foundry-models|Data Zone Standard]]', 'Within the US or EU data zone', 'Good quota; latency varies', 'None', 'Residency within a zone is required'],
      ['[[foundry-models|Regional Standard]]', 'Within one Region', 'Lower quota; latency varies', 'None', 'Strict single-Region residency, modest volume'],
      ['[[foundry-models|Provisioned (PTU)]]: Global, Data Zone or Regional', 'Per the chosen type', 'Reserved throughput, steadier latency', 'Capacity sizing', 'High, steady volume or tight latency targets'],
      ['[[foundry-models|Batch]]: Global or Data Zone', 'Per the chosen type', 'Asynchronous, about a day, discounted', 'Job handling', 'Offline work that can wait'],
      ['[[aml-endpoints|Managed online endpoints]] (open weights, custom models)', 'Your Region', 'You size VMs and replicas', 'Medium', 'A model the catalogue does not serve as a service'],
      ['[[aks|AKS]] on [[gpu-vms|GPU VMs]]', 'Your network', 'You tune everything', 'High', 'Extreme scale, cost control or locality']
    ],
    rules: [
      ['No residency constraint and volume is moderate', 'Global Standard. It is the default for a reason.'],
      ['Prompts must stay within the EU or US zone', 'Data Zone Standard or Provisioned in a Region of that zone.'],
      ['Traffic is high and steady and latency variance hurts users', 'Provisioned, sized from real traffic, with pay-per-token spillover.'],
      ['The work can wait for hours', 'Batch, at a discount.'],
      ['You need a model that is not offered as a service, or a customised one', 'Managed online endpoints before self-managed AKS.']
    ],
    redflags: [
      'Residency was assumed rather than checked against the actual deployment type and what applies to data at rest.',
      'Provisioned capacity was bought from a guess instead of measured request and token profiles.',
      'Self-hosting is justified by cost without counting people, idle GPUs and on-call.',
      'The newest model is required, but only a delayed deployment type satisfies residency.',
      'There is no tested path to a second deployment or Region.'
    ],
    ask: [
      'What does our data-residency rule actually require, and which deployment types satisfy it?',
      'What are peak and average requests per minute and tokens per request?',
      'At what volume does provisioned capacity beat pay-per-token for us?',
      'Who carries the pager if we host the model ourselves?'
    ],
    revisit: 'When volume doubles, when residency rules change, when a new deployment type or model arrives, or when a model is retired.',
    related: ['foundry-models', 'aml-endpoints', 'aks', 'gpu-vms', 'quotas', 'apim'],
    em: {
      call: 'Approve self-hosting only with a named capacity owner and a measured cost case against provisioned capacity.',
      own: ['The cost and on-call implications of each hosting option.', 'Sign-off with compliance on residency before launch.'],
      evidence: ['A volume forecast with a pay-per-token versus provisioned comparison.', 'Compliance sign-off naming the deployment type.']
    },
    pe: {
      call: 'Start on Global Standard behind a gateway. Move to Data Zone, Provisioned or self-hosted only on evidence.',
      own: ['The traffic profile and the sizing method for provisioned capacity.', 'The abstraction that lets a model move between deployments without code changes.'],
      evidence: ['Load-test results including time to first token and tail latency.', 'A failover test to a second deployment.']
    }
  },
  {
    id: 'agent-runtime', theme: 'architecture', lead: 'pe', title: 'How do we host the agent?',
    question: 'Which runtime runs the agent loop, tools and state?',
    door: 'mixed', doorNote: 'Tools and prompts port easily if they sit behind clean interfaces. State, identity and tracing integrations are the sticky parts.',
    why: 'The runtime decides who operates the agent loop, where conversation state lives, how tools authenticate and what you can see when a run goes wrong.',
    cols: ['Option', 'You own', 'Control', 'Scales to zero', 'Fits when'],
    rows: [
      ['[[foundry-agent-service|Foundry Agent Service]] prompt or workflow agents', 'Instructions, tools, evals', 'Medium', 'Managed', 'A small team that wants the least to operate'],
      ['[[foundry-agent-service|Foundry hosted agents]] with [[agent-framework]]', 'Agent code and tests', 'High', 'Managed', 'Code-first logic without owning servers'],
      ['[[agent-framework|Agent Framework]] on [[container-apps]]', 'Code, scaling, state, tracing', 'High', 'Yes', 'You need custom hosting, networking or sessions'],
      ['[[agent-framework|Agent Framework]] on [[aks]]', 'Everything above plus the cluster', 'Highest', 'No', 'You already run Kubernetes and need cluster-level control'],
      ['[[copilot-studio|Copilot Studio]]', 'Agent design, governance', 'Low to medium', 'Managed', 'Business-owned agents over Microsoft 365'],
      ['[[durable-functions|Durable Functions]] with model calls', 'Workflow code', 'High', 'Yes', 'A fixed, code-first workflow with LLM steps']
    ],
    rules: [
      ['Small team, standard tool patterns', 'Foundry Agent Service. Fewest parts to run.'],
      ['Bespoke control flow or multi-agent patterns', 'Agent Framework, hosted by Foundry or on Container Apps.'],
      ['You need cluster-level networking, GPUs next door or strict isolation', 'AKS, accepting the operations load.'],
      ['Business owners build and maintain it', 'Copilot Studio with governance, and a path to code.'],
      ['The path is fixed', 'A workflow, not an agent runtime.']
    ],
    redflags: [
      'The framework was chosen from a demo, with no view of tracing, identity or state.',
      'Agent state lives only in process memory.',
      'Tools run under one shared administrator identity.',
      'No way to replay a run to find out why it failed.',
      'Several agent frameworks coexist with no plan.'
    ],
    ask: [
      'Where does conversation state live, and how do we delete a user\'s data?',
      'Which identity does each tool run as?',
      'Can I open a trace of a failed run and see every model and tool call?',
      'How do we cap steps, tokens and time for one run?'
    ],
    revisit: 'When the number of tools or agents triples, when a managed capability closes a gap, or after an incident traced to the runtime.',
    related: ['foundry-agent-service', 'agent-framework', 'container-apps', 'aks', 'copilot-studio', 'durable-functions'],
    em: {
      call: 'Pick the managed runtime that gives a trace per run and user-level identity. Add control only when forced.',
      own: ['Who operates the runtime and its on-call.', 'The decision about when a business-built agent must move to code.'],
      evidence: ['A demo of tracing a failed run end to end.', 'A named owner for the runtime.']
    },
    pe: {
      call: 'Keep tools behind stable interfaces (functions or MCP) so the runtime is replaceable.',
      own: ['State, memory and identity design.', 'The tool contract: schemas, validation, idempotency and error shapes.'],
      evidence: ['A spike hosting the same agent on two runtimes.', 'Replayable traces and a loop-cap test.']
    }
  },
  {
    id: 'vector-store', theme: 'architecture', lead: 'pe', title: 'Which vector store?',
    question: 'Where should embeddings and retrieval live?',
    door: 'two-way', doorNote: 'You can re-embed and move indexes. The cost is time and a re-evaluation, not data loss. Re-embedding is also needed on any embedding-model change.',
    why: 'Retrieval quality sets the ceiling of a RAG system. The store decides filtering, hybrid search, ranking features, freshness, operations and cost.',
    cols: ['Store', 'Best at', 'Filtering and hybrid', 'Operations', 'Pick when'],
    rows: [
      ['[[ai-search|Azure AI Search]]', 'Hybrid search, ranking, ingestion, agentic retrieval', 'Strong filters; keyword, vector and semantic ranker', 'Managed; capacity by replicas and partitions', 'Retrieval is a core feature, or many sources feed one index'],
      ['[[cosmos|Cosmos DB]] vectors', 'Vectors beside operational documents', 'Filters on the partition key and fields; full-text and hybrid supported', 'Managed; plan RU/s', 'Data and agent memory already live in Cosmos DB'],
      ['[[postgres|PostgreSQL]] with pgvector', 'Vectors with relational data and row-level security', 'SQL filters; recall needs care with selective filters', 'You size memory and maintain indexes', 'You already run Postgres and want one database'],
      ['[[sql|Azure SQL]] vectors', 'Vectors beside business tables', 'T-SQL joins and filters; check index maturity', 'Managed; compute tier sets throughput', 'The system of record is SQL Server'],
      ['[[redis|Managed Redis]]', 'Very low latency, caches and small indexes', 'Filter on tags and fields; memory-bound', 'Memory is the cost', 'A semantic cache or a small hot index']
    ],
    rules: [
      ['Retrieval quality and ranking matter more than minimal parts', 'Azure AI Search.'],
      ['The data is already in Cosmos DB, Postgres or SQL and the collection is modest', 'Vectors in that database, until measurement says otherwise.'],
      ['Many agents need one permission-aware knowledge layer', 'AI Search knowledge bases.'],
      ['You need a semantic cache', 'Managed Redis, scoped per tenant.'],
      ['Filters are selective (small subsets per user)', 'Test recall with the real filters before choosing.']
    ],
    redflags: [
      'The choice was made on a benchmark, not on your documents and queries.',
      'Recall at k was never measured, only final answer quality.',
      'Embedding model, dimensions and chunking are not recorded, so reindexing is guesswork.',
      'Per-user access is enforced in the prompt, not in retrieval.',
      'Capacity was sized for data volume, not for vector memory and query load.'
    ],
    ask: [
      'What is recall at k on our real questions with our real filters?',
      'How do we enforce that a user only retrieves documents they may see, and how do we test it?',
      'How long after a document changes is it searchable?',
      'What does reindexing cost and how long does it take?'
    ],
    revisit: 'When data volume grows tenfold, when filters get more selective, when you change embedding models, or when query load triples.',
    related: ['ai-search', 'cosmos', 'postgres', 'sql', 'redis'],
    em: {
      call: 'Do not add a new data store for a pilot. Reuse what the team operates, and fund the eval for retrieval.',
      own: ['Whether a new store means a new on-call duty.', 'Who owns the content pipeline and its freshness.'],
      evidence: ['Retrieval recall numbers on real questions.', 'A named owner for ingestion quality.']
    },
    pe: {
      call: 'Choose by filtering and ranking needs, not by vector benchmarks. Test with your real filters.',
      own: ['Chunking, embedding model, index schema and security-trimming design.', 'The reindex and rollback procedure.'],
      evidence: ['Recall at k with the real access filters applied.', 'Cross-user access tests that fail on a missing filter.']
    }
  },
  {
    id: 'inference-pattern', theme: 'architecture', lead: 'pe', title: 'Synchronous, streaming, asynchronous or batch?',
    question: 'How does the caller wait for the result?',
    door: 'two-way', doorNote: 'The model call is easy to change. The contract with callers (waiting, polling, callbacks) is the hard part to change later.',
    why: 'Latency, cost and failure behaviour all depend on the interaction pattern. Streaming improves perceived speed, queues absorb bursts and protect quotas, and batch is the cheapest way to process anything that can wait.',
    cols: ['Pattern', 'Latency', 'Azure building blocks', 'Failure handling', 'Use when'],
    rows: [
      ['Synchronous', 'Sub-second to a few seconds', '[[apim]], [[functions]] or [[container-apps]], [[foundry-models]]', 'Timeouts, fallbacks, retries with backoff', 'Short answers, classifications, scoring'],
      ['Streaming', 'First tokens fast, total seconds', 'Server-sent events through [[front-door]], [[apim]] with buffering off', 'Partial output, reconnection', 'Chat and long answers'],
      ['Asynchronous (queue)', 'Seconds to minutes', '[[service-bus]], workers, status store', 'Retries, dead-letter, idempotency', 'Long agent runs, extraction, bursts'],
      ['Workflow with waits', 'Minutes to days', '[[durable-functions]], [[logic-apps]]', 'Checkpointing, timers, compensation', 'Approvals, multi-step processes'],
      ['Batch', 'Hours', '[[foundry-models|Foundry batch deployments]], [[azure-batch]], [[aml-endpoints|batch endpoints]]', 'Per-item retries, resumable jobs', 'Backfills, bulk labelling, evaluation']
    ],
    rules: [
      ['A person is waiting and the answer is long', 'Stream it, and measure time to first token.'],
      ['The task takes longer than a request can last', 'Queue it, return a job ID and let the client poll or be called back.'],
      ['Work arrives in bursts above your token quota', 'Put a queue in front of the model and cap worker concurrency.'],
      ['Nobody is waiting', 'Batch. It is the cheapest option.'],
      ['A human must approve a step', 'A workflow with a wait, not a long-held request.']
    ],
    redflags: [
      'Long model calls run inside HTTP requests with timeouts of a minute or less.',
      'A proxy, gateway or edge layer buffers the stream.',
      'Retried work repeats side effects because tools are not idempotent.',
      'No dead-letter handling, so failed jobs vanish.',
      'Timeouts on every hop were never listed.'
    ],
    ask: [
      'What is the timeout on every hop between the user and the model?',
      'What does the user see while they wait, and when it fails?',
      'Are the tools idempotent, and how do we know?',
      'What happens to a message that fails three times?'
    ],
    revisit: 'When typical response length changes, when volume exceeds quotas, or when users ask for faster perceived response.',
    related: ['apim', 'front-door', 'service-bus', 'durable-functions', 'foundry-models', 'azure-batch'],
    em: {
      call: 'Insist on a defined user experience for waiting and failure before build. It is a product decision as much as an engineering one.',
      own: ['Agreeing the acceptable latency and failure experience with product.', 'Prioritising batch for non-urgent work to save cost.'],
      evidence: ['A latency budget by hop.', 'A written failure experience per error type.']
    },
    pe: {
      call: 'Pick the pattern from the slowest realistic request. Make every step idempotent and every hop\'s timeout explicit.',
      own: ['The end-to-end timeout and buffering map.', 'Retry, idempotency and dead-letter design.'],
      evidence: ['Load tests with slow requests and long streams.', 'A chaos test that kills a worker mid-job.']
    }
  },
  {
    id: 'capacity-strategy', theme: 'architecture', lead: 'both', title: 'How do we secure capacity and throughput?',
    question: 'How do we make sure the model, GPUs and search capacity are there when we need them?',
    door: 'two-way', doorNote: 'Quota requests and deployment layouts change easily. Multi-year commitments for reserved capacity do not.',
    why: 'Throttling is the most common launch surprise. Quota is permission, not capacity: approved limits do not guarantee free hardware or model capacity at that moment. Increases take days, and capacity may take longer.',
    cols: ['Lever', 'Protects against', 'How on Azure', 'Cost', 'Watch for'],
    rows: [
      ['Quota increases for peak', 'Hard throttling at launch', '[[quotas|Azure Quotas]] for vCPUs, Foundry quota for tokens per minute', 'Free', 'Per Region and per model; lead time of days'],
      ['Several deployments and Regions behind a gateway', 'One deployment throttling or failing', '[[apim|AI gateway]] backend pool with circuit breaker', 'Low; some duplicate capacity', 'Data residency across Regions'],
      ['Provisioned throughput', 'Shared-capacity latency variance', '[[foundry-models|PTU deployments]] with pay-per-token spillover', 'Hourly whether used or not', 'Sizing from real traffic'],
      ['Capacity reservations for GPUs', 'No hardware free when you need it', '[[gpu-vms|VM capacity reservations]], [[azure-batch|Batch]] with fallback SKUs', 'You pay while reserved', 'Reserving more than the baseline'],
      ['Fallback model or degraded mode', 'Model or Region outage', 'Routing in [[apim]] or the app; a simpler model or cached answer', 'Low', 'The fallback must pass the evals'],
      ['Queues and batch for deferrable work', 'Bursts above quota', '[[service-bus]], [[foundry-models|batch deployments]]', 'Low', 'Workers must back off and be idempotent']
    ],
    rules: [
      ['You are launching within weeks', 'Request quota now, for peak, in every Region you will use.'],
      ['A single deployment is a single point of failure', 'Spread across deployments behind a gateway with a circuit breaker.'],
      ['Traffic is steady and latency matters', 'Provisioned throughput sized from measurement, with spillover.'],
      ['GPU capacity is scarce in your Region', 'Reserve the baseline and keep alternative SKUs and Regions.'],
      ['Some work can wait', 'Send it to queues and batch so it does not compete with interactive load.']
    ],
    redflags: [
      'Quota was requested after the load test failed.',
      'Only one Region or deployment is configured and no failover was ever tested.',
      'Retries are immediate and unbounded, which turns throttling into an outage.',
      'Provisioned capacity was bought without a request-and-token profile.',
      'A fallback model exists but was never run against the evals.'
    ],
    ask: [
      'What is peak tokens per minute and GPU count, and what quota do we hold?',
      'What happens to users if our primary deployment is throttled for ten minutes?',
      'When did we last test failover?',
      'Which workloads can be deferred when capacity is tight?'
    ],
    revisit: 'Before every major launch, after any throttling incident, and when traffic doubles.',
    related: ['quotas', 'foundry-models', 'apim', 'gpu-vms', 'service-bus', 'azure-batch'],
    em: {
      call: 'Treat quota and capacity as a launch gate with an owner and a date, not as a task for launch week.',
      own: ['The lead time in the plan and the person chasing it.', 'The business decision on reserved capacity versus pay-as-you-go.'],
      evidence: ['Quota held versus peak forecast, per Region.', 'A tested fallback path.']
    },
    pe: {
      call: 'Design for throttling: gateway, backoff, spillover and a degraded mode. Assume quota will be short at some point.',
      own: ['Retry policy, concurrency limits and circuit-breaker settings.', 'The fallback hierarchy and its evals.'],
      evidence: ['Load test that deliberately exceeds quota.', 'Failover drill results.']
    }
  },
  {
    id: 'orchestration', theme: 'architecture', lead: 'pe', title: 'How do we orchestrate the work?',
    question: 'What coordinates multi-step, long-running or approval-gated work?',
    door: 'mixed', doorNote: 'Steps themselves are portable. Workflow state, history and versioning of in-flight runs make the engine sticky.',
    why: 'Real workflows need retries, timeouts, parallel steps, waiting for people and a record of what happened. The engine decides what you can express, how you debug, and who can maintain it.',
    cols: ['Tool', 'Style', 'Long waits and approval', 'State and history', 'Fits when'],
    rows: [
      ['[[durable-functions|Durable Functions]]', 'Code', 'Yes, external events and timers', 'Checkpointed history', 'Developers own the workflow and want tests'],
      ['[[logic-apps|Logic Apps]]', 'Low-code designer, connectors', 'Yes, with built-in approvals', 'Run history', 'Many connectors and non-developer maintainers'],
      ['[[service-bus|Service Bus]] with workers', 'Queue and code', 'Via scheduled messages and state you store', 'You design it', 'Simple pipelines with strong buffering needs'],
      ['[[agent-framework|Agent Framework workflows]]', 'Typed graph of agents and functions', 'Yes, request and response with checkpoints', 'Checkpoints', 'LLM-centred workflows in one codebase'],
      ['[[aml-pipelines|Azure ML pipelines]]', 'Component graph', 'Not designed for human waits', 'Run and asset lineage', 'Training and evaluation flows'],
      ['[[adf|Data Factory]] or Fabric pipelines', 'Visual, data movement', 'Limited', 'Run history', 'Scheduled data movement and refresh']
    ],
    rules: [
      ['The workflow is code and must be tested', 'Durable Functions or Agent Framework workflows.'],
      ['Business analysts maintain it and it uses many SaaS connectors', 'Logic Apps.'],
      ['It moves and refreshes data on a schedule', 'Data Factory or Fabric pipelines.'],
      ['It trains and evaluates models', 'Azure ML pipelines.'],
      ['It only needs buffering and retries', 'Service Bus with idempotent workers.']
    ],
    redflags: [
      'Orchestrator code makes network calls or uses the clock, which breaks deterministic replay.',
      'Payloads carry whole documents instead of references.',
      'Several engines overlap with no ownership rule.',
      'No plan to version workflows while instances are running.',
      'Every workflow was built in a designer with no source control.'
    ],
    ask: [
      'What happens to in-flight runs when we change the workflow?',
      'Where can I see why a particular run failed?',
      'How do we cap retries and surface permanent failures?',
      'Who maintains this, and can they do it in this tool?'
    ],
    revisit: 'When the number of workflows or maintainers changes, when step counts or run durations grow, or when run history becomes unmanageable.',
    related: ['durable-functions', 'logic-apps', 'service-bus', 'agent-framework', 'aml-pipelines', 'adf'],
    em: {
      call: 'Match the engine to who will maintain it, not to who builds it first.',
      own: ['The maintenance model: who changes the workflow in a year.', 'Avoiding a third and fourth engine.'],
      evidence: ['A named maintainer who can work in the chosen tool.', 'An engine ownership rule written down.']
    },
    pe: {
      call: 'Keep step logic in plain, testable code and keep the engine thin.',
      own: ['Idempotency, retry and compensation rules.', 'Workflow versioning and the run-history retention.'],
      evidence: ['Replay and failure tests.', 'A versioning drill with running instances.']
    }
  },
  {
    id: 'training-compute', theme: 'architecture', lead: 'pe', title: 'Where do we train?',
    question: 'Which platform runs training and fine-tuning jobs?',
    door: 'two-way', doorNote: 'Training code ports with effort. The data platform, registry and pipelines around it are the real commitments.',
    why: 'Training is bursty and expensive. The right platform scales to zero between runs, makes failures cheap to recover from, and keeps lineage from data to model.',
    cols: ['Option', 'You manage', 'Scale', 'Best for', 'Watch for'],
    rows: [
      ['[[aml-training|Azure ML serverless compute]]', 'Job and environment', 'On demand', 'Occasional jobs and experiments', 'Quota for the VM family'],
      ['[[aml-training|Azure ML compute clusters]]', 'Cluster size limits', 'Autoscale from zero', 'Regular training with predictable start-up', 'Idle minimum nodes; GPU quota'],
      ['Foundry fine-tuning (managed)', 'Data and hyperparameters', 'Managed', 'Tuning supported catalogue models', 'Supported models, data limits and hosting rules'],
      ['[[databricks|Azure Databricks]]', 'Clusters or serverless', 'Autoscale', 'Spark-scale data prep with training in one place', 'Two bills: DBUs and VMs'],
      ['[[aks|AKS]] or Slurm on [[gpu-vms|ND clusters]]', 'Scheduler, drivers, fabric', 'Large and tightly coupled', 'Frontier-scale distributed training', 'Operations load; InfiniBand topology'],
      ['[[azure-batch|Azure Batch]]', 'Pools and task code', 'Large parallel', 'Many independent jobs', 'Not for tightly coupled multi-node training']
    ],
    rules: [
      ['Jobs are occasional and you have no platform team', 'Serverless compute in Azure ML.'],
      ['You train weekly or more and want pipelines and a registry', 'Azure ML compute clusters with pipelines.'],
      ['You only need to tune a supported catalogue model', 'Managed fine-tuning.'],
      ['Data prep is heavy Spark and the team knows Databricks', 'Databricks, with a deliberate path to a registry.'],
      ['You train at multi-node scale where network topology matters', 'ND clusters with a scheduler you operate.']
    ],
    redflags: [
      'GPU quota was not checked until the first job queued.',
      'Training reads small files directly from object storage, starving GPUs.',
      'Jobs are not resumable, so one failure restarts a long run.',
      'Environments are not pinned, so results cannot be reproduced.',
      'Clusters or notebooks run idle with no shutdown.'
    ],
    ask: [
      'What VM family and Region do we need, and is quota approved there?',
      'Can this job resume from a checkpoint after a node failure?',
      'How do we reproduce this run in six months?',
      'What is the cost of one full run and one failed run?'
    ],
    revisit: 'When training frequency or model size changes, or when a managed option supports your model.',
    related: ['aml-training', 'aml-pipelines', 'databricks', 'gpu-vms', 'managed-lustre', 'quotas'],
    em: {
      call: 'Fund the smallest platform that makes retraining routine. Do not build a training cluster before the second use case.',
      own: ['The cost per experiment and the monthly GPU budget.', 'Who is accountable for idle spend.'],
      evidence: ['Cost of one full and one failed run.', 'Quota in the plan with a date.']
    },
    pe: {
      call: 'Make every job resumable and reproducible first, then optimise throughput.',
      own: ['Data loading design, checkpoint cadence and storage tier.', 'Environment pinning and lineage to the registry.'],
      evidence: ['GPU utilisation profile showing data is not the bottleneck.', 'A resume-after-failure test.']
    }
  },

  /* ---------------- RISK, QUALITY & COST ---------------- */
  {
    id: 'evaluation', theme: 'risk', lead: 'both', title: 'How will we know it works?',
    question: 'What evidence says this is good enough to ship, and still good next month?',
    door: 'two-way', doorNote: 'Evals are cheap to change. Shipping without them is not reversible once users depend on behaviour you cannot measure.',
    why: 'Demos hide failure. Every change to a prompt, model, retrieval or tool shifts behaviour, and without an eval set each change is an argument rather than a measurement. Good evaluation is the single biggest predictor of AI projects that reach production.',
    cols: ['Layer', 'Question it answers', 'Azure tools', 'When it runs', 'Weakness'],
    rows: [
      ['Offline evaluation set', 'Is it good enough on known cases?', '[[foundry|Foundry evaluations]] with built-in and custom evaluators', 'Every change, in CI', 'Only covers cases you thought of'],
      ['Component evals', 'Is retrieval finding the right passages? Are tools chosen correctly?', 'Custom scripts, [[ai-search]] retrieval metrics, agent traces', 'Every change', 'Needs labelled data'],
      ['Model-as-judge', 'Does the output meet a rubric at scale?', 'Foundry evaluators with a judge model', 'Nightly or on change', 'Biased unless calibrated against people'],
      ['Human review', 'Would an expert accept this?', 'Review queues, annotation tools', 'Samples; new releases', 'Slow and expensive'],
      ['Safety and red teaming', 'Can it be pushed into unsafe behaviour?', '[[content-safety]], Foundry red-teaming tools', 'Before launch and on major changes', 'Attackers adapt'],
      ['Online monitoring', 'Is it still good in production?', '[[azure-monitor]] traces, [[aml-monitoring]], feedback signals', 'Continuously', 'Feedback is noisy and biased']
    ],
    rules: [
      ['You have no eval set', 'Stop building features and write one, from real user questions.'],
      ['Answers are wrong in a RAG system', 'Measure retrieval recall separately from generation.'],
      ['Agents use tools', 'Score tool choice and arguments separately from the final answer.'],
      ['You use a model as judge', 'Calibrate it against human labels and track the agreement.'],
      ['Users complain', 'Turn each complaint into a permanent eval case.']
    ],
    redflags: [
      'The only evidence is a demo or a few hand-picked examples.',
      'The eval set was written by the team from imagination rather than from real use.',
      'A judge model scores its own outputs without human calibration.',
      'Evals run once at launch and never again.',
      'No pass threshold was agreed before the results came in.'
    ],
    ask: [
      'How many cases are in the eval set, and where did they come from?',
      'What is the agreed pass threshold, and who agreed it?',
      'Do evals run automatically on every change?',
      'How do failures from production reach the eval set?'
    ],
    revisit: 'On any model, prompt, retrieval or tool change, and quarterly for drift in the real question mix.',
    related: ['foundry', 'ai-search', 'content-safety', 'azure-monitor', 'aml-monitoring'],
    em: {
      call: 'Do not approve a launch without a versioned eval set and a threshold agreed in advance.',
      own: ['Making evaluation a funded task with an owner.', 'The ship and stop rules.'],
      evidence: ['The threshold, agreed before the results.', 'Trend of scores across the last releases.']
    },
    pe: {
      call: 'Build the eval before the system. Score components separately so you know which half to fix.',
      own: ['The eval set design, labelling and versioning.', 'CI gates that block regressions.'],
      evidence: ['Judge-versus-human agreement.', 'Component-level scores for retrieval and tool choice.']
    }
  },
  {
    id: 'human-in-loop', theme: 'risk', lead: 'both', title: 'How much do we trust it to act?',
    question: 'Which actions need a person, and what identity do tools run as?',
    door: 'mixed', doorNote: 'Adding approval is easy. Removing it is easy only with evidence. Granting broad permissions is one-way in practice because it is hard to notice and hard to retract.',
    why: 'Permissions, not prompts, bound the damage when a model is wrong or manipulated. Human approval is the cheapest control available, and it can be relaxed action by action as measured accuracy builds.',
    cols: ['Mode', 'What the person does', 'Azure building blocks', 'Cost', 'Fits when'],
    rows: [
      ['Read-only', 'Nothing. The agent looks things up.', '[[entra-id|User-delegated identity]], read roles only', 'Lowest', 'First release of any agent'],
      ['Approve every write', 'Reviews and approves each change', '[[logic-apps|approval workflows]] or [[durable-functions|durable waits]], Teams or email', 'Reviewer time', 'Actions change money, records or customers'],
      ['Approve by risk', 'Approves high-value or unusual actions only', 'Rules in the workflow, thresholds, [[apim]] policies', 'Medium', 'You have accuracy data per action type'],
      ['Sampled review', 'Reviews a sample after the fact', 'Traces in [[azure-monitor]], review queues', 'Low', 'Actions are reversible and capped'],
      ['Autonomous within limits', 'Handles exceptions and audits', 'Scoped identity, spend caps, audit logs', 'Low per action, high if wrong', 'Evidence of high accuracy and a reversible blast radius']
    ],
    rules: [
      ['An action is irreversible, costs money or affects a customer', 'Require approval, with no exceptions until evidence says otherwise.'],
      ['A tool needs data the user cannot see', 'Redesign the tool. Do not grant the agent a broader identity.'],
      ['Approval fatigue sets in', 'Route by risk and show the reviewer the evidence, rather than removing the gate.'],
      ['An action is reversible and capped in count and value', 'Sampled review may be enough.'],
      ['Content from outside your control enters the context', 'Treat it as untrusted and block writes triggered by it.']
    ],
    redflags: [
      'Tools run under a shared administrator or service identity.',
      'Approval screens do not show what will change.',
      'Write tools accept free-form arguments with no server-side validation.',
      'Nobody can answer "what is the worst this agent can do?"',
      'Approval was removed because it was annoying, not because accuracy was measured.'
    ],
    ask: [
      'Which identity does each tool use, and what can it reach?',
      'What does the approver see, and could they spot a wrong action?',
      'What is the maximum value or count of actions per session?',
      'How do we audit what the agent did last Tuesday?'
    ],
    revisit: 'When measured action accuracy changes, after any incident, or when a tool gains a new capability.',
    related: ['entra-id', 'logic-apps', 'durable-functions', 'apim', 'azure-monitor', 'defender'],
    em: {
      call: 'Keep approval on every irreversible action until a written accuracy threshold has been met for a defined period.',
      own: ['The risk appetite and who signs off on removing a gate.', 'Reviewer capacity so approval does not become a bottleneck.'],
      evidence: ['Accuracy per action type from real runs.', 'The approver\'s screen, shown in a demo.']
    },
    pe: {
      call: 'Run tools as the user, validate server-side, and cap blast radius with permissions rather than prompts.',
      own: ['Tool design, identity flow and audit logging.', 'Prompt-injection defences: untrusted-data handling and write blocking.'],
      evidence: ['An injection test suite through retrieved text and tool output.', 'A permission map from each tool to the data it can reach.']
    }
  },
  {
    id: 'cost-levers', theme: 'risk', lead: 'em', title: 'How do we keep it affordable?',
    question: 'Which levers cut cost per successful task, and what do they risk?',
    door: 'two-way', doorNote: 'Most levers can be switched on and off. Commitments (reserved capacity, provisioned throughput) are the exception: they are one-way for the term.',
    why: 'Token spend scales with volume, context length, retries and agent loops. Cost per call hides failures and long contexts, so the number to manage is cost per successful task, attributed to a feature and a tenant.',
    cols: ['Lever', 'Typical effect', 'How on Azure', 'Quality risk', 'Check first'],
    rows: [
      ['Route to a cheaper model by task difficulty', 'Large', '[[foundry-models]] with routing in the app or [[apim]]', 'Medium', 'Eval scores per route'],
      ['Prompt caching and shorter prompts', 'Medium to large', 'Stable prefixes first; trimmed context', 'Low', 'Cached share of input tokens'],
      ['Semantic cache', 'Medium for repetitive traffic', '[[redis|Managed Redis]] or [[apim]] semantic caching', 'Medium to high: wrong reuse', 'Answer correctness on cache hits'],
      ['Batch for deferrable work', 'About half off eligible calls', '[[foundry-models|Batch deployments]]', 'None', 'Which work can wait'],
      ['Fewer model calls per task', 'Medium', 'Workflow instead of open-ended agent loop', 'Low if evals pass', 'Calls per task in traces'],
      ['Provisioned throughput versus pay-per-token', 'Depends on steadiness', '[[foundry-models|PTU]] with spillover', 'None', 'Utilisation of reserved capacity'],
      ['Reservations and savings plans', 'Medium on compute', '[[cost-management|Reservations]]', 'None', 'Stable baseline for the term']
    ],
    rules: [
      ['Costs are high but you do not know why', 'Instrument tokens per task and per tenant before optimising.'],
      ['Easy tasks dominate volume', 'Route them to a smaller model.'],
      ['Prompts repeat a large prefix', 'Cache it and place stable text first.'],
      ['Work is not time-sensitive', 'Use batch.'],
      ['Traffic is steady and predictable', 'Consider provisioned capacity and reservations.']
    ],
    redflags: [
      'The forecast uses cost per call, not cost per successful task.',
      'Cost is reported by subscription, with no breakdown by feature or tenant.',
      'A semantic cache was enabled with no correctness check.',
      'Provisioned capacity sits mostly idle.',
      'Agent loops have no cap, and nobody has looked at the long tail of calls per task.'
    ],
    ask: [
      'What does one successful task cost, and what does it cost at ten times the volume?',
      'Which three levers would move the number most?',
      'What happens to quality when we apply each lever?',
      'Who gets paged when spend jumps?'
    ],
    revisit: 'Monthly while volume grows, and whenever a model, price or traffic pattern changes.',
    related: ['cost-management', 'apim', 'foundry-models', 'redis', 'azure-monitor'],
    em: {
      call: 'Set a target cost per successful task up front, and review it monthly with the lever list.',
      own: ['The budget, the target and the alert owner.', 'Commitments: reservation and provisioned-capacity decisions.'],
      evidence: ['Cost per successful task by feature and tenant.', 'Utilisation of any reserved capacity.']
    },
    pe: {
      call: 'Measure first, then apply levers in order of effect and quality risk. Re-run evals after each.',
      own: ['Token and call instrumentation, tagging and attribution.', 'Routing, caching and loop-cap design.'],
      evidence: ['Per-lever before-and-after eval and cost numbers.', 'Cache hit-rate and hit-correctness measurements.']
    }
  },
  {
    id: 'tenancy', theme: 'risk', lead: 'pe', title: 'How do we isolate tenants and data?',
    question: 'How strongly must one customer\'s data be kept apart from another\'s?',
    door: 'one-way', doorNote: 'Changing the isolation model after tenants are onboarded means migrating data and rebuilding access control. Decide before the first sensitive tenant.',
    why: 'Shared infrastructure is cheaper, and separate infrastructure is safer. The model you choose sets cost, blast radius and the evidence you can offer a customer or an auditor. Embeddings, caches and logs are as sensitive as the source data.',
    cols: ['Model', 'Isolation', 'How on Azure', 'Cost', 'Fits when'],
    rows: [
      ['Shared index, tenant filter', 'Logical: depends on correct filters', '[[ai-search]] security filters or [[cosmos]] partition key by tenant', 'Lowest', 'Many small tenants, low regulation'],
      ['Index or container per tenant', 'Stronger logical', 'Index per tenant in one service; container per tenant in [[cosmos]]', 'Medium', 'Moderate tenant count, deletion and export needs'],
      ['Service or database per tenant', 'Strong', 'Search service or database per tenant, per-tenant keys in [[key-vault]]', 'High', 'Large or regulated tenants'],
      ['Subscription or resource group per tenant', 'Strongest, with per-tenant RBAC', 'Landing zones deployed with [[bicep]] and [[azure-policy]]', 'Highest', 'Contractual or regulatory isolation'],
      ['Customer-managed keys per tenant', 'Cryptographic separation', '[[key-vault|CMK]] on storage, Cosmos DB and Search', 'Adds key operations', 'Customers require key control and revocation']
    ],
    rules: [
      ['Tenants are numerous and not regulated', 'Shared index with enforced filters, tested with cross-tenant queries.'],
      ['A tenant must be fully deletable or exportable', 'Separate index or container so deletion is simple.'],
      ['A tenant requires strong or contractual isolation', 'Separate service, or separate subscription.'],
      ['A tenant wants to control its encryption keys', 'Customer-managed keys per tenant.'],
      ['Caches and logs hold tenant data', 'Scope them per tenant and set retention, or exclude content.']
    ],
    redflags: [
      'Tenant isolation depends on a filter that is added by each query author.',
      'The semantic cache is shared across tenants.',
      'Logs and traces contain prompts from many tenants in one readable workspace.',
      'No tested procedure exists to delete one tenant\'s data, including embeddings and logs.',
      'The first regulated customer is signing, and the design was chosen for unregulated ones.'
    ],
    ask: [
      'What proves a query cannot return another tenant\'s data?',
      'Where does tenant data live, including indexes, caches, logs and backups?',
      'How do we delete or export one tenant, and how long does it take?',
      'What is the blast radius if one tenant\'s credentials are compromised?'
    ],
    revisit: 'Before onboarding a regulated or very large tenant, after any isolation incident, and when contract terms change.',
    related: ['ai-search', 'cosmos', 'key-vault', 'entra-id', 'azure-policy', 'bicep'],
    em: {
      call: 'Decide the isolation model with compliance and sales before signing the first sensitive tenant. It is a one-way door.',
      own: ['The commercial and contractual promises tied to isolation.', 'The cost difference between shared and dedicated tiers.'],
      evidence: ['A written tenant data-flow map.', 'A tested tenant deletion and export procedure.']
    },
    pe: {
      call: 'Enforce isolation in retrieval and storage, not in prompts. Prove it with tests that try to cross the boundary.',
      own: ['The data-layer design: filters, partitions, keys and caches.', 'Automated cross-tenant leak tests in CI.'],
      evidence: ['Cross-tenant query test results.', 'A review of every place tenant data is copied (caches, logs, indexes).']
    }
  }
];

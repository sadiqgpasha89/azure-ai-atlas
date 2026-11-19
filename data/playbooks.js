/* Playbooks for engineering leaders: maturity ladder, readiness checklist, ADR template, solution shaper.
   Checklist `see` entries are 'svc:<service-id>' or 'dec:<decision-id>'. */

window.ATLAS.ladder = [
  {
    stage: 'Prototype', time: 'Days to weeks',
    goal: 'Prove there is real value and that it is feasible on real data.',
    exit: [
      'An eval set exists (real, representative cases) and the baseline has a score.',
      'Two or three real users or stakeholders confirm the output is useful.',
      'A first estimate of cost per task, and the top three risks, are written down.'
    ],
    skip: ['Building a platform', 'Fine-tuning', 'Optimising cost', 'Multi-Region']
  },
  {
    stage: 'Pilot', time: 'Weeks',
    goal: 'Prove reliability and safety with real users in a limited scope.',
    exit: [
      'The eval score meets the agreed threshold on a larger set.',
      'Actions are read-only or approval-gated; guardrails and tenant isolation are tested.',
      'Monitoring exists, someone is on call, and cost per task is measured.'
    ],
    skip: ['Removing approvals', 'Widening tool access', 'Chasing scale']
  },
  {
    stage: 'Production', time: 'Weeks to a quarter',
    goal: 'Prove it can be operated, not just built.',
    exit: [
      'Service levels are defined and have been met for several weeks.',
      'Quotas and capacity cover peak; the fallback path has been tested.',
      'Runbooks have been used in an exercise, and cost is attributed per tenant or feature.'
    ],
    skip: ['New autonomous capabilities without new evals']
  },
  {
    stage: 'Scale', time: 'Ongoing',
    goal: 'Prove the economics and the resilience.',
    exit: [
      'Cost per successful task is at target, using caching, batching, routing or smaller models.',
      'A capacity plan covers growth, including a Region or model outage.',
      'Autonomy has been raised only where measured accuracy justifies it, and decision records are reviewed quarterly.'
    ],
    skip: ['Rewriting for its own sake']
  }
];

window.ATLAS.readiness = [
  {
    id: 'quality', name: 'Quality and evaluation', items: [
      { id: 'q1', kind: 'both', t: 'A versioned eval set of real, representative cases exists, with agreed pass thresholds.', why: 'Without it every change is an argument, not a measurement.', see: ['dec:evaluation', 'svc:foundry'] },
      { id: 'q2', kind: 'both', t: 'Evals run automatically on every change to prompt, model, retrieval or code.', why: 'Regressions from small edits are the most common quality loss.', see: ['dec:evaluation'] },
      { id: 'q3', kind: 'agent', t: 'Tool choice and parameter accuracy are measured separately from final answer quality.', why: 'A right answer from a wrong tool call is luck, and it will not repeat.', see: ['dec:agent-runtime'] },
      { id: 'q4', kind: 'both', t: 'For RAG, retrieval quality (recall at k) is measured separately from generation.', why: 'It tells you which half to fix.', see: ['dec:vector-store', 'svc:ai-search'] },
      { id: 'q5', kind: 'ml', t: 'Offline metrics map to a business metric, and the holdout reflects production data.', why: 'A model can win offline and lose in production.', see: ['svc:aml-pipelines'] },
      { id: 'q6', kind: 'both', t: 'Known failure modes are documented, with what the user sees when each happens.', why: 'Graceful failure is designed, not discovered.', see: [] }
    ]
  },
  {
    id: 'safety', name: 'Safety and security', items: [
      { id: 's1', kind: 'agent', t: 'Every tool is narrow, validates its parameters server-side, and runs with least privilege.', why: 'Permissions bound the damage when the model is wrong or manipulated.', see: ['dec:human-in-loop', 'svc:entra-id'] },
      { id: 's2', kind: 'agent', t: 'Writes and irreversible actions need approval, or have a written justification from measured accuracy.', why: 'Approval is the cheapest control you have.', see: ['dec:human-in-loop', 'svc:logic-apps'] },
      { id: 's3', kind: 'agent', t: 'Prompt injection through retrieved text and tool output has been tested; Prompt Shields or equivalent are on, and tool output is treated as data.', why: 'Any text the agent reads can contain instructions.', see: ['svc:content-safety'] },
      { id: 's4', kind: 'both', t: 'Content filters and PII handling are configured and tested on inputs and outputs; logging of sensitive text is a deliberate choice.', why: 'Logs and caches are where sensitive data quietly accumulates.', see: ['svc:content-safety', 'svc:ai-language'] },
      { id: 's5', kind: 'both', t: 'Per-user and per-tenant isolation is tested across retrieval, caches and logs.', why: 'A missing filter leaks one customer\'s data to another.', see: ['dec:tenancy'] },
      { id: 's6', kind: 'both', t: 'Key authentication is disabled in favour of Entra identities; encryption keys, private endpoints and no public model or data endpoints, where required.', why: 'Prompts and datasets should not cross the public internet, and keys are bearer secrets.', see: ['svc:key-vault', 'svc:private-link', 'svc:entra-id'] },
      { id: 's7', kind: 'both', t: 'Model and vendor terms on data use, retention and residency are reviewed, including the deployment type (Global, Data Zone or Regional).', why: 'Compliance owners need to approve this before launch, not after.', see: ['svc:foundry-models', 'dec:where-model-runs'] }
    ]
  },
  {
    id: 'reliability', name: 'Reliability and capacity', items: [
      { id: 'r1', kind: 'both', t: 'Quotas (tokens and requests per minute, GPU vCPUs, PTUs) are requested for peak, in every Region used.', why: 'Increases take days, and capacity is a separate matter.', see: ['dec:capacity-strategy', 'svc:quotas'] },
      { id: 'r2', kind: 'both', t: 'Retries use backoff and jitter and honour Retry-After; timeouts line up across every hop; retried actions are idempotent.', why: 'Throttling plus naive retries becomes an outage.', see: ['dec:inference-pattern'] },
      { id: 'r3', kind: 'both', t: 'A fallback deployment, model or degraded mode exists, and has been tested against the evals.', why: 'Models and Regions have bad days.', see: ['dec:capacity-strategy', 'svc:apim'] },
      { id: 'r4', kind: 'agent', t: 'Hard caps exist on steps, tokens and wall-clock time per session.', why: 'Loops are how a small bug becomes a large bill.', see: ['dec:autonomy-level'] },
      { id: 'r5', kind: 'ml', t: 'Model rollout uses canary or mirrored traffic with a tested rollback; the previous version is kept.', why: 'A bad model needs a one-step undo.', see: ['svc:aml-endpoints'] },
      { id: 'r6', kind: 'both', t: 'Load tests cover peak traffic, slow requests and cold scale-out.', why: 'GPU and model start-up time makes scaling slower than it looks.', see: ['svc:aks', 'svc:aml-endpoints'] }
    ]
  },
  {
    id: 'cost', name: 'Cost', items: [
      { id: 'c1', kind: 'both', t: 'Cost per successful task is measured and attributed by feature and tenant.', why: 'Cost per call hides retries, loops and long contexts.', see: ['dec:cost-levers', 'svc:cost-management'] },
      { id: 'c2', kind: 'both', t: 'Budget alerts and per-client token limits guard against runaway spend.', why: 'Billing data lags, and budgets alert but do not stop spend, so you need faster signals too.', see: ['svc:cost-management', 'svc:apim'] },
      { id: 'c3', kind: 'both', t: 'Idle resources (endpoints, clusters, compute instances) have owners and automatic shutdown.', why: 'Forgotten GPUs are a leading source of waste.', see: ['svc:aml-endpoints', 'svc:aml-workspace'] },
      { id: 'c4', kind: 'both', t: 'The forecast at current and ten times current volume is written down with its assumptions.', why: 'Unit economics that break at scale are better found now.', see: [] }
    ]
  },
  {
    id: 'ops', name: 'Operations and observability', items: [
      { id: 'o1', kind: 'both', t: 'Dashboards show latency (including time to first token), errors, throttles, tokens, queue age and accelerator utilisation.', why: 'You cannot run what you cannot see.', see: ['svc:azure-monitor'] },
      { id: 'o2', kind: 'agent', t: 'Every agent run is traceable step by step (reasoning, tool calls, results) and can be replayed.', why: 'Non-deterministic failures need a record to debug.', see: ['svc:foundry-agent-service', 'svc:azure-monitor'] },
      { id: 'o3', kind: 'both', t: 'Alerts page a named on-call rota, with runbooks for throttling, model outage, bad output and runaway cost.', why: 'Alerts without owners are noise.', see: ['svc:azure-monitor'] },
      { id: 'o4', kind: 'ml', t: 'Drift and data-quality monitoring has a defined retraining trigger and an owner.', why: 'Models decay quietly.', see: ['svc:aml-monitoring'] },
      { id: 'o5', kind: 'both', t: 'Infrastructure is defined as code; environments are reproducible; changes are reviewed.', why: 'Manual setups cannot be audited or rebuilt.', see: ['svc:bicep', 'svc:azure-policy'] },
      { id: 'o6', kind: 'both', t: 'Model versions are pinned, and a process exists for retirements and upgrades.', why: 'Providers retire models on their schedule, not yours.', see: ['svc:foundry-models'] }
    ]
  },
  {
    id: 'data', name: 'Data and privacy', items: [
      { id: 'd1', kind: 'both', t: 'Data sources are catalogued with owners, and permission to use them for this purpose is confirmed.', why: 'Legal and trust problems start with unexamined data.', see: ['svc:purview'] },
      { id: 'd2', kind: 'both', t: 'Sensitive data is scanned for before it enters a training set or an index.', why: 'It is far cheaper to keep it out than to remove it.', see: ['svc:purview', 'svc:ai-language'] },
      { id: 'd3', kind: 'both', t: 'Retention and deletion are defined for prompts, outputs, embeddings and logs, including full tenant deletion.', why: 'Embeddings and logs are easy to forget when deleting.', see: ['dec:tenancy'] },
      { id: 'd4', kind: 'ml', t: 'Training data, code and model versions are linked so any production model can be reproduced.', why: 'Audits and incidents both ask for this.', see: ['svc:aml-pipelines'] }
    ]
  },
  {
    id: 'team', name: 'Team and process', items: [
      { id: 't1', kind: 'both', t: 'There are named owners for quality, for cost, and for on-call.', why: 'Shared ownership means nobody owns it.', see: [] },
      { id: 't2', kind: 'both', t: 'Users have a feedback channel, and complaints become eval cases.', why: 'Real failures are your best test data.', see: ['dec:evaluation'] },
      { id: 't3', kind: 'both', t: 'The rollout plan has success criteria and a stop rule that says what makes us pause.', why: 'It is easier to agree a stop rule before launch.', see: [] },
      { id: 't4', kind: 'both', t: 'Key decisions are recorded as short decision records with reversibility and a revisit date.', why: 'The next engineer needs to know why, not only what.', see: [] },
      { id: 't5', kind: 'both', t: 'Users are told what the system is, what it cannot do, and how to reach a person.', why: 'Calibrated trust prevents most harm.', see: [] }
    ]
  }
];

window.ATLAS.adrTemplate = [
  '# ADR-NNN: <short decision title>',
  '',
  'Status: Proposed | Accepted | Superseded by ADR-xxx',
  'Date: YYYY-MM-DD',
  'Owner: <name>',
  'Reviewers: <names>',
  '',
  '## Context',
  'What problem are we solving? Constraints, volumes, deadlines, compliance needs.',
  'Eval results so far and the current baseline score.',
  '',
  '## Options considered',
  '| Option | Strengths | Weaknesses | Build cost | Run cost |',
  '|---|---|---|---|---|',
  '| A |  |  |  |  |',
  '| B |  |  |  |  |',
  '',
  '## Decision',
  'We will ...',
  '',
  '## Evidence',
  'Eval scores, cost per successful task, latency, load-test results, security review.',
  '',
  '## Reversibility',
  'Two-way door | One-way door | Mixed. What would it cost, in people and time, to reverse this?',
  '',
  '## Risks and mitigations',
  '- Risk: ...  Mitigation: ...',
  '',
  '## Consequences',
  'What becomes easier, what becomes harder, who is affected.',
  '',
  '## Revisit when',
  'A date, or a trigger (volume 10x, model retired, cost above X, incident).'
].join('\n');


/* ---------- Solution shaper ---------- */

window.ATLAS.shaper = {
  questions: [
    { id: 'goal', label: 'What are you building?', options: [
      ['qa', 'Answers from our own documents'],
      ['agent', 'An assistant that takes actions in our systems'],
      ['docs', 'Extraction of data from documents, forms or scans'],
      ['generate', 'Generating or transforming content (drafts, summaries, classification)'],
      ['predict', 'Predictions from structured data (risk, demand, churn)'],
      ['recs', 'Recommendations or ranking for users']
    ] },
    { id: 'action', label: 'If it takes actions, how much freedom does it get?', only: 'agent', options: [
      ['read', 'Read-only: it looks things up'],
      ['approve', 'It proposes changes and a person approves'],
      ['auto', 'It acts on its own within limits']
    ] },
    { id: 'latency', label: 'How fast must it respond?', options: [
      ['interactive', 'Under a second or two'],
      ['chat', 'Streaming chat: first words quickly, a few seconds in total'],
      ['async', 'Minutes are fine'],
      ['batch', 'Offline, hours are fine']
    ] },
    { id: 'data', label: 'How sensitive is the data?', options: [
      ['public', 'Public or low sensitivity'],
      ['internal', 'Internal business data'],
      ['regulated', 'Regulated or personal data (PII, health, financial)']
    ] },
    { id: 'scale', label: 'What scale do you expect in the first year?', options: [
      ['pilot', 'A pilot or one team'],
      ['mid', 'A product with steady use'],
      ['high', 'High and sustained volume']
    ] },
    { id: 'team', label: 'What does your team look like?', options: [
      ['small', 'Small team, no ML specialists'],
      ['mixed', 'Some ML experience'],
      ['platform', 'A platform or ML engineering team']
    ] },
    { id: 'model', label: 'What do you need from the model?', options: [
      ['managed', 'A managed or catalogue model is fine'],
      ['custom', 'A customised (fine-tuned) model'],
      ['hosted', 'We must host the model ourselves (open weights, locality, cost)']
    ] }
  ],
  defaults: { goal: 'qa', action: 'read', latency: 'chat', data: 'internal', scale: 'pilot', team: 'small', model: 'managed' },

  recommend: function (a) {
    var stack = [], seen = {}, risks = [], next = [], nseen = {}, arch = null, headline = '';
    function add(id, role, why) { if (seen[id]) return; seen[id] = 1; stack.push({ id: id, role: role, why: why }); }
    function nx(id, why) { if (nseen[id]) return; nseen[id] = 1; next.push({ id: id, why: why }); }
    function risk(t) { if (risks.indexOf(t) < 0) risks.push(t); }

    nx('build-buy-customize', 'Confirm how much to build before committing people.');

    if (a.goal === 'qa') {
      headline = 'Grounded question answering (RAG)'; arch = 'rag-assistant';
      add('blob', 'Source of truth for the documents', 'Every ingestion path starts here.');
      add('ai-search', 'Ingestion, chunking, hybrid retrieval and citations', a.scale === 'high' ? 'High concurrency and strict filtering favour a dedicated search service; scale replicas and partitions.' : 'The quickest route to a working, cited assistant, with agentic retrieval when questions get complex.');
      add('foundry-models', 'Models for embeddings and answers', 'One endpoint family, no GPUs to run.');
      add('content-safety', 'Prompt Shields, content filters and groundedness checks', 'Cuts unsafe and unsupported answers, and indirect injection from documents.');
      add('entra-id', 'User identity for per-user retrieval filters', 'Access control must be enforced in retrieval, not in the prompt.');
      if (a.team === 'small' && a.scale === 'pilot') add('copilot-studio', 'Option: low-code front end over the same knowledge', 'Consider it if the content is in Microsoft 365 and a business team will own the agent.');
      nx('vector-store', 'Choose the index and test filtering and recall.');
      nx('improve-model', 'Prompt and retrieval first; fine-tune last.');
      risk('Retrieval quality, not the model, is usually the problem. Measure recall at k separately.');
      risk('Per-user document access must be enforced with security filters, and tested.');
      risk('New documents are searchable only after the next indexer run.');
    } else if (a.goal === 'agent') {
      headline = a.action === 'read' ? 'Read-only tool-using agent' : (a.action === 'approve' ? 'Agent with human approval' : 'Autonomous agent within limits');
      arch = 'agent-platform';
      if (a.team === 'small' && a.model === 'managed') add('foundry-agent-service', 'Managed agent loop, tools and knowledge', 'The fastest route for a small team; less to operate.');
      else { add('agent-framework', 'Code-first agents and workflows', 'Control over logic and orchestration, with open-source portability.'); add('container-apps', 'Hosting for the agent code and tool servers', 'Scales to zero; use Foundry hosted agents if you prefer a managed host.'); }
      add('foundry-models', 'Reasoning model', 'Use the smallest model that passes your evals.');
      add('functions', 'Tool implementations', 'Narrow, testable functions with explicit schemas.');
      add('ai-search', 'Knowledge lookup as one of the agent\'s tools', 'Gives the agent grounded, permission-aware facts.');
      add('cosmos', 'Conversation state and memory', 'Sessions need to survive restarts.');
      add('entra-id', 'User identity passed to every tool call', 'Tools must act as the user, not as an administrator.');
      add('apim', 'Entry point with auth and token limits', 'Per-user limits protect your spend.');
      add('content-safety', 'Prompt Shields and filters on inputs, outputs and tool results', 'A second layer beside permissions.');
      if (a.action === 'approve') add('logic-apps', 'Approval gate with a person in the loop', 'Pauses for a reviewer and keeps an audit trail.');
      if (a.action === 'auto') {
        add('durable-functions', 'Bounded, checkpointed execution of multi-step actions', 'Retries, compensation and hard caps on what runs.');
        add('cost-management', 'Budgets with alerts and automation', 'Autonomy plus loops can spend quickly.');
        add('defender', 'Threat detection for AI workloads', 'Alerts on jailbreaks and abusive use.');
        risk('The agent acts before anyone looks. Keep actions reversible and capped in count and value.');
      }
      nx('autonomy-level', 'Check a workflow would not do the job.');
      nx('agent-runtime', 'Confirm the hosting choice.');
      nx('human-in-loop', 'Set what needs approval and whose identity tools use.');
      risk('Prompt injection through retrieved text and tool output. Treat both as untrusted data.');
      risk('Loops burn tokens. Cap steps, tokens and wall-clock time per session.');
      risk('Vague tool descriptions cause wrong tool choices. Test tool selection on its own.');
    } else if (a.goal === 'docs') {
      headline = 'Document intelligence pipeline'; arch = 'document-intelligence';
      add('blob', 'Document landing zone', 'Events start the workflow.');
      add('service-bus', 'Queue that buffers bursts and retries', 'Protects downstream throttles.');
      add('durable-functions', 'Orchestration with retries and human review', 'Handles failure and low-confidence cases.');
      add('doc-intelligence', 'OCR, tables and field extraction', 'Cheaper and more predictable than asking an LLM to read pixels.');
      add('ai-language', 'PII detection and redaction', 'Redact before any generative step.');
      add('foundry-models', 'Maps messy fields to your schema and checks rules', 'Use the LLM for judgement only.');
      add('cosmos', 'Validated results and status', 'Fast lookup for downstream systems.');
      nx('orchestration', 'Pick the orchestration pattern and its limits.');
      risk('An LLM may invent a value. Require each extracted value to appear in the source text.');
      risk('Orchestration payloads are limited. Pass blob references, not document text.');
      risk('Backfills hit service throttles. Use queues and concurrency limits.');
      if (a.latency === 'interactive') risk('Multi-page extraction is asynchronous. Design the waiting experience.');
    } else if (a.goal === 'generate') {
      headline = 'LLM content and transformation service';
      add('foundry-models', 'Foundation models through Azure endpoints', 'Start here and compare models on your own evals; route easy tasks to smaller ones.');
      add('content-safety', 'Content and PII controls', 'Required for anything user-facing.');
      add('apim', 'AI gateway: auth, token limits and routing', 'Gives per-team budgets and a place to route by task difficulty.');
      if (a.latency === 'interactive' || a.latency === 'chat') { add('functions', 'Thin application layer', 'Prompt assembly and response streaming.'); }
      nx('inference-pattern', 'Decide between synchronous, streaming and batch.');
      nx('cost-levers', 'Tokens are the bill; plan the levers early.');
      risk('Quality is subjective. Write a scoring rubric and calibrate any model-as-judge against people.');
      risk('Behaviour shifts when model versions change. Pin versions and re-run evals.');
    } else if (a.goal === 'predict') {
      headline = 'Predictive ML platform';
      arch = a.latency === 'interactive' ? 'realtime-features' : 'training-mlops';
      add('adls', 'Data lake and artifact store', 'Everything reads from and writes to it.');
      if (a.team === 'platform') add('databricks', 'Prepares training datasets at scale', 'Spark with Delta tables and governance, if the team already uses it.');
      else add('fabric', 'Prepares training datasets and shares them with analytics', 'One SaaS platform for pipelines, Spark and BI.');
      add('aml-workspace', 'Workspace, registry and tracking for data scientists', 'Notebooks, MLflow experiments and a model registry.');
      add('aml-training', 'Managed training jobs', 'Pay for GPUs only while they run.');
      add('aml-pipelines', 'Train, evaluate, register, deploy', 'Makes retraining routine and auditable.');
      add('aml-endpoints', 'Hosts the model', 'Online or batch, to match latency, with canary rollout.');
      add('aml-monitoring', 'Drift and data-quality monitoring', 'Models decay quietly.');
      if (a.latency === 'interactive') add('aml-feature-store', 'Same features online and offline', 'Avoids training-serving skew for low-latency scoring.');
      nx('training-compute', 'Pick where training runs.');
      nx('orchestration', 'Choose how the pipeline is run.');
      risk('Training-serving skew: define each feature once and use it in both places.');
      risk('Labels often arrive late. Plan proxy metrics meanwhile.');
      risk('Drift needs an owner and a defined retraining trigger.');
      if (a.data === 'regulated') risk('Fairness and explainability evidence may be required. Plan for Responsible AI dashboard reports.');
    } else if (a.goal === 'recs') {
      headline = 'Recommendations and ranking'; arch = 'realtime-features';
      add('adls', 'Interaction history', 'Training data for any recommender.');
      add('event-hubs', 'Live events', 'Fresh behaviour improves recommendations.');
      if (a.team === 'small' || a.model === 'managed') {
        add('foundry-models', 'Embeddings for items and users', 'A first recommender can be similarity over embeddings.');
        add('ai-search', 'Similarity and filtered retrieval of candidates', 'Hybrid and filtered candidate generation without training a model.');
        risk('Azure\'s former managed recommender (Personalizer) is retired or being retired, so there is no first-party managed recommender to adopt. Plan on embeddings plus search, or your own model.');
      } else {
        add('aml-training', 'Train your own ranking model', 'Control over features and objective.');
        add('aml-feature-store', 'Online and offline features', 'Consistent features at request time.');
        add('aml-endpoints', 'Serves rankings', 'Autoscaled real-time endpoint.');
      }
      add('redis', 'Low-latency feature and candidate cache', 'Keeps request-time latency independent of the data platform.');
      add('cosmos', 'Catalogue and profile lookup', 'Joins recommendation IDs to display data.');
      nx('evaluation', 'Offline metrics must map to business outcomes.');
      risk('Cold start: new users and items have no history. Use metadata and fallbacks.');
      risk('Feedback loops make popular items more popular. Monitor diversity.');
    }

    if (a.model === 'hosted' && (a.goal === 'qa' || a.goal === 'agent' || a.goal === 'generate')) {
      if (a.scale === 'high' && a.team === 'platform') {
        add('aks', 'Serving fleet for open-weight models', 'Control and cost at high steady volume.');
        add('gpu-vms', 'GPU capacity (reserved baseline)', 'Reserve GPUs; do not rely on on-demand.');
        if (!arch) arch = 'llm-serving';
      } else {
        add('aml-endpoints', 'Managed hosting for open-weight models', 'Less to operate than your own fleet.');
      }
      nx('where-model-runs', 'Confirm hosting against the managed catalogue.');
      risk('GPU capacity and slow scale-out become your problem. Reserve capacity and keep headroom.');
    }
    if (a.model === 'custom') {
      add('aml-training', 'Fine-tuning jobs', 'Customise on your data, after prompt and retrieval baselines.');
      nx('improve-model', 'Prove fine-tuning beats prompt plus retrieval on your evals.');
      risk('Fine-tuning before a prompt and retrieval baseline wastes effort and creates a maintenance duty.');
    }

    if (a.latency === 'interactive') risk('A one- or two-second budget rules out multi-step agent loops and large models. Measure end to end.');
    if (a.latency === 'chat') risk('Streaming breaks behind buffering proxies and short idle timeouts. Test the whole path.');
    if (a.latency === 'async') { add('service-bus', 'Buffers and retries long jobs', 'Protects slow consumers from bursts.'); risk('Async jobs need status, retries, idempotency and a result store.'); nx('inference-pattern', 'Define the job contract.'); }
    if (a.latency === 'batch') { add('durable-functions', 'Coordinates bulk runs', 'Retries and state for long jobs; use Foundry batch deployments for the model calls.'); nx('inference-pattern', 'Batch is the cheapest pattern; confirm it fits.'); risk('Batch failures surface late. Add checks on each stage.'); }

    if (a.data === 'regulated') {
      add('private-link', 'Private endpoints keep traffic on the Azure network', 'Prompts and datasets avoid the public internet.');
      add('key-vault', 'Customer-managed encryption keys and secrets', 'Key control is part of most regulated-data reviews.');
      add('purview', 'Classifies and governs sensitive data', 'Keep PII out of training sets and indexes.');
      add('defender', 'Posture management and AI threat detection', 'Evidence and alerts for audits.');
      add('entra-id', 'Managed identities and least-privilege roles', 'Limits access to datasets and models; turn keys off.');
      if (a.goal === 'qa' || a.goal === 'agent' || a.goal === 'generate') add('ai-language', 'PII redaction before prompts and logs', 'Reduces exposure.');
      nx('tenancy', 'Choose the isolation model before onboarding sensitive tenants.');
      risk('Global deployment types can process prompts in other Regions. Check residency rules and use Data Zone or Regional types if needed.');
      risk('Prompts, outputs and logs hold sensitive data. Restrict access and set retention.');
    } else if (a.data === 'internal') {
      add('private-link', 'Private endpoints for Azure services', 'Keeps traffic on the Azure network.');
      add('key-vault', 'Encryption keys and secrets', 'Default-on encryption with key control.');
      add('entra-id', 'Managed identities and least-privilege roles', 'Separate identities for builders, jobs and apps.');
    }

    if (a.scale === 'mid' || a.scale === 'high') {
      add('quotas', 'Raise model and GPU quotas before launch', 'Throttling is the most common launch surprise.');
      add('apim', 'AI gateway with token limits and failover', 'Shares capacity safely across teams and Regions.');
      nx('capacity-strategy', 'Plan quotas, fallbacks and reservations.');
      nx('cost-levers', 'Decide which levers to apply and measure.');
      risk('Quota increases take days. Request them well before launch.');
    }
    if (a.scale === 'high') {
      add('front-door', 'Edge WAF and rate limiting', 'Protects against abuse and denial of wallet.');
      if (a.goal === 'qa' || a.goal === 'generate' || a.goal === 'agent') add('redis', 'Semantic cache and counters', 'Skips the model on repeated questions; verify answers stay correct.');
    }
    if (a.team === 'small') risk('A small team should avoid operating GPUs or clusters. Stay on managed services until volume forces a change.');

    nx('evaluation', 'Build the eval set before the system.');
    add('azure-monitor', 'Metrics, logs and traces across every layer', 'Latency, errors, throttles, tokens and cost.');
    add('cost-management', 'Budgets, tags and cost attribution', 'Forgotten resources and loops are expensive.');

    var phases = [
      'Prototype: build the eval set first, then a baseline of the simplest managed pieces (' + headline.toLowerCase() + ').',
      'Pilot: limit scope and users. Add content safety, permission and tenant tests, and monitoring. Measure cost per task.' + (a.goal === 'agent' ? ' Keep actions read-only or approval-gated.' : ''),
      'Production: raise quotas, add a tested fallback, load test, write runbooks and define service levels.',
      'Scale: apply cost levers (caching, batching, routing), revisit hosting, and raise autonomy only where measured accuracy supports it.'
    ];

    return { headline: headline, arch: arch, stack: stack, risks: risks, next: next, phases: phases };
  }
};

/* Streaming & Orchestration */
S({
  id: 'event-hubs', cat: 'streaming', name: 'Azure Event Hubs', doc: 'azure/event-hubs/',
  tag: 'A high-throughput event stream with replay, and a Kafka-compatible endpoint.',
  what: 'Event Hubs is a managed streaming platform: producers append events to an ordered, partitioned log, and many consumers read it independently at their own pace. It handles millions of events per second, retains data for a configurable period so consumers can replay, and speaks the **Apache Kafka protocol** so existing Kafka clients work unchanged.\n\nFor AI systems it carries user behaviour, telemetry and model-inference logs into feature pipelines, monitoring and lakes. **Capture** can write the stream to [[blob]] or [[adls]] automatically.',
  flow: ['Producers', 'Event hub (partitions)', 'Consumer groups', 'Stream processing', 'Capture to lake', 'Features / alerts'],
  steps: [
    [0, 'Producers (apps, devices, gateways) send events, using a partition key to keep related events in order.'],
    [1, 'Events are appended to **partitions** of an event hub and retained for the configured period.'],
    [2, 'Each consumer group keeps its own position in each partition, so several systems read the same stream independently.'],
    [3, 'Stream processors ([[fabric|Fabric real-time]], [[databricks]], [[functions]]) enrich and aggregate events.'],
    [4, '**Capture** writes raw events to [[adls]] in Avro or Parquet for later training and audit.'],
    [5, 'Results update online features or trigger alerts in near real time.']
  ],
  gotchas: [
    '**Partition count is hard to change** on lower tiers and caps parallelism. Choose for peak consumer parallelism.',
    '**Ordering is per partition only.** Choose the key (such as user ID) that needs ordering.',
    '**Delivery is at least once.** Consumers must tolerate duplicates and checkpoint their position correctly.',
    '**Retention is not an archive.** Use Capture for the long-term copy.',
    'Hot partitions from skewed keys throttle one partition while others sit idle.'
  ],
  edges: [
    'Schema Registry helps keep producers and consumers in agreement as event shapes evolve.',
    'Throughput is purchased in units whose type varies by tier; confirm the unit for yours.',
    'Geo-replication and disaster recovery options differ by tier.'
  ],
  ml: [
    'Real-time behaviour events that feed online features and recommenders.',
    'Collecting model-inference logs and feedback for monitoring and future training sets.',
    'Streaming ingestion into a lakehouse for continuous data preparation.',
    'Kafka-compatible endpoint for teams migrating existing streaming code.'
  ],
  pairs: ['fabric', 'databricks', 'functions', 'adls', 'aml-feature-store', 'service-bus'],
  cost: 'Billed by throughput capacity (units or processing units) per hour, plus ingress events and optional Capture. Cost tracks provisioned throughput more than actual volume on dedicated tiers.'
});

S({
  id: 'service-bus', cat: 'streaming', name: 'Azure Service Bus', doc: 'azure/service-bus-messaging/',
  tag: 'Enterprise queues and topics with sessions, dead-lettering and exactly-once-style controls.',
  what: 'Service Bus is a managed message broker. **Queues** deliver each message to one consumer; **topics** with **subscriptions** deliver copies to many. It provides features that matter for business workflows: **dead-letter queues**, **duplicate detection**, **sessions** for ordered per-key processing, scheduled delivery and transactions.\n\nIn AI systems it buffers slow work (embedding, document extraction, long agent runs) between a fast front end and slower workers, and absorbs bursts so a model deployment is not overwhelmed.',
  flow: ['Producer', 'Queue / topic', 'Lock + deliver', 'Worker', 'Complete or abandon', 'Dead-letter'],
  steps: [
    [0, 'A front end sends a message describing the job (a document URL, a prompt, a task ID), not the payload itself.'],
    [1, 'Service Bus stores it durably in a **queue** or fans it out to a **topic**\'s subscriptions.'],
    [2, 'A worker **receives** the message, which locks it for a period so no other worker takes it.'],
    [3, 'The worker does the job: extraction, a model call, a tool action.'],
    [4, 'On success it **completes** the message; on failure it abandons it and the message is redelivered.'],
    [5, 'After the maximum delivery count the message moves to the **dead-letter queue** for inspection.']
  ],
  gotchas: [
    '**Lock duration must exceed processing time.** If a model call takes longer than the lock, the message is redelivered and processed twice. Renew locks or use a smaller task.',
    '**Delivery is at least once.** Make consumers idempotent, or enable duplicate detection with a stable message ID.',
    '**Message size is limited** (large on premium, smaller on standard). Pass references to [[blob]], not documents.',
    '**Dead-letter queues need an owner.** An unwatched DLQ is where failed work silently piles up.',
    '**Sessions limit parallelism** to one consumer per session; use only where ordering truly matters.'
  ],
  edges: [
    'Premium tier gives dedicated capacity, larger messages and virtual-network integration.',
    'Auto-forwarding and filters let you build routing without code.',
    'Scheduled messages implement delayed retries and timeouts cleanly.'
  ],
  ml: [
    'Work queue for document extraction and embedding pipelines, scaled by [[container-apps]] or [[functions]].',
    'Backpressure in front of a rate-limited model deployment.',
    'Reliable delivery of agent task requests, with retry and dead-letter handling.',
    'Topic fan-out when one event must trigger several independent enrichments.'
  ],
  pairs: ['functions', 'container-apps', 'durable-functions', 'event-grid', 'foundry-models'],
  cost: 'Standard tier bills a base charge plus per-operation; Premium bills per messaging unit per hour for dedicated capacity. Cost is modest next to model spend, but dead-letter growth and long retention add storage.'
});

S({
  id: 'event-grid', cat: 'streaming', name: 'Azure Event Grid', doc: 'azure/event-grid/',
  tag: 'Push-based event routing: react to changes in Azure and in your own apps.',
  what: 'Event Grid routes events from a **source** (a storage account, a resource group, your own application) to **handlers** (Functions, Service Bus, webhooks, Event Hubs) using subscriptions and filters. It is built for discrete notifications such as "a blob was created" or "a deployment finished", and delivers them reliably with retries.\n\nIt also offers **namespace topics** with MQTT support and pull delivery for more broker-like needs. In AI systems its most common job is turning "a document arrived" into "start the ingestion workflow".',
  flow: ['Event source', 'Topic', 'Subscription + filter', 'Handler', 'Retry', 'Dead-letter'],
  steps: [
    [0, 'A source such as [[blob]] emits an event (for example, `BlobCreated`) describing what happened.'],
    [1, 'The event is published to a **topic** (system topic for Azure sources, custom topic for yours).'],
    [2, 'Each **subscription** applies filters (subject prefix, event type, advanced filters) and forwards matches.'],
    [3, 'The handler ([[functions]], [[service-bus]], a webhook) receives the event and starts work.'],
    [4, 'If the handler fails, Event Grid retries with backoff for a configured window.'],
    [5, 'Undeliverable events go to a **dead-letter destination** in storage for inspection.']
  ],
  gotchas: [
    '**Events carry metadata, not data.** The event says what changed; the handler fetches the object. Do not expect the document in the event.',
    '**Delivery is at least once and not strictly ordered.** Handlers must be idempotent.',
    '**Retries are time-bounded.** Without a dead-letter destination, events are dropped after the retry window.',
    '**Webhook endpoints must validate** the subscription handshake and be secured; do not expose an open endpoint.',
    'It is a router, not a buffer: for work that needs queueing and throttling, put [[service-bus]] behind it.'
  ],
  edges: [
    'Advanced filters can match on payload fields, reducing handler invocations.',
    'Event Grid can deliver CloudEvents schema for portability.',
    'Namespace topics add pull delivery and MQTT for device and broker scenarios.'
  ],
  ml: [
    'Trigger ingestion and indexing when documents land in storage.',
    'Notify downstream systems when a model version is registered or a training run completes.',
    'React to resource and policy changes in governance automations.',
    'Fan-out of AI-app domain events to several independent consumers.'
  ],
  pairs: ['blob', 'functions', 'service-bus', 'logic-apps', 'aml-pipelines'],
  cost: 'Billed per million operations (publishes, deliveries, filters), with a free monthly allowance. At typical volumes it is among the cheapest parts of the platform.'
});

S({
  id: 'logic-apps', cat: 'streaming', name: 'Azure Logic Apps', doc: 'azure/logic-apps/',
  tag: 'Low-code workflows with hundreds of connectors, including agent and approval patterns.',
  what: 'Logic Apps builds workflows from **triggers** and **actions** using a visual designer and over a thousand managed connectors (Microsoft 365, Salesforce, SAP, ServiceNow and more). Workflows can be **stateful** (history and long waits) or **stateless** (fast, short-lived). Recent additions support **agent workflows**, where a model decides which connector actions to call.\n\nIt is the practical way to connect an AI step to the business systems around it, and to add **human approval** (email or Teams) without writing integration code. Microsoft now also presents many connectors and MCP servers as part of its Foundry Tools catalogue.',
  flow: ['Trigger', 'Workflow run', 'Connector actions', 'AI step', 'Approval wait', 'Outcome'],
  steps: [
    [0, 'A trigger starts the workflow: an email arrives, a record changes, a message lands on [[service-bus]], or an HTTP call comes in.'],
    [1, 'The run starts and its state and inputs are recorded in run history.'],
    [2, 'Connector actions fetch and update data in other systems, authenticated with managed identity or stored connections.'],
    [3, 'An action calls a model in [[foundry-models]] (or an agent) to classify, summarise or decide.'],
    [4, 'For sensitive steps, the workflow **waits for approval** from a person, possibly for days.'],
    [5, 'On approval the workflow performs the action and logs the result.']
  ],
  gotchas: [
    '**Per-action pricing adds up in loops.** A for-each over thousands of items multiplies cost; push batch work to code or Data Factory.',
    '**Connection credentials are easy to over-grant.** A connector acting as a shared account is a standing risk; use per-workflow identities.',
    '**Run history may hold sensitive data.** Secure inputs and outputs on actions that handle personal data.',
    '**Designer workflows are code too.** Without source control and deployment pipelines they drift between environments.',
    'Throttling by downstream connectors is common; configure retry and concurrency.'
  ],
  edges: [
    '**Consumption** (multi-tenant, pay per action) and **Standard** (single-tenant, fixed plan, virtual-network integration) have different features and costs.',
    'Workflows can be exposed as tools to agents, giving them governed access to connectors.',
    'Expression language and connector quirks have a learning curve; keep complex logic in [[functions]].'
  ],
  ml: [
    'Human-in-the-loop approvals for agent actions that change business records.',
    'Connecting a model step to ERP, CRM and ticketing without custom integration code.',
    'Event-driven document intake: classify an email attachment, extract data, route.',
    'Giving agents a curated, auditable set of business actions as tools.'
  ],
  pairs: ['durable-functions', 'functions', 'foundry-agent-service', 'service-bus', 'entra-id', 'event-grid'],
  cost: 'Consumption bills per action and trigger execution, with premium connectors costing more; Standard bills for a dedicated plan (vCPU and memory) regardless of runs. Loops and polling triggers drive consumption cost.'
});

S({
  id: 'durable-functions', cat: 'streaming', name: 'Durable Functions', doc: 'azure/azure-functions/durable/',
  tag: 'Code-first, stateful workflows on Functions: fan-out, retries, timers and human approval.',
  what: 'Durable Functions extends [[functions|Azure Functions]] with workflows written as ordinary code. An **orchestrator function** calls **activity functions**, waits for timers or external events, and fans out in parallel. The framework checkpoints progress to storage, so a workflow can run for days and survive restarts. The orchestrator replays its history to rebuild its state.\n\nIt is the code-first counterpart to [[logic-apps]], and a natural fit for agentic and document workflows that need retries, parallel steps and **human approval gates**.',
  flow: ['Client starts orchestration', 'Orchestrator', 'Activity functions', 'Checkpoint (history)', 'Wait for event / timer', 'Result'],
  steps: [
    [0, 'A client (HTTP trigger, queue message) starts an orchestration with an instance ID and input.'],
    [1, 'The orchestrator function runs your workflow code, deciding which activity to call next.'],
    [2, 'Activity functions do the real work (a model call, a database write), possibly many in parallel (**fan-out/fan-in**).'],
    [3, 'After each step, the framework **checkpoints** progress to a storage backend, then the orchestrator unloads while waiting.'],
    [4, 'The orchestration can **wait for an external event**, such as an approval, or a durable timer, at no compute cost.'],
    [5, 'When the event arrives or the timer fires, the orchestrator replays from history and continues to completion.']
  ],
  gotchas: [
    '**Orchestrator code must be deterministic.** No random numbers, current time, network calls or direct I/O in the orchestrator; do those in activities. Violations cause replay errors.',
    '**Activities may run more than once.** Make them idempotent.',
    '**History grows.** Very long loops need `continue-as-new` or sub-orchestrations to keep history bounded.',
    '**Payloads are limited.** Pass references to [[blob]] instead of large data between steps.',
    '**Versioning running instances is hard.** Changing orchestrator logic while instances are in flight can break replay; plan side-by-side deployments.'
  ],
  edges: [
    'Different storage backends (Azure Storage, Netherite, a managed Durable Task Scheduler) trade throughput, cost and features.',
    'Entities (durable, addressable state) support patterns such as per-user counters and locks.',
    'The Durable Task framework also powers agent-style long-running workflows in the Functions ecosystem.'
  ],
  ml: [
    'Document-processing workflows: extract, validate, enrich, wait for review, publish.',
    'Agent tool pipelines with bounded retries and a human approval step before a write.',
    'Fan-out of embedding or evaluation tasks with a join at the end.',
    'Long-running training or batch jobs that call [[aml-pipelines]] and wait for completion.'
  ],
  pairs: ['functions', 'logic-apps', 'service-bus', 'foundry-agent-service', 'blob'],
  cost: 'You pay the underlying Functions plan plus the storage or scheduler used for checkpoints. Waiting is free of compute; high orchestration counts and large histories raise storage transaction costs.'
});

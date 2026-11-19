/* Data & Analytics */
S({
  id: 'fabric', cat: 'analytics', name: 'Microsoft Fabric', doc: 'fabric/',
  tag: 'One SaaS lakehouse platform: OneLake storage, Spark, SQL, pipelines and Power BI, with data agents.',
  what: 'Microsoft Fabric is a software-as-a-service analytics platform. Its centre is **OneLake**, a single logical data lake per tenant where all Fabric workloads store data as Delta/Parquet. On top sit experiences for **data engineering (Spark)**, **data warehousing (SQL)**, **real-time intelligence**, **data science**, **pipelines** and **Power BI**, all drawing on shared capacity.\n\nFor AI systems Fabric matters in three ways: it is where analytical data is prepared, it exposes that data to Foundry and Copilot experiences (including **data agents** that answer questions over governed data), and **shortcuts** let it read data in place from ADLS and other stores without copying.',
  flow: ['Sources', 'Pipelines / Dataflows', 'OneLake (Delta)', 'Spark / SQL engines', 'Semantic model / data agent', 'AI + BI consumers'],
  steps: [
    [0, 'Data arrives from operational systems, files and streams, or is referenced in place through **shortcuts** to [[adls]] and other clouds.'],
    [1, 'Data pipelines and dataflows ingest and shape the data on a schedule or trigger.'],
    [2, 'Results are stored in **OneLake** as Delta tables in lakehouses and warehouses, one copy for every engine.'],
    [3, 'Spark notebooks, SQL and real-time engines transform and enrich it, all billed against the same capacity.'],
    [4, 'Curated tables back **semantic models** and **data agents**, with workspace and item permissions applied.'],
    [5, 'Power BI, notebooks, [[foundry]] agents and external tools consume the data.']
  ],
  gotchas: [
    '**Capacity is shared.** Every Fabric workload draws on the same capacity units, so a heavy Spark job can slow dashboards. Isolate production and experiments in separate capacities.',
    '**Throttling and smoothing.** Overuse is smoothed over time and then throttled; watch the capacity metrics app and set alerts.',
    '**Governance is easy to under-do.** Workspace roles are broad. Apply sensitivity labels, item-level permissions and [[purview]] policies early.',
    '**Feature maturity varies by workload.** Confirm GA status for the experiences you depend on.',
    '**Fabric versus Databricks is a real decision**, not a default; see the guide on where analytics and training data live.'
  ],
  edges: [
    '**Mirroring** replicates operational databases (such as Cosmos DB or SQL) into OneLake near real time, with no pipeline to build.',
    'Direct Lake mode lets Power BI read Delta files without importing a copy.',
    'Fabric capacities are pausable, which suits development and bursty workloads.'
  ],
  ml: [
    'Preparing training, evaluation and fine-tuning datasets from business data with Spark notebooks.',
    '**Data agents** that let users ask natural-language questions of governed tables, an alternative to hand-built text-to-SQL.',
    'Operational mirroring from [[cosmos]] and [[sql]] gives analytics and AI a fresh copy without load on the source.',
    'Fabric notebooks can train and track models with MLflow, and register them for deployment elsewhere.'
  ],
  pairs: ['adls', 'databricks', 'purview', 'adf', 'foundry', 'cosmos'],
  cost: 'Billed by **capacity** (capacity units reserved per hour, pausable) plus OneLake storage. All workloads share the capacity, so cost control is about sizing, pausing and workload isolation rather than per-query pricing.'
});

S({
  id: 'databricks', cat: 'analytics', name: 'Azure Databricks', doc: 'azure/databricks/',
  tag: 'The Databricks lakehouse as a first-party Azure service: Spark, Delta, MLflow and Mosaic AI.',
  what: 'Azure Databricks is the Databricks platform running as a first-party Azure service, integrated with Microsoft Entra ID, [[adls]] and Azure networking. It is built on Apache Spark and **Delta Lake**, with **Unity Catalog** for governance, **MLflow** for experiment tracking and a registry, and **Mosaic AI** tools for training, serving and agents.\n\nChoose it when you have a data-engineering and ML team that already knows Spark and Databricks, need advanced ML or streaming features, or run multi-cloud. For many Microsoft-centred organisations it sits alongside [[fabric]] rather than replacing it.',
  flow: ['Data in ADLS', 'Unity Catalog', 'Cluster / serverless compute', 'Delta tables + features', 'MLflow / model serving', 'Consumers'],
  steps: [
    [0, 'Raw and curated data lives as Delta tables in [[adls]]; the workspace reaches it with a managed identity or a Unity Catalog storage credential.'],
    [1, '**Unity Catalog** defines catalogs, schemas and tables, with fine-grained access control and lineage across workspaces.'],
    [2, 'A job or notebook runs on a cluster (or serverless compute) that autoscale and terminate when idle.'],
    [3, 'Transform jobs write Delta tables, including feature tables used for training and serving.'],
    [4, 'Models are tracked and registered with MLflow and can be deployed to a model-serving endpoint.'],
    [5, 'Downstream applications, [[fabric]] and BI tools query the tables or call the endpoint.']
  ],
  gotchas: [
    '**Clusters left running are expensive.** Set auto-termination and use job clusters or serverless for scheduled work.',
    '**Two governance layers.** Unity Catalog and Azure RBAC both apply, and misaligned grants are a common source of "access denied" surprises.',
    '**Network design matters.** Secure cluster connectivity and VNet injection decisions are hard to change after workspace creation.',
    '**Cost is two bills**: Databricks units (DBUs) and the underlying Azure VMs, unless you use serverless.',
    '**Do not duplicate Fabric and Databricks pipelines** without a plan; two copies of the lake drift apart.'
  ],
  edges: [
    'Photon, the vectorised engine, speeds SQL and ETL but is billed at a higher DBU rate; measure before enabling everywhere.',
    'Delta tables can be exposed to Fabric through OneLake shortcuts, so both platforms can read one copy.',
    'Workspaces map to environments; plan a promotion path (dev, test, prod) and use infrastructure as code.'
  ],
  ml: [
    'Large-scale feature engineering and training-set construction on Spark.',
    'Distributed training and fine-tuning with experiment tracking, then registration for serving.',
    'Streaming ingestion and enrichment that feeds real-time features.',
    'Teams standardised on Databricks can run model serving there, or register models to [[aml-endpoints|Azure ML endpoints]].'
  ],
  pairs: ['adls', 'fabric', 'purview', 'adf', 'aml-feature-store', 'entra-id'],
  cost: 'You pay Databricks Units per hour by workload type (jobs, SQL, interactive, serverless) plus the Azure VM, storage and network costs of the cluster. Commitment discounts exist. Auto-termination and job clusters are the main controls.'
});

S({
  id: 'adf', cat: 'analytics', name: 'Azure Data Factory', doc: 'azure/data-factory/',
  tag: 'Managed data movement and orchestration: copy, transform and schedule pipelines.',
  what: 'Data Factory is a managed service for building **pipelines** that copy and transform data between many sources and sinks, on a schedule or in response to events. It offers over a hundred connectors, **mapping data flows** (visual Spark-based transforms), and control activities such as loops, conditions and calls to other services.\n\nIn AI systems it is the dependable way to land data in the lake, refresh vector indexes and kick off training or batch-scoring runs. Microsoft Fabric has its own Data Factory experience, so new analytics projects often start there; classic Data Factory remains the choice for existing estates and some connectors.',
  flow: ['Trigger', 'Pipeline', 'Integration runtime', 'Copy / data flow', 'Sink (Blob, lake)', 'Monitor / alert'],
  steps: [
    [0, 'A schedule, tumbling window or storage event ([[event-grid]]) starts a pipeline run.'],
    [1, 'The pipeline runs its activities in order, with branches, loops and parameters.'],
    [2, 'An **integration runtime** (Azure-managed, or self-hosted for private networks) provides the compute that talks to sources.'],
    [3, 'A **Copy activity** moves data, or a **data flow** transforms it at scale.'],
    [4, 'Results land in [[blob]] or [[adls]]; a follow-on activity can call an Azure ML pipeline or an indexer run.'],
    [5, 'Run history and alerts go to [[azure-monitor]]; failures can retry or notify.']
  ],
  gotchas: [
    '**Parameterise, do not copy.** Hundreds of near-identical pipelines are a maintenance trap; use metadata-driven pipelines.',
    '**Self-hosted integration runtimes are machines you operate**, with their own availability and patching.',
    '**Data flows start Spark clusters**, which adds start-up time and cost; use Copy activity when no transformation is needed.',
    '**Secrets belong in [[key-vault]]**, referenced from linked services, not pasted into pipelines.',
    'Source-control integration is essential; otherwise changes are made live with no review.'
  ],
  edges: [
    'Tumbling-window triggers handle backfills and dependencies better than plain schedules.',
    'Fabric pipelines are the forward path for new analytics work; check parity for the connectors you need.',
    'Throughput on a Copy activity is governed by data integration units and source limits.'
  ],
  ml: [
    'Nightly or incremental loads that feed the lake and feature pipelines.',
    'Re-index and re-embed pipelines that refresh [[ai-search]] when source documents change.',
    'Triggering [[aml-pipelines]] training or batch-scoring after fresh data lands.',
    'Moving data between clouds or on-premises systems into Azure for training.'
  ],
  pairs: ['blob', 'adls', 'fabric', 'databricks', 'aml-pipelines', 'key-vault'],
  cost: 'Billed per pipeline activity run, per data integration unit hour for copies, and per vCore hour for data flows; self-hosted runtimes cost only the machines. Costs rise with the number of activities and data-flow time.'
});

S({
  id: 'purview', cat: 'analytics', name: 'Microsoft Purview', doc: 'purview/',
  tag: 'Data governance, classification, lineage and policy across your data estate and AI apps.',
  what: 'Purview is Microsoft\'s data governance and compliance family. For data, it provides a **Unified Catalog** with scanning, classification and lineage across Azure, Fabric and other sources. For compliance, it adds **sensitivity labels**, **data loss prevention**, retention and audit, and extensions that cover **AI interactions** with Microsoft 365 Copilot and Foundry-built apps.\n\nIts value to an AI team is practical: it answers "what data do we have, who owns it, how sensitive is it, and where did this training set come from?" before a reviewer asks.',
  flow: ['Scan sources', 'Classify + label', 'Catalog + lineage', 'Policy', 'AI app uses data', 'Audit'],
  steps: [
    [0, 'Purview scans registered sources ([[adls]], [[blob]], [[sql]], [[fabric]] and others) on a schedule.'],
    [1, 'Classifiers detect sensitive data types (personal data, financial identifiers) and apply **sensitivity labels**.'],
    [2, 'Assets, owners, glossary terms and **lineage** from pipelines are collected into the catalog.'],
    [3, 'Policies decide who may access labelled data and whether it may be used in AI scenarios.'],
    [4, 'Services that honour labels, such as [[ai-search]] with permission-aware retrieval, respect them when grounding a model.'],
    [5, 'Audit and activity logs record data and AI interactions for compliance review.']
  ],
  gotchas: [
    '**Scanning is not enforcement.** Knowing a column holds personal data does not stop a pipeline from copying it; policies and labels must be wired into the consuming services.',
    '**Coverage gaps are silent.** Unregistered sources do not appear in the catalog. Treat registration as part of onboarding a data source.',
    '**Ownership data rots.** Assign owners and review them; a catalog full of orphaned assets is little help.',
    '**Purview is a family of products** with different licences, scopes and portals. Be clear which capability you need.',
    'Lineage depends on the connector; not every pipeline step is captured.'
  ],
  edges: [
    'Sensitivity labels can follow files into Microsoft 365 and be used as retrieval filters for Copilot-style grounding.',
    'Custom classifiers can detect organisation-specific identifiers.',
    'Data-quality and data-product features overlap with other governance tools; decide which is authoritative.'
  ],
  ml: [
    'Proving where training and fine-tuning data came from, and that its use is permitted.',
    'Keeping sensitive data out of indexes and prompts through labels and DLP rules.',
    'Auditing AI interactions in Microsoft 365 Copilot and supported Foundry apps.',
    'Providing owners and glossary so evaluation sets are traceable.'
  ],
  pairs: ['adls', 'fabric', 'databricks', 'ai-search', 'm365-copilot', 'azure-policy'],
  cost: 'Billed by capability: catalog and scanning are consumption-based (scan hours, assets), while compliance features are licensed per user. Scope scans to avoid scanning cold or irrelevant data.'
});

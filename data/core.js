/* Shared registry + category definitions.
   Every service file calls S({...}). Schema:
   id, cat, name, tag, doc (path under learn.microsoft.com/azure/), what,
   flow:[labels], steps:[[flowIndex, text]], gotchas:[], edges:[], ml:[], pairs:[ids], cost
   Text supports `code`, **bold**, and [[service-id]] / [[service-id|label]] links. */
window.ATLAS = { categories: [], services: [], architectures: [], decisions: [] };
window.S = function (o) { window.ATLAS.services.push(o); };

window.ATLAS.categories = [
  {
    id: 'compute', name: 'Compute & Accelerators', hue: 212,
    short: 'GPU virtual machines, Kubernetes, serverless containers, functions and batch.',
    intro: 'AI systems are bottlenecked by two things: accelerator capacity and how quickly you can keep it busy. This category covers where code and models actually run, from a single Azure Function to thousands of GPUs on an InfiniBand fabric.\n\nThe key split is **spiky and small** (Functions, Container Apps) versus **sustained and accelerated** (GPU virtual machines, AKS). Most real systems use both: a thin serverless layer in front and a fat accelerated layer behind it.',
    lens: 'Ask three questions: does it need a GPU, how long does one unit of work run, and how bursty is the load? Those answers pick the service for you. Then check **GPU quota in your subscription and Region** before you design around any GPU SKU.'
  },
  {
    id: 'storage', name: 'Storage', hue: 42,
    short: 'Where datasets, checkpoints, models and embeddings live.',
    intro: 'Storage choices decide training throughput and the bill. Blob storage is the system of record for almost everything in ML: raw data, features, checkpoints and model artifacts. File shares and parallel file systems appear when a job needs POSIX semantics or very high sustained throughput.',
    lens: 'Keep **Blob (with a hierarchical namespace where you need one) as the source of truth**, and add a faster tier (Azure Managed Lustre, local NVMe) only where a profiler shows GPUs waiting on data.'
  },
  {
    id: 'databases', name: 'Databases & Vector Stores', hue: 150,
    short: 'Operational data, caches and similarity search.',
    intro: 'Generative AI made the database layer matter more: retrieval needs a vector index, agents need low-latency memory, and chat apps need durable state. On Azure you can add vector search to a database you already run, or use a purpose-built search service.',
    lens: 'Prefer adding vectors to a store you already operate until scale, latency or filtering needs prove otherwise. Moving embeddings later is easy; running one more database is permanent.'
  },
  {
    id: 'analytics', name: 'Data & Analytics', hue: 178,
    short: 'Lakehouse, ETL, big-data engines and governance.',
    intro: 'Models are only as good as the data pipeline behind them. These services turn raw files and events into clean, governed, queryable datasets: the training sets, feature tables and evaluation data of an ML system.',
    lens: 'Think in layers: **land** raw data in the lake, **catalog** it, **transform** it, **query** it, **govern** it. On Azure the first decision is whether your lakehouse is Microsoft Fabric, Azure Databricks, or both.'
  },
  {
    id: 'streaming', name: 'Streaming & Orchestration', hue: 232,
    short: 'Queues, streams, events and workflows that glue systems together.',
    intro: 'Production AI is asynchronous. Embedding jobs queue up, user events stream into feature pipelines, and multi-step agent or document workflows need retries and state. These services carry messages and coordinate work.',
    lens: 'Choose by delivery semantics and replay needs: a **queue** (Service Bus) hands each message to one worker, a **stream** (Event Hubs) keeps an ordered log many readers can replay, and an **event router** (Event Grid) pushes by rules.'
  },
  {
    id: 'genai', name: 'Generative AI', hue: 268,
    short: 'Foundry, models, agents, retrieval and content safety as managed services.',
    intro: 'Microsoft Foundry is the managed front door to foundation models (OpenAI models, plus models from Anthropic, Meta, Mistral and others in the catalog), with the supporting pieces for agents, retrieval, safety and evaluation. If you want to call, ground and govern LLMs without running GPU fleets, start here.',
    lens: 'Start with the highest-level service that meets the requirement (Foundry Models, then Azure AI Search for grounding, then Foundry Agent Service), and drop down to Azure Machine Learning or raw GPU VMs only when you need control the managed layer will not give you.'
  },
  {
    id: 'ml', name: 'ML Platform (Azure Machine Learning)', hue: 300,
    short: 'Train, tune, register, deploy and monitor your own models.',
    intro: 'Azure Machine Learning is the managed platform for the classic ML lifecycle and for training or hosting custom and open-weight models. It covers workspaces, distributed training, pipelines, a model registry, managed feature stores, several kinds of endpoint, and monitoring.',
    lens: 'Use Azure Machine Learning when **you own the model**: custom training, fine-tuning, or hosting open weights. Use Foundry Models when you are consuming a model someone else trains. The two share a workspace lineage, so they are not either/or.'
  },
  {
    id: 'aiservices', name: 'Foundry Tools (pre-built AI)', hue: 332,
    short: 'API-call AI for documents, speech, vision, language and translation.',
    intro: 'These are task-specific models behind an API: no training, no infrastructure. Microsoft now groups them under the name **Foundry Tools** (formerly Azure AI Services). They remain the fastest route for well-defined tasks like OCR, transcription or translation, and they pair naturally with LLMs, which are strong at reasoning but wasteful at extraction.',
    lens: 'Use a specialist service for the **extraction** step and an LLM for the **reasoning** step. It is usually cheaper, faster and easier to audit than asking an LLM to do both.'
  },
  {
    id: 'networking', name: 'Networking & Delivery', hue: 195,
    short: 'How requests reach models, and how services talk privately.',
    intro: 'Latency, privacy and streaming behaviour of AI endpoints are largely decided by the network path. This category covers fronting model endpoints with an AI gateway, keeping traffic off the public internet, and delivering responses globally.',
    lens: 'Draw the request path end to end and note every timeout and payload limit on it. The smallest one wins, and it is usually not the one you set.'
  },
  {
    id: 'security', name: 'Security & Identity', hue: 6,
    short: 'Identity, secrets, threat protection and policy.',
    intro: 'AI workloads concentrate sensitive data and expensive resources. A leaked API key can run up a five-figure GPU or token bill, and a careless prompt log can leak customer data. These services are the controls that prevent both.',
    lens: 'Start from **identity** (who can call what, ideally with managed identities and no keys), then **data** (who can read it, encrypted with whose key), then **network** (what can reach it).'
  },
  {
    id: 'ops', name: 'Observability & Operations', hue: 88,
    short: 'Metrics, logs, traces, cost and infrastructure as code.',
    intro: 'ML systems fail quietly: latency creeps up, quality drifts, costs spike. Observability turns those into signals, and infrastructure as code makes the whole platform reproducible.',
    lens: 'Instrument three layers: **infrastructure** (GPU utilisation, queue depth), **service** (latency, errors, throttles), and **model quality** (drift, eval scores, content-filter hits).'
  }
];

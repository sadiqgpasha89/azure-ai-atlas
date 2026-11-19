/* Databases & Vector Stores */
S({
  id: 'cosmos', cat: 'databases', name: 'Azure Cosmos DB', doc: 'azure/cosmos-db/',
  tag: 'Globally distributed NoSQL with built-in vector search, for agent memory and chat state.',
  what: 'Cosmos DB is a fully managed, horizontally scaled database with single-digit-millisecond reads and writes. Data lives in **containers** partitioned by a **partition key**, and throughput is measured in **request units (RU/s)**. The NoSQL API supports **vector indexes** (including DiskANN-based indexes) and full-text and hybrid search, so embeddings can sit next to the documents they describe.\n\nIn AI systems it is the default place for **conversation history, agent memory and session state**, and a reasonable vector store when your data is already there. Multi-Region replication and several consistency levels are built in.',
  flow: ['App / agent', 'Partition key routing', 'Container (RU/s)', 'Vector + text index', 'Replicas', 'Change feed'],
  steps: [
    [0, 'An application or agent writes a document, such as a conversation turn or a memory record, authenticating with a managed identity.'],
    [1, 'Cosmos DB routes the request by **partition key** (for example user or tenant ID) to the right physical partition.'],
    [2, 'The operation consumes request units; if the container exceeds its provisioned or autoscale RU/s, the request is throttled (HTTP 429).'],
    [3, 'The document and its embedding field are added to the **vector index** defined in the container policy.'],
    [4, 'A query combines vector distance with filters on the same partition key and properties, optionally with full-text for hybrid search.'],
    [5, 'The data is replicated to other Regions, and the **change feed** lets downstream jobs react to new items.']
  ],
  gotchas: [
    '**The partition key is a one-way door.** A bad key creates hot partitions and cross-partition queries. Choose by access pattern (often tenant or user ID).',
    '**Vector policy must be set when the container is created.** Dimensions and index type are not freely changeable afterwards; plan embedding model changes.',
    '**Vector searches cost RUs**, scaling with dimensions and index size. Load-test queries, not only writes.',
    '**Throttling (429) is normal under load.** Clients need retry with backoff, and autoscale RU/s needs sensible ceilings.',
    '**Cross-partition vector queries are costlier** than queries scoped to a partition key. Filter on the key whenever you can.'
  ],
  edges: [
    'Consistency levels trade latency and availability against staleness; most apps use **session** consistency.',
    '**Time to live (TTL)** can expire old conversation turns automatically, which helps both cost and privacy.',
    '**Serverless**, **provisioned** and **autoscale** throughput modes exist; the right one depends on how spiky the load is.',
    'Document size is limited to a few megabytes; store large payloads in [[blob]] and keep a reference.'
  ],
  ml: [
    'Durable chat history and **agent memory** that survives restarts, scoped by user and tenant.',
    'Vector search over product, ticket or profile data that already lives in Cosmos DB.',
    'Semantic cache of previous answers keyed by embedding, with TTL.',
    'Feature and profile lookups for real-time scoring next to [[redis|Managed Redis]].'
  ],
  pairs: ['ai-search', 'redis', 'foundry-agent-service', 'agent-framework', 'blob', 'entra-id'],
  cost: 'Billed on throughput (provisioned or autoscale RU/s, or per-RU in serverless) plus storage and per Region replicated. Vector and full-text indexes add storage and RU cost. Partitioning decisions drive RU efficiency.'
});

S({
  id: 'postgres', cat: 'databases', name: 'Azure Database for PostgreSQL', doc: 'azure/postgresql/',
  tag: 'Managed Postgres with pgvector and the azure_ai extension, to add vectors to relational data.',
  what: 'Azure Database for PostgreSQL (flexible server) is managed Postgres. The **pgvector** extension adds a vector type and approximate nearest-neighbour indexes (HNSW and IVFFlat), and the **azure_ai** extension lets SQL call Azure model endpoints to create embeddings. Some tiers also offer a **DiskANN** vector index for larger collections.\n\nIt is the usual choice when your operational data is relational and you want retrieval **in the same transaction and permission model** as the rest of the data. Row-level security can enforce per-user filtering inside the database.',
  flow: ['App', 'Connection pool', 'Postgres + pgvector', 'Vector index', 'Row-level security', 'Result'],
  steps: [
    [0, 'The application connects with an Entra identity and a connection pooler, so many short-lived requests do not exhaust connections.'],
    [1, 'A query computes or receives the question embedding (the `azure_ai` extension can call [[foundry-models]] from SQL).'],
    [2, 'Postgres plans the query: filters and ordering by vector distance (`<=>` or `<->`).'],
    [3, 'An **HNSW or DiskANN index** returns approximate nearest neighbours; a filter may be applied before or after the index scan.'],
    [4, '**Row-level security** policies drop rows the current user may not see.'],
    [5, 'The application passes the rows to the model as grounding context.']
  ],
  gotchas: [
    '**Filtered vector search can lose recall.** If a selective filter is applied after the index returns candidates, you may get too few results. Test with your real filters and tune search parameters.',
    '**Index build is memory-hungry.** Building a large HNSW index can need a lot of memory and time; plan maintenance windows and size accordingly.',
    '**Embedding dimension and model are baked into the column.** Changing models means re-embedding and rebuilding the index.',
    '**Calling a model from SQL** couples your database latency and availability to the model endpoint. Prefer to embed in the application for hot paths.',
    '**Connections are scarce.** Serverless apps that open a connection per request will exhaust them; use pooling.'
  ],
  edges: [
    'Exact (non-indexed) search is accurate and fine for small tables; add an index only when latency demands it.',
    'Read replicas can serve retrieval traffic without loading the primary.',
    'Extensions available depend on the service version and must be allow-listed before use.'
  ],
  ml: [
    'RAG over relational data with per-user filtering enforced by the database.',
    'Hybrid retrieval: SQL filters plus vector ranking plus full-text, in one query.',
    'Small to mid-size vector collections where a separate search service is not yet justified.',
    'Move to [[ai-search]] if you need rich ranking, high query concurrency or multi-source retrieval.'
  ],
  pairs: ['ai-search', 'foundry-models', 'sql', 'entra-id', 'cosmos'],
  cost: 'Billed on compute (vCores, by tier), storage and backup, with reserved capacity discounts. A larger instance is often what a vector workload needs for memory, so size on index size, not only data size.'
});

S({
  id: 'sql', cat: 'databases', name: 'Azure SQL Database', doc: 'azure/azure-sql/',
  tag: 'SQL Server in the cloud, with a native vector data type and a managed vector index.',
  what: 'Azure SQL Database is managed SQL Server. It now has a native **vector** data type and vector functions, so you can store embeddings next to business data and run similarity queries in T-SQL. A vector index for approximate search has been introduced for larger tables; check the current status before relying on it at scale.\n\nIt makes sense when the system of record is already SQL Server: the same security, backup and high-availability story applies, and you avoid copying data to another store just to search it.',
  flow: ['App', 'T-SQL query', 'Vector column', 'Distance function', 'Security predicate', 'Result'],
  steps: [
    [0, 'The application connects with a managed identity and sends a T-SQL query with a query embedding as a parameter.'],
    [1, 'The query joins ordinary tables with a table that has a `VECTOR` column.'],
    [2, 'The engine computes distances (cosine, Euclidean or dot product) exactly, or uses a vector index if one exists.'],
    [3, 'Filters and joins narrow rows; row-level security and dynamic data masking apply as usual.'],
    [4, 'The top rows are returned in rank order.'],
    [5, 'The application assembles them into a prompt for [[foundry-models]].']
  ],
  gotchas: [
    '**Exact search does not scale forever.** It is fine for tens of thousands of rows, but large collections need an approximate index or a search service.',
    '**Feature maturity varies.** Vector features have evolved quickly; confirm GA status and limits for your service tier before committing.',
    '**Dimensions are fixed per column**; changing embedding models means a migration.',
    '**Compute tier sets throughput.** Vector scans are CPU- and memory-heavy and compete with transactional load unless you use a replica.'
  ],
  edges: [
    'Read scale-out replicas can isolate retrieval from transactional traffic.',
    'In-database embedding generation calls a model endpoint from SQL; weigh the latency coupling as with Postgres.',
    'Vectors are stored in a compact binary format, so size grows with dimensions; budget storage accordingly.'
  ],
  ml: [
    'Grounding for assistants over business data that is already in SQL Server.',
    'Similarity search over catalogues, tickets or customer records without ETL to a second store.',
    'Duplicate detection and clustering using vector distance in queries.',
    'Pair with [[ai-search]] when you outgrow in-database retrieval.'
  ],
  pairs: ['postgres', 'ai-search', 'foundry-models', 'entra-id', 'fabric'],
  cost: 'Billed on the chosen purchasing model (vCore or DTU), storage and backups, with serverless and reserved options. Heavy vector scans push you to a bigger compute tier or a read replica.'
});

S({
  id: 'redis', cat: 'databases', name: 'Azure Managed Redis', doc: 'azure/redis/',
  tag: 'In-memory data for semantic caches, rate limits, sessions and fast vector lookups.',
  what: 'Azure Managed Redis is Microsoft\'s managed offering of Redis, running Redis Enterprise software, and it is the current successor to the older Azure Cache for Redis tiers. It keeps data in memory, so reads and writes take well under a millisecond. Modules provide search with **vector similarity**, JSON and time series.\n\nIn AI systems it plays three roles: a **semantic cache** (skip the model when a similar question was answered), a **counter store** for rate limits and token budgets, and a **session store** for short-lived agent state.',
  flow: ['Request', 'Embed question', 'Vector lookup in Redis', 'Hit: return cached answer', 'Miss: call model', 'Store answer + TTL'],
  steps: [
    [0, 'A request arrives at your application or gateway.'],
    [1, 'The question is embedded with a small, cheap embedding model.'],
    [2, 'Redis searches the cache index for a previous question whose vector is within a similarity threshold, scoped by tenant.'],
    [3, 'On a **hit** the stored answer is returned, skipping the model and its cost.'],
    [4, 'On a **miss** the request goes to [[foundry-models]] as normal.'],
    [5, 'The new question, answer and a **TTL** are written back so the next similar question is a hit.']
  ],
  gotchas: [
    '**A wrong threshold returns wrong answers.** Too loose and similar-looking but different questions get the same reply. Measure correctness before and after enabling the cache.',
    '**Scope the cache by tenant, permission and context.** A cache shared across users can leak private answers.',
    '**Memory is the cost driver.** Everything you store is in RAM; set TTLs and eviction policies deliberately.',
    '**Treat it as a cache, not a database.** Persistence options exist, but design so that losing the cache does not lose data.',
    'Clients need reconnect and retry logic; failovers drop connections briefly.'
  ],
  edges: [
    'Exact-match caching on a hash of the full prompt is simpler and safe, and worth doing before a semantic cache.',
    'Token-bucket rate limits implemented in Redis can enforce **per-user or per-tenant budgets** consistently across instances.',
    'Tiers differ in memory-to-compute ratio, with some aimed at memory-heavy workloads such as large caches.'
  ],
  ml: [
    'Semantic cache in front of the model for FAQ-style traffic.',
    'Per-tenant token and request budgets that protect a shared model deployment.',
    'Short-term agent session state and tool result caches.',
    'Low-latency feature lookup for real-time scoring.'
  ],
  pairs: ['apim', 'foundry-models', 'cosmos', 'aml-feature-store', 'foundry-agent-service'],
  cost: 'Billed by the hour for the chosen size and tier (memory and compute) per instance, with optional high availability and persistence adding cost. A cache that cuts model calls usually pays for itself; measure the hit rate.'
});

/* Storage */
S({
  id: 'blob', cat: 'storage', name: 'Azure Blob Storage', doc: 'azure/storage/blobs/',
  tag: 'Object storage: the system of record for datasets, checkpoints, model weights and documents.',
  what: 'Blob Storage stores objects in **containers** inside a **storage account**. It is durable, cheap and effectively unlimited, and almost every AI service on Azure can read from it. Raw documents, training data, checkpoints, model artifacts and evaluation outputs all live here.\n\nBlobs come in **tiers** (hot, cool, cold, archive) to trade access cost for storage cost, and a storage account can enable a **hierarchical namespace** to become [[adls|Data Lake Storage Gen2]]. Access is controlled with Microsoft Entra roles, ideally using managed identities rather than account keys or SAS tokens.',
  flow: ['Producer', 'Storage account + container', 'Tiering / lifecycle', 'Event on change', 'Consumer (job, index, model)', 'Audit'],
  steps: [
    [0, 'A pipeline, user or [[adf|Data Factory]] job uploads an object using a managed identity with a data-plane role such as Storage Blob Data Contributor.'],
    [1, 'The object lands in a container in a storage account, replicated according to the account\'s redundancy setting (LRS, ZRS, GRS and so on).'],
    [2, 'A **lifecycle policy** can move it to cool, cold or archive, or delete it, based on age or last access.'],
    [3, 'A blob-created event can be sent to [[event-grid]], triggering ingestion, indexing or a workflow.'],
    [4, 'Consumers read the data: training jobs, an [[ai-search|AI Search]] indexer, or a model-serving pod loading weights.'],
    [5, 'Storage logs and metrics go to [[azure-monitor]], showing who read what.']
  ],
  gotchas: [
    '**Account keys and SAS tokens are bearer secrets.** Prefer Entra authentication and disable shared-key access where you can.',
    '**Archive tier is offline.** Rehydration takes hours, so never put data there that a training or retrieval job may need soon.',
    '**Throughput is limited per storage account** (and per blob). Large training clusters reading one account can hit throttling; spread data across accounts or use a caching layer.',
    '**Small files are slow.** Millions of tiny objects hurt training input pipelines. Pack them into larger shards.',
    '**Public network access** is on by default for new accounts unless policy says otherwise. Lock it down with private endpoints for sensitive data.'
  ],
  edges: [
    '**Soft delete and versioning** protect against accidental deletes and overwrites, and are worth enabling for model and dataset containers.',
    '**Immutable (WORM) storage** can hold evidence and audit data in a form that cannot be altered.',
    'Event Grid events are at-least-once, so downstream handlers must tolerate duplicates.',
    'Blob NFS and SFTP support exist for tools that cannot use the REST API, with their own limits.'
  ],
  ml: [
    'Single source of truth for raw data, curated datasets, checkpoints and registered model artifacts.',
    'Landing zone for documents feeding a RAG pipeline, with an indexer or event-driven ingestion.',
    'Batch inference input and output location for [[foundry-models]] batch jobs.',
    'Add [[managed-lustre|Managed Lustre]] or local NVMe caching in front of it only where a profiler shows GPUs starved for data.'
  ],
  pairs: ['adls', 'managed-lustre', 'ai-search', 'event-grid', 'adf', 'key-vault'],
  cost: 'Billed per GB stored per month (by tier and redundancy), plus charges per operation and for data retrieval from cooler tiers. Egress across Regions or to the internet is billed separately. Lifecycle rules are the main cost lever.'
});

S({
  id: 'adls', cat: 'storage', name: 'Azure Data Lake Storage Gen2', doc: 'azure/storage/blobs/data-lake-storage-introduction',
  tag: 'Blob Storage with a real directory structure and POSIX-style permissions, for analytics lakes.',
  what: 'Data Lake Storage Gen2 is not a separate product: it is a **Blob Storage account with the hierarchical namespace turned on**. That gives you real directories (rename and delete are fast, atomic operations), POSIX-style access control lists, and an endpoint that big-data engines such as Spark and Fabric understand.\n\nUse it as the foundation of a lake: raw, cleaned and curated zones, with ACLs that let data engineers, scientists and services see only what they should. Microsoft Fabric\'s OneLake and Azure Databricks both read it.',
  flow: ['Raw zone', 'Clean zone', 'Curated zone', 'ACLs + RBAC', 'Spark / SQL engine', 'ML dataset'],
  steps: [
    [0, 'Source systems and ingestion jobs land files unchanged in a **raw** directory tree, partitioned by source and date.'],
    [1, 'Transform jobs ([[databricks]], [[fabric]] or [[adf]]) validate and clean data into a **clean** zone, usually in Delta or Parquet format.'],
    [2, 'Curated tables for specific products, features or training sets are written to a **curated** zone with documented schemas.'],
    [3, 'Access is granted with Azure RBAC at account or container level and ACLs at directory level; the two are evaluated together.'],
    [4, 'Query and processing engines read the namespace through the `abfss://` endpoint.'],
    [5, 'Training jobs and feature pipelines read curated data, with lineage recorded in [[purview]].']
  ],
  gotchas: [
    '**The hierarchical namespace cannot easily be turned off**, and some blob features behave differently with it on. Decide at account creation.',
    '**RBAC and ACLs interact.** A role grant can allow access that ACLs would deny, and a missing execute bit on a parent directory blocks reads below it. Test with the real identity.',
    '**ACLs do not scale to many individuals.** Grant to Entra groups, not users, and set default ACLs so new files inherit them.',
    '**Small files and too many partitions** slow every engine. Compact files and partition on query patterns.',
    'Some older tools and features are not supported on accounts with the namespace enabled; check before migrating an existing account.'
  ],
  edges: [
    '**Delta Lake** adds transactions and time travel on top of files, which is what makes reproducible training sets practical.',
    'OneLake in [[fabric]] can create **shortcuts** to ADLS data, so you can use it from Fabric without copying.',
    'Moving a lake between accounts or Regions is slow and costly; get the account and redundancy layout right first.'
  ],
  ml: [
    'Versioned training and evaluation datasets with reproducible snapshots (Delta time travel).',
    'Zone-based governance: scientists read curated data, only pipelines write to it.',
    'Feature pipelines read here and publish to the [[aml-feature-store|managed feature store]].',
    'Source for knowledge-base ingestion into [[ai-search]] when documents are already in the lake.'
  ],
  pairs: ['blob', 'fabric', 'databricks', 'purview', 'adf', 'aml-feature-store'],
  cost: 'The same pricing as Blob Storage (capacity, operations, tier), with a different price for operations on accounts with the hierarchical namespace. Compute for engines that read it is billed separately.'
});

S({
  id: 'files', cat: 'storage', name: 'Azure Files', doc: 'azure/storage/files/',
  tag: 'Managed SMB and NFS file shares for tools that need a real file system.',
  what: 'Azure Files provides fully managed file shares that mount like a normal network drive, using SMB or NFS. Reach for it when a tool needs file-system semantics: shared notebooks, a common model cache, legacy training code that cannot read object storage, or lift-and-shift workloads.\n\nShares come in **SSD (premium)** and **HDD (standard)** flavours. They are simpler than [[managed-lustre|Managed Lustre]] and slower; they are not meant to feed a large GPU cluster at full speed.',
  flow: ['Client mounts share', 'Auth', 'Share (SSD or HDD)', 'IOPS / throughput limits', 'Snapshots', 'Backup'],
  steps: [
    [0, 'A VM, container or notebook mounts the share over SMB or NFS, through a private endpoint where required.'],
    [1, 'SMB shares authenticate with Entra identities (or AD DS); NFS shares rely on network-level controls.'],
    [2, 'Data is served from the share, which is provisioned with a size that also sets its performance on premium tiers.'],
    [3, 'Reads and writes are limited by the share\'s IOPS and throughput; bursting covers short peaks.'],
    [4, 'Share **snapshots** capture point-in-time copies for rollback.'],
    [5, 'Azure Backup can protect shares for longer retention.']
  ],
  gotchas: [
    '**Performance is capped per share.** Many training workers on one share hit the cap. Copy data to local NVMe or use a parallel file system.',
    '**NFS and SMB differ in features and security.** NFS shares have no user-level authentication; secure them with the network.',
    '**Port 445 may be blocked** by some networks, which breaks SMB mounts from outside Azure.',
    'Mounting in containers needs the right driver and credentials; keys in manifests are a common leak. Use managed identity where supported.'
  ],
  edges: [
    'Premium shares provision capacity and performance together, so you pay for provisioned size, not just used data.',
    '**Azure File Sync** can cache a share on servers, which is rarely needed for cloud-native ML.',
    'Private endpoints are available for the storage account the share lives in.'
  ],
  ml: [
    'Shared home directories and notebook storage for data scientists.',
    'A common read-mostly model or package cache for several small inference services.',
    'Lift-and-shift of training code that expects a POSIX file system.',
    'Prefer [[blob]] plus a cache for large or high-throughput training data.'
  ],
  pairs: ['blob', 'managed-lustre', 'aks', 'aml-training'],
  cost: 'Premium shares bill for provisioned GiB (which also sets performance) plus snapshots. Standard shares bill on used capacity and transactions depending on the tier. Cross-Region transfer is extra.'
});

S({
  id: 'managed-lustre', cat: 'storage', name: 'Azure Managed Lustre', doc: 'azure/azure-managed-lustre/',
  tag: 'A parallel file system for keeping a GPU cluster fed, backed by Blob Storage.',
  what: 'Azure Managed Lustre is a managed **Lustre** parallel file system: many storage servers present one namespace, so hundreds of nodes can read and write in parallel at very high aggregate throughput. It exists for the one case where object storage is too slow to feed expensive GPUs: large-scale training and checkpointing.\n\nIt integrates with [[blob|Blob Storage]] through **import and export**: data is loaded from a blob container, worked on at file-system speed, and written back. The file system is a cache and scratch layer, not the system of record.',
  flow: ['Blob data', 'Import to Lustre', 'Mounted on GPU nodes', 'Parallel reads / checkpoint writes', 'Export to Blob', 'Delete file system'],
  steps: [
    [0, 'The authoritative dataset sits in a [[blob|Blob]] container.'],
    [1, 'When you create the file system you point it at the container, and data is imported (lazily or in bulk) into Lustre.'],
    [2, 'GPU nodes in the same virtual network mount the file system with the Lustre client.'],
    [3, 'Many nodes read training shards in parallel and write checkpoints at high speed.'],
    [4, 'Results and checkpoints are exported back to Blob for durability and downstream use.'],
    [5, 'When the job ends, you delete the file system to stop the charge, because the data is safe in Blob.']
  ],
  gotchas: [
    '**It is billed while it exists**, whether or not a job runs. Create it for the project and delete it afterwards.',
    '**Sync with Blob is not automatic in all directions.** Plan the import and export steps explicitly, and verify that checkpoints have reached Blob before deleting.',
    '**It needs network proximity**: clients must be in or peered to the virtual network, and in the same Region as the file system.',
    '**Right-size it for throughput, not just capacity.** Performance scales with the provisioned size.',
    'It adds a system to operate and monitor. Do not use it until a profiler shows storage is the bottleneck.'
  ],
  edges: [
    'Capacity and throughput are chosen from SKUs by throughput per TiB; a larger file system buys more aggregate speed.',
    'It is a good home for checkpoints, which are bursty large writes that overwhelm object storage.',
    'Lustre is a Linux file system; Windows clients are not the target.'
  ],
  ml: [
    'Feeding multi-node distributed training from a shared dataset at high speed.',
    'Fast checkpointing for long jobs on [[gpu-vms]].',
    'Staging large datasets for [[aml-training]] clusters.',
    'Short-lived scratch for data-prep jobs that outgrow local disk.'
  ],
  pairs: ['blob', 'gpu-vms', 'aml-training', 'aks'],
  cost: 'Billed for provisioned capacity (by throughput tier) for each hour the file system exists. Because it is a cache over Blob, deleting it between campaigns keeps cost proportional to actual use.'
});

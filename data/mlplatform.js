/* ML Platform (Azure Machine Learning) */
S({
  id: 'aml-workspace', cat: 'ml', name: 'Azure Machine Learning workspace', doc: 'azure/machine-learning/',
  tag: 'The home of an ML project: assets, compute, tracking, registry and network boundary.',
  what: 'An Azure Machine Learning **workspace** is the top-level resource for an ML team or project. It holds the **assets** you work with (data, environments, components, models), the **compute** you run on, an **MLflow-compatible tracking** store for experiments, and links to storage, a container registry, Key Vault and Application Insights.\n\nWorkspaces can use a **managed virtual network** that controls outbound access for compute, and **registries** share models, components and environments across workspaces so a model trained in development can be promoted to production without copying.',
  flow: ['Workspace + linked resources', 'Data + environments', 'Compute (instance / cluster)', 'Experiment tracking', 'Model registry', 'Deploy'],
  steps: [
    [0, 'You create a workspace with its dependent storage account, Key Vault, container registry and monitoring.'],
    [1, 'You register **data assets**, **environments** (container plus dependencies) and reusable **components**.'],
    [2, 'You attach **compute**: a notebook compute instance, an autoscaling compute cluster or serverless compute.'],
    [3, 'Jobs log parameters, metrics and artifacts to the workspace through **MLflow**.'],
    [4, 'Good models are registered in the **model registry** (or a shared **registry** across workspaces) with versions and tags.'],
    [5, 'A registered model is deployed to an [[aml-endpoints|endpoint]], with lineage back to the job, code and data.']
  ],
  gotchas: [
    '**Linked resources are shared state.** Deleting or locking down the storage account or Key Vault breaks the workspace in confusing ways.',
    '**Network isolation is easier to design in than to add.** Decide on a managed virtual network and private endpoints at creation, and test that jobs can reach package feeds and data.',
    '**Access is layered**: workspace roles, the storage account\'s roles and the compute identity all matter. A job that works for a person may fail under the compute\'s identity.',
    '**Idle compute instances keep billing.** Enable idle shutdown and schedules for notebooks.',
    '**Environments drift.** Pin package versions and build environments from a Dockerfile you control.'
  ],
  edges: [
    'Registries let a model move from a development workspace to production without re-registering or copying artifacts.',
    'MLflow tracking can be used from Databricks and Fabric notebooks too, so experiment history is not locked to one tool.',
    'Workspaces are regional; plan for where data and compute must live.'
  ],
  ml: [
    'A single, auditable place where code, data version, environment and model are linked for each run.',
    'Separate dev, test and production workspaces with a shared registry for promotion.',
    'Central environment and component catalogue so teams do not each rebuild the basics.',
    'Link to [[foundry]] when models customised here are to be served alongside catalogue models.'
  ],
  pairs: ['aml-training', 'aml-pipelines', 'aml-endpoints', 'blob', 'key-vault', 'private-link'],
  cost: 'The workspace is free; you pay for compute (while running), storage, container registry, Key Vault and monitoring. Compute dominates, so autoscale to zero and idle shutdown matter most.'
});

S({
  id: 'aml-training', cat: 'ml', name: 'Azure ML training jobs and compute', doc: 'azure/machine-learning/concept-train-machine-learning-model',
  tag: 'Managed training on autoscaling GPU clusters or serverless compute, with distributed and sweep jobs.',
  what: 'Training in Azure Machine Learning runs as a **job**: a command, a code folder, an environment, inputs and a compute target. **Compute clusters** scale from zero nodes to a maximum and back; **serverless compute** removes cluster management by letting you request a VM size per job. Jobs support distributed training (PyTorch, MPI, TensorFlow) and **sweep jobs** for hyperparameter search.\n\nIt also supports **fine-tuning** of foundation models from the model catalogue, and automated ML for tabular, vision and text tasks. Under the hood the compute is [[gpu-vms|GPU or CPU virtual machines]] allocated from your quota.',
  flow: ['Job spec', 'Compute request', 'Nodes provision', 'Distributed run', 'Metrics + checkpoints', 'Registered model'],
  steps: [
    [0, 'You submit a job from the CLI, SDK or studio, with code, environment, input data and the compute to use.'],
    [1, 'Azure ML asks for nodes from a cluster or serverless pool, subject to your **VM family quota**.'],
    [2, 'Nodes scale up from zero, pull the environment image and mount the data.'],
    [3, 'The training script runs on one or many nodes; a distribution config sets up process groups and networking.'],
    [4, 'Metrics stream to MLflow and checkpoints are written to the workspace\'s storage ([[blob]] or [[managed-lustre]]).'],
    [5, 'When the job finishes, nodes scale down and the best model is registered in the [[aml-workspace|workspace]].']
  ],
  gotchas: [
    '**Quota and capacity decide whether a job starts.** A job can queue or fail if the family quota is short, or capacity is exhausted. Check quota for the exact VM family and request ahead.',
    '**Data loading is the usual bottleneck.** If GPUs sit idle, mount data efficiently, shard it, cache it, or stage it on faster storage.',
    '**Failures waste money at scale.** Checkpoint often and make scripts resumable so a node failure does not mean starting over.',
    '**Spot nodes get evicted.** Fine for checkpointed work, not for jobs that cannot resume.',
    '**Reproducibility needs pinned everything**: environment, seed, code commit and data version.'
  ],
  edges: [
    'Serverless compute is simplest for occasional jobs; dedicated clusters give predictable start-up when you run many jobs a day.',
    'Sweep jobs can run many trials in parallel and stop poor ones early, which saves compute.',
    'Fine-tuning jobs for catalogue models handle the training setup; you supply data and choose hyperparameters.'
  ],
  ml: [
    'Custom model training and fine-tuning where prompting and retrieval are not enough.',
    'Distributed training on ND-class clusters with checkpoints in [[managed-lustre]].',
    'Hyperparameter search that stops unpromising trials early.',
    'Part of a scheduled retraining flow inside [[aml-pipelines]].'
  ],
  pairs: ['gpu-vms', 'aml-workspace', 'aml-pipelines', 'managed-lustre', 'blob', 'quotas'],
  cost: 'You pay for the VMs only while nodes are running (clusters scale to zero), at on-demand, reserved or Spot rates. There is no extra Azure ML surcharge on compute. Failed and idle runs are the main waste.'
});

S({
  id: 'aml-pipelines', cat: 'ml', name: 'Azure ML pipelines and registry', doc: 'azure/machine-learning/concept-ml-pipelines',
  tag: 'Repeatable multi-step ML workflows from reusable components, with a versioned model registry.',
  what: 'An Azure ML **pipeline** chains **components** (prepare data, train, evaluate, register) into a graph that runs as one job. Components are versioned and reusable, and Azure ML **caches** unchanged steps so reruns only recompute what changed. Pipelines can run on a **schedule** or from a trigger.\n\nTogether with the **model registry**, they are the backbone of MLOps on Azure: retraining becomes a routine, reviewable process, and promotion of a model to production is a gated step rather than a notebook someone remembers to run. CI/CD tools such as GitHub Actions and Azure DevOps trigger and approve the stages.',
  flow: ['Trigger (schedule / data / PR)', 'Prepare data', 'Train', 'Evaluate vs baseline', 'Register model', 'Gated deploy'],
  steps: [
    [0, 'A schedule, new data ([[event-grid]]) or a pull request starts the pipeline job.'],
    [1, 'A data component validates and transforms input into training and test sets.'],
    [2, 'A training component runs on [[aml-training|compute]] and outputs a model and metrics.'],
    [3, 'An evaluation component compares the candidate to the current production model on a fixed test set.'],
    [4, 'If it passes the gate, the model is registered with a new version and metadata (data version, metrics, commit).'],
    [5, 'An approved release deploys it to an [[aml-endpoints|endpoint]] with a canary rollout.']
  ],
  gotchas: [
    '**Caching can hide staleness.** A reused step is only correct if its inputs fully describe it. Pin data versions, not "latest".',
    '**The evaluation gate is the point.** A pipeline that registers every run gives you a graveyard of models and no promotion rule.',
    '**Components versions multiply.** Without naming and ownership rules, teams fork components and drift apart.',
    '**Pipelines are not a general scheduler.** Cross-system orchestration with data movement fits [[adf]] or [[durable-functions]] better.',
    '**Promotion needs a separate identity and approval** so a training job cannot deploy to production by itself.'
  ],
  edges: [
    'A **registry** (shared across workspaces) is the clean way to promote assets from development to production.',
    'Pipelines can be triggered from [[adf|Data Factory]] when data movement and training belong in one flow.',
    'Model versions can carry tags such as stage, approvers and evaluation results, for audit.'
  ],
  ml: [
    'Scheduled retraining with evaluation gates, so a worse model never auto-deploys.',
    'Reproducible lineage from dataset version to deployed model for audits and incident review.',
    'Shared components for data validation and evaluation across teams.',
    'Deployment pipelines that move a model across dev, test and production with approvals.'
  ],
  pairs: ['aml-workspace', 'aml-training', 'aml-endpoints', 'adf', 'event-grid', 'aml-monitoring'],
  cost: 'Pipelines themselves are free; you pay for the compute each step uses. Caching reduces repeat compute. A failed or looping scheduled pipeline can quietly burn budget, so alert on cost and run duration.'
});

S({
  id: 'aml-endpoints', cat: 'ml', name: 'Azure ML endpoints (online and batch)', doc: 'azure/machine-learning/concept-endpoints',
  tag: 'Managed real-time and batch inference with blue-green rollout, autoscale and traffic splitting.',
  what: 'An **endpoint** is a stable URL in front of one or more **deployments**. **Managed online endpoints** serve real-time requests on VMs Azure manages, with authentication, autoscale, logging and **traffic splitting** between deployments for safe rollouts. **Batch endpoints** run a scoring job over a dataset on a compute cluster. **Kubernetes online endpoints** run on your own [[aks|AKS]] cluster.\n\nUse them for models you own: classical ML, custom deep learning, and open-weight LLMs you host. For models from the catalogue sold as a service, [[foundry-models]] is simpler because there is no VM to size.',
  flow: ['Client', 'Endpoint (auth + routing)', 'Traffic split', 'Deployment (VM + scoring)', 'Autoscale', 'Logs + metrics'],
  steps: [
    [0, 'A client calls the endpoint URL with a key or Entra token.'],
    [1, 'The endpoint authenticates the call and picks a deployment.'],
    [2, 'It applies the **traffic split**, for example 90% to the stable deployment and 10% to a canary.'],
    [3, 'The chosen deployment\'s instances run the scoring code or server and return a prediction.'],
    [4, '**Autoscale** adds or removes instances based on CPU, request count or custom metrics.'],
    [5, 'Request logs and metrics go to [[azure-monitor]]; you promote the canary or roll back by changing the split.']
  ],
  gotchas: [
    '**Updates need spare quota.** Blue-green rollouts temporarily run old and new instances together, so you need extra VM quota (a buffer) or the update fails.',
    '**Request timeouts are short** by default and capped. Long-running scoring belongs on a batch endpoint or an asynchronous pattern.',
    '**GPU scale-out is slow.** Instance start, image pull and model load take minutes; do not scale on a spike you cannot absorb.',
    '**Idle instances bill continuously.** A forgotten endpoint with a GPU SKU is an expensive mistake; scale down or delete unused deployments.',
    '**Auth keys are secrets.** Prefer Entra token auth and rotate keys if used.'
  ],
  edges: [
    '**Mirror traffic** copies a share of live requests to a candidate deployment without returning its results, for shadow testing.',
    'Managed endpoints support private endpoints and inbound network isolation for sensitive models.',
    'Batch endpoints take a folder or data asset as input and write outputs to storage, with concurrency and retry settings.'
  ],
  ml: [
    'Hosting custom predictive models with canary rollout and rollback.',
    'Serving open-weight LLMs when you need a model or control that [[foundry-models]] does not provide.',
    'Nightly or weekly batch scoring over large datasets.',
    'Feature lookups from [[redis|Managed Redis]] or the [[aml-feature-store|feature store]] at request time.'
  ],
  pairs: ['aml-workspace', 'aml-pipelines', 'aml-monitoring', 'gpu-vms', 'apim', 'aks'],
  cost: 'Managed online endpoints bill for the VM instances behind each deployment around the clock; batch endpoints bill only for compute while a job runs. Right-size the SKU and instance count, and use autoscale and scale-to-low settings.'
});

S({
  id: 'aml-monitoring', cat: 'ml', name: 'Azure ML model monitoring', doc: 'azure/machine-learning/concept-model-monitoring',
  tag: 'Detect data drift, prediction drift and quality problems, and trigger retraining or alerts.',
  what: 'Model monitoring compares what a deployed model sees in production against a **baseline** (usually training data) on a schedule. Built-in signals include **data drift**, **prediction drift**, **data quality** and **feature attribution drift**, with thresholds that raise alerts. There are also signals aimed at generative AI apps, covering response quality and safety, and Responsible AI tooling for fairness, error analysis and explainability.\n\nMonitoring is the part teams skip and later miss most: models decay quietly as the world changes, and a model can fail while every infrastructure metric stays green.',
  flow: ['Production data collected', 'Baseline', 'Scheduled monitor job', 'Signals + thresholds', 'Alert', 'Retrain or rollback'],
  steps: [
    [0, 'The deployment logs its inputs and outputs (data collection) to storage.'],
    [1, 'A **baseline** is chosen: training data or a recent trusted production window.'],
    [2, 'A scheduled monitor job compares the latest production window to the baseline.'],
    [3, 'Statistical tests compute drift and quality signals per feature and for predictions.'],
    [4, 'When a metric crosses its threshold, an alert is raised through [[azure-monitor]] (email, webhook, action group).'],
    [5, 'An owner investigates, then triggers an [[aml-pipelines|retraining pipeline]] or rolls the deployment back.']
  ],
  gotchas: [
    '**Drift is not the same as harm.** A feature can drift without hurting accuracy. Tie alerts to outcome metrics when labels arrive.',
    '**Labels arrive late.** Until ground truth lands, monitor proxies (distributions, user feedback) and plan the delay.',
    '**Data collection can capture sensitive data.** Decide what is logged, how long it is kept and who can read it.',
    '**Thresholds need tuning.** Defaults page you for noise or miss real shifts; adjust against history.',
    '**An alert with no owner is noise.** Assign an owner and a defined action for each monitor.'
  ],
  edges: [
    'Monitors can be set per deployment and per feature set, with different schedules for different models.',
    'Generative AI monitoring depends on evaluators (often LLM judges); calibrate them against human review.',
    'Pair production monitoring with offline evaluations in [[foundry]] to see both sides.'
  ],
  ml: [
    'Early warning for predictive models on changing populations (fraud, demand, risk).',
    'Retraining triggers that are tied to measured drift rather than a calendar.',
    'Audit evidence of ongoing performance and fairness for regulated use cases.',
    'Quality signals for LLM applications alongside infrastructure metrics.'
  ],
  pairs: ['aml-endpoints', 'aml-pipelines', 'azure-monitor', 'foundry', 'blob'],
  cost: 'Monitoring jobs run on compute (serverless Spark by default) on a schedule, plus storage for collected data. Cost grows with data volume and schedule frequency; start daily or weekly and tighten only where needed.'
});

S({
  id: 'aml-feature-store', cat: 'ml', name: 'Azure ML managed feature store', doc: 'azure/machine-learning/concept-what-is-managed-feature-store',
  tag: 'Define features once, serve them for training and inference, and avoid training-serving skew.',
  what: 'A managed feature store lets you define **feature sets** (a transformation over a source, with a key and timestamp), **materialise** them on a schedule into an **offline store** (ADLS) for training, and, where supported, an **online store** for low-latency lookup at request time. A **feature retrieval specification** records exactly which features a model used, so training and serving fetch the same ones.\n\nIts main job is to prevent **training-serving skew**, where a feature is computed one way in a notebook and another way in production. It also supports **point-in-time joins**, which avoid leaking future information into training data.',
  flow: ['Source data', 'Feature set (transform)', 'Materialise offline', 'Training set (point-in-time)', 'Online store', 'Inference lookup'],
  steps: [
    [0, 'Raw data sits in the lake ([[adls]]) or arrives through streams and batch jobs.'],
    [1, 'You define a **feature set** with a transformation, an entity key and a timestamp column.'],
    [2, 'A materialisation job computes features and writes them to the **offline store**, on a schedule or as a backfill.'],
    [3, 'For training, features are joined to labels **as of each event time**, so no future data leaks in.'],
    [4, 'Materialisation to an **online store** (where available, often backed by [[redis|Managed Redis]]) keeps the latest values ready for lookup.'],
    [5, 'At inference, the [[aml-endpoints|endpoint]] fetches features by key using the same retrieval specification.']
  ],
  gotchas: [
    '**Point-in-time correctness is the whole value.** A join on the latest value leaks the future and inflates offline metrics.',
    '**Online freshness is bounded by materialisation.** If a feature changes faster than your schedule, the served value is stale.',
    '**Online stores add cost and operational surface.** Do not create one for batch-scored models that never need it.',
    '**Feature definitions need owners and versions.** Changing a feature in place silently changes every model using it.',
    '**Check availability.** Parts of the feature-store experience have been in preview; confirm status and regional support.'
  ],
  edges: [
    'Feature sets can be shared across workspaces so teams reuse rather than reimplement.',
    'Backfills over long histories can be expensive; test on a short window first.',
    'Other platforms (Databricks, Fabric) have their own feature capabilities; pick one source of truth per feature.'
  ],
  ml: [
    'Consistent features for real-time scoring such as fraud, recommendations and pricing.',
    'Reusable, governed features that speed up new models.',
    'Reproducible training sets for audits.',
    'Streaming features from [[event-hubs]] processed into the store for fresh behaviour signals.'
  ],
  pairs: ['adls', 'redis', 'aml-endpoints', 'databricks', 'fabric', 'event-hubs'],
  cost: 'You pay for materialisation compute (Spark), offline storage in ADLS, and, if used, the online store (a cache sized for your features). Cost is driven by schedule frequency, history length and online-store size.'
});

/* Compute & Accelerators */
S({
  id: 'gpu-vms', cat: 'compute', name: 'Azure GPU virtual machines', doc: 'azure/virtual-machines/sizes/overview',
  tag: 'NVIDIA and AMD accelerators by the VM, from one GPU to InfiniBand-connected training clusters.',
  what: 'GPU virtual machines are the raw material of AI on Azure. The **NC** family is aimed at inference and smaller training jobs. The **ND** family is aimed at large distributed training and high-end inference, with several GPUs per VM and (on the largest sizes) InfiniBand networking between VMs. Recent generations include NVIDIA H100, H200 and GB200 systems, and AMD Instinct accelerators in some sizes.\n\nYou rarely run these alone. Managed services such as [[aml-training|Azure Machine Learning compute]], [[aks|AKS]] node pools and [[azure-batch|Azure Batch]] all provision GPU VMs for you, and all of them are limited by the same thing: **GPU quota and physical capacity** in your subscription and Region.',
  flow: ['Quota request', 'Capacity in Region', 'VM + GPU driver', 'Cluster fabric', 'Training or serving job', 'Metrics'],
  steps: [
    [0, 'You request vCPU quota for a specific **VM family** (for example an ND H100 v5 family) in a specific Region, through [[quotas|Azure Quotas]].'],
    [1, 'Quota is only permission. Azure must also have **physical capacity**. If it does not, the allocation fails with an allocation or capacity error even though quota is approved.'],
    [2, 'The VM boots from an image with the NVIDIA (or AMD) driver and container runtime. A GPU driver extension or a prepared HPC image installs them.'],
    [3, 'For multi-node training, VMs must land on the same InfiniBand fabric (a single placement group or cluster) so collective communication runs at full speed.'],
    [4, 'The job (PyTorch, DeepSpeed, vLLM) runs, usually launched by [[aml-training]], [[aks]] or [[azure-batch]] rather than by hand.'],
    [5, 'GPU, memory and network counters flow to [[azure-monitor]]; idle GPUs are the main source of waste.']
  ],
  gotchas: [
    '**Quota is not capacity.** Approved quota can still fail to allocate. Use capacity reservations for the baseline you cannot do without, and keep a second Region or SKU in the plan.',
    '**Quota is per VM family per Region, in vCPUs.** A request for "GPUs" is really a request for vCPUs in one family. Different families, and Spot, have separate pools.',
    '**InfiniBand needs the right topology.** Scaling out across separate placements cuts collective-communication speed sharply. Deploy training nodes together.',
    '**Billing runs while the VM is allocated, not while it computes.** A stopped (not deallocated) VM still bills. Deallocate, or let the orchestrator scale to zero.',
    '**Driver, CUDA and framework versions must match.** A mismatched image is the most common cause of a cluster that starts but cannot train.'
  ],
  edges: [
    '**Spot VMs** are much cheaper and can be evicted with short notice. They suit checkpointed training and batch inference, not low-latency serving.',
    'Larger GPU memory (H200, MI300X-class) changes which models fit on one VM, and therefore whether you need tensor parallelism at all.',
    '**Confidential GPU VMs** encrypt GPU memory for sensitive workloads, at some cost in feature support. Check the supported sizes and Regions.',
    'GPU SKUs are retired and replaced on a cadence. Avoid hard-coding a SKU into templates without a plan for the next generation.'
  ],
  ml: [
    'Pretraining and large fine-tunes on ND-class VMs with InfiniBand, orchestrated by [[aml-training]] or a Slurm layer.',
    'Self-hosted inference for open-weight models on NC-class VMs, usually behind [[aks]] with a serving engine such as vLLM.',
    'Right-size by model memory: weights plus KV cache decide the GPU count per replica, not the parameter count alone.',
    'Use [[azure-batch]] with Spot GPU pools for embedding generation and other offline GPU work.'
  ],
  pairs: ['aks', 'aml-training', 'azure-batch', 'managed-lustre', 'quotas', 'blob'],
  cost: 'Billed per second for as long as the VM is allocated, at a per-SKU rate. Discounts come from **Reservations** and **Savings Plans** (steady baseline) and **Spot** (interruptible work). Idle allocated GPUs are the biggest avoidable cost.'
});

S({
  id: 'aks', cat: 'compute', name: 'Azure Kubernetes Service (AKS)', doc: 'azure/aks/',
  tag: 'Managed Kubernetes with GPU node pools, for serving models and running agents at scale.',
  what: 'AKS runs the Kubernetes control plane for you and gives you node pools of virtual machines to run containers on. For AI, the interesting parts are **GPU node pools**, node autoprovisioning (a Karpenter-based option that picks and adds nodes for pending pods) and add-ons for model serving such as the **Kubernetes AI Toolchain Operator (KAITO)**.\n\nChoose AKS when you need to own the serving layer: custom engines, tight cost control at steady high volume, mixed CPU and GPU workloads, or data that must stay in your own network. You operate the workloads; Azure operates the control plane.',
  flow: ['Ingress / gateway', 'Model server pods', 'GPU node pool', 'Autoscaler', 'Weights in Blob', 'Metrics'],
  steps: [
    [0, 'Requests arrive through an ingress or [[apim|API Management]] and are balanced across model server pods.'],
    [1, 'Pods run a serving engine (for example vLLM) that batches concurrent requests continuously and streams tokens.'],
    [2, 'Pods are scheduled onto a **GPU node pool**. The NVIDIA device plugin (or GPU Operator) exposes GPUs as a schedulable resource.'],
    [3, 'The autoscaler (cluster autoscaler or node autoprovisioning) adds GPU nodes when pods are pending, and removes them when idle. Event-driven scaling (KEDA) can scale pods on queue depth.'],
    [4, 'New pods pull weights from [[blob]] (often cached on local NVMe) with a **workload identity**, not a stored key.'],
    [5, 'GPU and request metrics flow to [[azure-monitor]]; scaling decisions should use queue depth or tokens per second, not CPU.']
  ],
  gotchas: [
    '**Scale-out is slow.** A new GPU node, the image pull and the weight load can take many minutes. Keep headroom, cache weights, and pre-pull images.',
    '**CPU-based autoscaling does not work for LLM serving.** Scale on concurrent requests, queue depth or GPU cache utilisation instead.',
    '**GPU quota and capacity apply** exactly as for [[gpu-vms|GPU VMs]]. The cluster cannot add nodes you have no quota for.',
    '**Timeouts stack.** Ingress, gateway and load balancer idle timeouts differ; streaming responses break at the shortest one.',
    'Upgrades and node image updates can evict GPU pods. Set disruption budgets and test the upgrade path on a non-production pool.'
  ],
  edges: [
    '**KAITO** can deploy a catalogue of open-weight models onto GPU nodes from a custom resource, which shortens the path to a first endpoint.',
    'Mixed pools work well: a small always-on pool for the baseline and a Spot pool for burst or batch, with taints keeping the right pods on each.',
    'Multi-instance GPU (MIG) can split one large GPU into slices for several small models, at the cost of operational complexity.'
  ],
  ml: [
    'Serving fleet for open-weight or fine-tuned LLMs where per-token cost at steady volume beats a managed API.',
    'Hosting agent runtimes, tool servers and retrieval services next to the models, inside one network.',
    'Running distributed training jobs with a job scheduler when a Kubernetes-native workflow is already your standard.',
    'Pair with [[container-apps]] for smaller services that do not need cluster-level control.'
  ],
  pairs: ['gpu-vms', 'blob', 'apim', 'azure-monitor', 'entra-id', 'container-apps'],
  cost: 'The control plane is free on the base tier and paid on tiers with an uptime SLA. You pay for node VMs (GPU nodes dominate), disks, load balancers and egress. Reservations and Spot reduce node cost; idle GPU nodes are the main waste.'
});

S({
  id: 'container-apps', cat: 'compute', name: 'Azure Container Apps', doc: 'azure/container-apps/',
  tag: 'Serverless containers that scale to zero, with optional serverless GPUs and sandboxed code sessions.',
  what: 'Container Apps runs containers without you managing a cluster. It scales on HTTP traffic or events (using KEDA rules), down to zero replicas, and bills for the time replicas run. **Workload profiles** let you choose dedicated CPU or GPU hardware, including **serverless GPUs** that bill per second and scale to zero.\n\nIt also offers **dynamic sessions**: short-lived, strongly isolated sandboxes that an agent can use to run untrusted or model-generated code, such as a code interpreter. For many teams this is the sweet spot between Functions and AKS.',
  flow: ['Request or event', 'Scale rule', 'Replica starts', 'App or model container', 'Session sandbox', 'Logs'],
  steps: [
    [0, 'An HTTP request, queue message or schedule arrives at the app\'s ingress.'],
    [1, 'A scale rule (HTTP concurrency, or a KEDA scaler such as queue length) decides how many replicas should run, including zero.'],
    [2, 'If there are no replicas, one is started on the chosen **workload profile** (consumption CPU, dedicated CPU or GPU). This is a **cold start**.'],
    [3, 'The container handles the request: an API, a tool server, or a small model server on a serverless GPU.'],
    [4, 'For agent code execution, the app creates a **dynamic session** in an isolated sandbox, runs code in it, and lets it expire.'],
    [5, 'Console logs and metrics go to a Log Analytics workspace in [[azure-monitor]].']
  ],
  gotchas: [
    '**Cold starts include the model load.** A GPU replica scaling from zero must pull the image and load weights. Keep a minimum replica count for interactive paths.',
    '**Serverless GPU availability is limited** to specific GPU types and Regions, and subject to quota. Check before choosing it as the plan.',
    '**HTTP ingress has a request timeout** of a few minutes. Long jobs need a queue and a worker, not a long request.',
    '**No cluster-level knobs.** You cannot install arbitrary DaemonSets or custom schedulers. That is the trade for not operating Kubernetes.',
    'Sessions are for isolation, not for state. Treat their filesystem as disposable and persist results elsewhere.'
  ],
  edges: [
    '**Jobs** (run to completion) are separate from **apps** (long-running) and suit batch embedding or evaluation runs.',
    'Dapr and built-in service discovery are available for microservice patterns, including agent tool servers.',
    'Sessions can be created per user or per conversation. Decide the identity-to-session mapping deliberately so one user cannot reach another\'s sandbox.'
  ],
  ml: [
    'Hosting tool servers (including MCP servers) and agent back ends that must scale to zero overnight.',
    'Running a small open-weight model on a serverless GPU for low-volume or spiky workloads, where an always-on GPU would be wasteful.',
    'Safe code execution for data-analysis agents using dynamic sessions.',
    'Move to [[aks]] when you need cluster-level control, larger GPUs, or sustained high utilisation.'
  ],
  pairs: ['aks', 'functions', 'service-bus', 'foundry-agent-service', 'azure-monitor', 'entra-id'],
  cost: 'Consumption replicas bill per second for vCPU and memory while running, with a free monthly grant; dedicated and GPU profiles bill for the profile\'s time. Scale to zero removes idle cost. Dynamic sessions bill for session time.'
});

S({
  id: 'functions', cat: 'compute', name: 'Azure Functions', doc: 'azure/azure-functions/',
  tag: 'Event-driven code with no servers: the glue, tools and thin API layer of AI systems.',
  what: 'Functions runs small pieces of code in response to triggers: HTTP calls, queue messages, blob uploads, timers, or events. You write a function; Azure handles scaling and hosting. The **Flex Consumption** plan scales quickly, supports virtual-network integration and lets you pre-warm instances, which makes it the usual starting plan today.\n\nIn AI systems Functions is the natural home for **agent tools** (small, narrow, well-typed actions), prompt-assembly code and ingestion handlers. Functions can also host remote **MCP** tool servers, and [[durable-functions|Durable Functions]] adds long-running, stateful orchestration on top.',
  flow: ['Trigger', 'Scale controller', 'Function instance', 'Bindings / SDK calls', 'Model or tool', 'Output'],
  steps: [
    [0, 'A trigger fires: an HTTP request from [[apim]], a [[service-bus]] message, a blob upload, a timer or an [[event-grid]] event.'],
    [1, 'The scale controller adds or removes instances based on trigger load (queue depth, request rate).'],
    [2, 'An instance loads your code. On a cold start this adds latency unless always-ready instances are configured.'],
    [3, 'Input and output **bindings** (or SDK calls with a managed identity) read from and write to other services.'],
    [4, 'The function calls a model in [[foundry-models]] or a downstream system, and must finish within the plan\'s timeout.'],
    [5, 'The result is returned, queued or stored, and telemetry flows to Application Insights in [[azure-monitor]].']
  ],
  gotchas: [
    '**HTTP-triggered functions are cut off at about 230 seconds** by the front-end load balancer, whatever the plan\'s own timeout says. Long LLM calls need streaming, a queue, or a durable pattern.',
    '**Cold starts** hurt interactive paths. Use always-ready instances on Flex Consumption or a Premium plan for latency-sensitive endpoints.',
    '**Retries repeat side effects.** Queue-triggered functions are retried; every tool that writes must be idempotent.',
    '**Concurrency can overwhelm a model deployment.** Many instances calling at once will trip token-per-minute limits. Set maximum concurrency and use backoff.',
    'Keep secrets out of app settings: use managed identity and [[key-vault]] references.'
  ],
  edges: [
    'Plans differ in timeouts, networking, scale-out limits and pricing. Confirm the current limits for the plan you pick.',
    'Package size and start-up time rise with heavy dependencies. Do not import a full ML stack into a function that only calls an API.',
    'Functions has no GPU. Anything needing an accelerator belongs on [[container-apps]], [[aks]] or [[aml-endpoints]].'
  ],
  ml: [
    'Narrow, schema-described tools for agents: look up an order, create a ticket, run a query.',
    'Ingestion handlers: on blob upload, extract text, chunk and queue embedding work.',
    'Thin API layer that assembles prompts and streams model output back.',
    'Event glue between [[event-hubs]], [[service-bus]] and the rest of the platform.'
  ],
  pairs: ['durable-functions', 'service-bus', 'apim', 'foundry-models', 'foundry-agent-service', 'key-vault'],
  cost: 'Flex Consumption and Consumption plans bill per execution and per GB-second of memory, with a monthly free grant; always-ready instances and Premium plans add a baseline charge. Model tokens, not Functions, usually dominate the bill.'
});

S({
  id: 'azure-batch', cat: 'compute', name: 'Azure Batch', doc: 'azure/batch/',
  tag: 'Run large numbers of independent jobs on pools of VMs you do not have to schedule yourself.',
  what: 'Batch is a job scheduler on top of virtual machines. You define a **pool** (a set of VMs, optionally with GPUs), then submit **jobs** made of **tasks**. Batch queues tasks, starts them on free nodes, retries failures and scales the pool with an autoscale formula.\n\nIt is the right tool for embarrassingly parallel work that does not need a long-running service: generating embeddings for a corpus, bulk document conversion, offline evaluation sweeps and rendering. Spot VMs make it cheap when tasks can be restarted.',
  flow: ['Job and tasks', 'Pool autoscale', 'Node starts', 'Task runs', 'Outputs to Blob', 'Job complete'],
  steps: [
    [0, 'You create a job and add tasks, each with a command line, input files and a retry policy.'],
    [1, 'An **autoscale formula** (or a fixed size) decides how many nodes the pool should have, based on pending tasks.'],
    [2, 'Nodes start from a VM image or container image, install a start task if one is defined, and join the pool.'],
    [3, 'Batch assigns tasks to nodes, runs them, and retries failed tasks according to the policy.'],
    [4, 'Tasks read inputs from and write outputs to [[blob]], using a managed identity.'],
    [5, 'When all tasks finish, the job completes and the pool can scale to zero.']
  ],
  gotchas: [
    '**Tasks must be idempotent.** Retries and Spot evictions will run a task more than once.',
    '**Node start-up is not free.** Large images and driver installs make small tasks inefficient. Batch work into fewer, larger tasks.',
    '**Quota applies per pool type and VM family.** Pools fail to resize when quota or capacity is short.',
    'Low-priority VMs have been replaced by **Spot** in Batch. Use Spot for interruptible capacity and check current guidance for any older templates.',
    'It schedules tasks, not dependencies across stages. Complex multi-step pipelines belong in [[aml-pipelines]] or [[adf|Data Factory]].'
  ],
  edges: [
    'Task dependencies and multi-instance (MPI) tasks exist for tightly coupled jobs, but a dedicated training service is usually better for deep learning.',
    'Containers are supported as task runtimes, which keeps GPU and CUDA dependencies reproducible.',
    'Pools can be placed in a virtual network to reach private data sources.'
  ],
  ml: [
    'Bulk embedding generation and re-embedding after a model change.',
    'Offline batch inference and evaluation sweeps over large datasets using GPU pools.',
    'Data preparation that does not justify a Spark cluster.',
    'Use alongside [[foundry-models]] batch deployments when the model call itself should be asynchronous.'
  ],
  pairs: ['gpu-vms', 'blob', 'adf', 'aml-pipelines', 'quotas'],
  cost: 'You pay for the VMs in the pool while they exist; the Batch service itself has no charge. Scale to zero when idle and use Spot for interruptible tasks to cut cost substantially.'
});

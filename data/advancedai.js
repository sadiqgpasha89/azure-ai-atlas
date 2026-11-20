/* Domain 20: Advanced AI Engineering Topics
   Specialized engineering disciplines for state-of-the-art AI systems:
   Graph RAG, Multimodal RAG, Model Fine-Tuning & Quantization, Edge SLMs,
   Model Routing, Agent Memory architectures, Synthetic Data, and PyRIT Red Teaming. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.advancedAI = {
  title: 'Advanced AI Engineering & Research Center',
  lede: 'Beyond standard prompting and naive RAG: deep architectural playbooks for Graph RAG, multimodal pipelines, LoRA fine-tuning, SLM edge compilation, hierarchical agent memory, and adversarial red teaming.',

  topics: [
    {
      id: 'graph-rag',
      name: '1. Graph RAG & Knowledge Graphs',
      tag: 'Relationship-Grounded Reasoning',
      color: '268',
      summary: 'Extracting semantic entities and relationships from unstructured text to build queryable knowledge graphs that answer complex multi-hop and holistic dataset questions.',
      problemSolved: 'Standard vector search finds isolated semantic fragments but fails on holistic corpus-wide questions ("What are the top 5 strategic initiatives across all quarterly board minutes?"). Graph RAG groups related entities into hierarchical communities and generates community summaries.',
      azureImplementation: 'Microsoft GraphRAG library running on Azure Container Apps / Azure Functions, generating knowledge graph embeddings and storing community summaries in Azure Cosmos DB Gremlin / Azure AI Search.',
      architecture: [
        'Raw Documents (Blob Storage) -> LLM Entity & Relationship Extraction -> Graph Construction (Nodes & Edges)',
        'Hierarchical Leiden Community Detection -> LLM Community Summarization at multiple abstraction tiers',
        'Global Search (answers high-level theme questions via community report map-reduce)',
        'Local Search (combines entity graph neighborhood traversal with vector search on chunk text)'
      ],
      keyMetrics: 'Entity extraction precision (>90%), Graph density, Multi-hop path recall, Community coverage.'
    },
    {
      id: 'multimodal-ai',
      name: '2. Multimodal AI & Vision-Language Systems',
      tag: 'Cross-Modal Understanding',
      color: '212',
      summary: 'Processing, embedding, and reasoning across text, dense tabular spreadsheets, complex architectural diagrams, audio speech, and streaming video.',
      problemSolved: 'Traditional OCR flattens spatial visual context. Multimodal models preserve spatial geometry, recognizing that a cell belongs to both a table header and a specific column, or analyzing technical CAD diagrams and UI wireframes directly.',
      azureImplementation: 'Azure AI Document Intelligence (Layout Model) for markdown table extraction + a multimodal vision-capable model deployed in Foundry + Azure AI Speech sub-second streaming WebSockets.',
      architecture: [
        'Document / Image Ingestion -> Azure Document Intelligence Layout Model extracts structured Markdown and table bounding boxes',
        'Image vectorization via Azure AI Vision Multimodal Embeddings (co-embedded in 1024-dim shared space with text)',
        'Hybrid query engine searches both text chunks and visual diagram embeddings in Azure AI Search',
        'A vision-capable frontier-tier model synthesizes an answer referencing both text citations and image crop URLs'
      ],
      keyMetrics: 'Table structure extraction accuracy (>98%), Visual grounding precision, Sub-second audio latency.'
    },
    {
      id: 'model-customization',
      name: '3. Model Customization: Fine-Tuning, LoRA & Quantization',
      tag: 'Domain Adaptation & Efficiency',
      color: '150',
      summary: 'Adapting foundation models to proprietary company domain language, formatting constraints, and specialized classification tasks while minimizing compute overhead.',
      problemSolved: 'In-context learning with 50-shot prompts wastes token context and increases latency. Fine-tuning bakes domain style, terminology, and JSON formatting into model weights, cutting prompt token costs by up to 80%.',
      azureImplementation: 'Azure Machine Learning Fine-Tuning Pipelines with DeepSpeed and LoRA (Low-Rank Adaptation) on Azure NC/ND-series GPU clusters, registering checkpoints into the Azure ML Model Registry.',
      architecture: [
        'Dataset Curation: 1,000–10,000 high-quality input-output training pairs stored in ADLS Gen2',
        'Parameter-Efficient Fine-Tuning (PEFT / LoRA): Freezes base model weights, updates low-rank adapter matrices (r=16, alpha=32)',
        'Quantization: Compiles model to INT8 or FP8 via AWQ/GPTQ, cutting GPU VRAM footprint by 50% with <1% accuracy loss',
        'Deployment: Hosted on Azure ML Managed Online Endpoints with vLLM acceleration'
      ],
      keyMetrics: 'Validation loss convergence, Format adherence (100%), Token reduction percentage (>60%).'
    },
    {
      id: 'edge-slms',
      name: '4. Small Language Models (SLMs) & Edge Inference',
      tag: 'High-Efficiency Edge AI',
      color: '42',
      summary: 'Deploying highly capable 1B–14B parameter models (Phi-4, Phi-3.5) directly to local devices, edge industrial PCs, and cost-constrained cloud microservices.',
      problemSolved: 'Frontier-tier LLMs are overkill and too expensive for routine tasks like PII redaction, intent classification, entity extraction, or air-gapped industrial manufacturing lines.',
      azureImplementation: 'Microsoft Phi-4 compiled via ONNX Runtime and Olive optimization toolkit, running on Azure IoT Edge or local embedded hardware with NPU acceleration.',
      architecture: [
        'Base SLM (Phi-4 14B) exported to ONNX format with graph optimization',
        'Quantized to INT4 precision using Microsoft Olive for NPU/CPU execution',
        'Deployed to edge runtime with local SQLite vector cache for zero-cloud-egress compliance',
        'Hybrid fallback: Edge SLM handles 85% of standard requests; routes complex queries to a cloud frontier-tier model'
      ],
      keyMetrics: 'Inference latency (<25ms per token on edge hardware), Zero cloud network dependency, $0 token marginal cost.'
    },
    {
      id: 'model-routing',
      name: '5. Intelligent Model Routing & Mixture of Models',
      tag: 'Cost & Latency Optimization',
      color: '185',
      summary: 'Dynamically inspecting incoming user queries to route simple tasks to fast, low-cost models and complex reasoning tasks to frontier reasoning engines.',
      problemSolved: 'Treating all queries uniformly results in 10x higher cloud bills (e.g. paying frontier-tier token prices for a simple "Summarize this email in 2 sentences" prompt).',
      azureImplementation: 'Lightweight classifier running in Azure Container Apps (or Azure Functions) using semantic embedding similarity or Phi-4 to classify query complexity.',
      architecture: [
        'Incoming User Prompt -> Intent & Complexity Classifier (Phi-4 / Cosine distance to complexity benchmarks)',
        'Tier 1 (Simple / Formatting / Classification): Routed to Phi-4 or another small-tier model',
        'Tier 2 (Enterprise RAG & Synthesis): Routed to a frontier-tier model',
        'Tier 3 (Multi-step Reasoning / Deep Logic): Routed to a reasoning-tier model',
        'Fallback Circuit Breaker: Automatically upgrades model tier if initial output fails quality or JSON schema validation'
      ],
      keyMetrics: 'Average blended token cost reduction (50–70%), P95 latency improvement (40%), Route accuracy (>96%).'
    },
    {
      id: 'agent-memory',
      name: '6. Hierarchical Agent Memory Systems',
      tag: 'State & Context Persistence',
      color: '300',
      summary: 'Implementing layered memory tiers allowing autonomous agents to retain multi-turn conversational context, long-term user preferences, and episodic tool experiences.',
      problemSolved: 'Raw LLMs are entirely stateless. Stuffing entire conversation histories into prompts blows token budgets, increases latency, and degrades instruction adherence.',
      azureImplementation: 'Azure Managed Redis (Working Memory & Short-Term Context) + Azure Cosmos DB (Episodic Memory & Session Logs) + Azure AI Search (Semantic Long-Term Memory).',
      architecture: [
        'Working Memory: Active scratchpad and tool call accumulator stored in fast in-memory Redis',
        'Short-Term Memory: Sliding window of recent turns with automated background LLM summarization of older dialogue',
        'Episodic Memory: Stored session transcripts in Cosmos DB indexed by user ID, task category, and timestamp',
        'Semantic Memory: Long-term user preferences and factual assertions extracted and embedded in a dedicated user-profile vector index in Azure AI Search'
      ],
      keyMetrics: 'Context recall accuracy, Context token savings (>75%), Memory retrieval latency (<30ms).'
    },
    {
      id: 'synthetic-data',
      name: '7. Synthetic Data Generation & Digital Twins',
      tag: 'Data Engineering & Simulation',
      color: '200',
      summary: 'Using frontier reasoning models to generate high-fidelity synthetic evaluation datasets, diverse edge-case test queries, and multi-agent simulation environments.',
      problemSolved: 'Real enterprise customer interaction data is sparse, contains sensitive PII, or lacks ground-truth labeling. Synthetic data generation bootstraps evaluation suites before system launch.',
      azureImplementation: 'Azure Foundry Evaluation SDK coupled with batch generation pipelines running on Azure Container Apps, generating synthetic Q&A pairs directly from enterprise PDF source chunks.',
      architecture: [
        'Source Chunks in ADLS Gen2 -> a frontier-tier model extracts core factual assertions',
        'Style & Adversarial Prompting: Generates diverse queries (keyword queries, misspelled queries, adversarial injection attempts, ambiguous requests)',
        'Automated Labeling: a reasoning-tier model generates reference ground-truth answers and citations',
        'Quality Filtering: Filter out low-entropy or hallucinated synthetic samples using automated ROUGE and BERTScore thresholds'
      ],
      keyMetrics: 'Synthetic dataset diversity score, Labeling agreement with human SMEs (>92%), Zero PII risk.'
    },
    {
      id: 'red-teaming',
      name: '8. Adversarial Red Teaming & PyRIT Framework',
      tag: 'AI Security & Vulnerability Scanning',
      color: '6',
      summary: 'Automating adversarial testing against LLMs, agent workflows, and retrieval systems to identify jailbreaks, data leakage, and toxic outputs before adversaries do.',
      problemSolved: 'Manual penetration testing of generative AI cannot scale to the infinite permutations of user prompts, multilingual jailbreak techniques, and indirect retrieval attacks.',
      azureImplementation: 'Microsoft PyRIT (Python Risk Identification Toolkit for generative AI) orchestrating automated red-team attack strategies against Azure OpenAI endpoints.',
      architecture: [
        'Attack Strategy Selector: Crescendo attacks (gradual multi-turn jailbreaking), Base64 encoding obfuscation, role-play persona injection, and simulated evil twin personas',
        'PyRIT Attack Agent generates adversarial probe -> Targets Azure OpenAI application endpoint',
        'Response Scorer Agent: Evaluates whether the application breached safety boundaries, leaked system instructions, or executed forbidden tool calls',
        'Automated Remediation: Feed discovered vulnerabilities directly into Azure AI Content Safety custom blocklists and prompt shields'
      ],
      keyMetrics: 'Jailbreak resistance rate (>99.5%), Automated test coverage across OWASP Top 10 for LLMs, Time to remediation.'
    }
  ]
};

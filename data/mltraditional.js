/* Traditional Machine Learning, Data Architecture, Resilience & Enterprise Integration
   Exhaustive reference for classical ML lifecycles, Azure ML capabilities, enterprise data stores,
   high-availability DR architectures, and line-of-business integration patterns. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.traditionalML = {
  title: 'Traditional ML, Data Architecture & Enterprise Integration',
  lede: 'Bridge generative AI with classical predictive machine learning, enterprise lakehouses, zero-trust resilience, and ERP/CRM integrations.',

  mlLifecycle: [
    { step: '01', name: 'Business Problem Formulation', focus: 'Determine whether the problem is best solved by deterministic rules, classical ML (tabular regression/classification), or generative AI; establish ROI and latency constraints.' },
    { step: '02', name: 'Data Ingestion & Exploration', focus: 'Extract raw operational data into ADLS Gen2 / Fabric Lakehouse; run descriptive statistics, profile distributions, detect data skews.' },
    { step: '03', name: 'Data Preparation & Cleaning', focus: 'Handle missing values, encode categoricals, scale numerical attributes, split into stratified train/validation/test sets.' },
    { step: '04', name: 'Feature Engineering & Store', focus: 'Engineer domain features, calculate rolling aggregations, publish curated features to Azure ML Feature Store to eliminate train-serve skew.' },
    { step: '05', name: 'Experimentation & AutoML', focus: 'Benchmark multiple algorithms (LightGBM, XGBoost, Scikit-learn, PyTorch) using Azure ML AutoML and track hyperparameter sweeps in MLflow.' },
    { step: '06', name: 'Model Training & Distributed Compute', focus: 'Train candidate models on Azure ML compute clusters with GPU/CPU auto-scaling and spot instances for cost optimization.' },
    { step: '07', name: 'Responsible AI & Model Evaluation', focus: 'Evaluate fairness, error analysis, and interpretability using the Azure ML Responsible AI Dashboard (Fairlearn, InterpretML).' },
    { step: '08', name: 'Model Registry & Approval Gate', focus: 'Register winning model artifact in Azure ML Model Registry with complete data lineage, environment conda specs, and stakeholder approval sign-off.' },
    { step: '09', name: 'Deployment & Blue/Green Canary', focus: 'Deploy to Azure ML Managed Online Endpoints with containerized scoring scripts and 10% canary traffic splitting.' },
    { step: '10', name: 'Continuous Monitoring & Retraining', focus: 'Track data drift and prediction drift via Azure ML Model Monitoring; trigger automated retraining pipelines when drift exceeds threshold.' }
  ],

  azureMLMatrix: [
    { component: 'Azure ML Workspace', role: 'Central Management Hub', managerTakeaway: 'The security and collaboration boundary. Governs access via Entra ID RBAC, binds default storage, Key Vault, and ACR.' },
    { component: 'Compute Clusters', role: 'Scalable Batch / Training Compute', managerTakeaway: 'Auto-scale from 0 to N nodes. Set idle timeout to 10 minutes and leverage Low Priority (Spot) VMs for 80% cost savings.' },
    { component: 'Managed Online Endpoints', role: 'Real-time Inferencing', managerTakeaway: 'Production-ready hosting with built-in HTTPS endpoints, token authentication, automated autoscaling, and blue/green traffic splitting.' },
    { component: 'Managed Batch Endpoints', role: 'High-Throughput Offline Inference', managerTakeaway: 'Processes multi-gigabyte files asynchronously with automated parallel partitioning; pay only for active compute runtime.' },
    { component: 'Feature Store', role: 'Unified Feature Repository', managerTakeaway: 'Eliminates train-serve skew by providing versioned feature sets accessible via batch training and sub-10ms online key lookup.' },
    { component: 'MLflow Integration', role: 'Experiment & Artifact Lineage', managerTakeaway: 'Native integration allows tracking metrics, parameters, and model artifacts with zero code rewrites using standard MLflow APIs.' },
    { component: 'Responsible AI Dashboard', role: 'Fairness, Error Analysis & XAI', managerTakeaway: 'Generates explainability reports, checks demographic parity across protected cohorts, and isolates error hotspots for audits.' },
    { component: 'Model Data Collector', role: 'Drift & Telemetry Logging', managerTakeaway: 'Automatically captures incoming payload and prediction data to Blob storage for scheduled data drift and concept drift analysis.' }
  ],

  decisionScenarios: [
    {
      question: 'Traditional ML vs Generative AI (LLMs)?',
      guidance: 'Use Traditional ML for tabular structured data, numerical forecasting, fraud scoring, churn prediction, and sub-10ms latency needs. Use Generative AI for unstructured text, complex conversational reasoning, document synthesis, and code generation.'
    },
    {
      question: 'Fine-Tuning vs RAG vs In-Context Learning?',
      guidance: 'Default to RAG + In-Context Learning for dynamic enterprise knowledge, policy manuals, and verifiable citations. Use Fine-Tuning only to adapt style, tone, specialized syntax (e.g. medical shorthand), or when teaching a small model a narrow domain task.'
    },
    {
      question: 'Real-time Online Inference vs Asynchronous Batch?',
      guidance: 'Use Real-time Managed Endpoints for user-facing interactive apps requiring <500ms responses. Use Batch Endpoints or the Azure OpenAI Global Batch API for nightly reports, bulk document cracking, and large-scale catalog enrichment (50% cheaper).'
    },
    {
      question: 'When are Dedicated GPUs Required vs Serverless APIs?',
      guidance: 'Use Serverless APIs (Foundry Models / Azure OpenAI) for 95% of enterprise LLM use cases. Provision dedicated GPU clusters (AKS with NC/ND series VMs) only for custom open-weight fine-tuning (DeepSpeed, Megatron) or when throughput exceeds 200,000 tokens/sec continuously.'
    }
  ],

  dataEcosystem: [
    { category: 'Object Store', tech: 'Azure Blob Storage / ADLS Gen2', characteristics: 'Lowest cost, hierarchical namespace, primary landing zone for raw PDFs, images, Parquet lake files.' },
    { category: 'Data Lakehouse', tech: 'Microsoft Fabric / Databricks Delta Lake', characteristics: 'ACID transactions, Delta/Iceberg open table formats, unified lakehouse for ETL, BI, and ML feature training.' },
    { category: 'Enterprise Warehouse', tech: 'Fabric Synapse Data Warehouse / Azure SQL', characteristics: 'Relational ACID, high-concurrency SQL analytics, structured dimensional models (Star/Snowflake).' },
    { category: 'NoSQL & State', tech: 'Azure Cosmos DB', characteristics: 'Single-digit millisecond latency, multi-region replication, schema-less JSON storage for agent memory and session state.' },
    { category: 'Vector & Search', tech: 'Azure AI Search', characteristics: 'Purpose-built hybrid retrieval engine combining BM25, HNSW dense vectors, and deep cross-encoder semantic reranking.' },
    { category: 'Data Governance', tech: 'Microsoft Purview', characteristics: 'Unified data catalog, automated PII classification, end-to-end data lineage, and access policy governance.' }
  ],

  resilienceEngineering: [
    { pattern: 'Exponential Backoff with Jitter', desc: 'Retries failed HTTP calls with randomized exponential delays: `Delay = min(MaxDelay, BaseDelay * 2^attempt) + jitter`. Prevents thundering herd on throttled backends.' },
    { pattern: 'Circuit Breaker', desc: 'Monitors downstream error rates; if failures exceed 50% over 30s, trips open and fails fast without sending traffic to failing models.' },
    { pattern: 'APIM Multi-Region Failover Pool', desc: 'Distributes traffic across Azure OpenAI deployments in East US, Sweden Central, and Canada Central with automated priority failover.' },
    { pattern: 'Semantic & Prompt Caching', desc: 'Caches frequent user prompt responses in Redis; leverages Azure OpenAI automatic prompt caching (>50% cost and latency reduction on identical prefixes).' },
    { pattern: 'Graceful Fallback Model Degradation', desc: 'If primary reasoning model (GPT-4o) times out or throttles, APIM automatically falls back to secondary fast model (GPT-4o-mini).' }
  ],

  enterpriseIntegrations: [
    { system: 'SAP ERP / S4HANA', pattern: 'Logic Apps SAP Connector / OData API', useCase: 'Automating purchase order validation, inventory queries, invoice matching via agent tool calls.' },
    { system: 'Salesforce CRM', pattern: 'Azure Functions + REST API / Webhooks', useCase: 'Summarizing customer case history, automating lead qualification, drafting sales proposals.' },
    { system: 'ServiceNow', pattern: 'Event Grid + Service Bus + Logic Apps', useCase: 'Auto-triage of IT incident tickets, automated resolution suggestions, employee onboarding workflows.' },
    { system: 'Microsoft Dynamics 365', pattern: 'Dataverse Connector / Power Platform', useCase: 'Customer Service Copilot assistance, automated invoice extraction, field service scheduling.' },
    { system: 'SharePoint & OneDrive', pattern: 'Azure AI Search SharePoint Indexer / Microsoft Graph', useCase: 'Zero-trust enterprise search with document-level security trimming based on Entra ID group membership.' },
    { system: 'Microsoft Teams', pattern: 'Bot Framework / Teams Adaptive Cards', useCase: 'Conversational agent interface with interactive cards for Human-in-the-Loop approvals.' }
  ]
};

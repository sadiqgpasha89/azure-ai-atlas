/* Domain 7 & 8: Traditional Machine Learning, MLOps & Enterprise Data Architecture
   Classical ML lifecycle, Azure ML knowledge matrix, predictive vs GenAI decisions,
   Lakehouse data architecture, and enterprise ERP/CRM integration playbooks. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.traditionalML = {
  title: 'Traditional ML, MLOps & Enterprise Data Architecture',
  lede: 'High-performing enterprise AI organizations balance generative AI reasoning with classical machine learning, scalable Lakehouse data pipelines, and ERP/CRM integration.',

  mlLifecycle: [
    { phase: '01. Business Problem Definition', focus: 'Formulating the business objective as a quantifiable statistical target (e.g. churn classification, demand forecasting). Assessing whether deterministic rules or classical ML are more appropriate than expensive generative LLMs.' },
    { phase: '02. Data Ingestion & Collection', focus: 'Extracting historical training datasets from enterprise Lakehouses (Fabric, Databricks Delta Lake, ADLS Gen2, Azure SQL) with lineage tracked in Microsoft Purview.' },
    { phase: '03. Data Preparation & Cleaning', focus: 'Handling missing values, outlier detection, data normalization, deduplication, and schema validation using Azure Data Factory and Apache Spark.' },
    { phase: '04. Feature Engineering & Feature Store', focus: 'Creating domain-specific predictive features, time-window aggregations, and persisting reusable features in Azure ML Feature Store for zero-skew training/serving.' },
    { phase: '05. Experimentation & Algorithm Selection', focus: 'Systematic model benchmarking across LightGBM, XGBoost, CatBoost, Scikit-learn, and neural architectures tracked via MLflow in Azure Machine Learning.' },
    { phase: '06. Distributed Model Training', focus: 'Executing training jobs on CPU clusters or GPU node pools (NC-series) with hyperparameter tuning (HyperDrive) and early stopping policies.' },
    { phase: '07. Evaluation & Validation', focus: 'Rigorous cross-validation on holdout test datasets measuring ROC-AUC, PR-AUC, F1-score, RMSE, MAE, and evaluating fair lending/bias via the Responsible AI Dashboard.' },
    { phase: '08. Model Approval & Release Gate', focus: 'Formal review gate where Model Risk Management evaluates performance degradation, explainability (SHAP values), and business impact prior to registry promotion.' },
    { phase: '09. Model Registry & Packaging', focus: 'Version-controlling approved model weights, dependency environments (Docker/Conda), and scoring scripts in the Azure ML Model Registry with immutable tags.' },
    { phase: '10. Deployment & Online Endpoints', focus: 'Deploying to Azure ML Managed Online Endpoints (sub-10ms real-time scoring with blue-green canary traffic splits) or Batch Endpoints for asynchronous bulk scoring.' },
    { phase: '11. Continuous Monitoring & Drift Detection', focus: 'Streaming request payloads and predictions to Azure Monitor and Application Insights. Detecting Data Drift (covariate shift) and Concept Drift (model degradation).' },
    { phase: '12. Automated Retraining Pipelines', focus: 'Triggering Azure ML retraining pipelines automatically when statistical drift exceeds predefined thresholds or on a regular business calendar schedule.' }
  ],

  azureMLMatrix: [
    { capability: 'Azure ML Workspaces', purpose: 'Centralized enterprise boundary managing security, compute, data assets, and team collaboration.' },
    { capability: 'Compute Instances & Clusters', purpose: 'Managed cloud workstations for data scientists and autoscaling CPU/GPU compute pools for distributed training.' },
    { capability: 'Managed Online Endpoints', purpose: 'Fully managed real-time inference hosting with built-in HTTPS routing, canary traffic splitting, and auto-scaling.' },
    { capability: 'Batch Endpoints', purpose: 'Asynchronous scoring of gigabyte-to-terabyte datasets stored in Blob/ADLS Gen2 with zero idle compute cost.' },
    { capability: 'Azure ML Model Registry', purpose: 'Central catalog tracking model versions, training run lineage, evaluation metrics, and deployment status.' },
    { capability: 'MLflow Integration', purpose: 'Native support for open-source MLflow APIs for logging parameters, metrics, artifacts, and registering models.' },
    { capability: 'Responsible AI Dashboard', purpose: 'Built-in model interpretability (SHAP), error analysis, causal inference, and demographic parity fairness metrics.' },
    { capability: 'Model & Data Drift Monitoring', purpose: 'Continuous statistical tests (Wasserstein distance, Population Stability Index) comparing serving data to baseline training sets.' }
  ],

  managerDecisions: [
    {
      decision: 'Traditional ML vs Generative AI (LLM)',
      whenTraditional: 'Structured numerical/tabular data, fraud classification, demand forecasting, credit risk scoring, sub-10ms latency SLAs, and strictly auditable mathematical formulas.',
      whenGenAI: 'Unstructured natural language text, conversational dialogue, code generation, summarization, document extraction, and creative synthesis.',
      managerVerdict: 'Never use an LLM for pure tabular classification or regression; it is 100x more expensive, non-deterministic, and less accurate than LightGBM/XGBoost.'
    },
    {
      decision: 'Fine-Tuning vs In-Context Prompt Engineering',
      whenTraditional: 'Prompt engineering (few-shot prompting, RAG context injection) satisfies 95% of enterprise use cases with zero training cost.',
      whenGenAI: 'Fine-tuning is warranted only when teaching specialized output syntax, novel domain jargon, or reducing token latency/cost on millions of high-volume repetitive prompts.',
      managerVerdict: 'Always exhaust prompt engineering and RAG first. Fine-tuning models without a robust evaluation dataset is an expensive anti-pattern.'
    },
    {
      decision: 'Custom Model Training vs Pretrained Catalog Models',
      whenTraditional: 'Pretrained models from Microsoft Foundry (frontier OpenAI models, Phi, Llama) provide immediate time-to-value for natural language tasks.',
      whenGenAI: 'Custom model training is strictly required for proprietary tabular datasets, internal sensor signals, or proprietary drug discovery models.',
      managerVerdict: 'Use off-the-shelf foundation models for language; train custom algorithms on proprietary enterprise tabular data.'
    },
    {
      decision: 'Batch Inference vs Real-Time Online Endpoints',
      whenTraditional: 'Batch inference is 50-80% cheaper and ideal for nightly scoring, recommendation generation, customer churn updates, and non-interactive workflows.',
      whenGenAI: 'Real-time online endpoints are mandatory for user-facing interactive chats, real-time credit card fraud authorization, and live voice interactions.',
      managerVerdict: 'Default to batch processing whenever immediate sub-second human feedback is not required.'
    },
    {
      decision: 'GPU Compute vs CPU Inference',
      whenTraditional: 'CPU inference is highly cost-effective for classical ML (XGBoost, Random Forests, Scikit-learn) and small quantized language models (Phi-4).',
      whenGenAI: 'High-end GPUs (NVIDIA A100, H100) are required for training large models, fine-tuning, and low-latency serving of unquantized frontier LLMs.',
      managerVerdict: 'Right-size compute: do not deploy expensive GPU clusters for workloads that run efficiently on commodity multicore CPUs.'
    },
    {
      decision: 'Scheduled vs Drift-Triggered Retraining Pipelines',
      whenTraditional: 'Scheduled retraining (e.g. monthly) provides predictable operational rhythms and budget control.',
      whenGenAI: 'Automated drift-triggered retraining ensures models recover immediately when sudden macroeconomic shifts or consumer behavior changes occur.',
      managerVerdict: 'Implement a hybrid approach: automated alerting on statistical data drift, with automated pipeline execution requiring a human approval gate before production deployment.'
    }
  ],

  dataArchitectures: [
    { type: 'Data Lake (Blob / ADLS Gen2)', bestFor: 'Raw unstructured documents, PDFs, images, audio files, and historical raw event logs.', format: 'Parquet, JSON, Raw Files', latency: 'Batch / Analytical' },
    { type: 'Data Warehouse (Fabric / Synapse)', bestFor: 'Highly structured dimensional models, corporate financial reporting, SQL BI analytics.', format: 'Columnar Tables', latency: 'Sub-second to Seconds' },
    { type: 'Lakehouse (Fabric OneLake / Databricks Delta)', bestFor: 'Unifying data engineering, ACID transactions, and ML feature preparation in open Delta-Parquet format.', format: 'Delta Lake (Parquet)', latency: 'Near Real-Time / Batch' },
    { type: 'Operational Database (Cosmos DB / Azure SQL)', bestFor: 'Transactional application state, user profiles, session memory, e-commerce orders.', format: 'BSON / Document / Relational', latency: '<10ms OLTP' },
    { type: 'Vector Database (Azure AI Search / Cosmos Vector)', bestFor: 'High-dimensional semantic embeddings, nearest-neighbor similarity search for RAG.', format: 'Floating Point Vectors (HNSW)', latency: '<30ms Retrieval' },
    { type: 'Knowledge Graph (Cosmos Gremlin / GraphRAG)', bestFor: 'Explicit entity-to-entity relationship traversal, fraud ring analysis, multi-hop reasoning.', format: 'Graph Nodes & Edges', latency: 'Graph Traversal' },
    { type: 'Streaming Event Bus (Event Hubs / Kafka)', bestFor: 'High-throughput event ingestion, telemetry streaming, clickstreams, IoT sensor streams.', format: 'Binary / Avro / JSON Streams', latency: '<50ms Pub/Sub' }
  ],

  enterpriseConnectors: [
    {
      system: 'SAP ERP / S/4HANA',
      protocol: 'OData v4 / RFC via Azure Logic Apps & APIM',
      pattern: 'AI agent extracts invoice data from PDF, validates PO against SAP OData service, checks line items, and stages SAP purchase order credit memo.',
      security: 'SAP Principal Propagation via Microsoft Entra ID SSO and X.509 client certificates.'
    },
    {
      system: 'Salesforce CRM',
      protocol: 'Salesforce REST API / OAuth 2.0 Webhooks',
      pattern: 'Agent reads customer history prior to support calls, updates opportunity notes, and drafts personalized follow-up emails grounded in CRM records.',
      security: 'Named Credentials, OAuth 2.0 JWT Bearer flow, field-level encryption.'
    },
    {
      system: 'ServiceNow ITSM',
      protocol: 'ServiceNow REST API / Incident Webhooks',
      pattern: 'Automated IT incident triage: agent inspects error logs, queries Azure AI Search knowledge base, drafts resolution steps, and updates ticket status.',
      security: 'Mutual TLS (mTLS), Entra ID Service Principal with scoped `itil` role access.'
    },
    {
      system: 'Microsoft Dynamics 365',
      protocol: 'Dataverse Web API / Power Platform Connectors',
      pattern: 'Customer service agent queries case histories, automatically creates customer service leads, and updates customer accounts via Dataverse.',
      security: 'Native Microsoft Entra ID integration and Microsoft Purview sensitivity labels.'
    },
    {
      system: 'Microsoft SharePoint & OneDrive',
      protocol: 'Microsoft Graph API / SharePoint CSOM',
      pattern: 'Automated enterprise knowledge ingestion: listening to document modifications, extracting text via Document Intelligence, and indexing in AI Search.',
      security: 'Graph API application permissions with Azure Private Link and Entra ID Conditional Access.'
    },
    {
      system: 'Microsoft Teams',
      protocol: 'Bot Framework / Teams Toolkit for VS Code',
      pattern: 'Deploying conversational agents directly into Teams channels and 1:1 chats with adaptive cards, action buttons, and human approval prompts.',
      security: 'Tenant-scoped Entra ID app registration with SSO token exchange.'
    }
  ]
};

/* Domain 4: RAG Engineering Lab & Retrieval Playbook
   Comprehensive reference covering 14 RAG architecture patterns, end-to-end ingestion pipeline,
   9 chunking strategies, 6 retrieval strategies, Azure AI Search engineering reference,
   11 evaluation metrics, and scientific benchmark experiments. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.ragLab = {
  title: 'RAG Engineering Lab & Retrieval Playbook',
  lede: 'Design, evaluate, and benchmark production retrieval-augmented generation pipelines on Azure AI Search and Microsoft Foundry.',

  patterns: [
    {
      id: 'basic-rag',
      num: '01',
      name: 'Basic RAG (Naive)',
      difficulty: 'Beginner',
      useCase: 'Simple knowledge chatbot, single static document collection, basic FAQ lookups.',
      retrievalFlow: 'User Query -> Embedding Generation -> Vector Similarity (Cosine/HNSW) -> Top-K Context Injection -> LLM Completion.',
      azureImplementation: 'Azure AI Search vector index with text-embedding-3-small + Azure OpenAI GPT-4o-mini.',
      tradeoffs: 'Fastest to implement (<1 day); susceptible to semantic drift, keyword mismatch, and poor handling of structured tables.'
    },
    {
      id: 'hybrid-rag',
      num: '02',
      name: 'Hybrid Search RAG (Vector + BM25)',
      difficulty: 'Intermediate',
      useCase: 'Enterprise corpora containing exact identifiers, acronyms, product SKUs, and general semantic themes.',
      retrievalFlow: 'User Query -> Parallel execution: [Dense Vector Search] & [Lexical BM25 Search] -> Reciprocal Rank Fusion (RRF) -> Combined Top-K -> LLM.',
      azureImplementation: 'Azure AI Search native hybrid query execution over searchable and vector fields.',
      tradeoffs: 'Significantly higher recall than pure vector or pure keyword search; marginal query latency overhead (~15ms).'
    },
    {
      id: 'semantic-ranking-rag',
      num: '03',
      name: 'Semantic Ranking RAG (Cross-Encoder)',
      difficulty: 'Intermediate',
      useCase: 'High-precision retrieval where the most relevant passage must appear in the top 3 results.',
      retrievalFlow: 'Hybrid Retrieval (Top 50 candidate passages) -> Azure AI Search Semantic Ranker (L2 deep cross-encoder model) -> Reordered Top 5 -> LLM.',
      azureImplementation: 'Azure AI Search Semantic Ranker feature powered by Microsoft Bing deep transformer models.',
      tradeoffs: 'Dramatically improves NDCG and Mean Reciprocal Rank (MRR); adds ~50-80ms cross-encoder inference latency and query unit cost.'
    },
    {
      id: 'metadata-filtered-rag',
      num: '04',
      name: 'Metadata-Filtered RAG (Security & Facets)',
      difficulty: 'Intermediate',
      useCase: 'Multi-tenant systems, role-based access control (RBAC), department-specific document routing, temporal filtering.',
      retrievalFlow: 'User Query + Auth Context -> Search Filter ($filter="tenantId eq \'finance\' and acl in [\'group-1\']") -> Vector/Hybrid Retrieval -> LLM.',
      azureImplementation: 'Azure AI Search OData filter expressions evaluated prior to or during HNSW vector graph traversal.',
      tradeoffs: 'Guarantees tenant isolation and zero unauthorized document leakage; requires consistent metadata extraction during ingestion.'
    },
    {
      id: 'multi-index-rag',
      num: '05',
      name: 'Multi-Index RAG (Domain Routing)',
      difficulty: 'Advanced',
      useCase: 'Disparate enterprise domains (e.g. Legal contracts vs IT support wikis vs HR benefits) requiring isolated index schemas.',
      retrievalFlow: 'User Query -> Intent & Domain Router (LLM / Embeddings) -> Target Index Selection -> Domain-Specific Retrieval -> Synthesizer LLM.',
      azureImplementation: 'Router agent hosted in Azure Container Apps querying dedicated Azure AI Search indexes per domain.',
      tradeoffs: 'Optimizes chunk sizes and vector algorithms per domain schema; requires an accurate upstream routing classifier.'
    },
    {
      id: 'hierarchical-rag',
      num: '06',
      name: 'Hierarchical RAG (Multi-Tier Summary)',
      difficulty: 'Advanced',
      useCase: 'Massive document archives, multi-hundred-page annual reports, book-length technical manuals.',
      retrievalFlow: 'User Query -> Tier 1: Search Document Summaries -> Identify Relevant Documents -> Tier 2: Search Specific Passages within Selected Docs -> LLM.',
      azureImplementation: 'Azure AI Search index containing document-level executive summaries linked to parent document chunks.',
      tradeoffs: 'Prevents noise from unrelated documents while preserving granular citations; requires multi-pass indexing pipelines.'
    },
    {
      id: 'parent-child-rag',
      num: '07',
      name: 'Parent-Child RAG (Small-to-Big Retrieval)',
      difficulty: 'Advanced',
      useCase: 'Context-preserving retrieval where small chunks are needed for sharp vector matching, but full paragraphs are needed for LLM synthesis.',
      retrievalFlow: 'Query -> Vector search matches fine-grained Child Chunks (100 tokens) -> Index resolves Parent Chunk ID -> Full Parent Context (800 tokens) injected -> LLM.',
      azureImplementation: 'Azure AI Search index storing child embeddings with parent chunk text in non-vectorized payload fields.',
      tradeoffs: 'Optimal balance of high embedding precision with rich context injection; increases storage volume by ~30%.'
    },
    {
      id: 'graph-rag',
      num: '08',
      name: 'Graph RAG (Entity & Relationship Traversal)',
      difficulty: 'Advanced',
      useCase: 'Relationship-heavy data, cross-document intelligence, holistic corpus questions ("Summarize all conflicts of interest").',
      retrievalFlow: 'Query -> Entity Extraction -> Knowledge Graph Traversal (Entities, Relationships, Communities) + Vector Search -> Synthesizer LLM.',
      azureImplementation: 'Microsoft GraphRAG library running on Azure Container Apps with Azure Cosmos DB Gremlin / AI Search.',
      tradeoffs: 'Unlocks multi-hop entity reasoning across documents; significant upfront indexing compute and token cost.'
    },
    {
      id: 'agentic-rag',
      num: '09',
      name: 'Agentic RAG (Dynamic Reflection & Multi-Query)',
      difficulty: 'Advanced',
      useCase: 'Complex, ambiguous, or multi-part research questions requiring iterative retrieval and self-correction.',
      retrievalFlow: 'Query -> Agent decomposes into sub-queries -> Search execution -> Agent inspects retrieved facts -> Formulates follow-up queries if gaps exist -> Synthesis.',
      azureImplementation: 'Foundry Agent Service / Microsoft Agent Framework with Azure AI Search tool connection.',
      tradeoffs: 'Drastically cuts hallucinations and incomplete answers; increases latency (2-4 LLM round-trips) and token cost.'
    },
    {
      id: 'multi-agent-rag',
      num: '10',
      name: 'Multi-Agent RAG (Specialized Swarms)',
      difficulty: 'Expert',
      useCase: 'Multi-domain investigations (e.g. M&A due diligence requiring legal, financial, and technical document review).',
      retrievalFlow: 'Supervisor Agent assigns sub-tasks -> Parallel domain agents query respective indexes -> Critic agent verifies citations -> Synthesizer consolidates.',
      azureImplementation: 'Multi-agent orchestration in Microsoft Agent Framework deployed on Azure Container Apps.',
      tradeoffs: 'Highest quality and comprehensive synthesis for mission-critical tasks; complex orchestration and high token consumption.'
    },
    {
      id: 'multimodal-rag',
      num: '11',
      name: 'Multimodal RAG (Text, Images & Tables)',
      difficulty: 'Expert',
      useCase: 'Technical architecture diagrams, scanned financial invoices, medical pathology charts, multimodal corporate decks.',
      retrievalFlow: 'Query (Text/Image) -> Multimodal Embedding -> Azure AI Search retrieves text passages + diagram image crops -> GPT-4o Multimodal synthesis.',
      azureImplementation: 'Azure Document Intelligence Layout model + Azure AI Vision Multimodal Embeddings + GPT-4o.',
      tradeoffs: 'Full fidelity extraction of non-text assets; requires visual cropping pipelines and multimodal token budgets.'
    },
    {
      id: 'real-time-rag',
      num: '12',
      name: 'Real-Time RAG (Streaming Freshness)',
      difficulty: 'Expert',
      useCase: 'Financial trading news, real-time IoT sensor telemetry, live sports commentary, active security incident feeds.',
      retrievalFlow: 'Streaming events (Event Hubs) -> Instant in-memory vector indexing (Azure Managed Redis / push indexer) -> Sub-minute retrieval freshness.',
      azureImplementation: 'Azure Event Hubs -> Azure Stream Analytics / Container App -> Azure AI Search push API / Redis vector search.',
      tradeoffs: 'Sub-second document freshness from ingestion to query; requires dedicated streaming infrastructure and push indexing.'
    },
    {
      id: 'streaming-rag',
      num: '13',
      name: 'Streaming RAG (Low-Latency UX)',
      difficulty: 'Advanced',
      useCase: 'Customer-facing conversational applications where responsiveness and perceived latency are paramount.',
      retrievalFlow: 'User Query -> Async retrieval -> First chunk retrieved -> Stream starts -> LLM generates tokens progressively via Server-Sent Events (SSE).',
      azureImplementation: 'Azure Container Apps running FastAPI with async generator streaming over HTTP/2.',
      tradeoffs: 'Reduces perceived latency (TTFT) from 3,000ms to <350ms; requires full async pipeline and WebSocket/SSE client handling.'
    },
    {
      id: 'contextual-rag',
      num: '14',
      name: 'Contextual RAG (Chunk Enrichment)',
      difficulty: 'Advanced',
      useCase: 'Documents where individual chunks lack local context (e.g. "The company grew by 20%" - which company? which year?).',
      retrievalFlow: 'Ingestion: LLM prepends document-level explanatory context to every chunk before embedding -> Enriched embedding & text stored in search.',
      azureImplementation: 'Custom Azure AI Search ingestion skillset calling Azure OpenAI GPT-4o-mini to contextualize chunks.',
      tradeoffs: 'Reduces retrieval failure rate by 30-40%; adds upfront token cost during the one-time ingestion phase.'
    }
  ],

  ingestionPipeline: {
    title: 'Enterprise RAG Ingestion Pipeline & Workflow',
    stages: [
      { step: '1. Ingestion Triggers', desc: 'Enterprise data connectors for SharePoint, Blob Storage, ADLS Gen2, Azure SQL, and external APIs with change detection.' },
      { step: '2. Document Cracking & OCR', desc: 'Azure AI Document Intelligence Layout model extracting text, reading order, and Markdown tables from PDF, Word, Excel, scanned TIFF.' },
      { step: '3. Normalization & Cleansing', desc: 'Unicode normalization, stripping noisy headers/footers, deduplication via SHA-256 content hashing, and PII masking.' },
      { step: '4. Metadata Enrichment', desc: 'Extracting author, date, department, document version, tenant ID, and generating document-level summary context.' },
      { step: '5. Intelligent Chunking', desc: 'Applying structural, recursive, semantic, or table-aware chunking strategies with bounded token overlap.' },
      { step: '6. Embedding Generation', desc: 'Batch generating dense vector embeddings via text-embedding-3-large (1536 or 3072 dims) with rate-limit backoff.' },
      { step: '7. Search Indexing', desc: 'Writing vectors, text, metadata filters, and security ACLs into Azure AI Search indexes with index projections.' },
      { step: '8. Validation & Quality Checks', desc: 'Automated retrieval regression testing on golden benchmark queries, verifying index completeness, and DLQ logging.' }
    ],
    supportedFormats: ['PDF (Native & Scanned OCR)', 'Microsoft Word (DOCX)', 'Excel (XLSX / CSV)', 'PowerPoint (PPTX)', 'HTML / Intranet Wikis', 'JSON / Structured Records', 'Images (PNG / JPEG / TIFF)'],
    productionTopics: [
      { topic: 'Incremental Ingestion & Change Detection', desc: 'High-watermark policies based on Blob metadata_storage_last_modified and SQL change tracking to re-index only updated files.' },
      { topic: 'Index Rebuild Strategies', desc: 'Zero-downtime blue-green index swapping: create new index v2, populate via indexer, update application alias, delete old index.' },
      { topic: 'Dead-Letter Queues (DLQ) & Error Handling', desc: 'Corrupted or password-protected PDFs routed to Azure Service Bus DLQ with Application Insights alerting and retry counters.' },
      { topic: 'Document Deduplication', desc: 'Computing SHA-256 hash of extracted text to prevent indexing duplicate files stored across different folders.' }
    ]
  },

  chunkingStrategies: [
    {
      id: 'fixed-size',
      name: 'Fixed-Size Chunking with Overlap',
      complexity: 'Low',
      tokenRange: '256 – 1024 tokens (10-20% overlap)',
      strengths: 'Fastest to implement, deterministic chunk sizes, predictable vector storage sizing and minimal processing overhead.',
      weaknesses: 'Frequently cuts sentences, tables, and code blocks in half; degrades semantic coherence and context boundary retention.',
      sweetSpots: 'Uniform plain text articles, news feeds, unformatted narrative corpora.',
      azureImplementation: 'Standard character/token splitters in ingestion pipeline before calling Azure AI Search indexer.'
    },
    {
      id: 'recursive',
      name: 'Recursive Character / Markdown Chunking',
      complexity: 'Low-Medium',
      tokenRange: '300 – 800 tokens',
      strengths: 'Attempts to split on structural boundaries first (double newline, single newline, spaces); respects Markdown headings and paragraphs.',
      weaknesses: 'Can still fragment complex multi-row tables and deeply nested lists unless paired with layout-aware parsing.',
      sweetSpots: 'Standard Markdown documentation, technical manuals, knowledge base articles, intranet wikis.',
      azureImplementation: 'Azure AI Search integrated vectorization with Markdown-aware text split skills.'
    },
    {
      id: 'semantic',
      name: 'Semantic / Embedding-Distance Chunking',
      complexity: 'High',
      tokenRange: 'Dynamic (200 – 1200 tokens)',
      strengths: 'Splits text only when the semantic similarity between consecutive sentences drops below a dynamic threshold; preserves complete thoughts.',
      weaknesses: 'Requires running an embedding model over every sentence during ingestion; significantly higher ingestion latency and cost.',
      sweetSpots: 'Academic research papers, legal briefs, dense multi-topic narrative transcripts.',
      azureImplementation: 'Pre-processing pipeline in Azure Functions calculating cosine similarity delta on sentence vectors.'
    },
    {
      id: 'sentence-based',
      name: 'Sentence-Based Chunking',
      complexity: 'Low-Medium',
      tokenRange: '150 – 400 tokens (3-5 sentences)',
      strengths: 'Never splits midway through a proposition or assertion; preserves linguistic completeness.',
      weaknesses: 'Sentence length variance creates irregular chunk sizes; fails to capture macro-level document context.',
      sweetSpots: 'Customer FAQ lists, interview transcripts, legal deposition Q&A.',
      azureImplementation: 'spaCy / NLTK sentence boundary detection within Azure Container Apps worker.'
    },
    {
      id: 'parent-child',
      name: 'Parent-Child / Hierarchical Chunking',
      complexity: 'High',
      tokenRange: 'Child: 128 tokens | Parent: 1024 tokens',
      strengths: 'Small child vectors ensure precise semantic search matching; full parent chunk injection provides rich context for LLM synthesis.',
      weaknesses: 'Higher storage requirements and more complex search schema linking child records to parent text.',
      sweetSpots: 'Complex multi-page technical manuals, regulatory compliance frameworks, insurance policy booklets.',
      azureImplementation: 'Azure AI Search index containing child chunk vectors with parentId mapping to parent text in Blob or search payload.'
    },
    {
      id: 'table-aware',
      name: 'Layout- & Table-Aware Chunking',
      complexity: 'High',
      tokenRange: 'Table-scoped (entire table or row-grouped)',
      strengths: 'Preserves row-column relationships and table headers in Markdown format; eliminates hallucinated tabular data.',
      weaknesses: 'Requires advanced document intelligence parsing upfront; large tables can exceed chunk token limits.',
      sweetSpots: 'Financial 10-K filings, invoices, scientific experimental results, pricing sheets.',
      azureImplementation: 'Azure AI Document Intelligence layout model extracting HTML/Markdown tables injected as single contiguous chunks.'
    },
    {
      id: 'document-aware',
      name: 'Document-Aware / Metadata-Enriched Chunking',
      complexity: 'Medium-High',
      tokenRange: '300 – 800 tokens',
      strengths: 'Prepends global document title, section breadcrumbs, and author metadata to each chunk, anchoring isolated passages.',
      weaknesses: 'Consumes 20-50 tokens of chunk budget for prepended metadata header.',
      sweetSpots: 'Corporate policies, legal contracts with numbered sections (Section 4.1.2), product catalogs.',
      azureImplementation: 'Custom Azure AI Search ingestion skillset prepending JSON metadata string to chunk content.'
    },
    {
      id: 'overlap-optimization',
      name: 'Sliding Window with Overlap Optimization',
      complexity: 'Medium',
      tokenRange: '512 tokens with 100 token overlap (20%)',
      strengths: 'Prevents boundary loss where crucial context is split across adjacent chunks.',
      weaknesses: 'Increases index size and embedding generation cost by 20-25%; risks duplicate retrieved passages.',
      sweetSpots: 'Narrative documents, continuous storytelling, customer support tickets.',
      azureImplementation: 'Token-based sliding window tokenizer in Python ingestion pipeline.'
    },
    {
      id: 'chunk-experiments',
      name: 'Dynamic Chunk Sizing by Experimentation',
      complexity: 'Advanced',
      tokenRange: 'Parametric (Testing 256, 512, 1024 tokens)',
      strengths: 'Empirically determines optimal chunk size by testing retrieval recall on golden question benchmarks.',
      weaknesses: 'Requires maintaining parallel test indexes and running automated evaluation pipelines.',
      sweetSpots: 'New enterprise domains where optimal chunk geometry is unknown upfront.',
      azureImplementation: 'Azure Foundry evaluation pipeline executing automated retrieval benchmarks across 3 index variations.'
    }
  ],

  retrievalStrategies: [
    {
      id: 'dense-vector',
      name: 'Dense Vector Search (HNSW)',
      mechanism: 'Approximate Nearest Neighbor using Hierarchical Navigable Small World (HNSW) graphs on embeddings (e.g. text-embedding-3-large).',
      recallImpact: 'High for concepts & synonyms',
      precisionImpact: 'Moderate on exact terms',
      latencyCost: '15 – 35ms',
      bestFit: 'Abstract conceptual queries, cross-lingual retrieval, semantic question-answering.',
      limitation: 'Fails on exact product SKUs, serial numbers, error codes, and unique personal names.'
    },
    {
      id: 'bm25-lexical',
      name: 'Lexical Search (BM25)',
      mechanism: 'Term frequency / inverse document frequency ranking with language analyzers and stemming.',
      recallImpact: 'Low on synonyms',
      precisionImpact: 'Very High on exact terms',
      latencyCost: '5 – 15ms',
      bestFit: 'Exact keyword matching, part numbers, code snippets, legal statutes.',
      limitation: 'Zero recall when user query uses synonyms not present in the indexed text.'
    },
    {
      id: 'hybrid-search',
      name: 'Hybrid Search (Vector + BM25 with RRF)',
      mechanism: 'Executes parallel vector and BM25 queries, merging ranked lists using Reciprocal Rank Fusion: RRF Score = 1 / (60 + Rank).',
      recallImpact: '+18% to +25% over single mode',
      precisionImpact: 'High across all query types',
      latencyCost: '25 – 50ms',
      bestFit: 'Default standard for enterprise search. Catches both conceptual questions and exact jargon.',
      limitation: 'Requires dual indexing (text and vector fields), increasing storage by ~20%.'
    },
    {
      id: 'semantic-ranker',
      name: 'Hybrid + Semantic Ranker (L2 Cross-Encoder)',
      mechanism: 'Passes top-50 hybrid candidates to a deep transformer cross-encoder running inside Azure AI Search to compute deep semantic relevance scores.',
      recallImpact: 'Maximum NDCG relevance',
      precisionImpact: 'Superior ranking order',
      latencyCost: '+80 – 180ms',
      bestFit: 'Complex enterprise question answering where Top-1 and Top-3 accuracy is critical to prevent hallucinations.',
      limitation: 'Adds 100ms+ latency and billable Semantic Ranker request units ($1 per 1,000 queries).'
    },
    {
      id: 'metadata-filtering',
      name: 'Pre-Filtered Retrieval (Security & Tenancy)',
      mechanism: 'Evaluates boolean expressions on filterable fields (e.g. tenantId eq \'finance\' and acl in (\'group1\')) before or during vector traversal.',
      recallImpact: 'Constrained to authorized scope',
      precisionImpact: 'Zero unauthorized leakage',
      latencyCost: '5 – 20ms',
      bestFit: 'Multi-tenant applications, document-level security trimming, date-bounded queries.',
      limitation: 'Overly restrictive filters can eliminate valid results if metadata tagging is incomplete.'
    },
    {
      id: 'query-expansion',
      name: 'Query Expansion & Multi-Query Decomposition',
      mechanism: 'An upstream fast LLM (GPT-4o-mini) decomposes ambiguous user questions into 3-5 distinct sub-queries executed in parallel.',
      recallImpact: '+30% on complex queries',
      precisionImpact: 'Variable (can introduce noise)',
      latencyCost: '+300 – 600ms (LLM call)',
      bestFit: 'Agentic RAG, comparative questions ("Compare Q3 policy with Q4 policy"), research assistants.',
      limitation: 'Multiplies search queries and adds initial LLM token latency.'
    }
  ],

  searchReference: {
    title: 'Azure AI Search Engineering & Tuning Reference',
    topics: [
      {
        name: 'Vector Algorithms: HNSW vs Exhaustive KNN',
        desc: 'HNSW (Hierarchical Navigable Small World) provides approximate nearest neighbor search with sub-20ms latency at scale. Parameters: m (number of bi-directional links, default 4, optimal 8-16) and efConstruction (build quality, default 400). Exhaustive KNN compares every vector; exact precision but O(N) latency, suitable only for indexes <50,000 documents.'
      },
      {
        name: 'Hybrid Search & Reciprocal Rank Fusion (RRF)',
        desc: 'Executes BM25 keyword query and vector similarity query concurrently. RRF formula: RRF(d) = sum(1 / (k + rank)) where k=60. Combines exact lexical hits (part numbers, acronyms) with conceptual semantic hits into a single normalized score list.'
      },
      {
        name: 'Azure AI Search Semantic Ranker',
        desc: 'Applies deep cross-encoder neural models trained by Microsoft Bing to the top 50 hybrid search results. Re-scores passages based on contextual semantic relevance and extracts concise answer snippets with high-precision captions.'
      },
      {
        name: 'Integrated Vectorization vs Custom Skillset',
        desc: 'Integrated Vectorization lets Azure AI Search handle data ingestion, document cracking, chunking, and embedding generation natively using built-in Azure OpenAI connectors. Custom skillsets via Azure Functions are used when proprietary OCR, regex cleansing, or specialized chunking logic is required.'
      },
      {
        name: 'Security Trimming & Document-Level ACLs',
        desc: 'Indexes store an array field allowedGroups containing Entra ID security group GUIDs. Queries enforce $filter=allowedGroups/any(g: search.in(g, \'user-groups-csv\')), ensuring users never see unauthorized document citations.'
      }
    ]
  },

  evaluationMetrics: [
    { name: 'Faithfulness', definition: 'Measures whether the claims in the generated response are strictly inferred from the retrieved context without hallucination.', target: '> 95%' },
    { name: 'Groundedness', definition: 'Fraction of statements in the answer that can be attributed directly to specific citation passages in retrieved documents.', target: '> 95%' },
    { name: 'Answer Relevance', definition: 'Evaluates how directly and completely the response answers the user\'s original question without off-topic drift.', target: '> 90%' },
    { name: 'Context Precision', definition: 'Ratio of relevant information in retrieved chunks relative to the total tokens retrieved; measures noise reduction.', target: '> 85%' },
    { name: 'Context Recall', definition: 'Whether all information necessary to produce the ideal reference ground truth answer was present in retrieved chunks.', target: '> 90%' },
    { name: 'Retrieval Precision@K (K=5)', definition: 'Percentage of retrieved top-K chunks that contain genuinely relevant information.', target: '> 85%' },
    { name: 'Retrieval Recall@K (K=5)', definition: 'Percentage of benchmark questions where at least one correct passage appears in the top-K search results.', target: '> 92%' },
    { name: 'MRR (Mean Reciprocal Rank)', definition: 'Average reciprocal rank (1/rank) of the first relevant document; measures how quickly the top hit appears.', target: '> 0.80' },
    { name: 'NDCG@5', definition: 'Normalized Discounted Cumulative Gain; measures ranking quality with logarithmic discounting for lower ranks.', target: '> 0.85' },
    { name: 'Citation Correctness', definition: 'Percentage of inline citations that accurately support the exact sentence they reference upon automated verification.', target: '> 98%' },
    { name: 'Abstention Accuracy', definition: 'System correctly responds "I do not have enough information" when the question cannot be answered from the retrieved data.', target: '> 95%' }
  ],

  benchmarkExperiments: [
    {
      id: 'exp-1',
      name: 'Baseline: Pure Lexical BM25',
      chunking: 'Fixed 512 tokens',
      retrieval: 'BM25 Keyword',
      groundedness: 72.4,
      relevance: 68.1,
      recall5: 64.2,
      latencyMs: 380,
      costPer1k: 1.85,
      verdict: 'Fails on semantic synonyms; acceptable only for exact SKU and code lookup.'
    },
    {
      id: 'exp-2',
      name: 'Dense Vector Search Only',
      chunking: 'Fixed 512 tokens (text-embedding-3-small)',
      retrieval: 'HNSW Vector (Cosine)',
      groundedness: 84.1,
      relevance: 81.3,
      recall5: 79.8,
      latencyMs: 440,
      costPer1k: 2.10,
      verdict: 'High conceptual recall but misses exact acronyms and part numbers.'
    },
    {
      id: 'exp-3',
      name: 'Hybrid Search (Vector + BM25 via RRF)',
      chunking: 'Recursive Markdown 600 tokens',
      retrieval: 'Hybrid (BM25 + text-embedding-3-large RRF)',
      groundedness: 91.5,
      relevance: 89.2,
      recall5: 88.7,
      latencyMs: 520,
      costPer1k: 2.45,
      verdict: 'Substantial improvement across both domain vocabulary and natural questions.'
    },
    {
      id: 'exp-4',
      name: 'Hybrid + Azure AI Search Semantic Ranker',
      chunking: 'Document Intelligence Layout + Markdown 800 tokens',
      retrieval: 'Hybrid + L2 Semantic Reranker',
      groundedness: 97.2,
      relevance: 95.8,
      recall5: 95.1,
      latencyMs: 710,
      costPer1k: 3.45,
      verdict: 'Production Enterprise Gold Standard. High groundedness, eliminates noise chunks.'
    },
    {
      id: 'exp-5',
      name: 'Agentic RAG with Query Decomposition & Verification',
      chunking: 'Parent-Child + Table-Aware',
      retrieval: 'Agent Multi-Query + Hybrid + Semantic Ranker',
      groundedness: 98.6,
      relevance: 97.4,
      recall5: 97.9,
      latencyMs: 1650,
      costPer1k: 6.80,
      verdict: 'Highest quality for research and multi-document synthesis; higher latency and token cost.'
    }
  ]
};

/* RAG Engineering Lab
   Comprehensive reference and interactive tools for document cracking, chunking strategies,
   hybrid retrieval, semantic reranking, and evaluation benchmarking. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.ragLab = {
  title: 'RAG Engineering Lab',
  lede: 'Design, evaluate, and benchmark production retrieval-augmented generation pipelines on Azure AI Search and Microsoft Foundry.',

  chunkingStrategies: [
    {
      id: 'fixed-size',
      name: 'Fixed-Size Chunking with Overlap',
      complexity: 'Low',
      tokenRange: '256 – 1024 tokens (10-20% overlap)',
      strengths: 'Fastest to implement, deterministic chunk sizes, predictable vector storage sizing and minimal processing overhead.',
      weaknesses: 'Frequently cuts sentences, tables, and code blocks in half; degrades semantic coherence and context boundary retention.',
      sweetSpots: 'Uniform plain text articles, news feeds, unformatted narrative corpora.',
      azureImplementation: 'Standard LangChain / LlamaIndex character splitters before embedding generation in Azure AI Search custom skillset.'
    },
    {
      id: 'recursive',
      name: 'Recursive Character / Markdown Chunking',
      complexity: 'Low-Medium',
      tokenRange: '300 – 800 tokens',
      strengths: 'Attempts to split on structural boundaries first (double newline, single newline, spaces); respects document formatting.',
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
      azureImplementation: 'Pre-processing pipeline in Azure Functions or Container Apps calculating cosine similarity delta on sentence vectors.'
    },
    {
      id: 'parent-child',
      name: 'Parent-Child / Hierarchical Chunking',
      complexity: 'Medium-High',
      tokenRange: 'Child: 150 – 250 tokens | Parent: 1,500 – 3,000 tokens',
      strengths: 'Dense search over narrow child chunks provides high vector retrieval precision, while the LLM receives the broad parent context for generation.',
      weaknesses: 'Requires storing and managing parent-child relational IDs; increases index complexity and token payload in prompt assembly.',
      sweetSpots: 'Enterprise policy handbooks, contracts, compliance frameworks where specific clauses require surrounding chapter context.',
      azureImplementation: 'Index small chunks in Azure AI Search with a parentId metadata field referencing the complete document or section stored in Blob.'
    },
    {
      id: 'table-aware',
      name: 'Layout- & Table-Aware Chunking',
      complexity: 'High',
      tokenRange: 'Entire table or row-group (structured Markdown/HTML)',
      strengths: 'Keeps financial and operational tables intact with row headers repeated on split rows; prevents jumbled numerical facts.',
      weaknesses: 'Requires specialized OCR and layout models; standard PDF splitters destroy column alignments completely.',
      sweetSpots: 'SEC 10-K financial filings, invoices, engineering datasheets, laboratory test reports.',
      azureImplementation: 'Azure AI Document Intelligence layout model (`prebuilt-layout`) outputting structured Markdown tables directly into AI Search.'
    },
    {
      id: 'document-aware',
      name: 'Document-Aware / Metadata-Enriched Chunking',
      complexity: 'Medium',
      tokenRange: '400 – 800 tokens + metadata prefix',
      strengths: 'Prepends chunk metadata (document title, section hierarchy, date, department) to each chunk before embedding; solves isolated pronoun ambiguity.',
      weaknesses: 'Consumes 15-25% of each chunk\'s token budget for metadata headers.',
      sweetSpots: 'Corporate archives where hundreds of files share generic section headings like "Introduction" or "Overview".',
      azureImplementation: 'Custom Azure AI Search Skill injecting parent document properties into the text chunk before calling `AzureOpenAIEmbeddingSkill`.'
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
      mechanism: 'Evaluates boolean expressions on filterable fields (e.g. `tenantId eq \'finance\' and acl in (\'group1\')`) before or during vector traversal.',
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

  evaluationMetrics: [
    { name: 'Faithfulness', definition: 'Measures whether the claims in the generated response are strictly inferred from the retrieved context without hallucination.', target: '> 95%' },
    { name: 'Groundedness', definition: 'Fraction of statements in the answer that can be attributed directly to specific citation passages in retrieved documents.', target: '> 95%' },
    { name: 'Answer Relevance', definition: 'Evaluates how directly and completely the response answers the user\'s original question without off-topic drift.', target: '> 90%' },
    { name: 'Context Precision', definition: 'Ratio of relevant information in retrieved chunks relative to the total tokens retrieved; measures noise reduction.', target: '> 85%' },
    { name: 'Context Recall', definition: 'Whether all information necessary to produce the ideal reference ground truth answer was present in retrieved chunks.', target: '> 90%' },
    { name: 'Recall@K (K=5)', definition: 'Percentage of benchmark questions where at least one correct passage appears in the top-K search results.', target: '> 92%' },
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

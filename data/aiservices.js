/* Foundry Tools (pre-built AI services; formerly Azure AI Services) */
S({
  id: 'doc-intelligence', cat: 'aiservices', name: 'Azure AI Document Intelligence', doc: 'azure/ai-services/document-intelligence/',
  tag: 'OCR, layout, tables and field extraction from forms, invoices, IDs and contracts.',
  what: 'Document Intelligence turns document images and PDFs into structured data. The **Read** model does OCR for printed and handwritten text. The **Layout** model recovers pages, paragraphs, tables, headings and reading order (and can emit Markdown that is ready for chunking). **Prebuilt models** extract named fields from common documents such as invoices, receipts, identity documents and tax forms, and **custom models** learn the fields of your own forms.\n\nIt is usually cheaper, faster and more auditable than asking a general LLM to read pixels. Pair it with a model for the judgement step: map the extracted fields to your schema, check business rules, flag oddities.',
  flow: ['Document in Blob', 'Submit analyze', 'OCR + layout', 'Model (prebuilt / custom)', 'Fields + confidence', 'Review or post-process'],
  steps: [
    [0, 'A document lands in [[blob]] and an [[event-grid]] event starts the workflow.'],
    [1, 'The workflow submits it to the **analyze** API (by URL with a managed identity, or as bytes). The call is asynchronous.'],
    [2, 'The service runs OCR and layout analysis, detecting text, tables, selection marks and structure.'],
    [3, 'The chosen model (read, layout, prebuilt or custom) extracts text or typed fields.'],
    [4, 'The result arrives as JSON with values, bounding boxes and a **confidence score** per field.'],
    [5, 'Low-confidence or rule-failing results go to a human reviewer; the rest are stored for downstream systems.']
  ],
  gotchas: [
    '**Confidence is not correctness.** Set per-field thresholds from measured accuracy, and route the rest to review.',
    '**Analysis is asynchronous.** Design for polling or callbacks, and for multi-page documents that take longer.',
    '**Limits apply** to file size, page count, and requests per second. Large backfills hit throttles; use a queue and concurrency limits.',
    '**Custom model training needs representative samples**, including bad scans. A model trained on clean files fails on real ones.',
    '**An LLM downstream may invent a value.** Require each extracted value to appear in the source text before accepting it.'
  ],
  edges: [
    'Layout output as Markdown preserves tables and headings, which improves chunking for RAG.',
    'Add-on capabilities (high-resolution OCR, formulas, barcodes, query fields) are billed or enabled separately.',
    'Newer multimodal services such as [[content-understanding]] overlap; compare them on your documents.'
  ],
  ml: [
    'First stage of a document pipeline: extract, then validate and enrich with a model.',
    'Preparing PDFs and scans for [[ai-search]] ingestion with structure-aware chunking.',
    'Automating invoices, claims and onboarding forms with human review for low confidence.',
    'Cheap pre-processing that reduces the tokens sent to [[foundry-models]].'
  ],
  pairs: ['blob', 'ai-search', 'durable-functions', 'content-understanding', 'foundry-models', 'service-bus'],
  cost: 'Billed per page analysed, with different rates per model (Read cheapest, then Layout and prebuilt, then custom). Optional add-ons cost extra. Commitment tiers lower the unit price at steady volume.'
});

S({
  id: 'content-understanding', cat: 'aiservices', name: 'Azure AI Content Understanding', doc: 'azure/ai-services/content-understanding/',
  tag: 'Turn documents, images, audio and video into structured fields with one schema-driven service.',
  what: 'Content Understanding is a multimodal extraction service. You define an **analyzer**: a schema of the fields you want (for example "invoice total", "speaker sentiment", "scene summary"), and the service processes documents, images, audio or video and returns structured output, using generative models under the hood with content extraction (OCR, transcription, shot detection) in front.\n\nIt is the "describe what you want" counterpart to [[doc-intelligence|Document Intelligence]]\'s model catalogue. It suits cases where documents vary widely or where the same schema should apply across modalities, such as call recordings plus their attachments.',
  flow: ['Content (doc / audio / video)', 'Analyzer + schema', 'Content extraction', 'Generative field extraction', 'Structured JSON + confidence', 'Downstream'],
  steps: [
    [0, 'You supply a file or URL for a document, image, audio or video.'],
    [1, 'You choose or create an **analyzer** that defines the fields to extract and any instructions.'],
    [2, 'The service extracts the raw content: text and layout, transcripts, key frames.'],
    [3, 'A generative model fills your schema from that content, and can ground answers with source references.'],
    [4, 'Results return as JSON with field values and confidence or grounding information.'],
    [5, 'Your workflow validates the output, stores it, or routes uncertain items to review.']
  ],
  gotchas: [
    '**Generative extraction can be wrong.** Validate against source text and business rules, as with any LLM step.',
    '**Per-call cost is higher than classic OCR** for simple documents. Use the cheapest tool that meets accuracy.',
    '**Service maturity and Region availability change quickly.** Confirm GA status and limits before committing a design.',
    '**Schema design matters.** Vague field descriptions produce vague output; iterate with a labelled test set.',
    '**Video and audio are slow and costly** relative to text. Batch them and cache results.'
  ],
  edges: [
    'Analyzers can be reused across files, which keeps outputs consistent across a pipeline.',
    'Video analysis can segment by scene or shot and extract per-segment fields.',
    'Integrates with Foundry and [[ai-search]] ingestion flows for multimodal RAG.'
  ],
  ml: [
    'Multimodal intake: contracts, call recordings and screenshots under one schema.',
    'Indexing audio and video for search with structured summaries.',
    'Prototyping an extraction task quickly before deciding whether a specialised model is worth building.',
    'Combine with [[doc-intelligence]] for known forms and this service for the long tail.'
  ],
  pairs: ['doc-intelligence', 'ai-search', 'blob', 'foundry-models', 'durable-functions'],
  cost: 'Billed by the content processed (pages, minutes of audio and video) plus generative field-extraction usage. Costs vary by modality and analyzer; run a representative sample to estimate before scaling.'
});

S({
  id: 'ai-language', cat: 'aiservices', name: 'Azure AI Language', doc: 'azure/ai-services/language-service/',
  tag: 'Classic NLP as an API: entities, PII redaction, sentiment, summarisation and custom classifiers.',
  what: 'Azure AI Language bundles natural-language capabilities: **named entity recognition**, **PII detection and redaction**, key phrases, sentiment and opinion mining, language detection, summarisation, **conversational language understanding** and **custom text classification** and entity extraction trained on your labels.\n\nFor generative AI its most valuable role is the **PII detection** step: redact personal data before text enters a prompt, an index or a log. Task-specific models are fast and cheap, and give consistent output that is easy to test.',
  flow: ['Text in', 'Language detection', 'Feature (NER / PII / sentiment)', 'Model', 'Annotated JSON', 'Redact or route'],
  steps: [
    [0, 'Your application sends text (or batches of documents) to the Language endpoint.'],
    [1, 'The service detects the language, or you specify it.'],
    [2, 'You select a feature: entity recognition, PII detection, sentiment, classification and so on.'],
    [3, 'The matching model analyses the text.'],
    [4, 'The response lists entities or labels with offsets, categories and confidence.'],
    [5, 'Your code redacts, routes, or stores results, for example masking PII before calling [[foundry-models]].']
  ],
  gotchas: [
    '**PII detection is probabilistic.** It will miss some and flag some wrongly; use it as one layer, not as proof of anonymisation.',
    '**Per-request limits** on document size and count apply. Chunk long text and batch.',
    '**Language coverage varies by feature.** Check support for every language you serve.',
    '**Custom models need labelled data** and ongoing relabelling as language shifts.',
    'Redaction before a model call changes the text; make sure downstream logic does not depend on the removed values.'
  ],
  edges: [
    'Domain-specific PII categories (health, financial) are available through detection filters.',
    'Summarisation here is extractive or abstractive and cheaper than an LLM for simple cases.',
    'Containers are offered for some features when data cannot leave your environment.'
  ],
  ml: [
    'PII redaction in front of prompts, indexes and log pipelines.',
    'Routing and tagging of tickets and messages before an LLM sees them.',
    'High-volume classification where an LLM would be wasteful.',
    'Pre-processing for [[ai-search]] enrichment pipelines.'
  ],
  pairs: ['foundry-models', 'ai-search', 'content-safety', 'purview', 'functions'],
  cost: 'Billed per 1,000 text records analysed, by feature, with commitment tiers for volume. Cheap relative to LLM calls, so use it as a front filter.'
});

S({
  id: 'ai-speech', cat: 'aiservices', name: 'Azure AI Speech', doc: 'azure/ai-services/speech-service/',
  tag: 'Speech to text, text to speech, translation and real-time voice for assistants.',
  what: 'Azure AI Speech converts **speech to text** (real-time, batch and fast transcription, with diarisation and custom vocabulary), **text to speech** (neural voices, including custom voices under controlled access) and **speech translation**. It also powers voice interfaces for agents, including streaming interaction with low latency.\n\nPair it with a language model for a voice assistant: transcribe, reason, then synthesise. For contact-centre and meeting use cases it provides transcripts that downstream models can summarise.',
  flow: ['Audio in', 'Streaming or batch', 'Recognition', 'Transcript + timing', 'LLM step', 'Synthesised speech'],
  steps: [
    [0, 'Audio arrives from a microphone, telephony stream, or a file in [[blob]].'],
    [1, 'Real-time audio is streamed over a WebSocket; recorded audio is submitted as a **batch transcription** job.'],
    [2, 'The recogniser decodes speech, applying any custom vocabulary or model and optional diarisation.'],
    [3, 'Text, timestamps, speaker labels and confidence return incrementally or as a file.'],
    [4, 'A model in [[foundry-models]] interprets the text and drafts a reply or summary.'],
    [5, 'Text to speech turns the reply into audio, streamed back to the user.']
  ],
  gotchas: [
    '**Latency adds up.** Recognition, model, and synthesis each take time. Stream at every stage and start speaking before the full answer is ready.',
    '**Accents and noise hurt accuracy.** Test on your real audio, and consider custom speech for domain terms.',
    '**Recordings are personal data.** Decide retention and consent, and redact transcripts with [[ai-language]].',
    '**Real-time sessions have duration and concurrency limits.** Plan for reconnection.',
    '**Custom voices are restricted** and require approval and disclosure.'
  ],
  edges: [
    'Batch transcription is much cheaper per hour than real-time and fits call recordings.',
    'Diarisation separates speakers, which makes summaries of meetings and calls far more useful.',
    'Container deployment is available for some scenarios requiring local processing.'
  ],
  ml: [
    'Voice front ends for agents and kiosks.',
    'Call and meeting transcription feeding summarisation and analytics.',
    'Accessibility features: captions and read-aloud.',
    'Multilingual voice experiences using speech translation.'
  ],
  pairs: ['foundry-models', 'ai-language', 'translator', 'blob', 'foundry-agent-service'],
  cost: 'Billed per audio hour for transcription (real-time costs more than batch) and per million characters for synthesis. Custom models and neural voices have their own rates.'
});

S({
  id: 'ai-vision', cat: 'aiservices', name: 'Azure AI Vision', doc: 'azure/ai-services/computer-vision/',
  tag: 'Image analysis, OCR, captioning, and embeddings for image search.',
  what: 'Azure AI Vision analyses images: **captions and tags**, **object and people detection**, **OCR** (the Read engine), smart cropping and background removal, and **multimodal embeddings** that place images and text in the same vector space, which enables searching images with text queries and the reverse. Custom image classification and detection models are also available through Vision tooling.\n\nIf your use case is "describe this picture" or "find similar images", a vision model or a multimodal LLM may both work; the specialist service is cheaper at volume and more predictable, while an LLM is better at open-ended reasoning about an image.',
  flow: ['Image', 'Analyze call', 'Features (caption / OCR / objects)', 'JSON result', 'Embedding (optional)', 'Index or action'],
  steps: [
    [0, 'An application or pipeline supplies an image by URL or bytes.'],
    [1, 'It calls the analyze endpoint, requesting the visual features it needs.'],
    [2, 'The service runs the requested models (captioning, tagging, object detection, OCR).'],
    [3, 'Results return as JSON with labels, boxes and confidence scores.'],
    [4, 'Optionally, the **multimodal embedding** of the image is stored in a vector index in [[ai-search]].'],
    [5, 'The app uses the result: moderation, search, accessibility text or a trigger.']
  ],
  gotchas: [
    '**Face and identity features are restricted.** Some capabilities require an access application and have use limits.',
    '**Image size and format limits apply.** Resize before sending large photos.',
    '**Captions can be wrong or generic.** Do not use them as the sole source for safety or compliance decisions.',
    '**Custom models need diverse training images.** Lighting and angle changes in production break a narrow dataset.',
    '**Check which features are current.** Some older Vision capabilities have been retired or moved; confirm in the docs.'
  ],
  edges: [
    'Image embeddings enable "search by description" and "find similar" without training a model.',
    'Video-frame analysis multiplies cost; sample frames rather than processing every one.',
    'Use [[content-safety]] for harm detection in images rather than relying on tags.'
  ],
  ml: [
    'Visual search and deduplication using embeddings and [[ai-search]].',
    'Alt text and metadata generation at scale.',
    'OCR for photographed text where documents are not formal forms.',
    'Cheap pre-screening before sending an image to a multimodal LLM.'
  ],
  pairs: ['ai-search', 'content-safety', 'doc-intelligence', 'foundry-models', 'blob'],
  cost: 'Billed per 1,000 transactions by feature (analyze, OCR, embeddings), with tiers for volume. Costs rise when you request many features per image or analyse many frames.'
});

S({
  id: 'translator', cat: 'aiservices', name: 'Azure AI Translator', doc: 'azure/ai-services/translator/',
  tag: 'Neural machine translation for text and documents, with custom terminology.',
  what: 'Translator translates **text** and whole **documents** (keeping layout) between many languages using neural models, with **language detection**, transliteration and **custom glossaries** or custom translation models for domain terms. It is fast, cheap and consistent, which makes it a good building block for multilingual products.\n\nFor generative applications, translation can sit on either side of a model: translate user questions into the language your knowledge base uses, or answers back to the user. Whether to use Translator or let an LLM translate is a quality, cost and consistency trade-off to test.',
  flow: ['Source text / document', 'Detect language', 'Translate (+ glossary)', 'Target text', 'Optional LLM step', 'Deliver'],
  steps: [
    [0, 'Text or a document in [[blob]] is submitted for translation.'],
    [1, 'The language is detected, or you specify it.'],
    [2, 'The neural model translates, applying any **glossary** or custom model for terminology.'],
    [3, 'Translated text (or a translated document with layout preserved) is returned.'],
    [4, 'If needed, a model in [[foundry-models]] works in a single pivot language.'],
    [5, 'The result is shown to the user, or translated back for the reply.']
  ],
  gotchas: [
    '**Glossaries are exact-match.** They fix names and terms but do not inflect for grammar in every language.',
    '**Translating twice loses nuance.** A translate-reason-translate pipeline can degrade meaning; evaluate end to end.',
    '**Document translation limits** apply to file types and sizes; test your formats.',
    '**Billing counts characters**, including those in markup you did not mean to translate. Strip or mark non-translatable text.',
    'Some LLMs translate well enough that an extra service adds latency without benefit; test on your languages.'
  ],
  edges: [
    'Custom translators learn from parallel documents in your domain and can beat the general model on jargon.',
    'Real-time translation of speech is handled by [[ai-speech]], which uses these models.',
    'Dynamic dictionaries can force specific translations inline.'
  ],
  ml: [
    'Multilingual front ends for assistants that use an English-only knowledge base.',
    'Bulk translation of documents for indexing in several languages.',
    'Consistent terminology for regulated or branded content.',
    'Language normalisation before classification with [[ai-language]].'
  ],
  pairs: ['ai-speech', 'ai-language', 'foundry-models', 'blob', 'ai-search'],
  cost: 'Billed per million characters translated (text) or per character and page for documents, with commitment tiers. Custom models add training and hosting charges.'
});

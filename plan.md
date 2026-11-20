# Azure AI Atlas — Comprehensive Implementation Plan

> **Purpose:** Turn the existing `azure-ai-atlas` website into a dependable Azure AI Engineering Operating System (Azure AI Engineering OS) for an AI Engineering Manager. The product must support learning, architecture design, technology decisions, project assessment, implementation planning, security reviews, evaluation, production operations, cost management, and team leadership.
>
> **Execution audience:** Claude Code, Gemini CLI, or another coding agent with access to this repository.
>
> **Repository:** `https://github.com/sadiqgpasha89/azure-ai-atlas`
>
> **Important execution rule:** This is a requirements and delivery plan, not permission to assume what is already implemented. The first task is to inspect the complete repository and live application. Preserve and improve existing functionality. Do not create duplicate pages or replace working modules merely because this plan names them.

---

## Status ledger (maintained by hand; last updated 2026-11-20)

This ledger is the honest summary. The checkboxes below are ticked only where the evidence named beside them exists in the repository and was checked. Everything else is unticked, including items that are partly done. Detail and evidence: [`docs/implementation-audit.md`](docs/implementation-audit.md). Sizing and order of the remaining work: [`docs/roadmap.md`](docs/roadmap.md).

| Phase | Plan section | Status | One-line evidence or gap |
|---|---|---|---|
| 0 Audit and baseline | 2 | Partial (nearly done) | `docs/implementation-audit.md`; 9 defects found and fixed. Open: external link check, tablet width, nested tabs/accordions, accessibility scan |
| 1 Structure and navigation | 3 | Partial | Overflow fixed, role lens, sidebar; no URL-synced filters; no a11y audit |
| 2 Service catalog | 4 | Partial | 59 services, 4 verified; template lacks sources and status on 55 |
| 3 Advisor and decisions | 5 | Partial | Advisor, shaper, 23 guides, ADR copy; no requirements/assumptions capture or export |
| 4 Architectures | 6 | Partial | Of 28 required catalog items: 13 have a dedicated page, 7 exist only as patterns, 8 are missing |
| 5 RAG center | 7 | Partial | 14 patterns, calculator; no evaluation workbench; labs not run |
| 6 Agent center | 8 | Partial | 18 patterns; no decision tool; labs not run |
| 7 Data and classical ML | 9 | Partial | `#/traditional-ml` only |
| 8 Identity, network, platform | 10 | Partial | `#/foundation`, `#/gov`; unverified |
| 9 Security and governance | 11 | Partial | 12 threats, 10 gates; no threat-model tool |
| 10 Evaluation | 12 | Partial | Pyramid, metrics, gate calculator; no workbench |
| 11 Operations and SRE | 13 | Partial | 4 dashboards, 4 runbooks; KQL unverified |
| 12 FinOps | 14 | Partial | TCO and ROI rebuilt and tested; no RAG/agent cost model; prices unsourced |
| 13 CI/CD and release | 15 | Partial | Text only; no pipelines |
| 14 EM workspace | 16 | Partial | Intake, estimator, skills matrix; no command centre or portfolio tools |
| 15 Learning, labs, capstones | 17 | Partial | 3 paths, 5 labs; no capstones or assessment |
| 16 Templates and exports | 18 | Partial | Copy-to-clipboard only |
| 17 Search | 19 | Partial | Index, aliases, filters, highlights, empty state done; role/difficulty/phase filters and related links not |
| 18 Sourcing and freshness | 20 | Partial | Registry, `#/freshness`, issue template; 4 of 59 services and 3 of 17 modules carry verified scope |
| 19 Quality and testing | 21 | Partial | 36 unit tests, browser smoke over every route; no axe scan, external link check or Lighthouse |
| 20 Security hardening | 22 | Partial | CSP, no inline script, no secrets, no dependencies; headers unavailable on Pages |
| 21 Release | 23 | Partial | Deploy gated on checks and tests; `ci.yml` not yet run on GitHub |
| Final acceptance 1 to 5 | 27 | Not run | Closest content mapped in `docs/roadmap.md` |
| Completion report | 28 | Not due | A report for this pass accompanies the pull request. The final report waits for the acceptance scenarios |

The previous plan, which claimed completion of all 23 domains, is kept in [`docs/archive/plan-v1-completed.md`](docs/archive/plan-v1-completed.md). Its "completed" status was not supported by the running application (see audit section 2).



## 0. Instructions to the implementation agent

Follow this plan in order. Work directly in the existing repository. Do not stop after producing an audit or a roadmap: implement the approved work in the repository, test it, and update the project documentation.

### 0.1 Non-negotiable rules

- [ ] **Inspect before changing.** Read the README, package manifests, source tree, routing, content/data files, styles, build scripts, deployment configuration, tests, and Git history where useful. Inspect every route and interactive control in the running application.
- [ ] **Establish a baseline.** Run the current install, build, lint, type-check, and test commands before modifying anything. Record existing failures separately from regressions introduced by your changes.
- [ ] **Create an inventory.** Map every existing route/module, its content, components, data sources, interactions, external links, and current level of completion to the requirements in this plan.
- [ ] **Do not duplicate.** For each requirement, classify it as `Complete`, `Partial`, `Missing`, `Outdated`, `Broken`, or `Not applicable`. Improve the existing implementation where possible.
- [ ] **Preserve the working product.** Keep existing routes, bookmarks, useful content, theme, search behavior, deployment process, and visual identity unless there is a clear reason to change them. Maintain backward-compatible routes or redirects when routes change.
- [ ] **No fake functionality.** A button, calculator, assessment, filter, search field, export control, or navigation item must work. Do not ship inert controls, placeholder results, fabricated scores, mock integrations presented as real, or TODO-only pages.
- [ ] **No fabricated Azure facts.** Verify service names, product boundaries, SDKs, model availability, deployment options, regions, quotas, pricing, preview/GA status, and lifecycle information against current first-party Microsoft documentation. Clearly label uncertain or region-specific information.
- [ ] **Keep content and application logic separate.** Prefer structured, typed content data and reusable components over hard-coded copy embedded throughout UI components.
- [ ] **Make the site usable without external APIs.** Core knowledge, navigation, search, decision frameworks, and calculators should work statically in the browser unless a feature explicitly requires a backend. Do not add secrets or expose API keys in client code.
- [ ] **Use real examples.** Architecture patterns, runbooks, labs, decision records, and calculators must contain actionable details and explicit trade-offs.
- [ ] **Build for an engineering manager.** Each technical topic must explain when to use it, when not to use it, alternatives, risks, cost drivers, team implications, and production consequences—not only define the service.
- [ ] **Update this plan.** Mark a checkbox complete only after code/content exists and the relevant acceptance checks pass. Record exclusions, assumptions, and deferred items.
- [ ] **Do not claim completion prematurely.** A feature is complete only when its content, interaction, accessibility, responsive behavior, references, and tests are finished.

### 0.2 Required execution artifacts

Create or update these files (adapt names to the existing repository conventions):

- [x] `docs/implementation-audit.md` — existing-state inventory and gap mapping. _(evidence: docs/implementation-audit.md)_
- [x] `docs/architecture.md` — application structure, content architecture, navigation and data flow. _(evidence: docs/architecture.md)_
- [x] `docs/content-governance.md` — source policy, freshness policy, lifecycle labels and review process. _(evidence: docs/content-governance.md)_
- [x] `docs/quality-and-acceptance.md` — test strategy and release criteria. _(evidence: docs/quality-and-acceptance.md)_
- [x] `docs/roadmap.md` — implemented/deferred work and sequencing. _(evidence: docs/roadmap.md)_
- [x] `CHANGELOG.md` — user-visible changes. _(evidence: CHANGELOG.md)_
- [x] Update `README.md` with setup, scripts, architecture, content contribution, validation and deployment instructions. _(evidence: README.md)_
- [x] Keep this `plan.md` as the master checklist and update its status as work is completed. _(evidence: this file)_

### 0.3 Delivery method

Use small, reviewable increments. After each milestone:

1. Run formatting, lint, type-check, tests and production build.
2. Start the application and inspect the affected routes.
3. Test keyboard interaction and a narrow/mobile viewport.
4. Check browser console and network errors.
5. Verify internal links, official references and search indexing.
6. Update the audit and changelog.
7. Commit using a clear message if Git commit access is available. Do not push or alter remote settings unless authorized by the repository workflow.

---

# 1. Product vision, audience and success criteria

## 1.1 Product vision

Build an **Azure AI Engineering OS**: a connected platform that helps an AI Engineering Manager answer:

> Given a business problem, data, security constraints, budget, scale and timeline, what solution should we build on Azure, why is it appropriate, how should we implement and evaluate it, and how will we operate it reliably in production?

The Atlas has three connected experiences:

1. **LEARN** — Azure services, AI/ML concepts, architectures, patterns, labs and learning paths.
2. **BUILD** — architecture design, RAG, agents, implementation playbooks, evaluation and deployment.
3. **MANAGE** — project assessment, technology decisions, architecture reviews, risk, cost, team capability, portfolio and production readiness.

The product is an independent educational and engineering decision-support resource. It is not an official Microsoft product and must not imply Microsoft endorsement.

## 1.2 Primary audience

- AI Engineering Manager / AI Engineering Lead.
- Azure AI Solution Architect.
- Agentic AI / RAG technical lead.
- Senior AI/ML engineers who need production and enterprise context.

Optimize for a technically capable manager who needs both enough depth to challenge implementation details and enough synthesis to make delivery, architecture, risk and staffing decisions.

## 1.3 Product outcomes

The finished Atlas should help a user:

- [ ] Assess whether a problem needs conventional software, analytics, classical ML, GenAI, RAG, an agent, or a hybrid system.
- [ ] Select Azure services using explicit requirements and trade-offs.
- [ ] Design conceptual, logical, deployment and operational architecture views.
- [ ] Design enterprise RAG and agentic RAG, including permission-aware retrieval.
- [ ] Select a single-agent, deterministic workflow, or multi-agent pattern for a justified reason.
- [ ] Design data, identity, networking, security and governance controls.
- [ ] Define model, RAG, agent, safety, performance and business evaluation.
- [ ] Estimate cost drivers and compare viable architecture options.
- [ ] Plan implementation, CI/CD, release gates, monitoring, incident response and rollback.
- [ ] Review architecture, assess production readiness and produce reusable engineering artifacts.
- [ ] Identify team competency gaps and create a practical learning plan.

## 1.4 Product quality principles

- Decision-oriented, not merely encyclopedic.
- Azure-specific, but grounded in general software/data/AI engineering principles.
- Production-first: security, operations, evaluation and cost are part of every architecture.
- Evidence-led: official sources, visible assumptions, explicit uncertainty and freshness metadata.
- Interactive where interaction materially helps; static content remains readable and useful.
- Modular, searchable, accessible, responsive and maintainable.
- No unnecessary complexity: recommend deterministic systems when they solve the problem more safely and cheaply.

---

# 2. Phase 0 — Repository reconnaissance and baseline audit (P0, mandatory)

Do not begin large-scale feature work until the audit is complete.

## 2.1 Repository and application inspection

- [x] Inspect the full repository tree, including hidden configuration and CI files. _(evidence: audit §1)_
- [x] Identify framework, language, bundler, package manager, routing approach, state management, styling system and deployment target. _(evidence: audit §1)_
- [x] Inspect `package.json` / equivalent scripts and lockfile; use the repository's package manager. _(evidence: audit §1 (none existed))_
- [ ] Inspect public assets, icons, diagrams, content files, sample data and generated files.
- [ ] Inspect each route/module and all nested views, popovers, tabs, accordions, calculators, forms, controls and links.
- [ ] Inspect current mobile/tablet/desktop layouts and theme behavior.
- [x] Inspect search implementation, search index/data source, ranking and empty-result behavior. _(evidence: audit §2 finding 6)_
- [ ] Inspect external links and identify broken, outdated, duplicated or low-quality sources.
- [x] Inspect build, lint, type-check, tests, deployment workflow and Pages configuration. _(evidence: audit §1)_
- [ ] Check for accessibility problems, console errors, missing assets, dead routes and broken anchors.
- [x] Check for secrets, unsafe HTML rendering, unsafe dependency versions, license concerns and accidental large assets. _(evidence: audit §1)_
- [x] Inspect Git history for intended product direction and recent unfinished work where available. _(evidence: audit §1 (single prior commit))_

## 2.2 Existing feature inventory

For every module and route, record:

| Field | Required value |
|---|---|
| Route | Actual URL/hash/path |
| Module | Navigation/module name |
| Purpose | User problem it solves |
| Content depth | Outline, useful, detailed, implementation-ready |
| Azure accuracy | Verified, uncertain, outdated, incorrect |
| Interaction | None, partial, working, broken |
| References | Official, community, missing, broken |
| Searchability | Indexed or not |
| Responsive/accessibility | Pass, partial, fail |
| Tests | Existing coverage |
| Recommendation | Keep, improve, merge, split, remove |

- [x] Audit all existing modules: Advisor, Architectures, RAG Lab, Agents, Decisions, Security, Evals, Operations, FinOps, EM Workspace, Labs and Search, plus any additional modules discovered. _(evidence: audit §3)_
- [x] Identify overlap and duplicated content among modules. _(evidence: audit §3)_
- [x] Identify missing modules and capabilities from Sections 5–19 of this plan. _(evidence: audit §4, roadmap §2)_
- [x] Create a traceability matrix linking each requirement to existing route/component/content/test and status. _(evidence: audit §4 (phase level))_
- [x] Create a prioritized work breakdown based on actual gaps, not assumptions. _(evidence: roadmap §4)_

## 2.3 Baseline quality gates

- [x] Production build passes, or baseline failures are documented. _(evidence: no build step; audit §1)_
- [x] Lint and type-check pass, or baseline failures are documented. _(evidence: none existed; audit §1)_
- [x] Existing automated tests pass, or baseline failures are documented. _(evidence: check.mjs passed; audit §1)_
- [x] All current routes load without fatal errors. _(evidence: audit §2)_
- [x] No known secrets are committed. _(evidence: audit §1)_
- [x] Deployment path and rollback approach are documented. _(evidence: architecture.md, quality doc)_

**Phase 0 exit criterion:** `docs/implementation-audit.md` contains an evidence-backed inventory and a requirement-to-implementation matrix. Every requirement is classified before implementation is planned.

---

# 3. Phase 1 — Product structure, content architecture and navigation (P0)

## 3.1 Navigation and information architecture

Retain existing navigation where it works. Consolidate only when two sections have genuinely overlapping purposes.

The target information architecture should cover:

1. Command Center / EM Workspace.
2. AI Project Advisor.
3. Azure Technology Explorer / Service Catalog.
4. Architectures / System Design.
5. RAG Engineering.
6. Agent Engineering / Multi-agent Systems.
7. Data & ML Engineering.
8. Technology Decisions / ADRs.
9. Security & Governance.
10. Evaluation & Quality.
11. Operations / AI SRE.
12. FinOps.
13. Platform Engineering / DevOps / MLOps.
14. Labs / Learning Paths.
15. Templates / Playbooks / Runbooks.
16. Search.

- [ ] Map existing modules to target capabilities and preserve useful routes.
- [ ] Make navigation hierarchy understandable; avoid an overwhelming menu.
- [ ] Add contextual cross-links between related pages (e.g. architecture → decision → security → evaluation → deployment → runbook).
- [ ] Provide breadcrumbs or equivalent location context for deep pages.
- [ ] Ensure every page is reachable through navigation, search or a contextual link.
- [ ] Provide a useful home/dashboard view with clear entry points for Learn, Build and Manage.

## 3.2 Content architecture

- [ ] Define typed content models for service pages, architectures, patterns, decisions, labs, playbooks, runbooks, threats, evaluations, templates and references.
- [ ] Separate content data from display components.
- [ ] Add stable IDs/slugs and avoid fragile references based on array position.
- [ ] Support tags, categories, difficulty, role, lifecycle phase, Azure service relationships and related content.
- [ ] Provide reusable components for callouts, comparison tables, pros/cons, architecture diagrams, prerequisites, steps, checklists, citations and source metadata.
- [ ] Add content schema validation or build-time validation where practical.
- [ ] Add content lint rules for missing titles, summaries, owners, sources, freshness dates and broken internal references.

## 3.3 Visual and accessibility quality

- [ ] Preserve the existing visual identity while standardizing spacing, typography, cards, tables, diagrams, badges and responsive layouts.
- [ ] Ensure keyboard navigation, visible focus, meaningful labels, semantic headings and accessible form errors.
- [ ] Provide alt text for meaningful images and accessible descriptions for diagrams.
- [ ] Ensure color is not the only means of communicating status.
- [ ] Check contrast and text scaling.
- [ ] Ensure mobile tables and diagrams remain usable.
- [ ] Avoid unnecessary animations and respect reduced-motion preferences.
- [ ] Make loading, empty, error and success states explicit.

**Phase 1 exit criterion:** The navigation and content model are documented, consistent, accessible, responsive and maintainable, with no existing useful functionality removed.

---

# 4. Phase 2 — Azure Technology Explorer and service catalog (P0)

Build or improve a searchable Azure service catalog. The catalog must explain engineering decisions, not merely list product descriptions.

## 4.1 Service families to cover

The exact current service names, boundaries and status must be checked against Microsoft's current documentation during implementation.

### AI platform, models and agent platforms

- [ ] Microsoft Foundry and its current capabilities/terminology.
- [ ] Foundry Models / Azure OpenAI model access and deployments where applicable.
- [ ] Model catalog, model selection, model deployment and inference options.
- [ ] Managed and serverless inference options where available.
- [ ] Provisioned throughput/capacity concepts where applicable.
- [ ] Model evaluation, prompt management and fine-tuning capabilities.
- [ ] Foundry Agent Service and its current hosting/runtime boundaries.
- [ ] Microsoft Agent Framework and workflow capabilities.
- [ ] Azure Machine Learning and its role in classical ML/custom model lifecycle.
- [ ] Open model hosting and deployment trade-offs.

### Search, knowledge and retrieval

- [ ] Azure AI Search: keyword, vector, hybrid, semantic ranking, filtering, indexers and skillsets where applicable.
- [ ] Knowledge-base / Foundry IQ capabilities and their current positioning, if available.
- [ ] Cosmos DB vector capabilities.
- [ ] Azure Database for PostgreSQL vector capabilities.
- [ ] Redis/vector capabilities where relevant.
- [ ] Graph data platforms and Graph RAG options.
- [ ] Enterprise search and permission-aware retrieval patterns.

### Data, documents and analytics

- [ ] Azure Blob Storage and ADLS Gen2.
- [ ] Azure Data Factory.
- [ ] Microsoft Fabric.
- [ ] Azure Databricks.
- [ ] Azure Document Intelligence.
- [ ] Azure Content Understanding where available.
- [ ] Azure SQL Database.
- [ ] Azure Cosmos DB.
- [ ] Azure Database for PostgreSQL.
- [ ] Event Hubs, Service Bus and Event Grid.
- [ ] Data quality, lineage, cataloging, CDC and orchestration concepts.

### Application, compute and integration

- [ ] Azure Container Apps.
- [ ] Azure Kubernetes Service (AKS).
- [ ] Azure Functions.
- [ ] Azure App Service.
- [ ] API Management.
- [ ] Logic Apps.
- [ ] Container Registry and supporting platform services.
- [ ] Hosting selection and event-driven integration patterns.

### Identity, networking, security and governance

- [ ] Microsoft Entra ID.
- [ ] Managed identities and workload identity.
- [ ] Azure RBAC and resource authorization.
- [ ] Key Vault.
- [ ] Virtual Network, subnet, NSG and private endpoint concepts.
- [ ] Private DNS, Firewall, Application Gateway and WAF where relevant.
- [ ] VPN, ExpressRoute, hub-and-spoke and hybrid networking.
- [ ] Azure Policy.
- [ ] Microsoft Purview.
- [ ] Defender for Cloud and current AI security capabilities.
- [ ] Azure AI Content Safety where relevant.

### Observability and operations

- [ ] Azure Monitor.
- [ ] Application Insights.
- [ ] Log Analytics.
- [ ] OpenTelemetry integration.
- [ ] Distributed tracing and AI/agent tracing.
- [ ] Cost Management and supporting FinOps tools.

## 4.2 Standard service-page template

Every service page must include:

- [ ] Official product name and concise explanation.
- [ ] Problems it solves and business value.
- [ ] Primary capabilities and non-capabilities.
- [ ] Typical use cases and anti-patterns.
- [ ] Selection criteria and alternatives.
- [ ] Integration points and dependencies.
- [ ] Architecture diagram or clear architecture description.
- [ ] Identity, authorization, network and data-security considerations.
- [ ] Scaling, resilience, quotas and constraints where documented.
- [ ] Pricing model and cost drivers, without unsupported price claims.
- [ ] Operational monitoring and failure modes.
- [ ] SDKs, APIs, CLI, IaC and implementation references.
- [ ] Regional availability and deployment constraints when relevant.
- [ ] Lifecycle status (GA/Preview/retired/other official label) and date verified.
- [ ] Official documentation links and related Atlas pages.
- [ ] Explicit note where a capability depends on region, model, tier, subscription or configuration.

## 4.3 Service comparison and decision features

- [ ] Search/filter services by capability, workload, lifecycle phase, cost model, deployment, security and data type.
- [ ] Compare selected services side by side.
- [ ] Provide “choose when / avoid when” guidance.
- [ ] Explain boundaries between related services to prevent overlap confusion.
- [ ] Show a service relationship map (for example, application → identity → model → retrieval → data → telemetry).
- [ ] Add a freshness indicator and source links on every service record.

**Acceptance criteria:** A user can identify the appropriate service candidates for a stated requirement, see alternatives and trade-offs, and reach the authoritative Microsoft documentation. No fabricated pricing, quota, SLA, region or product lifecycle facts.

---

# 5. Phase 3 — AI Project Advisor and architecture decision engine (P0)

## 5.1 Project intake and discovery

Implement a working multi-step assessment (or equivalent progressive form) covering:

- [ ] Business problem and desired outcome.
- [ ] Users/personas and user journey.
- [ ] Current process and non-AI alternatives.
- [ ] Data sources, ownership, quality, volume, format and freshness.
- [ ] Data sensitivity, privacy, compliance and residency constraints.
- [ ] Required capability: prediction, classification, extraction, search, generation, reasoning, automation or decision support.
- [ ] Real-time, interactive, batch or asynchronous requirements.
- [ ] Accuracy, groundedness, safety and explainability needs.
- [ ] Latency, throughput, concurrency and availability requirements.
- [ ] Scale, tenancy and integration requirements.
- [ ] Budget and cost sensitivity.
- [ ] Human approval and autonomy requirements.
- [ ] Azure environment, network and deployment constraints.
- [ ] Team capability, timeline and operational ownership.

## 5.2 Recommendation logic

- [ ] Evaluate deterministic software/rules/workflow before recommending AI.
- [ ] Distinguish analytics, classical ML, GenAI, RAG, agent, multi-agent and hybrid designs.
- [ ] Recommend the least complex architecture that meets requirements.
- [ ] Explain why each candidate approach is suitable or unsuitable.
- [ ] Identify assumptions, missing information and confidence/uncertainty.
- [ ] Avoid opaque “AI suitability scores” unless the scoring dimensions and weights are visible and editable.
- [ ] Make the logic deterministic and explainable where possible; do not require a remote LLM to run the core advisor.

## 5.3 Advisor outputs

- [ ] Executive summary and problem framing.
- [ ] AI suitability and non-AI alternative assessment.
- [ ] Recommended solution type and architecture pattern.
- [ ] Alternative architectures with trade-offs.
- [ ] Azure service candidates and rationale.
- [ ] Functional and non-functional requirement checklist.
- [ ] Data readiness assessment.
- [ ] Security/privacy/identity/network risks.
- [ ] Evaluation strategy and initial metrics.
- [ ] Operational requirements and SLO candidates.
- [ ] Cost drivers and estimate inputs/assumptions.
- [ ] Complexity assessment and key dependencies.
- [ ] Suggested team roles/skills.
- [ ] Delivery phases, milestones and risks.
- [ ] Production readiness checklist.
- [ ] Exportable assessment report (Markdown/JSON/print-friendly format as appropriate).

## 5.4 Decision framework library

Create working decision guides for:

- [ ] AI vs non-AI software.
- [ ] Classical ML vs GenAI.
- [ ] RAG vs fine-tuning vs long context vs direct retrieval.
- [ ] Agent vs deterministic workflow.
- [ ] Single-agent vs multi-agent.
- [ ] Managed agent platform vs code-first/custom runtime.
- [ ] Vector vs keyword vs hybrid search.
- [ ] Azure AI Search vs vector-capable database vs graph approach.
- [ ] Graph RAG vs conventional RAG.
- [ ] Batch vs real-time vs async execution.
- [ ] Small/fast model vs larger reasoning model.
- [ ] Fixed model vs routing/fallback.
- [ ] Managed service vs self-managed infrastructure.
- [ ] Functions vs Container Apps vs App Service vs AKS.
- [ ] Fabric vs Databricks vs Data Factory-based architecture.
- [ ] SQL vs Cosmos DB vs PostgreSQL.
- [ ] Event Hubs vs Service Bus vs Event Grid.
- [ ] Private endpoint vs public access with controls.

## 5.5 ADR generator

- [ ] Provide an Architecture Decision Record template.
- [ ] Capture context, constraints, decision drivers, options, comparison, decision, consequences, risks, date, owner and references.
- [ ] Link ADRs to services, architectures, project assessments and risks.
- [ ] Support export and version/history where the current application architecture permits.

**Acceptance criteria:** An engineer can complete a project intake, receive a transparent recommendation with alternatives and assumptions, and export a usable assessment and ADR. Every recommendation must be traceable to explicit rules or evidence.

---

# 6. Phase 4 — Architecture and system-design library (P0)

## 6.1 Required architecture catalog

Audit existing content and ensure coverage for:

- [ ] Enterprise AI application / copilot.
- [ ] Basic enterprise RAG.
- [ ] Advanced RAG.
- [ ] Agentic RAG.
- [ ] Identity-aware / permission-aware RAG.
- [ ] Multi-tenant RAG.
- [ ] Graph RAG and multi-hop retrieval.
- [ ] Multimodal RAG.
- [ ] Single agent with tools.
- [ ] Supervisor-specialist agents.
- [ ] Planner-executor.
- [ ] Sequential workflow.
- [ ] Parallel workflow.
- [ ] Critic-reviewer / iterative refinement.
- [ ] Human-in-the-loop / approval-gated agent.
- [ ] Research agent.
- [ ] Secure MCP-enabled agent system.
- [ ] Intelligent document processing.
- [ ] AI-powered data analyst / text-to-SQL with controls.
- [ ] Event-driven AI processing.
- [ ] Batch AI processing.
- [ ] Real-time inference.
- [ ] Traditional ML prediction and serving.
- [ ] Multimodal/voice AI where relevant.
- [ ] AI gateway/model routing.
- [ ] Private enterprise AI deployment.
- [ ] Multi-region / disaster recovery design.
- [ ] Multi-tenant AI SaaS.

## 6.2 Four views for every substantial architecture

- [ ] **Conceptual view:** business problem, actors, capabilities and outcomes.
- [ ] **Logical view:** components, responsibilities, interfaces, data flow and trust boundaries.
- [ ] **Deployment view:** Azure resources, subscriptions/resource groups, identity, networking, regions and deployment boundaries.
- [ ] **Operational view:** telemetry, SLOs, resilience, scaling, backup/recovery, incident handling and cost controls.

## 6.3 Standard architecture content

Each architecture must include:

- [ ] Problem statement, scope and assumptions.
- [ ] When to use and when not to use.
- [ ] Functional and non-functional requirements.
- [ ] Diagram(s), with accessible text explanation.
- [ ] Component responsibility and data flow.
- [ ] Azure service rationale and alternatives.
- [ ] Identity, security, privacy and network design.
- [ ] Failure modes and resilience.
- [ ] Scale/capacity considerations.
- [ ] Evaluation and acceptance strategy.
- [ ] Deployment/CI-CD/IaC approach.
- [ ] Monitoring, SLOs and runbooks.
- [ ] Cost drivers and optimization levers.
- [ ] Trade-offs and anti-patterns.
- [ ] Implementation playbook and checklist.
- [ ] Official references and related Atlas content.

## 6.4 System design scenarios

- [ ] Design for small pilot vs enterprise scale.
- [ ] Design for thousands/millions of documents.
- [ ] Low-latency interactive assistant vs asynchronous research agent.
- [ ] Shared vs isolated tenant data.
- [ ] Public vs private network access.
- [ ] Single-region vs multi-region and recovery.
- [ ] Model/service outage and fallback.
- [ ] High concurrency, throttling and backpressure.
- [ ] Agent state persistence and resumability.
- [ ] Data freshness and reindexing.
- [ ] Cost-constrained vs quality-constrained design.

**Acceptance criteria:** An architecture page is implementation-oriented, contains the four relevant views, explains trade-offs, and links to a build guide, evaluation strategy, security guidance and operations runbook.

---

# 7. Phase 5 — RAG Engineering Center (P0)

Treat RAG as a full engineering domain, not a single tutorial.

## 7.1 RAG fundamentals

- [ ] Embeddings, dimensions, similarity and distance metrics.
- [ ] Document and data ingestion.
- [ ] Parsing, OCR, layout and table extraction.
- [ ] Chunking: fixed, recursive, semantic, hierarchical, parent-child and structure-aware.
- [ ] Metadata design and normalization.
- [ ] Embedding model selection, batching, updates and cost.
- [ ] Index schema and vector index design.
- [ ] Keyword search, vector search and hybrid search.
- [ ] Filters and authorization filters.
- [ ] Ranking, semantic ranking and reranking.
- [ ] Query rewriting, expansion, decomposition and multi-query.
- [ ] Context selection, ordering, compression and token budgeting.
- [ ] Grounded generation, citations, abstention and answer validation.
- [ ] Index update, deletion, freshness and data lineage.

## 7.2 Advanced RAG patterns

- [ ] Naive/basic RAG.
- [ ] Advanced RAG.
- [ ] Hybrid RAG.
- [ ] Adaptive RAG.
- [ ] Corrective RAG and retrieval validation.
- [ ] Self-reflective retrieval approaches where suitable.
- [ ] Agentic RAG.
- [ ] Graph RAG.
- [ ] Multi-hop RAG.
- [ ] Multi-query RAG.
- [ ] Parent-child and hierarchical retrieval.
- [ ] Contextual retrieval/enrichment.
- [ ] Metadata-aware retrieval.
- [ ] Multimodal RAG.
- [ ] SQL/structured-data retrieval.
- [ ] Federated/multi-source retrieval.
- [ ] Long-context vs RAG decision guidance.

## 7.3 Azure implementation depth

- [ ] Azure AI Search ingestion/indexing/search architecture.
- [ ] Vector and hybrid index design.
- [ ] Semantic ranking and query configuration where supported.
- [ ] Document Intelligence / Content Understanding integration where appropriate.
- [ ] Blob/ADLS ingestion and change processing.
- [ ] Identity-aware retrieval and document-level access.
- [ ] Multi-tenant filtering and isolation.
- [ ] Application-level API and model integration.
- [ ] Private access, managed identity and network considerations.
- [ ] Deployment, reindexing, rollback and cost monitoring.

## 7.4 RAG evaluation workbench

- [ ] Dataset management with query, expected answer, relevant evidence and expected behavior.
- [ ] Retrieval precision/recall and ranking quality.
- [ ] Context relevance and coverage.
- [ ] Groundedness/faithfulness.
- [ ] Answer correctness and completeness.
- [ ] Citation correctness and evidence coverage.
- [ ] Abstention behavior for insufficient evidence.
- [ ] Safety, prompt injection and data leakage tests.
- [ ] Latency, token use and cost per query.
- [ ] Baseline vs candidate comparison.
- [ ] Regression history and configurable release gates.
- [ ] Human evaluation and adjudication guidance.

Use official Azure evaluation tooling where appropriate, but document tool/version prerequisites and keep metric interpretation clear. Do not equate an LLM-judge score with objective truth.

## 7.5 Mandatory RAG labs

- [ ] Build basic RAG.
- [ ] Build Azure AI Search RAG.
- [ ] Compare keyword/vector/hybrid retrieval.
- [ ] Build structure-aware document ingestion.
- [ ] Tune chunking and metadata.
- [ ] Implement filters and permission-aware retrieval.
- [ ] Add semantic ranking/reranking.
- [ ] Add query rewriting and decomposition.
- [ ] Implement parent-child/hierarchical retrieval.
- [ ] Implement citations and abstention.
- [ ] Build RAG evaluation pipeline.
- [ ] Build Graph RAG or document relationship retrieval.
- [ ] Build agentic RAG.
- [ ] Load-test and optimize cost/latency.
- [ ] Deploy and operate a production-style RAG application.

**Acceptance criteria:** The Atlas explains not only how to build RAG but how to benchmark, secure, troubleshoot, scale and economically operate it. At least one end-to-end Azure RAG lab is runnable and has evaluation evidence.

---

# 8. Phase 6 — Agent and multi-agent engineering center (P0)

## 8.1 Agent foundations

- [ ] Agent vs chatbot vs workflow vs automation definitions.
- [ ] Model, instructions, tools, state, memory and runtime.
- [ ] Function/tool calling and schema validation.
- [ ] Planning, task decomposition and replanning.
- [ ] Context engineering and token/context budgets.
- [ ] Short-term and long-term memory trade-offs.
- [ ] State persistence, threads and resumability.
- [ ] Tool authorization, allowlists, output validation and sandboxing.
- [ ] Human approval, escalation and autonomy boundaries.
- [ ] Error handling, retry budgets and loop prevention.

## 8.2 Orchestration patterns

- [ ] Single agent with tools.
- [ ] Deterministic workflow with model steps.
- [ ] Sequential agents.
- [ ] Parallel agents.
- [ ] Supervisor-specialist / orchestrator-worker.
- [ ] Planner-executor.
- [ ] Handoffs and routing.
- [ ] Critic-reviewer / iterative refinement.
- [ ] Collaborative/group agents where justified.
- [ ] Human-in-the-loop / approval-gated actions.
- [ ] Long-running/durable workflows.
- [ ] Hybrid deterministic + agentic systems.

For every pattern explain: best-fit problem, decision drivers, execution flow, benefits, complexity, failure modes, cost/latency implications and alternatives.

## 8.3 Multi-agent decision framework

- [ ] Explain why multi-agent must not be the default.
- [ ] Compare deterministic workflow, single agent and multi-agent approaches.
- [ ] Include coordination overhead, model calls, token spend, latency, state, debugging and attack surface.
- [ ] Explain when parallelism helps and when sequential dependencies dominate.
- [ ] Explain when specialist agents add measurable value.
- [ ] Include a “simplest viable design” recommendation.
- [ ] Provide a comparison worksheet with editable project requirements.

## 8.4 Agent frameworks and Azure runtime comparison

- [ ] Cover current Microsoft Agent Framework capabilities and supported workflow concepts.
- [ ] Cover Foundry Agent Service capabilities, constraints and managed-runtime trade-offs.
- [ ] Explain Azure hosting choices for custom agents: Container Apps, Functions, App Service and AKS.
- [ ] Document existing Semantic Kernel and AutoGen projects as relevant to maintenance/migration, with accurate lifecycle positioning and no unsupported claims.
- [ ] Compare external frameworks such as LangGraph only where relevant to a real decision; avoid vendor/framework fan pages.
- [ ] Separate framework, orchestration library, runtime/hosting platform and model platform concepts.
- [ ] Keep version-specific guidance dated and source-linked.

## 8.5 MCP engineering

- [ ] MCP architecture: host, client, server, tools, resources and prompts where supported by the current specification.
- [ ] Authentication and authorization.
- [ ] Trust boundaries and server provenance.
- [ ] Tool discovery and permission control.
- [ ] Input/output validation.
- [ ] Secret handling.
- [ ] Network restrictions and egress.
- [ ] Audit, telemetry and incident response.
- [ ] Malicious/compromised server and tool-output threat scenarios.
- [ ] Versioning and compatibility.

## 8.6 Agent evaluation and observability

- [ ] Task success/completion.
- [ ] Plan quality and step efficiency.
- [ ] Tool selection and argument accuracy.
- [ ] Tool execution success.
- [ ] Handoff/routing accuracy.
- [ ] Escalation correctness.
- [ ] Loop/repeated-action detection.
- [ ] Safety and policy adherence.
- [ ] Agent latency and cost per task.
- [ ] Trace of model calls, tool calls, state transitions and decisions.
- [ ] Offline evaluation, regression testing and production monitoring.
- [ ] Human review for consequential tasks.

## 8.7 Mandatory agent labs

- [ ] Basic tool-calling agent.
- [ ] Agent with Azure AI Search.
- [ ] Agent with multiple tools and validated schemas.
- [ ] Stateful agent with persistence.
- [ ] Planner-executor.
- [ ] Supervisor-specialist.
- [ ] Sequential and parallel orchestration.
- [ ] Research agent.
- [ ] Critic-reviewer.
- [ ] MCP-enabled agent.
- [ ] Approval-gated agent.
- [ ] Agentic RAG / multi-agent RAG.
- [ ] Evaluation and tracing.
- [ ] Secure deployment with least privilege.
- [ ] Failure recovery and production simulation.

**Acceptance criteria:** The agent center enables defensible architecture selection, runnable learning paths, secure tool use, observable workflows and evaluation beyond “the agent returned an answer.”

---

# 9. Phase 7 — Data Engineering, Knowledge Engineering and Classical ML/MLOps (P0/P1)

## 9.1 AI data engineering

- [ ] Batch, streaming, CDC and API ingestion.
- [ ] ETL/ELT and transformation.
- [ ] Data quality, validation and schema evolution.
- [ ] Lake, warehouse and lakehouse architecture.
- [ ] Data catalog, lineage, ownership and freshness.
- [ ] Structured, semi-structured and unstructured data.
- [ ] Document parsing and metadata enrichment.
- [ ] Entity extraction, relationships and knowledge graphs.
- [ ] Data access control and tenant isolation.
- [ ] Reindexing, deletion, retention and change capture.
- [ ] Data observability and pipeline incident handling.
- [ ] Compare Fabric, Databricks, Data Factory, ADLS and event services using workload criteria.

## 9.2 Classical ML foundations

- [ ] Regression, classification, clustering and forecasting.
- [ ] Anomaly detection and recommendation/ranking basics.
- [ ] Feature engineering and feature management concepts.
- [ ] Training/validation/test splits, leakage and imbalance.
- [ ] Metrics and error analysis.
- [ ] CPU/GPU and distributed training selection.
- [ ] Explainability, fairness and Responsible AI.
- [ ] Batch and online inference.

## 9.3 Azure ML/MLOps lifecycle

- [ ] Data and feature preparation.
- [ ] Experiment tracking.
- [ ] Reproducible training.
- [ ] Model registry and versioning.
- [ ] Evaluation and approval.
- [ ] Batch/online deployments.
- [ ] CI/CD and infrastructure automation.
- [ ] Drift/performance monitoring.
- [ ] Retraining and rollback.
- [ ] Model governance and auditability.
- [ ] Compare Azure Machine Learning with suitable platform alternatives without overstating capabilities.

## 9.4 Decision guides

- [ ] Classical ML vs LLM/GenAI.
- [ ] Azure ML vs Foundry model usage.
- [ ] Fabric vs Databricks vs Data Factory.
- [ ] ADLS vs Blob Storage.
- [ ] SQL vs Cosmos DB vs PostgreSQL.
- [ ] Vector search vs graph vs relational retrieval.
- [ ] Batch vs streaming.
- [ ] Event Hubs vs Service Bus vs Event Grid.

**Acceptance criteria:** The Atlas avoids GenAI-only thinking and supports data and ML architecture reviews as well as RAG/agent systems.

---

# 10. Phase 8 — Identity, networking, platform engineering and secure deployment (P0)

## 10.1 Identity and access

- [ ] Entra ID, OAuth 2.0 and OpenID Connect concepts.
- [ ] Managed identities, service principals and workload identity.
- [ ] RBAC and least privilege.
- [ ] User-delegated vs application permissions.
- [ ] Identity propagation from user → app → agent → tool → data source.
- [ ] Token acquisition, audience/scope and token lifecycle concepts.
- [ ] Agent identity and per-tool authorization.
- [ ] Secret management and rotation.
- [ ] Audit and access review.

## 10.2 Networking and private platform architecture

- [ ] VNet, subnet, NSG and routing basics.
- [ ] Private endpoints and Private DNS.
- [ ] VNet integration and service access patterns.
- [ ] Hub-and-spoke, peering and hybrid connectivity.
- [ ] Firewall, WAF, Application Gateway and controlled egress.
- [ ] VPN and ExpressRoute use cases.
- [ ] DNS, name resolution and common failure scenarios.
- [ ] Multi-region and disaster-recovery network considerations.
- [ ] Private access to model, search, data and application services where supported.

## 10.3 Platform engineering

- [ ] Azure landing-zone concepts and subscription/resource organization.
- [ ] Management groups, policy and environment separation.
- [ ] Terraform and Bicep examples or templates.
- [ ] Azure Developer CLI where appropriate.
- [ ] Container build and registry workflow.
- [ ] Container Apps, AKS, Functions and App Service hosting decisions.
- [ ] Reusable deployment templates and golden paths.
- [ ] Configuration, secrets and environment management.

## 10.4 AI-specific security architecture questions

- [ ] How does each component authenticate to the model, search, data and tools?
- [ ] Does user authorization survive retrieval and tool execution?
- [ ] Are retrieval filters enforceable server-side?
- [ ] Can an agent access unnecessary services or public endpoints?
- [ ] What is the blast radius of a compromised prompt, tool, server or agent identity?
- [ ] Are tool inputs and outputs validated?
- [ ] Is sensitive content logged or included in traces?
- [ ] Are network egress and data exfiltration controlled?
- [ ] Are tenant boundaries tested?

**Acceptance criteria:** Every major architecture has identity, authorization and network trust boundaries, and secure deployment guidance is actionable rather than generic.

---

# 11. Phase 9 — Security, governance and Responsible AI (P0)

## 11.1 AI threat library

Create a threat catalogue with attack vector, affected asset, preconditions, impact, likelihood/severity rationale, mitigations, detection, response and references.

- [ ] Direct prompt injection.
- [ ] Indirect prompt injection through retrieved documents/web/tool output.
- [ ] Jailbreak and policy evasion.
- [ ] Sensitive data disclosure and memorization risks.
- [ ] Retrieval/knowledge-base poisoning.
- [ ] Data poisoning and ingestion abuse.
- [ ] Insecure tool execution.
- [ ] Excessive agent permissions and excessive agency.
- [ ] Unauthorized consequential actions.
- [ ] Cross-tenant data leakage.
- [ ] MCP/server/tool compromise and malicious tool output.
- [ ] Insecure output handling.
- [ ] Supply-chain and dependency risks.
- [ ] Denial of service, resource exhaustion and agent loops.
- [ ] Cost abuse and quota exhaustion.
- [ ] Model misuse and unsafe content.

## 11.2 Security controls and patterns

- [ ] Identity and least privilege.
- [ ] Managed identities and secret management.
- [ ] Network isolation and egress restrictions.
- [ ] Data classification, encryption, retention and deletion.
- [ ] Permission-aware retrieval.
- [ ] Tool allowlists and schema validation.
- [ ] Sandbox/isolation for code execution.
- [ ] Human approval for sensitive actions.
- [ ] Content safety and policy enforcement.
- [ ] Prompt-injection resilience and untrusted-content handling.
- [ ] Output validation and safe rendering.
- [ ] Audit logs and privacy-aware tracing.
- [ ] Multi-tenant isolation.
- [ ] Abuse detection and rate/cost limits.
- [ ] Incident response and threat reassessment.

## 11.3 Governance system

- [ ] AI use-case risk classification.
- [ ] Data ownership, privacy and data governance.
- [ ] Model approval, version and usage governance.
- [ ] Prompt and evaluation dataset versioning.
- [ ] Agent autonomy and tool permission governance.
- [ ] MCP/server trust and approval policy.
- [ ] Human oversight and escalation rules.
- [ ] Logging, audit and traceability.
- [ ] Third-party model/vendor risk.
- [ ] Regulatory mapping only where verified and jurisdiction-specific.
- [ ] Release and periodic review gates.
- [ ] Responsible AI topics: fairness, reliability/safety, privacy/security, inclusiveness, transparency and accountability as applicable.

## 11.4 Reusable AI threat model/review tool

- [ ] Collect application type, data, users, tools, identity, network, autonomy and consequence level.
- [ ] Generate relevant threat prompts from a transparent rule set.
- [ ] Allow the reviewer to mark status, evidence, owner and residual risk.
- [ ] Export a threat model and risk register.
- [ ] Keep guidance educational; do not represent it as formal legal or compliance certification.

**Acceptance criteria:** Security reviews consider model, data, retrieval, identity, agent, tool, network, tenancy, deployment and operations—not just prompt filtering.

---

# 12. Phase 10 — Evaluation and AI quality engineering (P0)

## 12.1 Evaluation dimensions

- [ ] Factual correctness and task correctness.
- [ ] Relevance, completeness and usefulness.
- [ ] Groundedness/faithfulness and citation quality.
- [ ] Retrieval precision/recall and context coverage.
- [ ] Tool selection and argument accuracy.
- [ ] Agent task success and completion.
- [ ] Safety, privacy and policy compliance.
- [ ] Robustness and adversarial resistance.
- [ ] Latency, throughput and concurrency.
- [ ] Cost per request/task.
- [ ] User/business outcome measures.

## 12.2 Evaluation types and workflows

- [ ] Unit/component tests.
- [ ] Integration and end-to-end tests.
- [ ] Prompt tests and prompt regression.
- [ ] Model comparison on fixed datasets.
- [ ] RAG evaluation.
- [ ] Agent/workflow evaluation.
- [ ] Safety and red-team evaluation.
- [ ] Human evaluation and adjudication.
- [ ] Load/performance tests.
- [ ] Production monitoring and feedback loop.

## 12.3 Evaluation workbench

- [ ] Create/import datasets.
- [ ] Define expected outcomes and evaluation criteria.
- [ ] Execute or record evaluation runs where feasible within a static application.
- [ ] Compare versions/models/configurations.
- [ ] Show metric definitions and limitations.
- [ ] Inspect failure examples.
- [ ] Configure project-specific release gates.
- [ ] Export an evaluation report.
- [ ] Explain how to integrate evaluations into CI/CD.

A static site may provide templates, examples and client-side scorecards, but must not claim to execute Azure model evaluations unless a real safe backend/API integration exists.

## 12.4 Evaluation dataset design

- [ ] Realistic user queries and representative tasks.
- [ ] Ground truth and evidence/source documents.
- [ ] Negative and abstention cases.
- [ ] Edge cases and ambiguous inputs.
- [ ] Prompt injection and adversarial cases.
- [ ] Permission and tenant-isolation cases.
- [ ] Tool failure, timeout and retry cases.
- [ ] Regression set and dataset versioning.
- [ ] Avoid leakage between tuning and final test sets.

**Acceptance criteria:** A user can define what “good” means, measure it, understand failures and make quality part of release approval.

---

# 13. Phase 11 — Operations, reliability and AI SRE (P0)

## 13.1 Observability model

- [ ] Application logs, metrics and distributed traces.
- [ ] Model: input/output tokens, latency, throttling, errors and deployment-level health.
- [ ] RAG: ingestion status, index freshness, retrieval quality, empty results, search latency and grounding.
- [ ] Agent: runs, steps, plans, tool calls, handoffs, state transitions, loops, escalations and task success.
- [ ] Infrastructure: CPU, memory, network, replicas, queue depth and autoscaling.
- [ ] Business: completed tasks, user adoption, time saved, outcome quality and cost per outcome.
- [ ] Privacy-aware logging and redaction of sensitive data.
- [ ] Correlation IDs across app, model, retrieval and tools.

## 13.2 Reliability patterns

- [ ] Timeouts and cancellation.
- [ ] Retry with bounded exponential backoff and jitter.
- [ ] Circuit breaker.
- [ ] Bulkhead and concurrency limits.
- [ ] Rate limiting and quota handling.
- [ ] Model fallback/routing with quality implications.
- [ ] Graceful degradation and abstention.
- [ ] Caching with freshness and authorization considerations.
- [ ] Queue-based/asynchronous processing.
- [ ] Idempotency and deduplication.
- [ ] Dead-letter queue.
- [ ] Durable state, checkpointing and recovery.
- [ ] Human escalation for unresolved or high-impact tasks.
- [ ] Backup, restore and disaster recovery.

## 13.3 SLO and service health framework

Provide guidance for workload-specific objectives covering:

- [ ] Availability.
- [ ] P50/P95/P99 latency.
- [ ] Task success and completion.
- [ ] Retrieval quality and freshness.
- [ ] Tool execution reliability.
- [ ] Error and throttling rates.
- [ ] Safety incidents.
- [ ] Cost per request/task.

Do not impose arbitrary universal targets. Explain how to select objectives from user and business requirements.

## 13.4 Runbook library

Create actionable runbooks for:

- [ ] Model throttling/quota exhaustion.
- [ ] High model latency.
- [ ] Model deployment unavailable.
- [ ] RAG poor answers/grounding regression.
- [ ] Empty retrieval results.
- [ ] Search/index degradation.
- [ ] Ingestion/parsing/indexing failure.
- [ ] Stale knowledge base.
- [ ] Agent loop or runaway execution.
- [ ] Wrong tool selection or failed tool execution.
- [ ] MCP server/authentication/protocol failure.
- [ ] Agent state/memory persistence failure.
- [ ] High token usage or cost spike.
- [ ] Identity/RBAC/private DNS/network failure.
- [ ] Deployment/configuration failure.
- [ ] Security incident/data exposure.

Each runbook must include symptom, impact, quick checks, diagnostic queries/telemetry, root causes, mitigations, recovery, escalation, rollback and prevention.

**Acceptance criteria:** A team member can use a runbook to diagnose a realistic issue, identify relevant telemetry and execute safe recovery steps.

---

# 14. Phase 12 — AI FinOps and capacity planning (P0)

## 14.1 Cost model coverage

- [ ] Model input and output usage.
- [ ] Embedding generation and refresh.
- [ ] Search/index resources and queries.
- [ ] Agent iterations, tool calls and multi-agent coordination.
- [ ] Compute and hosting.
- [ ] Storage and data processing.
- [ ] Logging, telemetry and retention.
- [ ] Networking and supporting services.
- [ ] Capacity, region, availability and environment duplication effects.

## 14.2 Interactive calculators

- [ ] LLM token estimator.
- [ ] Embedding/document ingestion estimator.
- [ ] RAG cost estimator.
- [ ] Single-agent cost estimator.
- [ ] Multi-agent cost estimator.
- [ ] Search/storage/compute cost input worksheet.
- [ ] Cost per task/request calculator.
- [ ] Monthly and volume-growth projection.
- [ ] Architecture comparison calculator: simple RAG vs agentic RAG vs multi-agent, with editable assumptions.
- [ ] Capacity/concurrency worksheet.

All calculators must:

- [ ] Display formulas, units, assumptions and caveats.
- [ ] Separate user-entered values from sourced pricing values.
- [ ] Avoid hard-coded prices unless dated and sourced.
- [ ] Allow manual price overrides when live pricing is unavailable.
- [ ] Clearly state that estimates are not Azure quotes.
- [ ] Provide export/reset behavior and tests for representative calculations.

## 14.3 Optimization playbooks

- [ ] Model selection and routing.
- [ ] Context/token budget management.
- [ ] Prompt compression.
- [ ] Caching and semantic caching caveats.
- [ ] Retrieval top-k/reranking optimization.
- [ ] Embedding strategy and incremental updates.
- [ ] Batch vs real-time.
- [ ] Concurrency/parallelism trade-offs.
- [ ] Reduce unnecessary agent steps and agents.
- [ ] Capacity planning and autoscaling.
- [ ] Logging/retention cost controls.

**Acceptance criteria:** A user can model a workload using explicit inputs and compare architecture alternatives without being misled by stale or fabricated prices.

---

# 15. Phase 13 — DevOps, CI/CD, MLOps and release engineering (P1)

## 15.1 Engineering lifecycle

- [ ] Git branching/review and code ownership guidance.
- [ ] Unit, integration, contract and end-to-end testing.
- [ ] Data and schema validation.
- [ ] Prompt, model configuration and evaluation dataset versioning.
- [ ] Evaluation and safety gates in CI.
- [ ] Dependency, container and IaC scanning.
- [ ] Infrastructure as Code with Terraform and/or Bicep examples.
- [ ] GitHub Actions or Azure DevOps pipeline examples as appropriate.
- [ ] Environment and secret management.
- [ ] Containerization and deployment.
- [ ] Canary/blue-green/rolling release options.
- [ ] Feature flags and controlled rollout.
- [ ] Rollback and model/prompt/index version rollback.
- [ ] Post-deployment smoke tests and monitoring.

## 15.2 AI-specific release gates

- [ ] Quality regression threshold.
- [ ] Retrieval quality threshold.
- [ ] Agent task/tool success threshold.
- [ ] Security/safety test pass.
- [ ] Latency and throughput compliance.
- [ ] Cost budget compliance.
- [ ] Required approval and audit evidence.
- [ ] Backward compatibility and rollback plan.

## 15.3 Playbooks and example pipelines

- [ ] Build/test/deploy a RAG app.
- [ ] Deploy an agent service.
- [ ] Run evaluations before release.
- [ ] Deploy an index/data pipeline.
- [ ] Provision infrastructure securely.
- [ ] Promote dev → test → staging → production.
- [ ] Roll back application, prompt/model config and retrieval index safely.

**Acceptance criteria:** The Atlas demonstrates an AI-aware release lifecycle rather than a generic application-only CI/CD pipeline.

---

# 16. Phase 14 — Engineering Manager Workspace (P0)

This is a core differentiator. It must turn engineering knowledge into reusable management artifacts.

## 16.1 Command Center

Provide a coherent workspace with navigation/tiles for:

- [ ] AI Project Assessment.
- [ ] Architecture Advisor and Review.
- [ ] Technology Decisions / ADRs.
- [ ] Security and Risk.
- [ ] Quality / Evaluation.
- [ ] Cost / FinOps.
- [ ] Production Readiness / Operations.
- [ ] Team Capability.
- [ ] Portfolio and Roadmap.

If the site is purely static, present these as local tools/templates and do not claim cross-device persistence or team collaboration unless implemented. Use browser storage only with clear privacy behavior and safe defaults; do not store sensitive project data without an explicit design.

## 16.2 Management tools

- [ ] AI project intake and suitability assessment.
- [ ] Project complexity estimator.
- [ ] Architecture review checklist and report.
- [ ] Technical decision record.
- [ ] AI risk assessment and risk register.
- [ ] Production readiness assessment.
- [ ] AI cost and ROI worksheet.
- [ ] Delivery phase and dependency planner.
- [ ] Project health review template.
- [ ] AI technical debt tracker template.
- [ ] Portfolio prioritization worksheet.
- [ ] Technology roadmap template.
- [ ] Team competency matrix.
- [ ] Team learning/development plan.
- [ ] AI maturity assessment.
- [ ] Stakeholder/leadership summary generator.

## 16.3 Team competency model

Cover these capabilities with levels, expectations and evidence:

- [ ] Python, API and software engineering.
- [ ] Azure fundamentals and architecture.
- [ ] Data engineering.
- [ ] Classical ML and MLOps.
- [ ] LLM/model engineering.
- [ ] RAG engineering.
- [ ] Agent and multi-agent engineering.
- [ ] MCP and tool integration.
- [ ] Security and governance.
- [ ] Evaluation and quality.
- [ ] DevOps/platform engineering.
- [ ] Observability/SRE.
- [ ] FinOps.
- [ ] System design and technical leadership.

For each skill define observable behaviors/evidence for Beginner, Intermediate, Advanced and Expert. Avoid scoring based only on self-rating.

## 16.4 Portfolio prioritization

- [ ] Score business value, strategic fit, data readiness, feasibility, risk, complexity, cost, time-to-value, reusability and team readiness.
- [ ] Make weights editable and explain the calculation.
- [ ] Show trade-offs and confidence, not only a single rank.
- [ ] Export a portfolio view and assumptions.

**Acceptance criteria:** The workspace supports project intake, review, prioritization and team development with usable outputs. It must clearly distinguish educational estimates from formal enterprise records.

---

# 17. Phase 15 — Learning paths, labs, capstones and assessments (P1)

## 17.1 Learning paths

Create or improve five connected paths:

- [ ] Azure AI Architect.
- [ ] Azure RAG Engineer.
- [ ] Azure Agentic AI Engineer.
- [ ] Azure AI Engineering Manager.
- [ ] AI Production / Platform Engineer.

Each path must define objectives, prerequisites, ordered topics, labs, expected artifacts, assessment criteria and a capstone.

## 17.2 Lab format

Every lab must provide:

- [ ] Objective and measurable learning outcome.
- [ ] Difficulty and estimated effort (clearly identified as an estimate).
- [ ] Prerequisites and required skills.
- [ ] Azure resources and permissions required.
- [ ] Architecture diagram and explanation.
- [ ] Repository/code/config references that are real and accessible.
- [ ] Step-by-step instructions.
- [ ] Expected output and verification commands.
- [ ] Tests/evaluation and success criteria.
- [ ] Security considerations and cost drivers.
- [ ] Cleanup/teardown instructions.
- [ ] Troubleshooting.
- [ ] Challenge extension and reflection questions.
- [ ] Last verified date and source links.

Do not provide credentials, API keys or instructions to commit secrets. Use environment variables, managed identity or secure secret stores as appropriate.

## 17.3 Capstone projects

- [ ] Enterprise knowledge assistant with identity-aware retrieval.
- [ ] Advanced RAG with benchmark comparison.
- [ ] Agentic RAG with bounded tool execution.
- [ ] Multi-agent research workflow with evaluation and tracing.
- [ ] Secure MCP-based enterprise agent.
- [ ] Intelligent document processing pipeline.
- [ ] AI data analyst with safe query constraints.
- [ ] Production AI application with CI/CD and observability.
- [ ] Classical ML deployment and monitoring.
- [ ] Enterprise Azure AI landing architecture.

## 17.4 Learning assessment

- [ ] Knowledge checks for key topics.
- [ ] Scenario-based architecture questions.
- [ ] Hands-on evidence/checkpoints.
- [ ] Capstone rubric.
- [ ] Progression criteria tied to demonstrated skill.

**Acceptance criteria:** The Labs section guides a user from fundamentals to production-grade implementation, with testable outcomes and safe teardown instructions.

---

# 18. Phase 16 — Templates, playbooks and reusable engineering artifacts (P1)

Create a searchable template library with copy/export support where practical.

- [ ] AI project brief/intake.
- [ ] AI suitability assessment.
- [ ] Solution Design Document (SDD).
- [ ] Architecture Decision Record (ADR).
- [ ] Threat model.
- [ ] Risk register.
- [ ] RAG design checklist.
- [ ] Agent design checklist.
- [ ] MCP security review.
- [ ] RAG evaluation report.
- [ ] Agent evaluation report.
- [ ] Architecture review report.
- [ ] Production readiness checklist.
- [ ] SLO definition worksheet.
- [ ] Incident runbook template.
- [ ] FinOps estimate worksheet.
- [ ] ROI/business value worksheet.
- [ ] Project roadmap.
- [ ] Team competency matrix.
- [ ] Post-incident review.

Each artifact must contain a short purpose statement, instructions, fields, example entries, owner/reviewer fields where relevant and export/copy behavior.

---

# 19. Phase 17 — Search, discovery and cross-linking (P0)

- [x] Index all substantive content, including services, architectures, decisions, labs, runbooks, threats, evaluations and templates. _(evidence: assets/search.js; tests/search.test.mjs)_
- [ ] Search title, summary, body, tags, Azure services, workload and lifecycle phase.
- [ ] Support filters for category, role, difficulty, phase and service.
- [x] Provide useful ranking and highlighted matches if supported. _(evidence: search.js query(); app.js mark())_
- [x] Provide a clear empty state and spelling/alternate-term guidance. _(evidence: app.js paint(); smoke)_
- [x] Include aliases and acronyms (e.g. RAG, retrieval augmented generation, identity-aware retrieval). _(evidence: search.js ALIASES; tests)_
- [ ] Provide related-content links.
- [ ] Keep the index synchronized with content and validate missing entries at build time.
- [x] Ensure search works on mobile and with keyboard navigation. _(evidence: smoke (375 px; keys))_
- [ ] Do not return stale or retired recommendations without lifecycle labels.

**Acceptance criteria:** A user can find a topic regardless of whether they search by service name, technical concept, decision question or engineering task.

---

# 20. Phase 18 — Content sourcing, accuracy and maintenance policy (P0)

Azure AI services and product terminology evolve quickly. This is a first-class requirement.

## 20.1 Source hierarchy

Prefer, in order:

1. Microsoft Learn product/service documentation.
2. Azure Architecture Center and Azure Well-Architected Framework.
3. Official Microsoft GitHub samples and repositories.
4. Official Azure pricing, SLA, quota, region and lifecycle pages.
5. Microsoft engineering announcements/blogs for roadmap context, clearly labeled as announcements.
6. High-quality community resources only for supplementary implementation insight, never as the sole authority for critical platform claims.

## 20.2 Content metadata

Every service, architecture and time-sensitive decision record must include as applicable:

- [ ] `lastVerified` date.
- [ ] `sources` list with exact URLs and descriptive titles.
- [ ] `status` / lifecycle label when officially available.
- [ ] `version` / SDK version where relevant.
- [ ] `regionOrTierNotes` where applicable.
- [ ] `assumptions` and `knownLimitations`.
- [ ] `owner` or content maintainer if the repo uses ownership metadata.

## 20.3 Accuracy controls

- [x] Never hard-code fast-changing pricing as timeless facts. _(evidence: finops page labels prices illustrative)_
- [ ] Never generalize region/model availability without a source and scope.
- [x] Never describe Preview as GA or deprecated features as current recommendations. _(evidence: check.mjs bans retired model names; registry status rules)_
- [ ] Distinguish a product capability from a reference architecture recommendation.
- [ ] Distinguish SDK/framework version support from service support.
- [ ] Do not imply that a preview feature is production-ready without explaining its status and risks.
- [x] Mark guidance as `verify before production` if it is sensitive to subscription, region, SKU, model, tier or date. _(evidence: lifecycle notice; unverified boxes)_
- [x] Add source verification checks to the content review process. _(evidence: content-governance.md; check.mjs)_

## 20.4 Freshness workflow

- [x] Provide a content freshness view or report for time-sensitive records. _(evidence: #/freshness)_
- [x] Flag records past their review interval. _(evidence: verification.state(); #/freshness)_
- [x] Add an issue/task template for revalidation. _(evidence: .github/ISSUE_TEMPLATE/revalidate-content.md)_
- [ ] Review Azure service names, lifecycle, model availability, quotas, pricing and SDK references periodically.
- [ ] Update CHANGELOG and last-verified metadata when facts materially change.

**Acceptance criteria:** Every time-sensitive technical claim is attributable to an authoritative source and dated. The site openly communicates where verification is required.

---

# 21. Phase 19 — Quality engineering, testing, accessibility and performance (P0)

## 21.1 Automated tests

- [ ] Unit tests for calculators, scoring rules, decision logic, schema validators and utilities.
- [ ] Component tests for forms, controls, navigation, tables and complex interactions.
- [ ] Integration tests for route loading, content retrieval, filters and search.
- [ ] End-to-end tests for key user journeys.
- [ ] Link checks for internal routes and external references.
- [x] Content schema and metadata validation. _(evidence: scripts/check.mjs)_
- [x] Responsive viewport checks. _(evidence: smoke at 1280 and 375)_
- [ ] Accessibility checks with automated tooling plus manual keyboard review.
- [ ] Snapshot/visual regression tests for critical layouts if practical.
- [x] Build-time checks for missing images, duplicate IDs, empty pages and broken references. _(evidence: check.mjs and smoke)_

## 21.2 Critical end-to-end journeys

- [ ] Navigate from home to a service page and compare alternatives.
- [ ] Search for an Azure service and open relevant architecture/decision content.
- [ ] Complete an AI project assessment and export a report.
- [ ] Compare deterministic workflow vs agent vs multi-agent.
- [ ] Open an enterprise RAG architecture and follow its implementation/evaluation/security links.
- [ ] Open a multi-agent architecture and inspect its failure modes, security, evaluation and cost.
- [ ] Complete a threat model checklist and export it.
- [ ] Complete a production readiness assessment.
- [ ] Calculate an example RAG/agent cost and verify formula behavior.
- [ ] Complete a lab and find its cleanup instructions.
- [ ] Use search and filters on desktop and mobile.

## 21.3 Quality targets

- [x] No critical console errors on primary routes. _(evidence: smoke)_
- [x] No broken primary navigation or critical internal links. _(evidence: smoke)_
- [ ] No inaccessible primary controls.
- [ ] No inert controls presented as functional.
- [x] No known severe security issue or exposed secret. _(evidence: audit §1; CSP)_
- [x] No major responsive overflow on common viewport widths. _(evidence: smoke (two widths))_
- [x] Core flows remain usable without external model API access. _(evidence: no runtime network calls (smoke fails on any))_
- [x] Production build succeeds. _(evidence: no build; pages.yml assembles)_

Set performance budgets based on measured current performance and deployment environment; do not invent a score or claim Lighthouse compliance without running it.

---

# 22. Phase 20 — Security, privacy and supply-chain hardening (P0)

- [ ] Check dependencies for known vulnerabilities and remove unnecessary packages.
- [ ] Pin/manage dependency versions consistently using the existing package manager.
- [x] Ensure no credentials, tokens or connection strings are stored in client bundles or committed files. _(evidence: audit §1)_
- [ ] Validate external URLs and avoid unsafe dynamic HTML.
- [ ] Sanitize user-entered values before rendering or exporting.
- [ ] Avoid collecting sensitive personal/project data unnecessarily.
- [ ] Explain any browser storage behavior and provide reset/clear controls if user data is saved locally.
- [x] Use a Content Security Policy and security headers where supported by the hosting platform. _(evidence: meta CSP; Pages cannot set headers)_
- [x] Check dependency, license and asset provenance. _(evidence: no dependencies; assets are first-party)_
- [ ] Ensure downloads/exports are generated safely.
- [ ] Document that client-only assessments are local educational tools, not secure enterprise workflow systems.

---

# 23. Phase 21 — Release, deployment and operational documentation (P0)

- [x] Confirm the deployment target and current publishing mechanism. _(evidence: architecture.md)_
- [ ] Ensure base paths, routing and refresh/deep-link behavior work on GitHub Pages (or the actual configured host).
- [ ] Confirm CI build output and artifact path.
- [ ] Add preview/staging validation where feasible.
- [x] Ensure failed builds do not publish broken content. _(evidence: pages.yml needs validate)_
- [x] Document release and rollback procedures. _(evidence: quality doc)_
- [ ] Verify custom domain/HTTPS behavior only if configured.
- [ ] Ensure asset paths and diagrams work in production, not only local dev.
- [x] Add a smoke-test checklist after deployment. _(evidence: quality doc)_
- [x] Update README with exact commands and deployment steps. _(evidence: README.md)_

---

# 24. Implementation priority and sequencing

The following sequencing is intended to prevent building isolated features before their shared foundations. Reclassify tasks after Phase 0 using the real repository audit.

## P0 — Must be completed for a credible daily-use Atlas

- [ ] Phase 0 repository audit and baseline.
- [ ] Shared content model, navigation and search.
- [ ] Azure service catalog with source/freshness metadata.
- [ ] AI Project Advisor and core decision engine.
- [ ] Enterprise architecture library with production views.
- [ ] Enterprise RAG and agentic RAG content/playbooks.
- [ ] Single-agent vs multi-agent decision framework and orchestration library.
- [ ] Data readiness and identity-aware retrieval guidance.
- [ ] Security threat library and AI architecture review.
- [ ] RAG and agent evaluation frameworks.
- [ ] Operations/runbooks and production readiness.
- [ ] FinOps calculators with transparent assumptions.
- [ ] EM Workspace core templates and project review tools.
- [ ] Content sourcing/freshness policy.
- [ ] Automated tests, accessibility and deployment validation.

## P1 — Needed for production engineering depth and skill development

- [ ] Classical ML and MLOps coverage.
- [ ] Full data engineering/knowledge engineering section.
- [ ] Platform engineering and secure networking reference patterns.
- [ ] AI CI/CD and evaluation-driven deployment playbooks.
- [ ] Detailed observability/tracing and incident simulation.
- [ ] Complete labs and learning paths.
- [ ] Reusable templates and artifact exports.
- [ ] Capacity planning and architecture comparison tools.

## P2 — Manager and organizational intelligence

- [ ] Project portfolio prioritization.
- [ ] Team competency matrix and development plans.
- [ ] AI maturity assessment.
- [ ] AI technical debt tracking.
- [ ] Roadmap and project health reporting.
- [ ] ROI and business value worksheets.
- [ ] Architecture review history if persistence is safely supported.

## P3 — Advanced specialization and optional expansion

- [ ] Deeper Graph RAG and knowledge graph labs.
- [ ] Multimodal RAG and voice agents.
- [ ] Fine-tuning, distillation and small language model deployment.
- [ ] Synthetic data and advanced benchmarking.
- [ ] Agent simulation and advanced red teaming.
- [ ] Distributed agent patterns and complex long-running workflows.

Do not start P2/P3 work while P0 quality, accuracy or core user journeys remain broken.

---

# 25. Suggested milestone plan

This is a dependency-based sequence, not a promise of completion time. Re-estimate after the repository audit.

## Milestone A — Understand and stabilize

- [ ] Complete Phase 0.
- [ ] Fix build/test/deploy blockers.
- [ ] Create traceability matrix and implementation backlog.
- [ ] Establish content governance and common UI/content model.

**Exit:** Existing functionality is inventoried and stable; actual work is prioritized from evidence.

## Milestone B — Make the Atlas useful for decisions

- [ ] Azure Technology Explorer.
- [ ] AI Project Advisor.
- [ ] Decision frameworks and ADR.
- [ ] Architecture review and core architecture library.

**Exit:** A user can assess a project and justify a recommended Azure architecture.

## Milestone C — Deliver specialization depth

- [ ] RAG Engineering Center.
- [ ] Agent/Multi-agent Engineering Center.
- [ ] Azure data/ML service coverage.
- [ ] Secure identity/networking patterns.

**Exit:** A user can design and build representative enterprise RAG and agent systems with defensible trade-offs.

## Milestone D — Make production readiness real

- [ ] Security/threat model.
- [ ] RAG/agent evaluation workbench.
- [ ] Operations/SRE/runbooks.
- [ ] FinOps/capacity tools.
- [ ] CI/CD and release gates.

**Exit:** A user can define quality, security, cost, SLOs, release gates and incident response for the designs.

## Milestone E — Become a daily manager workspace

- [ ] EM Command Center.
- [ ] Team competency tools.
- [ ] Portfolio, roadmap and maturity assessments.
- [ ] Exportable reports and templates.
- [ ] Learning paths, labs and capstones.

**Exit:** The Atlas supports project assessment, architecture review, team development and delivery planning in addition to technical learning.

---

# 26. Definition of Done

A requirement can be marked complete only when all applicable checks below pass.

## Content definition of done

- [ ] The page answers a real user question and has an explicit purpose.
- [ ] It has adequate depth for its declared audience and difficulty.
- [ ] It explains use cases, non-use cases, alternatives and trade-offs.
- [ ] It includes implementation or operational details where promised.
- [ ] Time-sensitive claims are sourced and dated.
- [ ] It links to relevant Atlas content and official Microsoft references.
- [ ] It contains no unsupported claims, stale terminology or placeholder copy.

## Interactive feature definition of done

- [ ] Inputs are validated and explained.
- [ ] Outputs are computed from actual user inputs.
- [ ] Formulas/rules and assumptions are visible.
- [ ] Empty, error, validation, success and reset states work.
- [ ] Keyboard and screen-reader use are considered.
- [ ] Mobile layout is usable.
- [ ] Export/copy controls work if displayed.
- [ ] Automated tests cover core logic and representative edge cases.
- [ ] Privacy/persistence behavior is documented.

## Architecture/lab definition of done

- [ ] Diagram and text explanation agree.
- [ ] Components and service choices are justified.
- [ ] Security, data, cost, evaluation, deployment and operations are covered.
- [ ] Prerequisites, setup, verification and cleanup are explicit.
- [ ] Code/references are real and accessible.
- [ ] Known limitations and version/region caveats are visible.

## Release definition of done

- [ ] Production build passes.
- [ ] Lint/type-check/tests pass or known baseline exceptions are documented.
- [ ] Main user journeys pass.
- [ ] No critical console errors or broken navigation.
- [ ] Accessibility and responsive checks pass.
- [ ] External links and content references are checked.
- [ ] README, changelog and implementation audit are updated.
- [ ] Deployment smoke test passes.

---

# 27. Final acceptance test — Can the Atlas do the job?

Before declaring the project complete, run these scenario tests using the actual deployed application.

## Scenario 1 — New enterprise AI project

Input: An enterprise wants a knowledge assistant for employees using internal documents and APIs, with private networking, citations, user-level access control and a defined monthly budget.

Expected Atlas outcome:

- [ ] Assess AI suitability and non-AI alternatives.
- [ ] Capture requirements and assumptions.
- [ ] Recommend a suitable RAG or hybrid architecture.
- [ ] Identify Azure service candidates and alternatives.
- [ ] Explain identity-aware retrieval and tenant/permission controls.
- [ ] Create security threats and mitigations.
- [ ] Define evaluation dataset and quality metrics.
- [ ] Estimate cost using editable assumptions.
- [ ] Define SLOs, observability and incident playbooks.
- [ ] Produce delivery phases, team roles and production checklist.

## Scenario 2 — Agent or multi-agent decision

Input: A task needs research across multiple systems, tool calls, a synthesized result and human approval before a consequential action.

Expected Atlas outcome:

- [ ] Compare deterministic workflow, single agent and multi-agent.
- [ ] Recommend the simplest suitable orchestration pattern.
- [ ] Define agent/tool responsibilities and permission boundaries.
- [ ] Explain MCP usage and trust controls if applicable.
- [ ] Add state, persistence, timeout, retry and loop controls.
- [ ] Define task, tool and safety evaluation.
- [ ] Estimate latency/cost trade-offs.
- [ ] Define tracing, incident handling and human escalation.

## Scenario 3 — Production RAG regression

Input: Users report that answers have become less relevant after documents and indexing configuration changed.

Expected Atlas outcome:

- [ ] Provide a diagnostic path across ingestion, parsing, chunking, metadata, embeddings, retrieval, ranking and generation.
- [ ] Identify freshness/indexing and authorization/filter issues.
- [ ] Show evaluation metrics and regression comparisons.
- [ ] Provide telemetry to inspect.
- [ ] Provide safe mitigation, reindex and rollback guidance.
- [ ] Identify prevention actions and ownership.

## Scenario 4 — AI architecture review

Input: A team proposes a multi-agent system for a process with fixed steps and known APIs.

Expected Atlas outcome:

- [ ] Challenge whether agents are necessary.
- [ ] Compare workflow vs single-agent vs multi-agent.
- [ ] Document cost, latency, security, state and operational trade-offs.
- [ ] Recommend a defensible option and conditions that could change it.
- [ ] Produce an ADR/review report.

## Scenario 5 — Team capability planning

Input: The team has strong Python and data skills but limited RAG evaluation, identity-aware retrieval, MCP security and production observability experience.

Expected Atlas outcome:

- [ ] Map capability gaps to role expectations.
- [ ] Recommend learning paths and hands-on labs.
- [ ] Define observable evidence of competency.
- [ ] Suggest skill ownership and delivery dependencies.
- [ ] Produce an actionable development plan.

**Final acceptance criterion:** The five scenarios can be completed end-to-end using the Atlas's real content and tools, without fabricated outputs or major manual reconstruction from disconnected pages.

---

# 28. Completion report required from the coding agent

At the end of implementation, provide a concise but evidence-backed report containing:

1. Repository baseline and architecture summary.
2. Modules/routes inspected.
3. Features already present and preserved.
4. Features improved or newly implemented.
5. Features deferred, with reasons and dependencies.
6. Files/components/routes added or materially changed.
7. Tests, build, accessibility, link checks and deployment checks executed, with results.
8. Azure content sources consulted and any remaining facts needing verification.
9. Known limitations and follow-up work.
10. Updated priority backlog and completion status for this plan.

Do not report a task as complete solely because a page or heading was added. Cite the route, component, data record, test or other concrete evidence for each major completion claim.

---

## Master execution checklist

- [ ] Phase 0 — Repository reconnaissance and baseline audit. _(mostly done; 4 inspection items open, see ledger)_
- [ ] Phase 1 — Product structure and content architecture.
- [ ] Phase 2 — Azure Technology Explorer and service catalog.
- [ ] Phase 3 — AI Project Advisor and decision engine.
- [ ] Phase 4 — Architecture and system-design library.
- [ ] Phase 5 — RAG Engineering Center.
- [ ] Phase 6 — Agent and multi-agent engineering center.
- [ ] Phase 7 — Data Engineering and Classical ML/MLOps.
- [ ] Phase 8 — Identity, networking and platform engineering.
- [ ] Phase 9 — Security, governance and Responsible AI.
- [ ] Phase 10 — Evaluation and AI quality engineering.
- [ ] Phase 11 — Operations, reliability and AI SRE.
- [ ] Phase 12 — AI FinOps and capacity planning.
- [ ] Phase 13 — DevOps, CI/CD and release engineering.
- [ ] Phase 14 — Engineering Manager Workspace.
- [ ] Phase 15 — Learning paths, labs and capstones.
- [ ] Phase 16 — Templates, playbooks and artifacts.
- [ ] Phase 17 — Search and cross-linking.
- [ ] Phase 18 — Content sourcing and freshness governance.
- [ ] Phase 19 — Quality, testing, accessibility and performance.
- [ ] Phase 20 — Security, privacy and supply-chain hardening.
- [ ] Phase 21 — Release and deployment validation.
- [ ] Final acceptance scenarios 1–5 pass.
- [ ] Completion report delivered.


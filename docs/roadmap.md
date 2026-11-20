# Roadmap

What is implemented, what is deferred, and in what order to do the rest. Numbers come from `plan.md` (984 checkboxes, counted by section) and from the data files.

## 1. Implemented in this pass (Milestone A: understand and stabilize)

| Plan item | Result | Evidence |
|---|---|---|
| Phase 0 audit and baseline | Mostly done (4 inspection items open) | `docs/implementation-audit.md` |
| Fix broken pages | 9 findings fixed (rendering, FinOps, overflow, links, search, stale facts, CSP, tests) | Audit section 2 |
| Content governance | Registry, freshness page, per-service verification box, model lifecycle, lint rules, issue template | `data/verification.js`, `#/freshness`, `docs/content-governance.md` |
| FinOps calculators to the plan's standard | Editable inputs and prices, validation, reset, visible formulas, "not a quote" | `#/finops`, `tests/finops.test.mjs` |
| Search | Whole-site index, aliases, filters, highlights, empty-state guidance | `assets/search.js`, `tests/search.test.mjs` |
| Testing and release gate | 36 unit tests, browser smoke, CI, deploy gated | `npm run verify`, `.github/workflows/` |
| Security hardening (client-only scope) | CSP meta, no inline script or handlers, no dependencies, no secrets | `tests/site.test.mjs` |
| Documentation set | Architecture, governance, quality, roadmap, changelog, README | `docs/`, `CHANGELOG.md` |

Verified content so far: 4 of 59 service pages, 6 models in the lifecycle table, and narrow scopes on 3 of 17 modules. The rest is labelled unverified in the app.

## 2. Deferred, with size

The plan has 703 checkboxes in Phases 2 to 16 (content and tools), 80 in cross-cutting Phases 17 to 21, and 44 in Phases 0 to 1. This pass covered much of Phases 0, 17 (search), 18 (governance), 19 (tests) and 20 (hardening) at the level the audit records, and none of Phases 2 to 16 beyond the FinOps rebuild and the fixes above.

| Backlog area | Plan checkboxes | What exists | Main gap |
|---|---|---|---|
| Phase 2 Service catalog | 75 | 59 services | Source, status, region, version metadata on 55 pages; standard page template; missing services; comparison tool |
| Phase 3 Advisor and decisions | 59 | Advisor, shaper, 23 guides, ADR copy | Requirements and assumptions capture, report export, non-AI alternative check, ADR with sources |
| Phase 4 Architectures | 59 | 20 architectures | See catalog table below; four views per architecture; system-design scenarios |
| Phase 5 RAG | 68 | 14 patterns, calculator | Evaluation workbench; 15 mandatory labs (Lab 1 is an end-to-end RAG lab and Lab 3 covers security trimming; neither has been run or has evaluation evidence) |
| Phase 6 Agents | 73 | 18 patterns | Single vs multi-agent decision tool; MCP engineering section; 15 mandatory agent labs |
| Phase 7 Data and ML | 39 | `#/traditional-ml` | Data and knowledge engineering section; decision guides |
| Phase 8 Identity and network | 35 | `#/foundation`, `#/gov` | Verified reference patterns; secure-deployment checklists |
| Phase 9 Security | 48 | 12 threats, 10 gates | Reusable threat-model tool with export; verified mitigations |
| Phase 10 Evaluation | 39 | Pyramid, metrics, gate calculator | Workbench; dataset design tool |
| Phase 11 Operations | 46 | 4 dashboards, 4 runbooks | Verified KQL; SLO tool; more runbooks; incident simulation |
| Phase 12 FinOps | 36 | Rebuilt TCO and ROI | RAG- and agent-specific cost models; capacity planner; sourced prices |
| Phase 13 CI/CD | 29 | Playbook text | Example pipelines; interactive release gates |
| Phase 14 EM workspace | 43 | Intake, estimator, skills matrix | Command centre; portfolio, health and maturity tools; AI technical-debt tracker |
| Phase 15 Learning | 34 | 3 paths, 5 labs | Capstones; assessments; runnable, verified labs |
| Phase 16 Templates | 20 | Copy-able templates in the toolkit and playbooks | File export; more templates |

### Architecture catalog coverage (plan section 6.1, 28 required)

| Status | Count | Items |
|---|---|---|
| Dedicated architecture page exists | 13 | Basic enterprise RAG; agentic RAG; identity-aware RAG; multi-tenant RAG (`secure-multitenant-rag`); Graph RAG; multimodal RAG; multi-agent orchestration (`multiagent-orchestration`); intelligent document processing; event-driven AI; batch AI; real-time inference; traditional ML serving; voice and vision |
| Covered only as a pattern on `#/rag-lab` or `#/agents` | 7 | Advanced RAG; single agent with tools; planner-executor; sequential; parallel; critic-reviewer; human-in-the-loop |
| Missing | 8 | Enterprise AI application / copilot; research agent; secure MCP-enabled agent system; AI data analyst with controls; AI gateway and model routing; private enterprise AI deployment; multi-region and disaster recovery; multi-tenant AI SaaS |

The "dedicated page" count is by name against the 20 existing architectures. Whether each page meets the plan's standard content (section 6.3) has not been audited.

## 3. Acceptance scenarios (plan section 27)

None of the five has been run. From the module inventory, the closest existing content is below. This is a map of what to test, not a result.

| Scenario | Closest existing content | Known missing |
|---|---|---|
| 1. New enterprise knowledge assistant | Advisor (`#/advisor`), `#/d/shaper`, `secure-multitenant-rag`, `#/security-center`, `#/evaluation`, `#/finops`, `#/ops` | One connected report; assumptions list; RAG-specific cost model (embeddings, indexing, search units); SLO tool |
| 2. Agent or multi-agent decision | `#/agents`, decision guides, ADR generator | Guided single vs multi-agent tool; MCP trust controls section |
| 3. Production RAG regression | `#/troubleshooting` (RAG category), Runbook 2, KQL | Verified KQL; reindex and rollback steps; regression comparison workbench |
| 4. Architecture review | ADR generator, toolkit architecture review template | A review tool that challenges agent use and produces a report |
| 5. Team capability planning | `#/em-workspace` skills matrix, `#/labs` paths | Gap-to-plan generator; evidence-of-competency definitions |

## 4. Order of work

Sequenced by dependency. Do not start P2 or P3 work while P0 content is unverified.

1. **Verify what exists (P0, cheap, high value).** Work through `modules[]` in the registry in this order: `services-matrix`, `foundation`, `rag-lab`, `security-center`, `evaluation`, `ops` and `troubleshooting` (KQL), `advisor`, `labs` (run each lab, check each link), then the 55 service pages by category. One batch per sitting; each batch ends with registry records and a changelog line.
2. **Service page template (P0).** Add `status`, `sources`, `lastVerified`, region and tier notes, known limitations to the page and to `check.mjs`.
3. **Milestone B tools (P0).** Advisor: requirements and assumptions capture, non-AI alternative check, report export. Single vs multi-agent decision tool. Architecture review report.
4. **Milestone C content.** The 8 missing and 7 pattern-only architectures; the RAG and agent labs, starting with one end-to-end RAG lab that is actually run and has evaluation evidence (the plan requires this).
5. **Milestone D.** Threat-model tool, evaluation workbench, SLO tool, RAG and agent cost models, example CI/CD pipelines.
6. **Milestone E.** Command centre, portfolio and maturity tools, capstones, assessments, file export.

## 5. Technical follow-ups

- Run an accessibility scanner and a manual keyboard and screen-reader pass; record results in `docs/quality-and-acceptance.md`.
- Run a link checker from an environment that can reach Microsoft Learn.
- Watch the first `pages.yml` run after merge; `ci.yml` already passed on PR #2.
- Remove inline `style=` attributes so `style-src` can drop `'unsafe-inline'`.
- Explain the `localStorage` keys on the page itself.
- Add search filters for role, difficulty and phase, and related-content links, once those fields exist in the data.
- Decide whether to merge overlapping modules (Operations and Troubleshooting; Governance and Security; Toolkit and EM workspace). Any merge needs redirects for old routes.

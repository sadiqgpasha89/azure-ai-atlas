# Implementation audit

Audit date: 2026-11-20. Scope: Phase 0 of `plan.md` plus the Milestone A work that followed from it.
Evidence for every claim is a route, a file, a test or a command listed in this document. Where something was not checked, it says so.

## 1. Repository and baseline

| Item | Finding |
|---|---|
| Stack | Vanilla JavaScript static site. No framework, bundler, package manager or build step. |
| Entry | `index.html` loads `data/*.js` (each fills `window.ATLAS`), then `assets/search.js`, then `assets/app.js`. |
| Routing | Hash router (`#/…`) in `assets/app.js` `render()`. Deep links and refresh work on GitHub Pages because the server never sees the hash. |
| State | None shared. Per-page closures. `localStorage` holds only the theme, the selected role and the readiness checklist (keys in `app.js`). |
| Styling | One stylesheet, `assets/style.css`, CSS variables, light and dark themes. |
| Deployment | `.github/workflows/pages.yml` on push to `main`: validate job, then copies `index.html`, `assets`, `data`, `.nojekyll` to `_site` and deploys. |
| Git | One commit before this work (`4c47ce3`). No lint, type-check or test suite existed. |
| Secrets | Pattern scan of all tracked text files found none (matches were prose about Key Vault). |
| Dependencies | None. Nothing to scan or pin. `package.json` was added for scripts only. |

### Baseline gates before any change

| Gate | Result |
|---|---|
| Production build | Not applicable (no build). |
| `node scripts/check.mjs` | Passed. It validated data shape only, so it said nothing about what the pages rendered. |
| `node --check assets/app.js` | Passed. |
| Lint, type-check, unit tests | None existed. |
| Every route loads | Loaded, but not clean. See section 2. |

## 2. What the running-app audit found

Method: a Playwright crawler (Chrome, `/usr/bin/google-chrome`) opened every route at 1280 px and 375 px, collected console and page errors, text, horizontal overflow, in-page links and unlabeled SVGs. The route set was 145 routes at baseline, 146 after `#/freshness` was added (59 service pages, 11 category pages, 20 architectures, 23 decisions, 5 playbooks, plus modules and tools).

| # | Finding | Class | Evidence before | Fix | Evidence after |
|---|---|---|---|---|---|
| 1 | Renderers read field names the data does not have. About 300 table cells and list items showed `undefined` or `[object Object]` on Foundation, RAG Lab, Agents, Traditional ML, Operations, EM Workspace and Toolkit. | Broken | Text scan of every route | Renderers rewritten to the real data shapes | `scripts/smoke.mjs` fails on `undefined`, `NaN`, `Infinity`, `[object` in any route |
| 2 | FinOps page threw `Cannot read properties of null (reading 'toFixed')` on load. The ROI function was called with different parameter and return names than it defined. | Broken | Console error on `#/finops`, both widths | Calculators rebuilt as pure functions in `data/finops.js`; UI rewritten | 0 console errors; `tests/finops.test.mjs` |
| 3 | FinOps calculators used `value \|\| default`, so entering 0 silently became the default. Hard-coded compute, state and telemetry costs and a three-option search price list sat inside the UI code. Edits to some ROI inputs had no effect. | Broken | Cache hit 0 still showed 40%; ROI unchanged after editing hours | Every input editable, 0 valid, validation, reset, visible formulas | `tests/finops.test.mjs`, `scripts/smoke.mjs` section 3 |
| 4 | Horizontal overflow on every route at 1280 px (17 top-nav links, 371 px too wide) and on 4 to 5 more routes at 375 px (grids with `minmax(340px…)`, a nowrap badge, an unwrapped table). 151 route-width cases in total. | Broken | Crawler overflow count 151 | Scrollable nav; `minmax(min(Npx,100%),1fr)`; wrapping badges; table wrapper | Overflow 0 in 292 route-widths; checked by `scripts/smoke.mjs` |
| 5 | 8 links on the Service Matrix pointed to service ids that do not exist (`#/s/azure-ml`, `#/s/cosmos-db`, …). | Broken | Crawler: 8 deep links not in route set | `atlasId` mapping on each matrix entry; `check.mjs` validates it | 0 unknown links |
| 6 | Search listed index fields by hand per module, some of which did not exist (the summary line for 18 agent patterns and 12 threats read a missing field), and had no entries for several modules. No filters, no acronyms, no highlighting, no guidance on empty results. | Partial | Source review of the old index | `assets/search.js` indexes every string generically; aliases, type filters, highlights, empty-state guidance | `tests/search.test.mjs` (11 tests) |
| 7 | Time-sensitive content stated as fact with no source or date. Examples: model names and prices, Agent Framework status, AI Search tier limits. Many pages named `gpt-4o`, `o1`, `o3-mini` as current. | Outdated | grep of `data/*.js` | Verification registry, lifecycle notice, freshness page, tier wording instead of model names; `check.mjs` forbids retired model names in page data | `#/freshness`; `tests/verification.test.mjs` |
| 8 | No Content-Security-Policy; one inline script and `onsubmit` attributes in generated markup. | Partial | `index.html`, `app.js` | CSP meta tag; theme script moved to `assets/theme.js`; inline handlers removed | `tests/site.test.mjs`; smoke fails on any CSP console error |
| 9 | No automated tests; deployment was not gated on anything but `check.mjs`. | Missing | `.github/workflows/` | 36 unit tests, browser smoke test, CI workflow, Pages gated on `npm run check` and `npm test` | `npm run verify` |

Not found and therefore not changed: no 404s for local assets, no unlabeled SVGs, no thin pages (under 200 characters), no pages without an `h1`.

## 3. Module inventory

Counts are read from the data files. "Searchable" means entries exist in the new index. Accuracy comes from `data/verification.js`: "Partly verified" means a narrow, named scope was checked against Microsoft Learn on 2026-11-20; everything else on the page is unverified.

| Route | Module | Content (counts) | Interaction | Searchable | Azure accuracy | Tests | Recommendation |
|---|---|---|---|---|---|---|---|
| `#/` | Home | 20 capability cards, 11 categories | Navigation | Yes | n/a | smoke | Keep |
| `#/c/<id>`, `#/s/<id>` | Service catalog | 11 categories, 59 services | Role lens, stepper | Yes (59) | 4 services verified (Agent Framework, Foundry, Foundry Agent Service, AI Search); 55 unverified, labelled on page | check, smoke, search | Improve: verify the rest in batches |
| `#/a`, `#/a/<id>` | Architectures | 20 | Stepper | Yes (20) | Unverified | check, smoke | Improve: four views, sources |
| `#/d/…` | Decision centre | 23 guides, EM and PE lenses | Shaper, readiness checklist, cost-per-task calculator | Yes (23 plus tools) | Unverified | check (5,832 shaper combinations), smoke | Keep; add sources |
| `#/p/<id>` | Playbooks | 5 | Read | Yes (5) | Unverified | smoke | Keep; add sources |
| `#/advisor` | Architecture Advisor | 7-question intake, stack, diagram, ADR | Working | Yes | Lifecycle notice only | smoke | Improve (see roadmap) |
| `#/foundation` | Cloud foundation | 4 pillars, 7 platform decisions | Read | Yes | Unverified | smoke | Verify |
| `#/services-matrix` | Service matrix | 14 services, 14 fields, 7 platform decisions | Read | Yes (21) | Unverified (pricing, SLA, quota fields flagged) | check, smoke | Verify |
| `#/foundry` | Foundry deep dive | 5 sections | Read | Yes | Platform name verified; rest unverified | smoke | Verify |
| `#/rag-lab` | RAG lab | 14 patterns, quality calculator | Working | Yes | Unverified; benchmark figures read as measurements | smoke | Verify; label figures illustrative |
| `#/agents` | Agent patterns | 18 patterns, framework matrix | Read | Yes | Agent Framework status verified; rest unverified | smoke | Verify |
| `#/traditional-ml` | Classical ML and integrations | 10-phase lifecycle, comparison tables | Read | Yes | Unverified | smoke | Verify |
| `#/security-center` | Security and governance | 12 threats, 10 gates | Working checklist | Yes (22) | Unverified | smoke | Verify |
| `#/evaluation` | Evaluation | 7 levels, 14 agent metrics, release-gate calculator | Working | Yes | Unverified | smoke | Verify; add unit tests for gate logic |
| `#/ops` | Operations | 4 dashboards, 4 runbooks, KQL | Read, copy | Yes | Unverified (KQL tables not checked) | smoke | Verify KQL |
| `#/troubleshooting` | Troubleshooting | 13 issues in 3 categories | Filter tabs, copy | Yes (13) | Unverified | smoke | Verify |
| `#/finops` | FinOps | Price reference, TCO, ROI, 4 search tiers | Working (rebuilt) | Yes | Search tier limits and model lifecycle verified; prices illustrative and labelled | 9 unit tests, smoke | Keep; source prices when a stable method exists |
| `#/em-workspace` | EM workspace | 14-question intake, estimator, 8-role skills matrix | Working | Yes | Unverified | smoke | Improve |
| `#/toolkit` | Leadership toolkit | 9 templates | Copy | Yes | Vendor matrix reworded | smoke | Improve |
| `#/labs` | Labs and roadmaps | 5 labs, 3 paths | Read | Yes (9) | Steps not run, links not checked | smoke | Verify and run each lab |
| `#/gov` | Landing zones | CAF hierarchy, policies, tenancy | Read | Yes | Unverified | smoke | Verify |
| `#/advanced-ai` | Advanced AI | 8 topics | Read | Yes | Unverified | smoke | Verify |
| `#/freshness` | Content freshness (new) | Registry, lifecycle table, module coverage | Read | Yes | This page is the record | check, smoke, 6 tests | Keep |

Overlap noted: `#/ops` runbooks and `#/troubleshooting` cover similar incidents (429, groundedness drop); `#/gov` and `#/security-center` both carry governance gates; `#/toolkit` and `#/em-workspace` both carry skills matrices. No content was merged in this pass. Merging needs a routing decision, so it is on the roadmap.

External links: not checked. The sandbox allows outbound requests only to a short allowlist, so a link checker could not reach Microsoft Learn. The only first-party pages read were through the research tools, and they are recorded in the registry.

## 4. Traceability matrix (plan sections to implementation)

Status values follow the plan: Complete, Partial, Missing, Outdated, Broken, Not applicable. "Complete" is used only where the plan's own acceptance wording is met and tested.

| Plan section | Requirement (short) | Status | Evidence | Gap |
|---|---|---|---|---|
| 2 Phase 0 | Audit, inventory, matrix, baseline | Partial | This document | Open: external links not checked, tablet width not tested, nested tabs and accordions not individually exercised, no accessibility scan, content depth measured by counts not read line by line |
| 3 Phase 1 | Navigation, content model, visual quality | Partial | Sidebar, top nav, role lens; overflow fixed; `docs/architecture.md` | No URL-synced filters; roles are a lens, not a profile; no keyboard or screen-reader audit yet |
| 4 Phase 2 | Service catalog (6 families), standard page, comparison | Partial | 59 services, 14-service matrix, 4 verified records | Standard template lacks sources, status, region and version fields on 55 pages; some listed services not present |
| 5 Phase 3 | Advisor, decision library, ADR generator | Partial | `#/advisor`, `#/d/shaper`, 23 guides, ADR copy | Advisor does not capture requirements or assumptions list, no report export, non-AI alternative check is thin |
| 6 Phase 4 | Architecture library, four views, scenarios | Partial | 20 architectures | Four views per architecture not present; system-design scenarios not audited |
| 7 Phase 5 | RAG center | Partial | 14 patterns, quality calculator, 13 troubleshooting items | Evaluation workbench and the mandatory RAG labs are not complete |
| 8 Phase 6 | Agent center | Partial | 18 patterns, framework matrix | No single vs multi-agent decision tool; MCP engineering and agent labs thin |
| 9 Phase 7 | Data engineering, classical ML | Partial | `#/traditional-ml` | Data engineering and knowledge engineering not a full section |
| 10 Phase 8 | Identity, networking, platform | Partial | `#/foundation`, `#/gov` | Reference patterns not verified; no deployable examples |
| 11 Phase 9 | Security and governance | Partial | 12 threats, 10-gate checklist | No reusable threat-model tool with export; mitigations unverified |
| 12 Phase 10 | Evaluation | Partial | 7-level pyramid, release-gate calculator | No workbench, no dataset design tool |
| 13 Phase 11 | Operations and SRE | Partial | 4 dashboards, 4 runbooks, KQL | KQL unverified; no SLO tool; no incident simulation |
| 14 Phase 12 | FinOps | Partial | `#/finops`: rebuilt calculators, formulas, validation, reset, 9 tests | Prices unsourced (labelled); no RAG-specific or agent-loop cost model; no capacity planner |
| 15 Phase 13 | CI/CD and release engineering | Partial | Playbook and ops content | No example pipelines, release gates not interactive |
| 16 Phase 14 | EM workspace | Partial | `#/em-workspace`, `#/toolkit` | No command centre, portfolio matrix persistence, health reports |
| 17 Phase 15 | Learning paths, labs, capstones, assessment | Partial | 3 paths, 5 labs | No capstones, no assessment; labs not executed |
| 18 Phase 16 | Templates and exports | Partial | Copy-to-clipboard templates | No file export |
| 19 Phase 17 | Search | Partial | `assets/search.js`, `tests/search.test.mjs` | Done: index of all modules, aliases, type filters, highlights, empty state, keyboard use, mobile width. Not done: filters by role, difficulty, phase; related-content links; index build-time validation beyond the unit test |
| 20 Phase 18 | Sourcing, freshness | Partial | `data/verification.js`, `#/freshness`, issue template, `check.mjs` rules | 4 of 59 services and 3 of 17 modules carry any verified scope. Region, version, owner metadata not captured. Review interval is computed in the browser from today's date |
| 21 Phase 19 | Testing, a11y, performance | Partial | 36 unit tests, browser smoke over 145 routes at 2 widths, CI | No component tests, no axe run, no manual screen-reader review, no external link check, no Lighthouse run (so no claim is made) |
| 22 Phase 20 | Security hardening | Partial | CSP, no inline script or handlers, no secrets, no dependencies, safe highlight escaping | Meta-tag CSP cannot set `frame-ancestors` or headers; GitHub Pages does not allow custom headers. Local storage use is not yet explained on the page |
| 23 Phase 21 | Release and deployment | Partial | Pages workflow gated on check and tests; `docs/quality-and-acceptance.md` has release, smoke and rollback steps | `ci.yml` (checks, tests, browser smoke) passed on a GitHub runner on PR #2; the `pages.yml` deploy job has not run yet; no staging environment |
| 27 | Acceptance scenarios 1 to 5 | Not run | See `docs/roadmap.md` | Not attempted; several steps depend on missing tools |

No plan item is classified Complete. Phase 0 is the closest, with four inspection items still open. That is deliberate: the plan says a requirement is complete only when content, interaction, accessibility, responsive behaviour, references and tests are finished.

## 5. What this pass did not do

It did not write the missing content in Phases 2 to 16 (new architectures, labs, workbenches, capstones, calculators beyond FinOps). That work is sized in `docs/roadmap.md`. It did not verify the 55 unverified service pages or the 14 unverified modules. It did not run an accessibility scanner, a link checker, Lighthouse or the five acceptance scenarios.

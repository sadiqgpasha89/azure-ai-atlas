# Changelog

User-visible changes. Newest first.

## 1.1.0 — 2026-11-20

### Added
- **Content freshness and sources** (`#/freshness`): what has been checked against Microsoft documentation, on what date, from which source, and what has not. Includes the model lifecycle table and module coverage.
- **Verification box on service pages.** Pages with a verified record show the checked claims, date, status and sources. Every other service page says it is unverified.
- **Model lifecycle notice** on FinOps, Foundry, Agents, RAG Lab, Advisor and Operations pages, linked to Microsoft's retirement table (checked 2026-11-20).
- **Search rewrite**: indexes every module (about 290 entries), understands acronyms and error codes (RAG, PTU, MCP, KQL, RBAC, 429), type filters, highlighted matches, guidance when nothing matches, keyboard use throughout.
- **Azure AI Search tier limits table** on FinOps, from Microsoft Learn (checked 2026-11-20).
- Tests and tooling: `npm run check`, `npm test` (36 tests), `npm run smoke` (browser), CI workflow, content-revalidation issue template.
- Documentation: `docs/` (audit, architecture, content governance, quality and acceptance, roadmap) and a status ledger in `plan.md`.

### Changed
- **FinOps rebuilt.** TCO and ROI are now pure, tested functions. Every price and fixed cost is editable, 0 is accepted, invalid input shows an inline error instead of a wrong number, Reset restores defaults, and the formulas are shown. ROI includes the one-time build cost and a benefit realization discount. Prices are labelled illustrative.
- Pages describe model tiers (frontier, small, reasoning) instead of naming `gpt-4o`, `o1` or `o3-mini` as current recommendations.
- Content-Security-Policy added; the theme script moved to `assets/theme.js`; inline form handlers removed.
- Deployment to GitHub Pages now runs `npm run check` and `npm test` first.
- The previous completed plan moved to `docs/archive/plan-v1-completed.md`; `plan.md` is now the master checklist with honest status.

### Fixed
- About 300 cells and list items that showed `undefined` or `[object Object]` on Foundation, RAG Lab, Agents, Traditional ML, Operations, EM Workspace and Toolkit.
- FinOps page error on load, and calculator inputs that were ignored or reset to defaults when set to 0.
- Sideways scrolling on every page at desktop width (top navigation) and on five pages at phone width.
- Eight broken links on the Service Matrix.
- Search results that showed `undefined` summaries for agent patterns and threats.

### Known limitations
- 55 of 59 service pages and 14 of 17 modules are unverified (labelled in the app).
- No accessibility scan, link check or Lighthouse run has been performed. See `docs/quality-and-acceptance.md`.
- The five acceptance scenarios in `plan.md` have not been run. See `docs/roadmap.md`.

## 1.0.0

Initial release: 59 services, 20 architectures, decision centre, and the capability centers added in the first transformation (commit `4c47ce3`).

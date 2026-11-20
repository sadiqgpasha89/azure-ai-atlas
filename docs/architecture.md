# Architecture

A static, build-free site. Content lives in `data/`, behaviour in `assets/`, and everything the browser runs is a classic script. This keeps GitHub Pages deployment trivial and keeps content separate from logic.

## Layout

```
index.html              shell: CSP, header, sidebar mount, search dialog, script tags in load order
assets/theme.js         applies the saved theme before first paint (external so the CSP can forbid inline scripts)
assets/search.js        search index builder and query function (pure, no DOM, unit-tested)
assets/app.js           router, page renderers, calculators UI, search UI
assets/style.css        all styling, light and dark
data/*.js               content and domain logic, one file per module; each assigns to window.ATLAS
data/verification.js    content-governance registry (what has been verified, when, against what)
scripts/check.mjs       data and governance validation (runs in CI and before every deploy)
scripts/serve.mjs       tiny static server for local use and the smoke test
scripts/smoke.mjs       browser smoke test (Playwright)
tests/                  node:test unit and site tests (no dependencies)
docs/                   audit, architecture, governance, quality, roadmap
.github/workflows/      pages.yml (deploy, gated), ci.yml (PRs and branches)
```

Script order in `index.html` matters: `data/core.js` creates `window.ATLAS`, the other data files add to it, `assets/search.js` and `assets/app.js` come last. `check.mjs` and the tests load the data files in the same order by reading the tags from `index.html`, so adding a data file means adding one script tag and nothing else.

## Data flow

1. Data files run and populate `ATLAS` (`services`, `categories`, `architectures`, `decisions`, `finops`, `verification`, …). Services register through the `S({…})` helper in `core.js`.
2. `app.js` builds lookup tables (`byId`, `catById`, `archById`, `decById`) and the search index once.
3. `render()` runs on every `hashchange`. It parses `#/<kind>/<id>`, calls one `page…()` function that returns an HTML string, writes it to `#main`, then runs any `afterRender` hook (used by calculators and steppers to attach listeners).
4. Unknown routes render a not-found page. Unknown ids inside a known kind do the same.

All text from data goes through `esc()` before it enters markup. `[[service-id]]` and `[[service-id|label]]` in text are cross-links resolved by `fmt()`; `check.mjs` fails the build on an unknown id.

## Routes

| Pattern | Page |
|---|---|
| `#/` | Home |
| `#/c/<category>`, `#/s/<service>` | Category and service pages |
| `#/a`, `#/a/<id>` | Architecture index and detail |
| `#/d`, `#/d/em`, `#/d/pe`, `#/d/<decision>` | Decision hub, role tabs, guides |
| `#/d/shaper`, `#/d/checklists`, `#/d/calculator` | Decision tools |
| `#/p`, `#/p/<id>` | Playbooks |
| `#/advisor`, `#/foundation`, `#/services-matrix`, `#/foundry`, `#/rag-lab`, `#/agents`, `#/traditional-ml`, `#/security-center`, `#/evaluation`, `#/ops`, `#/troubleshooting`, `#/finops`, `#/em-workspace`, `#/toolkit`, `#/labs`, `#/gov`, `#/advanced-ai` | Modules |
| `#/freshness` | Content freshness and sources |

Routes from before this work are unchanged, so bookmarks keep working.

## Search

`assets/search.js` is a classic script that sets `window.AtlasSearch` (or `module.exports` when loaded by Node). `build(ATLAS)` walks each module and records `{kind, type, href, name, tag, cat, id, hay}`. `hay` is every string inside the source object, flattened, so the index does not depend on field names. `query(index, text, kind, limit)` requires every word to match, ranks name-prefix over name-contains over id over summary over body, and expands words through the alias table (`RAG`, `PTU`, `MCP`, `429`, `KQL`, …). The UI layer in `app.js` adds type filter chips, highlighting (matching on raw text, escaping each piece) and arrow, Enter, Escape, `/` and Ctrl/Cmd+K handling.

When a module is added, add one `each(…)` line to `build()` and a test expectation. A summary line that comes out empty fails `tests/search.test.mjs`.

## Calculators

Rule: logic is a pure function in the data layer, the UI only reads inputs, validates, calls it and renders.

- `ATLAS.finops.calculateTCO(params)` and `calculateROI(params)` take every input explicitly and never substitute defaults. Zero is a value. Division by zero returns `null`, and the UI shows "n/a".
- `tcoDefaults` and `roiDefaults` hold the starting values. They are placeholders and the page says so.
- `app.js` `readFields()` validates a field list (`min`, `max`, empty, non-numeric) and writes inline errors; invalid input replaces results with an error summary instead of a wrong number.
- Formulas are printed under the results.

## Content governance in code

`data/verification.js` holds only facts that were checked. A service page asks `verificationBox(id)`: a record gives a verified box with the claims, date and sources; no record gives an "Unverified" box. `ATLAS.verification.state(date, kind, now)` returns `verified`, `due` or `unverified` and takes `now` so tests are deterministic. See `docs/content-governance.md`.

## Security posture

- Content-Security-Policy meta tag: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:`; no objects, no base tag, no form posts. `style-src` allows inline styles because pages use inline `style=` attributes; removing them is on the roadmap.
- No inline scripts, no inline event handlers (forms are made inert by one delegated `submit` listener), no `eval`.
- No external requests at runtime, no analytics, no dependencies, no secrets.
- GitHub Pages cannot set response headers, so `frame-ancestors`, HSTS and similar are not available. The meta CSP cannot carry `frame-ancestors`.
- `localStorage` keys: theme, selected role, readiness checklist state. Nothing leaves the browser. The readiness checklist has a Reset button.

## Deployment

Push to `main` runs `pages.yml`: `npm run check`, `npm test`, then it copies `index.html`, `assets/`, `data/` and `.nojekyll` into `_site` and deploys with `actions/deploy-pages`. `docs/`, `tests/`, `scripts/` and `package.json` are not published. Pull requests and other branches run `ci.yml`, which adds the browser smoke test. Rollback: revert the merge commit on `main`; the workflow redeploys the previous content.

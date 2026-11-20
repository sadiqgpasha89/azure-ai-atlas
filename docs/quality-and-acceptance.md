# Quality and acceptance

## Commands

| Command | What it does | Needs |
|---|---|---|
| `npm run check` | `scripts/check.mjs` (data, links, governance rules) plus syntax checks of `app.js` and `search.js` | Node 20+ |
| `npm test` | `node --test`: 36 unit and site tests in `tests/` | Node 20+ |
| `npm run smoke` | Browser smoke test over every route at 1280 px and 375 px, plus search, calculators, theme, freshness | Playwright and a Chromium or Chrome |
| `npm run verify` | All three | as above |
| `npm run serve` | Local static server at http://127.0.0.1:8765/ | Node 20+ |

Playwright is not a repository dependency (the site has no build). Install it for local runs with `npm i --no-save playwright && npx playwright install chromium`, or point at an installed Chrome with `CHROME_PATH` and a `node_modules` folder with `PLAYWRIGHT_DIR`.

## Test strategy

| Layer | Where | Covers |
|---|---|---|
| Data and governance | `scripts/check.mjs` | Schema, cross-references, unique ids, shaper recommendation over 5,832 input combinations, verification registry rules, retired model names |
| Calculators | `tests/finops.test.mjs` | Hand-calculated TCO and ROI, zero and clamped inputs, no NaN or Infinity, every ROI input affects the result, break-even is the zero-net point |
| Search | `tests/search.test.mjs` | Coverage of every module, no empty or broken entries, every link resolves, acronyms (`429`, `PTU`, `MCP`, `RAG`, `KQL`), filters, empty and nonsense queries |
| Governance logic | `tests/verification.test.mjs` | `state()` boundaries, record integrity, source domains, no retired model names in page data |
| Site and security | `tests/site.test.mjs` | CSP present with `script-src 'self'`, no inline scripts or handlers, local assets exist, `rel=noopener`, deploy is gated, `check.mjs` passes and fails when it should |
| Browser | `scripts/smoke.mjs` | Every route renders an `h1`, no console errors (this includes CSP violations), no external requests, no `undefined` or `NaN` text, no horizontal overflow, internal links resolve; search by keyboard, filter, empty state; calculator edge cases; theme toggle; freshness and verification boxes |

The negative cases matter: `site.test.mjs` breaks a record and expects `check.mjs` to fail, and the smoke test was run once against a copy with an inline script, an undefined field and a 900 px element to confirm it fails on each.

## Release criteria

A change is releasable when:

- [ ] `npm run verify` passes.
- [ ] The affected routes were opened in a browser at desktop and phone width, and the console is clean.
- [ ] Any new time-sensitive claim is in the registry with a source and date, or is shown as unverified.
- [ ] New interactive features meet the checklist below.
- [ ] `CHANGELOG.md` is updated, and `docs/implementation-audit.md` if a requirement changed status.

### Interactive feature checklist (from the plan's definition of done)

- [ ] Inputs validated and explained; 0 handled where valid.
- [ ] Output computed from the actual inputs; formulas and assumptions visible.
- [ ] Empty, error, success and reset states work.
- [ ] Keyboard and screen-reader use considered (labels, `aria-live` results, `aria-invalid` and inline errors).
- [ ] Usable at 375 px.
- [ ] Copy or export controls work if shown.
- [ ] Unit tests cover the logic and edge cases.
- [ ] Storage behaviour documented.

## Not yet done (so no claim is made)

- Automated accessibility scan (axe or similar) and a manual screen-reader pass. Only structural checks exist: every page has an `h1`, no unlabeled SVGs, inline field errors use `role="alert"`.
- External link checking. The build sandbox could not reach Microsoft Learn; run a link checker where it can.
- Lighthouse or other performance measurement. No budget has been set, and no score is claimed.
- Component-level tests beyond the calculators and search.
- First run of `ci.yml` on a GitHub runner. The commands were run locally; the workflow file itself has not been exercised.

## Post-deployment smoke checklist

After a deploy, on `https://sadiqgpasha89.github.io/azure-ai-atlas/`:

1. Home loads; theme toggle works; no console errors.
2. Open a deep link directly (for example `#/s/ai-search`) and refresh. It stays on the page.
3. Press `/`, search `429`, open the top result.
4. `#/finops`: change users, set cache hit to 0, press Reset.
5. `#/freshness` shows the registry and the lifecycle table.
6. At phone width, no sideways scrolling on Home, a service page and `#/finops`.

## Rollback

Revert the merge commit on `main` (`git revert -m 1 <sha>`), push, and let `pages.yml` redeploy. If the workflow itself is the problem, re-run the last good run from the Actions tab.

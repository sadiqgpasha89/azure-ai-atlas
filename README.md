# Azure for AI/ML Systems — an interactive atlas

A static, no-build site that explains how to build agentic and ML systems on Azure, one block at a time. It follows the same design as the [AWS AI Atlas](https://sadiqgpasha89.github.io/aws-ai-atlas/).

Live site (after enabling Pages): https://sadiqgpasha89.github.io/azure-ai-atlas/

## What's inside

- **53 services** across 11 categories (compute, storage, databases, analytics, streaming, generative AI, ML platform, AI services, networking, security, operations). Each has an animated isometric flow, step-by-step walkthrough, gotchas, agent/ML notes, pairings and cost notes.
- **6 reference architectures**: RAG assistant, LLM serving, training and MLOps, agent platform, document intelligence, real-time features.
- **14 decision guides** with options side by side, if/then rules, red flags, design-review questions, a revisit trigger, and a one-way / two-way door marker.
- **Decision tabs for engineering managers and principal engineers.** The same guides through two lenses:
  - *Engineering managers*: what you decide, your rhythm, quick calls, and per-guide default call plus the evidence to ask your team for.
  - *Principal engineers*: what you own, quick calls, and per-guide default design plus the evidence to demand in review.
  - Routes: `#/d/em`, `#/d/pe`, `#/d/all`. Your role choice is remembered in the browser.
- **Solution shaper** (7 questions → starting stack, risks, next decisions, phasing), **readiness checklists**, and a **cost-per-task calculator**.
- Search, light/dark theme, hash routing, keyboard-accessible tabs.

## Run locally

```sh
python3 -m http.server 8000   # then open http://localhost:8000
node scripts/check.mjs        # validate the data files
```

## Deploy

The workflow in `.github/workflows/pages.yml` validates the data and deploys to GitHub Pages. In the repo settings, set **Pages → Source** to **GitHub Actions**.

## Layout

```
index.html          page shell; loads data/*.js then assets/app.js
assets/app.js       router, pages, diagrams, shaper, checklists, calculator
assets/style.css    theme and layout
data/               core, one file per category, architectures, decisions, roles, playbooks
scripts/check.mjs   data validator (runs in CI)
```

### Add a service

Add a `S({...})` entry to the matching `data/<category>.js` with `id, cat, name, doc, tag, what, flow (3–7), steps, gotchas, edges, ml, pairs, cost`. `doc` is a path under `learn.microsoft.com/`. Every flow node must be hit by a step. Link other services with `[[service-id|label]]`.

### Add a decision

Add an entry to `data/decisions.js` with `lead` (`em`, `pe` or `both`) and both role lenses (`em` and `pe`, each with `call`, `own[]`, `evidence[]`). If it should appear in the role quick-call tables, add a row in `data/roles.js`. Run `node scripts/check.mjs`.

## Accuracy

Azure product names, limits, regions and prices change often. Volatile facts are hedged in the text; confirm against Microsoft Learn before committing to a design. This is an independent project, not affiliated with or endorsed by Microsoft.

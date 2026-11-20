# Content governance

Azure AI changes monthly. Names, models, limits, regions, prices and preview or GA status all move. The rule for this project is simple: **a time-sensitive fact is either verified, with a source and a date, or it is shown as unverified.** There is no third state.

## Source hierarchy

In order of authority:

1. Microsoft Learn product and service documentation.
2. Azure Architecture Center and the Well-Architected Framework.
3. Official Microsoft GitHub samples and repositories.
4. Official Azure pricing, SLA, quota, region and lifecycle pages.
5. Microsoft engineering blogs and announcements, labelled as announcements.
6. Community material only as supplementary insight, never as the sole source for a platform claim.

Prices are the least stable. Do not hard-code a price as a fact. The FinOps page shows illustrative prices, labels them as such, and lets the reader overwrite them.

## The registry (`data/verification.js`)

| Structure | Holds | Rule |
|---|---|---|
| `sources` | `{id: {title, url, pageUpdated?}}` | URL must be first-party Microsoft HTTPS (`learn`, `devblogs`, `azure`). `pageUpdated` is the date shown on the page, when it shows one. |
| `records[]` | Service-level facts: `id` (a service page id), `lastVerified`, `status`, `claims[]`, `sources[]`, `caveats` | Only claims that were read on the source on `lastVerified`. `status` is set only when the source gives a lifecycle label; otherwise `null`. |
| `modelLifecycle[]` | Model key, lifecycle, retirement dates, replacement | Copied from the Microsoft retirement schedule, with `modelLifecycleVerified` and `modelLifecycleSource`. |
| `modules[]` | One row per module page: `verified` date and `scope`, or `null`, plus `remaining` | A date needs a named scope. `remaining` must say what is still unverified. |
| `reviewIntervalDays` | `service: 90`, `lifecycle: 30`, `pricing: 30` | Drives the "Review due" state. |

States (computed by `ATLAS.verification.state(date, kind, now)`):

- **Verified**: a date exists and is within the interval for that kind.
- **Review due**: a date exists and is older than the interval. Computed in the visitor's browser from today's date, so a page goes "due" without a deploy.
- **Unverified**: no date. Every service without a record, and every module scope not listed.

Verification applies to the listed claims only, never to a whole page. The service-page box and the freshness page both say so.

## Accuracy rules

- Never describe Preview as GA, or a deprecated feature as a current recommendation.
- Never generalise model or region availability without a source and its scope.
- Distinguish a product capability from a reference-architecture recommendation.
- Distinguish SDK or framework version support from service support.
- Mark sensitive guidance "verify before production" (subscription, region, SKU, model, tier, date).
- Prefer model **tiers** (frontier, small, reasoning) over model names in design guidance. Names appear only where the lifecycle table covers them.
- Do not record a lifecycle `status` the source did not state. `foundry` has `status: null` because the page checked gave no label for the platform as a whole.

## What `scripts/check.mjs` enforces

- Every record has a `YYYY-MM-DD` date not later than `asOf`, at least one claim, at least one source, and each source exists.
- Every source URL is first-party Microsoft HTTPS.
- Every record id is a real service page; every module id is a real route.
- A module with a verified date has a scope; every module states what remains.
- Model lifecycle entries have unique keys and required fields; every FinOps model row points at an existing lifecycle key.
- No data file other than the registry and `finops.js` names `gpt-4o`, `o1-preview`, `o1-mini` or `o3-mini`.
- Service-matrix entries resolve to real service pages.

## How to verify a record

1. Read the Microsoft page. Note its URL, title and any "last updated" date.
2. Write the claims in your own words, narrowly. Quote only short phrases.
3. Add the source to `sources` and the record to `records` with today's date. For a model, edit `modelLifecycle` and `modelLifecycleVerified`.
4. Update the module's `verified`, `scope` and `remaining`.
5. Run `npm run verify`. Add a line to `CHANGELOG.md` if a fact in a page changed.
6. If you could not read the source, change nothing. Leaving something unverified is correct.

Never copy a date forward without reading the source again. A date means "a person read this on that day".

## Freshness workflow

- `#/freshness` is the report: records, lifecycle table, module coverage, sources.
- Open a "Revalidate time-sensitive content" issue (template in `.github/ISSUE_TEMPLATE/`) when something shows as due, when Microsoft announces a change, or when a reader reports one.
- Review order: model lifecycle (monthly), then pages that name specific services, limits or prices, then architecture and runbook content.
- Pages not yet reviewed are listed in `docs/roadmap.md` with a batch order.

## Ownership

The repository owner is the content maintainer. There is no per-record `owner` field yet; add one if more than one person edits content.

---
name: Revalidate time-sensitive content
about: A service, model, price, limit or lifecycle fact is due for review or has changed
title: "Revalidate: <service or topic>"
labels: content-freshness
---

**What needs checking**
<!-- Service/page, route (for example #/s/ai-search) and the claim in question. -->

**Why now**
- [ ] Shown as "Review due" on `#/freshness`
- [ ] Microsoft announced a change (link below)
- [ ] A reader reported it
- [ ] Other:

**First-party source(s) read** (exact URL, title and the "last updated" date shown on the page)
1.

**Result**
- [ ] Claims still match. Updated `lastVerified` in `data/verification.js`.
- [ ] Claims changed. Updated the page text and the record, and added a CHANGELOG line.
- [ ] Could not verify. Left the record as unverified and noted why here.

Follow `docs/content-governance.md`. Never copy a date forward without reading the source again.

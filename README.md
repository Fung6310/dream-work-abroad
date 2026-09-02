# DreamWorkAbroad — Scholarships for Malaysian Students, in One Place

[![CI](https://github.com/Fung6310/dream-work-abroad/actions/workflows/ci.yml/badge.svg)](https://github.com/Fung6310/dream-work-abroad/actions/workflows/ci.yml)

Search once, compare government, GLC, university, foundation and
international scholarships open to Malaysian students — education level,
funding type, destination and deadline at a glance — and apply directly on
the official provider's site. One home search with facet filters (including
Malaysia vs. International — a `Scope` filter, not a separate page), plus
**[/match](http://localhost:3100/match)** to answer a few questions and only
see scholarships that fit your education level, field and preferred region.
Scraped candidates go through a staff review queue before anything is
published; nothing is ever auto-published from a scrape. See
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full design,
[docs/MONETIZATION.md](docs/MONETIZATION.md) for the
ads/featured-listing/premium roadmap, and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
for how to put this live on Vercel + Render + a hosted Postgres database.

Runs on a hand-curated launch catalogue (~34 real scholarships) so the whole
flow — search → filter → apply-click → admin stats — is demoable immediately.
Storage is Postgres in production and local JSON files in dev (automatic,
based on whether `DATABASE_URL` is set — see §3 of the architecture doc).

## Project layout

```
apps/
  api/      Node + TypeScript backend — search, scholarship detail, apply-click
            redirect, premium lead capture, admin CRUD + review queue + stats.
            store/ picks Postgres (DATABASE_URL set) or local JSON files (unset).
  web/      Next.js customer-facing site — home search (with a Scope filter for
            Malaysia/International), /match (eligibility matcher), scholarship
            detail, /premium waitlist, /partners (sponsor inquiries)
  admin/    Next.js back-office dashboard — a SEPARATE app/origin, not linked
            from the public site (see docs/ARCHITECTURE.md §9)
packages/
  shared/   TypeScript types + filter/sort/format logic used by all three apps
```

## Running it

Requires Node 18+.

```bash
npm install
```

```bash
npm run dev
```

- API: http://localhost:4100
- Web (students): http://localhost:3100
- Back office (staff): **http://localhost:3101** — password `admin123` (set
  `ADMIN_PASSWORD` in `apps/api/.env` to change it). Nothing on the public
  site links here.

Or run them separately: `npm run dev:api` / `npm run dev:web` / `npm run dev:admin`.

Uses different ports than the sibling [deal-aggregator](../deal-aggregator)
project (4000/3000/3001), so both can run side by side.

## Try the core loop end-to-end

1. Search on http://localhost:3100 (try "Chevening" or "Japan"), toggle a
   filter in the sidebar, open a scholarship, click **Apply Now →** — this
   hits `/api/go/:id`, logs the click, and opens the real official
   application page in a new tab.
2. Open http://localhost:3101, log in, and the click shows up in the
   dashboard stats and 14-day chart.

## Try the Malaysia / International scope filter

On http://localhost:3100, open the filter sidebar (mobile: tap **Filters**)
and check **Scope → Malaysia** or **International** — no separate page for
this, one facet like any other filter. Each scholarship's `scope` is
independent of `providerType` — e.g. a Malaysian private university and a
foreign university are both `providerType: "university"` but different
`scope`.

## Try the eligibility matcher

http://localhost:3100/match — pick an education level, optionally a field of
study and funding preference, and a region — results are narrowed to
scholarships whose structured `educationLevel`/`fieldOfStudy`/`scope` fields
actually match. It deliberately does **not** filter on grades or citizenship
(that data isn't structured per-scholarship) — each result still shows its
Eligibility text for a final self-check.

## Try the review-queue loop

1. In the admin back office, go to **Review Queue** and click
   **Trigger mock scrape** — this runs the mock `ScholarshipSourceAdapter`
   pipeline (no real external site is contacted) and drops a handful of new
   candidates into the queue as `pending`.
2. **Approve** one — it appears in a fresh public search immediately.
   **Reject** one — it never appears publicly.

## Typecheck everything

```bash
npm run typecheck
```

## Deploying

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Vercel for `apps/web` and
`apps/admin`, Render for `apps/api`, a free Supabase/Neon Postgres database.
This repo is already git-initialized with one commit; that doc picks up from
pushing it to GitHub.

## What's next

See **"Roadmap after this prototype"** at the end of
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — the short version: pick one
real scraping source and verify its terms before wiring it in, replace the
shared admin password with real staff auth, apply for Google AdSense once
there's traffic, and build real Stripe billing for Premium.
[docs/MONETIZATION.md](docs/MONETIZATION.md) has the concrete steps for the
account-creation parts only you can do.

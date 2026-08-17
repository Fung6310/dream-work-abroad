# DreamWorkAbroad — Scholarships for Malaysian Students, in One Place

Search once, compare government, GLC, university, foundation and
international scholarships open to Malaysian students — education level,
funding type, destination country and deadline at a glance — and apply
directly on the official provider's site. Scraped candidates go through a
staff review queue before anything is published; nothing is ever
auto-published from a scrape. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
for the full design and [docs/MONETIZATION.md](docs/MONETIZATION.md) for the
ads/featured-listing/premium roadmap.

Today this runs on a hand-curated launch catalogue (~35 real scholarships) so
the whole flow — search → filter → apply-click → admin stats — is demoable
immediately, no API keys required.

## Project layout

```
apps/
  api/      Node + TypeScript backend — search, scholarship detail, apply-click
            redirect, premium lead capture, admin CRUD + review queue + stats
  web/      Next.js customer-facing site — search, filters, scholarship detail
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

## What's next

See **"Roadmap after this prototype"** at the end of
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — the short version: pick one
real scraping source and verify its terms before wiring it in, move the JSON
stores to Postgres, replace the shared admin password with real staff auth,
apply for Google AdSense once there's traffic, and build real Stripe billing
for Premium. [docs/MONETIZATION.md](docs/MONETIZATION.md) has the concrete
steps for the account-creation parts only you can do.

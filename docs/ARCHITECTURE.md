# Architecture

## 1. What this is

DreamWorkAbroad is a Malaysia-focused scholarship information directory: one search
across government, GLC, university, foundation and international scholarship
programmes, filterable by education level, funding type and destination
country, with "Apply Now" linking straight through to the official provider.
Same three-app split as its sibling project,
[deal-aggregator](../../deal-aggregator) ("BandingHarga"): a public Next.js
site, a completely separate staff-only Next.js back office, and an Express API
in between, with a shared types/logic package used by all three.

## 2. How data gets in — the one hard constraint

There are exactly two channels a scholarship can enter the catalogue through,
and only one of them is fully automatic:

| Channel | Who adds it | Initial status |
|---|---|---|
| **Manual curation** | You, via `data/seed.ts` at launch or the admin CRUD form later | `published` immediately |
| **Scraped** | A `ScholarshipSourceAdapter` (today: mock only) via "Trigger mock scrape" in the Review Queue | `pending` — never published automatically |

Nothing a scraper finds ever reaches the public site without a human clicking
Approve in the admin Review Queue. This is deliberate: deal-aggregator's own
architecture treats bypassing bot-detection/ToS as a hard no-go, and
government/university sites vary wildly in how scrape-friendly they are — see
§5 for how this gets extended to real sources later, one at a time, only after
checking that site's terms.

## 3. Data model

`packages/shared/src/types.ts` is the source of truth. The core entity is
`Scholarship` — unlike deal-aggregator's static `Product`/`Offer` catalogue,
scholarships are **mutable** (admin CRUD, plus the pending → published/
rejected workflow), so they live in a JSON-file-backed store
(`apps/api/data.scholarships.json`, gitignored) seeded once from
`data/seed.ts` on first boot, rather than being read straight from the seed
module on every request. `ApplyClickEvent` and `PremiumLead` are pure
append-only logs, same shape/role as deal-aggregator's `ClickEvent`.

## 4. System design

```
ScholarshipSourceAdapter(s)  →  POST /admin/ingest/mock-scrape  →  pending queue
                                          │
data/seed.ts  ──seeds once──▶  apps/api/store.ts (JSON files)  ◀──CRUD── apps/admin
                                          │
                                   GET /api/scholarships
                                          │
                                      apps/web  ──/api/go/:id──▶  official site
```

## 5. Swapping mock scraping for a real source later

`adapters/types.ts` defines the interface every source implements:

```ts
interface ScholarshipSourceAdapter {
  source: string;
  fetchNew(): Promise<ScrapedScholarshipCandidate[]>;
}
```

To go live for a given source:

1. Confirm the target site's robots.txt and terms of service actually permit
   automated fetching. Never bypass bot-detection or CAPTCHAs.
2. Implement a class satisfying `ScholarshipSourceAdapter` that fetches and
   parses that site instead of reading `data/mockScrapeSeed.ts`.
3. Swap the corresponding line in `adapters/index.ts` — nothing else changes,
   since `routes/admin.ts`'s ingest endpoint just iterates `ADAPTERS`.

Do this one source at a time, not all at once — each site needs its own
terms-of-service check.

## 6. Tracking & review-queue design

"Apply Now" is a plain `<a href="/api/go/:id">` — never a direct link to
`officialApplicationUrl`. `/api/go/:id` logs an `ApplyClickEvent` then
302-redirects, which is how the admin dashboard gets "most applied-to" stats
with zero client-side JS, and it's also the engagement data you'd show a
university/agent considering a paid featured placement (see
docs/MONETIZATION.md). It only ever redirects for `status:"published"`
scholarships — pending/rejected items 404 even if you guess their id.

The pending → published/rejected state machine is intentionally one-way from
the public site's perspective: there is no code path that publishes a
scraped candidate without a `POST /admin/scholarships/:id/approve` call behind
`requireAdmin`.

## 7. Tech stack

Node.js + TypeScript + Express API with JSON-file persistence (swap for
Postgres in production — the `Scholarship`/`ApplyClickEvent`/`PremiumLead`
shapes map 1:1 to tables). Next.js 14 (App Router) + Tailwind for both the
public site and the admin back office, deployed as two separate apps/origins.
A shared `@dreamworkabroad/shared` package (types + pure filter/sort/format
helpers) with no build step, consumed via `transpilePackages` in both Next.js
apps and directly via `tsx` in the API.

## 8. Visual theme

Academic indigo (`primary`) + scholarship gold (`accent`), distinct from
deal-aggregator's sage/sand/charcoal — defined once in
`packages/shared/src/theme.ts` (light tokens) and mirrored into each app's
`tailwind.config.ts` with "2"-suffixed dark counterparts. Status badges
(pending/published/rejected/expired) and the featured-placement badge use
their own dedicated token pairs so they read consistently across the public
site and the admin tables.

## 9. Keeping the back office away from students

`apps/admin` is a separate Next.js app on its own port (3101) and eventually
its own subdomain. `apps/web` has zero links or routes into it. Its
`robots.txt` metadata is `{ index: false, follow: false }`. Both apps hit the
same API; the `requireAdmin` cookie is scoped to the API's host so it works
regardless of which frontend called it. The API's CORS allowlist
(`WEB_ORIGIN`, `ADMIN_ORIGIN`) is the only place both origins need registering.
The admin password gate (`ADMIN_PASSWORD` env var, sha256-salted cookie) is
demo-grade — swap for real per-staff auth (e.g. NextAuth/Clerk) before this
goes anywhere near production data.

## 10. Monetization architecture

- **Featured/sponsored listings** — real and functional today. `Scholarship.featured`
  + `featuredUntil` drive `sortFeaturedFirst()` (shared/compare.ts), so a
  featured, non-expired scholarship sorts to the top of search results and
  gets a distinct badge. Toggling it is a normal admin CRUD edit — no payment
  processing wired up, so this is currently invoice-then-toggle (see
  docs/MONETIZATION.md for the sales pitch).
- **Display ads** — `AdSlot` renders a clearly-labeled placeholder until
  `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` is set; the real `<ins class="adsbygoogle">`
  markup is documented inline in `components/AdSlot.tsx`, ready to uncomment.
- **Premium subscription** — waitlist-only for this build (`/premium` +
  `PremiumLead`, visible in Admin → Leads). No Stripe integration yet — see
  docs/MONETIZATION.md for that roadmap.

## 11. Roadmap after this prototype

1. Pick one scraping source, verify its robots.txt/ToS, implement its adapter.
2. Move the JSON-file stores to Postgres.
3. Replace the shared admin password with real per-staff auth.
4. Apply for Google AdSense once there's real traffic (docs/MONETIZATION.md).
5. Build real Stripe billing for Premium, migrating `PremiumLead` records into
   subscribers.
6. Deploy `apps/admin` to its own subdomain, behind extra network protection
   (VPN/IP allowlist) before it holds real applicant data.

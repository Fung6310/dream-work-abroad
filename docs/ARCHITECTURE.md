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
rejected workflow), so they live in `apps/api/src/store/`, seeded once from
`data/seed.ts` on first boot, rather than being read straight from the seed
module on every request. `ApplyClickEvent` and `PremiumLead` are pure
append-only logs, same shape/role as deal-aggregator's `ClickEvent`.

**Storage backend**: `store/index.ts` picks between two implementations of
the same `Store` interface (`store/types.ts`) based on whether `DATABASE_URL`
is set — `store/pgStore.ts` (Postgres, hand-written SQL, no ORM) in
production, `store/fileStore.ts` (JSON files on disk, gitignored) for local
dev with zero setup. Every route imports from `../store` and never knows or
cares which one is live. `pgStore.ts` creates its own tables and seeds them
on first boot — no separate migration step.

Two independent classification axes on `Scholarship`, easy to conflate but
deliberately kept separate:

- **`scope`** (`"malaysia" | "international"`) — who funds it: a Malaysian
  body, or a foreign government/institution. Drives the `/malaysia` and
  `/international` pages.
- **`providerType`** (`government | university | private | foundation |
  international`) — what kind of org it is. A Malaysian private university
  and a foreign university are both `providerType: "university"` but
  different `scope` — that distinction used to be conflated (Malaysian
  private universities were mislabeled `providerType: "private"`, which
  visually collided with actual private-company sponsors like Genting Group)
  until the `scope` field was introduced specifically to carry the
  Malaysia-vs-abroad distinction instead.

## 4. System design

```
ScholarshipSourceAdapter(s)  →  POST /admin/ingest/mock-scrape  →  pending queue
                                          │
data/seed.ts  ──seeds once──▶  apps/api/src/store (pg or file)  ◀──CRUD── apps/admin
                                          │
                          GET /api/scholarships?scope=&level=&field=...
                                          │
                         apps/web  ──/api/go/:id──▶  official site
              (/, /malaysia, /international, /match, /scholarship/:id)
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

Node.js + TypeScript + Express API, Postgres in production / JSON files in
dev (§3). Next.js 14 (App Router) + Tailwind for both the public site and the
admin back office, deployed as two separate apps/origins — see
docs/DEPLOYMENT.md for the Vercel + Render + hosted-Postgres setup. A shared
`@dreamworkabroad/shared` package (types + pure filter/sort/format helpers)
with no build step, consumed via `transpilePackages` in both Next.js apps and
directly via `tsx` in the API.

## 7a. Eligibility matcher ("Find My Scholarships", `/match`)

A client-only profile form (`components/MatchExperience.tsx`) captures
education level, an optional field of study, preferred scope(s) and a
funding preference, persists it to `localStorage` so it survives a repeat
visit, and re-queries `GET /api/scholarships` with those as real filters
(`level`, `field`, `scope`, `fundingType` — the same query params
`/malaysia`/`/international` use). This only narrows on **structured** data
the catalogue actually has. It deliberately does not attempt to filter on
citizenship, minimum CGPA, or other fine-print criteria, since those aren't
structured per-scholarship fields (and inventing plausible-looking numbers
would be worse than not filtering at all) — each result still surfaces its
`eligibilitySummary` text so the student does the final check themselves.
Extending this to hard-filter on more criteria later means adding those as
real structured fields on `Scholarship` first (and populating them
accurately per scholarship), not guessing.

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

## 11. Security & reliability hardening (skill-guided review)

Reviewed against the `security-and-hardening` skill from
[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)
(installed into `~/.claude/skills/`). Fixed:

- **Async errors could crash or hang the API.** Express 4 doesn't forward a
  rejected promise from an `async` route handler to error-handling middleware
  — a failed Postgres query (or any thrown error) would either hang the
  request or crash the process. Fixed with `express-async-errors` (patches
  Express's router once, at the top of `server.ts`) plus a catch-all error
  handler that returns a generic 500 instead of leaking internals.
- **No security headers** — added `helmet()`, with `crossOriginResourcePolicy: { policy: "cross-origin" }` explicitly overridden — helmet's default (`same-origin`) blocks the browser from reading the response on a cross-origin request even when CORS allows it, which would break every call from `apps/web`/`apps/admin` given they're deliberately separate origins from this API (§9). Caught by actually logging into the admin app after adding helmet, not just by reading helmet's docs — the CORS allowlist below is what's meant to restrict callers here, not CORP.
- **Admin login was brute-forceable** — the shared `ADMIN_PASSWORD` had no
  rate limit. Added `express-rate-limit`: 10 attempts/15min on
  `/api/admin/login`, 300 req/15min on `/api` generally.
- **Timing-unsafe password/token comparison** — `===` on secrets leaks
  timing information; swapped for `crypto.timingSafeEqual` (`safeEqual()` in
  `routes/admin.ts`).
- **Admin session cookie missing `secure`** — now `secure: true` in
  production (Render/Vercel are HTTPS-only; local dev stays HTTP so it's
  conditional on `NODE_ENV`).
- **Admin write endpoints trusted client input structurally** —
  `POST`/`PUT /admin/scholarships` now validate with `zod` against the real
  enum values (`providerType`, `scope`, `fundingType`, `status`,
  `educationLevel`) and field constraints (URL format, date format, length
  caps), returning `422` with details on failure. The `PUT` handler also
  switched from *blacklisting* `id`/`createdAt`/`source` off the body to
  *whitelisting* only the validated fields — a client can no longer inject
  arbitrary extra keys.
- **Premium lead email validation was a bare `.includes("@")`** — now a real
  `zod` email schema.
- **Zero tests anywhere** — added `vitest` to `packages/shared` with a real
  suite for the pure filter/sort logic in `compare.ts` (17 tests: query
  matching, deadline math, the full `matchesFilters` matrix, sort ordering).
  Run via `npm test`. Not yet covering `apps/api`/`apps/web` — see roadmap.

**Deferred, with reasons** (checked against the skill's audit-triage
guidance, not skipped silently):
- `npm audit` shows a new moderate advisory in `vitest`'s `esbuild`/`vite`
  chain — it's a dev-server request-forgery issue, reachable only against a
  *running* dev server, and this project only runs `vitest run` (one-shot),
  never `vitest watch`'s dev server. Dev-only dependency, not shipped to
  production. Fixing requires a Vitest 4.x major bump — deferred rather than
  forced, per "never apply forced audit remediation automatically."
- The pre-existing Next.js 14.2.5 / postcss high-severity advisories (flagged
  earlier, inherited from the pinned Next.js version) are unchanged by this
  pass — still tracked, still needs a Next.js major-version upgrade before
  real production traffic.
- Admin auth is still a single shared password (now rate-limited and
  timing-safe, but still not per-staff auth) — real auth (NextAuth/Clerk) is
  still §9's stated pre-production requirement, unchanged by this pass.

## 12. Roadmap after this prototype

1. Pick one scraping source, verify its robots.txt/ToS, implement its adapter.
2. Replace the shared admin password with real per-staff auth.
3. Apply for Google AdSense once there's real traffic (docs/MONETIZATION.md).
4. Build real Stripe billing for Premium, migrating `PremiumLead` records into
   subscribers.
5. Deploy `apps/admin` to its own subdomain, behind extra network protection
   (VPN/IP allowlist) before it holds real applicant data.
6. If the eligibility matcher (§7a) should filter on more than education
   level/field/scope/funding, add real structured fields to `Scholarship`
   (e.g. `minCgpa`, `citizenshipRequirement`) populated accurately per
   scholarship — not inferred from free-text `eligibilitySummary`.
7. Extend test coverage beyond `packages/shared` (§11) into `apps/api` route
   tests (supertest) and `apps/web` component tests.
8. Upgrade Next.js past 14.2.5 to clear the pre-existing advisories (§11).

Already done as of this doc: Postgres migration (§3), the Malaysia/International
scope split (§3, §7a), the eligibility matcher (§7a).

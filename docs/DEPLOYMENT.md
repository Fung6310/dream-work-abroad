# Deployment guide

Target setup: **Vercel** for `apps/web` and `apps/admin` (two separate Vercel
projects from the same repo), **Render** for `apps/api`, and a free hosted
**Postgres** database (Supabase or Neon) for durable storage. No custom domain
for now — everything launches on the free subdomains each host assigns.

I can't create these accounts or click through their signup/billing flows for
you (that needs your own login and, for the database/hosts, agreeing to their
terms) — this doc is the exact sequence to follow yourself. Total cost at this
scale: **$0/month** (all four services have a free tier sufficient for an
early-stage launch).

**Order matters** — the API needs to exist before the frontends can point at
it, and the API needs to know the frontends' URLs for CORS, so you'll circle
back once at the end.

## 0. Push the code to GitHub

Both Vercel and Render deploy from a Git repo. This project has already been
initialized as a local git repo with one commit. You just need to create the
remote and push:

```bash
# Create a new repo at https://github.com/new first (public or private, your choice —
# don't check "Add a README", this repo already has one), then:
git remote add origin https://github.com/<your-username>/dream-work-abroad.git
git branch -M main
git push -u origin main
```

## 1. Create a hosted Postgres database

Pick one (both have a generous free tier):

- **Supabase** — [supabase.com](https://supabase.com) → New Project → set a
  database password → once created, go to Project Settings → Database →
  copy the **Connection string** (URI format, "Transaction" pooler mode).
- **Neon** — [neon.tech](https://neon.tech) → New Project → copy the
  connection string shown on the dashboard.

Either way you end up with something like:
`postgresql://user:password@host:5432/dbname?sslmode=require`

Keep this — it's your `DATABASE_URL`. The API creates its own tables and
seeds the launch catalogue automatically on first boot (see
`apps/api/src/store/pgStore.ts`), so there's nothing else to set up on the
database side.

## 2. Deploy the API to Render

1. [render.com](https://render.com) → sign up → **New +** → **Blueprint**.
2. Connect your GitHub account and pick the repo you pushed in step 0. Render
   reads `render.yaml` at the repo root automatically and proposes one
   service, `dreamworkabroad-api`.
3. Before the first deploy, it'll prompt for the env vars marked `sync: false`
   in `render.yaml`:
   - `ADMIN_PASSWORD` — pick a real password (replaces the `admin123` local
     default — don't ship that one).
   - `DATABASE_URL` — paste the connection string from step 1.
   - `WEB_ORIGIN` / `ADMIN_ORIGIN` — leave placeholder values for now (e.g.
     `https://placeholder.vercel.app`), you'll update these in step 4.
4. Deploy. Once live, copy the service URL Render gives you (looks like
   `https://dreamworkabroad-api.onrender.com`) — this is your API URL.
5. Sanity check: open `<api-url>/api/health` in a browser, should show
   `{"ok":true,...}`.

Note: Render's free tier spins a web service down after 15 minutes of no
traffic; the next request wakes it up with a ~30-60s cold start. Fine for an
early-stage launch, upgrade to a paid instance later if that's not acceptable.

## 3. Deploy the web app to Vercel

1. [vercel.com](https://vercel.com) → sign up → **Add New** → **Project** →
   import the same GitHub repo.
2. In the import screen, set **Root Directory** to `apps/web`. Vercel
   auto-detects the npm workspaces monorepo and installs from the repo root.
3. Add an environment variable: `NEXT_PUBLIC_API_URL` = the Render API URL
   from step 2.
4. Deploy. Copy the resulting URL (e.g. `https://dream-work-abroad.vercel.app`)
   — this is your **public site URL**.

## 4. Deploy the admin app to Vercel (a second, separate project)

1. Vercel → **Add New** → **Project** → import the **same repo again**.
2. Root Directory: `apps/admin`.
3. Env var: `NEXT_PUBLIC_API_URL` = the same Render API URL.
4. Deploy. Copy this URL too (e.g. `https://dream-work-abroad-admin.vercel.app`)
   — this is your **staff back-office URL**. Nothing on the public site links
   to it; keep it bookmarked separately. (It already ships with
   `robots: noindex`, but per docs/ARCHITECTURE.md §9, put real access control
   in front of it — password-gate-only is a placeholder — before it holds
   real applicant-facing traffic.)

## 5. Wire the API's CORS back to the real URLs

Back in the Render dashboard → your `dreamworkabroad-api` service →
Environment:

- Set `WEB_ORIGIN` to your Vercel web URL from step 3.
- Set `ADMIN_ORIGIN` to your Vercel admin URL from step 4.
- Save — Render redeploys automatically.

## 6. Verify the whole thing end-to-end

- Open the web URL: search should return results, a scholarship detail page
  should load, and clicking **Apply Now** should redirect to the real
  official site.
- Open the admin URL, log in with the `ADMIN_PASSWORD` you set in step 2,
  confirm the dashboard shows stats and the review queue works.
- If search comes back empty or admin login fails with a network error, it's
  almost always the CORS/origin env vars from step 5 — double check they
  exactly match the deployed URLs (including `https://`, no trailing slash).

## What's next

- **Custom domain**: once you're ready, buy one (any registrar) and add it in
  Vercel's project settings for `apps/web` (and optionally a separate
  subdomain for admin) — Vercel issues the SSL cert automatically. Render
  supports custom domains for the API too if you want a branded API URL,
  though it's less visible to end users.
- **AdSense / featured listings / Premium billing**: see
  [MONETIZATION.md](MONETIZATION.md) — none of that is blocked by deployment,
  it's independent follow-up work.
- **Real scraper adapters, real admin auth, Postgres-vs-JSON**: see the
  roadmap in [ARCHITECTURE.md](ARCHITECTURE.md) §11 — the Postgres migration
  is already done as of this doc, the rest is still open.

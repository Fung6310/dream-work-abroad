import crypto from "crypto";
import { NextFunction, Request, Response, Router } from "express";
import { z } from "zod";
import {
  AdminStats,
  isFeaturedActive,
  PROVIDER_TYPES,
  ProviderType,
  Scholarship,
  ScholarshipStatus,
} from "@dreamworkabroad/shared";
import { ADAPTERS } from "../adapters";
import {
  addScholarship,
  deleteScholarship,
  getAllScholarships,
  getClicks,
  getLeads,
  getScholarshipById,
  updateScholarship,
} from "../store";

const router = Router();

// --- Demo-grade auth ---------------------------------------------------
// A single shared password gates /admin. Good enough to demo the back office;
// swap for real per-user auth before production — see docs/ARCHITECTURE.md §9.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const COOKIE_NAME = "dreamworkabroad_admin";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

function expectedToken(): string {
  return crypto.createHash("sha256").update(`${ADMIN_PASSWORD}:dreamworkabroad-static-salt`).digest("hex");
}

// Constant-time comparison — `===` on secrets leaks timing information an
// attacker can use to guess the value byte-by-byte. Low real-world risk at
// this traffic scale, but free to fix (security-and-hardening skill).
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (token && safeEqual(token, expectedToken())) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

router.post("/admin/login", (req, res) => {
  const { password } = req.body ?? {};
  if (typeof password !== "string" || !safeEqual(password, ADMIN_PASSWORD)) {
    return res.status(401).json({ error: "Invalid password" });
  }
  res.cookie(COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    // apps/admin and this API are on different domains in every deployed
    // environment (Vercel vs Render) — a genuinely cross-site relationship,
    // not just cross-origin. SameSite=Lax is only sent on top-level
    // navigations, never on the fetch()/XHR calls apps/admin/lib/api.ts
    // makes with credentials:"include", so every admin request beyond the
    // login response itself would silently lose the cookie. SameSite=None
    // requires Secure, which is only true (HTTPS) once deployed — falls
    // back to Lax for local dev, where web/admin/api share "localhost" as
    // the same site regardless of port, so Lax still works there.
    sameSite: IS_PRODUCTION ? "none" : "lax",
    secure: IS_PRODUCTION,
    maxAge: 1000 * 60 * 60 * 8,
  });
  res.json({ ok: true });
});

router.post("/admin/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: IS_PRODUCTION ? "none" : "lax",
    secure: IS_PRODUCTION,
  });
  res.json({ ok: true });
});

router.get("/admin/session", (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  res.json({ authenticated: Boolean(token && safeEqual(token, expectedToken())) });
});

// --- stats ---------------------------------------------------------------

router.get("/admin/stats", requireAdmin, async (_req, res) => {
  const all = await getAllScholarships();
  const clicks = await getClicks();
  const leads = await getLeads();
  const providerTypes = Object.keys(PROVIDER_TYPES) as ProviderType[];
  const statuses: ScholarshipStatus[] = ["pending", "published", "rejected", "expired"];

  const clicksByProviderType = providerTypes.map((providerType) => ({
    providerType,
    clicks: clicks.filter((c) => c.providerType === providerType).length,
  }));

  const clicksOverTime: { date: string; clicks: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    clicksOverTime.push({
      date: dateStr,
      clicks: clicks.filter((c) => c.timestamp.slice(0, 10) === dateStr).length,
    });
  }

  const clicksByScholarship = new Map<string, number>();
  for (const c of clicks) {
    clicksByScholarship.set(c.scholarshipId, (clicksByScholarship.get(c.scholarshipId) ?? 0) + 1);
  }
  const topScholarships = [...clicksByScholarship.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([scholarshipId, count]) => ({
      scholarshipId,
      title: clicks.find((c) => c.scholarshipId === scholarshipId)?.scholarshipTitle ?? scholarshipId,
      clicks: count,
    }));

  const scholarshipsByStatus = statuses.map((status) => ({
    status,
    count: all.filter((s) => s.status === status).length,
  }));

  const stats: AdminStats = {
    totalScholarships: all.length,
    totalPublished: all.filter((s) => s.status === "published").length,
    totalPending: all.filter((s) => s.status === "pending").length,
    totalFeatured: all.filter((s) => isFeaturedActive(s)).length,
    totalApplyClicks: clicks.length,
    totalPremiumLeads: leads.length,
    clicksByProviderType,
    clicksOverTime,
    topScholarships,
    scholarshipsByStatus,
  };

  res.json(stats);
});

// --- scholarship CRUD ------------------------------------------------------

// Validated at this boundary rather than trusted from the client — an admin
// session is trusted to *act*, not to send well-formed data (typos, a stale
// admin UI build, or a direct API call could all send garbage otherwise).
// PUT uses a whitelist (only these keys survive `safeParse`), which also
// replaces the old blacklist-delete of id/createdAt/source — a client can no
// longer inject those (or any other unexpected key) via the request body.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ScholarshipCoreSchema = z.object({
  title: z.string().trim().min(1).max(200),
  provider: z.string().trim().min(1).max(200),
  providerType: z.enum(["government", "university", "private", "foundation", "international"]),
  scope: z.enum(["malaysia", "international"]),
  destinationCountry: z.string().trim().min(1).max(100),
  educationLevel: z
    .array(z.enum(["diploma", "undergraduate", "postgraduate", "phd", "professional"]))
    .min(1),
  fieldOfStudy: z.string().trim().min(1).max(200),
  fundingType: z.enum(["full", "partial", "tuition-only", "living-allowance-only", "other"]),
  deadline: z.string().regex(DATE_RE, "deadline must be YYYY-MM-DD"),
  isRecurringAnnual: z.boolean(),
  officialApplicationUrl: z.string().trim().url().max(500),
  shortDescription: z.string().trim().max(2000),
  eligibilitySummary: z.string().trim().max(2000),
  applicationTimeline: z.string().trim().max(2000),
  minWorkExperienceYears: z.number().int().min(0).max(50).optional(),
  featured: z.boolean(),
  featuredUntil: z.string().regex(DATE_RE).optional(),
  status: z.enum(["pending", "published", "rejected", "expired"]),
});

const ScholarshipCreateSchema = ScholarshipCoreSchema.partial({
  providerType: true,
  scope: true,
  destinationCountry: true,
  educationLevel: true,
  fieldOfStudy: true,
  fundingType: true,
  isRecurringAnnual: true,
  shortDescription: true,
  eligibilitySummary: true,
  applicationTimeline: true,
  minWorkExperienceYears: true,
  featured: true,
  status: true,
});

const ScholarshipUpdateSchema = ScholarshipCoreSchema.partial();

router.get("/admin/scholarships", requireAdmin, async (req, res) => {
  const status = typeof req.query.status === "string" ? (req.query.status as ScholarshipStatus) : undefined;
  const all = await getAllScholarships();
  const list = status ? all.filter((s) => s.status === status) : all;
  res.json({ count: list.length, scholarships: [...list].reverse() });
});

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base}-${crypto.randomBytes(3).toString("hex")}`;
}

router.post("/admin/scholarships", requireAdmin, async (req, res) => {
  const parsed = ScholarshipCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "Invalid input", details: parsed.error.flatten() });
  }
  const body = parsed.data;

  const now = new Date().toISOString();
  const scholarship: Scholarship = {
    id: slugify(body.title),
    title: body.title,
    provider: body.provider,
    providerType: body.providerType ?? "private",
    scope: body.scope ?? "malaysia",
    destinationCountry: body.destinationCountry ?? "Malaysia",
    educationLevel: body.educationLevel ?? ["undergraduate"],
    fieldOfStudy: body.fieldOfStudy ?? "Any",
    fundingType: body.fundingType ?? "partial",
    deadline: body.deadline,
    isRecurringAnnual: body.isRecurringAnnual ?? false,
    officialApplicationUrl: body.officialApplicationUrl,
    shortDescription: body.shortDescription ?? "",
    eligibilitySummary: body.eligibilitySummary ?? "",
    applicationTimeline: body.applicationTimeline ?? "",
    minWorkExperienceYears: body.minWorkExperienceYears,
    featured: body.featured ?? false,
    featuredUntil: body.featuredUntil || undefined,
    status: body.status ?? "published",
    source: "manual",
    createdAt: now,
    updatedAt: now,
  };

  await addScholarship(scholarship);
  res.status(201).json(scholarship);
});

router.put("/admin/scholarships/:id", requireAdmin, async (req, res) => {
  const existing = await getScholarshipById(req.params.id);
  if (!existing) return res.status(404).json({ error: "Scholarship not found" });

  const parsed = ScholarshipUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "Invalid input", details: parsed.error.flatten() });
  }

  const updated = await updateScholarship(req.params.id, parsed.data);
  res.json(updated);
});

router.delete("/admin/scholarships/:id", requireAdmin, async (req, res) => {
  const ok = await deleteScholarship(req.params.id);
  if (!ok) return res.status(404).json({ error: "Scholarship not found" });
  res.json({ ok: true });
});

router.post("/admin/scholarships/:id/approve", requireAdmin, async (req, res) => {
  const updated = await updateScholarship(req.params.id, { status: "published" });
  if (!updated) return res.status(404).json({ error: "Scholarship not found" });
  res.json(updated);
});

router.post("/admin/scholarships/:id/reject", requireAdmin, async (req, res) => {
  const updated = await updateScholarship(req.params.id, { status: "rejected" });
  if (!updated) return res.status(404).json({ error: "Scholarship not found" });
  res.json(updated);
});

// --- ingest (mock scrape) ---------------------------------------------------

// Runs every configured ScholarshipSourceAdapter, dedupes against existing
// scholarships by title+provider, and inserts genuinely new candidates as
// status:"pending" / source:"scraped" — NEVER published automatically. A
// human always approves in the Review Queue before anything goes public.
router.post("/admin/ingest/mock-scrape", requireAdmin, async (_req, res) => {
  const existing = await getAllScholarships();
  const existingKey = (title: string, provider: string) => `${title.toLowerCase()}::${provider.toLowerCase()}`;
  const existingKeys = new Set(existing.map((s) => existingKey(s.title, s.provider)));

  const inserted: Scholarship[] = [];
  const now = new Date().toISOString();

  for (const adapter of ADAPTERS) {
    const candidates = await adapter.fetchNew();
    for (const candidate of candidates) {
      const key = existingKey(candidate.title, candidate.provider);
      if (existingKeys.has(key)) continue;
      existingKeys.add(key);

      const scholarship: Scholarship = {
        id: slugify(candidate.title),
        title: candidate.title,
        provider: candidate.provider,
        providerType: candidate.providerType,
        scope: candidate.scope,
        destinationCountry: candidate.destinationCountry,
        educationLevel: candidate.educationLevel,
        fieldOfStudy: candidate.fieldOfStudy,
        fundingType: candidate.fundingType,
        deadline: candidate.deadline,
        officialApplicationUrl: candidate.officialApplicationUrl,
        shortDescription: candidate.shortDescription,
        eligibilitySummary: candidate.eligibilitySummary ?? "",
        applicationTimeline: candidate.applicationTimeline ?? "",
        minWorkExperienceYears: candidate.minWorkExperienceYears,
        featured: false,
        status: "pending",
        source: "scraped",
        createdAt: now,
        updatedAt: now,
      };
      await addScholarship(scholarship);
      inserted.push(scholarship);
    }
  }

  res.json({ ingested: inserted.length, items: inserted });
});

// --- leads / clicks lists ---------------------------------------------------

router.get("/admin/leads", requireAdmin, async (_req, res) => {
  res.json([...(await getLeads())].reverse());
});

router.get("/admin/clicks", requireAdmin, async (_req, res) => {
  res.json([...(await getClicks())].reverse().slice(0, 100));
});

export default router;

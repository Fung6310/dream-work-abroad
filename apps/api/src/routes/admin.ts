import crypto from "crypto";
import { NextFunction, Request, Response, Router } from "express";
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

function expectedToken(): string {
  return crypto.createHash("sha256").update(`${ADMIN_PASSWORD}:dreamworkabroad-static-salt`).digest("hex");
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (token && token === expectedToken()) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

router.post("/admin/login", (req, res) => {
  const { password } = req.body ?? {};
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: "Invalid password" });
  res.cookie(COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 8,
  });
  res.json({ ok: true });
});

router.post("/admin/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

router.get("/admin/session", (req, res) => {
  res.json({ authenticated: req.cookies?.[COOKIE_NAME] === expectedToken() });
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
  const body = req.body ?? {};
  if (!body.title || !body.provider || !body.officialApplicationUrl || !body.deadline) {
    return res.status(400).json({ error: "title, provider, deadline and officialApplicationUrl are required" });
  }

  const now = new Date().toISOString();
  const scholarship: Scholarship = {
    id: slugify(body.title),
    title: body.title,
    provider: body.provider,
    providerType: body.providerType ?? "private",
    scope: body.scope ?? "malaysia",
    destinationCountry: body.destinationCountry ?? "Malaysia",
    educationLevel: Array.isArray(body.educationLevel) ? body.educationLevel : ["undergraduate"],
    fieldOfStudy: body.fieldOfStudy ?? "Any",
    fundingType: body.fundingType ?? "partial",
    deadline: body.deadline,
    isRecurringAnnual: Boolean(body.isRecurringAnnual),
    officialApplicationUrl: body.officialApplicationUrl,
    shortDescription: body.shortDescription ?? "",
    eligibilitySummary: body.eligibilitySummary ?? "",
    featured: Boolean(body.featured),
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

  const patch = { ...req.body };
  delete patch.id;
  delete patch.createdAt;
  delete patch.source;

  const updated = await updateScholarship(req.params.id, patch);
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

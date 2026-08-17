import { Router } from "express";
import { matchesFilters, ScholarshipFilters, sortByDeadline, sortFeaturedFirst } from "@dreamworkabroad/shared";
import { getAllScholarships, getScholarshipById } from "../store";

const router = Router();

function toArray(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value.map(String) : [String(value)];
}

// GET /api/scholarships?q=&scope=&level=&providerType=&fundingType=&country=&field=&featuredOnly=
router.get("/scholarships", async (req, res) => {
  const filters: ScholarshipFilters = {
    q: typeof req.query.q === "string" ? req.query.q : undefined,
    scope: toArray(req.query.scope) as ScholarshipFilters["scope"],
    level: toArray(req.query.level) as ScholarshipFilters["level"],
    providerType: toArray(req.query.providerType) as ScholarshipFilters["providerType"],
    fundingType: toArray(req.query.fundingType) as ScholarshipFilters["fundingType"],
    destinationCountry: toArray(req.query.country),
    fieldOfStudy: typeof req.query.field === "string" ? req.query.field : undefined,
    featuredOnly: req.query.featuredOnly === "true",
  };

  const all = await getAllScholarships();
  const published = all.filter((s) => s.status === "published");
  const filtered = published.filter((s) => matchesFilters(s, filters));

  res.json({ count: filtered.length, scholarships: sortFeaturedFirst(sortByDeadline(filtered)) });
});

// GET /api/scholarships/:id — never exposes pending/rejected/expired-hidden items by id-guessing
router.get("/scholarships/:id", async (req, res) => {
  const scholarship = await getScholarshipById(req.params.id);
  if (!scholarship || scholarship.status !== "published") {
    return res.status(404).json({ error: "Scholarship not found" });
  }
  res.json(scholarship);
});

export default router;

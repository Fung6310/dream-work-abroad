import type { MetadataRoute } from "next";
import { searchScholarships } from "@/lib/api";
import { SITE_URL } from "@/lib/site";

// Deliberately excludes /undergraduate/results and /postgraduate/results —
// those are per-query dynamic pages (infinite URL variations depending on
// filter inputs), not canonical indexable content. /undergraduate and
// /postgraduate (the filter forms themselves) are the pages worth indexing.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/undergraduate`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/postgraduate`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/premium`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/partners`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const { scholarships } = await searchScholarships({});
  const scholarshipRoutes: MetadataRoute.Sitemap = scholarships.map((s) => ({
    url: `${SITE_URL}/scholarship/${s.id}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...scholarshipRoutes];
}

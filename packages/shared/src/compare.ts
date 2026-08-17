// Pure helpers — no I/O — shared by api/web/admin. Mirrors the role of
// deal-aggregator's compare.ts (sort/filter/format/match helpers) adapted to
// scholarships (deadlines instead of prices).

import { EducationLevel, Scholarship, ScholarshipFilters } from "./types";

export function matchesQuery(s: Scholarship, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    s.title.toLowerCase().includes(q) ||
    s.provider.toLowerCase().includes(q) ||
    s.fieldOfStudy.toLowerCase().includes(q) ||
    s.destinationCountry.toLowerCase().includes(q)
  );
}

export function daysUntilDeadline(deadline: string, referenceDate: Date = new Date()): number {
  const ms = new Date(deadline).getTime() - referenceDate.getTime();
  return Math.ceil(ms / 86_400_000);
}

export function isExpired(deadline: string, referenceDate: Date = new Date()): boolean {
  return daysUntilDeadline(deadline, referenceDate) < 0;
}

export function isDeadlineSoon(
  deadline: string,
  days = 30,
  referenceDate: Date = new Date()
): boolean {
  const d = daysUntilDeadline(deadline, referenceDate);
  return d >= 0 && d <= days;
}

export function isFeaturedActive(s: Scholarship, referenceDate: Date = new Date()): boolean {
  if (!s.featured) return false;
  if (!s.featuredUntil) return true;
  return new Date(s.featuredUntil).getTime() >= referenceDate.getTime();
}

export function formatDeadline(deadline: string): string {
  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(deadline));
}

export function matchesFilters(
  s: Scholarship,
  filters: ScholarshipFilters,
  referenceDate: Date = new Date()
): boolean {
  if (!matchesQuery(s, filters.q ?? "")) return false;
  if (filters.scope?.length && !filters.scope.includes(s.scope)) return false;
  if (filters.level?.length && !s.educationLevel.some((l) => filters.level!.includes(l))) {
    return false;
  }
  if (filters.providerType?.length && !filters.providerType.includes(s.providerType)) {
    return false;
  }
  if (filters.fundingType?.length && !filters.fundingType.includes(s.fundingType)) {
    return false;
  }
  if (
    filters.destinationCountry?.length &&
    !filters.destinationCountry.includes(s.destinationCountry)
  ) {
    return false;
  }
  if (filters.fieldOfStudy) {
    const f = filters.fieldOfStudy.toLowerCase();
    const matchesField =
      s.fieldOfStudy.toLowerCase() === "any" || s.fieldOfStudy.toLowerCase().includes(f);
    if (!matchesField) return false;
  }
  if (filters.featuredOnly && !isFeaturedActive(s, referenceDate)) return false;
  if (!filters.includeExpired && isExpired(s.deadline, referenceDate)) return false;
  return true;
}

export function sortByDeadline(scholarships: Scholarship[]): Scholarship[] {
  return [...scholarships].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );
}

/** Active-featured scholarships first (by deadline), then everything else (by deadline). */
export function sortFeaturedFirst(
  scholarships: Scholarship[],
  referenceDate: Date = new Date()
): Scholarship[] {
  const featured = sortByDeadline(scholarships.filter((s) => isFeaturedActive(s, referenceDate)));
  const rest = sortByDeadline(scholarships.filter((s) => !isFeaturedActive(s, referenceDate)));
  return [...featured, ...rest];
}

export function levelLabel(levels: EducationLevel[]): string {
  return levels.join(", ");
}

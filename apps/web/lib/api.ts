import { EducationLevel, FundingType, Scholarship, Scope } from "@dreamworkabroad/shared";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4100";

export interface SearchParams {
  q?: string;
  /** Locks results to one/some scopes — used by /malaysia, /international and /match. Omit for the combined home search. */
  scope?: Scope | Scope[];
  level?: EducationLevel | EducationLevel[];
  fundingType?: FundingType | FundingType[];
  field?: string;
  featuredOnly?: boolean;
}

function appendAll(qs: URLSearchParams, key: string, value: string | string[] | undefined) {
  if (value === undefined) return;
  for (const v of Array.isArray(value) ? value : [value]) qs.append(key, v);
}

export async function searchScholarships(
  params: SearchParams = {}
): Promise<{ query: string; count: number; scholarships: Scholarship[] }> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  appendAll(qs, "scope", params.scope);
  appendAll(qs, "level", params.level);
  appendAll(qs, "fundingType", params.fundingType);
  if (params.field) qs.set("field", params.field);
  if (params.featuredOnly) qs.set("featuredOnly", "true");
  // Was cache: "no-store" — every page view paid the full round-trip to the
  // API (itself a multi-region hop away, see docs/ARCHITECTURE.md §15) for
  // data that barely changes second-to-second. A short revalidation window
  // means only the first visitor per window pays that cost; everyone else
  // gets an instant cached response. Trade-off: a newly-approved scholarship
  // can take up to this long to appear publicly — acceptable for a review
  // queue that isn't time-critical, unlike the tradeoffs would be for e.g.
  // deadline or apply-click data (neither of which goes through this path).
  const res = await fetch(`${API_BASE}/api/scholarships?${qs.toString()}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  return { query: params.q ?? "", count: data.count, scholarships: data.scholarships };
}

export async function getScholarship(id: string): Promise<Scholarship | null> {
  const res = await fetch(`${API_BASE}/api/scholarships/${id}`, { next: { revalidate: 60 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load scholarship");
  return res.json();
}

export function goHref(scholarshipId: string): string {
  return `${API_BASE}/api/go/${scholarshipId}`;
}

export async function submitPremiumLead(payload: {
  email: string;
  name?: string;
  interestLevel?: EducationLevel;
  scholarshipId?: string;
  scholarshipTitle?: string;
  message?: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/api/premium/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to join the waitlist");
  }
}

// Back-office/admin API calls live in apps/admin, not here — the public site
// has no code path into the dashboard. See docs/ARCHITECTURE.md §9.

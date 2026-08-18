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
  const res = await fetch(`${API_BASE}/api/scholarships?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  return { query: params.q ?? "", count: data.count, scholarships: data.scholarships };
}

export async function getScholarship(id: string): Promise<Scholarship | null> {
  const res = await fetch(`${API_BASE}/api/scholarships/${id}`, { cache: "no-store" });
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

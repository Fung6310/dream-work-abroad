import { AdminStats, ApplyClickEvent, PremiumLead, Scholarship, ScholarshipStatus } from "@dreamworkabroad/shared";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4100";

export async function adminSession(): Promise<{ authenticated: boolean }> {
  const res = await fetch(`${API_BASE}/api/admin/session`, { credentials: "include", cache: "no-store" });
  return res.json();
}

export async function adminLogin(password: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return res.ok;
}

export async function adminLogout(): Promise<void> {
  await fetch(`${API_BASE}/api/admin/logout`, { method: "POST", credentials: "include" });
}

export async function adminStats(): Promise<AdminStats> {
  const res = await fetch(`${API_BASE}/api/admin/stats`, { credentials: "include", cache: "no-store" });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function adminListScholarships(status?: ScholarshipStatus): Promise<Scholarship[]> {
  const qs = status ? `?status=${status}` : "";
  const res = await fetch(`${API_BASE}/api/admin/scholarships${qs}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Unauthorized");
  const data = await res.json();
  return data.scholarships;
}

export async function adminCreateScholarship(payload: Partial<Scholarship>): Promise<Scholarship> {
  const res = await fetch(`${API_BASE}/api/admin/scholarships`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to create scholarship");
  }
  return res.json();
}

export async function adminUpdateScholarship(id: string, payload: Partial<Scholarship>): Promise<Scholarship> {
  const res = await fetch(`${API_BASE}/api/admin/scholarships/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update scholarship");
  return res.json();
}

export async function adminDeleteScholarship(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/scholarships/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete scholarship");
}

export async function adminApproveScholarship(id: string): Promise<Scholarship> {
  const res = await fetch(`${API_BASE}/api/admin/scholarships/${id}/approve`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to approve scholarship");
  return res.json();
}

export async function adminRejectScholarship(id: string): Promise<Scholarship> {
  const res = await fetch(`${API_BASE}/api/admin/scholarships/${id}/reject`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to reject scholarship");
  return res.json();
}

export async function adminTriggerMockScrape(): Promise<{ ingested: number; items: Scholarship[] }> {
  const res = await fetch(`${API_BASE}/api/admin/ingest/mock-scrape`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to trigger mock scrape");
  return res.json();
}

export async function adminListLeads(): Promise<PremiumLead[]> {
  const res = await fetch(`${API_BASE}/api/admin/leads`, { credentials: "include", cache: "no-store" });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function adminListClicks(): Promise<ApplyClickEvent[]> {
  const res = await fetch(`${API_BASE}/api/admin/clicks`, { credentials: "include", cache: "no-store" });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

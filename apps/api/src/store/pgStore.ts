import { Pool, QueryResultRow } from "pg";
import { ApplyClickEvent, PremiumLead, Scholarship } from "@dreamworkabroad/shared";
import { SEED_SCHOLARSHIPS } from "../data/seed";
import { Store } from "./types";

// Production backend — used automatically whenever DATABASE_URL is set (see
// store/index.ts). Local/managed Postgres (Supabase, Neon, Render Postgres,
// etc.) all work the same way through this one connection string.
//
// Deliberately plain SQL, no ORM — mirrors the "no build step, hand-written"
// philosophy of the rest of this codebase (see packages/shared's lack of a
// build step). Columns are snake_case, mapped to/from the camelCase
// Scholarship/ApplyClickEvent/PremiumLead shapes at the edges of this file.

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
  // Managed Postgres providers (Supabase/Neon/Render) terminate TLS with a
  // cert that isn't in Node's default trust store for this connection mode —
  // this is their documented standard setup, not a general security bypass.
  ssl: connectionString && !connectionString.includes("localhost") ? { rejectUnauthorized: false } : undefined,
});

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS scholarships (
  seq BIGSERIAL,
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  scope TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  education_level TEXT[] NOT NULL,
  field_of_study TEXT NOT NULL,
  funding_type TEXT NOT NULL,
  deadline TEXT NOT NULL,
  is_recurring_annual BOOLEAN NOT NULL DEFAULT FALSE,
  official_application_url TEXT NOT NULL,
  short_description TEXT NOT NULL DEFAULT '',
  eligibility_summary TEXT NOT NULL DEFAULT '',
  application_timeline TEXT NOT NULL DEFAULT '',
  min_work_experience_years INTEGER,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  featured_until TEXT,
  status TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS apply_clicks (
  seq BIGSERIAL PRIMARY KEY,
  id TEXT UNIQUE NOT NULL,
  scholarship_id TEXT NOT NULL,
  scholarship_title TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  ts TEXT NOT NULL,
  session_id TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS premium_leads (
  seq BIGSERIAL PRIMARY KEY,
  id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  interest_level TEXT,
  scholarship_id TEXT,
  scholarship_title TEXT,
  message TEXT,
  ts TEXT NOT NULL
);
-- Idempotent, covers a database that was created before these columns existed
-- (schema evolution without a separate migration tool at this scale — see
-- docs/ARCHITECTURE.md §3).
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS application_timeline TEXT NOT NULL DEFAULT '';
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS min_work_experience_years INTEGER;
ALTER TABLE premium_leads ADD COLUMN IF NOT EXISTS scholarship_id TEXT;
ALTER TABLE premium_leads ADD COLUMN IF NOT EXISTS scholarship_title TEXT;
ALTER TABLE premium_leads ADD COLUMN IF NOT EXISTS message TEXT;
`;

function rowToScholarship(row: QueryResultRow): Scholarship {
  return {
    id: row.id,
    title: row.title,
    provider: row.provider,
    providerType: row.provider_type,
    scope: row.scope,
    destinationCountry: row.destination_country,
    educationLevel: row.education_level,
    fieldOfStudy: row.field_of_study,
    fundingType: row.funding_type,
    deadline: row.deadline,
    isRecurringAnnual: row.is_recurring_annual,
    officialApplicationUrl: row.official_application_url,
    shortDescription: row.short_description,
    eligibilitySummary: row.eligibility_summary,
    applicationTimeline: row.application_timeline,
    minWorkExperienceYears: row.min_work_experience_years ?? undefined,
    featured: row.featured,
    featuredUntil: row.featured_until ?? undefined,
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function insertScholarshipRow(s: Scholarship): Promise<void> {
  await pool.query(
    `INSERT INTO scholarships (
      id, title, provider, provider_type, scope, destination_country, education_level,
      field_of_study, funding_type, deadline, is_recurring_annual, official_application_url,
      short_description, eligibility_summary, application_timeline, min_work_experience_years,
      featured, featured_until, status, source, created_at, updated_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
    [
      s.id,
      s.title,
      s.provider,
      s.providerType,
      s.scope,
      s.destinationCountry,
      s.educationLevel,
      s.fieldOfStudy,
      s.fundingType,
      s.deadline,
      s.isRecurringAnnual ?? false,
      s.officialApplicationUrl,
      s.shortDescription,
      s.eligibilitySummary,
      s.applicationTimeline,
      s.minWorkExperienceYears ?? null,
      s.featured,
      s.featuredUntil ?? null,
      s.status,
      s.source,
      s.createdAt,
      s.updatedAt,
    ]
  );
}

async function init(): Promise<void> {
  await pool.query(SCHEMA_SQL);
  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM scholarships");
  if (rows[0].count === 0) {
    for (const s of SEED_SCHOLARSHIPS) {
      await insertScholarshipRow(s);
    }
  }
}

async function getAllScholarships(): Promise<Scholarship[]> {
  const { rows } = await pool.query("SELECT * FROM scholarships ORDER BY seq ASC");
  return rows.map(rowToScholarship);
}

async function getScholarshipById(id: string): Promise<Scholarship | undefined> {
  const { rows } = await pool.query("SELECT * FROM scholarships WHERE id = $1", [id]);
  return rows[0] ? rowToScholarship(rows[0]) : undefined;
}

async function addScholarship(s: Scholarship): Promise<void> {
  await insertScholarshipRow(s);
}

async function updateScholarship(
  id: string,
  patch: Partial<Scholarship>
): Promise<Scholarship | undefined> {
  const existing = await getScholarshipById(id);
  if (!existing) return undefined;
  const merged: Scholarship = { ...existing, ...patch, updatedAt: new Date().toISOString() };

  await pool.query(
    `UPDATE scholarships SET
      title=$2, provider=$3, provider_type=$4, scope=$5, destination_country=$6, education_level=$7,
      field_of_study=$8, funding_type=$9, deadline=$10, is_recurring_annual=$11, official_application_url=$12,
      short_description=$13, eligibility_summary=$14, application_timeline=$15, min_work_experience_years=$16,
      featured=$17, featured_until=$18, status=$19, source=$20, updated_at=$21
    WHERE id=$1`,
    [
      merged.id,
      merged.title,
      merged.provider,
      merged.providerType,
      merged.scope,
      merged.destinationCountry,
      merged.educationLevel,
      merged.fieldOfStudy,
      merged.fundingType,
      merged.deadline,
      merged.isRecurringAnnual ?? false,
      merged.officialApplicationUrl,
      merged.shortDescription,
      merged.eligibilitySummary,
      merged.applicationTimeline,
      merged.minWorkExperienceYears ?? null,
      merged.featured,
      merged.featuredUntil ?? null,
      merged.status,
      merged.source,
      merged.updatedAt,
    ]
  );
  return merged;
}

async function deleteScholarship(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM scholarships WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

async function addClick(click: ApplyClickEvent): Promise<void> {
  await pool.query(
    `INSERT INTO apply_clicks (id, scholarship_id, scholarship_title, provider_type, destination_country, ts, session_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      click.id,
      click.scholarshipId,
      click.scholarshipTitle,
      click.providerType,
      click.destinationCountry,
      click.timestamp,
      click.sessionId,
    ]
  );
}

async function getClicks(): Promise<ApplyClickEvent[]> {
  const { rows } = await pool.query("SELECT * FROM apply_clicks ORDER BY seq ASC");
  return rows.map((row) => ({
    id: row.id,
    scholarshipId: row.scholarship_id,
    scholarshipTitle: row.scholarship_title,
    providerType: row.provider_type,
    destinationCountry: row.destination_country,
    timestamp: row.ts,
    sessionId: row.session_id,
  }));
}

async function addLead(lead: PremiumLead): Promise<void> {
  await pool.query(
    `INSERT INTO premium_leads (id, email, name, interest_level, scholarship_id, scholarship_title, message, ts)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      lead.id,
      lead.email,
      lead.name ?? null,
      lead.interestLevel ?? null,
      lead.scholarshipId ?? null,
      lead.scholarshipTitle ?? null,
      lead.message ?? null,
      lead.timestamp,
    ]
  );
}

async function getLeads(): Promise<PremiumLead[]> {
  const { rows } = await pool.query("SELECT * FROM premium_leads ORDER BY seq ASC");
  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name ?? undefined,
    interestLevel: row.interest_level ?? undefined,
    scholarshipId: row.scholarship_id ?? undefined,
    scholarshipTitle: row.scholarship_title ?? undefined,
    message: row.message ?? undefined,
    timestamp: row.ts,
  }));
}

export const pgStore: Store = {
  init,
  getAllScholarships,
  getScholarshipById,
  addScholarship,
  updateScholarship,
  deleteScholarship,
  addClick,
  getClicks,
  addLead,
  getLeads,
};

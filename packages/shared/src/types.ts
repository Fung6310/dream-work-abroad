// Domain types shared across api / web / admin. No build step — consumed
// straight from src (see package.json main/types) via `transpilePackages` in
// the Next.js apps and directly via `tsx` in the API.

export type ProviderType =
  | "government"
  | "university"
  | "private"
  | "foundation"
  | "international";

export type EducationLevel =
  | "diploma"
  | "undergraduate"
  | "postgraduate"
  | "phd"
  | "professional";

export type FundingType =
  | "full"
  | "partial"
  | "tuition-only"
  | "living-allowance-only"
  | "other";

export type ScholarshipStatus = "pending" | "published" | "rejected" | "expired";

export type ScholarshipSource = "manual" | "scraped";

/**
 * Who funds/offers it, not where you study: "malaysia" = a Malaysian
 * government, GLC, foundation or private-institution scholarship (some of
 * these DO let you study overseas — see destinationCountry for that).
 * "international" = a foreign government or foreign institution's
 * scholarship for Malaysians to study abroad. This is the axis the site's
 * two top-level pages (/malaysia and /international) split on — a separate
 * dimension from providerType (what kind of org it is).
 */
export type Scope = "malaysia" | "international";

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  providerType: ProviderType;
  scope: Scope;
  /** "Malaysia" for domestic scholarships, otherwise the study destination. */
  destinationCountry: string;
  /** Can apply to more than one level (e.g. postgraduate + phd). */
  educationLevel: EducationLevel[];
  /** Free text — "Any" if open to all fields. */
  fieldOfStudy: string;
  fundingType: FundingType;
  /** ISO date string (YYYY-MM-DD). */
  deadline: string;
  /** UI hint: "this programme usually reopens around this time each year". */
  isRecurringAnnual?: boolean;
  officialApplicationUrl: string;
  shortDescription: string;
  /** General entry requirements — citizenship, academic results, etc. Not exhaustive; always verify on the official site. */
  eligibilitySummary: string;
  /**
   * General shape of the application process — when it typically opens/closes,
   * interview/results timing, intake. Deliberately prose, not structured dates:
   * exact dates vary year to year and per-scholarship precision isn't known
   * with confidence for all of them. Always verify exact dates on the official site.
   */
  applicationTimeline: string;
  featured: boolean;
  /** ISO date string — featured placement expires after this date. */
  featuredUntil?: string;
  status: ScholarshipStatus;
  source: ScholarshipSource;
  createdAt: string;
  updatedAt: string;
}

export interface ScholarshipFilters {
  q?: string;
  scope?: Scope[];
  level?: EducationLevel[];
  providerType?: ProviderType[];
  fundingType?: FundingType[];
  destinationCountry?: string[];
  fieldOfStudy?: string;
  featuredOnly?: boolean;
  /** Public site defaults this to false — admin views can opt in. */
  includeExpired?: boolean;
}

export interface ApplyClickEvent {
  id: string;
  scholarshipId: string;
  scholarshipTitle: string;
  providerType: ProviderType;
  destinationCountry: string;
  timestamp: string;
  sessionId: string;
}

export interface PremiumLead {
  id: string;
  email: string;
  name?: string;
  interestLevel?: EducationLevel;
  /** Set when captured from a scholarship's own "remind me" CTA rather than the general /premium page. */
  scholarshipId?: string;
  scholarshipTitle?: string;
  /** Free text — e.g. a partner/provider inquiry submitted via /partners. */
  message?: string;
  timestamp: string;
}

export interface AdminStats {
  totalScholarships: number;
  totalPublished: number;
  totalPending: number;
  totalFeatured: number;
  totalApplyClicks: number;
  totalPremiumLeads: number;
  clicksByProviderType: { providerType: ProviderType; clicks: number }[];
  clicksOverTime: { date: string; clicks: number }[];
  topScholarships: { scholarshipId: string; title: string; clicks: number }[];
  scholarshipsByStatus: { status: ScholarshipStatus; count: number }[];
}

/** Raw shape a source adapter hands back before it's turned into a pending Scholarship. */
export interface ScrapedScholarshipCandidate {
  title: string;
  provider: string;
  providerType: ProviderType;
  scope: Scope;
  destinationCountry: string;
  educationLevel: EducationLevel[];
  fieldOfStudy: string;
  fundingType: FundingType;
  deadline: string;
  officialApplicationUrl: string;
  shortDescription: string;
  /** Scraped candidates are often missing these — admin fills them in on review. */
  eligibilitySummary?: string;
  applicationTimeline?: string;
}

export interface ScopeInfo {
  id: Scope;
  label: string;
  description: string;
}

export const SCOPES: Record<Scope, ScopeInfo> = {
  malaysia: {
    id: "malaysia",
    label: "Malaysia",
    description: "Funded by a Malaysian government body, GLC, foundation or institution.",
  },
  international: {
    id: "international",
    label: "International",
    description: "Funded by a foreign government or foreign institution, for Malaysians to study abroad.",
  },
};

export interface ProviderTypeInfo {
  id: ProviderType;
  label: string;
  badgeColor: string;
}

export const PROVIDER_TYPES: Record<ProviderType, ProviderTypeInfo> = {
  government: { id: "government", label: "Government", badgeColor: "#2E4374" },
  university: { id: "university", label: "University", badgeColor: "#3B6EA5" },
  private: { id: "private", label: "Private", badgeColor: "#7A5CA8" },
  foundation: { id: "foundation", label: "Foundation", badgeColor: "#2E8B7A" },
  international: { id: "international", label: "International", badgeColor: "#C99A3A" },
};

export interface EducationLevelInfo {
  id: EducationLevel;
  label: string;
  order: number;
}

export const EDUCATION_LEVELS: Record<EducationLevel, EducationLevelInfo> = {
  diploma: { id: "diploma", label: "Diploma", order: 1 },
  undergraduate: { id: "undergraduate", label: "Undergraduate", order: 2 },
  postgraduate: { id: "postgraduate", label: "Postgraduate (Master's)", order: 3 },
  phd: { id: "phd", label: "PhD / Doctorate", order: 4 },
  professional: { id: "professional", label: "Professional / Certification", order: 5 },
};

export interface FundingTypeInfo {
  id: FundingType;
  label: string;
}

export const FUNDING_TYPES: Record<FundingType, FundingTypeInfo> = {
  full: { id: "full", label: "Full funding" },
  partial: { id: "partial", label: "Partial funding" },
  "tuition-only": { id: "tuition-only", label: "Tuition only" },
  "living-allowance-only": { id: "living-allowance-only", label: "Living allowance only" },
  other: { id: "other", label: "Other / varies" },
};

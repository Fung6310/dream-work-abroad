import { describe, expect, it } from "vitest";
import {
  daysUntilDeadline,
  isDeadlineSoon,
  isExpired,
  isFeaturedActive,
  matchesFilters,
  matchesQuery,
  sortByDeadline,
  sortFeaturedFirst,
} from "./compare";
import { Scholarship } from "./types";

const REF = new Date("2026-08-18T00:00:00.000Z");

function makeScholarship(overrides: Partial<Scholarship> = {}): Scholarship {
  return {
    id: "test-scholarship",
    title: "Test Scholarship",
    provider: "Test Provider",
    providerType: "government",
    scope: "malaysia",
    destinationCountry: "Malaysia",
    educationLevel: ["undergraduate"],
    fieldOfStudy: "Any",
    fundingType: "full",
    deadline: "2026-12-01",
    officialApplicationUrl: "https://example.com",
    shortDescription: "A test scholarship.",
    eligibilitySummary: "Must be a test.",
    applicationTimeline: "Applications typically open a few months before the deadline.",
    featured: false,
    status: "published",
    source: "manual",
    createdAt: REF.toISOString(),
    updatedAt: REF.toISOString(),
    ...overrides,
  };
}

describe("matchesQuery", () => {
  it("matches on title, provider, field, and destination, case-insensitively", () => {
    const s = makeScholarship({ title: "Chevening Scholarship", provider: "UK FCDO", destinationCountry: "United Kingdom" });
    expect(matchesQuery(s, "chevening")).toBe(true);
    expect(matchesQuery(s, "FCDO")).toBe(true);
    expect(matchesQuery(s, "united kingdom")).toBe(true);
    expect(matchesQuery(s, "japan")).toBe(false);
  });

  it("treats an empty/whitespace query as matching everything", () => {
    const s = makeScholarship();
    expect(matchesQuery(s, "")).toBe(true);
    expect(matchesQuery(s, "   ")).toBe(true);
  });
});

describe("daysUntilDeadline / isExpired / isDeadlineSoon", () => {
  it("counts days from the reference date to the deadline", () => {
    expect(daysUntilDeadline("2026-08-28", REF)).toBe(10);
    expect(daysUntilDeadline("2026-08-08", REF)).toBe(-10);
  });

  it("treats a past deadline as expired and a future one as not", () => {
    expect(isExpired("2026-08-01", REF)).toBe(true);
    expect(isExpired("2026-09-01", REF)).toBe(false);
  });

  it("flags deadlines within the window (default 30 days) as soon, but not past or far-future ones", () => {
    expect(isDeadlineSoon("2026-09-01", 30, REF)).toBe(true); // ~14 days out
    expect(isDeadlineSoon("2026-08-01", 30, REF)).toBe(false); // already passed
    expect(isDeadlineSoon("2027-06-01", 30, REF)).toBe(false); // far in the future
  });
});

describe("isFeaturedActive", () => {
  it("is false when not featured", () => {
    expect(isFeaturedActive(makeScholarship({ featured: false }), REF)).toBe(false);
  });

  it("is true when featured with no expiry", () => {
    expect(isFeaturedActive(makeScholarship({ featured: true }), REF)).toBe(true);
  });

  it("respects featuredUntil — active before/on it, inactive after", () => {
    const active = makeScholarship({ featured: true, featuredUntil: "2026-08-20" });
    const expired = makeScholarship({ featured: true, featuredUntil: "2026-08-01" });
    expect(isFeaturedActive(active, REF)).toBe(true);
    expect(isFeaturedActive(expired, REF)).toBe(false);
  });
});

describe("matchesFilters", () => {
  it("excludes expired scholarships by default, includes them when includeExpired is set", () => {
    const s = makeScholarship({ deadline: "2026-01-01" });
    expect(matchesFilters(s, {}, REF)).toBe(false);
    expect(matchesFilters(s, { includeExpired: true }, REF)).toBe(true);
  });

  it("filters by scope", () => {
    const s = makeScholarship({ scope: "international" });
    expect(matchesFilters(s, { scope: ["international"] }, REF)).toBe(true);
    expect(matchesFilters(s, { scope: ["malaysia"] }, REF)).toBe(false);
  });

  it("filters by education level (any overlap matches)", () => {
    const s = makeScholarship({ educationLevel: ["postgraduate", "phd"] });
    expect(matchesFilters(s, { level: ["phd"] }, REF)).toBe(true);
    expect(matchesFilters(s, { level: ["undergraduate"] }, REF)).toBe(false);
  });

  it("filters by provider type and funding type", () => {
    const s = makeScholarship({ providerType: "foundation", fundingType: "partial" });
    expect(matchesFilters(s, { providerType: ["foundation"] }, REF)).toBe(true);
    expect(matchesFilters(s, { providerType: ["government"] }, REF)).toBe(false);
    expect(matchesFilters(s, { fundingType: ["partial"] }, REF)).toBe(true);
    expect(matchesFilters(s, { fundingType: ["full"] }, REF)).toBe(false);
  });

  it("field of study: 'Any' always matches, a specific field requires a substring match", () => {
    const openToAny = makeScholarship({ fieldOfStudy: "Any" });
    const engineering = makeScholarship({ fieldOfStudy: "Engineering, Sciences" });
    expect(matchesFilters(openToAny, { fieldOfStudy: "Medicine" }, REF)).toBe(true);
    expect(matchesFilters(engineering, { fieldOfStudy: "Engineering" }, REF)).toBe(true);
    expect(matchesFilters(engineering, { fieldOfStudy: "Medicine" }, REF)).toBe(false);
  });

  it("featuredOnly only matches actively-featured scholarships", () => {
    const featured = makeScholarship({ featured: true });
    const notFeatured = makeScholarship({ featured: false });
    expect(matchesFilters(featured, { featuredOnly: true }, REF)).toBe(true);
    expect(matchesFilters(notFeatured, { featuredOnly: true }, REF)).toBe(false);
  });

  it("combines with a text query", () => {
    const s = makeScholarship({ title: "Chevening Scholarship", scope: "international" });
    expect(matchesFilters(s, { q: "chevening", scope: ["international"] }, REF)).toBe(true);
    expect(matchesFilters(s, { q: "fulbright", scope: ["international"] }, REF)).toBe(false);
  });
});

describe("sortByDeadline", () => {
  it("sorts ascending by deadline without mutating the input array", () => {
    const a = makeScholarship({ id: "a", deadline: "2027-01-01" });
    const b = makeScholarship({ id: "b", deadline: "2026-09-01" });
    const c = makeScholarship({ id: "c", deadline: "2026-10-01" });
    const input = [a, b, c];
    const sorted = sortByDeadline(input);
    expect(sorted.map((s) => s.id)).toEqual(["b", "c", "a"]);
    expect(input).toEqual([a, b, c]); // original order untouched
  });
});

describe("sortFeaturedFirst", () => {
  it("puts active-featured scholarships first (deadline order), then the rest (deadline order)", () => {
    const soonUnfeatured = makeScholarship({ id: "soon", deadline: "2026-09-01", featured: false });
    const laterFeatured = makeScholarship({ id: "later-featured", deadline: "2027-01-01", featured: true });
    const expiredFeatured = makeScholarship({
      id: "expired-featured",
      deadline: "2027-06-01",
      featured: true,
      featuredUntil: "2026-01-01", // featured window already over
    });
    const result = sortFeaturedFirst([soonUnfeatured, laterFeatured, expiredFeatured], REF);
    expect(result.map((s) => s.id)).toEqual(["later-featured", "soon", "expired-featured"]);
  });
});

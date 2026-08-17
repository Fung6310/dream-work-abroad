"use client";

import { useMemo, useState } from "react";
import {
  EducationLevel,
  EDUCATION_LEVELS,
  FundingType,
  FUNDING_TYPES,
  isDeadlineSoon,
  isFeaturedActive,
  ProviderType,
  PROVIDER_TYPES,
  Scholarship,
  Scope,
  sortByDeadline,
  sortFeaturedFirst,
} from "@dreamworkabroad/shared";
import FilterSidebar from "./FilterSidebar";
import ScholarshipCard from "./ScholarshipCard";

const ALL_LEVELS = Object.keys(EDUCATION_LEVELS) as EducationLevel[];
const ALL_PROVIDER_TYPES = Object.keys(PROVIDER_TYPES) as ProviderType[];
const ALL_FUNDING_TYPES = Object.keys(FUNDING_TYPES) as FundingType[];

function allTrue<T extends string>(keys: T[]): Record<T, boolean> {
  return Object.fromEntries(keys.map((k) => [k, true])) as Record<T, boolean>;
}

// Facet filtering happens entirely client-side over the already-fetched
// result set (no extra network round-trip per checkbox) — the server only
// handles the initial text query (and, on /malaysia and /international, the
// scope). Same pattern as deal-aggregator's SearchResults.tsx. The Scope
// facet itself auto-hides when the fetched set is already single-scope (see
// FilterSidebar) — same trick as the Destination section hiding for one country.
export default function SearchResults({ scholarships, query }: { scholarships: Scholarship[]; query: string }) {
  const scopes = useMemo(() => Array.from(new Set(scholarships.map((s) => s.scope))) as Scope[], [scholarships]);
  const countries = useMemo(
    () => Array.from(new Set(scholarships.map((s) => s.destinationCountry))).sort(),
    [scholarships]
  );

  const [selectedScopes, setSelectedScopes] = useState<Record<Scope, boolean>>(() => allTrue(scopes));
  const [levels, setLevels] = useState<Record<EducationLevel, boolean>>(() => allTrue(ALL_LEVELS));
  const [providerTypes, setProviderTypes] = useState<Record<ProviderType, boolean>>(() => allTrue(ALL_PROVIDER_TYPES));
  const [fundingTypes, setFundingTypes] = useState<Record<FundingType, boolean>>(() => allTrue(ALL_FUNDING_TYPES));
  const [selectedCountries, setSelectedCountries] = useState<Record<string, boolean>>(() => allTrue(countries));
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [deadlineSoonOnly, setDeadlineSoonOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const matches = scholarships.filter(
      (s) =>
        (selectedScopes[s.scope] ?? true) &&
        s.educationLevel.some((l) => levels[l]) &&
        providerTypes[s.providerType] &&
        fundingTypes[s.fundingType] &&
        (selectedCountries[s.destinationCountry] ?? true) &&
        (!featuredOnly || isFeaturedActive(s)) &&
        (!deadlineSoonOnly || isDeadlineSoon(s.deadline))
    );
    return sortFeaturedFirst(sortByDeadline(matches));
  }, [scholarships, selectedScopes, levels, providerTypes, fundingTypes, selectedCountries, featuredOnly, deadlineSoonOnly]);

  const activeCount =
    scopes.filter((sc) => !selectedScopes[sc]).length +
    ALL_LEVELS.filter((l) => !levels[l]).length +
    ALL_PROVIDER_TYPES.filter((p) => !providerTypes[p]).length +
    ALL_FUNDING_TYPES.filter((f) => !fundingTypes[f]).length +
    countries.filter((c) => !selectedCountries[c]).length +
    (featuredOnly ? 1 : 0) +
    (deadlineSoonOnly ? 1 : 0);

  function reset() {
    setSelectedScopes(allTrue(scopes));
    setLevels(allTrue(ALL_LEVELS));
    setProviderTypes(allTrue(ALL_PROVIDER_TYPES));
    setFundingTypes(allTrue(ALL_FUNDING_TYPES));
    setSelectedCountries(allTrue(countries));
    setFeaturedOnly(false);
    setDeadlineSoonOnly(false);
  }

  const sidebarProps = {
    scopes,
    selectedScopes,
    onToggleScope: (sc: Scope) => setSelectedScopes((s) => ({ ...s, [sc]: !s[sc] })),
    levels,
    onToggleLevel: (l: EducationLevel) => setLevels((s) => ({ ...s, [l]: !s[l] })),
    providerTypes,
    onToggleProviderType: (p: ProviderType) => setProviderTypes((s) => ({ ...s, [p]: !s[p] })),
    fundingTypes,
    onToggleFundingType: (f: FundingType) => setFundingTypes((s) => ({ ...s, [f]: !s[f] })),
    countries,
    selectedCountries,
    onToggleCountry: (c: string) => setSelectedCountries((s) => ({ ...s, [c]: !s[c] })),
    featuredOnly,
    onToggleFeaturedOnly: () => setFeaturedOnly((v) => !v),
    deadlineSoonOnly,
    onToggleDeadlineSoonOnly: () => setDeadlineSoonOnly((v) => !v),
    onReset: reset,
    activeCount,
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
      <button
        onClick={() => setMobileFiltersOpen((v) => !v)}
        className="flex items-center justify-between rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 px-4 py-2.5 text-sm font-medium text-text dark:text-text2 lg:hidden"
      >
        Filters {activeCount > 0 ? `(${activeCount})` : ""}
        <span className="text-textMuted dark:text-textMuted2">{mobileFiltersOpen ? "▲" : "▼"}</span>
      </button>

      <aside className={`${mobileFiltersOpen ? "block" : "hidden"} lg:block`}>
        <FilterSidebar {...sidebarProps} />
      </aside>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text dark:text-text2">
            {query ? `Results for "${query}"` : "All scholarships"}
          </h2>
          <span className="text-sm text-textMuted dark:text-textMuted2">
            {filtered.length} scholarship{filtered.length === 1 ? "" : "s"}
          </span>
        </div>

        {scholarships.length === 0 ? (
          <p className="rounded-xl2 border border-dashed border-border dark:border-border2 p-8 text-center text-textMuted dark:text-textMuted2">
            No matches yet. We currently track a curated launch catalogue — try a broader search, e.g. a country
            or field of study.
          </p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl2 border border-dashed border-border dark:border-border2 p-8 text-center text-textMuted dark:text-textMuted2">
            <p>No scholarships match your filters.</p>
            <button onClick={reset} className="mt-2 text-sm font-medium text-primary hover:underline dark:text-primary2">
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((s) => (
              <ScholarshipCard key={s.id} scholarship={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

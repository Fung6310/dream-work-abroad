"use client";

import { useMemo, useState } from "react";
import {
  EducationLevel,
  FundingType,
  isDeadlineSoon,
  ProviderType,
  Scholarship,
  Scope,
  sortByDeadline,
  sortFeaturedFirst,
} from "@dreamworkabroad/shared";
import FilterSidebar from "./FilterSidebar";
import ScholarshipCard from "./ScholarshipCard";

function allFalse<T extends string>(keys: T[]): Record<T, boolean> {
  return Object.fromEntries(keys.map((k) => [k, false])) as Record<T, boolean>;
}

// Facet filtering happens entirely client-side over the already-fetched
// result set (no extra network round-trip per checkbox) — the server only
// handles the initial text query. Same pattern as deal-aggregator's
// SearchResults.tsx. Every facet's option list (scope, level, provider type,
// funding type, destination) is derived from what's actually present in
// `scholarships`, not the full enum — see the comment in FilterSidebar for
// why that matters (a checkbox for a value with zero matches is a dead
// filter). No "Featured only" filter here either — featured scholarships
// already get their own strip on the home page, so a duplicate filter for
// the same thing was redundant.
//
// Filters are opt-in, not opt-out: every checkbox starts unchecked and the
// full result set shows. Checking a box narrows to that value; checking
// nothing in a facet applies no constraint from that facet at all (an empty
// selection is never "match nothing"). FilterSidebar's checkbox UI doesn't
// need to know about this — `checked` already means "selected" either way.
export default function SearchResults({
  scholarships,
  query,
  emptyLabel = "All scholarships",
  noMatchText = "No matches yet. We currently track a curated launch catalogue — try a broader search, e.g. a country or field of study.",
}: {
  scholarships: Scholarship[];
  query: string;
  /** Heading shown when there's no text query — e.g. "All undergraduate scholarships". */
  emptyLabel?: string;
  noMatchText?: string;
}) {
  const scopes = useMemo(() => Array.from(new Set(scholarships.map((s) => s.scope))) as Scope[], [scholarships]);
  const levels = useMemo(
    () => Array.from(new Set(scholarships.flatMap((s) => s.educationLevel))) as EducationLevel[],
    [scholarships]
  );
  const providerTypes = useMemo(
    () => Array.from(new Set(scholarships.map((s) => s.providerType))) as ProviderType[],
    [scholarships]
  );
  const fundingTypes = useMemo(
    () => Array.from(new Set(scholarships.map((s) => s.fundingType))) as FundingType[],
    [scholarships]
  );
  const countries = useMemo(
    () => Array.from(new Set(scholarships.map((s) => s.destinationCountry))).sort(),
    [scholarships]
  );

  const [selectedScopes, setSelectedScopes] = useState<Record<Scope, boolean>>(() => allFalse(scopes));
  const [selectedLevels, setSelectedLevels] = useState<Record<EducationLevel, boolean>>(() => allFalse(levels));
  const [selectedProviderTypes, setSelectedProviderTypes] = useState<Record<ProviderType, boolean>>(() =>
    allFalse(providerTypes)
  );
  const [selectedFundingTypes, setSelectedFundingTypes] = useState<Record<FundingType, boolean>>(() =>
    allFalse(fundingTypes)
  );
  const [selectedCountries, setSelectedCountries] = useState<Record<string, boolean>>(() => allFalse(countries));
  const [deadlineSoonOnly, setDeadlineSoonOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const anyScope = scopes.some((sc) => selectedScopes[sc]);
    const anyLevel = levels.some((l) => selectedLevels[l]);
    const anyProviderType = providerTypes.some((p) => selectedProviderTypes[p]);
    const anyFundingType = fundingTypes.some((f) => selectedFundingTypes[f]);
    const anyCountry = countries.some((c) => selectedCountries[c]);

    const matches = scholarships.filter(
      (s) =>
        (!anyScope || selectedScopes[s.scope]) &&
        (!anyLevel || s.educationLevel.some((l) => selectedLevels[l])) &&
        (!anyProviderType || selectedProviderTypes[s.providerType]) &&
        (!anyFundingType || selectedFundingTypes[s.fundingType]) &&
        (!anyCountry || selectedCountries[s.destinationCountry]) &&
        (!deadlineSoonOnly || isDeadlineSoon(s.deadline))
    );
    return sortFeaturedFirst(sortByDeadline(matches));
  }, [
    scholarships,
    scopes,
    levels,
    providerTypes,
    fundingTypes,
    countries,
    selectedScopes,
    selectedLevels,
    selectedProviderTypes,
    selectedFundingTypes,
    selectedCountries,
    deadlineSoonOnly,
  ]);

  const activeCount =
    scopes.filter((sc) => selectedScopes[sc]).length +
    levels.filter((l) => selectedLevels[l]).length +
    providerTypes.filter((p) => selectedProviderTypes[p]).length +
    fundingTypes.filter((f) => selectedFundingTypes[f]).length +
    countries.filter((c) => selectedCountries[c]).length +
    (deadlineSoonOnly ? 1 : 0);

  function reset() {
    setSelectedScopes(allFalse(scopes));
    setSelectedLevels(allFalse(levels));
    setSelectedProviderTypes(allFalse(providerTypes));
    setSelectedFundingTypes(allFalse(fundingTypes));
    setSelectedCountries(allFalse(countries));
    setDeadlineSoonOnly(false);
  }

  const sidebarProps = {
    scopes,
    selectedScopes,
    onToggleScope: (sc: Scope) => setSelectedScopes((s) => ({ ...s, [sc]: !s[sc] })),
    levels,
    selectedLevels,
    onToggleLevel: (l: EducationLevel) => setSelectedLevels((s) => ({ ...s, [l]: !s[l] })),
    providerTypes,
    selectedProviderTypes,
    onToggleProviderType: (p: ProviderType) => setSelectedProviderTypes((s) => ({ ...s, [p]: !s[p] })),
    fundingTypes,
    selectedFundingTypes,
    onToggleFundingType: (f: FundingType) => setSelectedFundingTypes((s) => ({ ...s, [f]: !s[f] })),
    countries,
    selectedCountries,
    onToggleCountry: (c: string) => setSelectedCountries((s) => ({ ...s, [c]: !s[c] })),
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
            {query ? `Results for "${query}"` : emptyLabel}
          </h2>
          <span className="text-sm text-textMuted dark:text-textMuted2">
            {filtered.length} scholarship{filtered.length === 1 ? "" : "s"}
          </span>
        </div>

        {scholarships.length === 0 ? (
          <p className="rounded-xl2 border border-dashed border-border dark:border-border2 p-8 text-center text-textMuted dark:text-textMuted2">
            {noMatchText}
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

"use client";

import { EducationLevel, EDUCATION_LEVELS, FundingType, FUNDING_TYPES, ProviderType, PROVIDER_TYPES, Scope, SCOPES } from "@dreamworkabroad/shared";

export interface FilterSidebarProps {
  scopes: Scope[];
  selectedScopes: Record<Scope, boolean>;
  onToggleScope: (scope: Scope) => void;
  levels: EducationLevel[];
  selectedLevels: Record<EducationLevel, boolean>;
  onToggleLevel: (level: EducationLevel) => void;
  providerTypes: ProviderType[];
  selectedProviderTypes: Record<ProviderType, boolean>;
  onToggleProviderType: (providerType: ProviderType) => void;
  fundingTypes: FundingType[];
  selectedFundingTypes: Record<FundingType, boolean>;
  onToggleFundingType: (fundingType: FundingType) => void;
  countries: string[];
  selectedCountries: Record<string, boolean>;
  onToggleCountry: (country: string) => void;
  deadlineSoonOnly: boolean;
  onToggleDeadlineSoonOnly: () => void;
  onReset: () => void;
  activeCount: number;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border dark:border-border2 py-4 first:border-t-0 first:pt-0">
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-textMuted2">{title}</p>
      {children}
    </div>
  );
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-text dark:text-text2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-primary dark:accent-primary2"
      />
      {label}
    </label>
  );
}

// Every facet here — including Provider type and Funding type — only lists
// values actually present in the current result set (same pattern Scope and
// Destination already used). A checkbox for a value with zero matching
// scholarships is a dead filter: it looks like an option but can never
// change the results. "Private" under Provider type was exactly this after
// every Malaysian private university got reclassified to "university" and
// CIMB Foundation to "foundation" — nothing published carries
// providerType:"private" anymore, so the checkbox always returned zero
// results. Deriving from data instead of the full enum fixes that instance
// and prevents the same dead-filter problem for any other facet/value
// combination (e.g. "professional" under Education level, or
// "living-allowance-only" under Funding type — currently also empty).
export default function FilterSidebar({
  scopes,
  selectedScopes,
  onToggleScope,
  levels,
  selectedLevels,
  onToggleLevel,
  providerTypes,
  selectedProviderTypes,
  onToggleProviderType,
  fundingTypes,
  selectedFundingTypes,
  onToggleFundingType,
  countries,
  selectedCountries,
  onToggleCountry,
  deadlineSoonOnly,
  onToggleDeadlineSoonOnly,
  onReset,
  activeCount,
}: FilterSidebarProps) {
  return (
    <div className="rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-4">
      <div className="flex items-center justify-between pb-1">
        <p className="font-semibold text-text dark:text-text2">Filters</p>
        {activeCount > 0 && (
          <button onClick={onReset} className="text-xs font-medium text-primary hover:underline dark:text-primary2">
            Reset ({activeCount})
          </button>
        )}
      </div>

      <Section title="Show">
        <Checkbox checked={deadlineSoonOnly} onChange={onToggleDeadlineSoonOnly} label="Deadline within 30 days" />
      </Section>

      {scopes.length > 1 && (
        <Section title="Scope">
          {scopes.map((sc) => (
            <Checkbox
              key={sc}
              checked={selectedScopes[sc]}
              onChange={() => onToggleScope(sc)}
              label={SCOPES[sc].label}
            />
          ))}
        </Section>
      )}

      {levels.length > 0 && (
        <Section title="Education level">
          {levels.map((level) => (
            <Checkbox
              key={level}
              checked={selectedLevels[level]}
              onChange={() => onToggleLevel(level)}
              label={EDUCATION_LEVELS[level].label}
            />
          ))}
        </Section>
      )}

      {providerTypes.length > 1 && (
        <Section title="Provider type">
          {providerTypes.map((pt) => (
            <Checkbox
              key={pt}
              checked={selectedProviderTypes[pt]}
              onChange={() => onToggleProviderType(pt)}
              label={
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PROVIDER_TYPES[pt].badgeColor }} />
                  {PROVIDER_TYPES[pt].label}
                </span>
              }
            />
          ))}
        </Section>
      )}

      {fundingTypes.length > 1 && (
        <Section title="Funding type">
          {fundingTypes.map((ft) => (
            <Checkbox
              key={ft}
              checked={selectedFundingTypes[ft]}
              onChange={() => onToggleFundingType(ft)}
              label={FUNDING_TYPES[ft].label}
            />
          ))}
        </Section>
      )}

      {countries.length > 1 && (
        <Section title="Destination">
          {countries.map((c) => (
            <Checkbox key={c} checked={!!selectedCountries[c]} onChange={() => onToggleCountry(c)} label={c} />
          ))}
        </Section>
      )}
    </div>
  );
}

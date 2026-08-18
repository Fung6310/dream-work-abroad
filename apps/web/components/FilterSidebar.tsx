"use client";

import {
  EducationLevel,
  EDUCATION_LEVELS,
  FundingType,
  FUNDING_TYPES,
  ProviderType,
  PROVIDER_TYPES,
  Scope,
  SCOPES,
} from "@dreamworkabroad/shared";

export interface FilterSidebarProps {
  scopes: Scope[];
  selectedScopes: Record<Scope, boolean>;
  onToggleScope: (scope: Scope) => void;
  levels: Record<EducationLevel, boolean>;
  onToggleLevel: (level: EducationLevel) => void;
  providerTypes: Record<ProviderType, boolean>;
  onToggleProviderType: (providerType: ProviderType) => void;
  fundingTypes: Record<FundingType, boolean>;
  onToggleFundingType: (fundingType: FundingType) => void;
  countries: string[];
  selectedCountries: Record<string, boolean>;
  onToggleCountry: (country: string) => void;
  deadlineSoonOnly: boolean;
  onToggleDeadlineSoonOnly: () => void;
  onReset: () => void;
  activeCount: number;
}

const ALL_LEVELS = Object.values(EDUCATION_LEVELS).sort((a, b) => a.order - b.order);
const ALL_PROVIDER_TYPES = Object.values(PROVIDER_TYPES);
const ALL_FUNDING_TYPES = Object.values(FUNDING_TYPES);

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

export default function FilterSidebar({
  scopes,
  selectedScopes,
  onToggleScope,
  levels,
  onToggleLevel,
  providerTypes,
  onToggleProviderType,
  fundingTypes,
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

      <Section title="Education level">
        {ALL_LEVELS.map((level) => (
          <Checkbox
            key={level.id}
            checked={levels[level.id]}
            onChange={() => onToggleLevel(level.id)}
            label={level.label}
          />
        ))}
      </Section>

      <Section title="Provider type">
        {ALL_PROVIDER_TYPES.map((pt) => (
          <Checkbox
            key={pt.id}
            checked={providerTypes[pt.id]}
            onChange={() => onToggleProviderType(pt.id)}
            label={
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: pt.badgeColor }} />
                {pt.label}
              </span>
            }
          />
        ))}
      </Section>

      <Section title="Funding type">
        {ALL_FUNDING_TYPES.map((ft) => (
          <Checkbox
            key={ft.id}
            checked={fundingTypes[ft.id]}
            onChange={() => onToggleFundingType(ft.id)}
            label={ft.label}
          />
        ))}
      </Section>

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

"use client";

import { useEffect, useState } from "react";
import {
  EducationLevel,
  EDUCATION_LEVELS,
  FundingType,
  FUNDING_TYPES,
  Scholarship,
  Scope,
  SCOPES,
  sortByDeadline,
  sortFeaturedFirst,
} from "@dreamworkabroad/shared";
import { searchScholarships } from "@/lib/api";
import ScholarshipCard from "./ScholarshipCard";

interface Profile {
  level: EducationLevel;
  fieldOfStudy: string;
  scopes: Scope[];
  fundingType: FundingType | "any";
}

const STORAGE_KEY = "dwa_profile";
const ALL_LEVELS = Object.values(EDUCATION_LEVELS).sort((a, b) => a.order - b.order);
const ALL_SCOPES = Object.values(SCOPES);
const ALL_FUNDING_TYPES = Object.values(FUNDING_TYPES);

function defaultProfile(): Profile {
  return { level: "undergraduate", fieldOfStudy: "", scopes: ["malaysia", "international"], fundingType: "any" };
}

export default function MatchExperience() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [results, setResults] = useState<Scholarship[]>([]);

  // Pre-fill from a previous visit, if any.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setProfile({ ...defaultProfile(), ...JSON.parse(saved) });
    } catch {
      // ignore malformed/blocked storage
    }
  }, []);

  function toggleScope(scope: Scope) {
    setProfile((p) => ({
      ...p,
      scopes: p.scopes.includes(scope) ? p.scopes.filter((s) => s !== scope) : [...p.scopes, scope],
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
    setStatus("loading");
    const { scholarships } = await searchScholarships({
      level: profile.level,
      scope: profile.scopes.length > 0 ? profile.scopes : undefined,
      field: profile.fieldOfStudy || undefined,
      fundingType: profile.fundingType === "any" ? undefined : profile.fundingType,
    });
    setResults(sortFeaturedFirst(sortByDeadline(scholarships)));
    setStatus("done");
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={onSubmit}
        className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-text dark:text-text2">
            What level are you applying for?
          </label>
          <select
            value={profile.level}
            onChange={(e) => setProfile((p) => ({ ...p, level: e.target.value as EducationLevel }))}
            className="w-full rounded-lg border border-border dark:border-border2 bg-bg dark:bg-bg2 px-3 py-2 text-sm text-text dark:text-text2 outline-none focus:ring-2 focus:ring-primary"
          >
            {ALL_LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text dark:text-text2">
            Field of study (optional)
          </label>
          <input
            type="text"
            value={profile.fieldOfStudy}
            onChange={(e) => setProfile((p) => ({ ...p, fieldOfStudy: e.target.value }))}
            placeholder="e.g. Engineering, Business, Medicine — leave blank for any field"
            className="w-full rounded-lg border border-border dark:border-border2 bg-bg dark:bg-bg2 px-3 py-2 text-sm text-text dark:text-text2 outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text dark:text-text2">Where would you consider studying?</label>
          <div className="flex flex-wrap gap-3">
            {ALL_SCOPES.map((sc) => (
              <label key={sc.id} className="flex items-center gap-1.5 text-sm text-text dark:text-text2">
                <input
                  type="checkbox"
                  checked={profile.scopes.includes(sc.id)}
                  onChange={() => toggleScope(sc.id)}
                  className="h-4 w-4 accent-primary dark:accent-primary2"
                />
                {sc.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text dark:text-text2">Funding preference</label>
          <select
            value={profile.fundingType}
            onChange={(e) => setProfile((p) => ({ ...p, fundingType: e.target.value as FundingType | "any" }))}
            className="w-full rounded-lg border border-border dark:border-border2 bg-bg dark:bg-bg2 px-3 py-2 text-sm text-text dark:text-text2 outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="any">Any</option>
            {ALL_FUNDING_TYPES.map((ft) => (
              <option key={ft.id} value={ft.id}>
                {ft.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={profile.scopes.length === 0}
          className="mt-1 rounded-xl2 bg-primary px-5 py-2.5 font-medium text-white hover:bg-primaryDark disabled:opacity-50 dark:bg-primary2 dark:text-bg2 dark:hover:bg-primaryLight transition-colors"
        >
          {status === "loading" ? "Finding matches…" : "Find my scholarships"}
        </button>
        <p className="text-xs text-textMuted dark:text-textMuted2">
          This narrows the catalogue to scholarships open to your education level, field and preferred region — it
          does not check citizenship, grades or other fine-print requirements. Always read the Eligibility section
          on each result.
        </p>
      </form>

      {status === "done" && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text dark:text-text2">Scholarships you may qualify for</h2>
            <span className="text-sm text-textMuted dark:text-textMuted2">
              {results.length} scholarship{results.length === 1 ? "" : "s"}
            </span>
          </div>

          {results.length === 0 ? (
            <div className="rounded-xl2 border border-dashed border-border dark:border-border2 p-8 text-center text-textMuted dark:text-textMuted2">
              No scholarships match that combination yet — try broadening the field of study or funding
              preference.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((s) => (
                <ScholarshipCard key={s.id} scholarship={s} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

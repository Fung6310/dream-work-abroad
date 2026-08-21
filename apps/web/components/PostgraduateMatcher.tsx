"use client";

import { useState } from "react";
import {
  EducationLevel,
  FundingType,
  FUNDING_TYPES,
  meetsMinWorkExperience,
  Scholarship,
  Scope,
  SCOPES,
  sortByDeadline,
  sortFeaturedFirst,
} from "@dreamworkabroad/shared";
import { searchScholarships } from "@/lib/api";
import ScholarshipCard from "./ScholarshipCard";

type DegreeClass =
  | "first-class"
  | "second-upper"
  | "second-lower"
  | "third-pass"
  | "not-yet-completed";

const DEGREE_CLASSES: { id: DegreeClass; label: string }[] = [
  { id: "first-class", label: "First Class / CGPA 3.67+" },
  { id: "second-upper", label: "Second Class Upper / CGPA 3.00–3.66" },
  { id: "second-lower", label: "Second Class Lower / CGPA 2.00–2.99" },
  { id: "third-pass", label: "Third Class / Pass" },
  { id: "not-yet-completed", label: "Not yet completed" },
];

// Soft, generic advisory only — never a hard filter. No reliably-verified
// per-scholarship GPA cutoff exists for most of the catalogue, so asserting
// one would be fabricating data (see docs/ARCHITECTURE.md's anti-fabrication
// principle). Work experience is different: meetsMinWorkExperience() only
// ever hard-filters on years that were individually verified per scholarship
// (Chevening, Australia Awards) and always passes when nothing is documented.
function advisoryFor(degreeClass: DegreeClass): string {
  if (degreeClass === "third-pass" || degreeClass === "not-yet-completed") {
    return "Most master's scholarships expect at least a Second Class Upper (roughly CGPA 3.0) bachelor's degree, and some highly competitive government/GLC awards look for First Class. Exact cutoffs vary by scholarship and year and aren't reliably published for all of them — always confirm on the official site.";
  }
  return "We don't filter results by degree classification — exact cutoffs vary by scholarship and year. Always confirm the specific requirement on each listing's official site.";
}

const LEVEL_OPTIONS: { id: EducationLevel; label: string }[] = [
  { id: "postgraduate", label: "Master's" },
  { id: "phd", label: "PhD / Doctorate" },
];
const ALL_SCOPES = Object.values(SCOPES);
const ALL_FUNDING_TYPES = Object.values(FUNDING_TYPES);

export default function PostgraduateMatcher() {
  const [levels, setLevels] = useState<EducationLevel[]>(["postgraduate", "phd"]);
  const [degreeClass, setDegreeClass] = useState<DegreeClass>("second-upper");
  const [workExperienceYears, setWorkExperienceYears] = useState(0);
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [scopes, setScopes] = useState<Scope[]>(["malaysia", "international"]);
  const [fundingType, setFundingType] = useState<FundingType | "any">("any");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [results, setResults] = useState<Scholarship[]>([]);

  function toggleLevel(level: EducationLevel) {
    setLevels((l) => (l.includes(level) ? l.filter((x) => x !== level) : [...l, level]));
  }

  function toggleScope(scope: Scope) {
    setScopes((s) => (s.includes(scope) ? s.filter((x) => x !== scope) : [...s, scope]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const { scholarships } = await searchScholarships({
      level: levels.length > 0 ? levels : undefined,
      scope: scopes.length > 0 ? scopes : undefined,
      field: fieldOfStudy || undefined,
      fundingType: fundingType === "any" ? undefined : fundingType,
    });
    // Work-experience is the one genuinely verified hard filter here — see
    // meetsMinWorkExperience's doc comment for why undefined always passes.
    const matches = scholarships.filter((s) => meetsMinWorkExperience(s, workExperienceYears));
    setResults(sortFeaturedFirst(sortByDeadline(matches)));
    setStatus("done");
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={onSubmit}
        className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-text dark:text-text2">Which level?</label>
          <div className="flex flex-wrap gap-3">
            {LEVEL_OPTIONS.map((l) => (
              <label key={l.id} className="flex items-center gap-1.5 text-sm text-text dark:text-text2">
                <input
                  type="checkbox"
                  checked={levels.includes(l.id)}
                  onChange={() => toggleLevel(l.id)}
                  className="h-4 w-4 accent-primary dark:accent-primary2"
                />
                {l.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text dark:text-text2">
            Your bachelor's degree result
          </label>
          <select
            value={degreeClass}
            onChange={(e) => setDegreeClass(e.target.value as DegreeClass)}
            className="w-full rounded-lg border border-border dark:border-border2 bg-bg dark:bg-bg2 px-3 py-2 text-sm text-text dark:text-text2 outline-none focus:ring-2 focus:ring-primary"
          >
            {DEGREE_CLASSES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-textMuted dark:text-textMuted2">{advisoryFor(degreeClass)}</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text dark:text-text2">
            Years of full-time work experience
          </label>
          <input
            type="number"
            min={0}
            max={50}
            value={workExperienceYears}
            onChange={(e) => setWorkExperienceYears(Math.max(0, Number(e.target.value) || 0))}
            className="w-full rounded-lg border border-border dark:border-border2 bg-bg dark:bg-bg2 px-3 py-2 text-sm text-text dark:text-text2 outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="mt-1.5 text-xs text-textMuted dark:text-textMuted2">
            A small number of scholarships (e.g. Chevening, Australia Awards) have a verified minimum — enter 0 if
            you have none yet. Scholarships with no documented minimum are never excluded on this basis.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text dark:text-text2">
            Field of study (optional)
          </label>
          <input
            type="text"
            value={fieldOfStudy}
            onChange={(e) => setFieldOfStudy(e.target.value)}
            placeholder="e.g. Engineering, Business, Public Policy — leave blank for any field"
            className="w-full rounded-lg border border-border dark:border-border2 bg-bg dark:bg-bg2 px-3 py-2 text-sm text-text dark:text-text2 outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text dark:text-text2">
            Where would you consider studying?
          </label>
          <div className="flex flex-wrap gap-3">
            {ALL_SCOPES.map((sc) => (
              <label key={sc.id} className="flex items-center gap-1.5 text-sm text-text dark:text-text2">
                <input
                  type="checkbox"
                  checked={scopes.includes(sc.id)}
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
            value={fundingType}
            onChange={(e) => setFundingType(e.target.value as FundingType | "any")}
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
          disabled={scopes.length === 0 || levels.length === 0}
          className="mt-1 rounded-xl2 bg-primary px-5 py-2.5 font-medium text-white hover:bg-primaryDark disabled:opacity-50 dark:bg-primary2 dark:text-bg2 dark:hover:bg-primaryLight transition-colors"
        >
          {status === "loading" ? "Finding matches…" : "Find my scholarships"}
        </button>
        <p className="text-xs text-textMuted dark:text-textMuted2">
          This narrows the catalogue to scholarships open to your level, field, region and (where a minimum is
          verified) work experience — it does not check citizenship, grades or other fine-print requirements.
          Always read the Eligibility section on each result.
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
              No scholarships match that combination yet — try broadening the field of study, funding preference,
              region, or work experience.
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

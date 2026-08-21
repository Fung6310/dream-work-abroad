"use client";

import { useState } from "react";
import {
  EducationLevel,
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

// Malaysia's own pre-tertiary qualifications don't map 1:1 onto a single
// "level" the way a foreign system might — see docs/ARCHITECTURE.md for the
// research behind this tiering. The key subtlety: several Malaysian
// government/GLC scholarships tagged educationLevel:"undergraduate" (JPA,
// Petronas PESP, Khazanah GUP, MARA, etc.) are explicitly built to take fresh
// SPM leavers straight in, bundling a foundation/matriculation/pre-university
// year into the award itself. So "fresh SPM leaver" must NOT be narrowed to
// diploma-only — it should see the full diploma+undergraduate set, same as
// someone who already finished pre-university. Only the pre-university/
// diploma-holder tiers narrow away from diploma-level programmes, since
// they've already passed that stage.
type QualificationTier = "spm" | "pre-university" | "diploma-holder";

interface TierInfo {
  id: QualificationTier;
  label: string;
  equivalents: string;
  levels: EducationLevel[];
  note: string;
}

const TIERS: TierInfo[] = [
  {
    id: "spm",
    label: "SPM or equivalent (fresh school leaver)",
    equivalents:
      "SPM, O-Level, IGCSE, GCE O-Level, or UEC Junior Middle 3",
    levels: ["diploma", "undergraduate"],
    note:
      "Several Malaysian government/GLC scholarships shown below (e.g. JPA, MARA, Petronas, Khazanah-type awards) accept fresh SPM leavers directly and bundle a foundation or pre-university year into the sponsorship — that's why undergraduate-level programmes still appear here, not just diplomas. Always check each listing's General entry requirements for the specific route.",
  },
  {
    id: "pre-university",
    label: "Pre-university completed",
    equivalents:
      "STPM, A-Level, Foundation, Matriculation, AUSMAT, SAM, Canadian Pre-University (CPU), IB, or UEC Senior Middle 3",
    levels: ["undergraduate"],
    note: "Showing bachelor's degree scholarships you can apply to directly.",
  },
  {
    id: "diploma-holder",
    label: "Diploma completed (or completing)",
    equivalents: "Any recognised diploma, used for advanced-standing entry into a bachelor's degree",
    levels: ["undergraduate"],
    note: "Showing bachelor's degree scholarships you can apply to directly with advanced standing from your diploma.",
  },
];

const ALL_SCOPES = Object.values(SCOPES);
const ALL_FUNDING_TYPES = Object.values(FUNDING_TYPES);

export default function UndergraduateMatcher() {
  const [tier, setTier] = useState<QualificationTier>("spm");
  const [spmResult, setSpmResult] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [scopes, setScopes] = useState<Scope[]>(["malaysia", "international"]);
  const [fundingType, setFundingType] = useState<FundingType | "any">("any");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [results, setResults] = useState<Scholarship[]>([]);

  const activeTier = TIERS.find((t) => t.id === tier)!;

  function toggleScope(scope: Scope) {
    setScopes((s) => (s.includes(scope) ? s.filter((x) => x !== scope) : [...s, scope]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const { scholarships } = await searchScholarships({
      level: activeTier.levels,
      scope: scopes.length > 0 ? scopes : undefined,
      field: fieldOfStudy || undefined,
      fundingType: fundingType === "any" ? undefined : fundingType,
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
            What's your highest qualification so far?
          </label>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as QualificationTier)}
            className="w-full rounded-lg border border-border dark:border-border2 bg-bg dark:bg-bg2 px-3 py-2 text-sm text-text dark:text-text2 outline-none focus:ring-2 focus:ring-primary"
          >
            {TIERS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-textMuted dark:text-textMuted2">
            Equivalent to: {activeTier.equivalents}
          </p>
        </div>

        {tier === "spm" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-text dark:text-text2">
              SPM result summary (optional)
            </label>
            <input
              type="text"
              value={spmResult}
              onChange={(e) => setSpmResult(e.target.value)}
              placeholder="e.g. 8A's, or your equivalent result summary"
              className="w-full rounded-lg border border-border dark:border-border2 bg-bg dark:bg-bg2 px-3 py-2 text-sm text-text dark:text-text2 outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1.5 text-xs text-textMuted dark:text-textMuted2">
              We don't filter by grades — exact cutoffs vary by scholarship and year, and aren't reliably published
              for all of them. As a rule of thumb, the most competitive government/GLC scholarships (JPA, MARA,
              Petronas, Khazanah-type awards) typically expect excellent results, often close to straight A's.
              Always confirm the exact requirement on the official site.
            </p>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-text dark:text-text2">
            Field of study (optional)
          </label>
          <input
            type="text"
            value={fieldOfStudy}
            onChange={(e) => setFieldOfStudy(e.target.value)}
            placeholder="e.g. Engineering, Business, Medicine — leave blank for any field"
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
          disabled={scopes.length === 0}
          className="mt-1 rounded-xl2 bg-primary px-5 py-2.5 font-medium text-white hover:bg-primaryDark disabled:opacity-50 dark:bg-primary2 dark:text-bg2 dark:hover:bg-primaryLight transition-colors"
        >
          {status === "loading" ? "Finding matches…" : "Find my scholarships"}
        </button>
        <p className="text-xs text-textMuted dark:text-textMuted2">{activeTier.note}</p>
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
              or region.
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

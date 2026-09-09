"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { EducationLevel, Scope, SCOPES } from "@dreamworkabroad/shared";
import { FIELDS_OF_STUDY } from "@/lib/fieldsOfStudy";
import QuizProgress from "./QuizProgress";

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
    equivalents: "SPM, O-Level, IGCSE, GCE O-Level, or UEC Junior Middle 3",
    levels: ["diploma", "undergraduate"],
    note:
      "Several Malaysian government/GLC scholarships shown below (e.g. JPA, MARA, Petronas, Khazanah-type awards) accept fresh SPM leavers directly and bundle a foundation or pre-university year into the sponsorship — that's why undergraduate-level programmes still appear here, not just diplomas. Always check each listing's General entry requirements for the specific route.",
  },
  {
    id: "pre-university",
    label: "Pre-university completed",
    equivalents: "STPM, A-Level, Foundation, Matriculation, AUSMAT, SAM, Canadian Pre-University (CPU), IB, or UEC Senior Middle 3",
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

type StepKind = "tier" | "spmResult" | "field" | "region";

// A quiz, not a form — one question at a time (see docs/ARCHITECTURE.md for
// why: direct request, modelled on imperial-dreamwork.com's "7 quick
// questions" eligibility check). Still a pure input step — see
// docs/ARCHITECTURE.md's filter/results split for why it navigates to
// /undergraduate/results on the final step instead of rendering inline.
export default function UndergraduateMatcher() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [tier, setTier] = useState<QualificationTier>("spm");
  const [spmResult, setSpmResult] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [scopes, setScopes] = useState<Scope[]>(["malaysia", "international"]);

  const activeTier = TIERS.find((t) => t.id === tier)!;

  // The SPM-result step only applies to the "spm" tier — everyone else skips
  // straight from tier to field of study. Recomputed from `tier`, so
  // stepIndex (which only ever advances while tier is still on-screen at
  // step 0) always stays a valid index into this.
  const steps: StepKind[] = useMemo(() => {
    const s: StepKind[] = ["tier"];
    if (tier === "spm") s.push("spmResult");
    s.push("field", "region");
    return s;
  }, [tier]);

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  function toggleScope(scope: Scope) {
    setScopes((s) => (s.includes(scope) ? s.filter((x) => x !== scope) : [...s, scope]));
  }

  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function goNext(e: React.FormEvent) {
    e.preventDefault();
    if (!isLastStep) {
      setStepIndex((i) => Math.min(steps.length - 1, i + 1));
      return;
    }
    const params = new URLSearchParams();
    params.set("tier", tier);
    for (const level of activeTier.levels) params.append("level", level);
    for (const scope of scopes) params.append("scope", scope);
    if (fieldOfStudy) params.set("field", fieldOfStudy);
    router.push(`/undergraduate/results?${params.toString()}`);
  }

  return (
    <form
      onSubmit={goNext}
      className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-6"
    >
      <QuizProgress step={stepIndex + 1} total={steps.length} />

      <div key={currentStep} className="animate-quiz-step flex min-h-[9rem] flex-col gap-4">
        {currentStep === "tier" && (
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
        )}

        {currentStep === "spmResult" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-text dark:text-text2">
              SPM result summary (optional)
            </label>
            <input
              type="text"
              autoFocus
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

        {currentStep === "field" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-text dark:text-text2">Field of study</label>
            <select
              value={fieldOfStudy}
              onChange={(e) => setFieldOfStudy(e.target.value)}
              className="w-full rounded-lg border border-border dark:border-border2 bg-bg dark:bg-bg2 px-3 py-2 text-sm text-text dark:text-text2 outline-none focus:ring-2 focus:ring-primary"
            >
              {FIELDS_OF_STUDY.map((f) => (
                <option key={f.value || "any"} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {currentStep === "region" && (
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
            <p className="mt-1.5 text-xs text-textMuted dark:text-textMuted2">{activeTier.note}</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={goBack}
            className="rounded-xl2 border border-border px-5 py-2.5 font-medium text-text transition-colors hover:border-primary dark:border-border2 dark:text-text2 dark:hover:border-primary2"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={isLastStep && scopes.length === 0}
          className="flex-1 rounded-xl2 bg-primary px-5 py-2.5 font-medium text-white shadow-sm transition-all hover:scale-[1.02] hover:bg-primaryDark hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 dark:bg-primary2 dark:text-bg2 dark:hover:bg-primaryLight"
        >
          {isLastStep ? "Search" : "Next →"}
        </button>
      </div>
    </form>
  );
}

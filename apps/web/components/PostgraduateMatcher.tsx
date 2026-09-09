"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EducationLevel, Scope, SCOPES } from "@dreamworkabroad/shared";
import { FIELDS_OF_STUDY } from "@/lib/fieldsOfStudy";
import QuizProgress from "./QuizProgress";

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

const STEPS = ["level", "degree", "experience", "field", "region"] as const;
type StepKind = (typeof STEPS)[number];

// A quiz, not a form — one question at a time. See UndergraduateMatcher.tsx
// for the same pattern and the reasoning behind it (direct request, modelled
// on imperial-dreamwork.com's "7 quick questions" eligibility check).
export default function PostgraduateMatcher() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [levels, setLevels] = useState<EducationLevel[]>(["postgraduate", "phd"]);
  const [degreeClass, setDegreeClass] = useState<DegreeClass>("second-upper");
  const [workExperienceYears, setWorkExperienceYears] = useState(0);
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [scopes, setScopes] = useState<Scope[]>(["malaysia", "international"]);

  const currentStep: StepKind = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  function toggleLevel(level: EducationLevel) {
    setLevels((l) => (l.includes(level) ? l.filter((x) => x !== level) : [...l, level]));
  }

  function toggleScope(scope: Scope) {
    setScopes((s) => (s.includes(scope) ? s.filter((x) => x !== scope) : [...s, scope]));
  }

  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function goNext(e: React.FormEvent) {
    e.preventDefault();
    if (!isLastStep) {
      setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
      return;
    }
    const params = new URLSearchParams();
    for (const level of levels) params.append("level", level);
    for (const scope of scopes) params.append("scope", scope);
    if (fieldOfStudy) params.set("field", fieldOfStudy);
    params.set("workExperience", String(workExperienceYears));
    router.push(`/postgraduate/results?${params.toString()}`);
  }

  const canAdvance = currentStep !== "level" || levels.length > 0;

  return (
    <form
      onSubmit={goNext}
      className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-6"
    >
      <QuizProgress step={stepIndex + 1} total={STEPS.length} />

      <div key={currentStep} className="animate-quiz-step flex min-h-[9rem] flex-col gap-4">
        {currentStep === "level" && (
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
        )}

        {currentStep === "degree" && (
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
        )}

        {currentStep === "experience" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-text dark:text-text2">
              Years of full-time work experience
            </label>
            <input
              type="number"
              autoFocus
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
            <p className="mt-1.5 text-xs text-textMuted dark:text-textMuted2">
              This narrows the catalogue to scholarships open to your level, field, region and (where a minimum is
              verified) work experience — it does not check citizenship, grades or other fine-print requirements.
              Always read the Eligibility section on each result.
            </p>
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
          disabled={!canAdvance || (isLastStep && scopes.length === 0)}
          className="flex-1 rounded-xl2 bg-primary px-5 py-2.5 font-medium text-white shadow-sm transition-all hover:scale-[1.02] hover:bg-primaryDark hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 dark:bg-primary2 dark:text-bg2 dark:hover:bg-primaryLight"
        >
          {isLastStep ? "Search" : "Next →"}
        </button>
      </div>
    </form>
  );
}

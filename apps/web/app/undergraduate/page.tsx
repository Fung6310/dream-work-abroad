import type { Metadata } from "next";
import UndergraduateMatcher from "@/components/UndergraduateMatcher";

export const metadata: Metadata = {
  title: "Undergraduate Scholarships (Diploma & Bachelor's) — DreamWorkAbroad",
  description:
    "Diploma and bachelor's degree scholarships for Malaysian students — Malaysia and international, plus a matcher based on your SPM or equivalent qualification.",
};

// Filter-only page — deliberately no results grid here. Submitting the
// matcher redirects to /undergraduate/results, which shows only the matched
// list with no filter UI of its own (see UndergraduateMatcher.tsx for why).
export default function UndergraduatePage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col items-center gap-3 py-4 text-center">
        <h1 className="text-3xl font-bold text-text dark:text-text2">Undergraduate Scholarships</h1>
        <p className="max-w-xl text-textMuted dark:text-textMuted2">
          Diploma and bachelor's degree scholarships for Malaysian students, from Malaysian government/GLC/private
          providers and international awards. Tell us your SPM (or equivalent) result and field of study to see
          your best matches.
        </p>
      </section>

      <UndergraduateMatcher />
    </div>
  );
}

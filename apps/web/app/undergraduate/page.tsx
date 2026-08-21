import type { Metadata } from "next";
import SearchResults from "@/components/SearchResults";
import UndergraduateMatcher from "@/components/UndergraduateMatcher";
import { searchScholarships } from "@/lib/api";

export const metadata: Metadata = {
  title: "Undergraduate Scholarships (Diploma & Bachelor's) — DreamWorkAbroad",
  description:
    "Diploma and bachelor's degree scholarships for Malaysian students — Malaysia and international, plus a matcher based on your SPM or equivalent qualification.",
};

// Diploma + Bachelor's degree levels only — Master's/PhD live on /postgraduate.
export default async function UndergraduatePage() {
  const { scholarships } = await searchScholarships({ level: ["diploma", "undergraduate"] });

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col items-center gap-3 py-4 text-center">
        <h1 className="text-3xl font-bold text-text dark:text-text2">Undergraduate Scholarships</h1>
        <p className="max-w-xl text-textMuted dark:text-textMuted2">
          Diploma and bachelor's degree scholarships for Malaysian students, from Malaysian government/GLC/private
          providers and international awards. Tell us your SPM (or equivalent) result to see the best fit, or
          browse the full list and filter by Malaysia/International below.
        </p>
      </section>

      <UndergraduateMatcher />

      <SearchResults
        key="undergraduate"
        scholarships={scholarships}
        query=""
        emptyLabel="All undergraduate scholarships"
        noMatchText="No undergraduate scholarships match yet — try a broader search."
      />
    </div>
  );
}

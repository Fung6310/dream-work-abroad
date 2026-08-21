import type { Metadata } from "next";
import PostgraduateMatcher from "@/components/PostgraduateMatcher";
import SearchResults from "@/components/SearchResults";
import { searchScholarships } from "@/lib/api";

export const metadata: Metadata = {
  title: "Postgraduate Scholarships (Master's & PhD) — DreamWorkAbroad",
  description:
    "Master's and PhD scholarships for Malaysian students — Malaysia and international, plus a matcher based on your bachelor's degree result and work experience.",
};

// Master's + PhD levels only — Diploma/Bachelor's live on /undergraduate.
export default async function PostgraduatePage() {
  const { scholarships } = await searchScholarships({ level: ["postgraduate", "phd"] });

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col items-center gap-3 py-4 text-center">
        <h1 className="text-3xl font-bold text-text dark:text-text2">Postgraduate Scholarships</h1>
        <p className="max-w-xl text-textMuted dark:text-textMuted2">
          Master's and PhD scholarships for Malaysian students, from Malaysian government/GLC/university providers
          and international awards. Tell us your bachelor's result and work experience to see the best fit, or
          browse the full list and filter by Malaysia/International below.
        </p>
      </section>

      <PostgraduateMatcher />

      <SearchResults
        key="postgraduate"
        scholarships={scholarships}
        query=""
        emptyLabel="All postgraduate scholarships"
        noMatchText="No postgraduate scholarships match yet — try a broader search."
      />
    </div>
  );
}

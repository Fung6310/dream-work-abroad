import type { Metadata } from "next";
import PostgraduateMatcher from "@/components/PostgraduateMatcher";

export const metadata: Metadata = {
  title: "Postgraduate Scholarships (Master's & PhD) — DreamWorkAbroad",
  description:
    "Master's and PhD scholarships for Malaysian students — Malaysia and international, plus a matcher based on your bachelor's degree result and work experience.",
};

// Filter-only page — deliberately no results grid here. Submitting the
// matcher redirects to /postgraduate/results, which shows only the matched
// list with no filter UI of its own (see PostgraduateMatcher.tsx for why).
export default function PostgraduatePage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col items-center gap-3 py-4 text-center">
        <h1 className="text-3xl font-bold text-text dark:text-text2">Postgraduate Scholarships</h1>
        <p className="max-w-xl text-textMuted dark:text-textMuted2">
          Master's and PhD scholarships for Malaysian students, from Malaysian government/GLC/university providers
          and international awards. Tell us your bachelor's result, field of study, and work experience to see
          your best matches.
        </p>
      </section>

      <PostgraduateMatcher />
    </div>
  );
}

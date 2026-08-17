import type { Metadata } from "next";
import MatchExperience from "@/components/MatchExperience";

export const metadata: Metadata = {
  title: "Find My Scholarships — DreamWorkAbroad",
  description:
    "Enter your education level, field of study and preferred region once, and only see scholarships that actually apply to you.",
};

export default function MatchPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col items-center gap-2 py-4 text-center">
        <h1 className="text-3xl font-bold text-text dark:text-text2">🎯 Find my scholarships</h1>
        <p className="max-w-xl text-textMuted dark:text-textMuted2">
          Tell us your education level, field and where you&apos;d study — we&apos;ll only show scholarships open
          to that combination, instead of the full catalogue.
        </p>
      </section>
      <MatchExperience />
    </div>
  );
}

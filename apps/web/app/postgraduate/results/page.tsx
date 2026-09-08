import type { Metadata } from "next";
import Link from "next/link";
import {
  EducationLevel,
  meetsMinWorkExperience,
  Scope,
  sortByDeadline,
  sortFeaturedFirst,
} from "@dreamworkabroad/shared";
import ScholarshipCard from "@/components/ScholarshipCard";
import { searchScholarships } from "@/lib/api";

export const metadata: Metadata = {
  title: "Your matched postgraduate scholarships — DreamWorkAbroad",
};

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

// Results-only — see PostgraduateMatcher.tsx. Work-experience is the one
// genuinely verified hard filter here (meetsMinWorkExperience always passes
// when a scholarship has no documented minimum). The API has no query param
// for it, so it's applied here after the fetch, same as the old inline
// matcher did before the results moved to their own page.
export default async function PostgraduateResultsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const levels = toArray(searchParams.level) as EducationLevel[];
  const scopes = toArray(searchParams.scope) as Scope[];
  const field = typeof searchParams.field === "string" ? searchParams.field : undefined;
  const workExperienceYears = Number(searchParams.workExperience) || 0;

  const { scholarships } = await searchScholarships({
    level: levels.length > 0 ? levels : ["postgraduate", "phd"],
    scope: scopes.length > 0 ? scopes : undefined,
    field,
  });
  const matches = scholarships.filter((s) => meetsMinWorkExperience(s, workExperienceYears));
  const results = sortFeaturedFirst(sortByDeadline(matches));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/postgraduate"
          className="w-fit text-sm font-medium text-primary hover:underline dark:text-primary2"
        >
          ← Refine your search
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-text dark:text-text2">
            Scholarships you may qualify for
          </h1>
          <span className="text-sm text-textMuted dark:text-textMuted2">
            {results.length} scholarship{results.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-border dark:border-border2 p-8 text-center text-textMuted dark:text-textMuted2">
          No scholarships match that combination yet —{" "}
          <Link href="/postgraduate" className="font-medium text-primary hover:underline dark:text-primary2">
            try broadening the field of study, region, or work experience
          </Link>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((s) => (
            <ScholarshipCard key={s.id} scholarship={s} />
          ))}
        </div>
      )}
    </div>
  );
}

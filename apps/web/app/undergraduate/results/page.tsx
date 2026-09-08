import type { Metadata } from "next";
import Link from "next/link";
import { EducationLevel, Scope, sortByDeadline, sortFeaturedFirst } from "@dreamworkabroad/shared";
import ScholarshipCard from "@/components/ScholarshipCard";
import { searchScholarships } from "@/lib/api";

export const metadata: Metadata = {
  title: "Your matched undergraduate scholarships — DreamWorkAbroad",
};

const TIER_LABELS: Record<string, string> = {
  spm: "SPM or equivalent (fresh school leaver)",
  "pre-university": "Pre-university completed",
  "diploma-holder": "Diploma completed (or completing)",
};

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

// Results-only — deliberately has no filter UI of its own (see
// UndergraduateMatcher.tsx). Everything it needs to run the search comes
// from the URL, which is what makes this page shareable/bookmarkable/
// openable in a new tab, unlike the old inline-results pattern.
export default async function UndergraduateResultsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const levels = toArray(searchParams.level) as EducationLevel[];
  const scopes = toArray(searchParams.scope) as Scope[];
  const field = typeof searchParams.field === "string" ? searchParams.field : undefined;
  const tier = typeof searchParams.tier === "string" ? searchParams.tier : undefined;

  const { scholarships } = await searchScholarships({
    level: levels.length > 0 ? levels : ["diploma", "undergraduate"],
    scope: scopes.length > 0 ? scopes : undefined,
    field,
  });
  const results = sortFeaturedFirst(sortByDeadline(scholarships));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/undergraduate"
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
        {tier && TIER_LABELS[tier] && (
          <p className="text-xs text-textMuted dark:text-textMuted2">Based on: {TIER_LABELS[tier]}</p>
        )}
      </div>

      {results.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-border dark:border-border2 p-8 text-center text-textMuted dark:text-textMuted2">
          No scholarships match that combination yet —{" "}
          <Link href="/undergraduate" className="font-medium text-primary hover:underline dark:text-primary2">
            try broadening the field of study or region
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

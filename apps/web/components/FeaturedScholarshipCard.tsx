import Link from "next/link";
import { Scholarship } from "@dreamworkabroad/shared";
import DeadlineTag from "./DeadlineTag";
import EducationLevelBadge from "./EducationLevelBadge";
import FundingTypeBadge from "./FundingTypeBadge";
import ProviderTypeBadge from "./ProviderTypeBadge";
import ScopeBadge from "./ScopeBadge";
import { goHref } from "@/lib/api";

// Deliberately NOT a re-skinned ScholarshipCard — this is what a paying
// sponsor's placement is actually worth: richer content (eligibility
// preview, not just a title), a direct-apply button instead of one more
// click through a detail page, and an accent treatment regular results
// never get. See docs/ARCHITECTURE.md §12.
//
// Two separate click targets (title/details vs. Apply Now) means this can't
// be one big <Link> like ScholarshipCard — they're siblings, not nested.
export default function FeaturedScholarshipCard({ scholarship }: { scholarship: Scholarship }) {
  return (
    <div className="relative flex flex-col gap-3 overflow-hidden rounded-xl2 border-2 border-accent/50 bg-gradient-to-br from-accentLight/40 to-surface dark:from-accentLight2/40 dark:to-surface2 dark:border-accent2/50 p-5 shadow-sm">
      <span className="absolute right-0 top-0 rounded-bl-xl2 bg-accent dark:bg-accent2 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white dark:text-bg2">
        ✨ Featured
      </span>

      <Link href={`/scholarship/${scholarship.id}`} className="flex flex-col gap-2 pr-16">
        <div className="flex flex-wrap items-center gap-1.5">
          <ScopeBadge scope={scholarship.scope} />
          <ProviderTypeBadge providerType={scholarship.providerType} />
        </div>

        <h3 className="text-lg font-bold text-text dark:text-text2 hover:underline">{scholarship.title}</h3>
        <p className="text-sm text-textMuted dark:text-textMuted2">
          {scholarship.provider} · {scholarship.destinationCountry}
        </p>

        <p className="line-clamp-3 text-sm text-text dark:text-text2">{scholarship.shortDescription}</p>

        {scholarship.eligibilitySummary && (
          <p className="line-clamp-2 text-xs text-textMuted dark:text-textMuted2">
            <span className="font-medium text-text dark:text-text2">Eligibility: </span>
            {scholarship.eligibilitySummary}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {scholarship.educationLevel.map((level) => (
            <EducationLevelBadge key={level} level={level} />
          ))}
          <FundingTypeBadge fundingType={scholarship.fundingType} />
        </div>
      </Link>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-accent/30 dark:border-accent2/30 pt-3">
        <DeadlineTag deadline={scholarship.deadline} />
        <div className="flex items-center gap-3">
          <Link
            href={`/scholarship/${scholarship.id}`}
            className="text-sm font-medium text-textMuted hover:text-primary dark:text-textMuted2 dark:hover:text-primary2"
          >
            Details
          </Link>
          <a
            href={goHref(scholarship.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-accent dark:bg-accent2 px-3 py-1.5 text-sm font-medium text-white dark:text-bg2 hover:opacity-90 transition-opacity"
          >
            Apply Now →
          </a>
        </div>
      </div>
    </div>
  );
}

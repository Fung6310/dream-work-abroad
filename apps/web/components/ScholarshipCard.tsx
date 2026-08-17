import Link from "next/link";
import { isFeaturedActive, Scholarship } from "@dreamworkabroad/shared";
import DeadlineTag from "./DeadlineTag";
import EducationLevelBadge from "./EducationLevelBadge";
import FeaturedBadge from "./FeaturedBadge";
import FundingTypeBadge from "./FundingTypeBadge";
import ProviderTypeBadge from "./ProviderTypeBadge";
import ScopeBadge from "./ScopeBadge";

export default function ScholarshipCard({ scholarship }: { scholarship: Scholarship }) {
  return (
    <Link
      href={`/scholarship/${scholarship.id}`}
      className="flex flex-col gap-3 rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-4 hover:border-primary dark:hover:border-primary2 transition-colors"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {isFeaturedActive(scholarship) && <FeaturedBadge />}
        <ScopeBadge scope={scholarship.scope} />
        <ProviderTypeBadge providerType={scholarship.providerType} />
      </div>

      <div>
        <h3 className="font-semibold text-text dark:text-text2">{scholarship.title}</h3>
        <p className="text-sm text-textMuted dark:text-textMuted2">
          {scholarship.provider} · {scholarship.destinationCountry}
        </p>
      </div>

      <p className="line-clamp-2 text-sm text-textMuted dark:text-textMuted2">{scholarship.shortDescription}</p>

      <div className="flex flex-wrap gap-1.5">
        {scholarship.educationLevel.map((level) => (
          <EducationLevelBadge key={level} level={level} />
        ))}
        <FundingTypeBadge fundingType={scholarship.fundingType} />
      </div>

      <div className="mt-auto pt-1">
        <DeadlineTag deadline={scholarship.deadline} />
      </div>
    </Link>
  );
}

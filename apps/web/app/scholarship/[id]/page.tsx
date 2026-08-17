import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import ApplyButton from "@/components/ApplyButton";
import DeadlineTag from "@/components/DeadlineTag";
import EducationLevelBadge from "@/components/EducationLevelBadge";
import FeaturedBadge from "@/components/FeaturedBadge";
import FundingTypeBadge from "@/components/FundingTypeBadge";
import ProviderTypeBadge from "@/components/ProviderTypeBadge";
import ScopeBadge from "@/components/ScopeBadge";
import { getScholarship } from "@/lib/api";
import { isFeaturedActive } from "@dreamworkabroad/shared";

// Scholarship names are exactly the kind of long-tail query people search
// directly ("Chevening scholarship deadline Malaysia"), unlike a price-compare
// product page — so each detail page gets real per-item SEO metadata.
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const scholarship = await getScholarship(params.id);
  if (!scholarship) return { title: "Scholarship not found — DreamWorkAbroad" };
  return {
    title: `${scholarship.title} — DreamWorkAbroad`,
    description: scholarship.shortDescription,
  };
}

export default async function ScholarshipPage({ params }: { params: { id: string } }) {
  const scholarship = await getScholarship(params.id);
  if (!scholarship) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center gap-1.5">
        {isFeaturedActive(scholarship) && <FeaturedBadge />}
        <ScopeBadge scope={scholarship.scope} />
        <ProviderTypeBadge providerType={scholarship.providerType} />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-text dark:text-text2">{scholarship.title}</h1>
        <p className="mt-1 text-textMuted dark:text-textMuted2">
          {scholarship.provider} · {scholarship.destinationCountry}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {scholarship.educationLevel.map((level) => (
          <EducationLevelBadge key={level} level={level} />
        ))}
        <FundingTypeBadge fundingType={scholarship.fundingType} />
        <DeadlineTag deadline={scholarship.deadline} />
      </div>

      <p className="text-text dark:text-text2">{scholarship.shortDescription}</p>

      <div className="rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-4">
        <h2 className="mb-2 font-semibold text-text dark:text-text2">Eligibility</h2>
        <p className="text-sm text-textMuted dark:text-textMuted2">
          {scholarship.eligibilitySummary || "See the official application page for full eligibility criteria."}
        </p>
      </div>

      <div className="rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-4 text-sm text-textMuted dark:text-textMuted2">
        <p>Field of study: {scholarship.fieldOfStudy}</p>
        {scholarship.isRecurringAnnual && (
          <p className="mt-1">This programme typically reopens around the same time each year.</p>
        )}
      </div>

      <div>
        <ApplyButton scholarshipId={scholarship.id} />
        <p className="mt-2 text-xs text-textMuted dark:text-textMuted2">
          Opens the official application page in a new tab. DreamWorkAbroad does not process applications.
        </p>
      </div>

      <AdSlot />
    </div>
  );
}

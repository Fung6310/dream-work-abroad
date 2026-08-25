import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import ApplyButton from "@/components/ApplyButton";
import DeadlineAlertCTA from "@/components/DeadlineAlertCTA";
import DeadlineTag from "@/components/DeadlineTag";
import EducationLevelBadge from "@/components/EducationLevelBadge";
import FeaturedBadge from "@/components/FeaturedBadge";
import FundingTypeBadge from "@/components/FundingTypeBadge";
import ProviderTypeBadge from "@/components/ProviderTypeBadge";
import RelatedScholarships from "@/components/RelatedScholarships";
import ScopeBadge from "@/components/ScopeBadge";
import SubjectsSponsored from "@/components/SubjectsSponsored";
import TravelEssentialsRail from "@/components/TravelEssentialsRail";
import { searchScholarships, getScholarship } from "@/lib/api";
import { isFeaturedActive, Scholarship } from "@dreamworkabroad/shared";

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

// Same scope first (most relevant to "where I'd study"), then ranked by how
// much they overlap with this scholarship — shared education level counts
// most, then provider type / funding type. Real catalogue data only, no
// fabricated "recommended for you" — see ux-ui-audit finding on dead-end pages.
function pickRelated(current: Scholarship, candidates: Scholarship[]): Scholarship[] {
  return candidates
    .filter((s) => s.id !== current.id)
    .map((s) => ({
      s,
      score:
        s.educationLevel.filter((l) => current.educationLevel.includes(l)).length * 2 +
        (s.providerType === current.providerType ? 1 : 0) +
        (s.fundingType === current.fundingType ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || new Date(a.s.deadline).getTime() - new Date(b.s.deadline).getTime())
    .slice(0, 3)
    .map((x) => x.s);
}

export default async function ScholarshipPage({ params }: { params: { id: string } }) {
  const scholarship = await getScholarship(params.id);
  if (!scholarship) notFound();

  const { scholarships: sameScope } = await searchScholarships({ scope: scholarship.scope });
  const related = pickRelated(scholarship, sameScope);
  const applicationDomain = new URL(scholarship.officialApplicationUrl).hostname.replace(/^www\./, "");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-3">
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

        <p className="text-text dark:text-text2">{scholarship.shortDescription}</p>
      </div>

      {/* Primary action block — deadline, apply, and the one place a reader is
          most likely to want a reminder, all above everything else so it
          doesn't compete with the detail sections below for attention. */}
      <div className="rounded-xl2 border-2 border-primary/40 bg-primaryLight/10 dark:border-primary2/40 dark:bg-primaryLight2/10 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {scholarship.educationLevel.map((level) => (
            <EducationLevelBadge key={level} level={level} />
          ))}
          <FundingTypeBadge fundingType={scholarship.fundingType} />
          <DeadlineTag deadline={scholarship.deadline} />
        </div>

        <div className="mt-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <ApplyButton scholarshipId={scholarship.id} />
          <p className="text-xs text-textMuted dark:text-textMuted2">
            You&apos;ll be redirected to <span className="font-medium">{applicationDomain}</span>. DreamWorkAbroad
            does not process applications.
          </p>
        </div>

        <div className="mt-4">
          <DeadlineAlertCTA scholarshipId={scholarship.id} scholarshipTitle={scholarship.title} />
        </div>
      </div>

      <SubjectsSponsored fieldOfStudy={scholarship.fieldOfStudy} />

      <div className="rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-4">
        <h2 className="mb-2 font-semibold text-text dark:text-text2">General Entry Requirements</h2>
        <p className="text-sm text-textMuted dark:text-textMuted2">
          {scholarship.eligibilitySummary || "See the official application page for full eligibility criteria."}
        </p>
      </div>

      <AdSlot />

      <div className="rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-4">
        <h2 className="mb-2 font-semibold text-text dark:text-text2">Application Timeline</h2>
        <p className="text-sm text-textMuted dark:text-textMuted2">
          {scholarship.applicationTimeline ||
            "Timeline not yet listed — check the deadline above and the official application page for the exact process and dates."}
        </p>
        {scholarship.isRecurringAnnual && (
          <p className="mt-2 text-xs text-textMuted dark:text-textMuted2">
            This programme typically reopens on a similar cycle each year.
          </p>
        )}
        <p className="mt-2 text-xs text-textMuted dark:text-textMuted2">
          General pattern only — always confirm exact dates on the official application page before you plan around them.
        </p>
      </div>

      <TravelEssentialsRail />

      <RelatedScholarships scholarships={related} />

      <AdSlot />
    </div>
  );
}

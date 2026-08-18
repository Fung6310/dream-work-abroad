import { isFeaturedActive, Scholarship } from "@dreamworkabroad/shared";
import FeaturedScholarshipCard from "./FeaturedScholarshipCard";

// Featured/sponsored placements — this is the "real" monetization mechanism
// built for launch (see docs/MONETIZATION.md for how to pitch this to
// universities/agents). Only renders when there's at least one active
// featured scholarship, and only on the home page — that's the one place a
// visitor hasn't narrowed results yet, so it's the highest-visibility slot.
// Uses a richer card (not a re-skinned ScholarshipCard) and a wider 2-column
// grid, so a sponsor's placement is visibly worth more than a regular
// result — see docs/ARCHITECTURE.md §12.
export default function FeaturedStrip({ scholarships }: { scholarships: Scholarship[] }) {
  const featured = scholarships.filter((s) => isFeaturedActive(s));
  if (featured.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-text dark:text-text2">Featured scholarships</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {featured.map((s) => (
          <FeaturedScholarshipCard key={s.id} scholarship={s} />
        ))}
      </div>
    </section>
  );
}

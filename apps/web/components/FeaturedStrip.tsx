import { isFeaturedActive, Scholarship } from "@dreamworkabroad/shared";
import ScholarshipCard from "./ScholarshipCard";

// Featured/sponsored placements — this is the "real" monetization mechanism
// built for launch (see docs/MONETIZATION.md for how to pitch this to
// universities/agents). Only renders when there's at least one active
// featured scholarship.
export default function FeaturedStrip({ scholarships }: { scholarships: Scholarship[] }) {
  const featured = scholarships.filter((s) => isFeaturedActive(s));
  if (featured.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-text dark:text-text2">Featured scholarships</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {featured.map((s) => (
          <ScholarshipCard key={s.id} scholarship={s} />
        ))}
      </div>
    </section>
  );
}

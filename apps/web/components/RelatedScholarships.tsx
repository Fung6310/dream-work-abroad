import { Scholarship } from "@dreamworkabroad/shared";
import ScholarshipCard from "./ScholarshipCard";

// Every scholarship page used to be a dead end — no link back into the
// catalogue except the top nav (ux-ui-audit finding: fewer pageviews/session
// hurts both SEO dwell-time and future AdSense RPM). Selection logic lives in
// the detail page (server-side, reusing the same catalogue fetch already
// happening for the page itself — no new data source).
export default function RelatedScholarships({ scholarships }: { scholarships: Scholarship[] }) {
  if (scholarships.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-text dark:text-text2">You may also want to look at</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scholarships.map((s) => (
          <ScholarshipCard key={s.id} scholarship={s} />
        ))}
      </div>
    </section>
  );
}

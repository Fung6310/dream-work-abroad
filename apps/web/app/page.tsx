import Link from "next/link";
import FeaturedScholarshipCard from "@/components/FeaturedScholarshipCard";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import { getScholarship, searchScholarships } from "@/lib/api";

const SUGGESTIONS = ["Chevening", "Japan", "Engineering", "PTPTN", "Postgraduate"];

// Hand-picked, not "whichever is flagged featured" — these two are widely
// recognised by Malaysian students specifically (JPA for undergrad, Chevening
// for postgrad), which is what makes them good landing-page anchors. Swap
// the ids here if a better-known pair emerges later.
const SPOTLIGHT_UNDERGRAD_ID = "jpa-scholarship";
const SPOTLIGHT_POSTGRAD_ID = "chevening-uk";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const q = typeof searchParams.q === "string" ? searchParams.q : "";

  if (q) {
    const { scholarships } = await searchScholarships({ q });
    return (
      <div className="flex flex-col gap-8">
        <section className="flex flex-col items-center gap-4 py-6 text-center">
          <h1 className="text-3xl font-bold text-text dark:text-text2">
            Every scholarship for Malaysian students, in one place
          </h1>
          <SearchBar initialQuery={q} />
        </section>
        <SearchResults key={q} scholarships={scholarships} query={q} />
      </div>
    );
  }

  const [{ count: totalCount }, spotlightUndergrad, spotlightPostgrad] = await Promise.all([
    searchScholarships({}),
    getScholarship(SPOTLIGHT_UNDERGRAD_ID),
    getScholarship(SPOTLIGHT_POSTGRAD_ID),
  ]);

  return (
    <div className="flex flex-col gap-14">
      <section className="flex flex-col items-center gap-5 py-8 text-center">
        <span className="rounded-full border border-primary/40 px-3 py-1 text-xs font-medium text-primary dark:border-primary2/40 dark:text-primary2">
          🇲🇾 Built for Malaysian students
        </span>
        <h1 className="max-w-2xl text-4xl font-bold leading-tight text-text dark:text-text2 sm:text-5xl">
          Find the scholarship that's actually right for you
        </h1>
        <p className="max-w-xl text-textMuted dark:text-textMuted2">
          {totalCount}+ real, verified-eligible scholarships for Malaysians — government, university and
          international. Tell us where you are in your studies and we'll match you directly.
        </p>
        <SearchBar initialQuery={q} />
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          {SUGGESTIONS.map((sug) => (
            <a
              key={sug}
              href={`/?q=${encodeURIComponent(sug)}`}
              className="rounded-full border border-border dark:border-border2 px-3 py-1 text-xs text-textMuted dark:text-textMuted2 hover:border-primary hover:text-primary dark:hover:border-primary2 dark:hover:text-primary2"
            >
              {sug}
            </a>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/undergraduate"
          className="group flex flex-col gap-2 rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-6 transition-colors hover:border-primary dark:hover:border-primary2"
        >
          <span className="text-3xl">🎓</span>
          <h2 className="text-lg font-semibold text-text dark:text-text2 group-hover:text-primary dark:group-hover:text-primary2">
            Undergraduate scholarships
          </h2>
          <p className="text-sm text-textMuted dark:text-textMuted2">
            Diploma and bachelor's degree awards. Enter your SPM (or equivalent) result to find your best match.
          </p>
          <span className="mt-2 text-sm font-medium text-primary dark:text-primary2">Browse undergraduate →</span>
        </Link>
        <Link
          href="/postgraduate"
          className="group flex flex-col gap-2 rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-6 transition-colors hover:border-primary dark:hover:border-primary2"
        >
          <span className="text-3xl">🌍</span>
          <h2 className="text-lg font-semibold text-text dark:text-text2 group-hover:text-primary dark:group-hover:text-primary2">
            Postgraduate scholarships
          </h2>
          <p className="text-sm text-textMuted dark:text-textMuted2">
            Master's and PhD awards. Enter your degree result and work experience to find your best match.
          </p>
          <span className="mt-2 text-sm font-medium text-primary dark:text-primary2">Browse postgraduate →</span>
        </Link>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-text dark:text-text2">Popular right now</h2>
          <span className="text-sm text-textMuted dark:text-textMuted2">Hand-picked, not the full list</span>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {spotlightUndergrad && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-textMuted2">
                🎓 Most searched — undergraduate
              </p>
              <FeaturedScholarshipCard scholarship={spotlightUndergrad} />
            </div>
          )}
          {spotlightPostgrad && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-textMuted2">
                🌍 Most searched — postgraduate
              </p>
              <FeaturedScholarshipCard scholarship={spotlightPostgrad} />
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-6 sm:grid-cols-3">
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <span className="text-2xl">1️⃣</span>
          <p className="font-semibold text-text dark:text-text2">Tell us your stage</p>
          <p className="text-sm text-textMuted dark:text-textMuted2">
            SPM result for undergraduate, or degree result and work experience for postgraduate.
          </p>
        </div>
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <span className="text-2xl">2️⃣</span>
          <p className="font-semibold text-text dark:text-text2">We match you</p>
          <p className="text-sm text-textMuted dark:text-textMuted2">
            Only scholarships open to your level, field and preferred region — Malaysia or international.
          </p>
        </div>
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <span className="text-2xl">3️⃣</span>
          <p className="font-semibold text-text dark:text-text2">Apply directly</p>
          <p className="text-sm text-textMuted dark:text-textMuted2">
            Every Apply button links straight to the official provider's own application page.
          </p>
        </div>
      </section>
    </div>
  );
}

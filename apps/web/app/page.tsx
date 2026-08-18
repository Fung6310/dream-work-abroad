import Link from "next/link";
import FeaturedStrip from "@/components/FeaturedStrip";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import { searchScholarships } from "@/lib/api";

const SUGGESTIONS = ["Chevening", "Japan", "Engineering", "PTPTN", "Postgraduate"];

export default async function HomePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const { scholarships } = await searchScholarships({ q });

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-4 py-6 text-center">
        <h1 className="text-3xl font-bold text-text dark:text-text2">
          Every scholarship for Malaysian students, in one place
        </h1>
        <p className="max-w-xl text-textMuted dark:text-textMuted2">
          Government, GLC, university and international scholarships — filter by education level, funding type
          and destination, and apply directly on the official site.
        </p>
        <SearchBar initialQuery={q} />
        {!q && (
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {SUGGESTIONS.map((s) => (
              <a
                key={s}
                href={`/?q=${encodeURIComponent(s)}`}
                className="rounded-full border border-border dark:border-border2 px-3 py-1 text-xs text-textMuted dark:text-textMuted2 hover:border-primary hover:text-primary dark:hover:border-primary2 dark:hover:text-primary2"
              >
                {s}
              </a>
            ))}
          </div>
        )}
      </section>

      {!q && (
        <Link
          href="/match"
          className="flex flex-col items-center gap-1 rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-5 text-center hover:border-primary dark:hover:border-primary2 transition-colors"
        >
          <p className="font-semibold text-text dark:text-text2">🎯 Find my scholarships</p>
          <p className="text-sm text-textMuted dark:text-textMuted2">
            Enter your education level and field once — only see scholarships you actually qualify for. Or use the
            filters below to narrow by Malaysia/International, level, funding and more.
          </p>
        </Link>
      )}

      {!q && <FeaturedStrip scholarships={scholarships} />}

      <SearchResults key={q} scholarships={scholarships} query={q} />
    </div>
  );
}

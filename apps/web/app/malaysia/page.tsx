import type { Metadata } from "next";
import FeaturedStrip from "@/components/FeaturedStrip";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import { searchScholarships } from "@/lib/api";

export const metadata: Metadata = {
  title: "Malaysia Scholarships — DreamWorkAbroad",
  description:
    "Government, GLC, foundation and private-university scholarships funded within Malaysia — some of which let you study overseas too.",
};

export default async function MalaysiaPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const { scholarships } = await searchScholarships({ q, scope: "malaysia" });

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-4 py-6 text-center">
        <h1 className="text-3xl font-bold text-text dark:text-text2">🇲🇾 Malaysia scholarships</h1>
        <p className="max-w-xl text-textMuted dark:text-textMuted2">
          Funded by a Malaysian government body, GLC, foundation or institution. A few of these — like PESP and
          MARA — fund overseas study too; check each listing&apos;s destination.
        </p>
        <SearchBar initialQuery={q} basePath="/malaysia" />
      </section>

      {!q && <FeaturedStrip scholarships={scholarships} />}

      <SearchResults key={q} scholarships={scholarships} query={q} />
    </div>
  );
}

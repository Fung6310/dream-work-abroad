import type { Metadata } from "next";
import FeaturedStrip from "@/components/FeaturedStrip";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import { searchScholarships } from "@/lib/api";

export const metadata: Metadata = {
  title: "International Scholarships — DreamWorkAbroad",
  description:
    "Foreign government and foreign institution scholarships for Malaysian students to study abroad — UK, Japan, Germany, China, the US and more.",
};

export default async function InternationalPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const { scholarships } = await searchScholarships({ q, scope: "international" });

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-4 py-6 text-center">
        <h1 className="text-3xl font-bold text-text dark:text-text2">🌍 International scholarships</h1>
        <p className="max-w-xl text-textMuted dark:text-textMuted2">
          Funded by a foreign government or foreign institution, for Malaysians to study abroad — filter by
          destination country to narrow it down.
        </p>
        <SearchBar initialQuery={q} basePath="/international" />
      </section>

      {!q && <FeaturedStrip scholarships={scholarships} />}

      <SearchResults key={q} scholarships={scholarships} query={q} />
    </div>
  );
}

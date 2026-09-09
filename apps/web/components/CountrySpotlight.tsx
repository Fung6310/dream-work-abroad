"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Scholarship } from "@dreamworkabroad/shared";

// Only countries that appear as a single, real destination in the catalogue
// get a flag chip — "Various (Overseas)"-style entries are deliberately
// excluded rather than force-mapped to one flag, which would misrepresent
// them. Every count/list this component shows is computed live from the
// `scholarships` prop, never a fixed number — no "120+ university network"
// style placeholder stat, per this project's anti-fabrication principle.
const FLAGS: Record<string, string> = {
  Malaysia: "🇲🇾",
  "United Kingdom": "🇬🇧",
  "United States": "🇺🇸",
  Germany: "🇩🇪",
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
  China: "🇨🇳",
  Australia: "🇦🇺",
  "New Zealand": "🇳🇿",
  Netherlands: "🇳🇱",
  Hungary: "🇭🇺",
  Switzerland: "🇨🇭",
  France: "🇫🇷",
  Türkiye: "🇹🇷",
  "European Union": "🇪🇺",
};

export default function CountrySpotlight({ scholarships }: { scholarships: Scholarship[] }) {
  const byCountry = useMemo(() => {
    const map = new Map<string, Scholarship[]>();
    for (const s of scholarships) {
      if (!(s.destinationCountry in FLAGS)) continue;
      const list = map.get(s.destinationCountry) ?? [];
      list.push(s);
      map.set(s.destinationCountry, list);
    }
    return [...map.entries()].sort(([a, aList], [b, bList]) => {
      if (a === "Malaysia") return -1;
      if (b === "Malaysia") return 1;
      return bList.length - aList.length;
    });
  }, [scholarships]);

  const [active, setActive] = useState<string | null>(byCountry[0]?.[0] ?? null);

  if (byCountry.length === 0) return null;

  const activeList = byCountry.find(([country]) => country === active)?.[1] ?? [];

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text dark:text-text2">Where will you study?</h2>
        <p className="text-sm text-textMuted dark:text-textMuted2">
          Tap a country — every number here is real, counted live from the current catalogue.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {byCountry.map(([country, list]) => (
          <button
            key={country}
            onClick={() => setActive(country)}
            aria-pressed={active === country}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              active === country
                ? "border-primary bg-primary text-white dark:border-primary2 dark:bg-primary2 dark:text-bg2"
                : "border-border text-text hover:border-primary dark:border-border2 dark:text-text2 dark:hover:border-primary2"
            }`}
          >
            <span aria-hidden>{FLAGS[country]}</span>
            {country}
            <span
              className={`rounded-full px-1.5 text-xs ${
                active === country
                  ? "bg-white/20"
                  : "bg-bgAlt text-textMuted dark:bg-bgAlt2 dark:text-textMuted2"
              }`}
            >
              {list.length}
            </span>
          </button>
        ))}
      </div>

      {active && (
        <div className="mt-4 rounded-xl2 border border-border bg-surface p-4 dark:border-border2 dark:bg-surface2">
          <p className="mb-3 text-sm text-textMuted dark:text-textMuted2">
            <span className="font-semibold text-text dark:text-text2">{activeList.length}</span> scholarship
            {activeList.length === 1 ? "" : "s"} funding study in {active}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {activeList.slice(0, 3).map((s) => (
              <Link
                key={s.id}
                href={`/scholarship/${s.id}`}
                className="flex flex-col gap-0.5 rounded-xl border border-border p-3 transition-colors hover:border-primary dark:border-border2 dark:hover:border-primary2"
              >
                <span className="text-sm font-medium text-text dark:text-text2">{s.title}</span>
                <span className="text-xs text-textMuted dark:text-textMuted2">{s.provider}</span>
              </Link>
            ))}
          </div>
          {activeList.length > 3 && (
            <Link
              href={`/?q=${encodeURIComponent(active)}`}
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline dark:text-primary2"
            >
              See all {activeList.length} →
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

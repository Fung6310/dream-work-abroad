"use client";

import { useMemo, useState } from "react";
import { FAQ_CATEGORIES } from "@/lib/faq";

const ALL = "all";

export default function FaqSection() {
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [openKey, setOpenKey] = useState<string | null>(null);

  const totalCount = useMemo(() => FAQ_CATEGORIES.reduce((n, c) => n + c.items.length, 0), []);

  const visibleCategories =
    activeCategory === ALL ? FAQ_CATEGORIES : FAQ_CATEGORIES.filter((c) => c.id === activeCategory);

  // FAQPage structured data — always the full set, independent of which
  // category filter is active in the UI, so Google sees every question
  // regardless of the visitor's current view.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_CATEGORIES.flatMap((c) =>
      c.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      }))
    ),
  };

  return (
    <section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-text dark:text-text2">Frequently asked questions</h2>
        <span className="text-sm text-textMuted dark:text-textMuted2">{totalCount} questions</span>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(ALL)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            activeCategory === ALL
              ? "border-primary bg-primary text-white dark:border-primary2 dark:bg-primary2 dark:text-bg2"
              : "border-border text-textMuted hover:border-primary hover:text-primary dark:border-border2 dark:text-textMuted2 dark:hover:border-primary2 dark:hover:text-primary2"
          }`}
        >
          All questions
        </button>
        {FAQ_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activeCategory === c.id
                ? "border-primary bg-primary text-white dark:border-primary2 dark:bg-primary2 dark:text-bg2"
                : "border-border text-textMuted hover:border-primary hover:text-primary dark:border-border2 dark:text-textMuted2 dark:hover:border-primary2 dark:hover:text-primary2"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {visibleCategories.map((category) => (
          <div key={category.id}>
            {activeCategory === ALL && (
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-textMuted dark:text-textMuted2">
                {category.label}
              </h3>
            )}
            <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl2 border border-border dark:divide-border2 dark:border-border2">
              {category.items.map((item, i) => {
                const key = `${category.id}-${i}`;
                const isOpen = openKey === key;
                return (
                  <div key={key} className="bg-surface dark:bg-surface2">
                    <button
                      onClick={() => setOpenKey(isOpen ? null : key)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-medium text-text dark:text-text2"
                    >
                      {item.question}
                      <span
                        className={`shrink-0 text-textMuted transition-transform dark:text-textMuted2 ${isOpen ? "rotate-45" : ""}`}
                      >
                        +
                      </span>
                    </button>
                    {isOpen && (
                      <p className="px-4 pb-4 text-sm text-textMuted dark:text-textMuted2">{item.answer}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar({
  initialQuery = "",
  basePath = "/",
}: {
  initialQuery?: string;
  /** Which page's search this submits to — /malaysia and /international stay on themselves. */
  basePath?: string;
}) {
  const [value, setValue] = useState(initialQuery);
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `${basePath}?q=${encodeURIComponent(q)}` : basePath);
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-2xl gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        type="search"
        placeholder="Search by name, provider, country or field, e.g. Chevening, Japan, Engineering…"
        className="w-full rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 px-4 py-3 text-text dark:text-text2 placeholder:text-textMuted dark:placeholder:text-textMuted2 outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        type="submit"
        className="shrink-0 rounded-xl2 bg-primary px-5 py-3 font-medium text-white hover:bg-primaryDark dark:bg-primary2 dark:text-bg2 dark:hover:bg-primaryLight transition-colors"
      >
        Search
      </button>
    </form>
  );
}

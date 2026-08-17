"use client";

import { useState } from "react";
import { adminTriggerMockScrape } from "@/lib/api";

export default function TriggerScrapeButton({ onIngested }: { onIngested: () => void }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function onClick() {
    setLoading(true);
    setMessage("");
    try {
      const res = await adminTriggerMockScrape();
      setMessage(
        res.ingested > 0
          ? `${res.ingested} new candidate${res.ingested === 1 ? "" : "s"} found.`
          : "No new candidates — everything's already been ingested."
      );
      onIngested();
    } catch {
      setMessage("Failed to run the mock scrape.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={onClick}
        disabled={loading}
        className="rounded-xl2 border border-primary px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 dark:border-primary2 dark:text-primary2 disabled:opacity-50"
        title="Runs the mock ScholarshipSourceAdapter pipeline against a local simulated-scrape file — no real external site is contacted."
      >
        {loading ? "Scanning…" : "Trigger mock scrape"}
      </button>
      {message && <p className="text-xs text-textMuted dark:text-textMuted2">{message}</p>}
    </div>
  );
}

"use client";

import { useState } from "react";
import { submitPremiumLead } from "@/lib/api";

// Placed right next to the deadline/Apply block — the exact moment a reader
// is most likely to want a reminder, which the standalone /premium page
// never reaches (see ux-ui-audit finding on the scholarship detail page).
// Captures into the same PremiumLead store as /premium, tagged with this
// scholarship so admin sees real per-scholarship demand.
export default function DeadlineAlertCTA({
  scholarshipId,
  scholarshipTitle,
}: {
  scholarshipId: string;
  scholarshipTitle: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      await submitPremiumLead({ email, scholarshipId, scholarshipTitle });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl2 border border-primary/30 bg-primaryLight/20 dark:border-primary2/30 dark:bg-primaryLight2/20 p-4 text-sm text-text dark:text-text2">
        ✓ We&apos;ll email you before this deadline closes.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 rounded-xl2 border border-primary/30 bg-primaryLight/10 dark:border-primary2/30 dark:bg-primaryLight2/10 p-4 sm:flex-row sm:items-center"
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-text dark:text-text2">🔔 Get reminded before this closes</p>
        <p className="text-xs text-textMuted dark:text-textMuted2">No spam — just this scholarship&apos;s deadline.</p>
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full min-w-0 rounded-lg border border-border dark:border-border2 bg-bg dark:bg-bg2 px-3 py-2 text-sm text-text dark:text-text2 outline-none focus:ring-2 focus:ring-primary sm:w-48"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primaryDark disabled:opacity-50 dark:bg-primary2 dark:text-bg2 dark:hover:bg-primaryLight transition-colors"
        >
          {status === "submitting" ? "…" : "Notify me"}
        </button>
      </div>
      {status === "error" && <p className="text-xs text-danger dark:text-danger2">Couldn&apos;t save that — try again.</p>}
    </form>
  );
}

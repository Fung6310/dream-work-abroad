"use client";

import { useState } from "react";
import { submitPremiumLead } from "@/lib/api";

// Same PremiumLead capture point as /premium — tagged via `message` instead
// of `interestLevel`/scholarship fields, so it shows up in Admin → Leads as a
// "Partner inquiry" rather than a student waitlist signup (see LeadsTable.tsx).
// No payment processing here — matches docs/MONETIZATION.md's current
// invoice-then-toggle workflow for featured placements.
export default function PartnerInquiryForm() {
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      await submitPremiumLead({
        email,
        name: organization || undefined,
        message: message ? `Partner inquiry: ${message}` : "Partner inquiry (no message provided)",
      });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-6 text-center">
        <p className="font-semibold text-text dark:text-text2">Thanks — we&apos;ll be in touch. 🎉</p>
        <p className="mt-1 text-sm text-textMuted dark:text-textMuted2">
          We usually respond within a few business days.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-6"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-text dark:text-text2">Work email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@university.edu"
          className="w-full rounded-lg border border-border dark:border-border2 bg-bg dark:bg-bg2 px-3 py-2 text-sm text-text dark:text-text2 outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-text dark:text-text2">Organization</label>
        <input
          type="text"
          required
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder="e.g. Sunway University"
          className="w-full rounded-lg border border-border dark:border-border2 bg-bg dark:bg-bg2 px-3 py-2 text-sm text-text dark:text-text2 outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-text dark:text-text2">What are you interested in?</label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. We'd like to feature our scholarship on the Malaysia page"
          className="w-full rounded-lg border border-border dark:border-border2 bg-bg dark:bg-bg2 px-3 py-2 text-sm text-text dark:text-text2 outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-1 rounded-xl2 bg-primary px-5 py-2.5 font-medium text-white hover:bg-primaryDark disabled:opacity-60 dark:bg-primary2 dark:text-bg2 dark:hover:bg-primaryLight transition-colors"
      >
        {status === "submitting" ? "Sending…" : "Send inquiry"}
      </button>
      {status === "error" && (
        <p className="text-sm text-danger dark:text-danger2">Something went wrong — try again.</p>
      )}
    </form>
  );
}

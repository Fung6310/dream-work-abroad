"use client";

import { useState } from "react";
import { EducationLevel, EDUCATION_LEVELS } from "@dreamworkabroad/shared";
import { submitPremiumLead } from "@/lib/api";

const ALL_LEVELS = Object.values(EDUCATION_LEVELS);

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [interestLevel, setInterestLevel] = useState<EducationLevel | "">("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      await submitPremiumLead({ email, name: name || undefined, interestLevel: interestLevel || undefined });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-6 text-center">
        <p className="font-semibold text-text dark:text-text2">You&apos;re on the list! 🎉</p>
        <p className="mt-1 text-sm text-textMuted dark:text-textMuted2">
          We&apos;ll email you as soon as Premium deadline alerts are ready.
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
        <label className="mb-1 block text-sm font-medium text-text dark:text-text2">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-border dark:border-border2 bg-bg dark:bg-bg2 px-3 py-2 text-sm text-text dark:text-text2 outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-text dark:text-text2">Name (optional)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border dark:border-border2 bg-bg dark:bg-bg2 px-3 py-2 text-sm text-text dark:text-text2 outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-text dark:text-text2">
          What level are you applying for? (optional)
        </label>
        <select
          value={interestLevel}
          onChange={(e) => setInterestLevel(e.target.value as EducationLevel | "")}
          className="w-full rounded-lg border border-border dark:border-border2 bg-bg dark:bg-bg2 px-3 py-2 text-sm text-text dark:text-text2 outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Not sure yet</option>
          {ALL_LEVELS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-danger dark:text-danger2">{error}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-1 rounded-xl2 bg-primary px-5 py-2.5 font-medium text-white hover:bg-primaryDark disabled:opacity-60 dark:bg-primary2 dark:text-bg2 dark:hover:bg-primaryLight transition-colors"
      >
        {status === "submitting" ? "Joining…" : "Join the waitlist"}
      </button>
    </form>
  );
}

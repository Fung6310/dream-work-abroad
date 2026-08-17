"use client";

import { useState } from "react";
import { formatDeadline, PROVIDER_TYPES, Scholarship, SCOPES } from "@dreamworkabroad/shared";
import { adminApproveScholarship, adminRejectScholarship } from "@/lib/api";

export default function ReviewQueueTable({
  scholarships,
  onChange,
}: {
  scholarships: Scholarship[];
  onChange: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function approve(id: string) {
    setBusyId(id);
    try {
      await adminApproveScholarship(id);
      onChange();
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    setBusyId(id);
    try {
      await adminRejectScholarship(id);
      onChange();
    } finally {
      setBusyId(null);
    }
  }

  if (scholarships.length === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-border dark:border-border2 p-8 text-center text-textMuted dark:text-textMuted2">
        Nothing pending review. Click &quot;Trigger mock scrape&quot; to simulate a crawl finding new candidates.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl2 border border-border dark:border-border2">
      <table className="w-full text-left text-sm">
        <thead className="bg-bgAlt dark:bg-bgAlt2 text-xs uppercase tracking-wide text-textMuted dark:text-textMuted2">
          <tr>
            <th className="px-4 py-2.5">Title</th>
            <th className="px-4 py-2.5">Scope</th>
            <th className="px-4 py-2.5">Provider</th>
            <th className="px-4 py-2.5">Country</th>
            <th className="px-4 py-2.5">Deadline</th>
            <th className="px-4 py-2.5">Source</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {scholarships.map((s) => (
            <tr key={s.id} className="border-t border-border dark:border-border2">
              <td className="px-4 py-2.5 font-medium text-text dark:text-text2">{s.title}</td>
              <td className="px-4 py-2.5 text-textMuted dark:text-textMuted2">{SCOPES[s.scope].label}</td>
              <td className="px-4 py-2.5 text-textMuted dark:text-textMuted2">
                {s.provider}
                <span className="ml-1.5 text-xs">({PROVIDER_TYPES[s.providerType].label})</span>
              </td>
              <td className="px-4 py-2.5 text-textMuted dark:text-textMuted2">{s.destinationCountry}</td>
              <td className="px-4 py-2.5 text-textMuted dark:text-textMuted2">{formatDeadline(s.deadline)}</td>
              <td className="px-4 py-2.5 text-textMuted dark:text-textMuted2">{s.source}</td>
              <td className="px-4 py-2.5">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => approve(s.id)}
                    disabled={busyId === s.id}
                    className="rounded-lg bg-success px-2.5 py-1 text-xs font-medium text-white hover:opacity-90 dark:bg-success2 dark:text-bg2 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => reject(s.id)}
                    disabled={busyId === s.id}
                    className="rounded-lg border border-danger px-2.5 py-1 text-xs font-medium text-danger hover:bg-danger/10 dark:border-danger2 dark:text-danger2 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

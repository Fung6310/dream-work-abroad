"use client";

import { formatDeadline, Scholarship, ScholarshipStatus, SCOPES } from "@dreamworkabroad/shared";

const STATUS_STYLES: Record<ScholarshipStatus, string> = {
  pending: "bg-statusPendingBg dark:bg-statusPendingBg2 text-statusPendingText dark:text-statusPendingText2",
  published: "bg-statusPublishedBg dark:bg-statusPublishedBg2 text-statusPublishedText dark:text-statusPublishedText2",
  rejected: "bg-statusRejectedBg dark:bg-statusRejectedBg2 text-statusRejectedText dark:text-statusRejectedText2",
  expired: "bg-statusExpiredBg dark:bg-statusExpiredBg2 text-statusExpiredText dark:text-statusExpiredText2",
};

export default function ScholarshipTable({
  scholarships,
  onEdit,
  onDelete,
}: {
  scholarships: Scholarship[];
  onEdit: (s: Scholarship) => void;
  onDelete: (s: Scholarship) => void;
}) {
  if (scholarships.length === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-border dark:border-border2 p-8 text-center text-textMuted dark:text-textMuted2">
        No scholarships match this filter.
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
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Featured</th>
            <th className="px-4 py-2.5">Deadline</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {scholarships.map((s) => (
            <tr key={s.id} className="border-t border-border dark:border-border2">
              <td className="px-4 py-2.5">
                <p className="font-medium text-text dark:text-text2">{s.title}</p>
                <p className="text-xs text-textMuted dark:text-textMuted2">{s.provider}</p>
              </td>
              <td className="px-4 py-2.5 text-textMuted dark:text-textMuted2">{SCOPES[s.scope].label}</td>
              <td className="px-4 py-2.5">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[s.status]}`}>
                  {s.status}
                </span>
              </td>
              <td className="px-4 py-2.5 text-textMuted dark:text-textMuted2">{s.featured ? "★" : "—"}</td>
              <td className="px-4 py-2.5 text-textMuted dark:text-textMuted2">{formatDeadline(s.deadline)}</td>
              <td className="px-4 py-2.5">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(s)}
                    className="rounded-lg border border-border dark:border-border2 px-2.5 py-1 text-xs font-medium text-text dark:text-text2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(s)}
                    className="rounded-lg border border-danger px-2.5 py-1 text-xs font-medium text-danger hover:bg-danger/10 dark:border-danger2 dark:text-danger2"
                  >
                    Delete
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

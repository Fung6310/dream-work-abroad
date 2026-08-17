import { ScholarshipStatus } from "@dreamworkabroad/shared";

const STATUS_STYLES: Record<ScholarshipStatus, string> = {
  pending: "bg-statusPendingBg dark:bg-statusPendingBg2 text-statusPendingText dark:text-statusPendingText2",
  published: "bg-statusPublishedBg dark:bg-statusPublishedBg2 text-statusPublishedText dark:text-statusPublishedText2",
  rejected: "bg-statusRejectedBg dark:bg-statusRejectedBg2 text-statusRejectedText dark:text-statusRejectedText2",
  expired: "bg-statusExpiredBg dark:bg-statusExpiredBg2 text-statusExpiredText dark:text-statusExpiredText2",
};

export default function StatusBreakdown({ data }: { data: { status: ScholarshipStatus; count: number }[] }) {
  return (
    <div className="rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-4">
      <p className="mb-3 text-sm font-semibold text-text dark:text-text2">Scholarships by status</p>
      <div className="flex flex-wrap gap-2">
        {data.map((d) => (
          <span
            key={d.status}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[d.status]}`}
          >
            {d.status}: {d.count}
          </span>
        ))}
      </div>
    </div>
  );
}

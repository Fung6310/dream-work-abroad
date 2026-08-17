"use client";

import { useCallback, useEffect, useState } from "react";
import { Scholarship } from "@dreamworkabroad/shared";
import AdminGate from "@/components/admin/AdminGate";
import ReviewQueueTable from "@/components/admin/ReviewQueueTable";
import TriggerScrapeButton from "@/components/admin/TriggerScrapeButton";
import { adminListScholarships } from "@/lib/api";

function QueueContent() {
  const [pending, setPending] = useState<Scholarship[] | null>(null);

  const refresh = useCallback(() => {
    adminListScholarships("pending")
      .then(setPending)
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text2">Review Queue</h1>
          <p className="text-sm text-textMuted dark:text-textMuted2">
            Scraped candidates land here as pending — nothing appears on the public site until you approve it.
          </p>
        </div>
        <TriggerScrapeButton onIngested={refresh} />
      </div>

      {pending === null ? (
        <p className="text-textMuted dark:text-textMuted2">Loading…</p>
      ) : (
        <ReviewQueueTable scholarships={pending} onChange={refresh} />
      )}
    </div>
  );
}

export default function QueuePage() {
  return (
    <AdminGate>
      <QueueContent />
    </AdminGate>
  );
}

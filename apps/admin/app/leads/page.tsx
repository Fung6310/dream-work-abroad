"use client";

import { useEffect, useState } from "react";
import { PremiumLead } from "@dreamworkabroad/shared";
import AdminGate from "@/components/admin/AdminGate";
import LeadsTable from "@/components/admin/LeadsTable";
import { adminListLeads } from "@/lib/api";

function LeadsContent() {
  const [leads, setLeads] = useState<PremiumLead[] | null>(null);

  useEffect(() => {
    adminListLeads()
      .then(setLeads)
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text dark:text-text2">Premium Waitlist</h1>
        <p className="text-sm text-textMuted dark:text-textMuted2">
          Everyone who signed up for deadline alerts on /premium — no billing wired up yet, see
          docs/MONETIZATION.md.
        </p>
      </div>

      {leads === null ? <p className="text-textMuted dark:text-textMuted2">Loading…</p> : <LeadsTable leads={leads} />}
    </div>
  );
}

export default function LeadsPage() {
  return (
    <AdminGate>
      <LeadsContent />
    </AdminGate>
  );
}

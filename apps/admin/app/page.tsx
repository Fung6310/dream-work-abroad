"use client";

import { useEffect, useState } from "react";
import { AdminStats } from "@dreamworkabroad/shared";
import AdminGate from "@/components/admin/AdminGate";
import ClicksLineChart from "@/components/admin/ClicksLineChart";
import ProviderTypeBarChart from "@/components/admin/ProviderTypeBarChart";
import StatTile from "@/components/admin/StatTile";
import StatusBreakdown from "@/components/admin/StatusBreakdown";
import TopScholarshipsList from "@/components/admin/TopScholarshipsList";
import { adminStats } from "@/lib/api";

function DashboardContent() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    adminStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats) return <p className="text-textMuted dark:text-textMuted2">Loading stats…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text dark:text-text2">Dashboard</h1>
        <p className="text-sm text-textMuted dark:text-textMuted2">
          Scholarship catalogue health and apply-click engagement.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Total" value={stats.totalScholarships.toLocaleString()} />
        <StatTile label="Published" value={stats.totalPublished.toLocaleString()} />
        <StatTile label="Pending review" value={stats.totalPending.toLocaleString()} />
        <StatTile label="Featured" value={stats.totalFeatured.toLocaleString()} />
        <StatTile label="Apply-clicks" value={stats.totalApplyClicks.toLocaleString()} />
        <StatTile label="Premium leads" value={stats.totalPremiumLeads.toLocaleString()} />
      </div>

      <StatusBreakdown data={stats.scholarshipsByStatus} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProviderTypeBarChart title="Apply-clicks by provider type" data={stats.clicksByProviderType} />
        <TopScholarshipsList data={stats.topScholarships} />
      </div>

      <ClicksLineChart data={stats.clicksOverTime} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AdminGate>
      <DashboardContent />
    </AdminGate>
  );
}

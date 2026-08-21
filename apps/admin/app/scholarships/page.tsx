"use client";

import { useCallback, useEffect, useState } from "react";
import { Scholarship, ScholarshipStatus } from "@dreamworkabroad/shared";
import AdminGate from "@/components/admin/AdminGate";
import ScholarshipForm, { ScholarshipFormValues } from "@/components/admin/ScholarshipForm";
import ScholarshipTable from "@/components/admin/ScholarshipTable";
import { adminCreateScholarship, adminDeleteScholarship, adminListScholarships, adminUpdateScholarship } from "@/lib/api";

type FilterValue = ScholarshipStatus | "all";
const FILTERS: FilterValue[] = ["all", "published", "pending", "rejected", "expired"];

function ScholarshipsContent() {
  const [scholarships, setScholarships] = useState<Scholarship[] | null>(null);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [editing, setEditing] = useState<Scholarship | "new" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(() => {
    adminListScholarships(filter === "all" ? undefined : filter)
      .then(setScholarships)
      .catch(() => {});
  }, [filter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function onSubmit(values: ScholarshipFormValues) {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        featuredUntil: values.featuredUntil || undefined,
        minWorkExperienceYears: values.minWorkExperienceYears
          ? Number(values.minWorkExperienceYears)
          : undefined,
      };
      if (editing === "new") {
        await adminCreateScholarship(payload);
      } else if (editing) {
        await adminUpdateScholarship(editing.id, payload);
      }
      setEditing(null);
      refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(s: Scholarship) {
    if (!confirm(`Delete "${s.title}"? This can't be undone.`)) return;
    await adminDeleteScholarship(s.id);
    refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text2">Scholarships</h1>
          <p className="text-sm text-textMuted dark:text-textMuted2">
            Full catalogue — create, edit, or delete any listing, and toggle featured placements.
          </p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="rounded-xl2 bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryDark dark:bg-primary2 dark:text-bg2"
        >
          + Add scholarship
        </button>
      </div>

      {editing && (
        <ScholarshipForm
          initial={editing === "new" ? undefined : editing}
          onSubmit={onSubmit}
          onCancel={() => setEditing(null)}
          submitting={submitting}
        />
      )}

      <div className="flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === f
                ? "bg-primary text-white dark:bg-primary2 dark:text-bg2"
                : "border border-border text-textMuted dark:border-border2 dark:text-textMuted2"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {scholarships === null ? (
        <p className="text-textMuted dark:text-textMuted2">Loading…</p>
      ) : (
        <ScholarshipTable scholarships={scholarships} onEdit={setEditing} onDelete={onDelete} />
      )}
    </div>
  );
}

export default function ScholarshipsPage() {
  return (
    <AdminGate>
      <ScholarshipsContent />
    </AdminGate>
  );
}

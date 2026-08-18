"use client";

import { useState } from "react";
import {
  EDUCATION_LEVELS,
  EducationLevel,
  FUNDING_TYPES,
  FundingType,
  PROVIDER_TYPES,
  ProviderType,
  Scholarship,
  ScholarshipStatus,
  Scope,
  SCOPES,
} from "@dreamworkabroad/shared";

export interface ScholarshipFormValues {
  title: string;
  provider: string;
  providerType: ProviderType;
  scope: Scope;
  destinationCountry: string;
  educationLevel: EducationLevel[];
  fieldOfStudy: string;
  fundingType: FundingType;
  deadline: string;
  isRecurringAnnual: boolean;
  officialApplicationUrl: string;
  shortDescription: string;
  eligibilitySummary: string;
  applicationTimeline: string;
  featured: boolean;
  featuredUntil: string;
  status: ScholarshipStatus;
}

function toFormValues(s?: Scholarship): ScholarshipFormValues {
  return {
    title: s?.title ?? "",
    provider: s?.provider ?? "",
    providerType: s?.providerType ?? "private",
    scope: s?.scope ?? "malaysia",
    destinationCountry: s?.destinationCountry ?? "Malaysia",
    educationLevel: s?.educationLevel ?? ["undergraduate"],
    fieldOfStudy: s?.fieldOfStudy ?? "Any",
    fundingType: s?.fundingType ?? "partial",
    deadline: s?.deadline ?? "",
    isRecurringAnnual: s?.isRecurringAnnual ?? false,
    officialApplicationUrl: s?.officialApplicationUrl ?? "",
    shortDescription: s?.shortDescription ?? "",
    eligibilitySummary: s?.eligibilitySummary ?? "",
    applicationTimeline: s?.applicationTimeline ?? "",
    featured: s?.featured ?? false,
    featuredUntil: s?.featuredUntil ?? "",
    status: s?.status ?? "published",
  };
}

const ALL_LEVELS = Object.values(EDUCATION_LEVELS);
const ALL_PROVIDER_TYPES = Object.values(PROVIDER_TYPES);
const ALL_FUNDING_TYPES = Object.values(FUNDING_TYPES);
const ALL_SCOPES = Object.values(SCOPES);
const ALL_STATUSES: ScholarshipStatus[] = ["pending", "published", "rejected", "expired"];

const inputClass =
  "w-full rounded-lg border border-border dark:border-border2 bg-bg dark:bg-bg2 px-3 py-2 text-sm text-text dark:text-text2 outline-none focus:ring-2 focus:ring-primary";
const labelClass = "mb-1 block text-xs font-medium text-textMuted dark:text-textMuted2";

export default function ScholarshipForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial?: Scholarship;
  onSubmit: (values: ScholarshipFormValues) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [values, setValues] = useState<ScholarshipFormValues>(() => toFormValues(initial));

  function set<K extends keyof ScholarshipFormValues>(key: K, value: ScholarshipFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function toggleLevel(level: EducationLevel) {
    setValues((v) => ({
      ...v,
      educationLevel: v.educationLevel.includes(level)
        ? v.educationLevel.filter((l) => l !== level)
        : [...v.educationLevel, level],
    }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="flex flex-col gap-4 rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Title</label>
          <input required value={values.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Provider</label>
          <input
            required
            value={values.provider}
            onChange={(e) => set("provider", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Provider type</label>
          <select
            value={values.providerType}
            onChange={(e) => set("providerType", e.target.value as ProviderType)}
            className={inputClass}
          >
            {ALL_PROVIDER_TYPES.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Scope</label>
          <select
            value={values.scope}
            onChange={(e) => set("scope", e.target.value as Scope)}
            className={inputClass}
          >
            {ALL_SCOPES.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Destination country</label>
          <input
            required
            value={values.destinationCountry}
            onChange={(e) => set("destinationCountry", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Field of study</label>
          <input
            value={values.fieldOfStudy}
            onChange={(e) => set("fieldOfStudy", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Funding type</label>
          <select
            value={values.fundingType}
            onChange={(e) => set("fundingType", e.target.value as FundingType)}
            className={inputClass}
          >
            {ALL_FUNDING_TYPES.map((ft) => (
              <option key={ft.id} value={ft.id}>
                {ft.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Deadline</label>
          <input
            required
            type="date"
            value={values.deadline}
            onChange={(e) => set("deadline", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select
            value={values.status}
            onChange={(e) => set("status", e.target.value as ScholarshipStatus)}
            className={inputClass}
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Official application URL</label>
          <input
            required
            type="url"
            value={values.officialApplicationUrl}
            onChange={(e) => set("officialApplicationUrl", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Education level (select all that apply)</label>
        <div className="flex flex-wrap gap-3">
          {ALL_LEVELS.map((l) => (
            <label key={l.id} className="flex items-center gap-1.5 text-sm text-text dark:text-text2">
              <input
                type="checkbox"
                checked={values.educationLevel.includes(l.id)}
                onChange={() => toggleLevel(l.id)}
                className="h-4 w-4 accent-primary dark:accent-primary2"
              />
              {l.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Short description</label>
        <textarea
          rows={2}
          value={values.shortDescription}
          onChange={(e) => set("shortDescription", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>General entry requirements</label>
        <textarea
          rows={2}
          value={values.eligibilitySummary}
          onChange={(e) => set("eligibilitySummary", e.target.value)}
          placeholder="e.g. Malaysian citizen, minimum CGPA 3.5, subject to a service bond"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Application timeline</label>
        <textarea
          rows={2}
          value={values.applicationTimeline}
          onChange={(e) => set("applicationTimeline", e.target.value)}
          placeholder="e.g. Applications open in August and close in early November; interviews run February-March, results in July"
          className={inputClass}
        />
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex items-center gap-1.5 text-sm text-text dark:text-text2">
          <input
            type="checkbox"
            checked={values.isRecurringAnnual}
            onChange={(e) => set("isRecurringAnnual", e.target.checked)}
            className="h-4 w-4 accent-primary dark:accent-primary2"
          />
          Recurring annually
        </label>
        <label className="flex items-center gap-1.5 text-sm text-text dark:text-text2">
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="h-4 w-4 accent-primary dark:accent-primary2"
          />
          Featured (sponsored placement)
        </label>
        {values.featured && (
          <div>
            <label className={labelClass}>Featured until</label>
            <input
              type="date"
              value={values.featuredUntil}
              onChange={(e) => set("featuredUntil", e.target.value)}
              className={inputClass}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-border dark:border-border2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl2 border border-border dark:border-border2 px-4 py-2 text-sm text-textMuted dark:text-textMuted2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl2 bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryDark disabled:opacity-50 dark:bg-primary2 dark:text-bg2"
        >
          {submitting ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

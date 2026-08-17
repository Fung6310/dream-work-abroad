"use client";

import { ProviderType, PROVIDER_TYPES } from "@dreamworkabroad/shared";

const SERIES_VARS = [
  "--series-1",
  "--series-2",
  "--series-3",
  "--series-4",
  "--series-5",
  "--series-6",
  "--series-7",
  "--series-8",
];

export default function ProviderTypeBarChart({
  title,
  data,
}: {
  title: string;
  data: { providerType: ProviderType; clicks: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.clicks));

  return (
    <div className="viz-root rounded-xl2 border border-border dark:border-border2 p-4" style={{ background: "var(--chart-surface)" }}>
      <p className="mb-3 text-sm font-semibold" style={{ color: "var(--ink-primary)" }}>
        {title}
      </p>
      <div className="flex flex-col gap-2.5">
        {data.map((d, i) => {
          const pct = Math.max(2, (d.clicks / max) * 100);
          return (
            <div key={d.providerType} className="flex items-center gap-3" title={`${PROVIDER_TYPES[d.providerType].label}: ${d.clicks}`}>
              <span className="w-24 shrink-0 text-xs" style={{ color: "var(--ink-secondary)" }}>
                {PROVIDER_TYPES[d.providerType].label}
              </span>
              <div className="h-2.5 flex-1 rounded-full" style={{ background: "var(--gridline)" }}>
                <div
                  className="h-2.5 rounded-full transition-[width]"
                  style={{ width: `${pct}%`, background: `var(${SERIES_VARS[i % SERIES_VARS.length]})` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-xs tabular-nums" style={{ color: "var(--ink-primary)" }}>
                {d.clicks}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

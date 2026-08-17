export default function TopScholarshipsList({
  data,
}: {
  data: { scholarshipId: string; title: string; clicks: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.clicks));

  if (data.length === 0) {
    return (
      <div className="viz-root rounded-xl2 border border-border dark:border-border2 p-4" style={{ background: "var(--chart-surface)" }}>
        <p className="text-sm" style={{ color: "var(--ink-secondary)" }}>
          No apply-clicks recorded yet — browse the public site and click &quot;Apply Now&quot; to see this fill in.
        </p>
      </div>
    );
  }

  return (
    <div className="viz-root rounded-xl2 border border-border dark:border-border2 p-4" style={{ background: "var(--chart-surface)" }}>
      <p className="mb-3 text-sm font-semibold" style={{ color: "var(--ink-primary)" }}>
        Top scholarships by apply-clicks
      </p>
      <div className="flex flex-col gap-2.5">
        {data.map((d) => (
          <div key={d.scholarshipId}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span style={{ color: "var(--ink-secondary)" }}>{d.title}</span>
              <span className="tabular-nums" style={{ color: "var(--ink-primary)" }}>
                {d.clicks}
              </span>
            </div>
            <div className="h-2 rounded-full" style={{ background: "var(--gridline)" }}>
              <div
                className="h-2 rounded-full"
                style={{ width: `${Math.max(3, (d.clicks / max) * 100)}%`, background: "var(--series-1)" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

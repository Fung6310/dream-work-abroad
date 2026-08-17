"use client";

import { useState } from "react";

export default function ClicksLineChart({ data }: { data: { date: string; clicks: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const width = 640;
  const height = 180;
  const padL = 8;
  const padR = 8;
  const padT = 12;
  const padB = 24;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const max = Math.max(1, ...data.map((d) => d.clicks));
  const stepX = data.length > 1 ? plotW / (data.length - 1) : 0;
  const x = (i: number) => padL + i * stepX;
  const y = (v: number) => padT + plotH - (v / max) * plotH;

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.clicks)}`).join(" ");
  const areaPath = `${linePath} L${x(data.length - 1)},${padT + plotH} L${x(0)},${padT + plotH} Z`;

  function onMove(e: React.MouseEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const i = Math.round((relX - padL) / (stepX || 1));
    setHover(Math.min(data.length - 1, Math.max(0, i)));
  }

  const gridLines = [0, 0.5, 1];

  return (
    <div
      className="viz-root rounded-xl2 border border-border dark:border-border2 p-4"
      style={{ background: "var(--chart-surface)" }}
    >
      <p className="mb-3 text-sm font-semibold" style={{ color: "var(--ink-primary)" }}>
        Apply-clicks — last 14 days
      </p>
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Apply-clicks over the last 14 days">
          {gridLines.map((g) => (
            <line
              key={g}
              x1={padL}
              x2={width - padR}
              y1={padT + plotH * (1 - g)}
              y2={padT + plotH * (1 - g)}
              stroke="var(--gridline)"
              strokeWidth={1}
            />
          ))}
          <path d={areaPath} fill="var(--series-1)" opacity={0.12} stroke="none" />
          <path d={linePath} fill="none" stroke="var(--series-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {data.map((d, i) =>
            i === 0 || i === data.length - 1 || i % 3 === 0 ? (
              <text key={i} x={x(i)} y={height - 4} fontSize={9} textAnchor="middle" fill="var(--ink-muted)">
                {d.date.slice(5)}
              </text>
            ) : null
          )}

          {hover !== null && (
            <>
              <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + plotH} stroke="var(--baseline)" strokeWidth={1} strokeDasharray="3 3" />
              <circle cx={x(hover)} cy={y(data[hover].clicks)} r={4} fill="var(--series-1)" stroke="var(--chart-surface)" strokeWidth={2} />
            </>
          )}

          <rect
            x={padL}
            y={0}
            width={plotW}
            height={height}
            fill="transparent"
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
          />
        </svg>

        {hover !== null && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-border dark:border-border2 bg-surface dark:bg-surface2 px-2 py-1 text-xs shadow-md"
            style={{ left: `${(x(hover) / width) * 100}%`, top: `${(y(data[hover].clicks) / height) * 100}%`, color: "var(--ink-primary)" }}
          >
            <div className="font-medium">{data[hover].date}</div>
            <div style={{ color: "var(--ink-secondary)" }}>{data[hover].clicks} clicks</div>
          </div>
        )}
      </div>
    </div>
  );
}

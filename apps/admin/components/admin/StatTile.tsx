export default function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-4">
      <p className="text-xs text-textMuted dark:text-textMuted2">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-text dark:text-text2">{value}</p>
      {hint && <p className="mt-1 text-xs text-textMuted dark:text-textMuted2">{hint}</p>}
    </div>
  );
}

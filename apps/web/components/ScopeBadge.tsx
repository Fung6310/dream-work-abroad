import { Scope, SCOPES } from "@dreamworkabroad/shared";

export default function ScopeBadge({ scope }: { scope: Scope }) {
  const info = SCOPES[scope];
  return (
    <span className="inline-flex items-center rounded-full border border-primary/40 px-2.5 py-0.5 text-xs font-medium text-primary dark:border-primary2/40 dark:text-primary2">
      {scope === "malaysia" ? "🇲🇾" : "🌍"} {info.label}
    </span>
  );
}

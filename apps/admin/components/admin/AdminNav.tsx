"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/queue", label: "Review Queue" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/leads", label: "Leads" },
];

export default function AdminNav({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between border-b border-border dark:border-border2 pb-4">
      <nav className="flex items-center gap-1">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-white dark:bg-primary2 dark:text-bg2"
                  : "text-textMuted hover:bg-bgAlt dark:text-textMuted2 dark:hover:bg-bgAlt2"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={onLogout}
        className="rounded-xl2 border border-border dark:border-border2 px-3 py-2 text-sm text-textMuted dark:text-textMuted2"
      >
        Sign out
      </button>
    </div>
  );
}

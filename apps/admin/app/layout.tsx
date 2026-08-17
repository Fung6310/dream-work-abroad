import type { Metadata } from "next";
import "./globals.css";

// Deliberately its own app on its own origin (see docs/ARCHITECTURE.md §9) —
// nothing here is linked from the student-facing site, and this layout
// carries no student-facing nav/branding so the two never bleed into each
// other.
export const metadata: Metadata = {
  title: "DreamWorkAbroad — Staff Back Office",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-border dark:border-border2 bg-surface dark:bg-surface2">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primaryDark text-white dark:bg-primary2 dark:text-bg2 text-sm font-bold">
                D
              </span>
              <span className="font-semibold text-text dark:text-text2">DreamWorkAbroad</span>
              <span className="rounded-full bg-bgAlt dark:bg-bgAlt2 px-2 py-0.5 text-[11px] font-medium text-textMuted dark:text-textMuted2">
                Staff only
              </span>
            </div>
          </div>
        </header>
        <main className="mx-auto min-h-[calc(100vh-52px)] max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

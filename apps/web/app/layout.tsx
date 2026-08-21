import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "DreamWorkAbroad — Scholarships for Malaysian Students, in One Place",
  description:
    "Search and compare government, university, foundation and international scholarships open to Malaysian students — funding type, deadline and eligibility at a glance.",
};

const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Only loads once a real AdSense publisher id is set — see docs/MONETIZATION.md. */}
        {ADSENSE_PUBLISHER_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <header className="border-b border-border dark:border-border2 bg-surface/80 dark:bg-surface2/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white dark:bg-primary2 dark:text-bg2 font-bold">
                D
              </span>
              <span className="text-lg font-semibold text-text dark:text-text2">DreamWorkAbroad</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-textMuted dark:text-textMuted2">
              <Link href="/" className="hover:text-primary dark:hover:text-primary2">
                Home
              </Link>
              <Link href="/undergraduate" className="hover:text-primary dark:hover:text-primary2">
                Undergraduate
              </Link>
              <Link href="/postgraduate" className="hover:text-primary dark:hover:text-primary2">
                Postgraduate
              </Link>
              <Link href="/premium" className="hover:text-primary dark:hover:text-primary2">
                Premium
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto min-h-[calc(100vh-64px)] max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t border-border dark:border-border2 px-4 py-6 text-center text-xs text-textMuted dark:text-textMuted2">
          <p>
            DreamWorkAbroad is an information directory, not a scholarship provider — always apply on the
            official provider&apos;s own site.
          </p>
          <p className="mt-2">
            <Link href="/partners" className="font-medium text-primary hover:underline dark:text-primary2">
              For scholarship providers — get featured
            </Link>
          </p>
        </footer>
      </body>
    </html>
  );
}

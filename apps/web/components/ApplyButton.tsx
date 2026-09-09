import { goHref } from "@/lib/api";

// The ONLY element that ever points at /api/go/:id — a plain anchor, so the
// click-log-then-redirect works with zero client JS. Never link directly to
// officialApplicationUrl from anywhere else in the app.
export default function ApplyButton({ scholarshipId }: { scholarshipId: string }) {
  return (
    <a
      href={goHref(scholarshipId)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-xl2 bg-primary px-5 py-2.5 font-medium text-white shadow-sm transition-all hover:scale-105 hover:bg-primaryDark hover:shadow-md active:scale-95 dark:bg-primary2 dark:text-bg2 dark:hover:bg-primaryLight"
    >
      Apply Now →
    </a>
  );
}

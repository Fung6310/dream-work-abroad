import WaitlistForm from "@/components/WaitlistForm";

export const metadata = {
  title: "Premium — DreamWorkAbroad",
  description: "Deadline alerts, saved searches and a weekly digest of new scholarships — coming soon.",
};

const FEATURES = [
  { title: "Deadline alerts", body: "Get emailed a week before a saved scholarship's deadline closes." },
  { title: "Saved searches", body: "Save your filters (level, country, field) and get notified of new matches." },
  { title: "Weekly digest", body: "One email a week summarising newly added and closing-soon scholarships." },
];

export default function PremiumPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
      <div>
        <h1 className="text-3xl font-bold text-text dark:text-text2">Never miss a deadline again</h1>
        <p className="mt-3 text-textMuted dark:text-textMuted2">
          DreamWorkAbroad Premium is on its way. Join the waitlist and we&apos;ll let you know the moment it&apos;s
          ready — no charge, no commitment.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-4 text-left"
          >
            <p className="font-semibold text-text dark:text-text2">{f.title}</p>
            <p className="mt-1 text-sm text-textMuted dark:text-textMuted2">{f.body}</p>
          </div>
        ))}
      </div>

      <div className="w-full max-w-sm">
        <WaitlistForm />
      </div>
    </div>
  );
}

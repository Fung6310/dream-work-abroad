// "Getting ready to go?" — study-abroad essentials that apply regardless of
// which scholarship a student ends up winning (insurance, sending money,
// English tests, accommodation). These are plain organic links today; once
// you sign up for a program's affiliate/referral scheme, set the matching
// NEXT_PUBLIC_AFFILIATE_* env var to your tracked URL and it swaps over
// automatically — no code change needed. See docs/MONETIZATION.md §4.
const ESSENTIALS: {
  id: string;
  label: string;
  blurb: string;
  defaultUrl: string;
  envVar: string;
}[] = [
  {
    id: "insurance",
    label: "Travel & health insurance",
    blurb: "Cover most visa applications and universities require proof of.",
    defaultUrl: "https://safetywing.com/",
    envVar: "NEXT_PUBLIC_AFFILIATE_INSURANCE_URL",
  },
  {
    id: "money-transfer",
    label: "Send money abroad",
    blurb: "Pay tuition or living costs without bank wire fees.",
    defaultUrl: "https://wise.com/",
    envVar: "NEXT_PUBLIC_AFFILIATE_MONEY_TRANSFER_URL",
  },
  {
    id: "ielts",
    label: "Book your IELTS test",
    blurb: "Most international scholarships require an English score on file.",
    defaultUrl: "https://ielts.org/book-a-test",
    envVar: "NEXT_PUBLIC_AFFILIATE_IELTS_URL",
  },
  {
    id: "accommodation",
    label: "Student accommodation abroad",
    blurb: "Verified rooms near your university, bookable before you land.",
    defaultUrl: "https://www.housinganywhere.com/",
    envVar: "NEXT_PUBLIC_AFFILIATE_ACCOMMODATION_URL",
  },
];

export default function TravelEssentialsRail() {
  return (
    <div className="rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-4">
      <h2 className="mb-1 font-semibold text-text dark:text-text2">Getting ready to go?</h2>
      <p className="mb-3 text-sm text-textMuted dark:text-textMuted2">
        A few things most scholarship recipients end up needing, whichever programme they win.
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ESSENTIALS.map((item) => {
          const url = process.env[item.envVar] || item.defaultUrl;
          return (
            <a
              key={item.id}
              href={url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex flex-col gap-0.5 rounded-xl border border-border dark:border-border2 p-3 transition-colors hover:border-primary dark:hover:border-primary2"
            >
              <span className="text-sm font-medium text-text dark:text-text2">{item.label}</span>
              <span className="text-xs text-textMuted dark:text-textMuted2">{item.blurb}</span>
            </a>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-textMuted dark:text-textMuted2">
        Independent services, not part of your scholarship application — DreamWorkAbroad may earn a referral fee if
        you sign up through these links, at no extra cost to you.
      </p>
    </div>
  );
}

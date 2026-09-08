// "Getting ready to go?" — study-abroad essentials that apply regardless of
// which scholarship a student ends up winning (insurance, sending money,
// English tests, accommodation). No redirect anywhere until there's an
// actual signed sponsor/affiliate deal for that item — set the matching
// NEXT_PUBLIC_AFFILIATE_* env var to the sponsor's tracked URL and that card
// becomes a real link automatically; until then it's informational only, no
// click, no outbound URL. See docs/MONETIZATION.md §4.
const ESSENTIALS: {
  id: string;
  label: string;
  blurb: string;
  envVar: string;
}[] = [
  {
    id: "insurance",
    label: "Travel & health insurance",
    blurb: "Cover most visa applications and universities require proof of.",
    envVar: "NEXT_PUBLIC_AFFILIATE_INSURANCE_URL",
  },
  {
    id: "money-transfer",
    label: "Send money abroad",
    blurb: "Pay tuition or living costs without bank wire fees.",
    envVar: "NEXT_PUBLIC_AFFILIATE_MONEY_TRANSFER_URL",
  },
  {
    id: "ielts",
    label: "Book your IELTS test",
    blurb: "Most international scholarships require an English score on file.",
    envVar: "NEXT_PUBLIC_AFFILIATE_IELTS_URL",
  },
  {
    id: "accommodation",
    label: "Student accommodation abroad",
    blurb: "Verified rooms near your university, bookable before you land.",
    envVar: "NEXT_PUBLIC_AFFILIATE_ACCOMMODATION_URL",
  },
];

export default function TravelEssentialsRail() {
  const hasAnySponsor = ESSENTIALS.some((item) => process.env[item.envVar]);

  return (
    <div className="rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-4">
      <h2 className="mb-1 font-semibold text-text dark:text-text2">Getting ready to go?</h2>
      <p className="mb-3 text-sm text-textMuted dark:text-textMuted2">
        A few things most scholarship recipients end up needing, whichever programme they win.
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ESSENTIALS.map((item) => {
          const sponsorUrl = process.env[item.envVar];
          const content = (
            <>
              <span className="text-sm font-medium text-text dark:text-text2">{item.label}</span>
              <span className="text-xs text-textMuted dark:text-textMuted2">{item.blurb}</span>
            </>
          );

          // No sponsor for this one yet — informational card, not a link.
          if (!sponsorUrl) {
            return (
              <div
                key={item.id}
                className="flex flex-col gap-0.5 rounded-xl border border-border dark:border-border2 p-3"
              >
                {content}
              </div>
            );
          }

          return (
            <a
              key={item.id}
              href={sponsorUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex flex-col gap-0.5 rounded-xl border border-border dark:border-border2 p-3 transition-colors hover:border-primary dark:hover:border-primary2"
            >
              {content}
            </a>
          );
        })}
      </div>

      {hasAnySponsor ? (
        <p className="mt-3 text-xs text-textMuted dark:text-textMuted2">
          Independent services, not part of your scholarship application — DreamWorkAbroad may earn a referral fee
          if you sign up through these links, at no extra cost to you.
        </p>
      ) : (
        <p className="mt-3 text-xs text-textMuted dark:text-textMuted2">
          Independent services, not part of your scholarship application — informational only for now.
        </p>
      )}
    </div>
  );
}

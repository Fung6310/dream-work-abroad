// Ad placement placeholder. Renders a clearly-labeled empty box — never fake
// ad content — until NEXT_PUBLIC_ADSENSE_PUBLISHER_ID is set, at which point
// swap the placeholder <div> below for the real AdSense unit:
//
//   <ins
//     className="adsbygoogle"
//     style={{ display: "block" }}
//     data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
//     data-ad-slot="<your-ad-slot-id>"
//     data-ad-format="auto"
//     data-full-width-responsive="true"
//   />
//   <script dangerouslySetInnerHTML={{ __html: "(adsbygoogle = window.adsbygoogle || []).push({});" }} />
//
// See docs/MONETIZATION.md for the full AdSense application steps — this only
// works once the site has real traffic and content, per Google's policy.
export default function AdSlot({ label = "Advertisement" }: { label?: string }) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  if (!publisherId) {
    return (
      <div className="flex min-h-[90px] items-center justify-center rounded-xl2 border border-dashed border-border dark:border-border2 text-xs text-textMuted dark:text-textMuted2">
        {label}
      </div>
    );
  }

  // Real ad unit goes here once a publisher id exists — see comment above.
  return (
    <div className="flex min-h-[90px] items-center justify-center rounded-xl2 border border-dashed border-border dark:border-border2 text-xs text-textMuted dark:text-textMuted2">
      {label}
    </div>
  );
}

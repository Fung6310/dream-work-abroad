// Ad placement. Renders nothing at all until NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
// is set — an empty placeholder box on every page looks broken, not "coming
// soon", and there's no ad to show yet regardless. Once a publisher id
// exists, swap the block below for the real AdSense unit:
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
export default function AdSlot() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  if (!publisherId) return null;

  // Real ad unit goes here once a publisher id exists — see comment above.
  return null;
}

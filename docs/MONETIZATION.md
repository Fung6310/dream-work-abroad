# Monetization playbook

Everything below needs an account, a bank detail, or a signature that only you
can provide — I can't create accounts or handle money/payment credentials on
your behalf. This is the prep work and the exact steps for you to run through.
**Never paste API keys, bank account numbers, or personal ID numbers into
chat** — enter them directly on the provider's own site.

## 1. Google AdSense (display ads)

AdSense's policy requires a site to have real traffic and original content
before it'll approve an application — applying on day one with no visitors
will likely get rejected. Sequence:

1. Deploy the site publicly (a real domain, not `localhost`).
2. Add a Privacy Policy page (required by AdSense — a simple one covering what
   data you collect, e.g. premium waitlist emails and anonymous click logs, is
   enough to start).
3. Get some organic traffic and let the ~35-scholarship catalogue grow for a
   few weeks.
4. Apply at [adsense.google.com](https://adsense.google.com) with your site
   URL. Review typically takes anywhere from a few days to a few weeks.
5. Once approved, you'll get a publisher id (`ca-pub-XXXXXXXXXXXXXXXX`). Set it
   as `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` in `apps/web/.env.local` and swap the
   placeholder `<div>` in `apps/web/components/AdSlot.tsx` for the real
   `<ins class="adsbygoogle">` markup already documented in that file's
   comments.

## 2. Featured / sponsored listings

This is the fastest path to revenue since it doesn't need third-party account
approval — it's a direct conversation with the organizations already in the
catalogue (or new ones like study-abroad agents, test-prep providers, or
education loan companies).

**Who to approach first**: the private universities already listed (Sunway,
Taylor's, INTI, UCSI, Monash Malaysia, HELP, MMU) — they already pay for
paid search ads and open-day booths, so a featured listing is a familiar ask.

**This pitch is now live on the site, not just in this doc**: `/partners`
(linked from every page's footer — "For scholarship providers — get
featured") has the same pitch plus an inquiry form. Submissions land in
Admin → Leads tagged "Partner inquiry" with the organization name and their
message — check there first, not just your own outreach.

**Suggested pricing structure**: a flat fee per `featuredUntil` window (e.g.
RM 200–500/month for one featured slot, cheaper if pre-paying a quarter) is
simplest to sell and administer while there's no self-serve billing yet.
Adjust once you have real traffic numbers from Admin → Dashboard to point to
— apply-click counts per scholarship (Admin → Dashboard → Top scholarships)
are real usage data you can quote in a pitch.

**How to actually mark something featured**: Admin → Scholarships → Edit →
check "Featured" → set "Featured until" → Save. No payment processing is
built for this yet, so today's workflow is: agree the deal (via the
`/partners` inquiry or your own outreach) → invoice manually → toggle the
flag → invoice again to renew before it lapses.

## 3. Premium subscription (Stripe roadmap)

What's built now: an email-capture waitlist only (`/premium` page →
`PremiumLead` records → visible in Admin → Leads). No billing, no recurring
charges, nothing has been promised to anyone who signs up beyond "we'll email
you when it's ready."

To turn this into real billing later:

1. Create a Stripe account (needs your own business/bank details — this step
   is yours to do directly on stripe.com).
2. Decide the price and billing cadence for Premium (e.g. RM 9.90/month for
   deadline alerts + saved searches).
3. Integrate Stripe Checkout for the signup flow and a webhook endpoint
   (mirroring the shape of `routes/leads.ts`) to receive subscription
   status changes.
4. Migrate existing `PremiumLead` records into real subscriber records once
   billing is live — they're already opted in, so this is your first
   marketing list to convert.
5. Gate the actual premium features (deadline alert emails, saved searches)
   behind subscription status once they're built — neither exists yet in this
   codebase.

## 4. Study-abroad essentials referral rail

Every scholarship page currently sends 100% of "Apply" intent straight to the
official provider's site with nothing captured on the way. Separately from
the scholarship itself, most recipients also end up needing the same handful
of adjacent services — insurance, sending money, an English test, somewhere
to live — regardless of which scholarship they won. This is the same split
IDP Malaysia runs: the core directory/counselling stays free and untouched,
and referral income comes from clearly-separate services bolted on beside it.

**What's built now**: `apps/web/components/TravelEssentialsRail.tsx`, shown
on every scholarship detail page. It links out to four categories —
insurance, money transfer, IELTS booking, accommodation — using each
provider's plain homepage URL by default, so it's useful (and honest) even
before any affiliate account exists.

**To start earning from it**, sign up for one or more of these (each needs an
account only you can create):

- Insurance: [SafetyWing](https://safetywing.com/) affiliate program
- Money transfer: [Wise](https://wise.com/) affiliate program
- IELTS: [British Council](https://www.britishcouncil.org/) or another test
  provider's referral/partner program
- Accommodation: [HousingAnywhere](https://www.housinganywhere.com/) or
  [Amber](https://amberstudent.com/) affiliate program

Once approved, set the matching env var in `apps/web/.env.local`
(`NEXT_PUBLIC_AFFILIATE_INSURANCE_URL`, `NEXT_PUBLIC_AFFILIATE_MONEY_TRANSFER_URL`,
`NEXT_PUBLIC_AFFILIATE_IELTS_URL`, `NEXT_PUBLIC_AFFILIATE_ACCOMMODATION_URL`)
to your tracked referral link — the component picks it up automatically, no
code change needed. Leave any of them unset and that card just keeps linking
to the plain homepage.

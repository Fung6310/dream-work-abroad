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

**Draft pitch blurb** (adapt as needed):

> DreamWorkAbroad is a Malaysia-focused scholarship directory built to help
> students find and compare funding options in one place. We're offering a
> limited number of featured placements — your scholarship listing appears
> at the top of relevant searches with a highlighted badge, for a flat fee
> per [month/quarter]. Happy to share early traffic and click-through numbers.

**Suggested pricing structure**: a flat fee per `featuredUntil` window (e.g.
RM 200–500/month for one featured slot, cheaper if pre-paying a quarter) is
simplest to sell and administer while there's no self-serve billing yet.
Adjust once you have real traffic numbers from Admin → Dashboard to point to.

**How to actually mark something featured**: Admin → Scholarships → Edit →
check "Featured" → set "Featured until" → Save. No payment processing is
built for this yet, so today's workflow is: agree the deal → invoice manually
→ toggle the flag → invoice again to renew before it lapses.

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

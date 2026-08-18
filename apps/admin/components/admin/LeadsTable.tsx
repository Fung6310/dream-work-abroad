import { PremiumLead } from "@dreamworkabroad/shared";

// Leads come from two capture points sharing one table (see routes/leads.ts):
// a scholarship's own "remind me" CTA (scholarshipTitle set) or a /partners
// provider inquiry (message set, no scholarship). Both surfaced here so
// context isn't lost — a lead with no context is just the general /premium form.
export default function LeadsTable({ leads }: { leads: PremiumLead[] }) {
  if (leads.length === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-border dark:border-border2 p-8 text-center text-textMuted dark:text-textMuted2">
        No leads yet — they&apos;ll show up here from /premium signups, a scholarship&apos;s &quot;remind me&quot;
        button, or a /partners inquiry.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl2 border border-border dark:border-border2">
      <table className="w-full text-left text-sm">
        <thead className="bg-bgAlt dark:bg-bgAlt2 text-xs uppercase tracking-wide text-textMuted dark:text-textMuted2">
          <tr>
            <th className="px-4 py-2.5">Email</th>
            <th className="px-4 py-2.5">Name</th>
            <th className="px-4 py-2.5">Context</th>
            <th className="px-4 py-2.5">Joined</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id} className="border-t border-border dark:border-border2">
              <td className="px-4 py-2.5 font-medium text-text dark:text-text2">{l.email}</td>
              <td className="px-4 py-2.5 text-textMuted dark:text-textMuted2">{l.name || "—"}</td>
              <td className="px-4 py-2.5 text-textMuted dark:text-textMuted2">
                {l.scholarshipTitle ? (
                  <span>
                    <span className="rounded-full bg-featuredBadgeBg dark:bg-featuredBadgeBg2 px-2 py-0.5 text-xs font-medium text-featuredBadgeText dark:text-featuredBadgeText2">
                      Reminder
                    </span>{" "}
                    {l.scholarshipTitle}
                  </span>
                ) : l.message ? (
                  <span>
                    <span className="rounded-full bg-statusPublishedBg dark:bg-statusPublishedBg2 px-2 py-0.5 text-xs font-medium text-statusPublishedText dark:text-statusPublishedText2">
                      Partner inquiry
                    </span>{" "}
                    {l.message}
                  </span>
                ) : (
                  <span className="capitalize">{l.interestLevel ? `Premium — ${l.interestLevel}` : "Premium (general)"}</span>
                )}
              </td>
              <td className="px-4 py-2.5 text-textMuted dark:text-textMuted2">
                {new Date(l.timestamp).toLocaleDateString("en-MY")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

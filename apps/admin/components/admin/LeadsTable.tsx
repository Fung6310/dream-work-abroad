import { PremiumLead } from "@dreamworkabroad/shared";

export default function LeadsTable({ leads }: { leads: PremiumLead[] }) {
  if (leads.length === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-border dark:border-border2 p-8 text-center text-textMuted dark:text-textMuted2">
        No waitlist signups yet — they&apos;ll show up here as soon as someone submits the /premium form.
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
            <th className="px-4 py-2.5">Interested level</th>
            <th className="px-4 py-2.5">Joined</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id} className="border-t border-border dark:border-border2">
              <td className="px-4 py-2.5 font-medium text-text dark:text-text2">{l.email}</td>
              <td className="px-4 py-2.5 text-textMuted dark:text-textMuted2">{l.name || "—"}</td>
              <td className="px-4 py-2.5 text-textMuted dark:text-textMuted2 capitalize">{l.interestLevel || "—"}</td>
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

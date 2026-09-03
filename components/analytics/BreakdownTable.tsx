import type { CountedEntry } from "@/lib/analytics/adminQueries";

interface BreakdownTableProps {
  title: string;
  labelHeader: string;
  entries: CountedEntry[];
  emptyMessage?: string;
}

/** Generic label/count table - reused for top pages, referrers, geography, and device/browser/OS breakdowns. */
export function BreakdownTable({ title, labelHeader, entries, emptyMessage }: BreakdownTableProps) {
  return (
    <div className="border border-brand-gold/20 rounded-sm bg-white px-5 py-6">
      <h2 className="font-heading text-lg font-semibold text-brand-charcoal mb-4">{title}</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-brand-charcoal/50 italic">{emptyMessage ?? "No data for this period yet."}</p>
      ) : (
        <table className="w-full text-sm">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr className="border-b border-brand-gold/15 text-left">
              <th scope="col" className="font-medium text-brand-charcoal/60 pb-2">
                {labelHeader}
              </th>
              <th scope="col" className="font-medium text-brand-charcoal/60 pb-2 text-right">
                Count
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.label} className="border-b border-brand-gold/10 last:border-b-0">
                <td className="py-2 text-brand-charcoal">{entry.label}</td>
                <td className="py-2 text-brand-charcoal/80 text-right tabular-nums">{entry.count.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

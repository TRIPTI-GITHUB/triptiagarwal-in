"use client";

import { useId, useState } from "react";
import type { DailyVisitCount } from "@/lib/analytics/adminQueries";

interface VisitsChartProps {
  data: DailyVisitCount[];
}

function formatDayLabel(day: string): string {
  const [, month, date] = day.split("-");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthNames[Number(month) - 1]} ${Number(date)}`;
}

/**
 * Daily visits over the selected window - same lightweight approach
 * as components/coins/YearHistogram.tsx (plain HTML/CSS bars, no
 * charting library): a single-series magnitude chart over a modest
 * number of buckets is exactly the case where that's both simplest
 * and most robust.
 */
export function VisitsChart({ data }: VisitsChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const tableId = useId();

  if (data.length === 0) return null;

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const peakIndex = data.findIndex((d) => d.count === maxCount && maxCount > 0);
  const tickEvery = Math.ceil(data.length / 10);

  return (
    <section aria-labelledby={`${tableId}-heading`} className="border border-brand-gold/20 rounded-sm bg-white px-5 py-6 mb-10">
      <h2 id={`${tableId}-heading`} className="font-heading text-lg font-semibold text-brand-charcoal mb-1">
        Visits over time
      </h2>
      <p className="text-sm text-brand-charcoal/60 mb-6">
        {formatDayLabel(data[0].day)} – {formatDayLabel(data[data.length - 1].day)}
      </p>

      <div className="flex items-end gap-0.5 h-48 border-b border-brand-charcoal/15">
        {data.map((entry, i) => {
          const heightPct = maxCount > 0 ? (entry.count / maxCount) * 100 : 0;
          const isPeak = i === peakIndex;
          const isHovered = hovered === i;
          return (
            <div key={entry.day} className="relative flex-1 h-full flex items-end justify-center">
              {isPeak && (
                <span className="absolute -top-5 text-xs font-medium text-brand-charcoal whitespace-nowrap">
                  {entry.count}
                </span>
              )}
              {isHovered && !isPeak && (
                <span
                  role="tooltip"
                  className="absolute -top-8 z-10 px-2 py-1 rounded bg-brand-charcoal text-white text-xs whitespace-nowrap"
                >
                  {formatDayLabel(entry.day)}: {entry.count}
                </span>
              )}
              <button
                type="button"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                aria-label={`${formatDayLabel(entry.day)}: ${entry.count} visit${entry.count === 1 ? "" : "s"}`}
                className={`w-full min-h-[2px] rounded-t-sm transition-colors ${
                  isPeak || isHovered ? "bg-brand-teal" : "bg-brand-gold"
                }`}
                style={{ height: `${Math.max(heightPct, 1)}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-0.5 mt-1.5">
        {data.map((entry, i) => (
          <span key={entry.day} className="flex-1 text-center text-[9px] text-brand-charcoal/50">
            {i % tickEvery === 0 ? formatDayLabel(entry.day) : ""}
          </span>
        ))}
      </div>

      <table className="sr-only">
        <caption>Visits per day</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Visits</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
            <tr key={entry.day}>
              <td>{entry.day}</td>
              <td>{entry.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

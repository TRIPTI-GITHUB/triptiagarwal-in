"use client";

import { useId, useState } from "react";
import type { YearBucket } from "@/lib/coins/queries";

interface YearHistogramProps {
  buckets: YearBucket[];
}

function decadeLabel(decadeStart: number): string {
  return `${decadeStart}s`;
}

function decadeTick(decadeStart: number): string {
  return `'${String(decadeStart).slice(-2)}`;
}

/**
 * YearHistogram
 * A world-map view was the other option for this overview visual, but
 * `coins.country` is free text (84 distinct values with variants like
 * "United Kingdom, British Overseas Territories and Crown
 * Dependencies") with no ISO code column to match against a topojson
 * map reliably, and a wrong-country highlight is worse than no map. A
 * decade histogram uses the existing clean `year` integer directly,
 * needs no new dependency or geo data, and is simple to keep accessible.
 *
 * Plain HTML/CSS bars rather than a charting library or hand-rolled
 * SVG path math - a single-series magnitude chart over ~19 buckets is
 * exactly the case where a flex row of divs is both the simplest and
 * the most robust choice (trivial tooltip positioning, no viewBox
 * scaling, real focusable DOM nodes for keyboard users).
 */
export function YearHistogram({ buckets }: YearHistogramProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const tableId = useId();

  if (buckets.length === 0) {
    return null;
  }

  const maxCount = Math.max(...buckets.map((b) => b.count));
  const peakIndex = buckets.findIndex((b) => b.count === maxCount);

  return (
    <section aria-labelledby={`${tableId}-heading`} className="border border-brand-gold/20 rounded-sm bg-white px-5 py-6 mb-10">
      <h2 id={`${tableId}-heading`} className="font-heading text-lg font-semibold text-brand-charcoal mb-1">
        Coins by decade of mint
      </h2>
      <p className="text-sm text-brand-charcoal/60 mb-6">
        {buckets[0].decadeStart}s–{buckets[buckets.length - 1].decadeStart}s, by count minted per decade
      </p>

      <div className="flex items-end gap-1 sm:gap-1.5 h-48 border-b border-brand-charcoal/15">
        {buckets.map((bucket, i) => {
          const heightPct = maxCount > 0 ? (bucket.count / maxCount) * 100 : 0;
          const isPeak = i === peakIndex;
          const isHovered = hovered === i;
          return (
            <div key={bucket.decadeStart} className="relative flex-1 h-full flex items-end justify-center">
              {isPeak && (
                <span className="absolute -top-5 text-xs font-medium text-brand-charcoal whitespace-nowrap">
                  {bucket.count}
                </span>
              )}
              {isHovered && !isPeak && (
                <span
                  role="tooltip"
                  className="absolute -top-8 z-10 px-2 py-1 rounded bg-brand-charcoal text-white text-xs whitespace-nowrap"
                >
                  {decadeLabel(bucket.decadeStart)}: {bucket.count} coin{bucket.count === 1 ? "" : "s"}
                </span>
              )}
              <button
                type="button"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                aria-label={`${decadeLabel(bucket.decadeStart)}: ${bucket.count} coin${bucket.count === 1 ? "" : "s"}`}
                className={`w-full min-h-[2px] rounded-t-md transition-colors ${
                  isPeak || isHovered ? "bg-brand-teal" : "bg-brand-gold"
                }`}
                style={{ height: `${Math.max(heightPct, 1)}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-1 sm:gap-1.5 mt-1.5">
        {buckets.map((bucket) => (
          <span key={bucket.decadeStart} className="flex-1 text-center text-[10px] text-brand-charcoal/50">
            {decadeTick(bucket.decadeStart)}
          </span>
        ))}
      </div>

      <table className="sr-only">
        <caption>Number of coins minted per decade</caption>
        <thead>
          <tr>
            <th scope="col">Decade</th>
            <th scope="col">Coins</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((bucket) => (
            <tr key={bucket.decadeStart}>
              <td>{decadeLabel(bucket.decadeStart)}</td>
              <td>{bucket.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

"use client";

import { COIN_SORT_OPTIONS } from "@/lib/coins/queries";
import { useCoinFilterParams } from "@/components/coins/useCoinFilterParams";

export function CoinSortControl() {
  const { searchParams, setParams } = useCoinFilterParams();
  const current = searchParams.get("sort") ?? "recent";

  return (
    <label className="flex items-center gap-2 text-sm text-brand-charcoal/70 whitespace-nowrap">
      Sort by
      <select
        value={current}
        onChange={(e) => setParams({ sort: e.target.value === "recent" ? null : e.target.value })}
        aria-label="Sort coins"
        className="rounded-full border border-brand-gold/30 bg-white px-3 py-2 text-sm text-brand-charcoal outline-none focus:border-brand-gold"
      >
        {COIN_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

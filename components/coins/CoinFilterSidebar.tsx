"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CoinFacets } from "@/lib/coins/queries";
import { useCoinFilterParams } from "@/components/coins/useCoinFilterParams";

interface CoinFilterSidebarProps {
  facets: CoinFacets;
}

interface FacetSelectProps {
  label: string;
  options: { value: string; count: number }[];
  current: string;
  onChange: (value: string | null) => void;
}

function FacetSelect({ label, options, current, onChange }: FacetSelectProps) {
  if (options.length === 0) return null;
  return (
    <label className="block text-sm">
      <span className="block font-medium text-brand-charcoal mb-1.5">{label}</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full rounded-md border border-brand-gold/30 bg-white px-3 py-2 text-sm text-brand-charcoal outline-none focus:border-brand-gold"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.value} ({option.count})
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * CoinFilterSidebar
 * Every facet is a single-value native <select> rather than a custom
 * multi-select widget - country/composition/mintmark run to dozens of
 * free-text values (see lib/coins/queries.ts), and a native select
 * keeps that list keyboard- and screen-reader-navigable for free
 * without building/maintaining a custom listbox component.
 */
export function CoinFilterSidebar({ facets }: CoinFilterSidebarProps) {
  const { searchParams, setParams } = useCoinFilterParams();
  const pathname = usePathname();

  const [yearMin, setYearMin] = useState(searchParams.get("yearMin") ?? "");
  const [yearMax, setYearMax] = useState(searchParams.get("yearMax") ?? "");

  useEffect(() => {
    setYearMin(searchParams.get("yearMin") ?? "");
    setYearMax(searchParams.get("yearMax") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const currentMin = searchParams.get("yearMin") ?? "";
      const currentMax = searchParams.get("yearMax") ?? "";
      if (yearMin !== currentMin || yearMax !== currentMax) {
        setParams({ yearMin: yearMin || null, yearMax: yearMax || null });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- debounced against latest input only
    }, 500);
    return () => clearTimeout(handle);
  }, [yearMin, yearMax]);

  const hasActiveFilters = Array.from(searchParams.keys()).some((key) => key !== "sort" && key !== "page");

  return (
    <aside className="space-y-6" aria-label="Filter coins">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-brand-charcoal">Filters</h2>
        {hasActiveFilters && (
          <Link href={pathname} className="text-xs text-brand-gold hover:underline" scroll={false}>
            Clear all
          </Link>
        )}
      </div>

      <FacetSelect
        label="Country"
        options={facets.countries}
        current={searchParams.get("country") ?? ""}
        onChange={(value) => setParams({ country: value })}
      />

      <FacetSelect
        label="Type"
        options={facets.coinTypes}
        current={searchParams.get("type") ?? ""}
        onChange={(value) => setParams({ type: value })}
      />

      <FacetSelect
        label="Composition"
        options={facets.compositions}
        current={searchParams.get("composition") ?? ""}
        onChange={(value) => setParams({ composition: value })}
      />

      <FacetSelect
        label="Grade"
        options={facets.grades}
        current={searchParams.get("grade") ?? ""}
        onChange={(value) => setParams({ grade: value })}
      />

      <FacetSelect
        label="Mintmark"
        options={facets.mintmarks}
        current={searchParams.get("mintmark") ?? ""}
        onChange={(value) => setParams({ mintmark: value })}
      />

      <div>
        <span className="block text-sm font-medium text-brand-charcoal mb-1.5">
          Year {facets.yearMin !== null && facets.yearMax !== null ? `(${facets.yearMin}–${facets.yearMax})` : ""}
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={yearMin}
            onChange={(e) => setYearMin(e.target.value)}
            placeholder={facets.yearMin?.toString() ?? "From"}
            aria-label="Earliest year"
            className="w-full rounded-md border border-brand-gold/30 bg-white px-3 py-2 text-sm text-brand-charcoal outline-none focus:border-brand-gold"
          />
          <span className="text-brand-charcoal/40">–</span>
          <input
            type="number"
            inputMode="numeric"
            value={yearMax}
            onChange={(e) => setYearMax(e.target.value)}
            placeholder={facets.yearMax?.toString() ?? "To"}
            aria-label="Latest year"
            className="w-full rounded-md border border-brand-gold/30 bg-white px-3 py-2 text-sm text-brand-charcoal outline-none focus:border-brand-gold"
          />
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-brand-charcoal cursor-pointer">
        <input
          type="checkbox"
          checked={searchParams.get("exchange") === "1"}
          onChange={(e) => setParams({ exchange: e.target.checked ? "1" : null })}
          className="h-4 w-4 rounded border-brand-gold/40 text-brand-gold focus:ring-brand-gold"
        />
        Available for exchange
      </label>
    </aside>
  );
}

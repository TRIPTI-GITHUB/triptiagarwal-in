"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useCoinFilterParams } from "@/components/coins/useCoinFilterParams";

/**
 * Debounced title/country/issuer search. Reads the current `q` value
 * from the URL so the field survives a page reload or shared link,
 * and only pushes a new URL 350ms after the visitor stops typing.
 */
export function CoinSearchBar() {
  const { searchParams, setParams } = useCoinFilterParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (value !== initialQuery) {
        setParams({ q: value.trim() || null });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run on value change; comparing against the latest URL value here would cause an infinite loop
    }, 350);
    return () => clearTimeout(handle);
  }, [value]);

  return (
    <div className="relative w-full">
      <Search
        size={18}
        strokeWidth={1.5}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-charcoal/40 pointer-events-none"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by title, country, or issuer…"
        aria-label="Search coins by title, country, or issuer"
        className="w-full pl-10 pr-4 py-2.5 rounded-full border border-brand-gold/30 text-sm outline-none focus:border-brand-gold bg-white"
      />
    </div>
  );
}

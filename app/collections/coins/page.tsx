import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CollectionGrid } from "@/components/ui/CollectionGrid";
import { CoinCard } from "@/components/coins/CoinCard";
import { CoinFilterSidebar } from "@/components/coins/CoinFilterSidebar";
import { CoinSearchBar } from "@/components/coins/CoinSearchBar";
import { CoinSortControl } from "@/components/coins/CoinSortControl";
import { CoinsStatsStrip } from "@/components/coins/CoinsStatsStrip";
import { CoinsPagination } from "@/components/coins/CoinsPagination";
import { YearHistogram } from "@/components/coins/YearHistogram";
import { createClient } from "@/lib/supabase/server";
import {
  COINS_PAGE_SIZE,
  bucketYearsByDecade,
  fetchCoinFacetsAndStats,
  fetchCoins,
  parseCoinFilters,
} from "@/lib/coins/queries";

export const metadata: Metadata = {
  title: "Coins",
  description: "A searchable, sortable catalog of Indian and world coins — by country, composition, and year.",
};

interface CoinsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function toURLSearchParams(raw: { [key: string]: string | string[] | undefined }): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value !== undefined) {
      params.set(key, value);
    }
  }
  return params;
}

export default async function CoinsPage({ searchParams }: CoinsPageProps) {
  const rawSearchParams = await searchParams;
  const filters = parseCoinFilters(rawSearchParams);
  const supabase = await createClient();

  const [{ coins, total }, { facets, stats, years }] = await Promise.all([
    fetchCoins(supabase, filters),
    fetchCoinFacetsAndStats(supabase),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / COINS_PAGE_SIZE));
  const yearBuckets = bucketYearsByDecade(years);

  return (
    <Section>
      <Container>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-charcoal mb-3">Coins</h1>
        <p className="text-lg text-brand-charcoal/70 mb-10 max-w-2xl">
          A searchable catalog of the collection — by country, composition, grade, and year.
        </p>

        <CoinsStatsStrip stats={stats} />
        <YearHistogram buckets={yearBuckets} />

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1">
            <CoinSearchBar />
          </div>
          <CoinSortControl />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
          <CoinFilterSidebar facets={facets} />

          <div>
            <p className="text-sm text-brand-charcoal/60 mb-4" aria-live="polite">
              {total.toLocaleString()} {total === 1 ? "coin" : "coins"} found
            </p>

            {coins.length > 0 ? (
              <CollectionGrid>
                {coins.map((coin) => (
                  <CoinCard key={coin.id} coin={coin} />
                ))}
              </CollectionGrid>
            ) : (
              <p className="text-brand-charcoal/70">No coins match these filters — try broadening your search.</p>
            )}

            <CoinsPagination
              currentPage={filters.page}
              totalPages={totalPages}
              basePath="/collections/coins"
              searchParams={toURLSearchParams(rawSearchParams)}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}

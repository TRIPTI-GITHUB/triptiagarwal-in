import type { SupabaseClient } from "@supabase/supabase-js";
import type { CoinGrade, CoinPublic, CoinType } from "@/lib/supabase/database.types";

export const COINS_PAGE_SIZE = 24;

export type CoinSort = "recent" | "year_desc" | "year_asc" | "country_asc";

export const COIN_SORT_OPTIONS: { value: CoinSort; label: string }[] = [
  { value: "recent", label: "Recently added" },
  { value: "year_desc", label: "Year (newest first)" },
  { value: "year_asc", label: "Year (oldest first)" },
  { value: "country_asc", label: "Country (A–Z)" },
];

export interface CoinFilters {
  search: string | null;
  country: string | null;
  coinType: CoinType | null;
  composition: string | null;
  grade: CoinGrade | null;
  mintmark: string | null;
  yearMin: number | null;
  yearMax: number | null;
  forExchangeOnly: boolean;
  sort: CoinSort;
  page: number;
}

type RawSearchParams = { [key: string]: string | string[] | undefined };

function firstValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function toInt(value: string | null): number | null {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * Turns the raw (awaited) `searchParams` object from the coins listing
 * page into a typed, defaulted filter set. Centralized here so the page
 * component, the filter sidebar, and the query builder all agree on the
 * same URL param names and defaults.
 */
export function parseCoinFilters(searchParams: RawSearchParams): CoinFilters {
  const sortParam = firstValue(searchParams.sort);
  const sort: CoinSort = COIN_SORT_OPTIONS.some((o) => o.value === sortParam)
    ? (sortParam as CoinSort)
    : "recent";

  return {
    search: firstValue(searchParams.q),
    country: firstValue(searchParams.country),
    coinType: firstValue(searchParams.type) as CoinType | null,
    composition: firstValue(searchParams.composition),
    grade: firstValue(searchParams.grade) as CoinGrade | null,
    mintmark: firstValue(searchParams.mintmark),
    yearMin: toInt(firstValue(searchParams.yearMin)),
    yearMax: toInt(firstValue(searchParams.yearMax)),
    forExchangeOnly: firstValue(searchParams.exchange) === "1",
    sort,
    page: Math.max(1, toInt(firstValue(searchParams.page)) ?? 1),
  };
}

/**
 * PostgREST's `.or()` filter takes a raw, comma-delimited filter-tree
 * string, so a search term containing `,`, `(`, `)`, or `"` could
 * otherwise break out of the intended `ilike` clauses. Wrapping the
 * value in double quotes (escaping internal backslashes/quotes) is
 * PostgREST's documented way to pass such values safely - see
 * https://postgrest.org/en/stable/references/api/tables_views.html#operators
 */
function quotePostgrestValue(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * Fetches one page of `coins_public` rows matching the given filters.
 * Deliberately never touches the base `coins` table - the view already
 * excludes buying_price_inr/estimate_inr/private_comment and is
 * pre-filtered to is_published = true, so this function has no way to
 * leak a private field even if a filter argument were malformed.
 */
export async function fetchCoins(
  supabase: SupabaseClient,
  filters: CoinFilters
): Promise<{ coins: CoinPublic[]; total: number }> {
  let query = supabase.from("coins_public").select("*", { count: "exact" });

  if (filters.search) {
    const term = quotePostgrestValue(`%${filters.search}%`);
    query = query.or(`title.ilike.${term},country.ilike.${term},issuer.ilike.${term}`);
  }
  if (filters.country) query = query.eq("country", filters.country);
  if (filters.coinType) query = query.eq("coin_type", filters.coinType);
  if (filters.composition) query = query.eq("composition", filters.composition);
  if (filters.grade) query = query.eq("grade", filters.grade);
  if (filters.mintmark) query = query.eq("mintmark", filters.mintmark);
  if (filters.yearMin !== null) query = query.gte("year", filters.yearMin);
  if (filters.yearMax !== null) query = query.lte("year", filters.yearMax);
  if (filters.forExchangeOnly) query = query.eq("for_exchange", true);

  switch (filters.sort) {
    case "year_desc":
      query = query.order("year", { ascending: false, nullsFirst: false });
      break;
    case "year_asc":
      query = query.order("year", { ascending: true, nullsFirst: false });
      break;
    case "country_asc":
      query = query.order("country", { ascending: true });
      break;
    case "recent":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const from = (filters.page - 1) * COINS_PAGE_SIZE;
  const to = from + COINS_PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, count, error } = await query.returns<CoinPublic[]>();
  if (error) throw error;

  return { coins: data ?? [], total: count ?? 0 };
}

export interface CoinFacetOption<T extends string = string> {
  value: T;
  count: number;
}

export interface CoinFacets {
  countries: CoinFacetOption[];
  coinTypes: CoinFacetOption<CoinType>[];
  compositions: CoinFacetOption[];
  grades: CoinFacetOption<CoinGrade>[];
  mintmarks: CoinFacetOption[];
  yearMin: number | null;
  yearMax: number | null;
}

export interface CoinStats {
  totalCoins: number;
  totalCountries: number;
  totalCompositions: number;
}

function tally<T extends string>(values: (T | null)[]): CoinFacetOption<T>[] {
  const counts = new Map<T, number>();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value));
}

/**
 * Computes filter-sidebar facet options (distinct values + counts) and
 * the overview stats strip from a single narrow-column pass over all
 * published coins. `coins_public` currently has no DISTINCT-with-counts
 * RPC, and at 819 rows selecting six short columns once per page view
 * is a trivial amount of data server-side (never sent to the browser -
 * only the small derived facet lists are) - simplest correct option at
 * this collection size. Worth revisiting with a dedicated Postgres
 * function if the collection grows an order of magnitude.
 */
export async function fetchCoinFacetsAndStats(
  supabase: SupabaseClient
): Promise<{ facets: CoinFacets; stats: CoinStats; years: number[] }> {
  const { data, error } = await supabase
    .from("coins_public")
    .select("country, coin_type, composition, grade, mintmark, year")
    .returns<Pick<CoinPublic, "country" | "coin_type" | "composition" | "grade" | "mintmark" | "year">[]>();

  if (error) throw error;
  const rows = data ?? [];

  const years = rows.map((r) => r.year).filter((y): y is number => y !== null);
  const countryValues = rows.map((r) => r.country);
  const compositionValues = rows.map((r) => r.composition);

  const facets: CoinFacets = {
    countries: tally(countryValues),
    coinTypes: tally(rows.map((r) => r.coin_type)),
    compositions: tally(compositionValues),
    grades: tally(rows.map((r) => r.grade)),
    mintmarks: tally(rows.map((r) => r.mintmark)),
    yearMin: years.length > 0 ? Math.min(...years) : null,
    yearMax: years.length > 0 ? Math.max(...years) : null,
  };

  const stats: CoinStats = {
    totalCoins: rows.length,
    totalCountries: new Set(countryValues.filter(Boolean)).size,
    totalCompositions: new Set(compositionValues.filter(Boolean)).size,
  };

  return { facets, stats, years };
}

/**
 * Year-of-mint histogram data (for the collection overview chart) -
 * bucketed into decades so 185 years of range (1835-2019) renders as a
 * readable ~19 bars instead of one bar per year.
 */
export interface YearBucket {
  decadeStart: number;
  count: number;
}

export function bucketYearsByDecade(years: number[]): YearBucket[] {
  const counts = new Map<number, number>();
  for (const year of years) {
    const decadeStart = Math.floor(year / 10) * 10;
    counts.set(decadeStart, (counts.get(decadeStart) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([decadeStart, count]) => ({ decadeStart, count }))
    .sort((a, b) => a.decadeStart - b.decadeStart);
}

/**
 * Related coins for the detail page: same country first (the stronger
 * signal - a fellow India collector wants more India), backfilled with
 * same-decade coins from anywhere if the country alone doesn't produce
 * enough, per the "same country/era" requirement. Always excludes the
 * coin itself.
 */
export async function fetchRelatedCoins(
  supabase: SupabaseClient,
  coin: Pick<CoinPublic, "id" | "country" | "year">,
  limit = 4
): Promise<CoinPublic[]> {
  const { data: sameCountry, error: countryError } = await supabase
    .from("coins_public")
    .select("*")
    .eq("country", coin.country)
    .neq("id", coin.id)
    .order("year", { ascending: false, nullsFirst: false })
    .limit(limit)
    .returns<CoinPublic[]>();
  if (countryError) throw countryError;

  const related = [...(sameCountry ?? [])];
  if (related.length >= limit || coin.year === null) {
    return related;
  }

  const decadeStart = Math.floor(coin.year / 10) * 10;
  const excludeIds = [coin.id, ...related.map((c) => c.id)];
  const { data: sameEra, error: eraError } = await supabase
    .from("coins_public")
    .select("*")
    .gte("year", decadeStart)
    .lte("year", decadeStart + 9)
    .not("id", "in", `(${excludeIds.join(",")})`)
    .order("year", { ascending: false, nullsFirst: false })
    .limit(limit - related.length)
    .returns<CoinPublic[]>();
  if (eraError) throw eraError;

  return [...related, ...(sameEra ?? [])];
}

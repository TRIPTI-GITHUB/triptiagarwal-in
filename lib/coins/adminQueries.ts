import type { SupabaseClient } from "@supabase/supabase-js";
import type { Coin } from "@/lib/supabase/database.types";

/**
 * Admin-only queries against the base `coins` table (never
 * `coins_public`) - these run behind the /admin auth gate and need the
 * private financial fields plus unpublished rows, which the public
 * view deliberately hides. Keeping these in a separate file from
 * lib/coins/queries.ts (the public-facing one) makes the
 * public/private boundary visible at a glance: importing from this
 * file is a signal the calling code must be auth-gated.
 */

export const ADMIN_COINS_PAGE_SIZE = 20;

export async function fetchAdminCoins(
  supabase: SupabaseClient,
  { search, page }: { search: string | null; page: number }
): Promise<{ coins: Coin[]; total: number }> {
  let query = supabase.from("coins").select("*", { count: "exact" });

  if (search) {
    const term = `"%${search.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}%"`;
    query = query.or(`title.ilike.${term},country.ilike.${term},issuer.ilike.${term}`);
  }

  query = query.order("created_at", { ascending: false });

  const from = (page - 1) * ADMIN_COINS_PAGE_SIZE;
  const to = from + ADMIN_COINS_PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, count, error } = await query.returns<Coin[]>();
  if (error) throw error;

  return { coins: data ?? [], total: count ?? 0 };
}

export async function fetchAdminCoinById(supabase: SupabaseClient, id: string): Promise<Coin | null> {
  const { data, error } = await supabase.from("coins").select("*").eq("id", id).maybeSingle<Coin>();
  if (error) throw error;
  return data ?? null;
}

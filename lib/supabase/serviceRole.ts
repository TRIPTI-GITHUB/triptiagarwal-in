import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client - bypasses RLS entirely. Only ever call
 * this from a Route Handler that needs to write to a table with no
 * anon/authenticated insert policy (currently just the analytics
 * write path, app/api/analytics/*). Never import this into a Server
 * Component, Server Action, or anything a client bundle could reach -
 * unlike the anon key, this one has full database access.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase service-role client is not configured (SUPABASE_SERVICE_ROLE_KEY is missing).");
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

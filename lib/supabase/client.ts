import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components (code that runs in the
 * visitor's browser, e.g. inside a component marked "use client").
 * Call this function each time you need a client — it's lightweight.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

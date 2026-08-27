import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/auth/actions";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

/**
 * Shared shell for everything under /admin. Access is actually gated
 * by middleware.ts (which redirects unauthenticated requests before
 * this layout ever renders) - this layout only decides whether to show
 * the logged-in chrome (nav + who's-logged-in + logout), which doubles
 * as a second confirmation that a user session exists.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-brand-cream">
      {user && (
        <header className="border-b border-brand-gold/20 bg-white px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center gap-5 text-sm font-medium text-brand-charcoal">
            <Link href="/admin" className="hover:text-brand-gold transition-colors">
              Coins
            </Link>
            <Link href="/admin/coins/new" className="hover:text-brand-gold transition-colors">
              + Add coin
            </Link>
          </nav>
          <div className="flex items-center gap-4 text-sm text-brand-charcoal/60">
            <span>{user.email}</span>
            <form action={logout}>
              <button type="submit" className="text-brand-gold hover:underline">
                Log out
              </button>
            </form>
          </div>
        </header>
      )}
      <main>{children}</main>
    </div>
  );
}

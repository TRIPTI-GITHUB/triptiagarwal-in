import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CoinsPagination } from "@/components/coins/CoinsPagination";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_COINS_PAGE_SIZE, fetchAdminCoins } from "@/lib/coins/adminQueries";

export const metadata: Metadata = {
  title: "Coins",
};

interface AdminPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function first(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function AdminDashboardPage({ searchParams }: AdminPageProps) {
  const raw = await searchParams;
  const search = first(raw.q);
  const page = Math.max(1, Number.parseInt(first(raw.page) ?? "1", 10) || 1);

  const supabase = await createClient();
  const { coins, total } = await fetchAdminCoins(supabase, { search, page });
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_COINS_PAGE_SIZE));

  const urlSearchParams = new URLSearchParams();
  if (search) urlSearchParams.set("q", search);

  return (
    <Section surface="white">
      <Container>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-3xl font-bold text-brand-charcoal">Coins</h1>
          <Link
            href="/admin/coins/new"
            className="rounded-full bg-brand-gold text-white text-sm font-medium px-5 py-2 hover:bg-brand-gold/90 transition-colors"
          >
            + Add coin
          </Link>
        </div>

        <form method="get" className="mb-6 max-w-sm">
          <input
            type="search"
            name="q"
            defaultValue={search ?? ""}
            placeholder="Search by title, country, or issuer…"
            aria-label="Search coins"
            className="w-full rounded-full border border-brand-gold/30 bg-white px-4 py-2 text-sm outline-none focus:border-brand-gold"
          />
        </form>

        <p className="text-sm text-brand-charcoal/60 mb-4">{total.toLocaleString()} coins</p>

        <div className="overflow-x-auto border border-brand-gold/20 rounded-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-gold/20 bg-brand-gold/5 text-left">
                <th className="px-4 py-2.5 font-medium text-brand-charcoal/70">Title</th>
                <th className="px-4 py-2.5 font-medium text-brand-charcoal/70">Country</th>
                <th className="px-4 py-2.5 font-medium text-brand-charcoal/70">Year</th>
                <th className="px-4 py-2.5 font-medium text-brand-charcoal/70">Grade</th>
                <th className="px-4 py-2.5 font-medium text-brand-charcoal/70">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {coins.map((coin) => (
                <tr key={coin.id} className="border-b border-brand-gold/10 last:border-b-0">
                  <td className="px-4 py-2.5 text-brand-charcoal font-medium">{coin.title}</td>
                  <td className="px-4 py-2.5 text-brand-charcoal/80">{coin.country}</td>
                  <td className="px-4 py-2.5 text-brand-charcoal/80">{coin.year ?? coin.year_raw ?? "—"}</td>
                  <td className="px-4 py-2.5 text-brand-charcoal/80">{coin.grade ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        coin.is_published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {coin.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link href={`/admin/coins/${coin.id}/edit`} className="text-brand-gold hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {coins.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-brand-charcoal/60">
                    No coins match this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <CoinsPagination currentPage={page} totalPages={totalPages} basePath="/admin" searchParams={urlSearchParams} />
      </Container>
    </Section>
  );
}

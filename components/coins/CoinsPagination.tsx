import Link from "next/link";

interface CoinsPaginationProps {
  currentPage: number;
  totalPages: number;
  /** Current query string (without the `page` param) to preserve filters/sort across pages. */
  basePath: string;
  searchParams: URLSearchParams;
}

function hrefForPage(basePath: string, searchParams: URLSearchParams, page: number): string {
  const params = new URLSearchParams(searchParams);
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

/**
 * Plain server-rendered Previous/Next + page-number links - no client
 * JS needed since navigating pages is a real navigation (new data),
 * unlike the filter controls which patch the URL in place.
 */
export function CoinsPagination({ currentPage, totalPages, basePath, searchParams }: CoinsPaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let p = start; p <= end; p++) pageNumbers.push(p);

  return (
    <nav aria-label="Coins pagination" className="flex items-center justify-center gap-2 mt-12">
      <Link
        href={hrefForPage(basePath, searchParams, currentPage - 1)}
        aria-disabled={currentPage === 1}
        className={`px-3 py-2 rounded-full border border-brand-gold/40 text-sm font-medium text-brand-charcoal hover:bg-brand-gold/10 transition-colors ${
          currentPage === 1 ? "pointer-events-none opacity-30" : ""
        }`}
      >
        Previous
      </Link>

      {start > 1 && <span className="text-brand-charcoal/40 px-1">…</span>}

      {pageNumbers.map((page) => (
        <Link
          key={page}
          href={hrefForPage(basePath, searchParams, page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
            page === currentPage
              ? "bg-brand-gold text-white"
              : "text-brand-charcoal hover:bg-brand-gold/10 border border-brand-gold/20"
          }`}
        >
          {page}
        </Link>
      ))}

      {end < totalPages && <span className="text-brand-charcoal/40 px-1">…</span>}

      <Link
        href={hrefForPage(basePath, searchParams, currentPage + 1)}
        aria-disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-full border border-brand-gold/40 text-sm font-medium text-brand-charcoal hover:bg-brand-gold/10 transition-colors ${
          currentPage === totalPages ? "pointer-events-none opacity-30" : ""
        }`}
      >
        Next
      </Link>
    </nav>
  );
}

import Link from "next/link";
import type { CoinPublic } from "@/lib/supabase/database.types";

interface CoinCardProps {
  coin: CoinPublic;
}

/**
 * CoinCard
 * Modeled on components/exhibits/ExhibitCard.tsx's museum-plaque
 * styling, adapted for coin photography: object-contain (never crop a
 * coin's edge) on a neutral square backdrop, with grade/exchange
 * badges since those two facts are what a fellow collector scans for
 * first in a catalog card.
 */
export function CoinCard({ coin }: CoinCardProps) {
  const yearLabel = coin.year_raw ?? (coin.year !== null ? String(coin.year) : "Year unknown");
  const eyebrow = [coin.country, yearLabel].filter(Boolean).join(" · ");

  return (
    <Link href={`/collections/coins/${coin.slug}`} className="group block">
      <div className="p-3 bg-white border-2 border-brand-gold/40 rounded-sm shadow-sm transition-all duration-200 group-hover:border-brand-gold group-hover:shadow-md">
        <div className="relative aspect-square w-full overflow-hidden bg-brand-teal/5 border border-brand-charcoal/10 flex items-center justify-center">
          {coin.obverse_image_url ? (
            <img
              src={coin.obverse_image_url}
              alt={`Obverse of ${coin.title}`}
              className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-teal/40 text-sm italic">
              Image coming soon
            </div>
          )}

          {coin.grade && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-brand-charcoal/85 text-white text-[10px] font-semibold tracking-wide">
              {coin.grade}
            </span>
          )}
          {coin.for_exchange && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-brand-gold/90 text-white text-[10px] font-medium tracking-wide">
              For exchange
            </span>
          )}
        </div>

        <div className="pt-4 pb-1 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-brand-gold mb-1">{eyebrow}</p>
          <h3 className="font-heading text-base font-semibold text-brand-charcoal leading-snug">{coin.title}</h3>
          {coin.composition && (
            <p className="text-xs text-brand-charcoal/60 mt-1">{coin.composition}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

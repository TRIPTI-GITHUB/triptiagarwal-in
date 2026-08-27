import type { CoinStats } from "@/lib/coins/queries";

interface CoinsStatsStripProps {
  stats: CoinStats;
}

const TILES: { key: keyof CoinStats; label: string }[] = [
  { key: "totalCoins", label: "Coins in the collection" },
  { key: "totalCountries", label: "Countries represented" },
  { key: "totalCompositions", label: "Distinct compositions" },
];

/**
 * Three stat tiles (dataviz skill: label in sentence case with no
 * trailing colon, value in the sans body font at display size using
 * default proportional figures - not tabular-nums, which is reserved
 * for columns of aligned numbers, not a single standalone figure).
 */
export function CoinsStatsStrip({ stats }: CoinsStatsStripProps) {
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
      {TILES.map((tile) => (
        <div key={tile.key} className="border border-brand-gold/20 rounded-sm bg-white px-5 py-4">
          <dt className="text-sm text-brand-charcoal/60">{tile.label}</dt>
          <dd className="text-3xl font-semibold text-brand-charcoal mt-1">{stats[tile.key].toLocaleString()}</dd>
        </div>
      ))}
    </dl>
  );
}

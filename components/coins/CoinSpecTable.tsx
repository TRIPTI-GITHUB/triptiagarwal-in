import type { CoinPublic } from "@/lib/supabase/database.types";

interface CoinSpecTableProps {
  coin: CoinPublic;
}

function formatFaceValue(coin: CoinPublic): string | null {
  if (coin.face_value === null) return null;
  return coin.currency ? `${coin.face_value} ${coin.currency}` : String(coin.face_value);
}

function formatDimensions(coin: CoinPublic): string | null {
  const parts: string[] = [];
  if (coin.diameter_mm !== null) parts.push(`${coin.diameter_mm} mm diameter`);
  if (coin.thickness_mm !== null) parts.push(`${coin.thickness_mm} mm thick`);
  return parts.length > 0 ? parts.join(", ") : null;
}

/**
 * Full spec table for the coin detail page. Every row is omitted when
 * the underlying field is null, rather than showing an empty dash -
 * the 819 imported rows vary widely in how completely they were
 * catalogued, and a sparse but honest table beats a padded one.
 */
export function CoinSpecTable({ coin }: CoinSpecTableProps) {
  const yearDisplay = coin.year_raw ?? (coin.year !== null ? String(coin.year) : null);

  const rows: { label: string; value: string | null }[] = [
    { label: "Country", value: coin.country },
    { label: "Issuer", value: coin.issuer },
    { label: "Face value", value: formatFaceValue(coin) },
    { label: "Type", value: coin.coin_type },
    { label: "Shape", value: coin.shape },
    { label: "Composition", value: coin.composition },
    { label: "Weight", value: coin.weight_g !== null ? `${coin.weight_g} g` : null },
    { label: "Dimensions", value: formatDimensions(coin) },
    { label: "Orientation", value: coin.orientation },
    { label: "Year", value: yearDisplay },
    { label: "Calendar", value: coin.year_calendar },
    { label: "Mintmark", value: coin.mintmark },
    { label: "Grade", value: coin.grade },
    { label: "Quantity held", value: String(coin.quantity) },
    { label: "Available for exchange", value: coin.for_exchange ? "Yes" : "No" },
    { label: "Collection", value: coin.collection_tag },
  ].filter((row) => row.value !== null && row.value !== "");

  return (
    <table className="w-full text-sm border-collapse">
      <caption className="sr-only">Specifications for {coin.title}</caption>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="border-b border-brand-gold/15 last:border-b-0">
            <th scope="row" className="text-left font-medium text-brand-charcoal/60 py-2.5 pr-4 w-40 align-top">
              {row.label}
            </th>
            <td className="py-2.5 text-brand-charcoal">{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

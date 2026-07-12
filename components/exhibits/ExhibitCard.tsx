import Link from "next/link";
import type { Exhibit } from "@/lib/supabase/database.types";

interface ExhibitCardProps {
  exhibit: Exhibit;
}

const TYPE_LABELS: Record<Exhibit["type"], string> = {
  stamps: "Philately",
  coins: "Numismatics",
  mixed: "Mixed Collection",
};

/**
 * ExhibitCard
 * "Framed" preview tile for a themed exhibit — styled to evoke a
 * museum wall plaque (thick gold border, cream matting around the
 * cover image, small-caps museum-label typography) rather than a
 * generic content card, matching the exhibition-hall concept for
 * the /exhibits landing page.
 */
export function ExhibitCard({ exhibit }: ExhibitCardProps) {
  return (
    <Link href={`/exhibits/${exhibit.slug}`} className="group block">
      <div className="p-3 bg-white border-2 border-brand-gold/40 rounded-sm shadow-sm transition-all duration-200 group-hover:border-brand-gold group-hover:shadow-md">
        <div className="aspect-[3/4] w-full overflow-hidden bg-brand-teal/5 border border-brand-charcoal/10">
          {exhibit.cover_image_url ? (
            <img
              src={exhibit.cover_image_url}
              alt={exhibit.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-teal/40 text-sm italic">
              Cover coming soon
            </div>
          )}
        </div>

        <div className="pt-4 pb-1 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-brand-gold mb-1">
            {TYPE_LABELS[exhibit.type]} · {exhibit.sheet_count}{" "}
            {exhibit.sheet_count === 1 ? "Sheet" : "Sheets"}
          </p>
          <h3 className="text-lg font-semibold text-brand-charcoal">
            {exhibit.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
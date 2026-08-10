interface PullQuoteBannerProps {
  quote: string | null;
  attribution: string | null;
}

/**
 * PullQuoteBanner
 * "A moment of stillness before the footer — no image, no navigation,
 * just one considered line" (Design Brief section 6). Renders nothing
 * when there's no real quote yet - a contemplative banner with
 * placeholder text would read as broken, unlike a list-style section's
 * "check back soon," so the section simply doesn't render until
 * Tripti supplies one, per "never a stock inspirational quote
 * disconnected from the platform."
 */
export function PullQuoteBanner({ quote, attribution }: PullQuoteBannerProps) {
  if (!quote) return null;

  return (
    <div className="max-w-3xl mx-auto text-center px-6">
      <p className="font-heading italic text-brand-charcoal text-3xl md:text-4xl leading-snug">
        &ldquo;{quote}&rdquo;
      </p>
      {attribution && <p className="mt-4 text-sm text-brand-charcoal/60">— {attribution}</p>}
    </div>
  );
}

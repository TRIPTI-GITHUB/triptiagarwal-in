interface HeroProps {
  imageUrl?: string;
  imageAlt?: string;
  /** true (default) = full 100vh, for the homepage. false = a shorter
   * ~65vh treatment for interior pages, once other pages get their own
   * hero imagery (not built in this task - see Design Brief section 3). */
  fullHeight?: boolean;
}

/**
 * Hero
 * The single confident identity moment (Design Brief section 3) - a
 * full-bleed photo with no overlaid text, heading, or buttons. Visitors
 * navigate via the header's own menu rather than a hero CTA. Falls back
 * to a solid brand-charcoal background when no image has been supplied
 * yet (site_content.hero_content is null pre-migration or pre-upload),
 * so it degrades gracefully rather than showing a broken image.
 */
export function Hero({ imageUrl, imageAlt, fullHeight = true }: HeroProps) {
  return (
    <section
      className={
        "relative w-full overflow-hidden " + (fullHeight ? "h-screen" : "h-[65vh] min-h-[420px]")
      }
    >
      {imageUrl ? (
        <img src={imageUrl} alt={imageAlt || ""} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-brand-charcoal" />
      )}
    </section>
  );
}

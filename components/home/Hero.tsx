"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface HeroProps {
  imageUrl?: string;
  imageAlt?: string;
  heading: string;
  tagline?: string;
  ctaHref?: string;
  ctaLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  /** true (default) = full 100vh, for the homepage. false = a shorter
   * ~65vh treatment for interior pages, once other pages get their own
   * hero imagery (not built in this task - see Design Brief section 3). */
  fullHeight?: boolean;
}

/**
 * Hero
 * The single confident identity moment (Design Brief section 3) -
 * built reusable (image/heading/tagline/CTA as props) since the hero
 * is meant to repeat on every page eventually, even though only the
 * homepage actually renders one in this task. Falls back to a solid
 * brand-charcoal background when no image has been supplied yet
 * (site_content.hero_content is null pre-migration or pre-upload),
 * so it degrades gracefully rather than showing a broken image.
 *
 * Deliberately does not implement the scroll-parallax mentioned in the
 * design brief - flagged as a follow-up polish item, not core to the
 * section's structure or content.
 */
export function Hero({
  imageUrl,
  imageAlt,
  heading,
  tagline,
  ctaHref,
  ctaLabel,
  secondaryHref,
  secondaryLabel,
  fullHeight = true,
}: HeroProps) {
  const shouldReduceMotion = useReducedMotion();

  function stagger(index: number) {
    return {
      initial: shouldReduceMotion ? false : { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay: index * 0.08, ease: "easeOut" as const },
    };
  }

  return (
    <section
      className={
        "relative w-full flex items-center justify-center text-center overflow-hidden " +
        (fullHeight ? "h-screen" : "h-[65vh] min-h-[420px]")
      }
    >
      {imageUrl ? (
        <>
          <img src={imageUrl} alt={imageAlt || ""} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/20" />
        </>
      ) : (
        <div className="absolute inset-0 bg-brand-charcoal" />
      )}

      <div className="relative z-10 px-6 max-w-3xl mx-auto">
        <motion.h1 {...stagger(0)} className="font-heading text-white text-5xl md:text-7xl font-bold mb-4">
          {heading}
        </motion.h1>
        {tagline && (
          <motion.p {...stagger(1)} className="text-white/90 text-lg md:text-xl italic mb-6">
            {tagline}
          </motion.p>
        )}
        <motion.div {...stagger(2)} className="w-16 h-px bg-brand-gold mx-auto mb-8" />
        {ctaHref && ctaLabel && (
          <motion.div {...stagger(3)} className="flex flex-col items-center gap-3">
            <Button href={ctaHref} variant="primary">
              {ctaLabel}
            </Button>
            {secondaryHref && secondaryLabel && (
              <Link href={secondaryHref} className="text-white/80 text-sm hover:text-white underline underline-offset-4">
                {secondaryLabel}
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}

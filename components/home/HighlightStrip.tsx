"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { HighlightStripItem } from "@/lib/supabase/database.types";

const PILLAR_LABEL: Record<HighlightStripItem["pillar"], string> = {
  numismatics: "Numismatics",
  philately: "Philately",
  postal: "Postal History & Postcrossing",
};

interface HighlightStripProps {
  items: HighlightStripItem[];
}

function HighlightColumn({ item }: { item: HighlightStripItem }) {
  return (
    <Link href={item.href} className="group block">
      <p className="font-heading italic text-brand-charcoal text-lg md:text-xl leading-snug mb-3">
        &ldquo;{item.quote}&rdquo;
      </p>
      <div className="w-10 h-px bg-brand-gold mb-4" />
      <div className="aspect-[4/5] w-full overflow-hidden rounded-sm bg-brand-teal/5">
        <img
          src={item.imageUrl}
          alt={item.alt}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
      </div>
      <p className="mt-3 text-xs uppercase tracking-widest text-brand-gold">{PILLAR_LABEL[item.pillar]}</p>
    </Link>
  );
}

/**
 * HighlightStrip
 * Three columns (Numismatics/Philately/Postal History), each a real
 * quote + photo linking through to its Collections destination -
 * "the reference's best idea" per the design brief, upgraded with real
 * wayfinding value. Renders an honest "being curated" message rather
 * than fabricated quotes/images when site_content.highlight_strip is
 * empty (the normal state before Tripti supplies real content).
 */
export function HighlightStrip({ items }: HighlightStripProps) {
  const shouldReduceMotion = useReducedMotion();

  if (items.length === 0) {
    return <p className="text-center text-brand-charcoal/50 italic py-8">Highlights are being curated — check back soon.</p>;
  }

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8"
    >
      {items.map((item) => (
        <HighlightColumn key={item.pillar} item={item} />
      ))}
    </motion.div>
  );
}

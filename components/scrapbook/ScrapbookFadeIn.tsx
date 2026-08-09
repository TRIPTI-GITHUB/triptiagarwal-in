"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface ScrapbookFadeInProps {
  children: ReactNode;
  delay?: number;
}

/**
 * ScrapbookFadeIn
 * Slow, elegant fade-and-slight-rise entrance on scroll, per
 * DesignSystem.md's animation language (no bounce). Uses framer-motion's
 * own `useReducedMotion` (already a project dependency, used elsewhere
 * for the same purpose) rather than building a parallel detection
 * layer - a visitor with prefers-reduced-motion sees the content in
 * its final state immediately, no motion at all.
 */
export function ScrapbookFadeIn({ children, delay = 0 }: ScrapbookFadeInProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  /** Alternate surface background for visual rhythm between sections */
  surface?: "ivory" | "white";
  id?: string;
}

/**
 * Vertical section wrapper. Tightened 2026-09-03 (was py-16/24/28,
 * 64-112px) - that plus the homepage's full-viewport Hero meant real
 * content never appeared without scrolling; this value is shared by
 * every page in the site, so the one change here fixes the "too much
 * white space" complaint everywhere at once.
 */
export function Section({ children, className = "", surface = "ivory", id }: SectionProps) {
  const bg = surface === "white" ? "bg-surface" : "bg-warm-ivory";
  return (
    <section id={id} className={`${bg} py-10 md:py-14 lg:py-16 ${className}`}>
      {children}
    </section>
  );
}

import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  /** Alternate surface background for visual rhythm between sections */
  surface?: "ivory" | "white";
  id?: string;
}

/**
 * Vertical section wrapper. Section spacing 100–120px per DesignSystem.md.
 */
export function Section({ children, className = "", surface = "ivory", id }: SectionProps) {
  const bg = surface === "white" ? "bg-surface" : "bg-warm-ivory";
  return (
    <section id={id} className={`${bg} py-16 md:py-24 lg:py-28 ${className}`}>
      {children}
    </section>
  );
}

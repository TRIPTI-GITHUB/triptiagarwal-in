import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

/**
 * Section
 * Applies consistent vertical padding between page sections. Wrap each
 * distinct block of a page (hero, features, footer content, etc.) in
 * this component to keep spacing rhythm consistent site-wide.
 */
export function Section({ children, className = "", id }: SectionProps) {
  return (
    <section id={id} className={`py-16 md:py-24 ${className}`}>
      {children}
    </section>
  );
}
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card
 * Generic bordered container with consistent padding and a subtle
 * hover effect. Used as the base building block for feature tiles,
 * collection items, blog previews, and similar "tile" content across
 * the site — extend with className rather than duplicating styles.
 */
export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-brand-gold/20 bg-white/60 p-6 transition-all duration-200 hover:border-brand-gold/50 hover:shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
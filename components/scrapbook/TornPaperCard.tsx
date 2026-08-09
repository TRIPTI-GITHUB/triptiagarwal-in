import type { ReactNode } from "react";

interface TornPaperCardProps {
  children: ReactNode;
  className?: string;
}

// A fixed jagged polygon (top and bottom edges) - deterministic, not
// randomized, so server and client render identically with no
// hydration mismatch.
const TORN_EDGE_CLIP =
  "polygon(0% 2%, 4% 0%, 9% 3%, 14% 1%, 19% 3%, 24% 0%, 29% 2%, 34% 1%, 39% 3%, 44% 0%, 49% 2%, 54% 1%, 59% 3%, 64% 0%, 69% 2%, 74% 1%, 79% 3%, 84% 0%, 89% 2%, 94% 1%, 100% 2%, 100% 98%, 95% 100%, 90% 98%, 85% 100%, 80% 98%, 75% 100%, 70% 98%, 65% 100%, 60% 98%, 55% 100%, 50% 98%, 45% 100%, 40% 98%, 35% 100%, 30% 98%, 25% 100%, 20% 98%, 15% 100%, 10% 98%, 5% 100%, 0% 98%)";

/**
 * TornPaperCard
 * Wraps a content block with a torn-paper edge, via a fixed CSS
 * clip-path rather than an image asset - scales cleanly to any content
 * height with no extra network request.
 */
export function TornPaperCard({ children, className = "" }: TornPaperCardProps) {
  return (
    <div
      className={`bg-brand-cream shadow-md px-6 py-10 sm:px-10 sm:py-12 ${className}`}
      style={{ clipPath: TORN_EDGE_CLIP }}
    >
      {children}
    </div>
  );
}

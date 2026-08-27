import type { ReactNode } from "react";

interface CollectionGridProps {
  children: ReactNode;
  className?: string;
}

/**
 * Generic responsive card grid shared by any collection listing (coins
 * today; exhibits/gallery could adopt it too). Kept in components/ui
 * rather than components/coins since nothing about it is coin-specific.
 */
export function CollectionGrid({ children, className = "" }: CollectionGridProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {children}
    </div>
  );
}

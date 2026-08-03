import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Page-width wrapper. Max width 1280px per DesignSystem.md,
 * with responsive horizontal padding (desktop px-8, tablet px-6, mobile px-4).
 */
export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

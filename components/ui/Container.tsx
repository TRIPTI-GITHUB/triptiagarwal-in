import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container
 * Constrains content to a readable max-width and applies consistent
 * horizontal padding across breakpoints. Use this to wrap the main
 * content of every section/page.
 */
export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`w-full max-w-6xl mx-auto px-6 md:px-8 ${className}`}>
      {children}
    </div>
  );
}
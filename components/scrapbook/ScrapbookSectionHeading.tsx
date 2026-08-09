import type { ReactNode } from "react";

interface ScrapbookSectionHeadingProps {
  children: ReactNode;
  /** The handwritten-accent font's generated className (next/font/google, loaded by the page) - short headings only, never body text. */
  fontClassName?: string;
  className?: string;
}

/**
 * ScrapbookSectionHeading
 * Short section heading in the handwritten accent font. Body/list
 * content must never use this - only ever pass headings through it,
 * per the accessibility requirement that list content stays in the
 * standard site font for WCAG AA readability.
 */
export function ScrapbookSectionHeading({ children, fontClassName = "", className = "" }: ScrapbookSectionHeadingProps) {
  return (
    <h2 className={`font-heading text-3xl sm:text-4xl text-brand-teal ${fontClassName} ${className}`}>
      {children}
    </h2>
  );
}

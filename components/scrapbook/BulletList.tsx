interface BulletListProps {
  items: string[];
  className?: string;
}

/**
 * BulletList
 * Semantic bulleted list (used for "What I Love Doing" and
 * "Accolades") - deliberately kept in the standard site font, never
 * the handwritten accent font, to preserve WCAG AA readability for
 * actual content.
 */
export function BulletList({ items, className = "" }: BulletListProps) {
  return (
    <ul className={`space-y-2 ${className}`}>
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-brand-charcoal/90 leading-relaxed">
          <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

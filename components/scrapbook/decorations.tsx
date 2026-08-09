interface DecorationProps {
  className?: string;
}

/**
 * WashiTape / Paperclip
 * Static, inline decorative SVGs (not sourced from Supabase Storage -
 * they're design assets, not content). Both are `aria-hidden` since
 * they convey nothing a screen-reader visitor needs.
 */
export function WashiTape({ className = "" }: DecorationProps) {
  return (
    <svg viewBox="0 0 120 34" className={className} aria-hidden="true">
      <rect x="0" y="0" width="120" height="34" fill="var(--color-brand-gold)" opacity="0.32" />
      <rect
        x="1"
        y="1"
        width="118"
        height="32"
        fill="none"
        stroke="var(--color-brand-gold)"
        strokeOpacity="0.5"
        strokeDasharray="4 3"
      />
    </svg>
  );
}

export function Paperclip({ className = "" }: DecorationProps) {
  return (
    <svg viewBox="0 0 24 48" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path
        d="M8 6 v28 a4 4 0 0 0 8 0 v-24 a2 2 0 0 0 -4 0 v20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

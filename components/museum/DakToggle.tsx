"use client";

import { Bird } from "lucide-react";

interface DakToggleProps {
  dismissed: boolean;
  onToggle: () => void;
}

/**
 * DakToggle
 * Small, unobtrusive control letting the visitor dismiss Dak for the
 * rest of the session, or bring him back - "Explore mode function: Dak
 * becomes optional and dismissible" (section 4). Always in the same
 * bottom-left-ish spot so visitors know where to find it - offset from
 * the true corner (left-20, not left-6) so it doesn't sit under
 * Next.js's own dev-mode indicator badge in local development.
 */
export function DakToggle({ dismissed, onToggle }: DakToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={dismissed ? "Show Dak" : "Hide Dak"}
      title={dismissed ? "Show Dak" : "Hide Dak"}
      className={
        "absolute bottom-6 left-20 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors " +
        (dismissed ? "bg-white/10 text-white/50 hover:text-white/80" : "bg-brand-gold/25 text-brand-gold hover:bg-brand-gold/35")
      }
    >
      <Bird size={17} />
    </button>
  );
}

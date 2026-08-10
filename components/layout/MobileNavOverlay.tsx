"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ChevronDown, Search } from "lucide-react";
import { NAV_ITEMS } from "@/lib/navigation";

interface MobileNavOverlayProps {
  open: boolean;
  onClose: () => void;
}

/**
 * MobileNavOverlay
 * A full-screen overlay (not a slide-in drawer sliver) - large Playfair
 * Display links, submenus expand in place as an accordion rather than
 * pushing to a second screen, Search and Contact at the bottom behind
 * a hairline rule. The single largest structural departure from the
 * reference video (which never showed a mobile view), but required by
 * the site's mobile-first, WCAG-AA commitments.
 */
export function MobileNavOverlay({ open, onClose }: MobileNavOverlayProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div
      className={
        "fixed inset-0 z-[100] bg-brand-cream transition-opacity duration-300 " +
        (open ? "opacity-100" : "opacity-0 pointer-events-none")
      }
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-brand-gold/20">
        <p className="font-heading text-lg font-bold text-brand-charcoal">Menu</p>
        <button onClick={onClose} aria-label="Close menu" className="text-brand-charcoal">
          <X size={24} />
        </button>
      </div>

      <nav className="px-6 py-8 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-76px)]">
        {NAV_ITEMS.map((item) => (
          <div key={item.href}>
            {item.children ? (
              <>
                <button
                  onClick={() => setExpanded((cur) => (cur === item.href ? null : item.href))}
                  aria-expanded={expanded === item.href}
                  className="w-full flex items-center justify-between font-heading text-2xl font-semibold text-brand-charcoal"
                >
                  {item.label}
                  <ChevronDown
                    size={20}
                    className={"transition-transform duration-200 " + (expanded === item.href ? "rotate-180" : "")}
                  />
                </button>
                {expanded === item.href && (
                  <div className="mt-3 pl-4 flex flex-col gap-3 border-l border-brand-gold/30">
                    {item.children.map((child) => (
                      <Link key={child.href} href={child.href} onClick={onClose} className="block">
                        <p className="text-base font-medium text-brand-charcoal">{child.label}</p>
                        <p className="text-xs text-brand-charcoal/60">{child.description}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href}
                onClick={onClose}
                className="block font-heading text-2xl font-semibold text-brand-charcoal"
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}

        <div className="mt-4 pt-6 border-t border-brand-gold/20 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-brand-charcoal/70">
            <Search size={16} strokeWidth={1.5} />
            <span className="text-sm">Search</span>
          </div>
          <a href="#contact" onClick={onClose} className="text-sm text-brand-teal hover:underline">
            Contact
          </a>
        </div>
      </nav>
    </div>
  );
}

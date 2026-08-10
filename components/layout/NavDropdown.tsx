"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { NavItem } from "@/lib/navigation";

interface NavDropdownProps {
  item: NavItem;
  // True while the Header is in its transparent-over-hero state
  // (homepage, not yet scrolled) - text needs to read against a photo
  // background rather than the solid warm-ivory surface.
  light?: boolean;
}

const LINK_BASE = "relative text-xs font-medium uppercase tracking-widest pb-1 transition-colors";
const ACTIVE_UNDERLINE = "after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-0.5 after:bg-brand-gold";

/**
 * NavDropdown
 * A single top-level desktop nav item - a plain link if it has no
 * children, or a dropdown panel otherwise. Reveals on hover AND on
 * click (never hover-only, which fails keyboard and touch users per
 * the design brief). Active state is a gold underline, not a color
 * change alone, so it doesn't fail colorblind/contrast checks.
 */
export function NavDropdown({ item, light }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.children?.some((c) => pathname === c.href) ?? false);
  const inactiveColor = light ? "text-white/85 hover:text-white" : "text-brand-charcoal/80 hover:text-brand-charcoal";
  const activeColor = light ? "text-white" : "text-brand-charcoal";
  const activeClass = isActive ? `${activeColor} ${ACTIVE_UNDERLINE}` : inactiveColor;

  if (!item.children) {
    return (
      <Link href={item.href} className={`${LINK_BASE} ${activeClass}`}>
        {item.label}
      </Link>
    );
  }

  const isGrid = item.dropdownLayout === "grid";

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className={`${LINK_BASE} ${activeClass} flex items-center gap-1`}
      >
        {item.label}
        <ChevronDown size={12} className={"transition-transform duration-200 " + (open ? "rotate-180" : "")} />
      </button>

      {open && (
        <div className={"absolute top-full left-1/2 -translate-x-1/2 pt-3 " + (isGrid ? "w-[440px]" : "w-64")}>
          <div
            className={
              "bg-brand-cream rounded-2xl shadow-lg p-6 gap-1 " + (isGrid ? "grid grid-cols-3" : "grid grid-cols-1")
            }
          >
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2 hover:bg-brand-gold/10 transition-colors"
              >
                <p className="font-heading text-sm font-semibold text-brand-charcoal">{child.label}</p>
                <p className="text-xs text-brand-charcoal/60 mt-1 leading-snug">{child.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

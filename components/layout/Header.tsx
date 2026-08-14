"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { NavDropdown } from "@/components/layout/NavDropdown";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { MobileNavOverlay } from "@/components/layout/MobileNavOverlay";
import { NAV_ITEMS } from "@/lib/navigation";

/**
 * Header
 * Site-wide navigation bar, rendered once in the root layout. Sticky,
 * solid warm-ivory surface from the very first frame on every page,
 * including the homepage - previously faded in from a transparent,
 * white-text-over-hero state that only became legible after scrolling
 * past the hero, which read as a bug (nav briefly invisible on load).
 * Now that the homepage hero is image-only with no overlaid text, that
 * transparent state no longer has a purpose.
 */
export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="w-full sticky top-0 z-50 border-b bg-brand-cream/95 backdrop-blur border-brand-gold/20">
        <Container className="flex items-center justify-between py-4 md:py-0 md:h-[72px]">
          <Link href="/" className="font-heading text-lg md:text-xl font-bold tracking-tight text-brand-charcoal">
            Tripti Agarwal <span className="text-brand-gold font-normal">Heritage Lab</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <NavDropdown key={item.href} item={item} />
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-5">
            <HeaderSearch />
            <a
              href="#contact"
              className="text-xs font-medium uppercase tracking-widest text-brand-charcoal/70 hover:text-brand-charcoal transition-colors"
            >
              Contact
            </a>
          </div>

          <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="md:hidden text-brand-charcoal">
            <Menu size={24} />
          </button>
        </Container>
      </header>

      <MobileNavOverlay open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

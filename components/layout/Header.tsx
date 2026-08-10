"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { NavDropdown } from "@/components/layout/NavDropdown";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { MobileNavOverlay } from "@/components/layout/MobileNavOverlay";
import { useIsScrolled } from "@/components/layout/useIsScrolled";
import { NAV_ITEMS } from "@/lib/navigation";

/**
 * Header
 * Site-wide navigation bar, rendered once in the root layout. Sticky,
 * and transparent-over-hero fading to a solid warm-ivory surface once
 * scrolled past the hero (Design Brief section 2) - but only on the
 * homepage, which is the only page with hero photography behind the
 * header right now; every other page stays solid from the first frame
 * rather than floating unreadable nav text over a plain background.
 */
export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isScrolled = useIsScrolled();
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const transparent = isHomepage && !isScrolled;

  return (
    <>
      <header
        className={
          "w-full sticky top-0 z-50 transition-colors duration-300 border-b " +
          (transparent ? "bg-transparent border-transparent" : "bg-brand-cream/95 backdrop-blur border-brand-gold/20")
        }
      >
        <Container className="flex items-center justify-between py-4 md:py-0 md:h-[72px]">
          <Link
            href="/"
            className={
              "font-heading text-lg md:text-xl font-bold tracking-tight transition-colors " +
              (transparent ? "text-white" : "text-brand-charcoal")
            }
          >
            Tripti Agarwal{" "}
            <span className={transparent ? "text-brand-gold/90 font-normal" : "text-brand-gold font-normal"}>
              Heritage Lab
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <NavDropdown key={item.href} item={item} light={transparent} />
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-5">
            <HeaderSearch light={transparent} />
            <a
              href="#contact"
              className={
                "text-xs font-medium uppercase tracking-widest transition-colors " +
                (transparent ? "text-white/80 hover:text-white" : "text-brand-charcoal/70 hover:text-brand-charcoal")
              }
            >
              Contact
            </a>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className={"md:hidden transition-colors " + (transparent ? "text-white" : "text-brand-charcoal")}
          >
            <Menu size={24} />
          </button>
        </Container>
      </header>

      <MobileNavOverlay open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

import Link from "next/link";
import { Container } from "@/components/ui/Container";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
];

/**
 * Header
 * Site-wide navigation bar. Rendered once in the root layout so it
 * appears on every page. Add new top-level nav items to NAV_LINKS
 * as new sections of the site go live.
 */
export function Header() {
  return (
    <header className="w-full border-b border-brand-gold/20 bg-brand-cream/95 backdrop-blur sticky top-0 z-50">
      <Container className="flex items-center justify-between py-4">
        <Link
          href="/"
          className="text-lg md:text-xl font-bold text-brand-charcoal tracking-tight"
        >
          Tripti Agarwal{" "}
          <span className="text-brand-gold font-normal">Heritage Lab</span>
        </Link>

        <nav className="flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-brand-charcoal hover:text-brand-teal transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  );
}
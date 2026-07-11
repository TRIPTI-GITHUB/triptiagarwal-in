import { Container } from "@/components/ui/Container";

/**
 * Footer
 * Site-wide footer. Rendered once in the root layout so it appears
 * on every page. Copyright year is computed automatically so it
 * never needs manual updating.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-brand-gold/20 mt-auto">
      <Container className="py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-brand-charcoal">
          © {year} Tripti Agarwal Heritage Lab. All rights reserved.
        </p>
        <p className="text-sm italic text-brand-teal">
          Preserving the Past. Inspiring the Future.
        </p>
      </Container>
    </footer>
  );
}
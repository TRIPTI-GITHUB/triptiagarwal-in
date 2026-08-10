import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

interface ComingSoonProps {
  title: string;
  description: string;
}

/**
 * ComingSoon
 * Shared shell for nav destinations that are reserved but not yet
 * built (Coins, Recognition & Memberships, Thematic Highlights, Video
 * Gallery - PRD section 8's Phased Rollout) - a real, on-brand page
 * rather than a 404, with no fabricated content.
 */
export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <Section>
      <Container className="max-w-2xl text-center py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-gold mb-4">Coming Soon</p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-charcoal mb-4">{title}</h1>
        <p className="text-lg text-brand-charcoal/70">{description}</p>
      </Container>
    </Section>
  );
}

import type { Metadata } from "next";
import { JourneyHero } from "@/components/journey/JourneyHero";
import { StatsStrip } from "@/components/journey/StatsStrip";
import { Timeline } from "@/components/journey/Timeline";
import { AwardsHighlight } from "@/components/journey/AwardsHighlight";
import { MediaMentions } from "@/components/journey/MediaMentions";
import { CommunitySection } from "@/components/journey/CommunitySection";
import { ClosingCTA } from "@/components/journey/ClosingCTA";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Journey & Milestones | Tripti Agarwal Heritage Lab",
  description:
    "From a single Facebook post in 2013 to national exhibitions and global recognition — follow Tripti Agarwal's decade-long journey through philately, numismatics, and postal heritage.",
  openGraph: {
    title: "Journey & Milestones | Tripti Agarwal Heritage Lab",
    description:
      "From a single Facebook post in 2013 to national exhibitions and global recognition — follow Tripti Agarwal's decade-long journey through philately, numismatics, and postal heritage.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Journey & Milestones | Tripti Agarwal Heritage Lab",
    description:
      "From a single Facebook post in 2013 to national exhibitions and global recognition.",
  },
};

export default function JourneyPage() {
  return (
    <main>
      <JourneyHero />
      <StatsStrip />
      <Section surface="ivory">
        <Timeline />
      </Section>
      <Section surface="white">
        <AwardsHighlight />
      </Section>
      <Section surface="ivory">
        <MediaMentions />
      </Section>
      <Section surface="white">
        <CommunitySection />
      </Section>
      <Section surface="ivory">
        <ClosingCTA />
      </Section>
    </main>
  );
}

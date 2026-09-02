import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { UnderDevelopmentBanner } from "@/components/home/UnderDevelopmentBanner";
import { HighlightStrip } from "@/components/home/HighlightStrip";
import { StoryTeaser } from "@/components/home/StoryTeaser";
import { PullQuoteBanner } from "@/components/home/PullQuoteBanner";
import { createClient } from "@/lib/supabase/server";
import type { Profile, SiteContent } from "@/lib/supabase/database.types";

export const metadata: Metadata = {
  title: "Tripti Agarwal Heritage Lab",
  description:
    "A digital space dedicated to exploring history through philately, numismatics, postal heritage and storytelling — featuring curated collections, award-winning exhibits, educational resources, and AI-powered heritage experiences.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Tripti Agarwal Heritage Lab",
    description: "Preserving the Past. Inspiring the Future.",
    type: "website",
  },
};

/**
 * Home
 * Server Component - Highlight Strip, Story Teaser, Pull-Quote Banner.
 * The full-bleed image Hero (2026-09-03: removed - took up a full
 * viewport of space above the fold with no informational value) no
 * longer renders here; `Hero.tsx` itself is left in place for reuse on
 * an interior page later. Fetches `profiles` (existing) and
 * `site_content` (new) once, passing data down as props rather than
 * each section querying independently.
 *
 * If `site_content` doesn't exist yet (migration not applied), the
 * query returns a null-data error response rather than throwing, and
 * every section below already has a graceful empty state for that.
 */
export default async function Home() {
  const supabase = await createClient();

  const [{ data: profile }, { data: siteContent }] = await Promise.all([
    supabase.from("profiles").select("*").limit(1).maybeSingle<Profile>(),
    supabase.from("site_content").select("*").limit(1).maybeSingle<SiteContent>(),
  ]);

  const highlightItems = siteContent?.highlight_strip ?? [];

  return (
    <>
      <UnderDevelopmentBanner />

      <Section surface="white">
        <Container>
          <HighlightStrip items={highlightItems} />
        </Container>
      </Section>

      {profile?.bio && (
        <Section surface="ivory">
          <Container className="max-w-5xl">
            <StoryTeaser profile={profile} />
          </Container>
        </Section>
      )}

      {siteContent?.pull_quote && (
        <Section surface="white">
          <PullQuoteBanner quote={siteContent.pull_quote} attribution={siteContent.pull_quote_attribution} />
        </Section>
      )}
    </>
  );
}

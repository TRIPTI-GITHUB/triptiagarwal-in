import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Hero } from "@/components/home/Hero";
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
 * Server Component - rebuilt per Homepage_UI_Design_Brief_wordpress.md:
 * Hero, Highlight Strip, Story Teaser, Pull-Quote Banner. Fetches
 * `profiles` (existing) and `site_content` (new) once, passing data
 * down as props rather than each section querying independently.
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

  const homeHero = siteContent?.hero_content?.home ?? null;
  const highlightItems = siteContent?.highlight_strip ?? [];

  return (
    <>
      <Hero imageUrl={homeHero?.imageUrl} imageAlt={homeHero?.alt} />

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

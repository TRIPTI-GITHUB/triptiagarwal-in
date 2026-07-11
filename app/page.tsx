import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/database.types";

/**
 * Home
 * Server Component — runs on the server, fetches the profile row
 * directly from Supabase before the page is sent to the visitor.
 * No loading spinner needed since the data is ready before render.
 */
export default async function Home() {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .limit(1)
    .maybeSingle<Profile>();

  return (
    <>
      {/* Hero */}
      <Section className="text-center">
        <Container>
          <p className="uppercase tracking-[0.3em] text-sm text-brand-gold mb-4">
            Coming Soon
          </p>

          <h1 className="text-5xl md:text-7xl font-bold text-brand-charcoal mb-6">
            Tripti Agarwal Heritage Lab
          </h1>

          <p className="text-xl md:text-2xl italic text-brand-teal mb-10">
            Preserving the Past. Inspiring the Future.
          </p>

          <p className="text-lg leading-8 max-w-3xl mx-auto mb-10 text-brand-charcoal/90">
            A digital space dedicated to exploring history through
            philately, numismatics, postal heritage and storytelling —
            featuring curated collections, award-winning exhibits,
            educational resources, and AI-powered heritage experiences.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button href="/about" variant="primary">
              About the Collection
            </Button>
            <Button href="/blog" variant="secondary">
              Read the Blog
            </Button>
          </div>
        </Container>
      </Section>

      {/* About preview — pulled live from Supabase */}
      {profile && (
        <Section className="bg-white/40">
          <Container className="max-w-3xl text-center">
            <h2 className="text-sm uppercase tracking-[0.2em] text-brand-gold mb-3">
              About
            </h2>
            <p className="text-2xl font-semibold text-brand-charcoal mb-3">
              {profile.full_name}
            </p>
            {profile.headline && (
              <p className="text-lg italic text-brand-teal mb-4">
                {profile.headline}
              </p>
            )}
            {profile.bio && (
              <p className="text-brand-charcoal/80 leading-7">
                {profile.bio}
              </p>
            )}
          </Container>
        </Section>
      )}

      {/* Feature grid */}
      <Section>
        <Container>
          <FeatureGrid />
        </Container>
      </Section>
    </>
  );
}
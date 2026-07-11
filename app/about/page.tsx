import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/database.types";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Tripti Agarwal — philatelist, numismatist, and heritage educator behind the Heritage Lab.",
};

/**
 * About
 * Server Component — fetches the single profile row from Supabase and
 * renders it as a full-page biography. Editing the profile row in
 * Supabase's Table Editor updates this page automatically, with no
 * code changes required.
 */
export default async function About() {
  const supabase = await createClient();

    const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .limit(1)
    .maybeSingle<Profile>();

  return (
    <Section>
      <Container className="max-w-3xl">
        {profile ? (
          <>
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-32 h-32 rounded-full object-cover mb-8 border-2 border-brand-gold/30"
              />
            ) : (
              <div className="w-32 h-32 rounded-full mb-8 bg-brand-teal/10 border-2 border-brand-gold/30 flex items-center justify-center text-3xl font-semibold text-brand-teal">
                {profile.full_name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)}
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-brand-charcoal mb-3">
              {profile.full_name}
            </h1>

            {profile.headline && (
              <p className="text-xl italic text-brand-teal mb-8">
                {profile.headline}
              </p>
            )}

            {profile.bio && (
              <div className="prose prose-lg max-w-none text-brand-charcoal/90 leading-8 whitespace-pre-line">
                {profile.bio}
              </div>
            )}
          </>
        ) : (
          <p className="text-brand-charcoal/70">
            Profile information is being added — check back soon.
          </p>
        )}
      </Container>
    </Section>
  );
}
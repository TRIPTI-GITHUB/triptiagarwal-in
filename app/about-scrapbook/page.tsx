import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { createClient } from "@/lib/supabase/server";
import { PolaroidPhoto } from "@/components/scrapbook/PolaroidPhoto";
import { ScrapbookSectionHeading } from "@/components/scrapbook/ScrapbookSectionHeading";
import { TornPaperCard } from "@/components/scrapbook/TornPaperCard";
import { BulletList } from "@/components/scrapbook/BulletList";
import { ScrapbookFadeIn } from "@/components/scrapbook/ScrapbookFadeIn";
import { WashiTape, Paperclip } from "@/components/scrapbook/decorations";
import type { Profile, AboutPhoto } from "@/lib/supabase/database.types";

const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"] });

// Not indexed while under review - this is a draft Tripti is comparing
// against the live /about page, reached only by direct URL.
export const metadata: Metadata = {
  title: "About — Scrapbook Draft | Tripti Agarwal",
  robots: { index: false, follow: false },
};

function findPhoto(photos: AboutPhoto[] | null, role: AboutPhoto["role"]): AboutPhoto | null {
  return photos?.find((p) => p.role === role) ?? null;
}

function findPhotosByRole(photos: AboutPhoto[] | null, role: AboutPhoto["role"]): AboutPhoto[] {
  return photos?.filter((p) => p.role === role) ?? [];
}

/**
 * AboutScrapbook
 * Draft review page at /about-scrapbook - a warm, personal, scrapbook-
 * style alternative to /about, built entirely from the same `profiles`
 * singleton row (extended with tagline/what_i_love_doing/accolades/
 * about_photos/contact_phone/contact_email, all nullable). Not linked
 * from any navigation and excluded from search indexing - direct-URL
 * review only, per its own scope.
 */
export default async function AboutScrapbook() {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .limit(1)
    .maybeSingle<Profile>();

  if (!profile) {
    return (
      <Section>
        <Container className="max-w-3xl text-center">
          <p className="text-brand-charcoal/70">Profile information is being added — check back soon.</p>
        </Container>
      </Section>
    );
  }

  const heroPhoto = findPhoto(profile.about_photos, "hero");
  const supportingPhoto = findPhoto(profile.about_photos, "supporting");
  const ceremonyPhotos = findPhotosByRole(profile.about_photos, "ceremony").slice(0, 2);
  const loves = profile.what_i_love_doing ?? [];
  const accolades = profile.accolades ?? [];

  return (
    <div className="bg-brand-cream">
      {/* Hero Zone */}
      <Section surface="ivory" className="pt-20 md:pt-28">
        <Container className="max-w-4xl">
          <ScrapbookFadeIn>
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
              <div className="order-2 md:order-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold text-brand-charcoal mb-3">{profile.full_name}</h1>
                {profile.tagline && (
                  <p className={`text-2xl md:text-3xl text-brand-teal ${caveat.className}`}>{profile.tagline}</p>
                )}
              </div>
              <div className="order-1 md:order-2 relative">
                <WashiTape className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 rotate-[-4deg] hidden md:block" />
                <PolaroidPhoto photo={heroPhoto} rotation={-3} size="lg" />
              </div>
            </div>
          </ScrapbookFadeIn>
        </Container>
      </Section>

      {/* Story Zone */}
      <Section surface="white">
        <Container className="max-w-5xl">
          <ScrapbookFadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
              <div className="flex justify-center md:justify-start order-1">
                <PolaroidPhoto photo={supportingPhoto} rotation={2} size="md" />
              </div>
              <div className="order-2">
                <ScrapbookSectionHeading fontClassName={caveat.className}>What I Love Doing</ScrapbookSectionHeading>
                {loves.length > 0 ? (
                  <BulletList items={loves} className="mt-4" />
                ) : (
                  <p className="text-brand-charcoal/50 italic mt-4">More to come soon.</p>
                )}
              </div>
            </div>
          </ScrapbookFadeIn>
        </Container>
      </Section>

      {/* Recognition Zone */}
      <Section surface="ivory">
        <Container className="max-w-5xl">
          <ScrapbookFadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
              <div className="relative order-1">
                <Paperclip className="absolute -top-6 left-6 w-5 h-10 text-brand-charcoal/30 hidden md:block" />
                <TornPaperCard>
                  <ScrapbookSectionHeading fontClassName={caveat.className}>Accolades</ScrapbookSectionHeading>
                  {accolades.length > 0 ? (
                    <BulletList items={accolades} className="mt-4" />
                  ) : (
                    <p className="text-brand-charcoal/50 italic mt-4">More to come soon.</p>
                  )}
                </TornPaperCard>
              </div>
              <div className="relative h-72 sm:h-80 flex items-center justify-center order-2">
                {ceremonyPhotos.length > 0 ? (
                  ceremonyPhotos.map((photo, i) => (
                    <div
                      key={photo.url}
                      className="absolute"
                      style={{ transform: `translate(${i * 24 - 12}px, ${i * 12}px)`, zIndex: i }}
                    >
                      <PolaroidPhoto photo={photo} rotation={i === 0 ? -4 : 5} size="sm" />
                    </div>
                  ))
                ) : (
                  <PolaroidPhoto photo={null} rotation={-2} size="sm" />
                )}
              </div>
            </div>
          </ScrapbookFadeIn>
        </Container>
      </Section>

      {/* Footer Zone */}
      <Section surface="white">
        <Container className="max-w-3xl text-center">
          <ScrapbookFadeIn>
            {profile.contact_phone || profile.contact_email ? (
              <p className="text-brand-charcoal/70">
                {profile.contact_phone && (
                  <a href={`tel:${profile.contact_phone}`} className="text-brand-teal hover:underline">
                    {profile.contact_phone}
                  </a>
                )}
                {profile.contact_phone && profile.contact_email && <span className="mx-3">·</span>}
                {profile.contact_email && (
                  <a href={`mailto:${profile.contact_email}`} className="text-brand-teal hover:underline">
                    {profile.contact_email}
                  </a>
                )}
              </p>
            ) : (
              <p className="text-brand-charcoal/40 italic">Contact details coming soon.</p>
            )}
          </ScrapbookFadeIn>
        </Container>
      </Section>
    </div>
  );
}

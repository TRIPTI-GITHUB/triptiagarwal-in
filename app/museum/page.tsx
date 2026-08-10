import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ExhibitCard } from "@/components/exhibits/ExhibitCard";
import { createClient } from "@/lib/supabase/server";
import type { Exhibit } from "@/lib/supabase/database.types";

export const metadata: Metadata = {
  title: "Museum",
  description: "Step into the 3D Heritage Lab museum — walk the halls, meet Dak, and explore exhibits up close.",
};

/**
 * MuseumIndex
 * The top-level "Museum" nav destination (PRD section 7.1's flagship
 * placement decision). Lists every published exhibit as an entry into
 * its own 3D room (/museum/[slug], already built and working for any
 * exhibit with sheets) - a real landing page rather than hardcoding a
 * link straight to one exhibit, so it stays correct as more exhibits
 * go live. Reuses ExhibitCard (generalized with an href override)
 * rather than duplicating its markup for a second grid.
 */
export default async function MuseumIndex() {
  const supabase = await createClient();

  const { data: exhibits } = await supabase
    .from("exhibits")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .returns<Exhibit[]>();

  return (
    <Section>
      <Container>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-charcoal mb-3">The 3D Museum</h1>
        <p className="text-lg text-brand-charcoal/70 mb-12 max-w-2xl">
          Walk the halls, meet Dak, and stand in front of every sheet exactly as if you were there.
        </p>

        {exhibits && exhibits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {exhibits.map((exhibit) => (
              <ExhibitCard
                key={exhibit.id}
                exhibit={exhibit}
                href={`/museum/${exhibit.slug}`}
                eyebrow="Step Inside"
              />
            ))}
          </div>
        ) : (
          <p className="text-brand-charcoal/70">3D exhibits are being prepared — check back soon.</p>
        )}
      </Container>
    </Section>
  );
}

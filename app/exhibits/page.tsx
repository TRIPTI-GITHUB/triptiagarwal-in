import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ExhibitCard } from "@/components/exhibits/ExhibitCard";
import { createClient } from "@/lib/supabase/server";
import type { Exhibit } from "@/lib/supabase/database.types";

export const metadata: Metadata = {
  title: "Exhibits",
  description:
    "Explore themed digital exhibits of stamps and coins — curated collections spanning India's freedom struggle, cultural heritage, and more.",
};

/**
 * ExhibitsIndex
 * Server Component — fetches every published exhibit, newest first,
 * and renders them as a "Frame Wall" grid using ExhibitCard. Draft
 * exhibits (published = false) are excluded by the RLS policy set
 * in Step 2.1.
 */
export default async function ExhibitsIndex() {
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
        <h1 className="text-4xl md:text-5xl font-bold text-brand-charcoal mb-3">
          Exhibits
        </h1>
        <p className="text-lg text-brand-charcoal/70 mb-12 max-w-2xl">
          Curated, themed exhibits of stamps and coins — each one a
          collection of exhibition sheets telling a single story.
        </p>

        {exhibits && exhibits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {exhibits.map((exhibit) => (
              <ExhibitCard key={exhibit.id} exhibit={exhibit} />
            ))}
          </div>
        ) : (
          <p className="text-brand-charcoal/70">
            Exhibits are being curated — check back soon.
          </p>
        )}
      </Container>
    </Section>
  );
}
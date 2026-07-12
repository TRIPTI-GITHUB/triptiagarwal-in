import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Flipbook } from "@/components/exhibits/Flipbook";
import { createClient } from "@/lib/supabase/server";
import type { Exhibit, ExhibitSheet } from "@/lib/supabase/database.types";

interface ExhibitPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ExhibitPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: exhibit } = await supabase
    .from("exhibits")
    .select("title, description")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle<Pick<Exhibit, "title" | "description">>();

  if (!exhibit) {
    return { title: "Exhibit Not Found" };
  }

  return {
    title: exhibit.title,
    description: exhibit.description ?? undefined,
  };
}

/**
 * ExhibitPage
 * Server Component — fetches the exhibit itself plus all of its sheets
 * (ordered by sheet_number), then hands the sheets to the Flipbook
 * Client Component for the actual interactive viewing experience.
 * The data-fetching stays server-side even though the viewer itself
 * is client-side — only the interactive part needs to run in-browser.
 */
export default async function ExhibitPage({ params }: ExhibitPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: exhibit } = await supabase
    .from("exhibits")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle<Exhibit>();

  if (!exhibit) {
    notFound();
  }

  const { data: sheets } = await supabase
    .from("exhibit_sheets")
    .select("*")
    .eq("exhibit_id", exhibit.id)
    .order("sheet_number", { ascending: true })
    .returns<ExhibitSheet[]>();

  return (
    <Section>
      <Container className="max-w-4xl">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-gold mb-3">
            {exhibit.type === "stamps"
              ? "Philately"
              : exhibit.type === "coins"
              ? "Numismatics"
              : "Mixed Collection"}{" "}
            · {exhibit.sheet_count} Sheets
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-brand-charcoal mb-4">
            {exhibit.title}
          </h1>
          {exhibit.description && (
            <p className="text-lg text-brand-charcoal/70 max-w-2xl mx-auto">
              {exhibit.description}
            </p>
          )}
        </div>

        {sheets && sheets.length > 0 ? (
          <Flipbook sheets={sheets} title={exhibit.title} />
        ) : (
          <p className="text-center text-brand-charcoal/70">
            Sheets for this exhibit are being added — check back soon.
          </p>
        )}
      </Container>
    </Section>
  );
}
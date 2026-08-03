import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Exhibit, ExhibitSheet } from "@/lib/supabase/database.types";
import { MuseumScene } from "@/components/museum/MuseumScene";

interface MuseumPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: MuseumPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: exhibit } = await supabase
    .from("exhibits")
    .select("title, description")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle<Pick<Exhibit, "title" | "description">>();

  if (!exhibit) {
    return { title: "Museum Not Found" };
  }

  return {
    title: exhibit.title + " - 3D Museum",
    description: exhibit.description ?? undefined,
  };
}

/**
 * MuseumPage
 * Server Component - fetches the exhibit plus every one of its
 * sheets, ordered by sheet_number, and hands them directly to
 * MuseumScene as a flat sequence for the guided Next/Previous
 * walkthrough.
 */
export default async function MuseumPage({ params }: MuseumPageProps) {
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

  if (!sheets || sheets.length === 0) {
    return (
      <div className="p-16 text-center text-brand-charcoal/70">
        This museum is being built - check back soon.
      </div>
    );
  }

  return (
    <div>
      <div className="bg-brand-charcoal text-brand-cream text-center py-3">
        <p className="text-sm">
          Walking through: <span className="font-semibold">{exhibit.title}</span>
        </p>
      </div>
      <MuseumScene sheets={sheets} />
    </div>
  );
}
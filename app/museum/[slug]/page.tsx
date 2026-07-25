import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Exhibit, ExhibitSheet } from "@/lib/supabase/database.types";
import type { MuseumSection } from "@/lib/museum/layout";
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
 * groupBySections
 * Groups sheets by their section_title (e.g. "Frame 1"). Sheets with
 * no section_title fall into a single default "Gallery" group - this
 * keeps simpler, unsectioned exhibits (like an 8-sheet single-theme
 * piece) working as one room, with no forced complexity.
 */
function groupBySections(sheets: ExhibitSheet[]): MuseumSection[] {
  const map = new Map<string, ExhibitSheet[]>();

  for (const sheet of sheets) {
    const key =
      sheet.section_title && sheet.section_title.trim() !== ""
        ? sheet.section_title
        : "Gallery";

    const existing = map.get(key);
    if (existing) {
      existing.push(sheet);
    } else {
      map.set(key, [sheet]);
    }
  }

  return Array.from(map.entries()).map(([title, sectionSheets]) => ({
    title,
    sheets: sectionSheets,
  }));
}

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

  const sections = groupBySections(sheets);

  return (
    <div>
      <div className="bg-brand-charcoal text-brand-cream text-center py-3">
        <p className="text-sm">
          Walking through: <span className="font-semibold">{exhibit.title}</span>
        </p>
      </div>
      <MuseumScene sections={sections} />
    </div>
  );
}
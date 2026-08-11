import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MuseumV2Scene } from "@/components/museum-v2/MuseumV2Scene";
import type { Exhibit, ExhibitSheet, MuseumV2Content } from "@/lib/supabase/database.types";
import type { MuseumV2Wing } from "@/lib/museum-v2/layout";

// Direct-URL-only preview - not linked from any nav, not indexed.
export const metadata: Metadata = {
  title: "museum-v2 Preview",
  robots: { index: false, follow: false },
};

export default async function MuseumV2Page() {
  const supabase = await createClient();

  const { data: exhibits } = await supabase
    .from("exhibits")
    .select("*")
    .eq("published", true)
    .returns<Exhibit[]>();

  const orderedExhibits = (exhibits ?? []).slice().sort((a, b) => {
    if (a.wing_order !== null && b.wing_order !== null) return a.wing_order - b.wing_order;
    if (a.wing_order !== null) return -1;
    if (b.wing_order !== null) return 1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const wings: MuseumV2Wing[] = [];
  for (let i = 0; i < orderedExhibits.length; i++) {
    const exhibit = orderedExhibits[i];
    const { data: sheets } = await supabase
      .from("exhibit_sheets")
      .select("*")
      .eq("exhibit_id", exhibit.id)
      .order("sheet_number", { ascending: true })
      .returns<ExhibitSheet[]>();

    if (sheets && sheets.length > 0) {
      wings.push({ index: wings.length, title: exhibit.title, sheets });
    }
  }

  const { data: content } = await supabase
    .from("museum_v2_content")
    .select("*")
    .limit(1)
    .maybeSingle<MuseumV2Content>();

  if (wings.length === 0) {
    return (
      <div className="p-16 text-center text-brand-charcoal/70">
        museum-v2 is being built - check back soon.
      </div>
    );
  }

  return <MuseumV2Scene wings={wings} lobbyPhotos={content?.lobby_photos ?? null} />;
}

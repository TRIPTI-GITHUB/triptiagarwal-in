import { createClient } from "@/lib/supabase/server";
import type { Exhibit, ExhibitSheet } from "@/lib/supabase/database.types";
import type { MuseumRoom } from "@/lib/museum/layout";
import { RoomMuseumScene } from "@/components/museum/RoomMuseumScene";

/**
 * groupIntoRooms
 * Groups sheets by section_title (Frame 1/2/3) into MuseumRoom
 * objects, one room per section - mirrors the grouping logic used
 * earlier for the multi-section corridor design.
 */
function groupIntoRooms(sheets: ExhibitSheet[]): MuseumRoom[] {
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

  return Array.from(map.entries()).map(([title, roomSheets]) => ({
    title,
    sheets: roomSheets,
  }));
}

/**
 * MuseumLayoutPreview
 * Temporary preview page for the room-based museum redesign - fetches
 * the same real "India's Freedom Struggle" data as the live museum
 * page, grouped into rooms instead of a flat sequence.
 */
export default async function MuseumLayoutPreview() {
  const supabase = await createClient();

  const { data: exhibit } = await supabase
    .from("exhibits")
    .select("*")
    .eq("slug", "indias-freedom-struggle")
    .maybeSingle<Exhibit>();

  if (!exhibit) {
    return (
      <div className="p-16 text-center text-brand-charcoal/70">
        Exhibit not found for preview.
      </div>
    );
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
        No sheets found for preview.
      </div>
    );
  }

  const rooms = groupIntoRooms(sheets);

  return <RoomMuseumScene rooms={rooms} />;
}
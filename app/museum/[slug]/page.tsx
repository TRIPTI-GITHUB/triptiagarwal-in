import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Exhibit, ExhibitSheet, ExhibitType, Profile } from "@/lib/supabase/database.types";

const TRIBUTE_TAGLINES: Record<ExhibitType, string> = {
  stamps: "A Philatelic Tribute",
  coins: "A Numismatic Tribute",
  mixed: "A Heritage Tribute",
};

import { groupIntoRooms } from "@/lib/museum/layout";
import { RoomMuseumScene } from "@/components/museum/RoomMuseumScene";
import { FREEDOM_STRUGGLE_THEME } from "@/lib/museum/museumPalette";

// Room Beautification Phase 2 - warm-cream re-theme, scoped to this one
// exhibit's slug only (see FREEDOM_STRUGGLE_THEME's doc comment). Every
// other exhibit gets `undefined` and renders with the shared defaults,
// unchanged.
const ROOM_THEME_BY_SLUG: Record<string, typeof FREEDOM_STRUGGLE_THEME> = {
  "indias-freedom-struggle": FREEDOM_STRUGGLE_THEME,
};

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .limit(1)
    .maybeSingle<Profile>();

  const rooms = groupIntoRooms(sheets);

  return (
    <RoomMuseumScene
      rooms={rooms}
      exhibitTitle={exhibit.title}
      exhibitTagline={TRIBUTE_TAGLINES[exhibit.type]}
      profile={profile}
      roomTheme={ROOM_THEME_BY_SLUG[slug]}
    />
  );
}
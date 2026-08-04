import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Exhibit, ExhibitSheet } from "@/lib/supabase/database.types";
import { groupIntoRooms } from "@/lib/museum/layout";
import { RoomMuseumScene } from "@/components/museum/RoomMuseumScene";

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

  const rooms = groupIntoRooms(sheets);

  return <RoomMuseumScene rooms={rooms} exhibitTitle={exhibit.title} />;
}
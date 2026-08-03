"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { RoomsShell } from "@/components/museum/RoomsShell";
import { ROOM_SIZE, EYE_HEIGHT } from "@/lib/museum/constants";
import type { MuseumRoom } from "@/lib/museum/layout";

// Placeholder sheets for preview only - Stage 4 replaces this with
// real Supabase data grouped by section_title.
function makeFakeSheets(start: number, count: number) {
  return Array.from({ length: count }).map((_, i) => ({
    id: "fake-" + (start + i),
    exhibit_id: "fake",
    sheet_number: start + i,
    image_url: "",
    caption: null,
    section_title: null,
    created_at: "",
    updated_at: "",
  }));
}

const rooms: MuseumRoom[] = [
  { title: "Frame 1", sheets: makeFakeSheets(1, 8) },
  { title: "Frame 2", sheets: makeFakeSheets(9, 8) },
  { title: "Frame 3", sheets: makeFakeSheets(17, 8) },
];

export default function MuseumLayoutPreview() {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 12, ROOM_SIZE * 1.5], fov: 55 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 6, 0]} intensity={1} />
        <RoomsShell rooms={rooms} />
        <OrbitControls target={[0, EYE_HEIGHT, -ROOM_SIZE]} />
      </Canvas>
    </div>
  );
}
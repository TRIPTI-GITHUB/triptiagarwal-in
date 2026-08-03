"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { GalleryWall } from "@/components/museum/GalleryWall";
import { CameraRig } from "@/components/museum/CameraRig";
import { SheetModal } from "@/components/museum/SheetModal";
import { ROOM_HEIGHT, SHEET_SPACING, EYE_HEIGHT } from "@/lib/museum/constants";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

interface MuseumSceneProps {
  sheets: ExhibitSheet[];
}

/**
 * MuseumScene
 * Client Component - a guided, button-driven walkthrough. `targetIndex`
 * (-1 = entrance, 0..N-1 = sheet index) drives CameraRig, which
 * smoothly glides and turns the camera to face each sheet in turn as
 * Next/Previous are pressed, simulating walking through the gallery
 * one exhibit at a time.
 */
export function MuseumScene({ sheets }: MuseumSceneProps) {
  const [targetIndex, setTargetIndex] = useState(-1);
  const [selectedSheet, setSelectedSheet] = useState<ExhibitSheet | null>(null);

  const numSheets = sheets.length;
  const atEntrance = targetIndex === -1;
  const atEnd = targetIndex === numSheets - 1;
  const currentSheet = targetIndex >= 0 ? sheets[targetIndex] : null;

  function goNext() {
    setTargetIndex((i) => Math.min(numSheets - 1, i + 1));
  }

  function goPrev() {
    setTargetIndex((i) => Math.max(-1, i - 1));
  }

  return (
    <div className="relative w-full h-[600px] bg-black">
      <Canvas camera={{ position: [0, EYE_HEIGHT, SHEET_SPACING], fov: 60 }}>
        <ambientLight intensity={0.55} />
        <pointLight position={[0, ROOM_HEIGHT - 0.5, 0]} intensity={1} />
        <GalleryWall sheets={sheets} onSelect={setSelectedSheet} />
        <CameraRig targetIndex={targetIndex} />
      </Canvas>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="text-white/80 text-sm bg-black/50 px-4 py-1.5 rounded-full">
          {atEntrance
            ? "Entrance"
            : "Sheet " +
              currentSheet!.sheet_number +
              " of " +
              numSheets +
              (currentSheet!.section_title ? " - " + currentSheet!.section_title : "")}
        </p>
      </div>

      {!atEntrance && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none">
          <p className="text-white/60 text-xs bg-black/40 px-3 py-1 rounded-full">
            Click the exhibit on the wall to view it up close
          </p>
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <button
          onClick={goPrev}
          disabled={atEntrance}
          className="px-5 py-2.5 rounded-full bg-white/90 text-brand-charcoal text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-colors"
        >
          Previous
        </button>
        <button
          onClick={goNext}
          disabled={atEnd}
          className="px-5 py-2.5 rounded-full bg-brand-gold text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-colors"
        >
          Next
        </button>
      </div>

      {selectedSheet && (
        <SheetModal sheet={selectedSheet} onClose={() => setSelectedSheet(null)} />
      )}
    </div>
  );
}
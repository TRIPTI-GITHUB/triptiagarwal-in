"use client";

import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { FirstPersonControls } from "@/components/museum/FirstPersonControls";
import { MobileCameraRig } from "@/components/museum/MobileCameraRig";
import { TouchJoystick } from "@/components/museum/TouchJoystick";
import { TouchLookArea } from "@/components/museum/TouchLookArea";
import { GallerySections } from "@/components/museum/GallerySections";
import { FrameInteraction } from "@/components/museum/FrameInteraction";
import { Crosshair } from "@/components/museum/Crosshair";
import { SheetModal } from "@/components/museum/SheetModal";
import { useIsTouchDevice } from "@/lib/museum/useIsTouchDevice";
import { ROOM_HEIGHT, SECTION_DEPTH } from "@/lib/museum/constants";
import type { MuseumSection } from "@/lib/museum/layout";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

interface MuseumSceneProps {
  sections: MuseumSection[];
}

/**
 * MuseumScene
 * Client Component - the entry point into the 3D world. Owns hover
 * and selection state for the click-to-view feature, in addition to
 * the lock state and control-scheme detection from earlier steps.
 */
export function MuseumScene({ sections }: MuseumSceneProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [hoveredSheet, setHoveredSheet] = useState<ExhibitSheet | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<ExhibitSheet | null>(null);
  const isTouch = useIsTouchDevice();
  const numSections = sections.length;

  const touchMoveRef = useRef({ x: 0, y: 0 });
  const touchLookRef = useRef({ x: 0, y: 0 });

  const crosshairLabel = hoveredSheet
    ? "Sheet " +
      hoveredSheet.sheet_number +
      (isTouch ? " - tap View below" : " - click to view")
    : null;

  return (
    <div className="relative w-full h-[600px] bg-black">
      <Canvas camera={{ position: [0, 1.6, SECTION_DEPTH / 2 - 1], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[0, ROOM_HEIGHT - 0.5, 0]} intensity={1} />
        <GallerySections sections={sections} />
        <FrameInteraction onHoverChange={setHoveredSheet} onSelect={setSelectedSheet} />
        {isTouch ? (
          <MobileCameraRig
            moveRef={touchMoveRef}
            lookRef={touchLookRef}
            numSections={numSections}
          />
        ) : (
          <FirstPersonControls onLockChange={setIsLocked} numSections={numSections} />
        )}
      </Canvas>

      <Crosshair label={crosshairLabel} />

      {isTouch ? (
        <>
          <TouchJoystick moveRef={touchMoveRef} />
          <TouchLookArea lookRef={touchLookRef} />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
            <p className="text-white/70 text-xs bg-black/50 px-3 py-1 rounded-full">
              Drag left side to move - drag right side to look
            </p>
          </div>
          {hoveredSheet && (
            <button
              onClick={() => setSelectedSheet(hoveredSheet)}
              className="absolute bottom-8 right-8 bg-brand-gold text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg z-10"
            >
              View Sheet
            </button>
          )}
        </>
      ) : (
        <>
          {!isLocked && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/70 text-white px-6 py-4 rounded-lg text-center max-w-xs">
                <p className="font-semibold mb-1">Click to enter the gallery</p>
                <p className="text-sm text-white/70">
                  WASD or arrow keys to move - mouse to look around - Esc to exit
                </p>
              </div>
            </div>
          )}
          {isLocked && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
              <p className="text-white/70 text-xs bg-black/50 px-3 py-1 rounded-full">
                WASD to move - Esc to exit - click a frame to view it
              </p>
            </div>
          )}
        </>
      )}

      {selectedSheet && (
        <SheetModal sheet={selectedSheet} onClose={() => setSelectedSheet(null)} />
      )}
    </div>
  );
}
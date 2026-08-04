"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { RoomsShell } from "@/components/museum/RoomsShell";
import { RoomFreeRoam } from "@/components/museum/RoomFreeRoam";
import { RoomMobileRig } from "@/components/museum/RoomMobileRig";
import { TouchJoystick } from "@/components/museum/TouchJoystick";
import { TouchLookArea } from "@/components/museum/TouchLookArea";
import { RotationArrows } from "@/components/museum/RotationArrows";
import { MinimapTracker, type MinimapPose } from "@/components/museum/MinimapTracker";
import { Minimap } from "@/components/museum/Minimap";
import { TourGuide } from "@/components/museum/TourGuide";
import { TourControls } from "@/components/museum/TourControls";
import { TourArrowNav } from "@/components/museum/TourArrowNav";
import { SheetModal } from "@/components/museum/SheetModal";
import { useIsTouchDevice } from "@/lib/museum/useIsTouchDevice";
import { ROOM_SIZE, EYE_HEIGHT, ROOM_HEIGHT } from "@/lib/museum/roomConstants";
import { buildTourPath, roomCenterZ, type MuseumRoom } from "@/lib/museum/layout";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

interface RoomMuseumSceneProps {
  rooms: MuseumRoom[];
  exhibitTitle?: string;
}

/**
 * RoomMuseumScene
 * Client Component - the room-based museum's entry point. Renders as
 * a fixed full-viewport overlay (covering the site header/footer)
 * rather than a normal in-page block, so the experience always fills
 * exactly one screen with no scrolling, regardless of page chrome
 * above it.
 */
export function RoomMuseumScene({ rooms, exhibitTitle }: RoomMuseumSceneProps) {
  const isTouch = useIsTouchDevice();
  const touchMoveRef = useRef({ x: 0, y: 0 });
  const touchLookRef = useRef({ x: 0, y: 0 });
  const tapRef = useRef({ x: 0, y: 0, pending: false });
  const turnRef = useRef({ left: false, right: false });
  const poseRef = useRef<MinimapPose>({ x: 0, z: ROOM_SIZE, facingX: 0, facingZ: -1 });
  const [selectedSheet, setSelectedSheet] = useState<ExhibitSheet | null>(null);
  const [tourMode, setTourMode] = useState(false);
  const [navIndex, setNavIndex] = useState(-1);
  const numRooms = rooms.length;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const tourPath = useMemo(() => buildTourPath(rooms), [rooms]);
  const flatSheets = useMemo(
    () => rooms.flatMap((room) => room.sheets.map((sheet) => ({ sheet, roomTitle: room.title }))),
    [rooms]
  );
  const totalSheets = flatSheets.length;
  const targetStopIndex = tourPath.navigableIndices[navIndex + 1] ?? tourPath.navigableIndices[0];

  const currentLabel =
    navIndex === -1
      ? "Entrance"
      : "Sheet " +
        flatSheets[navIndex].sheet.sheet_number +
        " of " +
        totalSheets +
        " - " +
        flatSheets[navIndex].roomTitle;

  function toggleMode() {
    setTourMode((prev) => {
      if (!prev) setNavIndex(-1);
      return !prev;
    });
  }

  function goNext() {
    setNavIndex((i) => Math.min(totalSheets - 1, i + 1));
  }

  function goPrev() {
    setNavIndex((i) => Math.max(-1, i - 1));
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black">
      <Canvas camera={{ position: [0, EYE_HEIGHT, ROOM_SIZE], fov: 60 }}>
        <fog attach="fog" args={["#3a4552", 7, 28]} />
        <ambientLight intensity={0.65} color="#ffffff" />
        {rooms.map((_, i) => (
          <pointLight
            key={"room-light-" + i}
            position={[0, ROOM_HEIGHT - 0.4, roomCenterZ(i)]}
            intensity={1}
            color="#ffffff"
            distance={10}
            decay={2}
          />
        ))}
        <RoomsShell rooms={rooms} />
        <MinimapTracker poseRef={poseRef} />

        {tourMode ? (
          <TourGuide
            stops={tourPath.stops}
            targetStopIndex={targetStopIndex}
            onSelect={setSelectedSheet}
          />
        ) : isTouch ? (
          <RoomMobileRig
            moveRef={touchMoveRef}
            lookRef={touchLookRef}
            tapRef={tapRef}
            turnRef={turnRef}
            numRooms={numRooms}
            onSelect={setSelectedSheet}
          />
        ) : (
          <RoomFreeRoam numRooms={numRooms} onSelect={setSelectedSheet} turnRef={turnRef} />
        )}
      </Canvas>

      {exhibitTitle && (
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <p className="text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full">
            {exhibitTitle}
          </p>
        </div>
      )}

      {!tourMode && isTouch && (
        <>
          <TouchJoystick moveRef={touchMoveRef} />
          <TouchLookArea lookRef={touchLookRef} tapRef={tapRef} />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
            <p className="text-white/70 text-xs bg-black/50 px-3 py-1 rounded-full">
              Drag left to move - drag right or use arrows to look - tap a sheet to view it
            </p>
          </div>
        </>
      )}

      {!tourMode && !isTouch && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <p className="text-white/70 text-xs bg-black/50 px-3 py-1 rounded-full">
            W/S walk - A/D strafe - arrow keys, drag, or buttons to look - click a sheet to view it
          </p>
        </div>
      )}

      {!tourMode && <RotationArrows turnRef={turnRef} />}

      <TourControls tourMode={tourMode} onToggleMode={toggleMode} currentLabel={currentLabel} />

      {tourMode && (
        <TourArrowNav
          onPrev={goPrev}
          onNext={goNext}
          atStart={navIndex <= -1}
          atEnd={navIndex >= totalSheets - 1}
        />
      )}

      <Minimap numRooms={numRooms} poseRef={poseRef} />

      {selectedSheet && (
        <SheetModal sheet={selectedSheet} onClose={() => setSelectedSheet(null)} />
      )}
    </div>
  );
}
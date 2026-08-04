"use client";

import { useMemo, useRef, useState } from "react";
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
import { SheetModal } from "@/components/museum/SheetModal";
import { useIsTouchDevice } from "@/lib/museum/useIsTouchDevice";
import { ROOM_SIZE, EYE_HEIGHT } from "@/lib/museum/roomConstants";
import { buildTourPath, type MuseumRoom } from "@/lib/museum/layout";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

interface RoomMuseumSceneProps {
  rooms: MuseumRoom[];
}

/**
 * RoomMuseumScene
 * Client Component - the room-based museum's entry point. Owns
 * `tourMode` (free-roam vs. guided) and `navIndex` (which Entrance/
 * sheet stop is currently targeted in tour mode), in addition to
 * everything from earlier stages. The tour path itself is computed
 * once via buildTourPath and reused for the whole session.
 */
export function RoomMuseumScene({ rooms }: RoomMuseumSceneProps) {
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
    <div className="relative w-full h-screen bg-black">
      <Canvas camera={{ position: [0, EYE_HEIGHT, ROOM_SIZE], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 3.5, 0]} intensity={1} />
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

      <TourControls
        tourMode={tourMode}
        onToggleMode={toggleMode}
        navIndex={navIndex}
        totalSheets={totalSheets}
        currentLabel={currentLabel}
        onNext={goNext}
        onPrev={goPrev}
      />

      <Minimap numRooms={numRooms} poseRef={poseRef} />

      {selectedSheet && (
        <SheetModal sheet={selectedSheet} onClose={() => setSelectedSheet(null)} />
      )}
    </div>
  );
}
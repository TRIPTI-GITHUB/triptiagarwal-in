"use client";

import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { RoomsShell } from "@/components/museum/RoomsShell";
import { RoomFreeRoam } from "@/components/museum/RoomFreeRoam";
import { RoomMobileRig } from "@/components/museum/RoomMobileRig";
import { TouchJoystick } from "@/components/museum/TouchJoystick";
import { TouchLookArea } from "@/components/museum/TouchLookArea";
import { RotationArrows } from "@/components/museum/RotationArrows";
import { SheetModal } from "@/components/museum/SheetModal";
import { useIsTouchDevice } from "@/lib/museum/useIsTouchDevice";
import { ROOM_SIZE, EYE_HEIGHT } from "@/lib/museum/roomConstants";
import type { MuseumRoom } from "@/lib/museum/layout";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

interface RoomMuseumSceneProps {
  rooms: MuseumRoom[];
}

/**
 * RoomMuseumScene
 * Client Component - the room-based museum's entry point. Owns
 * turnRef (shared between RotationArrows and whichever control
 * scheme is active) in addition to movement refs and modal state
 * from earlier stages.
 */
export function RoomMuseumScene({ rooms }: RoomMuseumSceneProps) {
  const isTouch = useIsTouchDevice();
  const touchMoveRef = useRef({ x: 0, y: 0 });
  const touchLookRef = useRef({ x: 0, y: 0 });
  const tapRef = useRef({ x: 0, y: 0, pending: false });
  const turnRef = useRef({ left: false, right: false });
  const [selectedSheet, setSelectedSheet] = useState<ExhibitSheet | null>(null);
  const numRooms = rooms.length;

  return (
    <div className="relative w-full h-screen bg-black">
      <Canvas camera={{ position: [0, EYE_HEIGHT, ROOM_SIZE], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 3.5, 0]} intensity={1} />
        <RoomsShell rooms={rooms} />
        {isTouch ? (
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

      {isTouch ? (
        <>
          <TouchJoystick moveRef={touchMoveRef} />
          <TouchLookArea lookRef={touchLookRef} tapRef={tapRef} />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
            <p className="text-white/70 text-xs bg-black/50 px-3 py-1 rounded-full">
              Drag left to move - drag right or use arrows to look - tap a sheet to view it
            </p>
          </div>
        </>
      ) : (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <p className="text-white/70 text-xs bg-black/50 px-3 py-1 rounded-full">
            W/S walk - A/D strafe - arrow keys, drag, or buttons to look - click a sheet to view it
          </p>
        </div>
      )}

      <RotationArrows turnRef={turnRef} />

      {selectedSheet && (
        <SheetModal sheet={selectedSheet} onClose={() => setSelectedSheet(null)} />
      )}
    </div>
  );
}
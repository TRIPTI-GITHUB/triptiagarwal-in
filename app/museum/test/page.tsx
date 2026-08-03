"use client";

import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { RoomsShell } from "@/components/museum/RoomsShell";
import { RoomFreeRoam } from "@/components/museum/RoomFreeRoam";
import { RoomMobileRig } from "@/components/museum/RoomMobileRig";
import { TouchJoystick } from "@/components/museum/TouchJoystick";
import { TouchLookArea } from "@/components/museum/TouchLookArea";
import { useIsTouchDevice } from "@/lib/museum/useIsTouchDevice";
import { ROOM_SIZE, EYE_HEIGHT } from "@/lib/museum/roomConstants";
import type { MuseumRoom } from "@/lib/museum/layout";

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
  const isTouch = useIsTouchDevice();
  const touchMoveRef = useRef({ x: 0, y: 0 });
  const touchLookRef = useRef({ x: 0, y: 0 });
  const numRooms = rooms.length;

  return (
    <div className="relative w-full h-screen bg-black">
      <Canvas camera={{ position: [0, EYE_HEIGHT, ROOM_SIZE], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 3.5, 0]} intensity={1} />
        <RoomsShell rooms={rooms} />
        {isTouch ? (
          <RoomMobileRig moveRef={touchMoveRef} lookRef={touchLookRef} numRooms={numRooms} />
        ) : (
          <RoomFreeRoam numRooms={numRooms} />
        )}
      </Canvas>

      {isTouch ? (
        <>
          <TouchJoystick moveRef={touchMoveRef} />
          <TouchLookArea lookRef={touchLookRef} />
        </>
      ) : (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <p className="text-white/70 text-xs bg-black/50 px-3 py-1 rounded-full">
            WASD to move - click and drag to look around
          </p>
        </div>
      )}
    </div>
  );
}
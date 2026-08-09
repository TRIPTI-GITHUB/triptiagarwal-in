"use client";

import { useEffect, useRef, useState, MutableRefObject } from "react";
import { ROOM_SIZE, DOOR_WIDTH } from "@/lib/museum/roomConstants";
import { entryWallZ, totalHallLength } from "@/lib/museum/layout";
import { MUSEUM_GOLD, MUSEUM_TEAL } from "@/lib/museum/museumPalette";
import type { MinimapPose } from "@/components/museum/MinimapTracker";
import type { DakLivePose } from "@/components/museum/DakCompanion";

interface MinimapProps {
  numRooms: number;
  poseRef: MutableRefObject<MinimapPose>;
  // Dak's live position while guiding a tour - renders as a second,
  // gold marker so a visitor who wanders (or is just lagging behind)
  // can glance down and see where their guide is, without a separate
  // on-screen compass/arrow system.
  guidePoseRef?: MutableRefObject<DakLivePose | null>;
}

const PAD = 1;
const UPDATE_INTERVAL_MS = 100;

/**
 * Minimap
 * Small top-down floor plan overlay (bottom-right corner). Oriented
 * so Room 1 (the entrance) sits at the BOTTOM of the map and the
 * final room sits at the TOP - matching the direction you actually
 * walk (deeper into the gallery = further up the map), rather than
 * an arbitrary top-to-bottom room order.
 */
export function Minimap({ numRooms, poseRef, guidePoseRef }: MinimapProps) {
  const [pose, setPose] = useState<MinimapPose>({ x: 0, z: ROOM_SIZE, facingX: 0, facingZ: -1 });
  const [guidePose, setGuidePose] = useState<DakLivePose | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    let lastUpdate = 0;

    function tick(time: number) {
      if (time - lastUpdate >= UPDATE_INTERVAL_MS) {
        setPose({ ...poseRef.current });
        setGuidePose(guidePoseRef?.current ? { ...guidePoseRef.current } : null);
        lastUpdate = time;
      }
      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [poseRef, guidePoseRef]);

  const half = ROOM_SIZE / 2;
  const frontZ = entryWallZ(0);
  const depth = totalHallLength(numRooms);

  // Converts a world Z coordinate into map Y, with the entrance at
  // the BOTTOM of the map (large Y) and the far end at the TOP
  // (small Y) - the opposite of a plain top-to-bottom room order.
  function mapY(worldZ: number): number {
    const distanceFromEntrance = frontZ - worldZ; // 0 at entrance, growing as you go deeper
    return depth - distanceFromEntrance;
  }

  // Room rectangles: room index 0 (entrance) at the bottom of the
  // map, last room at the top.
  function roomTopY(roomIndex: number): number {
    return (numRooms - 1 - roomIndex) * ROOM_SIZE;
  }

  const wallLineYs: number[] = [];
  for (let i = 0; i <= numRooms; i++) {
    wallLineYs.push(depth - i * ROOM_SIZE);
  }

  const markerX = pose.x;
  const markerY = mapY(pose.z);

  const dirX = pose.facingX;
  // With the entrance now at the bottom, map Y increases in the same
  // direction as world Z increases (see mapY above) - so facing
  // direction maps straight across, no sign flip needed here.
  const dirY = pose.facingZ;
  const angleDeg = (Math.atan2(dirX, -dirY) * 180) / Math.PI;

  const viewBox = `${-half - PAD} ${-PAD} ${ROOM_SIZE + PAD * 2} ${depth + PAD * 2}`;

  return (
    <div className="absolute bottom-6 right-6 w-36 sm:w-44 bg-black/60 rounded-lg p-2 z-10 pointer-events-none">
      <svg viewBox={viewBox} className="w-full h-auto" style={{ maxHeight: 220 }}>
        {Array.from({ length: numRooms }).map((_, i) => (
          <rect
            key={"floor-" + i}
            x={-half}
            y={roomTopY(i)}
            width={ROOM_SIZE}
            height={ROOM_SIZE}
            fill="#3a3226"
            opacity={0.5}
          />
        ))}

        <line x1={-half} y1={0} x2={-half} y2={depth} stroke="#e8e2d5" strokeWidth={0.1} />
        <line x1={half} y1={0} x2={half} y2={depth} stroke="#e8e2d5" strokeWidth={0.1} />

        {wallLineYs.map((y, i) => (
          <g key={"wall-" + i}>
            <line
              x1={-half}
              y1={y}
              x2={-DOOR_WIDTH / 2}
              y2={y}
              stroke="#e8e2d5"
              strokeWidth={0.1}
            />
            <line
              x1={DOOR_WIDTH / 2}
              y1={y}
              x2={half}
              y2={y}
              stroke="#e8e2d5"
              strokeWidth={0.1}
            />
          </g>
        ))}

        {Array.from({ length: numRooms }).map((_, i) => (
          <text
            key={"label-" + i}
            x={0}
            y={roomTopY(i) + ROOM_SIZE / 2}
            fontSize={0.6}
            fill="#f5f0e6"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {i + 1}
          </text>
        ))}

        {guidePose && (
          <circle
            cx={guidePose.x}
            cy={mapY(guidePose.z)}
            r={0.45}
            fill={MUSEUM_GOLD}
            stroke="#fff"
            strokeWidth={0.08}
          />
        )}

        <g transform={`translate(${markerX} ${markerY}) rotate(${angleDeg})`}>
          <polygon points="0,-0.6 0.4,0.4 -0.4,0.4" fill={MUSEUM_TEAL} stroke="#fff" strokeWidth={0.05} />
        </g>
      </svg>
    </div>
  );
}
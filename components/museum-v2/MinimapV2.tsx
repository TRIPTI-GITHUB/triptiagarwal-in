"use client";

import { useEffect, useRef, useState, MutableRefObject } from "react";
import { MUSEUM_GOLD, MUSEUM_TEAL } from "@/lib/museum/museumPalette";
import { getAllWalkRects } from "@/lib/museum-v2/layout";
import type { MinimapPose } from "@/components/museum/MinimapTracker";
import type { DakLivePose } from "@/components/museum/DakCompanion";

interface MinimapV2Props {
  numWings: number;
  poseRef: MutableRefObject<MinimapPose>;
  guidePoseRef?: MutableRefObject<DakLivePose | null>;
}

const PAD = 2;
const UPDATE_INTERVAL_MS = 100;
const PARCHMENT_FILL = "#C9BBA0";
const INK_COLOR = "#3A2E1F";

/**
 * MinimapV2
 * museum-v2's top-down floor plan overlay - a new variant of the
 * existing Minimap, since that component's draw logic is tied to v1's
 * straight room-chain layout (imports ROOM_SIZE/entryWallZ/
 * totalHallLength directly). Draws straight from getAllWalkRects, the
 * same rectangles the collision system uses, so the map can never drift
 * from the actual walkable floor plan.
 */
export function MinimapV2({ numWings, poseRef, guidePoseRef }: MinimapV2Props) {
  const [pose, setPose] = useState<MinimapPose>({ x: 0, z: 8, facingX: 0, facingZ: -1 });
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

  const rects = getAllWalkRects(numWings);
  const minX = Math.min(...rects.map((r) => r.minX));
  const maxX = Math.max(...rects.map((r) => r.maxX));
  const minZ = Math.min(...rects.map((r) => r.minZ));
  const maxZ = Math.max(...rects.map((r) => r.maxZ));

  const angleDeg = (Math.atan2(pose.facingX, -pose.facingZ) * 180) / Math.PI;
  const viewBox = `${minX - PAD} ${minZ - PAD} ${maxX - minX + PAD * 2} ${maxZ - minZ + PAD * 2}`;

  return (
    <div className="absolute bottom-6 right-6 w-36 sm:w-44 bg-black/60 border border-brand-gold/30 rounded-lg p-2 z-10 pointer-events-none">
      <svg viewBox={viewBox} className="w-full h-auto" style={{ maxHeight: 220 }}>
        {rects.map((r, i) => (
          <rect
            key={"rect-" + i}
            x={r.minX}
            y={r.minZ}
            width={r.maxX - r.minX}
            height={r.maxZ - r.minZ}
            fill={PARCHMENT_FILL}
            opacity={0.9}
            stroke={INK_COLOR}
            strokeWidth={0.1}
          />
        ))}

        {guidePose && (
          <circle cx={guidePose.x} cy={guidePose.z} r={0.45} fill={MUSEUM_GOLD} stroke="#fff" strokeWidth={0.08} />
        )}

        <g transform={`translate(${pose.x} ${pose.z}) rotate(${angleDeg})`}>
          <polygon points="0,-0.6 0.4,0.4 -0.4,0.4" fill={MUSEUM_TEAL} stroke="#fff" strokeWidth={0.05} />
        </g>
      </svg>
    </div>
  );
}

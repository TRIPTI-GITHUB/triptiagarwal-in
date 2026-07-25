"use client";

import { Suspense } from "react";
import { useTexture } from "@react-three/drei";
import { FRAME_WIDTH, FRAME_HEIGHT } from "@/lib/museum/constants";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

interface FrameArtworkProps {
  sheet: ExhibitSheet;
}

function FrameArtwork({ sheet }: FrameArtworkProps) {
  const texture = useTexture(sheet.image_url);
  return (
    <mesh position={[0, 0, 0.02]} userData={{ isExhibitFrame: true, sheet: sheet }}>
      <planeGeometry args={[FRAME_WIDTH - 0.15, FRAME_HEIGHT - 0.15]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

interface FrameProps {
  sheet: ExhibitSheet;
  position: [number, number, number];
  rotationY: number;
}

/**
 * Frame
 * A single mounted exhibit sheet. The artwork mesh carries
 * `userData.isExhibitFrame` and the full sheet record - this is what
 * FrameInteraction's raycaster reads to identify which sheet is
 * currently being looked at.
 */
export function Frame({ sheet, position, rotationY }: FrameProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <planeGeometry args={[FRAME_WIDTH, FRAME_HEIGHT]} />
        <meshStandardMaterial color="#b08d57" />
      </mesh>
      <Suspense fallback={null}>
        <FrameArtwork sheet={sheet} />
      </Suspense>
    </group>
  );
}
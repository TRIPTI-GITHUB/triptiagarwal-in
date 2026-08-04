"use client";

import { Suspense } from "react";
import { useTexture, Text } from "@react-three/drei";
import { FRAME_WIDTH, FRAME_HEIGHT } from "@/lib/museum/roomConstants";
import type { ExhibitSheet } from "@/lib/supabase/database.types";
import * as THREE from "three";

interface RoomFrameArtworkProps {
  sheet: ExhibitSheet;
}

function RoomFrameArtwork({ sheet }: RoomFrameArtworkProps) {
  const texture = useTexture(sheet.image_url);
  return (
    <mesh position={[0, 0, 0.02]} userData={{ isExhibitFrame: true, sheet: sheet }}>
      <planeGeometry args={[FRAME_WIDTH - 0.15, FRAME_HEIGHT - 0.15]} />
      {/* meshBasicMaterial is "unlit" - it always shows the texture's
          true colors regardless of scene lighting, matching exactly
          how the same image looks in the popup's plain <img> tag. */}
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

interface RoomFrameProps {
  sheet: ExhibitSheet;
  position: [number, number, number];
  rotationY: number;
}

/**
 * RoomFrame
 * A single mounted exhibit sheet: a dark blue backing panel (lit,
 * so it responds naturally to room lighting like the walls do), the
 * real sheet image (unlit, always true brightness), and - if set - a
 * capitalized gold title close above it.
 */
export function RoomFrame({ sheet, position, rotationY }: RoomFrameProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh userData={{ isExhibitFrame: true, sheet: sheet }}>
        <planeGeometry args={[FRAME_WIDTH, FRAME_HEIGHT]} />
        <meshStandardMaterial color="#153A5B" side={THREE.DoubleSide}/>
      </mesh>
      <Suspense fallback={null}>
        <RoomFrameArtwork sheet={sheet} />
      </Suspense>

      {sheet.heading && (
        <Text
          position={[0, FRAME_HEIGHT / 2 + 0.16, 0.05]}
          fontSize={0.28}
          letterSpacing={0.05}
          maxWidth={FRAME_WIDTH + 0.5}
          textAlign="center"
          color="#C9A227"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.006}
          outlineColor="#153A5B"
        >
          {sheet.heading.toUpperCase()}
        </Text>
      )}
    </group>
  );
}
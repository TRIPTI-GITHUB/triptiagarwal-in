"use client";

import { Suspense } from "react";
import { useTexture, Text } from "@react-three/drei";
import { FRAME_WIDTH, FRAME_HEIGHT } from "@/lib/museum/roomConstants";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

interface RoomFrameArtworkProps {
  sheet: ExhibitSheet;
}

function RoomFrameArtwork({ sheet }: RoomFrameArtworkProps) {
  const texture = useTexture(sheet.image_url);
  return (
    <mesh position={[0, 0, 0.02]} userData={{ isExhibitFrame: true, sheet: sheet }}>
      <planeGeometry args={[FRAME_WIDTH - 0.15, FRAME_HEIGHT - 0.15]} />
      <meshStandardMaterial map={texture} />
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
 * A single mounted exhibit sheet: a gold backing panel, the real
 * sheet image, and - if the sheet has a `heading` set in Supabase -
 * a large title floating just above it. The heading is rendered as
 * part of the same rotated group as the frame itself, so it always
 * correctly faces into the room, matching whichever wall the sheet
 * is mounted on, with no extra positioning math needed here.
 */
export function RoomFrame({ sheet, position, rotationY }: RoomFrameProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh userData={{ isExhibitFrame: true, sheet: sheet }}>
        <planeGeometry args={[FRAME_WIDTH, FRAME_HEIGHT]} />
        <meshStandardMaterial color="#b08d57" />
      </mesh>
      <Suspense fallback={null}>
        <RoomFrameArtwork sheet={sheet} />
      </Suspense>

      {sheet.heading && (
        <Text
          position={[0, FRAME_HEIGHT / 2 + 0.35, 0.05]}
          fontSize={0.28}
          maxWidth={FRAME_WIDTH + 0.6}
          textAlign="center"
          color="#2D2D2D"
          anchorX="center"
          anchorY="bottom"
        >
          {sheet.heading}
        </Text>
      )}
    </group>
  );
}
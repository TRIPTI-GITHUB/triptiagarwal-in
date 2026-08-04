"use client";

import { Suspense } from "react";
import { useTexture, Text } from "@react-three/drei";
import { FRAME_WIDTH, FRAME_HEIGHT } from "@/lib/museum/roomConstants";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

const PLAYFAIR_FONT = "/fonts/PlayfairDisplay-Bold.ttf";

interface RoomFrameArtworkProps {
  sheet: ExhibitSheet;
}

function RoomFrameArtwork({ sheet }: RoomFrameArtworkProps) {
  const texture = useTexture(sheet.image_url);
  return (
    <mesh position={[0, 0, 0.03]} userData={{ isExhibitFrame: true, sheet: sheet }}>
      <planeGeometry args={[FRAME_WIDTH - 0.35, FRAME_HEIGHT - 0.35]} />
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
 * A single mounted exhibit sheet, built as three stacked layers to
 * read as a genuine picture frame: a thick dark brown outer border,
 * a thin antique gold inner trim line, and the sheet image itself on
 * top (unlit, so it always shows true brightness). The heading, if
 * set, floats above in Playfair Display - matching the site's own
 * heading typeface for visual consistency.
 */
export function RoomFrame({ sheet, position, rotationY }: RoomFrameProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh userData={{ isExhibitFrame: true, sheet: sheet }}>
        <planeGeometry args={[FRAME_WIDTH, FRAME_HEIGHT]} />
        <meshStandardMaterial color="#3E2723" />
      </mesh>

      <mesh position={[0, 0, 0.015]}>
        <planeGeometry args={[FRAME_WIDTH - 0.18, FRAME_HEIGHT - 0.18]} />
        <meshStandardMaterial color="#C9A227" />
      </mesh>

      <Suspense fallback={null}>
        <RoomFrameArtwork sheet={sheet} />
      </Suspense>

      {sheet.heading && (
        <Text
          position={[0, FRAME_HEIGHT / 2 + 0.14, 0.05]}
          font={PLAYFAIR_FONT}
          fontSize={0.19}
          letterSpacing={0.03}
          maxWidth={FRAME_WIDTH + 0.5}
          textAlign="center"
          color="#C9A227"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.005}
          outlineColor="#153A5B"
        >
          {sheet.heading.toUpperCase()}
        </Text>
      )}
    </group>
  );
}
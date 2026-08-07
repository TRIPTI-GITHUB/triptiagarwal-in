"use client";

import { Suspense } from "react";
import { useTexture, Text } from "@react-three/drei";
import { FRAME_WIDTH, FRAME_HEIGHT } from "@/lib/museum/roomConstants";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

const PLAYFAIR_FONT = "/fonts/PlayfairDisplay-Bold.ttf";
const AWARD_GLOW_COLOR = "#F0C75E";

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
 * A single mounted exhibit sheet, built as three stacked layers: a
 * rich mahogany outer border (lightened from an earlier near-black
 * shade so it reads as brown even in dimmer corners), a thin gold
 * inner trim, and the sheet image (unlit, always true brightness).
 * Award/recognition sheets (section 9) get a soft gold glow - a faint
 * emissive rim behind the frame plus a low, short-range point light -
 * distinguishing them from regular collection sheets without being
 * flashy.
 */
export function RoomFrame({ sheet, position, rotationY }: RoomFrameProps) {
  const isAward = sheet.category === "award";

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {isAward && (
        <>
          <mesh position={[0, 0, -0.02]}>
            <planeGeometry args={[FRAME_WIDTH + 0.3, FRAME_HEIGHT + 0.3]} />
            <meshStandardMaterial
              color={AWARD_GLOW_COLOR}
              emissive={AWARD_GLOW_COLOR}
              emissiveIntensity={0.6}
              transparent
              opacity={0.22}
              depthWrite={false}
            />
          </mesh>
          <pointLight
            position={[0, 0, 0.6]}
            color={AWARD_GLOW_COLOR}
            intensity={0.8}
            distance={2.5}
            decay={2}
          />
        </>
      )}

      <mesh userData={{ isExhibitFrame: true, sheet: sheet }}>
        <planeGeometry args={[FRAME_WIDTH, FRAME_HEIGHT]} />
        <meshStandardMaterial color="#5C3A21" />
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
"use client";

import { Suspense } from "react";
import { useTexture, Text } from "@react-three/drei";
import { noRaycast } from "@/lib/museum/threeHelpers";
import { FRAME_WIDTH, FRAME_HEIGHT } from "@/lib/museum/roomConstants";
import {
  FRAME_WOOD_COLOR,
  MUSEUM_GOLD,
  MUSEUM_GOLD_LIGHT,
  MUSEUM_CHARCOAL,
  VITRINE_GLASS_COLOR,
  WAX_SEAL_COLOR,
  AWARD_GLOW_COLOR,
  HIGH_CONTRAST_TRIM,
} from "@/lib/museum/museumPalette";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

const PLAYFAIR_FONT = "/fonts/PlayfairDisplay-Bold.ttf";
const PLAQUE_HEIGHT = 0.32;
const PLAQUE_WIDTH = FRAME_WIDTH * 0.7;

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
  highContrast?: boolean;
  // Mobile "simplified geometry" (Mobile Adaptation, section 12) - the
  // vitrine glass sheen is a decorative transparent overlay, one extra
  // draw call per sheet; skipping it on touch devices trims overdraw
  // without touching anything a visitor actually reads (heading,
  // plaque, curator's-note tell all stay).
  simplified?: boolean;
}

/**
 * RoomFrame
 * A single mounted exhibit sheet, built from stacked layers: a dark
 * walnut outer border, a gold inner trim, the sheet image (unlit,
 * always true brightness), a faint vitrine-glass sheen, a brass ID
 * plaque (sheet number + heading, always visible - so a walking
 * visitor reads "this was catalogued" before ever clicking to view),
 * and a small wax-seal tell in the corner when the sheet carries a
 * curator's note. Award/recognition sheets (section 9) additionally
 * get a soft gold glow - a faint emissive rim behind the frame plus a
 * low, short-range point light - and a foil-toned plaque instead of
 * plain brass, distinguishing them from regular collection sheets
 * without being flashy.
 *
 * The glass sheen, plaque, and wax seal are all excluded from
 * raycasting (`noRaycast`) so a click anywhere on the frame still
 * reaches the tagged image/frame mesh beneath them - none of this
 * decoration is itself clickable.
 */
export function RoomFrame({ sheet, position, rotationY, highContrast, simplified }: RoomFrameProps) {
  const isAward = sheet.category === "award";
  const hasCuratorNote = !!sheet.curator_note;

  const trim = highContrast ? HIGH_CONTRAST_TRIM : MUSEUM_GOLD;
  // The plaque has its own opaque backing, so a bright plaque + dark
  // text is a strong pairing regardless of mode. The heading text has
  // no backing of its own - it sits directly against whatever's behind
  // it, which is the room wall - so its colors must follow the wall's
  // own light/dark flip (RoomsShell's `highContrast`), not the frame's
  // other trim colors, or the pairing inverts into low contrast.
  const plaqueColor = highContrast ? HIGH_CONTRAST_TRIM : isAward ? MUSEUM_GOLD_LIGHT : MUSEUM_GOLD;
  const plaqueTextColor = MUSEUM_CHARCOAL;
  const headingColor = highContrast ? "#000000" : trim;
  const headingOutline = highContrast ? "#FFFFFF" : MUSEUM_CHARCOAL;

  const plaqueLabel = "No. " + sheet.sheet_number + (sheet.heading ? "  —  " + sheet.heading : "");

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {isAward && (
        <>
          <mesh position={[0, 0, -0.02]} raycast={noRaycast}>
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
        <meshStandardMaterial color={FRAME_WOOD_COLOR} roughness={0.75} />
      </mesh>

      <mesh position={[0, 0, 0.015]}>
        <planeGeometry args={[FRAME_WIDTH - 0.18, FRAME_HEIGHT - 0.18]} />
        <meshStandardMaterial color={trim} roughness={0.4} metalness={0.25} />
      </mesh>

      <Suspense fallback={null}>
        <RoomFrameArtwork sheet={sheet} />
      </Suspense>

      {/* Vitrine glass hint - a faint tinted sheen over the image,
          evoking protective glass without a real glass shader's
          reflection cost. Skipped on mobile (`simplified`) - purely
          decorative, one fewer transparent draw call per sheet. */}
      {!simplified && (
        <mesh position={[0, 0, 0.035]} raycast={noRaycast}>
          <planeGeometry args={[FRAME_WIDTH - 0.3, FRAME_HEIGHT - 0.3]} />
          <meshStandardMaterial color={VITRINE_GLASS_COLOR} transparent opacity={0.06} depthWrite={false} />
        </mesh>
      )}

      {sheet.heading && (
        <Text
          position={[0, FRAME_HEIGHT / 2 + 0.14, 0.05]}
          font={PLAYFAIR_FONT}
          fontSize={0.19}
          letterSpacing={0.03}
          maxWidth={FRAME_WIDTH + 0.5}
          textAlign="center"
          color={headingColor}
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.005}
          outlineColor={headingOutline}
          raycast={noRaycast}
        >
          {sheet.heading.toUpperCase()}
        </Text>
      )}

      {/* Brass ID plaque - every sheet reads as deliberately catalogued
          before a visitor ever clicks to view it (Exhibit Design
          System) */}
      <group position={[0, -FRAME_HEIGHT / 2 - 0.22, 0.04]}>
        <mesh raycast={noRaycast}>
          <planeGeometry args={[PLAQUE_WIDTH, PLAQUE_HEIGHT]} />
          <meshStandardMaterial color={plaqueColor} roughness={0.35} metalness={0.35} />
        </mesh>
        <Text
          fontSize={0.11}
          maxWidth={PLAQUE_WIDTH - 0.2}
          textAlign="center"
          color={plaqueTextColor}
          anchorX="center"
          anchorY="middle"
          position={[0, 0, 0.005]}
          raycast={noRaycast}
        >
          {plaqueLabel}
        </Text>
      </group>

      {/* Curator's-note tell - a small wax-seal icon, only when this
          sheet actually carries one, echoing Dak's satchel clasp motif
          so attentive visitors learn to recognize it (Exhibit
          Interactions, section 9) */}
      {hasCuratorNote && (
        <mesh
          position={[FRAME_WIDTH / 2 - 0.28, -FRAME_HEIGHT / 2 + 0.28, 0.04]}
          rotation={[Math.PI / 2, 0, 0]}
          raycast={noRaycast}
        >
          <cylinderGeometry args={[0.09, 0.09, 0.03, 16]} />
          <meshStandardMaterial color={highContrast ? HIGH_CONTRAST_TRIM : WAX_SEAL_COLOR} roughness={0.5} />
        </mesh>
      )}
    </group>
  );
}

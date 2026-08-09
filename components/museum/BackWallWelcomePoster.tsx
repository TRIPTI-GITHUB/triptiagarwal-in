"use client";

import { Text } from "@react-three/drei";
import type { Profile } from "@/lib/supabase/database.types";
import { MUSEUM_GOLD, MUSEUM_TEAL, MUSEUM_TEAL_LIGHT, MUSEUM_OFFWHITE, HIGH_CONTRAST_TRIM } from "@/lib/museum/museumPalette";

const PLAYFAIR_FONT = "/fonts/PlayfairDisplay-Bold.ttf";
const POSTER_WIDTH = 4.4;
const POSTER_HEIGHT = 3.0;

interface BackWallWelcomePosterProps {
  position: [number, number, number];
  rotationY: number;
  profile: Profile | null;
  highContrast?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * BackWallWelcomePoster
 * A large lobby poster introducing the collector behind the museum -
 * a portrait badge (initials, since no avatar_url is set yet - will
 * automatically switch to a real photo once one is uploaded to
 * Supabase, same fallback pattern as the About page) alongside their
 * name, headline, and a short bio excerpt, pulled live from the
 * profiles table.
 */
export function BackWallWelcomePoster({
  position,
  rotationY,
  profile,
  highContrast,
}: BackWallWelcomePosterProps) {
  if (!profile) return null;

  const trim = highContrast ? HIGH_CONTRAST_TRIM : MUSEUM_GOLD;
  const panel = MUSEUM_TEAL;
  const body = highContrast ? "#FFFFFF" : MUSEUM_OFFWHITE;
  const badgeInner = MUSEUM_TEAL_LIGHT;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <planeGeometry args={[POSTER_WIDTH, POSTER_HEIGHT]} />
        <meshStandardMaterial color={trim} roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[POSTER_WIDTH - 0.14, POSTER_HEIGHT - 0.14]} />
        <meshStandardMaterial color={panel} />
      </mesh>

      <Text
        position={[0, POSTER_HEIGHT / 2 - 0.35, 0.02]}
        font={PLAYFAIR_FONT}
        fontSize={0.22}
        letterSpacing={0.06}
        color={trim}
        anchorX="center"
        anchorY="middle"
      >
        WELCOME TO THE WORLD OF PHILATELY
      </Text>

      <group position={[-POSTER_WIDTH / 2 + 0.9, -0.25, 0.02]}>
        <mesh>
          <circleGeometry args={[0.55, 32]} />
          <meshStandardMaterial color={trim} roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.005]}>
          <circleGeometry args={[0.5, 32]} />
          <meshStandardMaterial color={badgeInner} />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          font={PLAYFAIR_FONT}
          fontSize={0.32}
          color={body}
          anchorX="center"
          anchorY="middle"
        >
          {getInitials(profile.full_name)}
        </Text>
      </group>

      <group position={[0.55, -0.05, 0.02]}>
        <Text
          fontSize={0.2}
          maxWidth={2.5}
          color={body}
          anchorX="center"
          anchorY="middle"
          font={PLAYFAIR_FONT}
        >
          {profile.full_name}
        </Text>
        {profile.headline && (
          <Text
            position={[0, -0.28, 0]}
            fontSize={0.12}
            maxWidth={2.5}
            color={trim}
            anchorX="center"
            anchorY="middle"
          >
            {profile.headline}
          </Text>
        )}
      </group>

      {profile.bio && (
        <Text
          position={[0, -1.05, 0.02]}
          fontSize={0.11}
          lineHeight={1.5}
          maxWidth={POSTER_WIDTH - 0.9}
          textAlign="center"
          color={body}
          anchorX="center"
          anchorY="top"
        >
          {truncate(profile.bio, 220)}
        </Text>
      )}
    </group>
  );
}
"use client";

import { Text } from "@react-three/drei";
import { noRaycast } from "@/lib/museum/threeHelpers";
import {
  MUSEUM_GOLD,
  MUSEUM_TEAL,
  MUSEUM_TEAL_LIGHT,
  MUSEUM_OFFWHITE,
  HIGH_CONTRAST_TRIM,
} from "@/lib/museum/museumPalette";

const PLAYFAIR_FONT = "/fonts/PlayfairDisplay-Bold.ttf";

export type MuseumModeChoice = "quick" | "full" | "free";

interface ModeChoicePosterProps {
  position: [number, number, number];
  rotationY: number;
  hasFeaturedSheets: boolean;
  highContrast?: boolean;
  isTouch?: boolean;
}

interface OptionButtonProps {
  y: number;
  mode: MuseumModeChoice;
  icon: string;
  label: string;
  sublabel: string;
  disabled?: boolean;
  highContrast?: boolean;
  // Mobile emphasis (section 12): "Guided Tour becomes the encouraged
  // default on mobile" - `highlighted` adds a brighter gold ring and a
  // small "Recommended" tag to Quick Look/Full Tour, `muted` dims
  // Explore Freely slightly. A nudge, not a restriction - all three
  // options stay exactly as clickable as before.
  highlighted?: boolean;
  muted?: boolean;
}

function OptionButton({ y, mode, icon, label, sublabel, disabled, highContrast, highlighted, muted }: OptionButtonProps) {
  // Panels stay dark in both modes - see ModeChoicePoster's note on why
  // high contrast pushes trim/text to more saturated extremes instead
  // of inverting the panel to a pale background.
  const trim = highContrast ? HIGH_CONTRAST_TRIM : MUSEUM_GOLD;
  const panelColor = disabled ? "#3A4552" : muted ? "#2A4245" : MUSEUM_TEAL_LIGHT;
  const innerColor = disabled ? "#2C3440" : MUSEUM_TEAL;
  const textColor = disabled ? "#8A93A0" : muted ? "#C9BBA0" : trim;
  const sublabelColor = disabled ? "#8A93A0" : highContrast ? "#FFFFFF" : muted ? "#C9BBA0" : MUSEUM_OFFWHITE;

  return (
    <group position={[0, y, 0.02]}>
      {highlighted && (
        <mesh position={[0, 0, -0.008]} raycast={noRaycast}>
          <planeGeometry args={[2.76, 0.94]} />
          <meshStandardMaterial color={trim} roughness={0.35} metalness={0.3} />
        </mesh>
      )}
      <mesh userData={disabled ? undefined : { isModeOption: true, mode }}>
        <planeGeometry args={[2.6, 0.78]} />
        <meshStandardMaterial color={panelColor} />
      </mesh>
      <mesh position={[0, 0, 0.005]} userData={disabled ? undefined : { isModeOption: true, mode }}>
        <planeGeometry args={[2.48, 0.66]} />
        <meshStandardMaterial color={innerColor} />
      </mesh>
      {highlighted && (
        <Text
          position={[0, 0.31, 0.02]}
          fontSize={0.09}
          letterSpacing={0.1}
          color={trim}
          anchorX="center"
          anchorY="middle"
          raycast={noRaycast}
        >
          RECOMMENDED
        </Text>
      )}
      <Text
        position={[0, 0.16, 0.02]}
        font={PLAYFAIR_FONT}
        fontSize={0.19}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        raycast={noRaycast}
      >
        {icon + "  " + label}
      </Text>
      <Text
        position={[0, -0.16, 0.02]}
        fontSize={0.1}
        color={sublabelColor}
        anchorX="center"
        anchorY="middle"
        raycast={noRaycast}
      >
        {sublabel}
      </Text>
    </group>
  );
}

/**
 * ModeChoicePoster
 * A signboard offering three clickable options - Quick Look, Full Tour,
 * or Explore Freely (Design Doc section 5). Quick Look is grayed out and
 * unclickable when the exhibit has no `featured` sheets yet (the site
 * owner curates that flag directly in Supabase - nothing to select from
 * until she has). Text labels are visible but excluded from raycasting
 * (raycast={noRaycast}) so clicks always reach the tagged button panel
 * mesh underneath them, never getting silently absorbed by the text
 * itself.
 */
export function ModeChoicePoster({ position, rotationY, hasFeaturedSheets, highContrast, isTouch }: ModeChoicePosterProps) {
  const trim = highContrast ? HIGH_CONTRAST_TRIM : MUSEUM_GOLD;
  const panel = MUSEUM_TEAL;
  const heading = highContrast ? "#FFFFFF" : MUSEUM_OFFWHITE;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <planeGeometry args={[3.2, 3.6]} />
        <meshStandardMaterial color={trim} roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[3.08, 3.48]} />
        <meshStandardMaterial color={panel} />
      </mesh>

      <Text
        position={[0, 1.45, 0.02]}
        font={PLAYFAIR_FONT}
        fontSize={0.14}
        letterSpacing={0.12}
        color={trim}
        anchorX="center"
        anchorY="middle"
        raycast={noRaycast}
      >
        HOW WILL YOU VISIT
      </Text>
      <Text
        position={[0, 1.14, 0.02]}
        font={PLAYFAIR_FONT}
        fontSize={0.23}
        color={heading}
        anchorX="center"
        anchorY="middle"
        raycast={noRaycast}
      >
        Choose Your Journey
      </Text>

      <OptionButton
        y={0.5}
        mode="quick"
        icon="✦"
        label="Quick Look"
        sublabel={hasFeaturedSheets ? "The highlights, curated" : "Coming soon"}
        disabled={!hasFeaturedSheets}
        highContrast={highContrast}
        highlighted={isTouch && hasFeaturedSheets}
      />
      <OptionButton
        y={-0.4}
        mode="full"
        icon="🎫"
        label="Full Tour"
        sublabel="See every sheet, in order"
        highContrast={highContrast}
        highlighted={isTouch}
      />
      <OptionButton
        y={-1.3}
        mode="free"
        icon="🚶"
        label="Explore Freely"
        sublabel="Wander at your own pace"
        highContrast={highContrast}
        muted={isTouch}
      />
    </group>
  );
}

"use client";

import { Text } from "@react-three/drei";

const PLAYFAIR_FONT = "/fonts/PlayfairDisplay-Bold.ttf";

// Text objects should be visible but never intercept clicks - the
// actual clickable surface is the button panel mesh behind them.
// Returning null from raycast tells Three.js to skip this object
// entirely during ray intersection tests.
function noRaycast() {
  return null;
}

export type MuseumModeChoice = "quick" | "full" | "free";

interface ModeChoicePosterProps {
  position: [number, number, number];
  rotationY: number;
  hasFeaturedSheets: boolean;
}

interface OptionButtonProps {
  y: number;
  mode: MuseumModeChoice;
  icon: string;
  label: string;
  sublabel: string;
  disabled?: boolean;
}

function OptionButton({ y, mode, icon, label, sublabel, disabled }: OptionButtonProps) {
  const panelColor = disabled ? "#3A4552" : "#1E4A6B";
  const innerColor = disabled ? "#2C3440" : "#153A5B";
  const textColor = disabled ? "#8A93A0" : "#C9A227";

  return (
    <group position={[0, y, 0.02]}>
      <mesh userData={disabled ? undefined : { isModeOption: true, mode }}>
        <planeGeometry args={[2.6, 0.78]} />
        <meshStandardMaterial color={panelColor} />
      </mesh>
      <mesh position={[0, 0, 0.005]} userData={disabled ? undefined : { isModeOption: true, mode }}>
        <planeGeometry args={[2.48, 0.66]} />
        <meshStandardMaterial color={innerColor} />
      </mesh>
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
        color={disabled ? "#8A93A0" : "#FAF8F4"}
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
export function ModeChoicePoster({ position, rotationY, hasFeaturedSheets }: ModeChoicePosterProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <planeGeometry args={[3.2, 3.6]} />
        <meshStandardMaterial color="#C9A227" />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[3.08, 3.48]} />
        <meshStandardMaterial color="#153A5B" />
      </mesh>

      <Text
        position={[0, 1.45, 0.02]}
        font={PLAYFAIR_FONT}
        fontSize={0.14}
        letterSpacing={0.12}
        color="#C9A227"
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
        color="#FAF8F4"
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
      />
      <OptionButton
        y={-0.4}
        mode="full"
        icon="🎫"
        label="Full Tour"
        sublabel="See every sheet, in order"
      />
      <OptionButton
        y={-1.3}
        mode="free"
        icon="🚶"
        label="Explore Freely"
        sublabel="Wander at your own pace"
      />
    </group>
  );
}

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

interface ModeChoicePosterProps {
  position: [number, number, number];
  rotationY: number;
}

interface OptionButtonProps {
  y: number;
  mode: "tour" | "free";
  icon: string;
  label: string;
  sublabel: string;
}

function OptionButton({ y, mode, icon, label, sublabel }: OptionButtonProps) {
  return (
    <group position={[0, y, 0.02]}>
      <mesh userData={{ isModeOption: true, mode }}>
        <planeGeometry args={[2.6, 0.85]} />
        <meshStandardMaterial color="#1E4A6B" />
      </mesh>
      <mesh position={[0, 0, 0.005]} userData={{ isModeOption: true, mode }}>
        <planeGeometry args={[2.48, 0.73]} />
        <meshStandardMaterial color="#153A5B" />
      </mesh>
      <Text
        position={[0, 0.16, 0.02]}
        font={PLAYFAIR_FONT}
        fontSize={0.19}
        color="#C9A227"
        anchorX="center"
        anchorY="middle"
        raycast={noRaycast}
      >
        {icon + "  " + label}
      </Text>
      <Text
        position={[0, -0.16, 0.02]}
        fontSize={0.1}
        color="#FAF8F4"
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
 * A signboard offering two clickable options - Guided Tour or Explore
 * Freely. Text labels are visible but excluded from raycasting
 * (raycast={noRaycast}) so clicks always reach the tagged button
 * panel mesh underneath them, never getting silently absorbed by the
 * text itself.
 */
export function ModeChoicePoster({ position, rotationY }: ModeChoicePosterProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <planeGeometry args={[3.2, 3.4]} />
        <meshStandardMaterial color="#C9A227" />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[3.08, 3.28]} />
        <meshStandardMaterial color="#153A5B" />
      </mesh>

      <Text
        position={[0, 1.25, 0.02]}
        font={PLAYFAIR_FONT}
        fontSize={0.15}
        letterSpacing={0.12}
        color="#C9A227"
        anchorX="center"
        anchorY="middle"
        raycast={noRaycast}
      >
        HOW WILL YOU VISIT
      </Text>
      <Text
        position={[0, 0.92, 0.02]}
        font={PLAYFAIR_FONT}
        fontSize={0.26}
        color="#FAF8F4"
        anchorX="center"
        anchorY="middle"
        raycast={noRaycast}
      >
        Choose Your Journey
      </Text>

      <OptionButton
        y={0.15}
        mode="tour"
        icon="🎫"
        label="Guided Tour"
        sublabel="See every sheet, in order"
      />
      <OptionButton
        y={-0.85}
        mode="free"
        icon="🚶"
        label="Explore Freely"
        sublabel="Wander at your own pace"
      />
    </group>
  );
}
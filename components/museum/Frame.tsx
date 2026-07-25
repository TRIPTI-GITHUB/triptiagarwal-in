"use client";

import { Suspense } from "react";
import { useTexture } from "@react-three/drei";
import { FRAME_WIDTH, FRAME_HEIGHT } from "@/lib/museum/constants";

interface FrameArtworkProps {
  imageUrl: string;
}

function FrameArtwork({ imageUrl }: FrameArtworkProps) {
  const texture = useTexture(imageUrl);
  return (
    <mesh position={[0, 0, 0.02]}>
      <planeGeometry args={[FRAME_WIDTH - 0.15, FRAME_HEIGHT - 0.15]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

interface FrameProps {
  imageUrl: string;
  position: [number, number, number];
  rotationY: number;
}

/**
 * Frame
 * A single mounted exhibit sheet: a gold-toned backing panel plus the
 * sheet image itself. Wrapped in Suspense because useTexture "pauses"
 * rendering until the image finishes loading over the network - the
 * fallback keeps a plain gold panel visible in the meantime instead
 * of the whole scene breaking while images load.
 */
export function Frame({ imageUrl, position, rotationY }: FrameProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <planeGeometry args={[FRAME_WIDTH, FRAME_HEIGHT]} />
        <meshStandardMaterial color="#b08d57" />
      </mesh>
      <Suspense fallback={null}>
        <FrameArtwork imageUrl={imageUrl} />
      </Suspense>
    </group>
  );
}
"use client";

import { Text } from "@react-three/drei";
import { Frame } from "@/components/museum/Frame";
import {
  ROOM_WIDTH,
  SECTION_DEPTH,
  ROOM_HEIGHT,
  DOORWAY_WIDTH,
  WALL_THICKNESS,
} from "@/lib/museum/constants";
import {
  type MuseumSection,
  totalHallDepth,
  dividerZ,
  sectionCenterZ,
  getFramePlacements,
} from "@/lib/museum/layout";

interface GallerySectionsProps {
  sections: MuseumSection[];
}

/**
 * GallerySections
 * Renders the full gallery hall shell, one divider wall (with a
 * walkable doorway gap) between each pair of adjacent sections, and
 * every sheet mounted as a Frame on the correct wall - all derived
 * from the shared layout math in lib/museum/layout.ts, so the visuals
 * and the movement collision always agree with each other.
 */
export function GallerySections({ sections }: GallerySectionsProps) {
  const numSections = sections.length;
  const depth = totalHallDepth(numSections);
  const frontZ = SECTION_DEPTH / 2;
  const backZ = sectionCenterZ(numSections - 1) - SECTION_DEPTH / 2;
  const centerZ = (frontZ + backZ) / 2;

  const placements = getFramePlacements(sections);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, centerZ]}>
        <planeGeometry args={[ROOM_WIDTH, depth]} />
        <meshStandardMaterial color="#3a3226" />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, centerZ]}>
        <planeGeometry args={[ROOM_WIDTH, depth]} />
        <meshStandardMaterial color="#f5f0e6" />
      </mesh>

      <mesh position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, centerZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e2d5" />
      </mesh>
      <mesh position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, centerZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[depth, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e2d5" />
      </mesh>

      <mesh position={[0, ROOM_HEIGHT / 2, frontZ]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e2d5" />
      </mesh>

      <mesh position={[0, ROOM_HEIGHT / 2, backZ]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e2d5" />
      </mesh>

      {Array.from({ length: numSections - 1 }).map((_, i) => {
        const z = dividerZ(i);
        const segmentWidth = ROOM_WIDTH / 2 - DOORWAY_WIDTH / 2;

        return (
          <group key={i}>
            <mesh position={[-(DOORWAY_WIDTH / 2 + segmentWidth / 2), ROOM_HEIGHT / 2, z]}>
              <boxGeometry args={[segmentWidth, ROOM_HEIGHT, WALL_THICKNESS]} />
              <meshStandardMaterial color="#e8e2d5" />
            </mesh>
            <mesh position={[DOORWAY_WIDTH / 2 + segmentWidth / 2, ROOM_HEIGHT / 2, z]}>
              <boxGeometry args={[segmentWidth, ROOM_HEIGHT, WALL_THICKNESS]} />
              <meshStandardMaterial color="#e8e2d5" />
            </mesh>
          </group>
        );
      })}

      {sections.map((section, i) => (
        <Text
          key={section.title + i}
          position={[0, ROOM_HEIGHT - 0.6, sectionCenterZ(i) + SECTION_DEPTH / 2 - 0.4]}
          fontSize={0.3}
          color="#2D2D2D"
          anchorX="center"
          anchorY="middle"
        >
          {section.title}
        </Text>
      ))}

      {placements.map((p) => (
        <Frame
          key={p.sheet.id}
          imageUrl={p.sheet.image_url}
          position={[p.x, p.y, p.z]}
          rotationY={p.rotationY}
        />
      ))}
    </group>
  );
}
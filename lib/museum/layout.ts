import type { ExhibitSheet } from "@/lib/supabase/database.types";
import {
  ROOM_WIDTH,
  SECTION_DEPTH,
  DOORWAY_WIDTH,
  WALL_THICKNESS,
  WALL_MARGIN,
  FRAME_Y,
} from "@/lib/museum/constants";

export interface MuseumSection {
  title: string;
  sheets: ExhibitSheet[];
}

export interface Obstacle {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface FramePlacement {
  sheet: ExhibitSheet;
  x: number;
  y: number;
  z: number;
  rotationY: number;
}

/** Z coordinate of the center of a given section (0 = nearest the entrance). */
export function sectionCenterZ(index: number): number {
  return -index * SECTION_DEPTH;
}

/** Z coordinate of the divider wall between section i and section i + 1. */
export function dividerZ(index: number): number {
  return sectionCenterZ(index) - SECTION_DEPTH / 2;
}

/** Total depth (front wall to back wall) of the whole gallery hall. */
export function totalHallDepth(numSections: number): number {
  return numSections * SECTION_DEPTH;
}

/**
 * The outermost box a visitor can walk within - the hall's front,
 * back, left, and right walls.
 */
export function getOuterBounds(numSections: number) {
  return {
    minX: -ROOM_WIDTH / 2 + WALL_MARGIN,
    maxX: ROOM_WIDTH / 2 - WALL_MARGIN,
    maxZ: SECTION_DEPTH / 2 - WALL_MARGIN,
    minZ: sectionCenterZ(numSections - 1) - SECTION_DEPTH / 2 + WALL_MARGIN,
  };
}

/**
 * Solid collision rectangles for every divider wall's two side
 * segments. The doorway gap between them is deliberately left out of
 * this list, so it stays walkable.
 */
export function getDividerObstacles(numSections: number): Obstacle[] {
  const obstacles: Obstacle[] = [];

  for (let i = 0; i < numSections - 1; i++) {
    const z = dividerZ(i);
    const zMin = z - WALL_THICKNESS / 2 - WALL_MARGIN;
    const zMax = z + WALL_THICKNESS / 2 + WALL_MARGIN;

    obstacles.push({
      minX: -ROOM_WIDTH / 2,
      maxX: -DOORWAY_WIDTH / 2,
      minZ: zMin,
      maxZ: zMax,
    });

    obstacles.push({
      minX: DOORWAY_WIDTH / 2,
      maxX: ROOM_WIDTH / 2,
      minZ: zMin,
      maxZ: zMax,
    });
  }

  return obstacles;
}

/**
 * Where each sheet's frame should be mounted: split evenly between the
 * section's left and right walls, spaced out along the section's depth.
 */
export function getFramePlacements(sections: MuseumSection[]): FramePlacement[] {
  const placements: FramePlacement[] = [];

  sections.forEach((section, sectionIndex) => {
    const centerZ = sectionCenterZ(sectionIndex);
    const sheets = section.sheets;

    const leftSheets = sheets.filter((_, i) => i % 2 === 0);
    const rightSheets = sheets.filter((_, i) => i % 2 === 1);

    const usableDepth = SECTION_DEPTH - 2;

    function placeAlongWall(
      wallSheets: ExhibitSheet[],
      x: number,
      rotationY: number
    ) {
      wallSheets.forEach((sheet, i) => {
        const spacing =
          wallSheets.length > 1 ? usableDepth / (wallSheets.length - 1) : 0;
        const z =
          wallSheets.length > 1
            ? centerZ + usableDepth / 2 - i * spacing
            : centerZ;

        placements.push({ sheet, x, y: FRAME_Y, z, rotationY });
      });
    }

    // Left wall frames face +X (into the room); right wall frames face -X.
    placeAlongWall(leftSheets, -ROOM_WIDTH / 2 + 0.05, Math.PI / 2);
    placeAlongWall(rightSheets, ROOM_WIDTH / 2 - 0.05, -Math.PI / 2);
  });

  return placements;
}
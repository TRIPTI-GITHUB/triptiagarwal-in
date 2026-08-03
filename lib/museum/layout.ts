import type { ExhibitSheet } from "@/lib/supabase/database.types";
import { ROOM_SIZE, DOOR_WIDTH, FRAME_Y, WALL_MARGIN } from "@/lib/museum/roomConstants";

const DOORWAY_HALF = DOOR_WIDTH / 2;
export interface MuseumRoom {
  title: string;
  sheets: ExhibitSheet[];
}

export interface FramePlacement {
  sheet: ExhibitSheet;
  x: number;
  y: number;
  z: number;
  rotationY: number;
}

/** Z coordinate of the center of a given room (0 = first room, entrance side). */
export function roomCenterZ(roomIndex: number): number {
  return -roomIndex * ROOM_SIZE;
}

/** Z of a room's entry wall (the wall nearer the entrance / previous room). */
export function entryWallZ(roomIndex: number): number {
  return roomCenterZ(roomIndex) + ROOM_SIZE / 2;
}

/** Z of a room's exit wall (the wall leading to the next room, or the far end). */
export function exitWallZ(roomIndex: number): number {
  return roomCenterZ(roomIndex) - ROOM_SIZE / 2;
}

/** Total length of the whole hall, given how many rooms it has. */
export function totalHallLength(numRooms: number): number {
  return numRooms * ROOM_SIZE;
}

/**
 * getFramePlacements
 * Places up to 8 sheets per room: 2 on the entry wall (flanking the
 * doorway), 2 on the left wall, 2 on the exit wall (flanking its
 * doorway), 2 on the right wall - walked clockwise starting at the
 * entry wall, matching the approved floor plan.
 */
export function getFramePlacements(rooms: MuseumRoom[]): FramePlacement[] {
  const placements: FramePlacement[] = [];
  const half = ROOM_SIZE / 2;
  const flank = DOOR_WIDTH / 2 + 0.9;

  rooms.forEach((room, roomIndex) => {
    const centerZ = roomCenterZ(roomIndex);
    const eZ = entryWallZ(roomIndex);
    const xZ = exitWallZ(roomIndex);
    const sheets = room.sheets;

    const slots: Omit<FramePlacement, "sheet">[] = [
      // Entry wall (facing into the room, -Z direction)
      { x: -flank, y: FRAME_Y, z: eZ - 0.05, rotationY: Math.PI },
      { x: flank, y: FRAME_Y, z: eZ - 0.05, rotationY: Math.PI },
      // Left wall (facing into the room, +X direction)
      { x: -half + 0.05, y: FRAME_Y, z: centerZ + 1.6, rotationY: Math.PI / 2 },
      { x: -half + 0.05, y: FRAME_Y, z: centerZ - 1.6, rotationY: Math.PI / 2 },
      // Exit wall (facing into the room, +Z direction)
      { x: -flank, y: FRAME_Y, z: xZ + 0.05, rotationY: 0 },
      { x: flank, y: FRAME_Y, z: xZ + 0.05, rotationY: 0 },
      // Right wall (facing into the room, -X direction)
      { x: half - 0.05, y: FRAME_Y, z: centerZ - 1.6, rotationY: -Math.PI / 2 },
      { x: half - 0.05, y: FRAME_Y, z: centerZ + 1.6, rotationY: -Math.PI / 2 },
    ];

    sheets.slice(0, 8).forEach((sheet, i) => {
      const slot = slots[i];
      if (slot) placements.push({ sheet, ...slot });
    });
  });

  return placements;
}

export interface Obstacle {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/**
 * getOuterBounds
 * The full hall's outer boundary - front of Room 1 to the back of the
 * last room, and the left/right side walls (continuous for the whole
 * hall's length).
 */
export function getOuterBounds(numRooms: number) {
  const half = ROOM_SIZE / 2;
  return {
    minX: -half + WALL_MARGIN,
    maxX: half - WALL_MARGIN,
    maxZ: entryWallZ(0) - WALL_MARGIN,
    minZ: exitWallZ(numRooms - 1) + WALL_MARGIN,
  };
}

/**
 * getDoorwayObstacles
 * Solid collision rectangles for the two wall segments flanking each
 * doorway (the entry wall of every room, plus the final room's exit
 * wall) - the doorway gap itself is deliberately excluded, so it
 * stays walkable.
 */
export function getDoorwayObstacles(numRooms: number): Obstacle[] {
  const half = ROOM_SIZE / 2;
  const thickness = 0.3;
  const obstacles: Obstacle[] = [];

  const wallZPositions: number[] = [];
  for (let i = 0; i < numRooms; i++) {
    wallZPositions.push(entryWallZ(i));
  }
  wallZPositions.push(exitWallZ(numRooms - 1));

  for (const z of wallZPositions) {
    const zMin = z - thickness / 2 - WALL_MARGIN;
    const zMax = z + thickness / 2 + WALL_MARGIN;

    obstacles.push({ minX: -half, maxX: -DOORWAY_HALF, minZ: zMin, maxZ: zMax });
    obstacles.push({ minX: DOORWAY_HALF, maxX: half, minZ: zMin, maxZ: zMax });
  }

  return obstacles;
}



/**
 * groupIntoRooms
 * Groups sheets by section_title (e.g. "Frame 1") into MuseumRoom
 * objects, one room per section. Sheets with no section_title fall
 * into a single default "Gallery" room, so simpler unsectioned
 * exhibits still work as one room with no forced complexity.
 */
export function groupIntoRooms(sheets: ExhibitSheet[]): MuseumRoom[] {
  const map = new Map<string, ExhibitSheet[]>();

  for (const sheet of sheets) {
    const key =
      sheet.section_title && sheet.section_title.trim() !== ""
        ? sheet.section_title
        : "Gallery";

    const existing = map.get(key);
    if (existing) {
      existing.push(sheet);
    } else {
      map.set(key, [sheet]);
    }
  }

  return Array.from(map.entries()).map(([title, roomSheets]) => ({
    title,
    sheets: roomSheets,
  }));
}
import type { ExhibitSheet } from "@/lib/supabase/database.types";
import { ROOM_SIZE, DOOR_WIDTH, FRAME_Y, FRAME_WIDTH, WALL_MARGIN, EYE_HEIGHT, FOYER_DEPTH, FURNITURE_MARGIN } from "@/lib/museum/roomConstants";
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

/** Z of the outer edge of the entrance foyer, in front of Room 1's doorway. */
export function foyerFrontZ(): number {
  return entryWallZ(0) + FOYER_DEPTH;
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
  const frameHalf = FRAME_WIDTH / 2;
  const flank = DOOR_WIDTH / 2 + frameHalf + 0.3;
  const sideOffset = frameHalf + 0.5;

  rooms.forEach((room, roomIndex) => {
    const centerZ = roomCenterZ(roomIndex);
    const eZ = entryWallZ(roomIndex);
    const xZ = exitWallZ(roomIndex);
    const sheets = room.sheets;

    const slots: Omit<FramePlacement, "sheet">[] = [
      { x: -flank, y: FRAME_Y, z: eZ - 0.05, rotationY: Math.PI },
      { x: flank, y: FRAME_Y, z: eZ - 0.05, rotationY: Math.PI },
      { x: -half + 0.05, y: FRAME_Y, z: centerZ + sideOffset, rotationY: Math.PI / 2 },
      { x: -half + 0.05, y: FRAME_Y, z: centerZ - sideOffset, rotationY: Math.PI / 2 },
      { x: -flank, y: FRAME_Y, z: xZ + 0.05, rotationY: 0 },
      { x: flank, y: FRAME_Y, z: xZ + 0.05, rotationY: 0 },
      { x: half - 0.05, y: FRAME_Y, z: centerZ - sideOffset, rotationY: -Math.PI / 2 },
      { x: half - 0.05, y: FRAME_Y, z: centerZ + sideOffset, rotationY: -Math.PI / 2 },
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
    maxZ: foyerFrontZ() - WALL_MARGIN,
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

// Lobby furniture placement - single source of truth shared by RoomsShell
// (rendering) and getLobbyFurnitureObstacles (collision), so the two can
// never drift apart. Benches face into the hall (toward the Room 1
// doorway) rather than each other, and the side table sits beside the
// right-hand bench, clear of the x=0 sightline down the entry corridor -
// per the Lobby Design sightline guidance.
const LOBBY_SEATING_Z = entryWallZ(0) + 6.25;
const LOBBY_RECEPTION_Z = foyerFrontZ() - 2.2;

export const LOBBY_BENCH_LEFT: [number, number, number] = [-3.2, 0, LOBBY_SEATING_Z];
export const LOBBY_BENCH_RIGHT: [number, number, number] = [3.2, 0, LOBBY_SEATING_Z];
export const LOBBY_TABLE: [number, number, number] = [4.7, 0, LOBBY_SEATING_Z];
export const LOBBY_RECEPTION: [number, number, number] = [-3.5, 0, LOBBY_RECEPTION_Z];

// Half-extents (world units) matching each prop's built geometry, with
// rotation already accounted for. Kept here rather than in the prop
// components since only the collision layer needs them.
const BENCH_HALF_X = 0.85;
const BENCH_HALF_Z = 0.275;
const TABLE_HALF = 0.36;
// ReceptionCounter's L-shaped desk + overhanging top isn't centered on
// its anchor position - these offsets are the counter's actual bounding
// box (in its rotationY=Math.PI orientation) relative to that anchor.
const RECEPTION_OFFSET = { minX: -1.2, maxX: 1.8, minZ: -0.8, maxZ: 0.6 };

/**
 * getLobbyFurnitureObstacles
 * Solid collision rectangles for the lobby benches, side table, and
 * reception counter - a visitor can walk up to and around each piece
 * but never through it, per the "collision is core to believability"
 * requirement.
 */
export function getLobbyFurnitureObstacles(): Obstacle[] {
  const m = FURNITURE_MARGIN;
  const obstacles: Obstacle[] = [];

  for (const [x, , z] of [LOBBY_BENCH_LEFT, LOBBY_BENCH_RIGHT]) {
    obstacles.push({
      minX: x - BENCH_HALF_X - m,
      maxX: x + BENCH_HALF_X + m,
      minZ: z - BENCH_HALF_Z - m,
      maxZ: z + BENCH_HALF_Z + m,
    });
  }

  const [tableX, , tableZ] = LOBBY_TABLE;
  obstacles.push({
    minX: tableX - TABLE_HALF - m,
    maxX: tableX + TABLE_HALF + m,
    minZ: tableZ - TABLE_HALF - m,
    maxZ: tableZ + TABLE_HALF + m,
  });

  const [receptionX, , receptionZ] = LOBBY_RECEPTION;
  obstacles.push({
    minX: receptionX + RECEPTION_OFFSET.minX - m,
    maxX: receptionX + RECEPTION_OFFSET.maxX + m,
    minZ: receptionZ + RECEPTION_OFFSET.minZ - m,
    maxZ: receptionZ + RECEPTION_OFFSET.maxZ + m,
  });

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

export type TourScope = "quick" | "full";

export interface TourStop {
  type: "entrance" | "doorway" | "sheet";
  position: [number, number, number];
  lookAt: [number, number, number];
  sheet?: ExhibitSheet;
}

export interface TourPath {
  stops: TourStop[];
  // navigableIndices[0] = the entrance's position within `stops`.
  // navigableIndices[i + 1] = sheet i's position within `stops`.
  navigableIndices: number[];
}

const TOUR_STANDOFF = 4.0; // how far into the room a viewer stands back from a mounted sheet

/**
 * buildTourPath
 * Builds the full ordered walking path for guided tour mode: a viewing
 * spot in front of every sheet (derived from its wall-mount position and
 * facing angle, moved inward toward room center), plus a hidden waypoint
 * centered in every doorway between rooms. Dak (DakCompanion, `guiding`
 * mode) walks through every stop in sequence, so a straight-line
 * shortcut through a wall never happens - the doorway stops guarantee
 * the path always threads through the actual gaps.
 *
 * `scope` controls which sheets are *navigable* (stops Dak actually
 * pauses at and the visitor can jump to via Prev/Next) without changing
 * where anything is positioned: 'full' includes every sheet; 'quick'
 * includes only sheets flagged `featured`. Every sheet still gets a
 * `stops` entry either way - Dak just passes by the un-navigable ones on
 * his way to the next featured one, rather than skipping the room
 * entirely (which would cut through walls the doorway waypoints exist to
 * avoid).
 */
export function buildTourPath(rooms: MuseumRoom[], scope: TourScope): TourPath {
  const placements = getFramePlacements(rooms);
  const stops: TourStop[] = [];
  const navigableIndices: number[] = [];

  stops.push({
    type: "entrance",
    position: [0, EYE_HEIGHT, entryWallZ(0) + TOUR_STANDOFF],
    lookAt: [0, EYE_HEIGHT, roomCenterZ(0)],
  });
  navigableIndices.push(stops.length - 1);

  let placementIndex = 0;
  rooms.forEach((room, roomIndex) => {
    if (roomIndex > 0) {
      // Doorway waypoint transitioning from the previous room into this
      // one - not navigable, purely a walk-through point.
      stops.push({
        type: "doorway",
        position: [0, EYE_HEIGHT, entryWallZ(roomIndex)],
        lookAt: [0, EYE_HEIGHT, roomCenterZ(roomIndex)],
      });
    }

    const count = Math.min(room.sheets.length, 8);
    for (let i = 0; i < count; i++) {
      const p = placements[placementIndex];
      placementIndex++;
      if (!p) continue;

      const normalX = Math.sin(p.rotationY);
      const normalZ = Math.cos(p.rotationY);

      stops.push({
        type: "sheet",
        sheet: p.sheet,
        position: [p.x + normalX * TOUR_STANDOFF, EYE_HEIGHT, p.z + normalZ * TOUR_STANDOFF],
        lookAt: [p.x, FRAME_Y, p.z],
      });

      if (scope === "full" || p.sheet.featured) {
        navigableIndices.push(stops.length - 1);
      }
    }
  });

  return { stops, navigableIndices };
}

/**
 * findNearestNavIndex
 * For "continue as guided tour from here" (section 6): given the
 * visitor's current x/z, finds the closest navigable stop and returns it
 * as a `navIndex` (-1 = entrance, matching the convention every other
 * nav-index consumer already uses) rather than a raw `stops` array
 * index, so callers can feed it straight into the same state that
 * Prev/Next already drive.
 */
export function findNearestNavIndex(tourPath: TourPath, x: number, z: number): number {
  let bestNavIndex = -1;
  let bestDistSq = Infinity;

  tourPath.navigableIndices.forEach((stopIndex, i) => {
    const stop = tourPath.stops[stopIndex];
    const dx = stop.position[0] - x;
    const dz = stop.position[2] - z;
    const distSq = dx * dx + dz * dz;
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      bestNavIndex = i - 1;
    }
  });

  return bestNavIndex;
}

/**
 * buildSheetLabels
 * Maps each sheet's id to a human-readable "Sheet X of Y - RoomTitle"
 * label, where X/Y are the sheet's position WITHIN its room (1-8),
 * not its global sheet_number (1-24) - avoids the confusing "Sheet 9
 * of Frame 2" that global numbering would otherwise produce.
 */
export function buildSheetLabels(rooms: MuseumRoom[]): Map<string, string> {
  const labels = new Map<string, string>();

  rooms.forEach((room) => {
    const total = room.sheets.length;
    room.sheets.forEach((sheet, i) => {
      labels.set(sheet.id, "Sheet " + (i + 1) + " of " + total + " - " + room.title);
    });
  });

  return labels;
}
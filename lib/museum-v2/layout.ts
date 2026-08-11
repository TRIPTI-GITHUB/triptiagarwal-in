/**
 * museum-v2 spatial system (parallel to lib/museum/layout.ts).
 *
 * The v1 layout module hardcodes one straight chain of square rooms
 * (roomCenterZ/entryWallZ/getFramePlacements etc. all assume that
 * shape) - it has no concept of a lobby hub with arches on different
 * walls, or a single zigzagging hall. This module is a genuinely new,
 * parallel spatial system for that shape; it does not import or modify
 * anything from lib/museum/layout.ts (only reuses its TourStop/TourPath
 * *type* shapes, so the existing, generic display components -
 * TourControls, TourArrowNav, TeleportMenu - work unmodified here too).
 *
 * Floor plan (world units, wing 0):
 *   - A ~20x20 reception lobby centered on the origin. Visitor spawns
 *     near its south wall, facing north.
 *   - North wall: Entry arch(es), one per published exhibit ("wing").
 *   - West wall: the photo wall (up to 4 frames).
 *   - Each wing's hall is a 3-leg zigzag (north, then east, then south)
 *     mounting 8 sheets per leg (one exhibit "Frame N" section per
 *     leg) - the two turns double as the "subtle architectural break"
 *     the layout brief asked for, and the corridor arrives back at the
 *     lobby's north-east corner - a different spot from the entry - via
 *     a short open connector, where the Exit arch sits.
 *   - Additional wings get their own entry X (stepped west along the
 *     north wall) and their own Z-band for the zigzag (stepped further
 *     out), so they don't spatially overlap wing 0 - this spacing is
 *     reasoned through, not exhaustively tested past N=1 (there is
 *     only one exhibit besides Freedom Struggle today).
 */
import type { ExhibitSheet } from "@/lib/supabase/database.types";
import { EYE_HEIGHT, FRAME_Y, FRAME_WIDTH, FRAME_HEIGHT, DOOR_WIDTH, DOOR_HEIGHT, ROOM_HEIGHT } from "@/lib/museum/roomConstants";
import type { TourStop, TourPath, TourScope } from "@/lib/museum/layout";

export { EYE_HEIGHT, FRAME_Y, FRAME_WIDTH, FRAME_HEIGHT, DOOR_WIDTH, DOOR_HEIGHT, ROOM_HEIGHT };

// --- Lobby ---
export const LOBBY_WIDTH = 20; // x: -10..10
export const LOBBY_DEPTH = 20; // z: -10..10
export const LOBBY_HALF_W = LOBBY_WIDTH / 2;
export const LOBBY_HALF_D = LOBBY_DEPTH / 2;

// --- Wing hall ---
export const HALL_WIDTH = 5;
export const HALL_HALF = HALL_WIDTH / 2;
export const BAY_LENGTH = 24; // one leg's travel-axis length (holds one 8-sheet exhibit section)
export const SHEETS_PER_LEG = 8;
export const WING_X_STEP = -(HALL_WIDTH + 5); // successive wings' entry arches step west
export const WING_Z_STEP = -(HALL_WIDTH + 5); // successive wings' zigzag bands step further out

export interface MuseumV2Wing {
  index: number;
  title: string;
  sheets: ExhibitSheet[];
}

export interface WingLeg {
  axis: "x" | "z"; // which axis the leg runs along
  fixed: number; // the corridor centerline's coordinate on the OTHER axis
  from: number; // start coordinate along `axis`
  to: number; // end coordinate along `axis`
}

/** Entry arch position (north wall) for a given wing index. */
export function entryArchPosition(wingIndex: number): [number, number, number] {
  return [wingIndex * WING_X_STEP, 0, -LOBBY_HALF_D];
}

function legZBand(wingIndex: number): number {
  return -LOBBY_HALF_D - BAY_LENGTH + wingIndex * WING_Z_STEP;
}

/** The wing's 3-leg zigzag path (north, east, south), in mount order. */
export function wingLegs(wingIndex: number): WingLeg[] {
  const entryX = wingIndex * WING_X_STEP;
  const zBand = legZBand(wingIndex);
  const eastX = entryX + BAY_LENGTH;
  return [
    { axis: "z", fixed: entryX, from: -LOBBY_HALF_D, to: zBand }, // Leg A: north
    { axis: "x", fixed: zBand, from: entryX, to: eastX }, // Leg B: east
    { axis: "z", fixed: eastX, from: zBand, to: -LOBBY_HALF_D }, // Leg C: south, back toward the lobby
  ];
}

/** Exit arch position - wherever the third leg (heading back south) ends. */
export function exitArchPosition(wingIndex: number): [number, number, number] {
  const legs = wingLegs(wingIndex);
  const legC = legs[2];
  return [legC.fixed, 0, -LOBBY_HALF_D];
}

export interface WingFramePlacement {
  sheet: ExhibitSheet;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  legIndex: number;
}

const LEG_MARGIN = 3;

/**
 * getWingFramePlacements
 * Places up to SHEETS_PER_LEG sheets per leg, split evenly across both
 * of the leg's side walls, spaced along its length. A sheet mounted on
 * the lower-coordinate wall always faces the positive direction on
 * that axis (into the corridor); the higher-coordinate wall's sheets
 * face the negative direction - true regardless of whether the leg
 * runs along x or z, so one rule covers all three legs.
 */
export function getWingFramePlacements(wing: MuseumV2Wing): WingFramePlacement[] {
  const legs = wingLegs(wing.index);
  const placements: WingFramePlacement[] = [];
  let sheetIndex = 0;

  legs.forEach((leg, legIndex) => {
    const legSheets = wing.sheets.slice(sheetIndex, sheetIndex + SHEETS_PER_LEG);
    sheetIndex += legSheets.length;
    if (legSheets.length === 0) return;

    const perSide = Math.ceil(legSheets.length / 2);
    const travelStart = Math.min(leg.from, leg.to) + LEG_MARGIN;
    const travelLength = Math.abs(leg.to - leg.from) - LEG_MARGIN * 2;

    legSheets.forEach((sheet, i) => {
      const side = i % 2; // 0 = lower-coordinate wall, 1 = higher-coordinate wall
      const slot = Math.floor(i / 2);
      const along = travelStart + ((slot + 0.5) / perSide) * travelLength;
      const wallOffset = side === 0 ? -HALL_HALF + 0.05 : HALL_HALF - 0.05;

      // axis === "z": the leg runs along z, walls are at x = fixed +/- HALL_HALF,
      // facing +/-X. axis === "x": the roles swap - walls are at z = fixed +/-
      // HALL_HALF, facing +/-Z.
      const x = leg.axis === "z" ? leg.fixed + wallOffset : along;
      const z = leg.axis === "z" ? along : leg.fixed + wallOffset;
      const rotationY =
        leg.axis === "z" ? (side === 0 ? Math.PI / 2 : -Math.PI / 2) : side === 0 ? 0 : Math.PI;

      placements.push({ sheet, x, y: FRAME_Y, z, rotationY, legIndex });
    });
  });

  return placements;
}

// --- Lobby spawn ---
export function lobbySpawnPosition(): [number, number, number] {
  return [0, EYE_HEIGHT, LOBBY_HALF_D - 2];
}
export function lobbySpawnLookAt(): [number, number, number] {
  return [0, EYE_HEIGHT, -LOBBY_HALF_D];
}

// --- Photo wall (west wall) ---
export function photoWallSlotPosition(slotIndex: number): [number, number, number] {
  const zs = [-6, -2, 2, 6];
  return [-LOBBY_HALF_W + 0.05, 1.8, zs[slotIndex] ?? 0];
}

// --- Collision: walkable area is the union of these rectangles ---
export interface WalkRect {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export function getLobbyWalkRect(): WalkRect {
  return { minX: -LOBBY_HALF_W + 0.4, maxX: LOBBY_HALF_W - 0.4, minZ: -LOBBY_HALF_D + 0.4, maxZ: LOBBY_HALF_D - 0.4 };
}

/**
 * connectorWalkRect
 * Leg C (the third, southbound leg) ends at the exit arch, which sits
 * well outside the lobby's own x-range (e.g. x=24 vs. the lobby's
 * maxX=10) - without a bridging rectangle here, the walkable-area union
 * would have a gap between "the wing hall" and "the lobby," even though
 * both individually reach z=-10. This connector spans that gap, and is
 * also what LobbyHubShell/WingHallShell render as the short open floor
 * a visitor crosses right after stepping through the exit arch.
 */
export function connectorWalkRect(wingIndex: number): WalkRect {
  const exit = exitArchPosition(wingIndex);
  return {
    minX: LOBBY_HALF_W - 1,
    maxX: exit[0] + HALL_HALF,
    minZ: exit[2] - HALL_HALF,
    maxZ: exit[2] + HALL_HALF,
  };
}

export function getWingWalkRects(wingIndex: number): WalkRect[] {
  const legs = wingLegs(wingIndex);
  const legRects = legs.map((leg): WalkRect => {
    if (leg.axis === "z") {
      return {
        minX: leg.fixed - HALL_HALF + 0.3,
        maxX: leg.fixed + HALL_HALF - 0.3,
        minZ: Math.min(leg.from, leg.to) - 0.5,
        maxZ: Math.max(leg.from, leg.to) + 0.5,
      };
    }
    return {
      minX: Math.min(leg.from, leg.to) - 0.5,
      maxX: Math.max(leg.from, leg.to) + 0.5,
      minZ: leg.fixed - HALL_HALF + 0.3,
      maxZ: leg.fixed + HALL_HALF - 0.3,
    };
  });
  return [...legRects, connectorWalkRect(wingIndex)];
}

export function getAllWalkRects(numWings: number): WalkRect[] {
  const rects = [getLobbyWalkRect()];
  for (let i = 0; i < numWings; i++) rects.push(...getWingWalkRects(i));
  return rects;
}

// --- Tour path / points of interest / teleport (mirrors v1's TourStop/TourPath shape) ---
const TOUR_STANDOFF = 4.0;

export function buildWingTourPath(wings: MuseumV2Wing[], scope: TourScope): TourPath {
  const stops: TourStop[] = [];
  const navigableIndices: number[] = [];

  stops.push({
    type: "entrance",
    position: lobbySpawnPosition(),
    lookAt: [0, EYE_HEIGHT, -LOBBY_HALF_D],
  });
  navigableIndices.push(stops.length - 1);

  wings.forEach((wing) => {
    const entry = entryArchPosition(wing.index);
    stops.push({
      type: "doorway",
      position: [entry[0], EYE_HEIGHT, entry[2] - 1.5],
      lookAt: [entry[0], EYE_HEIGHT, entry[2] - 6],
      roomTitle: wing.title,
    });

    const placements = getWingFramePlacements(wing);
    placements.forEach((p) => {
      const normalX = Math.sin(p.rotationY);
      const normalZ = Math.cos(p.rotationY);
      stops.push({
        type: "sheet",
        sheet: p.sheet,
        position: [p.x + normalX * TOUR_STANDOFF, EYE_HEIGHT, p.z + normalZ * TOUR_STANDOFF],
        lookAt: [p.x, FRAME_Y, p.z],
        rotationY: p.rotationY,
      });
      if (scope === "full" || p.sheet.featured) {
        navigableIndices.push(stops.length - 1);
      }
    });
  });

  return { stops, navigableIndices };
}

export function buildWingSheetLabels(wings: MuseumV2Wing[]): Map<string, string> {
  const labels = new Map<string, string>();
  wings.forEach((wing) => {
    const total = wing.sheets.length;
    wing.sheets.forEach((sheet, i) => {
      labels.set(sheet.id, "Sheet " + (i + 1) + " of " + total + " - " + wing.title);
    });
  });
  return labels;
}

export function buildWingPointsOfInterest(wings: MuseumV2Wing[]): TourStop[] {
  return buildWingTourPath(wings, "full").stops.filter((stop) => stop.type !== "entrance");
}

export function findNearestWingNavIndex(tourPath: TourPath, x: number, z: number): number {
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

export function describeWingPoint(stop: TourStop, sheetLabels: Map<string, string>): string {
  if (stop.type === "sheet" && stop.sheet) {
    const label = sheetLabels.get(stop.sheet.id) ?? "Exhibit sheet";
    return stop.sheet.heading ? label + ": " + stop.sheet.heading : label;
  }
  if (stop.type === "doorway") {
    return stop.roomTitle ? "Entry arch: " + stop.roomTitle : "Entry arch";
  }
  return "Point of interest";
}

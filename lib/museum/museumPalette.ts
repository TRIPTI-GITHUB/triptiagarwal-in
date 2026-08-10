/**
 * museumPalette
 * Single source of truth for the 3D museum's materials - reconciled
 * onto the site's brand-* CSS tokens (globals.css: brand-cream,
 * brand-charcoal, brand-gold, brand-teal) rather than DesignSystem.md's
 * literal, more saturated numbers (Heritage Blue #153A5B, Antique Gold
 * #C9A227) that every 3D component previously hardcoded independently.
 * The DOM overlay chrome (ExhibitModal, SettingsDrawer, etc.) already
 * uses brand-gold/brand-charcoal/brand-teal/brand-cream, so the 3D
 * scene's materials now match it instead of quietly diverging -
 * DesignSystem.md's original hues remain the mood reference, not a
 * second live spec.
 *
 * "The Reliquary Hall" direction: a warmer, dimmer archive rather than
 * the previous pale, evenly-lit showroom - architecture/material
 * constants below (walls, floor, wood, stone) support that mood and
 * are not brand tokens themselves.
 */

// --- Brand anchor (matches globals.css's --color-brand-*) ---
export const MUSEUM_GOLD = "#B08D57"; // brand-gold
export const MUSEUM_GOLD_LIGHT = "#C9A876"; // lighter accent variant (buttons, foil)
export const MUSEUM_TEAL = "#234E52"; // brand-teal (also absorbs the old "forest green" role)
export const MUSEUM_TEAL_LIGHT = "#2C6066"; // lighter teal accent (badges, enabled buttons)
export const MUSEUM_CHARCOAL = "#2D2D2D"; // brand-charcoal
export const MUSEUM_CREAM = "#FAF7F2"; // brand-cream / parchment
export const MUSEUM_OFFWHITE = "#F2EDE3"; // text-on-dark - never pure white, reads "archive" not "UI"

// --- Architecture / staging materials (not brand tokens) ---
export const WALL_COLOR = "#2E2924";
export const CEILING_COLOR = "#453E33";
export const FLOOR_COLOR = "#2A2118";
export const BASEBOARD_COLOR = "#1C1712";
export const MOULDING_COLOR = MUSEUM_GOLD;
export const MAT_COLOR = "#6E2424";
export const PILLAR_COLOR = "#C9BBA0"; // aged limestone
export const FRAME_WOOD_COLOR = "#4A3018"; // dark walnut
export const VITRINE_GLASS_COLOR = MUSEUM_TEAL;
export const AWARD_GLOW_COLOR = "#F0C75E"; // kept distinct from brand gold, deliberately
export const WAX_SEAL_COLOR = "#6E2424"; // curator's-note tell, echoes the mat/rug red

// --- High-contrast overrides (section 13 extension) ---
// A flatter, brighter, more neutral preset used in place of the mood
// values above whenever the visitor has high contrast enabled - see
// getRoomLightMood below and RoomsShell/RoomFrame's `highContrast` prop.
export const HIGH_CONTRAST_WALL_COLOR = "#EAF1F8";
export const HIGH_CONTRAST_CEILING_COLOR = "#FBFDFF";
export const HIGH_CONTRAST_FLOOR_COLOR = "#4A5568";
export const HIGH_CONTRAST_TEXT_ON_DARK = "#FFFFFF";
export const HIGH_CONTRAST_TRIM = "#FFD966";

/**
 * getRoomLightMood
 * Deepening warmth/dimness the further into the hall a room sits -
 * evokes progression into the archive without needing per-exhibit
 * theme data (a real per-wing color shift, per Design Doc section 8,
 * needs a schema field this data model doesn't have yet - deferred).
 * High contrast collapses this to one flat, bright preset everywhere.
 */
export function getRoomLightMood(roomIndex: number, highContrast: boolean): { color: string; intensity: number } {
  if (highContrast) return { color: "#FFFFFF", intensity: 1.7 };
  const depth = Math.min(roomIndex, 4);
  const warmth = depth / 4;
  return {
    color: warmth < 0.5 ? "#F2DFC0" : "#EAC896",
    intensity: 1.05 - warmth * 0.2,
  };
}

/**
 * RoomTheme
 * Per-exhibit override for RoomsShell's architecture colors and
 * RoomMuseumScene's ambient lighting mood, so a single exhibit can be
 * re-themed (Room Beautification Phase 2 - "India's Freedom Struggle")
 * without touching WALL_COLOR/CEILING_COLOR/FLOOR_COLOR/BASEBOARD_COLOR
 * or getRoomLightMood above, which every other exhibit's page still
 * reads directly. `highContrast` always wins over a RoomTheme - every
 * consumer (RoomsShell, RoomMuseumScene, RoomFrame) applies the
 * existing HIGH_CONTRAST_* override first and only falls back to the
 * theme when high contrast is off.
 */
export interface RoomTheme {
  wallColor: string;
  ceilingColor: string;
  floorColor: string;
  baseboardColor: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  hemisphereSky: string;
  hemisphereGround: string;
  hemisphereIntensity: number;
  ambientColor: string;
  ambientIntensity: number;
  // Plain data, not a function - RoomTheme crosses from the exhibit
  // page (Server Component) to RoomMuseumScene (Client Component) as a
  // prop, and functions can't be serialized across that boundary. See
  // getThemedRoomLightMood below, which mirrors getRoomLightMood's
  // depth-based falloff shape using these fields.
  lightMoodNearColor: string;
  lightMoodFarColor: string;
  lightMoodBaseIntensity: number;
  lightMoodFalloffPerRoom: number;
  // "Vitrine spotlight" glow applied to every non-award sheet's
  // existing gold trim mesh (RoomFrame) - an emissive tweak on
  // already-rendered geometry rather than an extra plane or a real
  // per-sheet light, since this exhibit alone has 24 mounted sheets:
  // 24 extra draw calls or live lights would be a real frame-rate
  // risk. Kept deliberately fainter than the existing award-sheet glow
  // so award sheets still stand out above regular collection sheets.
  sheetGlowColor: string;
  sheetGlowIntensity: number;
}

// "India's Freedom Struggle" (exhibit slug: indias-freedom-struggle) -
// warm cream/off-white gallery re-theme, replacing the dark "Reliquary
// Hall" mood for this one exhibit's hall only. Every other exhibit
// (e.g. Floral Melodies) keeps reading WALL_COLOR/CEILING_COLOR/
// FLOOR_COLOR/BASEBOARD_COLOR/getRoomLightMood above unchanged.
export const FREEDOM_STRUGGLE_THEME: RoomTheme = {
  wallColor: "#F1E7D6",
  ceilingColor: "#F8F2E6",
  floorColor: "#8A6B47",
  baseboardColor: MUSEUM_CHARCOAL,
  fogColor: "#EDE0C8",
  fogNear: 14,
  fogFar: 44,
  hemisphereSky: "#FFF7E8",
  hemisphereGround: MUSEUM_GOLD_LIGHT,
  hemisphereIntensity: 1.1,
  ambientColor: MUSEUM_OFFWHITE,
  ambientIntensity: 1.0,
  lightMoodNearColor: "#FFF3DA",
  lightMoodFarColor: "#FCE8C2",
  lightMoodBaseIntensity: 1.7,
  lightMoodFalloffPerRoom: 0.07,
  sheetGlowColor: "#FFEAC0",
  sheetGlowIntensity: 0.35,
};

/**
 * getThemedRoomLightMood
 * RoomTheme's equivalent of getRoomLightMood above - same depth-based
 * falloff shape (deepening warmth/dimness the further into the hall),
 * driven by a theme's plain-data fields instead of a hardcoded curve,
 * so RoomMuseumScene can call one or the other based on whether the
 * current exhibit has a RoomTheme.
 */
export function getThemedRoomLightMood(theme: RoomTheme, roomIndex: number): { color: string; intensity: number } {
  const depth = Math.min(roomIndex, 3);
  return {
    color: depth < 2 ? theme.lightMoodNearColor : theme.lightMoodFarColor,
    intensity: theme.lightMoodBaseIntensity - depth * theme.lightMoodFalloffPerRoom,
  };
}

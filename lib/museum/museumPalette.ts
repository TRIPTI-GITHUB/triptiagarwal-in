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

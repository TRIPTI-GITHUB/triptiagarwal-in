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
 * "Warm gallery" direction (Room Beautification Phase 2): every
 * exhibit's hall uses a warm cream/off-white base (walls, ceiling, a
 * honey-wood floor, charcoal grounding trim) rather than the earlier
 * "Reliquary Hall" dark-archive palette - that dark palette is
 * retired, not kept around as an alternate. Per-exhibit distinctness
 * (Design Doc section 8's "different ambient tone per room") now comes
 * from a small ROOM_ACCENTS lookup (below) that varies only the
 * lighting's color undertone, not the architecture colors.
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
// Warm cream gallery walls/ceiling, a honey-wood floor, and
// brand-charcoal grounding trim - every exhibit's hall, not an
// override for one. Anchored close to brand-cream (#FAF7F2) but not
// identical to it, so the walls read as painted gallery plaster rather
// than a flat UI background.
export const WALL_COLOR = "#F1E7D6";
export const CEILING_COLOR = "#F8F2E6";
export const FLOOR_COLOR = "#8A6B47";
export const BASEBOARD_COLOR = MUSEUM_CHARCOAL;
export const MOULDING_COLOR = MUSEUM_GOLD;
export const MAT_COLOR = "#6E2424";
export const PILLAR_COLOR = "#C9BBA0"; // aged limestone
export const FRAME_WOOD_COLOR = "#4A3018"; // dark walnut
export const VITRINE_GLASS_COLOR = MUSEUM_TEAL;
export const AWARD_GLOW_COLOR = "#F0C75E"; // kept distinct from brand gold, deliberately
export const WAX_SEAL_COLOR = "#6E2424"; // curator's-note tell, echoes the mat/rug red

// Ambient fill (RoomMuseumScene's hemisphereLight/ambientLight/fog) -
// bright enough that no surface reads as pure black in shadow, per
// "museum-quality presentation, not flat or washed out."
export const HEMISPHERE_SKY = "#FFF7E8";
export const HEMISPHERE_INTENSITY = 1.1;
export const AMBIENT_COLOR = MUSEUM_OFFWHITE;
export const AMBIENT_INTENSITY = 1.0;
export const FOG_COLOR = "#EDE0C8";
export const FOG_NEAR = 14;
export const FOG_FAR = 44;

// Faint "vitrine spotlight" glow applied to every non-award sheet's
// existing gold trim mesh (RoomFrame) - an emissive tweak on
// already-rendered geometry rather than an extra plane or a real
// per-sheet light (measured cost: zero extra frame-rate impact vs. a
// real per-sheet light, which would be a genuine risk at a 24-sheet
// exhibit). Deliberately fainter than the award-sheet glow so award
// sheets still stand out above regular collection sheets.
export const SHEET_GLOW_COLOR = "#FFEAC0";
export const SHEET_GLOW_INTENSITY = 0.35;

// The floating sheet-heading text (RoomFrame) has no backing plate of
// its own, so it needs a dark-on-light pairing against these light
// walls - see RoomFrame's use of these two.
export const SHEET_HEADING_COLOR = MUSEUM_CHARCOAL;
export const SHEET_HEADING_OUTLINE = MUSEUM_GOLD_LIGHT;

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
 * RoomAccent
 * The one thing that still varies per exhibit: a subtle lighting
 * undertone (hemisphere ground bounce + the room point-lights' color),
 * giving each gallery its own character within the shared warm-cream
 * base per Design Doc section 8's "different ambient tone per room" -
 * without touching wall/floor/ceiling colors, which stay uniform.
 */
export interface RoomAccent {
  hemisphereGround: string;
  lightMoodNearColor: string;
  lightMoodFarColor: string;
}

// The default accent (warm gold) - what "India's Freedom Struggle"
// originally shipped with, and what any exhibit not listed in
// ROOM_ACCENTS below gets automatically, including future ones.
export const DEFAULT_ROOM_ACCENT: RoomAccent = {
  hemisphereGround: MUSEUM_GOLD_LIGHT,
  lightMoodNearColor: "#FFF3DA",
  lightMoodFarColor: "#FCE8C2",
};

// Curated per-exhibit variants, keyed by exhibit slug. Add an entry
// here to give a specific gallery its own undertone; every other
// exhibit (current or future) falls back to DEFAULT_ROOM_ACCENT via
// getRoomAccent below.
export const ROOM_ACCENTS: Record<string, RoomAccent> = {
  // A soft sage undertone (drawing on brand-teal's family, much
  // paler) - fitting for a floral/nature exhibit, and legible as
  // "different room" from Freedom Struggle's warmer gold without
  // going cold/blue.
  "floral-melodies": {
    hemisphereGround: "#CFE0CE",
    lightMoodNearColor: "#F3F6EC",
    lightMoodFarColor: "#E6EEDD",
  },
};

export function getRoomAccent(slug: string): RoomAccent {
  return ROOM_ACCENTS[slug] ?? DEFAULT_ROOM_ACCENT;
}

const LIGHT_MOOD_BASE_INTENSITY = 1.7;
const LIGHT_MOOD_FALLOFF_PER_ROOM = 0.07;

/**
 * getRoomLightMood
 * Per-room point-light color/intensity, tinted by the exhibit's
 * RoomAccent - warmth/dimness still deepens slightly further into the
 * hall (evokes progression without needing per-room theme data), but
 * starting from a bright, warm-white/gold base rather than the old
 * dim archive curve. High contrast collapses this to one flat, bright
 * preset regardless of accent.
 */
export function getRoomLightMood(
  roomIndex: number,
  highContrast: boolean,
  accent: RoomAccent = DEFAULT_ROOM_ACCENT
): { color: string; intensity: number } {
  if (highContrast) return { color: "#FFFFFF", intensity: 1.7 };
  const depth = Math.min(roomIndex, 3);
  return {
    color: depth < 2 ? accent.lightMoodNearColor : accent.lightMoodFarColor,
    intensity: LIGHT_MOOD_BASE_INTENSITY - depth * LIGHT_MOOD_FALLOFF_PER_ROOM,
  };
}
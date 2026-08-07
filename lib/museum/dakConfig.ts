/**
 * dakConfig
 * Single source of truth for the Dak mascot's placeholder content and
 * tuning constants - swap greeting copy or timing here without touching
 * DakCompanion/DakDialogueBubble logic.
 */

// `guiding` and `celebrating` are part of the shape now (section 15's
// component list) so DakCompanion's prop contract doesn't need to change
// in Phase 5 - this phase only ever sets idle/greeting/dismissed.
export type DakMode = "idle" | "greeting" | "dismissed" | "guiding" | "celebrating";

export const DAK_GREETING_LINES = [
  "Welcome. I'm Dak — I'll be around if you'd like company.",
  "Every piece in here has a story. Ready to find one?",
  "Take your time. The good stories are never in a hurry.",
] as const;

// Dak's resting perch - the front-right corner of the reception
// counter's top surface (world x:[-4.7,-1.7] z:[15.0,16.4] y≈0.95 once
// LOBBY_RECEPTION's rotation is applied), clear of the signboard and
// visible from spawn without the visitor needing to turn far.
export const DAK_PERCH_POSITION: [number, number, number] = [-2.0, 0.98, 15.3];

export const DAK_BOB_AMPLITUDE = 0.025;
export const DAK_BOB_PERIOD_SECONDS = 3.4;

export const DAK_GREETING_ENTRY_DELAY_MS = 1200; // after `entered`, before Dak greets
export const DAK_GREETING_DURATION_MS = 5000; // how long the greeting bubble stays up

// Guided tour (Phase 5) - Dak's own walking pace, deliberately a touch
// slower than the visitor's own walk speed (roomConstants.WALK_SPEED),
// since he's leading rather than racing ahead.
export const DAK_WALK_SPEED = 2.2;
export const DAK_TOUR_DWELL_MS = 7000; // how long Dak lingers at a stop before moving on
export const DAK_TOUR_ARRIVE_THRESHOLD = 0.15;

// Restrained heritage palette (section 4) - reuses the museum's existing
// brand accents (antique gold, forest green) where they already fit, so
// Dak reads as part of the same world rather than a separate art style.
export const DAK_COLORS = {
  body: "#A68A64", // khaki
  belly: "#EDE4D3", // cream
  wing: "#4A3324", // deep brown
  beak: "#C9A227", // muted gold
  satchel: "#2D5A3D", // deep green
  clasp: "#C9A227", // muted gold wax seal
} as const;

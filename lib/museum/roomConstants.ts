    /**
 * Measurements for the new room-based museum layout (Stage 1+,
 * currently in preview at app/museum/test). Deliberately separate
 * from lib/museum/constants.ts (used by the live corridor museum) so
 * developing this new design can never accidentally break the live
 * page, and vice versa.
 */
export const ROOM_SIZE = 8;
export const ROOM_HEIGHT = 4;
export const DOOR_WIDTH = 2.2;
export const EYE_HEIGHT = 1.6;

export const FRAME_Y = 1.8;
export const FRAME_WIDTH = 2.4;
export const FRAME_HEIGHT = 1.7;

export const WALL_MARGIN = 0.5;
export const WALK_SPEED = 3;

export const TURN_SPEED = 1.8; // radians per second, shared by keyboard, drag, and on-screen rotation controls
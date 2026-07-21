/**
 * Shared measurements for the 3D museum. Kept in one place so the
 * room shell (MuseumScene) and the movement/collision logic
 * (FirstPersonControls) always agree on the room's actual size -
 * changing the room's dimensions only ever requires editing this
 * one file.
 */
export const ROOM_WIDTH = 10;
export const ROOM_DEPTH = 8;
export const ROOM_HEIGHT = 4;
export const EYE_HEIGHT = 1.6;

// How close the camera is allowed to get to a wall before being
// stopped - roughly an arm's length, so you don't feel like your
// face is pressed directly into the wall texture.
export const WALL_MARGIN = 0.5;
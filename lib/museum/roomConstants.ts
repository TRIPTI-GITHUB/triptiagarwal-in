export const ROOM_SIZE = 12;
export const ROOM_HEIGHT = 4;
export const DOOR_WIDTH = 2.2;
export const EYE_HEIGHT = 1.6;

export const FRAME_Y = 1.9;
export const FRAME_WIDTH = 3.8;
export const FRAME_HEIGHT = 2.7;

export const WALL_MARGIN = 0.5;
export const WALK_SPEED = 3;
export const FOYER_DEPTH = 12; // extra approach space in front of Room 1, for the entrance
export const TURN_SPEED = 1.8;
export const FURNITURE_MARGIN = 0.3; // clearance added around lobby furniture collision boxes

// Exhibit vitrine dolly-in (Phase 2 - Exhibit Interactions)
export const PROXIMITY_RADIUS = 4.5; // walking-near cue radius, in front of MAX_INTERACT_DISTANCE
export const MAX_INTERACT_DISTANCE = 4; // how close a sheet must be to be click-selectable
export const DOLLY_STANDOFF_DEFAULT = 2.6;
export const DOLLY_STANDOFF_MIN = 1.4; // most zoomed in
export const DOLLY_STANDOFF_MAX = 3.6; // most zoomed out
export const DOLLY_STANDOFF_STEP = 0.5;
export const DOLLY_SPEED = 2.5; // exponential-ease rate, matches TourGuide's WALK_SPEED pattern
export const DOLLY_ARRIVE_THRESHOLD = 0.12;
export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  passThrough?: boolean;
}

export interface InteractionZone {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'coin_table' | 'barkeep' | 'door';
  label: string;
}

export const WORLD_WIDTH = 960;
export const WORLD_HEIGHT = 540;
export const GRAVITY = 0.6;
export const JUMP_FORCE = -12;
export const MOVE_SPEED = 4;

export const SPAWN = { x: 480, y: 400 };

/**
 * Tavern platforms — MapleStory-style side-scrolling layout.
 *
 * Ground floor: solid full-width floor.
 * Upper level: two passThrough platforms (bar area left, seating right)
 *              with a gap in the center where the ladder sits.
 */
export const PLATFORMS: Platform[] = [
  // Ground floor — solid, spans full width
  {
    x: 0,
    y: 440,
    width: 960,
    height: 100,
    passThrough: false,
  },

  // Upper-left platform (bar area)
  {
    x: 60,
    y: 280,
    width: 340,
    height: 16,
    passThrough: true,
  },

  // Upper-right platform (seating area)
  {
    x: 560,
    y: 280,
    width: 340,
    height: 16,
    passThrough: true,
  },
];

/**
 * Ladder hitbox — sits in the gap between the two upper platforms.
 * Not a platform; used by PlayerController to detect climbing context.
 */
export const LADDER = {
  x: 440,
  y: 280,
  width: 80,
  height: 160, // spans from upper platform down to ground
};

/**
 * Interaction zones the player can activate.
 */
export const INTERACTION_ZONES: InteractionZone[] = [
  // Coin flip table — ground floor center
  {
    x: 400,
    y: 380,
    width: 160,
    height: 60,
    type: 'coin_table',
    label: 'Flip Table',
  },

  // Barkeep — upper-left platform
  {
    x: 120,
    y: 220,
    width: 100,
    height: 60,
    type: 'barkeep',
    label: 'Barkeep',
  },

  // Door — far right ground floor
  {
    x: 880,
    y: 370,
    width: 60,
    height: 70,
    type: 'door',
    label: 'Exit',
  },
];

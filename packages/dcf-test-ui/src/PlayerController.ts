import type { Platform, InteractionZone } from './GameWorld';
import {
  GRAVITY,
  JUMP_FORCE,
  MOVE_SPEED,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  LADDER,
} from './GameWorld';

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  grounded: boolean;
  facing: 'left' | 'right';
  state: 'idle' | 'walk' | 'jump' | 'fall';
  onLadder: boolean;
}

/** Approximate player hitbox dimensions (used for collision). */
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 48;

/**
 * Create a fresh player at the given spawn position.
 * x/y represent the bottom-center of the sprite.
 */
export function createPlayer(spawnX: number, spawnY: number): PlayerState {
  return {
    x: spawnX,
    y: spawnY,
    vx: 0,
    vy: 0,
    grounded: false,
    facing: 'right',
    state: 'idle',
    onLadder: false,
  };
}

// ---- helpers ----------------------------------------------------------------

function playerLeft(p: PlayerState): number {
  return p.x - PLAYER_WIDTH / 2;
}

function playerRight(p: PlayerState): number {
  return p.x + PLAYER_WIDTH / 2;
}

function playerTop(p: PlayerState): number {
  return p.y - PLAYER_HEIGHT;
}

function overlapsLadder(p: PlayerState): boolean {
  const pl = playerLeft(p);
  const pr = playerRight(p);
  const pt = playerTop(p);
  const pb = p.y;
  return (
    pr > LADDER.x &&
    pl < LADDER.x + LADDER.width &&
    pb > LADDER.y &&
    pt < LADDER.y + LADDER.height
  );
}

function rectsOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// ---- main update ------------------------------------------------------------

/**
 * Pure update function. Takes the current state, pressed keys, and platforms,
 * returns the next PlayerState.
 *
 * Keys expected (KeyboardEvent.key / KeyboardEvent.code values):
 *   Movement  — "ArrowLeft", "ArrowRight"
 *   Jump      — "Alt", "z", "Z", " " (Space)
 *   Climb     — "ArrowUp", "ArrowDown"
 */
export function updatePlayer(
  player: PlayerState,
  keys: Set<string>,
  platforms: Platform[],
): PlayerState {
  // Work on a shallow copy so we stay pure.
  const next: PlayerState = { ...player };

  // --- horizontal input ------------------------------------------------------
  const left = keys.has('ArrowLeft');
  const right = keys.has('ArrowRight');

  if (left && !right) {
    next.vx = -MOVE_SPEED;
    next.facing = 'left';
  } else if (right && !left) {
    next.vx = MOVE_SPEED;
    next.facing = 'right';
  } else {
    next.vx = 0;
  }

  // --- ladder ----------------------------------------------------------------
  const up = keys.has('ArrowUp');
  const down = keys.has('ArrowDown');
  const onLadderNow = overlapsLadder(next);

  if (onLadderNow && (up || down)) {
    next.onLadder = true;
  }

  if (next.onLadder) {
    if (!onLadderNow) {
      // Walked off the ladder horizontally — detach.
      next.onLadder = false;
    } else {
      // Climb up/down at a moderate speed; no gravity while climbing.
      const CLIMB_SPEED = 3;
      if (up) {
        next.vy = -CLIMB_SPEED;
      } else if (down) {
        next.vy = CLIMB_SPEED;
      } else {
        next.vy = 0;
      }
    }
  }

  // --- jump ------------------------------------------------------------------
  const jumpPressed =
    keys.has('Alt') || keys.has('z') || keys.has('Z') || keys.has(' ');

  if (jumpPressed && next.grounded && !next.onLadder) {
    next.vy = JUMP_FORCE;
    next.grounded = false;
  }

  // --- gravity (skipped while on ladder) -------------------------------------
  if (!next.onLadder) {
    next.vy += GRAVITY;
  }

  // --- apply velocity --------------------------------------------------------
  next.x += next.vx;
  next.y += next.vy;

  // --- platform collision ----------------------------------------------------
  next.grounded = false;

  for (const plat of platforms) {
    // We only resolve vertical (landing) collisions.
    // "feet" are at next.y (bottom edge).
    const feetY = next.y;
    const prevFeetY = player.y + player.vy; // approximate previous bottom

    const horizontallyOverlapping =
      playerRight(next) > plat.x && playerLeft(next) < plat.x + plat.width;

    if (!horizontallyOverlapping) continue;

    if (plat.passThrough) {
      // Pass-through platforms: only land when falling downward through them.
      if (next.vy >= 0 && player.y <= plat.y && feetY >= plat.y) {
        // Allow dropping through with down key
        if (next.onLadder || down) continue;
        next.y = plat.y;
        next.vy = 0;
        next.grounded = true;
        next.onLadder = false;
      }
    } else {
      // Solid platform — land on top.
      if (next.vy >= 0 && feetY >= plat.y && player.y <= plat.y) {
        next.y = plat.y;
        next.vy = 0;
        next.grounded = true;
        next.onLadder = false;
      }

      // Head bump — hit from below.
      if (
        next.vy < 0 &&
        playerTop(next) <= plat.y + plat.height &&
        playerTop(player) >= plat.y + plat.height
      ) {
        next.y = plat.y + plat.height + PLAYER_HEIGHT;
        next.vy = 0;
      }
    }
  }

  // --- world bounds ----------------------------------------------------------
  const halfW = PLAYER_WIDTH / 2;
  if (next.x - halfW < 0) next.x = halfW;
  if (next.x + halfW > WORLD_WIDTH) next.x = WORLD_WIDTH - halfW;
  if (next.y < PLAYER_HEIGHT) {
    next.y = PLAYER_HEIGHT;
    next.vy = 0;
  }
  if (next.y > WORLD_HEIGHT) {
    next.y = WORLD_HEIGHT;
    next.vy = 0;
    next.grounded = true;
  }

  // --- animation state -------------------------------------------------------
  if (next.onLadder) {
    next.state = 'idle'; // could be 'climb' if you add that later
  } else if (!next.grounded && next.vy < 0) {
    next.state = 'jump';
  } else if (!next.grounded && next.vy >= 0) {
    next.state = 'fall';
  } else if (next.vx !== 0) {
    next.state = 'walk';
  } else {
    next.state = 'idle';
  }

  return next;
}

// ---- interaction detection --------------------------------------------------

/**
 * Returns the first InteractionZone the player overlaps, or null.
 * Player hitbox is centered at (x, y-PLAYER_HEIGHT/2).
 */
export function getInteraction(
  player: PlayerState,
  zones: InteractionZone[],
): InteractionZone | null {
  const pl = playerLeft(player);
  const pt = playerTop(player);

  for (const zone of zones) {
    if (
      rectsOverlap(
        pl,
        pt,
        PLAYER_WIDTH,
        PLAYER_HEIGHT,
        zone.x,
        zone.y,
        zone.width,
        zone.height,
      )
    ) {
      return zone;
    }
  }

  return null;
}

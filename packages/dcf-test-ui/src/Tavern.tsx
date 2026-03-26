import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import 'pixi.js/unsafe-eval';
import { useDcf } from './provider';
import { HUD } from './HUD';
import { FlipOverlay } from './FlipOverlay';
import { PLATFORMS, INTERACTION_ZONES, SPAWN, WORLD_WIDTH, WORLD_HEIGHT, LADDER } from './GameWorld';
import { createPlayer, updatePlayer, getInteraction, type PlayerState } from './PlayerController';

// --- NPC definitions ---
interface NpcDef {
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  emoji: string;
  label?: string;
}

const NPCS: NpcDef[] = [
  // Barkeep on upper-left platform (platform y=280, so feet at 280, centered x ~170)
  { x: 170, y: 280, width: 28, height: 40, color: 0x8b5cf6, emoji: '\u{1F9D9}' },
  // Skull on upper-right platform
  { x: 700, y: 280, width: 28, height: 40, color: 0x94a3b8, emoji: '\u{1F480}' },
  // Elf on ground left (ground y=440)
  { x: 120, y: 440, width: 28, height: 40, color: 0x22c55e, emoji: '\u{1F9DD}' },
  // Drake on ground right
  { x: 800, y: 440, width: 28, height: 40, color: 0xef4444, emoji: '\u{1F409}' },
];

// Coin table position (ground center, matching interaction zone)
const COIN_TABLE = { x: 420, y: 400, width: 120, height: 40 };

// Door position (matching interaction zone)
const DOOR = { x: 890, y: 380, width: 40, height: 60 };

// Player sprite dimensions (visual, smaller than hitbox for style)
const PLAYER_DRAW_W = 24;
const PLAYER_DRAW_H = 32;

export function Tavern() {
  const { disconnect } = useDcf();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showFlip, setShowFlip] = useState(false);
  const [interactionPrompt, setInteractionPrompt] = useState('');

  // Refs to bridge React state into the game loop
  const showFlipRef = useRef(showFlip);
  showFlipRef.current = showFlip;

  const disconnectRef = useRef(disconnect);
  disconnectRef.current = disconnect;

  const setShowFlipCb = useCallback((v: boolean) => setShowFlip(v), []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const container = canvasRef.current;
    let destroyed = false;
    let onKeyDown: ((e: KeyboardEvent) => void) | null = null;
    let onKeyUp: ((e: KeyboardEvent) => void) | null = null;

    // --- PIXI Application (v8 async init) ---
    const app = new PIXI.Application();

    const boot = async () => {
      await app.init({
        width: WORLD_WIDTH,
        height: WORLD_HEIGHT,
        backgroundColor: 0x2a1a0e,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (destroyed) {
        app.destroy(true);
        return;
      }

      container.appendChild(app.canvas);

      // ---- Scene layers ----
      const bgLayer = new PIXI.Container();
      const platformLayer = new PIXI.Container();
      const objectLayer = new PIXI.Container();
      const npcLayer = new PIXI.Container();
      const particleLayer = new PIXI.Container();
      const playerLayer = new PIXI.Container();
      const glowLayer = new PIXI.Container();

      app.stage.addChild(bgLayer);
      app.stage.addChild(platformLayer);
      app.stage.addChild(objectLayer);
      app.stage.addChild(npcLayer);
      app.stage.addChild(particleLayer);
      app.stage.addChild(playerLayer);
      app.stage.addChild(glowLayer);

      // ---- Background gradient ----
      const bgGfx = new PIXI.Graphics();
      // Draw a series of horizontal strips for a gradient effect
      const gradientSteps = 32;
      const topColor = { r: 0x1a, g: 0x0e, b: 0x05 };
      const bottomColor = { r: 0x4a, g: 0x2e, b: 0x14 };
      for (let i = 0; i < gradientSteps; i++) {
        const t = i / (gradientSteps - 1);
        const r = Math.round(topColor.r + (bottomColor.r - topColor.r) * t);
        const g = Math.round(topColor.g + (bottomColor.g - topColor.g) * t);
        const b = Math.round(topColor.b + (bottomColor.b - topColor.b) * t);
        const color = (r << 16) | (g << 8) | b;
        const stripH = Math.ceil(WORLD_HEIGHT / gradientSteps);
        bgGfx.rect(0, i * stripH, WORLD_WIDTH, stripH + 1);
        bgGfx.fill(color);
      }
      bgLayer.addChild(bgGfx);

      // ---- Wooden back wall ----
      const wallGfx = new PIXI.Graphics();
      // Horizontal planks
      for (let wy = 0; wy < 440; wy += 40) {
        const shade = 0x2e1a0a + ((wy % 80 === 0) ? 0x0a0604 : 0);
        wallGfx.rect(0, wy, WORLD_WIDTH, 38);
        wallGfx.fill(shade);
        wallGfx.rect(0, wy + 38, WORLD_WIDTH, 2);
        wallGfx.fill(0x1a0e05);
      }
      bgLayer.addChild(wallGfx);

      // ---- Platforms ----
      for (const p of PLATFORMS) {
        const pGfx = new PIXI.Graphics();
        // Main body
        pGfx.roundRect(p.x, p.y, p.width, p.height, 4);
        pGfx.fill(0x5c3d1a);
        // Lighter top edge
        pGfx.rect(p.x, p.y, p.width, 3);
        pGfx.fill(0x8b6914);
        // Darker bottom edge
        pGfx.rect(p.x, p.y + p.height - 2, p.width, 2);
        pGfx.fill(0x3a2510);
        // Plank lines for ground
        if (!p.passThrough) {
          for (let lx = p.x + 60; lx < p.x + p.width; lx += 80) {
            pGfx.rect(lx, p.y, 1, p.height);
            pGfx.fill(0x4a2e12);
          }
        }
        platformLayer.addChild(pGfx);
      }

      // ---- Ladder ----
      const ladderGfx = new PIXI.Graphics();
      // Two vertical rails
      ladderGfx.rect(LADDER.x + 15, LADDER.y, 4, LADDER.height);
      ladderGfx.fill(0x6b4226);
      ladderGfx.rect(LADDER.x + LADDER.width - 19, LADDER.y, 4, LADDER.height);
      ladderGfx.fill(0x6b4226);
      // Horizontal rungs
      for (let ry = LADDER.y + 15; ry < LADDER.y + LADDER.height; ry += 20) {
        ladderGfx.rect(LADDER.x + 15, ry, LADDER.width - 30, 3);
        ladderGfx.fill(0x8b6914);
      }
      objectLayer.addChild(ladderGfx);

      // ---- Coin table ----
      const coinTableGfx = new PIXI.Graphics();
      coinTableGfx.roundRect(COIN_TABLE.x, COIN_TABLE.y, COIN_TABLE.width, COIN_TABLE.height, 6);
      coinTableGfx.fill(0xc4a45a);
      // Darker edge
      coinTableGfx.rect(COIN_TABLE.x + 2, COIN_TABLE.y + COIN_TABLE.height - 4, COIN_TABLE.width - 4, 4);
      coinTableGfx.fill(0x9a8040);
      // Legs
      coinTableGfx.rect(COIN_TABLE.x + 8, COIN_TABLE.y + COIN_TABLE.height, 6, 12);
      coinTableGfx.fill(0x6b4226);
      coinTableGfx.rect(COIN_TABLE.x + COIN_TABLE.width - 14, COIN_TABLE.y + COIN_TABLE.height, 6, 12);
      coinTableGfx.fill(0x6b4226);
      objectLayer.addChild(coinTableGfx);

      const coinEmoji = new PIXI.Text({
        text: '\u{1FA99}',
        style: { fontSize: 22 },
      });
      coinEmoji.anchor.set(0.5);
      coinEmoji.x = COIN_TABLE.x + COIN_TABLE.width / 2 - 20;
      coinEmoji.y = COIN_TABLE.y + COIN_TABLE.height / 2 - 2;
      objectLayer.addChild(coinEmoji);

      const coinLabel = new PIXI.Text({
        text: 'COIN FLIP',
        style: {
          fontSize: 10,
          fontFamily: 'monospace',
          fill: 0x2a1a0e,
          fontWeight: 'bold',
        },
      });
      coinLabel.anchor.set(0.5);
      coinLabel.x = COIN_TABLE.x + COIN_TABLE.width / 2 + 12;
      coinLabel.y = COIN_TABLE.y + COIN_TABLE.height / 2 - 2;
      objectLayer.addChild(coinLabel);

      // ---- Door ----
      const doorGfx = new PIXI.Graphics();
      doorGfx.roundRect(DOOR.x, DOOR.y, DOOR.width, DOOR.height, 4);
      doorGfx.fill(0x2a5a18);
      // Door frame
      doorGfx.rect(DOOR.x - 2, DOOR.y - 2, DOOR.width + 4, 3);
      doorGfx.fill(0x6b4226);
      doorGfx.rect(DOOR.x - 2, DOOR.y, 2, DOOR.height);
      doorGfx.fill(0x6b4226);
      doorGfx.rect(DOOR.x + DOOR.width, DOOR.y, 2, DOOR.height);
      doorGfx.fill(0x6b4226);
      // Knob
      doorGfx.circle(DOOR.x + DOOR.width - 8, DOOR.y + DOOR.height / 2, 3);
      doorGfx.fill(0xc4a45a);
      objectLayer.addChild(doorGfx);

      const doorEmoji = new PIXI.Text({
        text: '\u{1F6AA}',
        style: { fontSize: 18 },
      });
      doorEmoji.anchor.set(0.5);
      doorEmoji.x = DOOR.x + DOOR.width / 2;
      doorEmoji.y = DOOR.y + 14;
      objectLayer.addChild(doorEmoji);

      // ---- NPCs ----
      const npcBobOffsets: number[] = [];
      for (const npc of NPCS) {
        const npcGfx = new PIXI.Graphics();
        // Body
        npcGfx.roundRect(
          npc.x - npc.width / 2,
          npc.y - npc.height,
          npc.width,
          npc.height,
          4,
        );
        npcGfx.fill(npc.color);
        // Slightly lighter highlight on left side
        npcGfx.rect(
          npc.x - npc.width / 2,
          npc.y - npc.height,
          3,
          npc.height,
        );
        npcGfx.fill(npc.color + 0x222222);
        npcLayer.addChild(npcGfx);

        // Emoji above head
        const emojiText = new PIXI.Text({
          text: npc.emoji,
          style: { fontSize: 20 },
        });
        emojiText.anchor.set(0.5);
        emojiText.x = npc.x;
        emojiText.y = npc.y - npc.height - 14;
        npcLayer.addChild(emojiText);

        npcBobOffsets.push(Math.random() * Math.PI * 2);
      }

      // ---- Player ----
      const playerGfx = new PIXI.Graphics();
      playerLayer.addChild(playerGfx);

      let playerState = createPlayer(SPAWN.x, SPAWN.y);

      function drawPlayer(ps: PlayerState) {
        playerGfx.clear();

        // The PlayerController uses bottom-center coords.
        // Draw the visual sprite (smaller than hitbox) centered at bottom-center.
        const drawX = ps.x - PLAYER_DRAW_W / 2;
        const drawY = ps.y - PLAYER_DRAW_H;

        // Shadow
        playerGfx.ellipse(ps.x, ps.y - 1, 14, 4);
        playerGfx.fill({ color: 0x000000, alpha: 0.3 });

        // Body
        playerGfx.roundRect(drawX, drawY, PLAYER_DRAW_W, PLAYER_DRAW_H, 4);
        playerGfx.fill(0x3b82f6);

        // Lighter edge (highlight)
        playerGfx.rect(drawX + 1, drawY + 1, 3, PLAYER_DRAW_H - 2);
        playerGfx.fill(0x60a5fa);

        // Facing direction indicator (small triangle)
        const eyeX = ps.facing === 'right'
          ? drawX + PLAYER_DRAW_W - 5
          : drawX + 5;
        const eyeY = drawY + 8;
        // Eyes
        playerGfx.circle(eyeX, eyeY, 2);
        playerGfx.fill(0xffffff);
        playerGfx.circle(eyeX + (ps.facing === 'right' ? -6 : 6), eyeY, 2);
        playerGfx.fill(0xffffff);
      }

      drawPlayer(playerState);

      // ---- Floating particles (dust motes) ----
      interface Particle {
        x: number;
        y: number;
        speed: number;
        alpha: number;
        gfx: PIXI.Graphics;
      }
      const particles: Particle[] = [];
      for (let i = 0; i < 30; i++) {
        const p: Particle = {
          x: Math.random() * WORLD_WIDTH,
          y: Math.random() * WORLD_HEIGHT,
          speed: 0.2 + Math.random() * 0.4,
          alpha: 0.15 + Math.random() * 0.35,
          gfx: new PIXI.Graphics(),
        };
        p.gfx.circle(0, 0, 1.5 + Math.random() * 1);
        p.gfx.fill({ color: 0xffe8c0, alpha: p.alpha });
        p.gfx.x = p.x;
        p.gfx.y = p.y;
        particleLayer.addChild(p.gfx);
        particles.push(p);
      }

      // ---- Interaction glow ----
      const glowGfx = new PIXI.Graphics();
      glowLayer.addChild(glowGfx);

      // ---- Keyboard tracking ----
      const keys = new Set<string>();

      onKeyDown = (e: KeyboardEvent) => {
        keys.add(e.key);

        // Interaction on ArrowUp
        if (e.key === 'ArrowUp') {
          if (showFlipRef.current) return;
          const interaction = getInteraction(playerState, INTERACTION_ZONES);
          if (interaction) {
            if (interaction.type === 'coin_table') {
              setShowFlipCb(true);
            } else if (interaction.type === 'door') {
              disconnectRef.current();
            }
          }
        }

        // ESC to close flip overlay
        if (e.key === 'Escape' && showFlipRef.current) {
          setShowFlipCb(false);
        }
      };

      onKeyUp = (e: KeyboardEvent) => {
        keys.delete(e.key);
      };

      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);

      // ---- Game loop ----
      let elapsed = 0;

      app.ticker.add((ticker) => {
        elapsed += ticker.deltaTime / 60; // approximate seconds

        // 1. Update player
        const paused = showFlipRef.current;
        const keysForUpdate = paused ? new Set<string>() : keys;
        playerState = updatePlayer(playerState, keysForUpdate, PLATFORMS);

        // 2. Draw player
        drawPlayer(playerState);

        // 3. Check interactions
        const interaction = getInteraction(playerState, INTERACTION_ZONES);
        if (interaction && !showFlipRef.current) {
          const promptText =
            interaction.type === 'coin_table'
              ? '\u2191 Flip a coin'
              : interaction.type === 'door'
                ? '\u2191 Exit tavern'
                : `\u2191 Talk to ${interaction.label}`;
          setInteractionPrompt(promptText);
        } else {
          setInteractionPrompt('');
        }

        // 4. Update particles
        for (const p of particles) {
          p.y -= p.speed;
          p.x += Math.sin(elapsed * 2 + p.speed * 10) * 0.2;
          if (p.y < -5) {
            p.y = WORLD_HEIGHT + 5;
            p.x = Math.random() * WORLD_WIDTH;
          }
          p.gfx.x = p.x;
          p.gfx.y = p.y;
        }

        // 5. Update interaction glow
        glowGfx.clear();
        if (interaction && !showFlipRef.current) {
          const pulse = 0.4 + Math.sin(elapsed * 4) * 0.3;
          const zone = interaction;
          glowGfx.roundRect(zone.x - 3, zone.y - 3, zone.width + 6, zone.height + 6, 6);
          glowGfx.stroke({ color: 0xffd700, width: 2, alpha: pulse });
        }

        // 6. NPC bob animation
        const npcChildren = npcLayer.children;
        // NPCs are added as pairs: Graphics + Text, so index i*2 and i*2+1
        for (let i = 0; i < NPCS.length; i++) {
          const gfxIdx = i * 2;
          const textIdx = i * 2 + 1;
          if (gfxIdx < npcChildren.length && textIdx < npcChildren.length) {
            const bob = Math.sin(elapsed * 2 + npcBobOffsets[i]) * 2;
            (npcChildren[gfxIdx] as PIXI.Container).y = bob;
            (npcChildren[textIdx] as PIXI.Container).y = bob;
          }
        }
      });
    };

    boot();

    // ---- Cleanup ----
    return () => {
      destroyed = true;
      if (onKeyDown) window.removeEventListener('keydown', onKeyDown);
      if (onKeyUp) window.removeEventListener('keyup', onKeyUp);
      try {
        app.destroy(true, { children: true });
      } catch {
        // already destroyed
      }
    };

    // We intentionally use [] deps — event handler refs bridge React state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="game-container">
      <HUD />
      <div className="game-viewport" ref={canvasRef} />
      {interactionPrompt && !showFlip && <div className="game-prompt">{interactionPrompt}</div>}
      {!interactionPrompt && !showFlip && <div className="game-hint">{'\u2190'} {'\u2192'} move {'\u00b7'} Space jump {'\u00b7'} {'\u2191'} interact</div>}
      {showFlip && <FlipOverlay onClose={() => setShowFlip(false)} />}
    </div>
  );
}

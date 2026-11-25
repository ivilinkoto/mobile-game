// Game balance lives here. Tweak numbers, then run `npm run balance`
// to see how many moves each island takes.

import type { WeatherKind } from './types.ts';

export const SAVE_VERSION = 2;

// ── Energy (one chain = one energy) ──────────────────────────────
export const MAX_SPINS = 50;
export const START_SPINS = 50;
export const SPIN_REGEN_MS = 10 * 60 * 1000; // 1 energy every 10 minutes

// ── Wallet / shields ──────────────────────────────────────────────
export const START_COINS = 1000;
export const MAX_SHIELDS = 3;
export const START_SHIELDS = 1;

// ── Sky board ────────────────────────────────────────────────────
export const BOARD_COLS = 6;
export const BOARD_ROWS = 6;
export const MIN_CHAIN = 3;

/** How often each weather appears when the sky refills. */
export const TILE_WEIGHTS: Record<WeatherKind, number> = {
  sun: 30,
  wind: 25,
  bolt: 23,
  rain: 22,
};

/** Meter sizes: filling one triggers its action. */
export const METER_MAX = {
  sails: 12, // wind  → raid a treasure
  cannons: 10, // bolt → attack an island
  rain: 9, // rain → +1 shield
};

/**
 * Long chains are worth more than the sum of their tiles:
 * value = length + bonus, bonus = (length - 3) * 0.5 (rounded down).
 */
export function chainValue(length: number): number {
  return length + Math.floor(Math.max(0, length - 3) * 0.5);
}

// ── Rewards (multiplied by islandScale) ──────────────────────────
export const REWARD = {
  /** Coins per point of chain value for sunshine. */
  sunCoin: 55,
  /** Coins instead of a shield when shields are already full. */
  rainOverflow: 250,
  attack: 1500,
  attackBlockedFactor: 0.3,
  revengeFactor: 1.5,
  raidBase: 3000,
  /** Value multipliers of the 4 raid spots (shuffled). Player digs 3. */
  raidSpots: [1.0, 0.3, 0.2, 0.1],
  raidDigs: 3,
  storm: 1800, // × 2^(power-1)
  islandCompleteSpins: 20,
};

export const REWARD_SCALE_GROWTH = 1.6;

// ── Storm clouds ─────────────────────────────────────────────────
/** A chain at least this long leaves a storm cloud on the board. */
export const STORM_CHAIN = 6;
/** This many storm clouds on the board at once and they hit your own island. */
export const STORM_BACKFIRE = 4;

// ── Islands ──────────────────────────────────────────────────────
export const BUILDINGS_PER_ISLAND = 5;
export const MAX_BUILDING_LEVEL = 3;
export const ISLAND_BASE_COST = 600;
export const ISLAND_COST_GROWTH = 1.9;
export const REPAIR_FACTOR = 0.4;

export interface IslandDef {
  /** Theme key — colours and art live in src/art/themes.ts. */
  key: string;
}

/** Islands loop after the last one with growing costs. */
export const ISLANDS: IslandDef[] = [{ key: 'tropic' }, { key: 'glacier' }, { key: 'volcano' }, { key: 'sunken' }, { key: 'sky' }];

// ── Incoming attacks while away ──────────────────────────────────
export const INCOMING = {
  minAwayMs: 5 * 60 * 1000,
  attackChancePerHour: 0.25,
  raidChancePerHour: 0.15,
  maxEvents: 3,
  raidStealMin: 0.05,
  raidStealMax: 0.1,
};

export const RIVAL_COUNT = 8;
export const RIVAL_NAMES = ['Mara', 'Bruno', 'Elena', 'Tariq', 'Yuki', 'Ivo', 'Sven', 'Lucia', 'Nadia', 'Kofi'];

export const LOG_LIMIT = 30;

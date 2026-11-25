// Game balance lives here. Tweak numbers, then run `npm run balance`
// to see how many spins each island takes.

import type { OutcomeKind, SymbolId } from './types.ts';

export const SAVE_VERSION = 1;

// ── Energy (spins) ────────────────────────────────────────────────
export const MAX_SPINS = 50;
export const START_SPINS = 50;
export const SPIN_REGEN_MS = 10 * 60 * 1000; // 1 spin every 10 minutes

// ── Wallet / shields ──────────────────────────────────────────────
export const START_COINS = 1000;
export const MAX_SHIELDS = 3;
export const START_SHIELDS = 1;

/** Bet multipliers; a bet is only allowed when you have at least that many spins. */
export const BETS = [1, 2, 3, 5, 10];

// ── Wheel ─────────────────────────────────────────────────────────
/** Weight of each outcome per spin (sum does not need to be 100). */
export const OUTCOME_WEIGHTS: Record<OutcomeKind, number> = {
  mixed: 47,
  coinTriple: 14,
  bagTriple: 4,
  anchorTriple: 9,
  cannonTriple: 11,
  mapTriple: 7,
  energyTriple: 5,
  stormTriple: 3,
};

/** Per-reel symbol weights used for 'mixed' spins (never a triple). */
export const MIXED_SYMBOL_WEIGHTS: Record<SymbolId, number> = {
  coin: 35,
  storm: 12,
  anchor: 12,
  cannon: 12,
  map: 10,
  bag: 9,
  energy: 10,
};

/** Scripted first spins so a new player sees every mechanic quickly. */
export const TUTORIAL_OUTCOMES: OutcomeKind[] = [
  'coinTriple',
  'coinTriple',
  'cannonTriple',
  'mapTriple',
  'anchorTriple',
];

// ── Rewards (multiplied by islandScale and bet) ───────────────────
export const REWARD = {
  coinPerSymbol: 50,
  coinTriple: 600,
  bagTriple: 2500,
  anchorOverflow: 300, // when shields are already full
  energyTriple: 10, // spins (× bet, not × island scale)
  attack: 1500,
  attackBlockedFactor: 0.3,
  revengeFactor: 1.5,
  raidBase: 3000,
  /** Value multipliers of the 4 raid spots (shuffled). Player digs 3. */
  raidSpots: [1.0, 0.3, 0.2, 0.1],
  raidDigs: 3,
  storm: 2000, // × 2^(power-1)
  islandCompleteSpins: 20,
};

export const REWARD_SCALE_GROWTH = 1.6;

// ── Storm front ──────────────────────────────────────────────────
export const STORM_CHARGE_NEEDED = 3;
export const STORM_MAX_POWER = 4;
/** While holding a front, this many storm symbols in one spin make it backfire. */
export const STORM_BACKFIRE_SYMBOLS = 2;

// ── Islands ──────────────────────────────────────────────────────
export const BUILDINGS_PER_ISLAND = 5;
export const MAX_BUILDING_LEVEL = 3;
export const ISLAND_BASE_COST = 600;
export const ISLAND_COST_GROWTH = 1.9;
export const REPAIR_FACTOR = 0.4;

export interface IslandDef {
  key: string;
  emoji: string;
  sea: string; // background color
  land: string;
  buildings: string[]; // emoji per building
}

/** Islands loop after the last one with growing costs. */
export const ISLANDS: IslandDef[] = [
  { key: 'tropic', emoji: '🏝️', sea: '#2aa7c9', land: '#f3d98b', buildings: ['⛺', '🛖', '⛵', '🗼', '🏰'] },
  { key: 'glacier', emoji: '🧊', sea: '#5b8fb9', land: '#e8f4fb', buildings: ['🛷', '🏠', '🐧', '⛪', '🏯'] },
  { key: 'volcano', emoji: '🌋', sea: '#7a3b2e', land: '#4a3b35', buildings: ['🔥', '⚒️', '🏭', '🗿', '🏛️'] },
  { key: 'sunken', emoji: '🐚', sea: '#1b4f72', land: '#76b5c5', buildings: ['🪸', '🐙', '🏺', '🔱', '🕌'] },
  { key: 'sky', emoji: '☁️', sea: '#8ec5ff', land: '#ffffff', buildings: ['🎈', '🪁', '🌈', '🛸', '🏙️'] },
];

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
export const RIVAL_AVATARS = ['🧔', '👩‍🦰', '🧑‍✈️', '👳', '👩', '🧑', '👨‍🦳', '👱‍♀️', '🧕', '👨🏾'];

export const LOG_LIMIT = 30;

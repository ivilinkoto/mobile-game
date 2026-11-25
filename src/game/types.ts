// Core game types. Pure data — no React, no I/O.

export type Rng = () => number;

export type SymbolId = 'coin' | 'bag' | 'anchor' | 'cannon' | 'map' | 'storm' | 'energy';

export type OutcomeKind =
  | 'mixed'
  | 'coinTriple'
  | 'bagTriple'
  | 'anchorTriple'
  | 'cannonTriple'
  | 'mapTriple'
  | 'energyTriple'
  | 'stormTriple';

export interface Rival {
  id: string;
  name: string;
  islandIndex: number;
  buildings: number[]; // level per building, 0 = not built
  damaged: boolean[];
  shields: number;
  coins: number;
  /** True when this rival attacked/raided the player — revenge pays extra. */
  revenge: boolean;
}

export interface StormState {
  /** Storm symbols collected toward the next front (0..STORM_CHARGE_NEEDED). */
  charge: number;
  /** A storm front is ready to be unleashed. */
  ready: boolean;
  /** Strength of the ready front (1..STORM_MAX_POWER). */
  power: number;
}

export type PendingAction =
  | { type: 'attack'; targetIds: string[]; bet: number }
  | {
      type: 'raid';
      rivalId: string;
      bet: number;
      /** Coin value hidden under each spot. */
      spots: number[];
      dug: number[];
    }
  | { type: 'storm'; targetIds: string[] };

export type LogEntry =
  | { kind: 'incomingAttack'; at: number; rivalName: string; blocked: boolean; buildingIndex: number | null }
  | { kind: 'incomingRaid'; at: number; rivalName: string; coins: number }
  | { kind: 'attack'; at: number; rivalName: string; coins: number; blocked: boolean }
  | { kind: 'raid'; at: number; rivalName: string; coins: number }
  | { kind: 'storm'; at: number; rivalName: string; coins: number; power: number }
  | { kind: 'backfire'; at: number; buildingIndex: number | null }
  | { kind: 'islandComplete'; at: number; islandIndex: number };

export interface GameState {
  version: number;
  coins: number;
  spins: number;
  /** Timestamp the regen clock last advanced from. */
  regenAnchor: number;
  shields: number;
  bet: number;
  islandIndex: number;
  buildings: number[];
  damaged: boolean[];
  storm: StormState;
  pending: PendingAction | null;
  rivals: Rival[];
  log: LogEntry[];
  /** Unread log entries (for the badge on the news button). */
  unread: number;
  /** Index into the scripted tutorial outcomes; -1 when tutorial is done. */
  tutorialStep: number;
  /** Set when an island was just completed, to show the celebration. */
  justCompletedIsland: number | null;
  lastSeenAt: number;
  totalSpins: number;
}

export interface SpinResult {
  outcome: OutcomeKind;
  symbols: [SymbolId, SymbolId, SymbolId];
  coinsWon: number;
  spinsWon: number;
  shieldWon: boolean;
  /** Storm charge gained this spin. */
  stormGained: number;
  /** The held storm front grew stronger. */
  stormPowerUp: boolean;
  /** The held storm front turned back on the player. */
  backfire: { buildingIndex: number | null } | null;
  /** A brand new front formed this spin. */
  stormFormed: boolean;
}

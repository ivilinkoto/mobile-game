// Core game types. Pure data — no React, no I/O.

export type Rng = () => number;

/** Icons used across the UI (wallet, rewards, popups). */
export type SymbolId = 'coin' | 'bag' | 'anchor' | 'cannon' | 'map' | 'storm' | 'energy';

/** Weather tiles the player chains together. */
export type WeatherKind = 'sun' | 'wind' | 'bolt' | 'rain';
/** 'storm' tiles are created by long chains and unleashed by tapping. */
export type TileKind = WeatherKind | 'storm';

export interface Tile {
  /** Stable id so the UI can animate each tile as it falls. */
  id: number;
  kind: TileKind;
}

export interface Cell {
  r: number;
  c: number;
}

export interface Board {
  /** tiles[row][col], row 0 at the top. */
  tiles: Tile[][];
  nextId: number;
}

/** Progress toward the actions that weather charges. */
export interface Meters {
  sails: number; // wind → raid a rival's treasure
  cannons: number; // lightning → shell a rival's island
  rain: number; // rain → a shield
}

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
  | { type: 'storm'; targetIds: string[]; power: number };

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
  /** Energy: one chain costs one. */
  spins: number;
  /** Timestamp the regen clock last advanced from. */
  regenAnchor: number;
  shields: number;
  islandIndex: number;
  buildings: number[];
  damaged: boolean[];
  board: Board;
  meters: Meters;
  pending: PendingAction | null;
  rivals: Rival[];
  log: LogEntry[];
  /** Unread log entries (for the badge on the news button). */
  unread: number;
  /** Set when an island was just completed, to show the celebration. */
  justCompletedIsland: number | null;
  lastSeenAt: number;
  /** Chains played so far (drives the first-time hint). */
  totalSpins: number;
}

export interface ChainResult {
  kind: WeatherKind;
  length: number;
  coinsWon: number;
  /** How much each meter grew. */
  sailsAdded: number;
  cannonsAdded: number;
  rainAdded: number;
  shieldWon: boolean;
  raidReady: boolean;
  attackReady: boolean;
  /** A long chain created a storm cloud on the board. */
  stormSpawned: boolean;
  /** Too many storm clouds — they turned on the player. */
  backfire: { buildingIndex: number | null } | null;
}

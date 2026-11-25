// Pure game rules. Every function takes a state and returns a new state —
// no React, no storage, no Math.random (randomness is injected as `rng`).

import { clearKind, collapse, countKind, createBoard, isValidChain } from './board.ts';
import {
  BUILDINGS_PER_ISLAND,
  INCOMING,
  ISLANDS,
  ISLAND_BASE_COST,
  ISLAND_COST_GROWTH,
  LOG_LIMIT,
  MAX_BUILDING_LEVEL,
  MAX_SHIELDS,
  MAX_SPINS,
  METER_MAX,
  REPAIR_FACTOR,
  REWARD,
  REWARD_SCALE_GROWTH,
  RIVAL_COUNT,
  RIVAL_NAMES,
  SAVE_VERSION,
  SPIN_REGEN_MS,
  START_COINS,
  START_SHIELDS,
  START_SPINS,
  STORM_BACKFIRE,
  STORM_CHAIN,
  chainValue,
} from './config.ts';
import { randInt, shuffle } from './rng.ts';
import type { Cell, ChainResult, GameState, LogEntry, Rival, Rng, WeatherKind } from './types.ts';

// ── Helpers ───────────────────────────────────────────────────────

export function islandDef(index: number) {
  return ISLANDS[index % ISLANDS.length];
}

export function islandScale(index: number): number {
  return Math.pow(REWARD_SCALE_GROWTH, index);
}

/** Cost to raise building `b` on island `island` to `level` (1-based). */
export function buildingCost(island: number, b: number, level: number): number {
  const base = ISLAND_BASE_COST * Math.pow(ISLAND_COST_GROWTH, island);
  return roundNice(base * (1 + 0.3 * b) * level);
}

export function nextBuildCost(state: GameState, b: number): number | null {
  const level = state.buildings[b];
  if (level >= MAX_BUILDING_LEVEL) return null;
  return buildingCost(state.islandIndex, b, level + 1);
}

export function repairCost(state: GameState, b: number): number {
  const level = Math.max(1, state.buildings[b]);
  return roundNice(buildingCost(state.islandIndex, b, level) * REPAIR_FACTOR);
}

export function islandProgress(state: GameState): number {
  const total = BUILDINGS_PER_ISLAND * MAX_BUILDING_LEVEL;
  const done = state.buildings.reduce((s, l) => s + l, 0);
  return done / total;
}

export function isIslandComplete(buildings: number[], damaged: boolean[]): boolean {
  return buildings.every((l) => l >= MAX_BUILDING_LEVEL) && damaged.every((d) => !d);
}

function roundNice(n: number): number {
  if (n < 100) return Math.round(n);
  if (n < 10_000) return Math.round(n / 10) * 10;
  return Math.round(n / 100) * 100;
}

function pushLog(state: GameState, entry: LogEntry): GameState {
  return {
    ...state,
    log: [entry, ...state.log].slice(0, LOG_LIMIT),
    unread: state.unread + 1,
  };
}

/** Index of a random building that is built and not damaged, or null. */
function randomDamageTarget(buildings: number[], damaged: boolean[], rng: Rng): number | null {
  const candidates = buildings.map((l, i) => (l > 0 && !damaged[i] ? i : -1)).filter((i) => i >= 0);
  if (candidates.length === 0) return null;
  return candidates[Math.floor(rng() * candidates.length)];
}

// ── Rivals ────────────────────────────────────────────────────────

function makeRival(i: number, playerIsland: number, rng: Rng): Rival {
  const island = Math.max(0, playerIsland + randInt(-1, 1, rng));
  const buildings = Array.from({ length: BUILDINGS_PER_ISLAND }, () => randInt(0, MAX_BUILDING_LEVEL, rng));
  if (!buildings.some((l) => l > 0)) buildings[randInt(0, BUILDINGS_PER_ISLAND - 1, rng)] = 1;
  return {
    id: `r${i}`,
    name: RIVAL_NAMES[i % RIVAL_NAMES.length],
    islandIndex: island,
    buildings,
    damaged: buildings.map(() => false),
    shields: randInt(0, 2, rng),
    coins: Math.round(5000 * islandScale(island) * (0.5 + rng())),
    revenge: false,
  };
}

function ensureRivalBuilt(r: Rival, rng: Rng): Rival {
  if (r.buildings.some((l) => l > 0)) return r;
  const buildings = r.buildings.slice();
  buildings[randInt(0, BUILDINGS_PER_ISLAND - 1, rng)] = 1;
  return { ...r, buildings };
}

/** Rivals slowly rebuild and re-shield while the player is away. */
function progressRivals(rivals: Rival[], hours: number, rng: Rng): Rival[] {
  return rivals.map((r) => {
    let next = { ...r, buildings: r.buildings.slice(), damaged: r.damaged.slice() };
    const steps = Math.min(5, Math.floor(hours));
    for (let s = 0; s < steps; s++) {
      const i = randInt(0, BUILDINGS_PER_ISLAND - 1, rng);
      if (next.damaged[i]) next.damaged[i] = false;
      else if (next.buildings[i] < MAX_BUILDING_LEVEL) next.buildings[i]++;
      if (rng() < 0.3) next.shields = Math.min(MAX_SHIELDS, next.shields + 1);
    }
    next = ensureRivalBuilt(next, rng);
    return next;
  });
}

function pickTargets(rivals: Rival[], count: number, rng: Rng): string[] {
  const revenge = shuffle(rivals.filter((r) => r.revenge), rng);
  const others = shuffle(rivals.filter((r) => !r.revenge), rng);
  return [...revenge, ...others].slice(0, count).map((r) => r.id);
}

// ── Creation & time ──────────────────────────────────────────────

export function createInitialState(now: number, rng: Rng): GameState {
  return {
    version: SAVE_VERSION,
    coins: START_COINS,
    spins: START_SPINS,
    regenAnchor: now,
    shields: START_SHIELDS,
    islandIndex: 0,
    buildings: Array(BUILDINGS_PER_ISLAND).fill(0),
    damaged: Array(BUILDINGS_PER_ISLAND).fill(false),
    board: createBoard(rng),
    meters: { sails: 0, cannons: 0, rain: 0 },
    pending: null,
    rivals: Array.from({ length: RIVAL_COUNT }, (_, i) => makeRival(i, 0, rng)),
    log: [],
    unread: 0,
    justCompletedIsland: null,
    lastSeenAt: now,
    totalSpins: 0,
  };
}

/** Add spins that regenerated since `regenAnchor`. */
export function regenSpins(state: GameState, now: number): GameState {
  if (state.spins >= MAX_SPINS) {
    return state.regenAnchor === now ? state : { ...state, regenAnchor: now };
  }
  const gained = Math.floor((now - state.regenAnchor) / SPIN_REGEN_MS);
  if (gained <= 0) return state;
  const spins = Math.min(MAX_SPINS, state.spins + gained);
  const regenAnchor = spins >= MAX_SPINS ? now : state.regenAnchor + gained * SPIN_REGEN_MS;
  return { ...state, spins, regenAnchor };
}

/** Milliseconds until the next free spin, or null when spins are full. */
export function msUntilNextSpin(state: GameState, now: number): number | null {
  if (state.spins >= MAX_SPINS) return null;
  return Math.max(0, state.regenAnchor + SPIN_REGEN_MS - now);
}

/**
 * Called when the app returns to the foreground: regenerate spins and
 * simulate what rivals did to the player's island while they were away.
 */
export function catchUp(state: GameState, now: number, rng: Rng): GameState {
  let s = regenSpins(state, now);
  const away = now - s.lastSeenAt;
  if (away >= INCOMING.minAwayMs) {
    const hours = Math.min(24, away / 3_600_000);
    const events: ('attack' | 'raid')[] = [];
    const rolls = Math.max(1, Math.ceil(hours));
    const scale = hours / rolls; // partial hours count proportionally
    for (let h = 0; h < rolls && events.length < INCOMING.maxEvents; h++) {
      if (rng() < INCOMING.attackChancePerHour * scale) events.push('attack');
      if (events.length < INCOMING.maxEvents && rng() < INCOMING.raidChancePerHour * scale) events.push('raid');
    }
    s = { ...s, rivals: progressRivals(s.rivals, hours, rng) };
    for (const ev of events) {
      const rivalIdx = randInt(0, s.rivals.length - 1, rng);
      const rival = s.rivals[rivalIdx];
      const rivals = s.rivals.slice();
      rivals[rivalIdx] = { ...rival, revenge: true };
      s = { ...s, rivals };
      if (ev === 'attack') {
        if (s.shields > 0) {
          s = pushLog({ ...s, shields: s.shields - 1 }, { kind: 'incomingAttack', at: now, rivalName: rival.name, blocked: true, buildingIndex: null });
        } else {
          const b = randomDamageTarget(s.buildings, s.damaged, rng);
          const damaged = s.damaged.slice();
          if (b !== null) damaged[b] = true;
          s = pushLog({ ...s, damaged }, { kind: 'incomingAttack', at: now, rivalName: rival.name, blocked: false, buildingIndex: b });
        }
      } else {
        const pct = INCOMING.raidStealMin + rng() * (INCOMING.raidStealMax - INCOMING.raidStealMin);
        const stolen = Math.floor(s.coins * pct);
        s = pushLog({ ...s, coins: s.coins - stolen }, { kind: 'incomingRaid', at: now, rivalName: rival.name, coins: stolen });
      }
    }
  }
  return { ...s, lastSeenAt: now };
}

export function touch(state: GameState, now: number): GameState {
  return { ...state, lastSeenAt: now };
}

// ── Playing a chain ──────────────────────────────────────────────

export function canPlay(state: GameState): boolean {
  return state.pending === null && state.spins >= 1 && state.justCompletedIsland === null;
}

/**
 * Collect a chain of same-weather tiles. Costs one energy.
 * Sun pays coins; wind, lightning and rain fill their meters, and a full
 * meter opens its action (raid, attack, shield). Long chains leave a storm
 * cloud behind — but too many storm clouds turn on the player.
 */
export function playChain(state: GameState, path: Cell[], rng: Rng, now: number): { state: GameState; result: ChainResult } | null {
  let s = regenSpins(state, now);
  if (!canPlay(s) || !isValidChain(s.board, path)) return null;

  const kind = s.board.tiles[path[0].r][path[0].c].kind as WeatherKind;
  const value = chainValue(path.length);
  const scale = islandScale(s.islandIndex);
  const wasFull = s.spins >= MAX_SPINS;
  s = { ...s, spins: s.spins - 1, totalSpins: s.totalSpins + 1, lastSeenAt: now, meters: { ...s.meters } };
  if (wasFull) s.regenAnchor = now;

  const result: ChainResult = {
    kind,
    length: path.length,
    coinsWon: 0,
    sailsAdded: 0,
    cannonsAdded: 0,
    rainAdded: 0,
    shieldWon: false,
    raidReady: false,
    attackReady: false,
    stormSpawned: false,
    backfire: null,
  };

  switch (kind) {
    case 'sun':
      result.coinsWon = Math.round(REWARD.sunCoin * value * scale);
      break;
    case 'wind':
      result.sailsAdded = value;
      s.meters.sails += value;
      if (s.meters.sails >= METER_MAX.sails) {
        s.meters.sails -= METER_MAX.sails;
        const rival = s.rivals[randInt(0, s.rivals.length - 1, rng)];
        const base = REWARD.raidBase * scale;
        s.pending = {
          type: 'raid',
          rivalId: rival.id,
          bet: 1,
          spots: shuffle(REWARD.raidSpots, rng).map((m) => Math.round(base * m)),
          dug: [],
        };
        result.raidReady = true;
      }
      break;
    case 'bolt':
      result.cannonsAdded = value;
      s.meters.cannons += value;
      if (s.meters.cannons >= METER_MAX.cannons) {
        s.meters.cannons -= METER_MAX.cannons;
        s.pending = { type: 'attack', targetIds: pickTargets(s.rivals, 3, rng), bet: 1 };
        result.attackReady = true;
      }
      break;
    case 'rain':
      result.rainAdded = value;
      s.meters.rain += value;
      while (s.meters.rain >= METER_MAX.rain) {
        s.meters.rain -= METER_MAX.rain;
        if (s.shields < MAX_SHIELDS) {
          s.shields += 1;
          result.shieldWon = true;
        } else {
          result.coinsWon += Math.round(REWARD.rainOverflow * scale);
        }
      }
      break;
  }
  s.coins += result.coinsWon;

  // Remove the chain; a long chain leaves a storm cloud where it ended.
  const spawn = path.length >= STORM_CHAIN ? { cell: path[path.length - 1], kind: 'storm' as const } : undefined;
  s.board = collapse(s.board, path, rng, spawn);
  result.stormSpawned = !!spawn;

  if (spawn && countKind(s.board, 'storm') >= STORM_BACKFIRE) {
    const b = randomDamageTarget(s.buildings, s.damaged, rng);
    if (b !== null) {
      s.damaged = s.damaged.slice();
      s.damaged[b] = true;
    }
    s.board = clearKind(s.board, 'storm', rng);
    result.backfire = { buildingIndex: b };
    s = pushLog(s, { kind: 'backfire', at: now, buildingIndex: b });
  }

  return { state: s, result };
}

// ── Attack (cannon) ──────────────────────────────────────────────

export function attack(
  state: GameState,
  rivalId: string,
  buildingIndex: number,
  rng: Rng,
  now: number,
): { state: GameState; coins: number; blocked: boolean } | null {
  const p = state.pending;
  if (!p || p.type !== 'attack' || !p.targetIds.includes(rivalId)) return null;
  const idx = state.rivals.findIndex((r) => r.id === rivalId);
  const rival = state.rivals[idx];
  if (!rival || rival.buildings[buildingIndex] <= 0) return null;

  const scale = islandScale(state.islandIndex);
  let coins = REWARD.attack * scale * p.bet;
  let updated: Rival = { ...rival, buildings: rival.buildings.slice(), damaged: rival.damaged.slice() };
  const blocked = rival.shields > 0;
  if (blocked) {
    updated.shields -= 1;
    coins *= REWARD.attackBlockedFactor;
  } else if (updated.damaged[buildingIndex]) {
    updated.buildings[buildingIndex] -= 1;
    if (updated.buildings[buildingIndex] === 0) updated.damaged[buildingIndex] = false;
  } else {
    updated.damaged[buildingIndex] = true;
  }
  if (rival.revenge) {
    coins *= REWARD.revengeFactor;
    updated.revenge = false;
  }
  updated = ensureRivalBuilt(updated, rng);
  coins = Math.round(coins);

  const rivals = state.rivals.slice();
  rivals[idx] = updated;
  const s = pushLog(
    { ...state, rivals, coins: state.coins + coins, pending: null },
    { kind: 'attack', at: now, rivalName: rival.name, coins, blocked },
  );
  return { state: s, coins, blocked };
}

// ── Raid (treasure map) ──────────────────────────────────────────

export function dig(state: GameState, spot: number, now: number): { state: GameState; coins: number } | null {
  const p = state.pending;
  if (!p || p.type !== 'raid') return null;
  if (p.dug.includes(spot) || p.dug.length >= REWARD.raidDigs || spot < 0 || spot >= p.spots.length) return null;
  const coins = p.spots[spot];
  let s: GameState = { ...state, coins: state.coins + coins, pending: { ...p, dug: [...p.dug, spot] } };
  if (p.dug.length + 1 >= REWARD.raidDigs) {
    const rival = state.rivals.find((r) => r.id === p.rivalId);
    const total = [...p.dug, spot].reduce((sum, i) => sum + p.spots[i], 0);
    s = pushLog(s, { kind: 'raid', at: now, rivalName: rival?.name ?? '?', coins: total });
  }
  return { state: s, coins };
}

export function raidFinished(state: GameState): boolean {
  return state.pending?.type === 'raid' && state.pending.dug.length >= REWARD.raidDigs;
}

export function closeRaid(state: GameState): GameState {
  if (!raidFinished(state)) return state;
  return { ...state, pending: null };
}

// ── Storm clouds ─────────────────────────────────────────────────

/** Storm power = storm clouds currently on the board. */
export function stormPower(state: GameState): number {
  return countKind(state.board, 'storm');
}

export function stormReward(state: GameState, power = stormPower(state)): number {
  return Math.round(REWARD.storm * islandScale(state.islandIndex) * Math.pow(2, Math.max(0, power - 1)));
}

/** Tapping a storm cloud: pick a rival to send the storm to. */
export function prepareStorm(state: GameState, rng: Rng): GameState {
  const power = stormPower(state);
  if (power === 0 || state.pending) return state;
  return { ...state, pending: { type: 'storm', targetIds: pickTargets(state.rivals, 3, rng), power } };
}

export function cancelStorm(state: GameState): GameState {
  return state.pending?.type === 'storm' ? { ...state, pending: null } : state;
}

/** Storms ignore shields: they always damage a building. All storm clouds are used up. */
export function unleashStorm(
  state: GameState,
  rivalId: string,
  rng: Rng,
  now: number,
): { state: GameState; coins: number } | null {
  const p = state.pending;
  if (!p || p.type !== 'storm' || !p.targetIds.includes(rivalId)) return null;
  const power = stormPower(state);
  if (power === 0) return null;
  const idx = state.rivals.findIndex((r) => r.id === rivalId);
  const rival = state.rivals[idx];
  let coins = stormReward(state, power);
  if (rival.revenge) coins = Math.round(coins * REWARD.revengeFactor);

  const updated: Rival = { ...rival, damaged: rival.damaged.slice(), revenge: false };
  const b = randomDamageTarget(rival.buildings, rival.damaged, rng);
  if (b !== null) updated.damaged[b] = true;

  const rivals = state.rivals.slice();
  rivals[idx] = updated;
  const s = pushLog(
    { ...state, rivals, coins: state.coins + coins, pending: null, board: clearKind(state.board, 'storm', rng) },
    { kind: 'storm', at: now, rivalName: rival.name, coins, power },
  );
  return { state: s, coins };
}

// ── Building ─────────────────────────────────────────────────────

export function build(state: GameState, b: number, now: number): GameState | null {
  if (state.damaged[b]) return null;
  const cost = nextBuildCost(state, b);
  if (cost === null || state.coins < cost) return null;
  const buildings = state.buildings.slice();
  buildings[b] += 1;
  return completeIslandIfDone({ ...state, coins: state.coins - cost, buildings }, now);
}

export function repair(state: GameState, b: number, now: number): GameState | null {
  if (!state.damaged[b]) return null;
  const cost = repairCost(state, b);
  if (state.coins < cost) return null;
  const damaged = state.damaged.slice();
  damaged[b] = false;
  return completeIslandIfDone({ ...state, coins: state.coins - cost, damaged }, now);
}

function completeIslandIfDone(state: GameState, now: number): GameState {
  if (!isIslandComplete(state.buildings, state.damaged)) return state;
  const done = state.islandIndex;
  const next = done + 1;
  const s: GameState = {
    ...state,
    islandIndex: next,
    buildings: Array(BUILDINGS_PER_ISLAND).fill(0),
    damaged: Array(BUILDINGS_PER_ISLAND).fill(false),
    spins: state.spins + REWARD.islandCompleteSpins,
    justCompletedIsland: done,
    // Keep rivals roughly level with the player.
    rivals: state.rivals.map((r) =>
      r.islandIndex < next - 1 ? { ...r, islandIndex: next - 1 + (r.id.charCodeAt(1) % 3) } : r,
    ),
  };
  return pushLog(s, { kind: 'islandComplete', at: now, islandIndex: done });
}

export function dismissIslandComplete(state: GameState): GameState {
  return { ...state, justCompletedIsland: null };
}

export function markLogRead(state: GameState): GameState {
  return state.unread === 0 ? state : { ...state, unread: 0 };
}

/** Validate a loaded save; returns null if it is unusable. */
export function migrate(raw: unknown): GameState | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Partial<GameState>;
  if (s.version !== SAVE_VERSION) return null;
  if (!Array.isArray(s.buildings) || s.buildings.length !== BUILDINGS_PER_ISLAND) return null;
  return s as GameState;
}

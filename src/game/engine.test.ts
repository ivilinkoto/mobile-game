/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { collapse, countKind, createBoard, findLongestChain, hasMove, isValidChain } from './board.ts';
import { BOARD_COLS, BOARD_ROWS, MAX_BUILDING_LEVEL, MAX_SPINS, METER_MAX, REWARD, SPIN_REGEN_MS, STORM_BACKFIRE } from './config.ts';
import {
  attack,
  build,
  buildingCost,
  catchUp,
  closeRaid,
  createInitialState,
  dig,
  playChain,
  prepareStorm,
  regenSpins,
  repair,
  stormPower,
  unleashStorm,
} from './engine.ts';
import { seededRng } from './rng.ts';
import type { Board, Cell, GameState, TileKind } from './types.ts';

const T0 = 1_700_000_000_000;

function fresh(seed = 1): GameState {
  return createInitialState(T0, seededRng(seed));
}

/** Board where every tile is `fill`, with optional overrides. */
function boardOf(fill: TileKind, overrides: [number, number, TileKind][] = []): Board {
  let id = 1;
  const tiles = Array.from({ length: BOARD_ROWS }, () => Array.from({ length: BOARD_COLS }, () => ({ id: id++, kind: fill })));
  for (const [r, c, k] of overrides) tiles[r][c] = { id: id++, kind: k };
  return { tiles, nextId: id };
}

const row = (r: number, from: number, len: number): Cell[] => Array.from({ length: len }, (_, i) => ({ r, c: from + i }));

test('a new board always has a move and the right size', () => {
  for (let seed = 1; seed < 30; seed++) {
    const b = createBoard(seededRng(seed));
    assert.equal(b.tiles.length, BOARD_ROWS);
    assert.ok(b.tiles.every((r) => r.length === BOARD_COLS));
    assert.ok(hasMove(b));
  }
});

test('chains must be 3+, adjacent (diagonals ok), unique and one weather', () => {
  const b = boardOf('sun', [[0, 3, 'rain']]);
  assert.ok(isValidChain(b, row(1, 0, 3)));
  assert.ok(isValidChain(b, [{ r: 0, c: 0 }, { r: 1, c: 1 }, { r: 2, c: 2 }]));
  assert.ok(!isValidChain(b, row(1, 0, 2)), 'too short');
  assert.ok(!isValidChain(b, [{ r: 0, c: 0 }, { r: 0, c: 2 }, { r: 0, c: 1 }]), 'gap');
  assert.ok(!isValidChain(b, [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 0 }]), 'repeat');
  assert.ok(!isValidChain(b, row(0, 1, 3)), 'mixed weather');
});

test('collapse removes tiles, drops the rest and refills to a full board', () => {
  const rng = seededRng(2);
  const b = boardOf('sun', [[0, 0, 'rain']]);
  const out = collapse(b, [{ r: 5, c: 0 }, { r: 4, c: 0 }], rng);
  assert.equal(out.tiles[2][0].kind, 'rain', 'tile from row 0 fell two rows');
  assert.ok(out.tiles.every((r) => r.length === BOARD_COLS && r.every((t) => t && t.kind)));
});

test('sunshine pays coins and costs one energy', () => {
  const s0 = { ...fresh(), board: boardOf('sun') };
  const r = playChain(s0, row(0, 0, 4), seededRng(3), T0)!;
  assert.equal(r.result.kind, 'sun');
  assert.ok(r.result.coinsWon > 0);
  assert.equal(r.state.coins, s0.coins + r.result.coinsWon);
  assert.equal(r.state.spins, s0.spins - 1);
});

test('wind fills the sails and opens a raid when full', () => {
  let s: GameState = { ...fresh(), board: boardOf('wind'), meters: { sails: METER_MAX.sails - 3, cannons: 0, rain: 0 } };
  const r = playChain(s, row(0, 0, 3), seededRng(4), T0)!;
  assert.ok(r.result.raidReady);
  assert.equal(r.state.pending?.type, 'raid');
  s = r.state;
  for (let i = 0; i < REWARD.raidDigs; i++) s = dig(s, i, T0)!.state;
  assert.equal(dig(s, 3, T0), null);
  assert.equal(closeRaid(s).pending, null);
});

test('lightning fills the cannons and opens an attack; shields block', () => {
  const rng = seededRng(5);
  const s0: GameState = { ...fresh(), board: boardOf('bolt'), meters: { sails: 0, cannons: METER_MAX.cannons - 1, rain: 0 } };
  const r = playChain(s0, row(2, 0, 3), rng, T0)!;
  assert.equal(r.state.pending?.type, 'attack');
  const id = (r.state.pending as { targetIds: string[] }).targetIds[0];
  const s = { ...r.state, rivals: r.state.rivals.map((x) => (x.id === id ? { ...x, shields: 1, buildings: [1, 1, 1, 1, 1], revenge: false } : x)) };
  const a = attack(s, id, 0, rng, T0)!;
  assert.equal(a.blocked, true);
  assert.equal(a.coins, Math.round(REWARD.attack * REWARD.attackBlockedFactor));
});

test('rain becomes a shield', () => {
  const s0: GameState = { ...fresh(), shields: 0, board: boardOf('rain'), meters: { sails: 0, cannons: 0, rain: METER_MAX.rain - 3 } };
  const r = playChain(s0, row(0, 0, 3), seededRng(6), T0)!;
  assert.ok(r.result.shieldWon);
  assert.equal(r.state.shields, 1);
});

test('long chains leave a storm cloud; the storm can be unleashed and ignores shields', () => {
  const rng = seededRng(7);
  let s: GameState = { ...fresh(), board: boardOf('sun') };
  s = { ...s, rivals: s.rivals.map((x) => ({ ...x, shields: 3, buildings: [2, 2, 2, 2, 2], damaged: Array(5).fill(false) })) };
  const r = playChain(s, row(0, 0, 6), rng, T0)!;
  assert.ok(r.result.stormSpawned);
  assert.equal(stormPower(r.state), 1);
  s = prepareStorm(r.state, rng);
  assert.equal(s.pending?.type, 'storm');
  const id = (s.pending as { targetIds: string[] }).targetIds[0];
  const u = unleashStorm(s, id, rng, T0)!;
  assert.equal(u.coins, REWARD.storm);
  assert.equal(stormPower(u.state), 0);
  assert.ok(u.state.rivals.find((x) => x.id === id)!.damaged.some(Boolean));
});

test('too many storm clouds backfire on your own island', () => {
  const storms: [number, number, TileKind][] = Array.from({ length: STORM_BACKFIRE - 1 }, (_, i) => [5, i, 'storm']);
  const s0: GameState = { ...fresh(), buildings: [1, 1, 1, 1, 1], board: boardOf('sun', storms) };
  const r = playChain(s0, row(0, 0, 6), seededRng(8), T0)!;
  assert.ok(r.result.backfire);
  assert.equal(countKind(r.state.board, 'storm'), 0);
  assert.ok(r.state.damaged.some(Boolean));
});

test('no energy, no move; invalid chains are refused', () => {
  const s0 = { ...fresh(), board: boardOf('sun'), spins: 0 };
  assert.equal(playChain(s0, row(0, 0, 3), seededRng(9), T0), null);
  assert.equal(playChain({ ...s0, spins: 5 }, row(0, 0, 2), seededRng(9), T0), null);
});

test('energy regenerates over time and caps at max', () => {
  let s = { ...fresh(), spins: 10, regenAnchor: T0 };
  s = regenSpins(s, T0 + SPIN_REGEN_MS * 3 + 1000);
  assert.equal(s.spins, 13);
  s = regenSpins(s, T0 + SPIN_REGEN_MS * 1000);
  assert.equal(s.spins, MAX_SPINS);
});

test('finishing an island moves to the next one', () => {
  let s: GameState = { ...fresh(), coins: 10_000_000 };
  for (let b = 0; b < 5; b++) for (let l = 0; l < MAX_BUILDING_LEVEL; l++) s = build(s, b, T0)!;
  assert.equal(s.islandIndex, 1);
  assert.equal(s.justCompletedIsland, 0);
  assert.ok(buildingCost(1, 0, 1) > buildingCost(0, 0, 1));
});

test('damaged buildings must be repaired first', () => {
  let s: GameState = { ...fresh(), coins: 100_000, buildings: [1, 0, 0, 0, 0], damaged: [true, false, false, false, false] };
  assert.equal(build(s, 0, T0), null);
  s = repair(s, 0, T0)!;
  assert.ok(build(s, 0, T0));
});

test('long absence: at most a few incoming events, attackers marked for revenge', () => {
  let s: GameState = { ...fresh(), shields: 0, buildings: [3, 3, 3, 3, 3], coins: 10_000 };
  s = catchUp(s, T0 + 20 * 3_600_000, seededRng(10));
  assert.ok(s.log.length <= 3);
  if (s.log.length > 0) assert.ok(s.rivals.some((r) => r.revenge));
});

test('thousands of bot moves never break invariants', () => {
  const rng = seededRng(11);
  let s = fresh();
  for (let i = 0; i < 3000; i++) {
    s = { ...s, spins: 50 };
    const path = findLongestChain(s.board, 7);
    const r = playChain(s, path, rng, T0);
    assert.ok(r, 'board always has a move');
    s = r.state;
    assert.ok(s.coins >= 0 && s.shields >= 0 && s.shields <= 3);
    assert.ok(countKind(s.board, 'storm') < STORM_BACKFIRE);
    if (s.pending?.type === 'attack') {
      const rival = s.rivals.find((x) => x.id === (s.pending as { targetIds: string[] }).targetIds[0])!;
      s = attack(s, rival.id, rival.buildings.findIndex((l) => l > 0), rng, T0)!.state;
    } else if (s.pending?.type === 'raid') {
      for (let d = 0; d < REWARD.raidDigs; d++) s = dig(s, d, T0)!.state;
      s = closeRaid(s);
    }
  }
});

/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { MAX_BUILDING_LEVEL, MAX_SPINS, REWARD, SPIN_REGEN_MS, TUTORIAL_OUTCOMES } from './config.ts';
import {
  attack,
  build,
  buildingCost,
  catchUp,
  closeRaid,
  createInitialState,
  dig,
  prepareStorm,
  regenSpins,
  repair,
  spin,
  unleashStorm,
} from './engine.ts';
import { seededRng } from './rng.ts';
import type { GameState } from './types.ts';

const T0 = 1_700_000_000_000;

function fresh(seed = 1): GameState {
  return { ...createInitialState(T0, seededRng(seed)), tutorialStep: -1 };
}

test('spin costs the bet and is refused without spins', () => {
  const rng = seededRng(2);
  let s = { ...fresh(), bet: 3 };
  const r = spin(s, rng, T0);
  assert.ok(r);
  assert.ok(r.state.spins <= MAX_SPINS - 3 + REWARD.energyTriple * 3);
  s = { ...fresh(), spins: 2, bet: 3 };
  assert.equal(spin(s, rng, T0), null);
});

test('tutorial plays scripted outcomes then ends', () => {
  const rng = seededRng(3);
  let s = createInitialState(T0, rng);
  for (const expected of TUTORIAL_OUTCOMES) {
    const r = spin(s, rng, T0)!;
    assert.equal(r.result.outcome, expected);
    s = r.state;
    // resolve anything the tutorial opened so we can keep spinning
    if (s.pending?.type === 'attack') {
      const rival = s.rivals.find((x) => x.id === (s.pending as { targetIds: string[] }).targetIds[0])!;
      const b = rival.buildings.findIndex((l) => l > 0);
      s = attack(s, rival.id, b, rng, T0)!.state;
    } else if (s.pending?.type === 'raid') {
      for (let i = 0; i < REWARD.raidDigs; i++) s = dig(s, i, T0)!.state;
      s = closeRaid(s);
    }
  }
  assert.equal(s.tutorialStep, -1);
  assert.equal(s.pending, null);
});

test('spins regenerate over time and cap at max', () => {
  let s = { ...fresh(), spins: 10, regenAnchor: T0 };
  s = regenSpins(s, T0 + SPIN_REGEN_MS * 3 + 1000);
  assert.equal(s.spins, 13);
  assert.equal(s.regenAnchor, T0 + SPIN_REGEN_MS * 3);
  s = regenSpins(s, T0 + SPIN_REGEN_MS * 1000);
  assert.equal(s.spins, MAX_SPINS);
});

test('building and finishing an island advances to the next one', () => {
  let s: GameState = { ...fresh(), coins: 10_000_000 };
  for (let b = 0; b < 5; b++) {
    for (let l = 0; l < MAX_BUILDING_LEVEL; l++) s = build(s, b, T0)!;
  }
  assert.equal(s.islandIndex, 1);
  assert.equal(s.justCompletedIsland, 0);
  assert.deepEqual(s.buildings, [0, 0, 0, 0, 0]);
  assert.ok(buildingCost(1, 0, 1) > buildingCost(0, 0, 1));
});

test('cannot build a damaged building until repaired', () => {
  let s: GameState = { ...fresh(), coins: 100_000, buildings: [1, 0, 0, 0, 0], damaged: [true, false, false, false, false] };
  assert.equal(build(s, 0, T0), null);
  s = repair(s, 0, T0)!;
  assert.equal(s.damaged[0], false);
  assert.ok(build(s, 0, T0));
});

test('attack on shielded rival is blocked and pays less', () => {
  const rng = seededRng(4);
  let s = fresh();
  const target = { ...s.rivals[0], shields: 1, buildings: [1, 1, 1, 1, 1], revenge: false };
  s = { ...s, rivals: [target, ...s.rivals.slice(1)], pending: { type: 'attack', targetIds: [target.id], bet: 1 } };
  const r = attack(s, target.id, 0, rng, T0)!;
  assert.equal(r.blocked, true);
  assert.equal(r.coins, Math.round(REWARD.attack * REWARD.attackBlockedFactor));
  assert.equal(r.state.rivals[0].shields, 0);
  assert.equal(r.state.pending, null);
});

test('raid allows exactly the configured number of digs', () => {
  let s: GameState = { ...fresh(), pending: { type: 'raid', rivalId: 'r0', bet: 1, spots: [100, 200, 300, 400], dug: [] } };
  const before = s.coins;
  for (let i = 0; i < REWARD.raidDigs; i++) s = dig(s, i, T0)!.state;
  assert.equal(dig(s, 3, T0), null);
  assert.equal(s.coins, before + 600);
  assert.equal(closeRaid(s).pending, null);
});

test('storm front forms, can be unleashed and ignores shields', () => {
  const rng = seededRng(5);
  let s: GameState = { ...fresh(), storm: { charge: 0, ready: true, power: 3 } };
  s = { ...s, rivals: s.rivals.map((r) => ({ ...r, shields: 3, buildings: [2, 2, 2, 2, 2], damaged: Array(5).fill(false) })) };
  s = prepareStorm(s, rng);
  assert.equal(s.pending?.type, 'storm');
  const id = (s.pending as { targetIds: string[] }).targetIds[0];
  const r = unleashStorm(s, id, rng, T0)!;
  assert.equal(r.coins, REWARD.storm * 4);
  assert.equal(r.state.storm.ready, false);
  assert.ok(r.state.rivals.find((x) => x.id === id)!.damaged.some(Boolean));
});

test('long absence triggers at most the max incoming events and marks revenge', () => {
  const rng = seededRng(6);
  let s: GameState = { ...fresh(), shields: 0, buildings: [3, 3, 3, 3, 3], coins: 10_000 };
  s = catchUp(s, T0 + 20 * 3_600_000, rng);
  assert.ok(s.log.length <= 3);
  if (s.log.length > 0) assert.ok(s.rivals.some((r) => r.revenge));
  assert.equal(s.lastSeenAt, T0 + 20 * 3_600_000);
});

test('thousands of random spins never break invariants', () => {
  const rng = seededRng(7);
  let s = fresh();
  for (let i = 0; i < 5000; i++) {
    s = { ...s, spins: 50 };
    const r = spin(s, rng, T0);
    assert.ok(r);
    s = r.state;
    assert.ok(s.coins >= 0 && s.shields >= 0 && s.shields <= 3);
    assert.ok(s.storm.power <= 4);
    if (s.pending?.type === 'attack') {
      const rival = s.rivals.find((x) => x.id === (s.pending as { targetIds: string[] }).targetIds[0])!;
      s = attack(s, rival.id, rival.buildings.findIndex((l) => l > 0), rng, T0)!.state;
    } else if (s.pending?.type === 'raid') {
      for (let d = 0; d < REWARD.raidDigs; d++) s = dig(s, d, T0)!.state;
      s = closeRaid(s);
    }
  }
});

/// <reference types="node" />
// Economy simulator: a bot plays the sky board (always taking a long chain
// it can find), resolves attacks/raids immediately, unleashes storms at
// power 2 and builds the cheapest thing it can afford.
// Prints how many moves (and hours of free energy) each island takes.
//
//   npm run balance

import { findLongestChain } from '../src/game/board.ts';
import { MAX_BUILDING_LEVEL, REWARD, SPIN_REGEN_MS } from '../src/game/config.ts';
import {
  attack,
  build,
  closeRaid,
  createInitialState,
  dig,
  nextBuildCost,
  playChain,
  prepareStorm,
  repair,
  repairCost,
  stormPower,
  unleashStorm,
} from '../src/game/engine.ts';
import { seededRng } from '../src/game/rng.ts';
import type { GameState } from '../src/game/types.ts';

const ISLANDS = 5;
const RUNS = 60;

const totals: number[] = Array(ISLANDS).fill(0);
const lengths: number[] = [];
for (let run = 0; run < RUNS; run++) {
  const rng = seededRng(run + 1);
  let s: GameState = createInitialState(0, rng);
  let moves = 0;
  let lastIslandAt = 0;
  while (s.islandIndex < ISLANDS && moves < 20_000) {
    s = { ...s, spins: 50, justCompletedIsland: null };
    // a casual player: usually a medium chain, sometimes the longest one
    const path = findLongestChain(s.board, rng() < 0.3 ? 8 : 4);
    lengths.push(path.length);
    const r = playChain(s, path, rng, 0)!;
    moves++;
    s = r.state;
    if (s.pending?.type === 'attack') {
      const id = s.pending.targetIds[0];
      const rival = s.rivals.find((x) => x.id === id)!;
      s = attack(s, id, rival.buildings.findIndex((l) => l > 0), rng, 0)!.state;
    } else if (s.pending?.type === 'raid') {
      for (let d = 0; d < REWARD.raidDigs; d++) s = dig(s, d, 0)!.state;
      s = closeRaid(s);
    }
    if (stormPower(s) >= 2) {
      s = prepareStorm(s, rng);
      s = unleashStorm(s, (s.pending as { targetIds: string[] }).targetIds[0], rng, 0)!.state;
    }
    for (;;) {
      const island = s.islandIndex;
      const dmg = s.damaged.findIndex(Boolean);
      if (dmg >= 0) {
        if (s.coins < repairCost(s, dmg)) break;
        s = repair(s, dmg, 0)!;
      } else {
        let best = -1;
        let bestCost = Infinity;
        for (let b = 0; b < 5; b++) {
          const c = nextBuildCost(s, b);
          if (c !== null && c < bestCost && s.buildings[b] < MAX_BUILDING_LEVEL) {
            best = b;
            bestCost = c;
          }
        }
        if (best < 0 || s.coins < bestCost) break;
        s = build(s, best, 0)!;
      }
      if (s.islandIndex !== island) {
        if (island < ISLANDS) totals[island] += moves - lastIslandAt;
        lastIslandAt = moves;
      }
    }
  }
}

const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
console.log(`average chain length: ${avgLen.toFixed(1)}`);
console.log('Island | avg moves | hours of free energy');
for (let i = 0; i < ISLANDS; i++) {
  const avg = totals[i] / RUNS;
  console.log(`${String(i + 1).padStart(6)} | ${avg.toFixed(0).padStart(9)} | ${((avg * SPIN_REGEN_MS) / 3_600_000).toFixed(1)}`);
}

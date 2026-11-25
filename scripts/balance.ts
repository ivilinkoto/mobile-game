/// <reference types="node" />
// Economy simulator: plays a "greedy" bot that always spins at x1, resolves
// attacks/raids/storms immediately and builds the cheapest thing it can.
// Prints how many spins (and hours of free regen) each island takes.
//
//   npm run balance

import { MAX_BUILDING_LEVEL, REWARD, SPIN_REGEN_MS } from '../src/game/config.ts';
import {
  attack,
  build,
  closeRaid,
  createInitialState,
  dig,
  nextBuildCost,
  prepareStorm,
  repair,
  repairCost,
  spin,
  unleashStorm,
} from '../src/game/engine.ts';
import { seededRng } from '../src/game/rng.ts';
import type { GameState } from '../src/game/types.ts';

const ISLANDS = 5;
const RUNS = 200;

const totals: number[] = Array(ISLANDS).fill(0);
for (let run = 0; run < RUNS; run++) {
  const rng = seededRng(run + 1);
  let s: GameState = createInitialState(0, rng);
  let spinsUsed = 0;
  let lastIslandAt = 0;
  while (s.islandIndex < ISLANDS && spinsUsed < 100_000) {
    s = { ...s, spins: 50, justCompletedIsland: null };
    const r = spin(s, rng, 0)!;
    spinsUsed++;
    s = r.state;
    if (s.pending?.type === 'attack') {
      const id = s.pending.targetIds[0];
      const rival = s.rivals.find((x) => x.id === id)!;
      s = attack(s, id, rival.buildings.findIndex((l) => l > 0), rng, 0)!.state;
    } else if (s.pending?.type === 'raid') {
      for (let d = 0; d < REWARD.raidDigs; d++) s = dig(s, d, 0)!.state;
      s = closeRaid(s);
    }
    if (s.storm.ready && s.storm.power >= 2) {
      s = prepareStorm(s, rng);
      s = unleashStorm(s, (s.pending as { targetIds: string[] }).targetIds[0], rng, 0)!.state;
    }
    // spend coins: repairs first, then cheapest upgrade
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
        if (island < ISLANDS) totals[island] += spinsUsed - lastIslandAt;
        lastIslandAt = spinsUsed;
      }
    }
  }
}

console.log('Island | avg spins | hours of free regen');
for (let i = 0; i < ISLANDS; i++) {
  const avg = totals[i] / RUNS;
  console.log(`${String(i + 1).padStart(6)} | ${avg.toFixed(0).padStart(9)} | ${((avg * SPIN_REGEN_MS) / 3_600_000).toFixed(1)}`);
}

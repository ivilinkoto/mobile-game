// The sky board: a grid of weather tiles. The player drags through 3+
// neighbouring tiles of the same weather (diagonals count) to collect them.

import { BOARD_COLS, BOARD_ROWS, MIN_CHAIN, TILE_WEIGHTS } from './config.ts';
import { pickWeighted, shuffle } from './rng.ts';
import type { Board, Cell, Rng, TileKind, WeatherKind } from './types.ts';

export function cellAt(board: Board, c: Cell): TileKind | null {
  return board.tiles[c.r]?.[c.c]?.kind ?? null;
}

export function isAdjacent(a: Cell, b: Cell): boolean {
  const dr = Math.abs(a.r - b.r);
  const dc = Math.abs(a.c - b.c);
  return dr <= 1 && dc <= 1 && dr + dc > 0;
}

/** A path is a valid chain: in bounds, unique, adjacent steps, one weather kind, long enough. */
export function isValidChain(board: Board, path: Cell[]): boolean {
  if (path.length < MIN_CHAIN) return false;
  const kind = cellAt(board, path[0]);
  if (!kind || kind === 'storm') return false;
  const seen = new Set<string>();
  for (let i = 0; i < path.length; i++) {
    const p = path[i];
    if (cellAt(board, p) !== kind) return false;
    const key = `${p.r},${p.c}`;
    if (seen.has(key)) return false;
    seen.add(key);
    if (i > 0 && !isAdjacent(path[i - 1], p)) return false;
  }
  return true;
}

function newTile(board: Board, rng: Rng, kind?: TileKind) {
  const id = board.nextId;
  board.nextId += 1;
  return { id, kind: kind ?? pickWeighted(TILE_WEIGHTS, rng) };
}

export function createBoard(rng: Rng): Board {
  const board: Board = { tiles: [], nextId: 1 };
  for (let r = 0; r < BOARD_ROWS; r++) {
    const row = [];
    for (let c = 0; c < BOARD_COLS; c++) row.push(newTile(board, rng));
    board.tiles.push(row);
  }
  return ensureMoves(board, rng);
}

export function countKind(board: Board, kind: TileKind): number {
  let n = 0;
  for (const row of board.tiles) for (const t of row) if (t.kind === kind) n++;
  return n;
}

/**
 * Remove the given cells, let tiles fall down and refill from the top.
 * Optionally drop a special tile at `spawnAt` (it falls like the others).
 */
export function collapse(board: Board, remove: Cell[], rng: Rng, spawnAt?: { cell: Cell; kind: TileKind }): Board {
  const next: Board = { tiles: board.tiles.map((row) => row.slice()), nextId: board.nextId };
  const gone = new Set(remove.map((p) => `${p.r},${p.c}`));
  for (let c = 0; c < BOARD_COLS; c++) {
    const kept = [];
    for (let r = BOARD_ROWS - 1; r >= 0; r--) {
      if (spawnAt && spawnAt.cell.r === r && spawnAt.cell.c === c) {
        kept.push(newTile(next, rng, spawnAt.kind));
      } else if (!gone.has(`${r},${c}`)) {
        kept.push(next.tiles[r][c]);
      }
    }
    for (let r = BOARD_ROWS - 1, i = 0; r >= 0; r--, i++) {
      next.tiles[r][c] = i < kept.length ? kept[i] : newTile(next, rng);
    }
  }
  return ensureMoves(next, rng);
}

/** Remove every tile of a kind (used when a storm is unleashed or backfires). */
export function clearKind(board: Board, kind: TileKind, rng: Rng): Board {
  const cells: Cell[] = [];
  board.tiles.forEach((row, r) => row.forEach((t, c) => t.kind === kind && cells.push({ r, c })));
  return cells.length ? collapse(board, cells, rng) : board;
}

/** True when at least one chain of MIN_CHAIN exists. */
export function hasMove(board: Board): boolean {
  return findLongestChain(board, MIN_CHAIN).length >= MIN_CHAIN;
}

function ensureMoves(board: Board, rng: Rng): Board {
  let b = board;
  for (let attempt = 0; attempt < 20 && !hasMove(b); attempt++) {
    // reshuffle the weather tiles in place (storm tiles stay put)
    const weather = b.tiles.flat().filter((t) => t.kind !== 'storm');
    const mixed = shuffle(weather, rng);
    let i = 0;
    b = { ...b, tiles: b.tiles.map((row) => row.map((t) => (t.kind === 'storm' ? t : mixed[i++]))) };
  }
  return b;
}

/**
 * Depth-first search for a long chain (used by hints and the balance bot).
 * Stops as soon as it finds one of length `enough`.
 */
export function findLongestChain(board: Board, enough = Infinity): Cell[] {
  let best: Cell[] = [];
  const visit = (path: Cell[], kind: WeatherKind, seen: Set<string>, budget: { n: number }): boolean => {
    if (path.length > best.length) best = path.slice();
    if (best.length >= enough) return true;
    if (budget.n-- <= 0) return false; // give up on this start cell, keep searching others
    const last = path[path.length - 1];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const n = { r: last.r + dr, c: last.c + dc };
        const key = `${n.r},${n.c}`;
        if ((dr || dc) && !seen.has(key) && cellAt(board, n) === kind) {
          seen.add(key);
          path.push(n);
          const stop = visit(path, kind, seen, budget);
          path.pop();
          seen.delete(key);
          if (stop) return true;
        }
      }
    }
    return false;
  };
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const kind = board.tiles[r][c].kind;
      if (kind === 'storm') continue;
      if (visit([{ r, c }], kind, new Set([`${r},${c}`]), { n: 400 })) return best;
    }
  }
  return best;
}

export function weatherKinds(): WeatherKind[] {
  return Object.keys(TILE_WEIGHTS) as WeatherKind[];
}

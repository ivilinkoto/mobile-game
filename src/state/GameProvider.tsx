import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { AppState } from 'react-native';

import * as E from '../game/engine';
import { mathRng } from '../game/rng';
import type { Cell, ChainResult, GameState } from '../game/types';

const SAVE_KEY = 'storm-isles/save';

export interface GameActions {
  /** Play a chain on the sky board; null when it is not allowed. */
  playChain: (path: Cell[]) => ChainResult | null;
  build: (b: number) => boolean;
  repair: (b: number) => boolean;
  attack: (rivalId: string, building: number) => { coins: number; blocked: boolean } | null;
  dig: (spot: number) => number | null;
  closeRaid: () => void;
  prepareStorm: () => void;
  cancelStorm: () => void;
  unleashStorm: (rivalId: string) => number | null;
  dismissIslandComplete: () => void;
  markLogRead: () => void;
  resetGame: () => void;
}

/** Tiny external store: the single source of truth for the game state. */
function createGameStore() {
  let state: GameState | null = null;
  const listeners = new Set<() => void>();

  const get = () => state;
  const set = (next: GameState) => {
    if (next === state) return;
    state = next;
    listeners.forEach((l) => l());
  };
  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  };

  /** Run an engine step on the current state; commit it if it produced one. */
  function run<R>(fn: (s: GameState) => { state: GameState; value: R } | null): R | null {
    if (!state) return null;
    const out = fn(state);
    if (!out) return null;
    set(out.state);
    return out.value;
  }
  const just = (fn: (s: GameState) => GameState) => {
    run((s) => ({ state: fn(s), value: true }));
  };
  const wrap = (s: GameState | null) => (s ? { state: s, value: true } : null);

  const actions: GameActions = {
    playChain: (path) =>
      run((s) => {
        const r = E.playChain(s, path, mathRng, Date.now());
        return r ? { state: r.state, value: r.result } : null;
      }),
    build: (b) => !!run((s) => wrap(E.build(s, b, Date.now()))),
    repair: (b) => !!run((s) => wrap(E.repair(s, b, Date.now()))),
    attack: (id, b) =>
      run((s) => {
        const r = E.attack(s, id, b, mathRng, Date.now());
        return r ? { state: r.state, value: { coins: r.coins, blocked: r.blocked } } : null;
      }),
    dig: (spot) =>
      run((s) => {
        const r = E.dig(s, spot, Date.now());
        return r ? { state: r.state, value: r.coins } : null;
      }),
    closeRaid: () => just(E.closeRaid),
    prepareStorm: () => just((s) => E.prepareStorm(s, mathRng)),
    cancelStorm: () => just(E.cancelStorm),
    unleashStorm: (id) =>
      run((s) => {
        const r = E.unleashStorm(s, id, mathRng, Date.now());
        return r ? { state: r.state, value: r.coins } : null;
      }),
    dismissIslandComplete: () => just(E.dismissIslandComplete),
    markLogRead: () => just(E.markLogRead),
    resetGame: () => set(E.createInitialState(Date.now(), mathRng)),
  };

  return { get, set, subscribe, actions };
}

type GameStore = ReturnType<typeof createGameStore>;

const Ctx = createContext<GameStore | null>(null);

export function useGame(): GameActions & { state: GameState } {
  const store = useContext(Ctx);
  if (!store) throw new Error('useGame must be used inside <GameProvider>');
  const state = useSyncExternalStore(store.subscribe, store.get);
  if (!state) throw new Error('Game state not loaded');
  return { ...store.actions, state };
}

export function GameProvider({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const [store] = useState(createGameStore);
  const state = useSyncExternalStore(store.subscribe, store.get);

  // Load the save once (or start a new game).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let loaded: GameState | null = null;
      try {
        const raw = await AsyncStorage.getItem(SAVE_KEY);
        if (raw) loaded = E.migrate(JSON.parse(raw));
      } catch {
        loaded = null;
      }
      const now = Date.now();
      if (!cancelled) store.set(loaded ? E.catchUp(loaded, now, mathRng) : E.createInitialState(now, mathRng));
    })();
    return () => {
      cancelled = true;
    };
  }, [store]);

  // Save (debounced) on every change.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsub = store.subscribe(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const s = store.get();
        if (s) AsyncStorage.setItem(SAVE_KEY, JSON.stringify(s)).catch(() => {});
      }, 400);
    });
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, [store]);

  // Foreground / background handling and periodic spin regeneration.
  useEffect(() => {
    const update = (fn: (s: GameState, now: number) => GameState) => {
      const s = store.get();
      if (s) store.set(fn(s, Date.now()));
    };
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') update((s, now) => E.catchUp(s, now, mathRng));
      else update(E.touch);
    });
    const id = setInterval(() => update((s, now) => E.touch(E.regenSpins(s, now), now)), 15_000);
    return () => {
      sub.remove();
      clearInterval(id);
    };
  }, [store]);

  if (!state) return <>{fallback}</>;
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

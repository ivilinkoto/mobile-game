import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import * as E from '../game/engine';
import { mathRng } from '../game/rng';
import type { GameState, SpinResult } from '../game/types';

const SAVE_KEY = 'storm-isles/save';

export interface SpinTicket {
  result: SpinResult;
  /** Apply the spin's state once the reel animation has finished. */
  commit: () => void;
}

interface GameApi {
  state: GameState;
  spin: () => SpinTicket | null;
  cycleBet: () => void;
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

const Ctx = createContext<GameApi | null>(null);

export function useGame(): GameApi {
  const api = useContext(Ctx);
  if (!api) throw new Error('useGame must be used inside <GameProvider>');
  return api;
}

export function GameProvider({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const [state, setState] = useState<GameState | null>(null);
  const stateRef = useRef<GameState | null>(null);
  stateRef.current = state;

  // Load once.
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
      const s = loaded ? E.catchUp(loaded, now, mathRng) : E.createInitialState(now, mathRng);
      if (!cancelled) setState(s);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Save (debounced) whenever state changes.
  useEffect(() => {
    if (!state) return;
    const id = setTimeout(() => {
      AsyncStorage.setItem(SAVE_KEY, JSON.stringify(state)).catch(() => {});
    }, 400);
    return () => clearTimeout(id);
  }, [state]);

  // Foreground / background handling and periodic regen.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const now = Date.now();
      if (next === 'active') setState((s) => (s ? E.catchUp(s, now, mathRng) : s));
      else setState((s) => (s ? E.touch(s, now) : s));
    });
    const id = setInterval(() => {
      setState((s) => (s ? E.touch(E.regenSpins(s, Date.now()), Date.now()) : s));
    }, 15_000);
    return () => {
      sub.remove();
      clearInterval(id);
    };
  }, []);

  /** Run an engine call against the latest state; commit if it returned a state. */
  const apply = useCallback(<R,>(fn: (s: GameState) => { state: GameState; value: R } | null): R | null => {
    const cur = stateRef.current;
    if (!cur) return null;
    const out = fn(cur);
    if (!out) return null;
    stateRef.current = out.state;
    setState(out.state);
    return out.value;
  }, []);

  const api = useMemo<GameApi | null>(() => {
    if (!state) return null;
    return {
      state,
      spin: () => {
        const cur = stateRef.current;
        if (!cur) return null;
        const out = E.spin(cur, mathRng, Date.now());
        if (!out) return null;
        // Deduct the spin immediately so double taps can't spin twice.
        const locked: GameState = { ...cur, spins: cur.spins - cur.bet, pending: cur.pending };
        stateRef.current = locked;
        setState(locked);
        return {
          result: out.result,
          commit: () => {
            stateRef.current = out.state;
            setState(out.state);
          },
        };
      },
      cycleBet: () => apply((s) => ({ state: E.cycleBet(s), value: true })),
      build: (b) => !!apply((s) => wrap(E.build(s, b, Date.now()))),
      repair: (b) => !!apply((s) => wrap(E.repair(s, b, Date.now()))),
      attack: (id, b) =>
        apply((s) => {
          const r = E.attack(s, id, b, mathRng, Date.now());
          return r ? { state: r.state, value: { coins: r.coins, blocked: r.blocked } } : null;
        }),
      dig: (spot) =>
        apply((s) => {
          const r = E.dig(s, spot, Date.now());
          return r ? { state: r.state, value: r.coins } : null;
        }),
      closeRaid: () => apply((s) => ({ state: E.closeRaid(s), value: true })),
      prepareStorm: () => apply((s) => ({ state: E.prepareStorm(s, mathRng), value: true })),
      cancelStorm: () => apply((s) => ({ state: E.cancelStorm(s), value: true })),
      unleashStorm: (id) =>
        apply((s) => {
          const r = E.unleashStorm(s, id, mathRng, Date.now());
          return r ? { state: r.state, value: r.coins } : null;
        }),
      dismissIslandComplete: () => apply((s) => ({ state: E.dismissIslandComplete(s), value: true })),
      markLogRead: () => apply((s) => ({ state: E.markLogRead(s), value: true })),
      resetGame: () => apply(() => ({ state: E.createInitialState(Date.now(), mathRng), value: true })),
    };
  }, [state, apply]);

  if (!api) return <>{fallback}</>;
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

function wrap(s: GameState | null) {
  return s ? { state: s, value: true } : null;
}

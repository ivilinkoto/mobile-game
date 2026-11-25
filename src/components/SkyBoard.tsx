// The sky board: drag through 3+ matching weather clouds to collect them.
// Tiles keep stable ids, so after a chain the survivors fall and new clouds
// drop in from above with a bounce.

import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Animated, Easing, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polyline } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { TileIcon } from '../art/Icons';
import { isAdjacent } from '../game/board';
import { BOARD_COLS, BOARD_ROWS, MIN_CHAIN, STORM_BACKFIRE } from '../game/config';
import type { Board, Cell, TileKind } from '../game/types';
import { GameText } from '../ui/GameText';

const TILE_BG: Record<TileKind, [string, string]> = {
  sun: ['#fff1b8', '#ffd36b'],
  wind: ['#e3fbf6', '#a6e9dc'],
  bolt: ['#e4dcff', '#b3a3f0'],
  rain: ['#cfe8ff', '#6fb3ef'],
  storm: ['#7d5cf0', '#3b1f99'],
};
const LINE: Record<TileKind, string> = {
  sun: '#ff9f1c',
  wind: '#1aa39a',
  bolt: '#6a3fe0',
  rain: '#1572c9',
  storm: '#6a3fe0',
};

interface Props {
  board: Board;
  width: number;
  disabled: boolean;
  /** Path of a suggested chain to pulse (first-time hint), or null. */
  hint: Cell[] | null;
  onChain: (path: Cell[]) => void;
  onStormTap: () => void;
  /** Rough preview of what the current chain would give, e.g. "+330". */
  preview: (kind: TileKind, length: number) => string;
}

export function SkyBoard({ board, width, disabled, hint, onChain, onStormTap, preview }: Props) {
  const pad = 6;
  const cell = Math.floor((width - pad * 2) / BOARD_COLS);
  const inner = cell * BOARD_COLS;

  const [path, setPath] = useState<Cell[]>([]);
  const [anims] = useState(() => new Map<number, { y: Animated.Value }>());
  const [hintPulse] = useState(() => new Animated.Value(0));
  const origin = useRef({ x: 0, y: 0 });
  const boxRef = useRef<ComponentRef<typeof View>>(null);

  // Latest values for the gesture handlers (created once).
  const live = useRef({ board, cell, disabled, path, onChain, onStormTap });
  useEffect(() => {
    live.current = { board, cell, disabled, path, onChain, onStormTap };
  });

  // Animate tiles into their rows whenever the board changes.
  const prevIds = useRef<Set<number> | null>(null);
  useEffect(() => {
    const known = prevIds.current ?? new Set<number>();
    const nowIds = new Set<number>();
    for (let c = 0; c < BOARD_COLS; c++) {
      let newInColumn = 0;
      for (let r = 0; r < BOARD_ROWS; r++) if (!known.has(board.tiles[r][c].id)) newInColumn++;
      for (let r = 0; r < BOARD_ROWS; r++) {
        const tile = board.tiles[r][c];
        nowIds.add(tile.id);
        const a = anims.get(tile.id);
        if (!a) continue;
        const target = r * cell;
        // new clouds (and the whole board on first show) drop in from above
        if (!known.has(tile.id)) a.y.setValue((r - newInColumn) * cell - cell * 0.5);
        Animated.timing(a.y, {
          toValue: target,
          duration: 260 + r * 25,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }).start();
      }
    }
    for (const id of anims.keys()) if (!nowIds.has(id)) anims.delete(id);
    prevIds.current = nowIds;
  }, [board, cell, anims]);

  // Pulse the hint chain.
  useEffect(() => {
    if (!hint) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(hintPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(hintPulse, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [hint, hintPulse]);

  // Touch handling (plain responder props; handlers read the latest values from `live`).
  const cellFromEvent = (e: GestureResponderEvent): Cell | null => {
    const { cell: size } = live.current;
    const x = e.nativeEvent.pageX - origin.current.x;
    const y = e.nativeEvent.pageY - origin.current.y;
    const c = Math.floor(x / size);
    const r = Math.floor(y / size);
    if (r < 0 || r >= BOARD_ROWS || c < 0 || c >= BOARD_COLS) return null;
    // only count touches near the centre, so diagonals are easy to hit
    const dx = x - (c + 0.5) * size;
    const dy = y - (r + 0.5) * size;
    if (Math.hypot(dx, dy) > size * 0.46) return null;
    return { r, c };
  };
  const kindAt = (p: Cell) => live.current.board.tiles[p.r][p.c].kind;

  const touch = {
    onStartShouldSetResponder: () => !live.current.disabled,
    onMoveShouldSetResponder: () => !live.current.disabled,
    onResponderTerminationRequest: () => false,
    onResponderGrant: (e: GestureResponderEvent) => {
      boxRef.current?.measureInWindow((x, y) => {
        origin.current = { x: x + pad, y: y + pad };
      });
      const p = cellFromEvent(e);
      if (!p) return;
      Haptics.selectionAsync().catch(() => {});
      setPath([p]);
      live.current.path = [p];
    },
    onResponderMove: (e: GestureResponderEvent) => {
      const p = cellFromEvent(e);
      const cur = live.current.path;
      if (!p || cur.length === 0) return;
      const last = cur[cur.length - 1];
      if (p.r === last.r && p.c === last.c) return;
      const before = cur[cur.length - 2];
      let next: Cell[] | null = null;
      if (before && before.r === p.r && before.c === p.c) {
        next = cur.slice(0, -1); // drag back = undo
      } else if (
        kindAt(cur[0]) !== 'storm' &&
        isAdjacent(last, p) &&
        kindAt(p) === kindAt(cur[0]) &&
        !cur.some((q) => q.r === p.r && q.c === p.c)
      ) {
        next = [...cur, p];
      }
      if (next) {
        Haptics.selectionAsync().catch(() => {});
        live.current.path = next;
        setPath(next);
      }
    },
    onResponderRelease: () => {
      const cur = live.current.path;
      live.current.path = [];
      setPath([]);
      if (cur.length === 1 && kindAt(cur[0]) === 'storm') {
        live.current.onStormTap();
      } else if (cur.length >= MIN_CHAIN) {
        live.current.onChain(cur);
      } else if (cur.length > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }
    },
    onResponderTerminate: () => {
      live.current.path = [];
      setPath([]);
    },
  };

  const selected = useMemo(() => new Set(path.map((p) => `${p.r},${p.c}`)), [path]);
  const hinted = useMemo(() => new Set((hint ?? []).map((p) => `${p.r},${p.c}`)), [hint]);
  const chainKind = path.length ? board.tiles[path[0].r][path[0].c].kind : null;
  const storms = board.tiles.flat().filter((t) => t.kind === 'storm').length;
  const danger = storms >= STORM_BACKFIRE - 1;

  const tiles = [];
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const tile = board.tiles[r][c];
      let a = anims.get(tile.id);
      if (!a) {
        a = { y: new Animated.Value(-cell * 2) }; // positioned by the effect above
        anims.set(tile.id, a);
      }
      const key = `${r},${c}`;
      const isSel = selected.has(key);
      const isHint = !path.length && hinted.has(key);
      tiles.push(
        <Animated.View
          key={tile.id}
          style={[
            styles.tile,
            {
              width: cell,
              height: cell,
              left: c * cell,
              transform: [
                { translateY: a.y },
                {
                  scale: isSel
                    ? 1.12
                    : isHint
                      ? hintPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] })
                      : 1,
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={TILE_BG[tile.kind]}
            style={[styles.tileFace, { borderRadius: cell * 0.24 }, isSel && styles.tileSelected]}
          >
            <TileIcon kind={tile.kind} size={cell * 0.78} />
          </LinearGradient>
        </Animated.View>,
      );
    }
  }

  const points = path.map((p) => `${(p.c + 0.5) * cell},${(p.r + 0.5) * cell}`).join(' ');
  const last = path[path.length - 1];

  return (
    <View>
      <View
        ref={boxRef}
        onLayout={() =>
          boxRef.current?.measureInWindow((x, y) => {
            origin.current = { x: x + pad, y: y + pad };
          })
        }
        style={[styles.frame, danger && styles.frameDanger, { width: inner + pad * 2 + 6, padding: pad }]}
        {...touch}
      >
        <LinearGradient colors={['#2a4f86', '#132c52']} style={[StyleSheet.absoluteFill, { borderRadius: 18 }]} />
        <View style={{ width: inner, height: cell * BOARD_ROWS }} pointerEvents="none">
          {tiles}
          {path.length > 1 && chainKind ? (
            <Svg width={inner} height={cell * BOARD_ROWS} style={StyleSheet.absoluteFill}>
              <Polyline points={points} fill="none" stroke="#fff" strokeWidth={cell * 0.26} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
              <Polyline points={points} fill="none" stroke={LINE[chainKind]} strokeWidth={cell * 0.14} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          ) : null}
          {last && chainKind && path.length >= 1 ? (
            <View
              style={[
                styles.badge,
                { left: Math.min(inner - 90, Math.max(0, (last.c + 0.5) * cell - 45)), top: Math.max(0, last.r * cell - 34) },
                path.length < MIN_CHAIN && styles.badgeWeak,
              ]}
            >
              <GameText size={15} outline="#2b1606">
                {path.length < MIN_CHAIN ? `${path.length}/${MIN_CHAIN}` : preview(chainKind, path.length)}
              </GameText>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: 'center',
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#ffcf33',
    overflow: 'hidden',
  },
  frameDanger: { borderColor: '#ff4d5e' },
  tile: { position: 'absolute', top: 0, padding: 2.5 },
  tileFace: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(43,22,6,0.35)',
  },
  tileSelected: { borderColor: '#fff', borderWidth: 3 },
  badge: {
    position: 'absolute',
    width: 90,
    alignItems: 'center',
    backgroundColor: 'rgba(43,22,6,0.85)',
    borderRadius: 12,
    paddingVertical: 3,
    borderWidth: 2,
    borderColor: '#ffcf33',
  },
  badgeWeak: { borderColor: '#8c7a62' },
});

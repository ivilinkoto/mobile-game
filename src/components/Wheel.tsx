import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import type { SymbolId } from '../game/types';
import { ALL_SYMBOLS, SYMBOL_EMOJI, colors } from '../ui/theme';

const STOP_TIMES = [650, 950, 1250];
const TICK_MS = 70;

interface Props {
  /** Symbols to land on; changing `spinId` starts a new spin. */
  target: [SymbolId, SymbolId, SymbolId] | null;
  spinId: number;
  onDone: () => void;
}

/** Three "compass" reels that shuffle quickly then stop one by one. */
export function Wheel({ target, spinId, onDone }: Props) {
  const [shown, setShown] = useState<SymbolId[]>(['coin', 'map', 'storm']);
  const [stopped, setStopped] = useState([true, true, true]);
  const bounce = useRef([0, 1, 2].map(() => new Animated.Value(1))).current;
  const glow = useRef(new Animated.Value(0)).current;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!target || spinId === 0) return;
    glow.setValue(0);
    setStopped([false, false, false]);
    const live = [true, true, true];
    const ticker = setInterval(() => {
      setShown((prev) => prev.map((s, i) => (live[i] ? ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)] : s)));
    }, TICK_MS);
    const timers = STOP_TIMES.map((ms, i) =>
      setTimeout(() => {
        live[i] = false;
        setShown((prev) => prev.map((s, j) => (j === i ? target[i] : s)));
        setStopped((prev) => prev.map((v, j) => (j === i ? true : v)));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        bounce[i].setValue(1.35);
        Animated.spring(bounce[i], { toValue: 1, useNativeDriver: true, bounciness: 16 }).start();
        if (i === 2) {
          clearInterval(ticker);
          const triple = target[0] === target[1] && target[1] === target[2];
          if (triple) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            Animated.sequence([
              Animated.timing(glow, { toValue: 1, duration: 180, useNativeDriver: true }),
              Animated.timing(glow, { toValue: 0.4, duration: 400, useNativeDriver: true }),
            ]).start();
          }
          setTimeout(() => onDoneRef.current(), triple ? 450 : 150);
        }
      }, ms),
    );
    return () => {
      clearInterval(ticker);
      timers.forEach(clearTimeout);
    };
    // spinId is the trigger; target is read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinId]);

  return (
    <View style={styles.frame}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.glow, { opacity: glow }]} />
      {shown.map((s, i) => (
        <View key={i} style={[styles.reel, !stopped[i] && styles.reelSpinning]}>
          <Animated.Text style={[styles.symbol, { transform: [{ scale: bounce[i] }] }]}>{SYMBOL_EMOJI[s]}</Animated.Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    backgroundColor: colors.wood,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: colors.gold,
    alignSelf: 'center',
  },
  glow: { backgroundColor: colors.gold, borderRadius: 16 },
  reel: {
    width: 82,
    height: 82,
    borderRadius: 14,
    backgroundColor: colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.panelEdge,
  },
  reelSpinning: { backgroundColor: '#f2e6c9' },
  symbol: { fontSize: 46 },
});

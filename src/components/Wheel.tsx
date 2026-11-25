import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { SymbolIcon } from '../art/Icons';
import type { SymbolId } from '../game/types';
import { ALL_SYMBOLS } from '../ui/theme';

const CELL = 86;
/** Inner height of a reel window (CELL minus its 2px borders). */
const STEP = CELL - 4;
const STRIP_EXTRA = [10, 14, 18];
const DURATION = [900, 1200, 1500];

export interface WheelHandle {
  /** Start a spin that lands on `target`. */
  spin: (target: [SymbolId, SymbolId, SymbolId]) => void;
}

interface Props {
  ref: Ref<WheelHandle>;
  onDone: () => void;
}

const randomSymbol = () => ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)];

/** Three slot reels: each scrolls a strip of symbols and lands with a bounce. */
export function Wheel({ ref, onDone }: Props) {
  const [strips, setStrips] = useState<SymbolId[][]>([['coin'], ['map'], ['storm']]);
  const offsets = useState(() => [0, 1, 2].map(() => new Animated.Value(0)))[0];
  const glow = useState(() => new Animated.Value(0))[0];
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });
  /** Strips built for a spin that has not started scrolling yet. */
  const pendingRef = useRef<SymbolId[][] | null>(null);

  // 1) a new spin builds strips that start at the current symbol and end on the target
  useImperativeHandle(
    ref,
    () => ({
      spin: (target) => {
        glow.setValue(0);
        const next = strips.map((strip, i) => {
          const current = strip[strip.length - 1];
          const middle = Array.from({ length: STRIP_EXTRA[i] }, randomSymbol);
          return [current, ...middle, target[i]];
        });
        pendingRef.current = next;
        setStrips(next);
      },
    }),
    [strips, glow],
  );

  // 2) once those strips are rendered, scroll them
  useEffect(() => {
    if (pendingRef.current !== strips) return;
    pendingRef.current = null;
    const tgt = strips.map((s) => s[s.length - 1]);
    strips.forEach((strip, i) => {
      offsets[i].setValue(0);
      Animated.timing(offsets[i], {
        toValue: -(strip.length - 1) * STEP,
        duration: DURATION[i],
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }).start(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        if (i !== 2) return;
        const triple = tgt[0] === tgt[1] && tgt[1] === tgt[2];
        if (triple) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          Animated.sequence([
            Animated.timing(glow, { toValue: 1, duration: 160, useNativeDriver: true }),
            Animated.timing(glow, { toValue: 0.25, duration: 220, useNativeDriver: true }),
            Animated.timing(glow, { toValue: 1, duration: 160, useNativeDriver: true }),
            Animated.timing(glow, { toValue: 0, duration: 500, useNativeDriver: true }),
          ]).start();
        }
        setTimeout(() => onDoneRef.current(), triple ? 420 : 120);
      });
    });
  }, [strips, offsets, glow]);

  return (
    <View style={styles.outer}>
      <Animated.View style={[styles.glow, { opacity: glow }]} />
      <LinearGradient colors={['#ffe766', '#e09a12', '#ffd23f', '#b86e00']} locations={[0, 0.45, 0.7, 1]} style={styles.rim}>
        <LinearGradient colors={['#6b3f1c', '#3d220d']} style={styles.inner}>
          {strips.map((strip, i) => (
            <View key={i} style={styles.window}>
              <LinearGradient colors={['#fffaf0', '#f1e1bd']} style={StyleSheet.absoluteFill} />
              <Animated.View style={{ transform: [{ translateY: offsets[i] }] }}>
                {strip.map((s, j) => (
                  <View key={j} style={styles.cell}>
                    <SymbolIcon id={s} size={64} />
                  </View>
                ))}
              </Animated.View>
              <LinearGradient
                pointerEvents="none"
                colors={['rgba(60,30,5,0.55)', 'rgba(60,30,5,0)', 'rgba(60,30,5,0)', 'rgba(60,30,5,0.55)']}
                locations={[0, 0.25, 0.75, 1]}
                style={StyleSheet.absoluteFill}
              />
            </View>
          ))}
        </LinearGradient>
      </LinearGradient>
      <Arrow side="left" />
      <Arrow side="right" />
    </View>
  );
}

function Arrow({ side }: { side: 'left' | 'right' }) {
  return (
    <Svg
      width={18}
      height={26}
      viewBox="0 0 18 26"
      style={[styles.arrow, side === 'left' ? { left: -4 } : { right: -4, transform: [{ scaleX: -1 }] }]}
    >
      <Path d="M2 2 L16 13 L2 24 Z" fill="#e5383b" stroke="#4d0d12" strokeWidth={2.5} strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  outer: { alignSelf: 'center' },
  glow: {
    position: 'absolute',
    left: -8,
    right: -8,
    top: -8,
    bottom: -8,
    borderRadius: 30,
    backgroundColor: '#fff38a',
  },
  rim: {
    padding: 6,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#5a3000',
  },
  inner: {
    flexDirection: 'row',
    gap: 6,
    padding: 6,
    borderRadius: 18,
  },
  window: {
    width: CELL,
    height: CELL,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2b1606',
  },
  cell: { width: STEP, height: STEP, alignItems: 'center', justifyContent: 'center' },
  arrow: { position: 'absolute', top: '50%', marginTop: -13 },
});

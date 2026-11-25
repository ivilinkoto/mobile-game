import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';

import { CoinIcon } from '../art/Icons';
import { formatCoins } from '../i18n';
import { GameText } from '../ui/GameText';

export interface ToastData {
  id: number;
  coins: number;
  lines: string[];
}

/** Big reward banner that pops, floats and fades. */
export function Toast({ data }: { data: ToastData | null }) {
  const anim = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    if (!data) return;
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 1900, useNativeDriver: true }).start();
  }, [data, anim]);
  if (!data || (data.coins <= 0 && data.lines.length === 0)) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          opacity: anim.interpolate({ inputRange: [0, 0.08, 0.75, 1], outputRange: [0, 1, 1, 0] }),
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, -50] }) },
            { scale: anim.interpolate({ inputRange: [0, 0.12, 0.2, 1], outputRange: [0.4, 1.15, 1, 1] }) },
          ],
        },
      ]}
    >
      {data.coins > 0 ? (
        <View style={styles.coinRow}>
          <CoinIcon size={48} />
          <GameText size={44} color="#ffd84d" outline="#5a3000">
            +{formatCoins(data.coins)}
          </GameText>
        </View>
      ) : null}
      {data.lines.map((l, i) => (
        <GameText key={i} size={22} color="#fff" outline="#1d0f40" style={{ textAlign: 'center' }}>
          {l}
        </GameText>
      ))}
    </Animated.View>
  );
}

function makeCoins(count: number, width: number) {
  return Array.from({ length: count }, () => ({
    v: new Animated.Value(0),
    dx: (Math.random() - 0.5) * width * 0.6,
    dy: -40 - Math.random() * 120,
    delay: Math.random() * 180,
  }));
}

/** A shower of coins that bursts from `from` and flies into the wallet at `to`. */
export function CoinBurst({ id, from, to, count = 10 }: { id: number; from: { x: number; y: number }; to: { x: number; y: number }; count?: number }) {
  const { width } = useWindowDimensions();
  // Rendered with key={id}, so every burst mounts with a fresh set of coins.
  const [coins] = useState(() => makeCoins(count, width));

  useEffect(() => {
    if (id === 0) return;
    Animated.parallel(
      coins.map((c) =>
        Animated.sequence([
          Animated.delay(c.delay),
          Animated.timing(c.v, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
        ]),
      ),
    ).start();
  }, [id, coins]);

  if (id === 0) return null;
  const size = 30;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {coins.map((c, i) => {
        // first half: burst outward, second half: home in on the wallet
        const x = c.v.interpolate({ inputRange: [0, 0.4, 1], outputRange: [from.x, from.x + c.dx, to.x] });
        const y = c.v.interpolate({ inputRange: [0, 0.4, 1], outputRange: [from.y, from.y + c.dy, to.y] });
        const opacity = c.v.interpolate({ inputRange: [0, 0.05, 0.92, 1], outputRange: [0, 1, 1, 0] });
        const scale = c.v.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.6, 1.2, 0.7] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: -size / 2,
              top: -size / 2,
              opacity,
              transform: [{ translateX: x }, { translateY: y }, { scale }],
            }}
          >
            <CoinIcon size={size} />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    top: '30%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  coinRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});

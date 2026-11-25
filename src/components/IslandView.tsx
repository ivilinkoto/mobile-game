import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { MAX_BUILDING_LEVEL } from '../game/config';
import { islandDef } from '../game/engine';
import { colors } from '../ui/theme';

/** Positions of the 5 building plots on the island, in % of the island box. */
const PLOTS = [
  { left: 14, top: 44 },
  { left: 36, top: 22 },
  { left: 60, top: 26 },
  { left: 70, top: 54 },
  { left: 40, top: 56 },
];

interface Props {
  islandIndex: number;
  buildings: number[];
  damaged: boolean[];
  /** Optional: show a smaller version (used for rival islands). */
  compact?: boolean;
}

export function IslandView({ islandIndex, buildings, damaged, compact }: Props) {
  const def = islandDef(islandIndex);
  return (
    <View style={[styles.sea, compact ? styles.compact : styles.full, { backgroundColor: def.sea }]}>
      <View style={[styles.land, { backgroundColor: def.land }]} />
      {PLOTS.map((p, i) => (
        <Plot
          key={i}
          emoji={def.buildings[i]}
          level={buildings[i]}
          damaged={damaged[i]}
          left={p.left}
          top={p.top}
          compact={compact}
        />
      ))}
    </View>
  );
}

function Plot({
  emoji,
  level,
  damaged,
  left,
  top,
  compact,
}: {
  emoji: string;
  level: number;
  damaged: boolean;
  left: number;
  top: number;
  compact?: boolean;
}) {
  const pop = useRef(new Animated.Value(1)).current;
  const prev = useRef(level);
  useEffect(() => {
    if (level > prev.current) {
      pop.setValue(0.4);
      Animated.spring(pop, { toValue: 1, useNativeDriver: true, bounciness: 14, speed: 10 }).start();
    }
    prev.current = level;
  }, [level, pop]);

  const base = compact ? 18 : 30;
  const size = level === 0 ? base : base + level * (compact ? 4 : 8);
  return (
    <View style={[styles.plot, { left: `${left}%`, top: `${top}%` }]}>
      <Animated.Text
        style={{
          fontSize: size,
          opacity: level === 0 ? 0.25 : 1,
          transform: [{ scale: pop }, { rotate: damaged ? '-14deg' : '0deg' }],
        }}
      >
        {emoji}
      </Animated.Text>
      {damaged ? <Text style={[styles.fire, compact && { fontSize: 14 }]}>🔥</Text> : null}
      {!compact ? (
        <View style={styles.stars}>
          {Array.from({ length: MAX_BUILDING_LEVEL }, (_, i) => (
            <Text key={i} style={[styles.star, i >= level && styles.starOff]}>
              ★
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sea: {
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  full: { flex: 1, marginHorizontal: 12 },
  compact: { height: 150 },
  land: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    top: '16%',
    bottom: '10%',
    borderRadius: 999,
    opacity: 0.95,
  },
  plot: { position: 'absolute', alignItems: 'center', transform: [{ translateX: -20 }] },
  fire: { position: 'absolute', top: -6, right: -10, fontSize: 20 },
  stars: { flexDirection: 'row' },
  star: { color: colors.gold, fontSize: 11, textShadowColor: '#000', textShadowRadius: 2 },
  starOff: { color: 'rgba(0,0,0,0.25)', textShadowRadius: 0 },
});

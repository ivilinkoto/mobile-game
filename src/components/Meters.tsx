// The three weather meters (sails, cannons, rain) plus the storm status.
// Each meter shows what fills it and what you get when it is full.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { BoltIcon, CannonIcon, MapIcon, RainIcon, ShieldIcon, StormCloudIcon, WindIcon } from '../art/Icons';
import { METER_MAX, STORM_BACKFIRE } from '../game/config';
import { stormPower } from '../game/engine';
import { t } from '../i18n';
import { useGame } from '../state/GameProvider';
import { GameText } from '../ui/GameText';

function Meter({
  label,
  value,
  max,
  colors,
  icon,
  reward,
}: {
  label: string;
  value: number;
  max: number;
  colors: [string, string];
  icon: ReactNode;
  reward: ReactNode;
}) {
  const [bump] = useState(() => new Animated.Value(1));
  const prev = useRef(value);
  useEffect(() => {
    if (value !== prev.current) {
      bump.setValue(1.15);
      Animated.spring(bump, { toValue: 1, useNativeDriver: true, bounciness: 14 }).start();
    }
    prev.current = value;
  }, [value, bump]);

  return (
    <Animated.View style={[styles.meter, { transform: [{ scale: bump }] }]}>
      {icon}
      <View style={{ flex: 1, gap: 2 }}>
        <View style={styles.labelRow}>
          <GameText size={12} numberOfLines={1}>
            {label}
          </GameText>
        </View>
        <View style={styles.track}>
          <LinearGradient colors={colors} style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: '100%' }} />
        </View>
      </View>
      <View style={styles.reward}>{reward}</View>
    </Animated.View>
  );
}

export function Meters() {
  const { state } = useGame();
  const storms = stormPower(state);
  const danger = storms >= STORM_BACKFIRE - 1;
  return (
    <View style={{ gap: 5 }}>
      <View style={styles.row}>
        <Meter
          label={t.meters.sails}
          value={state.meters.sails}
          max={METER_MAX.sails}
          colors={['#9ff5e8', '#1aa39a']}
          icon={<WindIcon size={30} />}
          reward={<MapIcon size={22} />}
        />
        <Meter
          label={t.meters.cannons}
          value={state.meters.cannons}
          max={METER_MAX.cannons}
          colors={['#d6c9ff', '#6a3fe0']}
          icon={<BoltIcon size={30} />}
          reward={<CannonIcon size={22} />}
        />
        <Meter
          label={t.meters.rain}
          value={state.meters.rain}
          max={METER_MAX.rain}
          colors={['#bfe6ff', '#1572c9']}
          icon={<RainIcon size={30} />}
          reward={<ShieldIcon size={20} />}
        />
      </View>
      {storms > 0 ? (
        <LinearGradient colors={danger ? ['#ff6b6b', '#b3202a'] : ['#8f6bff', '#4b23c9']} style={styles.storm}>
          <StormCloudIcon size={22} />
          <GameText size={12} style={{ flex: 1 }} numberOfLines={1}>
            {danger ? t.stormDanger : t.stormTap(storms)}
          </GameText>
        </LinearGradient>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 5 },
  meter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(11,30,54,0.85)',
    borderRadius: 12,
    paddingLeft: 2,
    paddingRight: 5,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  track: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#050f1d',
    overflow: 'hidden',
  },
  reward: { marginRight: -1 },
  storm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1.5,
    borderColor: '#ffe27a',
  },
});

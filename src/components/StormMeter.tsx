import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { CoinIcon, StormIcon } from '../art/Icons';
import { STORM_CHARGE_NEEDED, STORM_MAX_POWER } from '../game/config';
import { stormReward } from '../game/engine';
import { formatCoins, t } from '../i18n';
import { useGame } from '../state/GameProvider';
import { GameButton } from '../ui/GameButton';
import { GameText } from '../ui/GameText';

export function StormMeter({ disabled }: { disabled: boolean }) {
  const { state, prepareStorm } = useGame();
  const { storm } = state;
  const pulse = useState(() => new Animated.Value(0))[0];
  const spin = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    if (!storm.ready) return;
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
        Animated.timing(spin, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      spin.setValue(0);
    };
  }, [storm.ready, pulse, spin]);

  const segments = storm.ready ? STORM_MAX_POWER : STORM_CHARGE_NEEDED;
  const filled = storm.ready ? storm.power : storm.charge;
  const wobble = spin.interpolate({ inputRange: [0, 0.25, 0.75, 1], outputRange: ['0deg', '-10deg', '10deg', '0deg'] });

  return (
    <Animated.View
      style={[
        styles.wrap,
        storm.ready && { transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) }] },
      ]}
    >
      <LinearGradient
        colors={storm.ready ? ['#8f6bff', '#4b23c9'] : ['rgba(29,53,87,0.92)', 'rgba(11,30,54,0.92)']}
        style={[styles.bg, storm.ready && styles.bgReady]}
      >
        <Animated.View style={{ transform: [{ rotate: wobble }] }}>
          <StormIcon size={40} />
        </Animated.View>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={styles.titleRow}>
            <GameText size={14} numberOfLines={1} style={{ flexShrink: 1 }}>
              {storm.ready ? t.stormReady(storm.power) : t.stormCharge(storm.charge, STORM_CHARGE_NEEDED)}
            </GameText>
          </View>
          <View style={styles.segments}>
            {Array.from({ length: segments }, (_, i) => (
              <View key={i} style={styles.segment}>
                {i < filled ? (
                  <LinearGradient
                    colors={storm.ready ? ['#fff38a', '#ffb02e'] : ['#c6b5ff', '#7c5cff']}
                    style={StyleSheet.absoluteFill}
                  />
                ) : null}
              </View>
            ))}
          </View>
        </View>
        {storm.ready ? (
          <GameButton variant="gold" size="sm" onPress={prepareStorm} disabled={disabled} contentStyle={{ paddingVertical: 4 }}>
            <GameText size={14} outline="#8a3f00">
              {t.unleash}
            </GameText>
            <View style={styles.reward}>
              <CoinIcon size={15} />
              <GameText size={13} outline="#8a3f00">
                {formatCoins(stormReward(state))}
              </GameText>
            </View>
          </GameButton>
        ) : null}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 12 },
  bg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(198,181,255,0.6)',
  },
  bgReady: { borderColor: '#ffe27a', borderWidth: 2.5 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reward: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  segments: { flexDirection: 'row', gap: 4 },
  segment: {
    flex: 1,
    height: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.45)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.6)',
  },
});

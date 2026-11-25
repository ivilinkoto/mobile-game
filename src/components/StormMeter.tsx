import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { STORM_CHARGE_NEEDED, STORM_MAX_POWER } from '../game/config';
import { stormReward } from '../game/engine';
import { formatCoins, t } from '../i18n';
import { useGame } from '../state/GameProvider';
import { GameButton } from '../ui/GameButton';
import { colors } from '../ui/theme';

export function StormMeter({ disabled }: { disabled: boolean }) {
  const { state, prepareStorm } = useGame();
  const { storm } = state;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!storm.ready) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [storm.ready, pulse]);

  if (!storm.ready) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.label}>🌪️ {t.stormCharge(storm.charge, STORM_CHARGE_NEEDED)}</Text>
        <View style={styles.dots}>
          {Array.from({ length: STORM_CHARGE_NEEDED }, (_, i) => (
            <View key={i} style={[styles.dot, i < storm.charge && styles.dotOn]} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.wrap, styles.ready, { transform: [{ scale: pulse }] }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: '#fff' }]}>
          🌪️ {t.stormReady(storm.power)} · {formatCoins(stormReward(state))} 🪙
        </Text>
        <View style={styles.dots}>
          {Array.from({ length: STORM_MAX_POWER }, (_, i) => (
            <View key={i} style={[styles.dot, i < storm.power && styles.powerOn]} />
          ))}
        </View>
        <Text style={styles.hint}>{t.stormHint}</Text>
      </View>
      <GameButton label={t.unleash} variant="gold" size="sm" onPress={prepareStorm} disabled={disabled} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  ready: { backgroundColor: colors.storm, borderWidth: 2, borderColor: '#c9b8ff' },
  label: { color: colors.textLight, fontWeight: '800', fontSize: 14 },
  dots: { flexDirection: 'row', gap: 5, marginTop: 4 },
  dot: { width: 22, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotOn: { backgroundColor: colors.storm },
  powerOn: { backgroundColor: colors.gold },
  hint: { color: '#e8e0ff', fontSize: 11, marginTop: 4 },
});

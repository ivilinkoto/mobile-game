import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { MAX_BUILDING_LEVEL } from '../game/config';
import { islandDef, nextBuildCost, repairCost } from '../game/engine';
import { formatCoins, t } from '../i18n';
import { useGame } from '../state/GameProvider';
import { GameButton } from '../ui/GameButton';
import { Sheet } from '../ui/Sheet';
import { colors } from '../ui/theme';

export function BuildSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { state, build, repair } = useGame();
  const def = islandDef(state.islandIndex);

  return (
    <Sheet visible={visible} title={`${t.buildTitle} · 🪙 ${formatCoins(state.coins)}`} onClose={onClose}>
      <ScrollView contentContainerStyle={{ gap: 8 }}>
        {def.buildings.map((emoji, b) => {
          const level = state.buildings[b];
          const damaged = state.damaged[b];
          const cost = damaged ? repairCost(state, b) : nextBuildCost(state, b);
          const affordable = cost !== null && state.coins >= cost;
          return (
            <View key={b} style={styles.row}>
              <Text style={[styles.emoji, level === 0 && { opacity: 0.35 }]}>{emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.level}>
                  {damaged ? `🔥 ${t.damaged}` : t.level(level, MAX_BUILDING_LEVEL)}
                </Text>
                <View style={styles.stars}>
                  {Array.from({ length: MAX_BUILDING_LEVEL }, (_, i) => (
                    <Text key={i} style={[styles.star, i >= level && styles.starOff]}>
                      ★
                    </Text>
                  ))}
                </View>
              </View>
              {cost === null ? (
                <Text style={styles.done}>✅ {t.maxed}</Text>
              ) : (
                <GameButton
                  size="sm"
                  variant={damaged ? 'danger' : 'green'}
                  disabled={!affordable}
                  onPress={() => {
                    const ok = damaged ? repair(b) : build(b);
                    if (ok) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                  }}
                >
                  <Text style={styles.btnText}>
                    {damaged ? t.repair : t.upgrade} · {formatCoins(cost)}
                  </Text>
                </GameButton>
              )}
            </View>
          );
        })}
      </ScrollView>
      <GameButton label={t.close} variant="wood" onPress={onClose} style={{ marginTop: 12 }} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f6ead0',
    borderRadius: 14,
    padding: 10,
  },
  emoji: { fontSize: 36 },
  level: { fontWeight: '800', color: colors.text },
  stars: { flexDirection: 'row' },
  star: { color: colors.goldDark, fontSize: 14 },
  starOff: { color: '#d8c8a8' },
  done: { fontWeight: '800', color: colors.greenDark },
  btnText: { color: '#fff', fontWeight: '900' },
});

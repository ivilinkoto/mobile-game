import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MAX_SHIELDS } from '../game/config';
import { islandDef, islandProgress } from '../game/engine';
import { formatCoins, t } from '../i18n';
import { useGame } from '../state/GameProvider';
import { colors } from '../ui/theme';

export function Hud({ onOpenNews }: { onOpenNews: () => void }) {
  const { state } = useGame();
  const def = islandDef(state.islandIndex);
  const progress = islandProgress(state);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.pill}>
          <Text style={styles.pillIcon}>🪙</Text>
          <Text style={styles.pillText}>{formatCoins(state.coins)}</Text>
        </View>
        <View style={styles.pill}>
          {Array.from({ length: MAX_SHIELDS }, (_, i) => (
            <View key={i} style={[styles.shield, i < state.shields ? styles.shieldOn : styles.shieldOff]}>
              <Text style={styles.shieldIcon}>⚓</Text>
            </View>
          ))}
        </View>
        <Pressable style={styles.newsBtn} onPress={onOpenNews} hitSlop={8}>
          <Text style={styles.pillIcon}>📜</Text>
          {state.unread > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{Math.min(9, state.unread)}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
      <View style={styles.islandRow}>
        <Text style={styles.islandName}>
          {def.emoji} {t.islandN(state.islandIndex + 1)} · {t.islandNames[def.key]}
        </Text>
      </View>
      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 14, paddingTop: 6, gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  pillIcon: { fontSize: 18 },
  pillText: { color: colors.textLight, fontWeight: '900', fontSize: 18, minWidth: 50 },
  shield: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  shieldOn: { backgroundColor: colors.gold, borderWidth: 2, borderColor: colors.goldDark },
  shieldOff: { backgroundColor: 'rgba(255,255,255,0.08)', opacity: 0.35 },
  shieldIcon: { fontSize: 14 },
  newsBtn: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.danger,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  islandRow: { flexDirection: 'row', alignItems: 'center' },
  islandName: { color: colors.textLight, fontWeight: '800', fontSize: 15 },
  bar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.35)', overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.gold },
});

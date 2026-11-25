import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { REWARD } from '../game/config';
import { islandDef } from '../game/engine';
import type { LogEntry } from '../game/types';
import { formatCoins, t } from '../i18n';
import { useGame } from '../state/GameProvider';
import { GameButton } from '../ui/GameButton';
import { Sheet } from '../ui/Sheet';
import { colors } from '../ui/theme';

function describe(e: LogEntry): { icon: string; text: string } {
  switch (e.kind) {
    case 'incomingAttack':
      return { icon: e.blocked ? '🛡️' : '💥', text: t.log.incomingAttack(e.rivalName, e.blocked) };
    case 'incomingRaid':
      return { icon: '🏴‍☠️', text: t.log.incomingRaid(e.rivalName, formatCoins(e.coins)) };
    case 'attack':
      return { icon: '💣', text: t.log.attack(e.rivalName, formatCoins(e.coins), e.blocked) };
    case 'raid':
      return { icon: '🗺️', text: t.log.raid(e.rivalName, formatCoins(e.coins)) };
    case 'storm':
      return { icon: '🌪️', text: t.log.storm(e.rivalName, formatCoins(e.coins), e.power) };
    case 'backfire':
      return { icon: '⚡', text: t.log.backfire };
    case 'islandComplete':
      return { icon: '🏆', text: t.log.islandComplete(e.islandIndex + 1) };
  }
}

export function NewsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { state } = useGame();
  return (
    <Sheet visible={visible} title={`📜 ${t.news}`} onClose={onClose}>
      <ScrollView contentContainerStyle={{ gap: 6 }}>
        {state.log.length === 0 ? <Text style={styles.empty}>{t.noNews}</Text> : null}
        {state.log.map((e, i) => {
          const d = describe(e);
          return (
            <View key={i} style={styles.row}>
              <Text style={styles.icon}>{d.icon}</Text>
              <Text style={styles.text}>{d.text}</Text>
            </View>
          );
        })}
      </ScrollView>
      <GameButton label={t.close} variant="wood" onPress={onClose} style={{ marginTop: 12 }} />
    </Sheet>
  );
}

export function IslandCompleteSheet() {
  const { state, dismissIslandComplete } = useGame();
  const done = state.justCompletedIsland;
  const next = islandDef(state.islandIndex);
  return (
    <Sheet visible={done !== null} title={`🏆 ${t.islandComplete}`}>
      <Text style={styles.big}>
        {done !== null ? islandDef(done).emoji : ''} ➜ {next.emoji}
      </Text>
      <Text style={styles.body}>{t.islandCompleteBody(REWARD.islandCompleteSpins)}</Text>
      <Text style={styles.body}>
        {t.islandN(state.islandIndex + 1)} · {t.islandNames[next.key]}
      </Text>
      <GameButton label={t.sail} variant="green" size="lg" onPress={dismissIslandComplete} style={{ marginTop: 14 }} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: '#f6ead0', borderRadius: 12, padding: 10 },
  icon: { fontSize: 22 },
  text: { flex: 1, color: colors.text, fontWeight: '600' },
  empty: { textAlign: 'center', color: colors.muted, padding: 20 },
  big: { fontSize: 56, textAlign: 'center' },
  body: { textAlign: 'center', color: colors.text, fontWeight: '700', fontSize: 16, marginTop: 6 },
});

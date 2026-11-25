// Popups for the PvP actions: cannon attack, treasure raid and storm.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { REWARD } from '../game/config';
import { islandDef, raidFinished } from '../game/engine';
import type { Rival } from '../game/types';
import { formatCoins, t } from '../i18n';
import { useGame } from '../state/GameProvider';
import { GameButton } from '../ui/GameButton';
import { Sheet } from '../ui/Sheet';
import { colors } from '../ui/theme';
import { IslandView } from './IslandView';

function RivalRow({ rival, onPress, selected }: { rival: Rival; onPress: () => void; selected?: boolean }) {
  const def = islandDef(rival.islandIndex);
  return (
    <Pressable onPress={onPress} style={[styles.rival, selected && styles.rivalSelected]}>
      <Text style={styles.avatar}>{rival.avatar}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.rivalName}>{rival.name}</Text>
        <Text style={styles.rivalMeta}>
          {def.emoji} {t.islandN(rival.islandIndex + 1)} · {'⚓'.repeat(rival.shields) || '—'}
        </Text>
      </View>
      {rival.revenge ? <Text style={styles.revenge}>⚔️ {t.revenge}</Text> : null}
    </Pressable>
  );
}

export function AttackSheet({ onResult }: { onResult: (text: string) => void }) {
  const { state, attack } = useGame();
  const [chosen, setChosen] = useState<string | null>(null);
  const p = state.pending;
  const visible = p?.type === 'attack';
  const targets = visible ? state.rivals.filter((r) => p.targetIds.includes(r.id)) : [];
  const rival = targets.find((r) => r.id === chosen) ?? null;

  return (
    <Sheet visible={visible} title={`💣 ${rival ? t.attackPickBuilding : t.attackTitle}`}>
      {!rival ? (
        <View style={{ gap: 8 }}>
          {targets.map((r) => (
            <RivalRow key={r.id} rival={r} onPress={() => setChosen(r.id)} />
          ))}
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          <RivalRow rival={rival} onPress={() => setChosen(null)} selected />
          <IslandView islandIndex={rival.islandIndex} buildings={rival.buildings} damaged={rival.damaged} compact />
          <View style={styles.buildingRow}>
            {islandDef(rival.islandIndex).buildings.map((emoji, b) => (
              <Pressable
                key={b}
                disabled={rival.buildings[b] === 0}
                onPress={() => {
                  const r = attack(rival.id, b);
                  setChosen(null);
                  if (r) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
                    onResult(`${r.blocked ? t.blocked : t.hit} +${formatCoins(r.coins)} 🪙`);
                  }
                }}
                style={[styles.target, rival.buildings[b] === 0 && { opacity: 0.25 }]}
              >
                <Text style={{ fontSize: 30 }}>{emoji}</Text>
                <Text style={styles.crosshair}>🎯</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </Sheet>
  );
}

export function RaidSheet() {
  const { state, dig, closeRaid } = useGame();
  const p = state.pending;
  const visible = p?.type === 'raid';
  if (!visible) return <Sheet visible={false} title="">{null}</Sheet>;
  const rival = state.rivals.find((r) => r.id === p.rivalId);
  const done = raidFinished(state);
  const total = p.dug.reduce((s, i) => s + p.spots[i], 0);

  return (
    <Sheet visible title={`🗺️ ${t.raidTitle(rival?.name ?? '?')}`}>
      <Text style={styles.hint}>
        {done ? `+${formatCoins(total)} 🪙` : t.raidHint(REWARD.raidDigs - p.dug.length)}
      </Text>
      <View style={styles.grid}>
        {p.spots.map((value, i) => {
          const isDug = p.dug.includes(i);
          const reveal = isDug || done;
          return (
            <Pressable
              key={i}
              disabled={reveal}
              onPress={() => {
                if (dig(i) !== null) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
              }}
              style={[styles.spot, isDug && styles.spotDug, done && !isDug && { opacity: 0.5 }]}
            >
              <Text style={{ fontSize: 40 }}>{reveal ? (value === Math.max(...p.spots) ? '👑' : '🪙') : '❌'}</Text>
              {reveal ? <Text style={styles.spotValue}>{formatCoins(value)}</Text> : null}
            </Pressable>
          );
        })}
      </View>
      {done ? <GameButton label={t.collect} variant="green" onPress={closeRaid} style={{ marginTop: 12 }} /> : null}
    </Sheet>
  );
}

export function StormSheet({ onResult }: { onResult: (text: string) => void }) {
  const { state, unleashStorm, cancelStorm } = useGame();
  const p = state.pending;
  const visible = p?.type === 'storm';
  const targets = visible ? state.rivals.filter((r) => p.targetIds.includes(r.id)) : [];

  return (
    <Sheet visible={visible} title={`🌪️ ${t.stormChoose}`} onClose={cancelStorm}>
      <Text style={styles.hint}>{t.stormIgnoresShields}</Text>
      <View style={{ gap: 8 }}>
        {targets.map((r) => (
          <RivalRow
            key={r.id}
            rival={r}
            onPress={() => {
              const coins = unleashStorm(r.id);
              if (coins !== null) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
                onResult(`🌪️ +${formatCoins(coins)} 🪙`);
              }
            }}
          />
        ))}
      </View>
      <GameButton label={t.cancel} variant="wood" onPress={cancelStorm} style={{ marginTop: 12 }} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  rival: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#f6ead0',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rivalSelected: { borderColor: colors.goldDark },
  avatar: { fontSize: 34 },
  rivalName: { fontWeight: '900', fontSize: 17, color: colors.text },
  rivalMeta: { color: colors.muted, fontWeight: '600' },
  revenge: { color: colors.danger, fontWeight: '900' },
  buildingRow: { flexDirection: 'row', justifyContent: 'space-between' },
  target: {
    width: 56,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#f6ead0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshair: { position: 'absolute', bottom: 2, right: 2, fontSize: 14 },
  hint: { textAlign: 'center', color: colors.muted, fontWeight: '700', marginBottom: 10, fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  spot: {
    width: '45%',
    aspectRatio: 1.2,
    borderRadius: 16,
    backgroundColor: '#e9cf98',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.panelEdge,
  },
  spotDug: { backgroundColor: '#fff3c4', borderColor: colors.gold },
  spotValue: { fontWeight: '900', color: colors.text, fontSize: 16 },
});

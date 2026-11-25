import { useEffect, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { sfx } from '../audio/sound';
import { CannonIcon, EnergyIcon, MapIcon, ScrollIcon, ShieldIcon, StarIcon, StormIcon } from '../art/Icons';
import { IslandScene } from '../art/IslandScene';
import { themeFor } from '../art/themes';
import { REWARD } from '../game/config';
import { islandDef } from '../game/engine';
import type { LogEntry } from '../game/types';
import { formatCoins, t } from '../i18n';
import { useGame } from '../state/GameProvider';
import { GameButton } from '../ui/GameButton';
import { GameText } from '../ui/GameText';
import { Sheet } from '../ui/Sheet';

function describe(e: LogEntry): { icon: ReactNode; text: string; bad: boolean } {
  switch (e.kind) {
    case 'incomingAttack':
      return {
        icon: e.blocked ? <ShieldIcon size={34} /> : <CannonIcon size={34} />,
        text: t.log.incomingAttack(e.rivalName, e.blocked),
        bad: !e.blocked,
      };
    case 'incomingRaid':
      return { icon: <MapIcon size={34} />, text: t.log.incomingRaid(e.rivalName, formatCoins(e.coins)), bad: true };
    case 'attack':
      return { icon: <CannonIcon size={34} />, text: t.log.attack(e.rivalName, formatCoins(e.coins), e.blocked), bad: false };
    case 'raid':
      return { icon: <MapIcon size={34} />, text: t.log.raid(e.rivalName, formatCoins(e.coins)), bad: false };
    case 'storm':
      return { icon: <StormIcon size={34} />, text: t.log.storm(e.rivalName, formatCoins(e.coins), e.power), bad: false };
    case 'backfire':
      return { icon: <StormIcon size={34} />, text: t.log.backfire, bad: true };
    case 'islandComplete':
      return { icon: <StarIcon size={34} />, text: t.log.islandComplete(e.islandIndex + 1), bad: false };
  }
}

export function NewsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { state } = useGame();
  return (
    <Sheet visible={visible} title={t.news} icon={<ScrollIcon size={28} />} onClose={onClose}>
      <ScrollView contentContainerStyle={{ gap: 6 }} style={{ flexGrow: 0 }}>
        {state.log.length === 0 ? (
          <GameText size={15} weight="bold" color="#8c6a3e" outline={false} style={{ textAlign: 'center', padding: 20 }}>
            {t.noNews}
          </GameText>
        ) : null}
        {state.log.map((e, i) => {
          const d = describe(e);
          return (
            <LinearGradient key={i} colors={d.bad ? ['#ffe9e4', '#f8c8bd'] : ['#fffaf0', '#f1deb4']} style={styles.row}>
              {d.icon}
              <GameText size={14} weight="bold" color="#3a2210" outline={false} style={{ flex: 1 }}>
                {d.text}
              </GameText>
            </LinearGradient>
          );
        })}
      </ScrollView>
    </Sheet>
  );
}

export function IslandCompleteSheet() {
  const { state, dismissIslandComplete } = useGame();
  const done = state.justCompletedIsland;
  const next = islandDef(state.islandIndex);
  useEffect(() => {
    if (done !== null) sfx('fanfare');
  }, [done]);
  return (
    <Sheet visible={done !== null} title={t.islandComplete} icon={<StarIcon size={30} />}>
      <View style={styles.scene}>
        <IslandScene theme={themeFor(next.key)} buildings={[0, 0, 0, 0, 0]} damaged={[false, false, false, false, false]} compact />
      </View>
      <GameText size={20} color="#3a2210" outline={false} style={styles.center}>
        {t.islandN(state.islandIndex + 1)} · {t.islandNames[next.key]}
      </GameText>
      <View style={styles.bonus}>
        <EnergyIcon size={30} />
        <GameText size={22} color="#fff" outline="#0f3a6b">
          +{REWARD.islandCompleteSpins}
        </GameText>
      </View>
      <GameText size={14} weight="bold" color="#7a4a1f" outline={false} style={styles.center}>
        {t.islandCompleteBody(REWARD.islandCompleteSpins)}
      </GameText>
      <GameButton label={t.sail} variant="green" size="lg" onPress={dismissIslandComplete} style={{ marginTop: 14 }} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderRadius: 14,
    padding: 8,
    borderWidth: 2,
    borderColor: '#e2c48a',
  },
  scene: { height: 180, borderRadius: 18, overflow: 'hidden', borderWidth: 3, borderColor: '#8a5a2b', marginBottom: 10 },
  center: { textAlign: 'center' },
  bonus: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2a86e0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginVertical: 8,
    borderWidth: 2.5,
    borderColor: '#0f3a6b',
  },
});

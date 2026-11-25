// Popups for the PvP actions: cannon attack, treasure raid and storm.

import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { Avatar } from '../art/Avatar';
import { Building } from '../art/Buildings';
import { CannonIcon, ChestIcon, CoinIcon, DigSpotIcon, MapIcon, ShieldIcon, StormIcon } from '../art/Icons';
import { IslandScene } from '../art/IslandScene';
import { themeFor } from '../art/themes';
import { REWARD } from '../game/config';
import { islandDef, raidFinished } from '../game/engine';
import type { Rival } from '../game/types';
import { formatCoins, t } from '../i18n';
import { useGame } from '../state/GameProvider';
import { GameButton } from '../ui/GameButton';
import { GameText } from '../ui/GameText';
import { Sheet } from '../ui/Sheet';

function RivalRow({ rival, onPress, selected }: { rival: Rival; onPress: () => void; selected?: boolean }) {
  const def = islandDef(rival.islandIndex);
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <LinearGradient
          colors={rival.revenge ? ['#ffe1dc', '#f7b9ae'] : ['#fffaf0', '#f1deb4']}
          style={[styles.rival, selected && styles.rivalSelected, pressed && { transform: [{ scale: 0.97 }] }]}
        >
          <Avatar seed={rival.name} size={52} ring={rival.revenge ? '#e5383b' : '#ffcf33'} />
          <View style={{ flex: 1, gap: 2 }}>
            <GameText size={18} color="#3a2210" outline={false}>
              {rival.name}
            </GameText>
            <GameText size={12} weight="bold" color="#8c6a3e" outline={false}>
              {t.islandN(rival.islandIndex + 1)} · {t.islandNames[def.key]}
            </GameText>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            {rival.revenge ? (
              <View style={styles.revenge}>
                <GameText size={11} outline="#6b1016">
                  {t.revenge} +50%
                </GameText>
              </View>
            ) : null}
            <View style={{ flexDirection: 'row' }}>
              {rival.shields > 0 ? (
                Array.from({ length: rival.shields }, (_, i) => <ShieldIcon key={i} size={20} />)
              ) : (
                <ShieldIcon size={20} dim />
              )}
            </View>
          </View>
        </LinearGradient>
      )}
    </Pressable>
  );
}

function Crosshair({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Circle cx="20" cy="20" r="14" stroke="#e5383b" strokeWidth="4" fill="none" />
      <Circle cx="20" cy="20" r="4" fill="#e5383b" />
      <Path d="M20 2 L20 10 M20 30 L20 38 M2 20 L10 20 M30 20 L38 20" stroke="#e5383b" strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

export function AttackSheet({ onResult }: { onResult: (coins: number, text: string) => void }) {
  const { state, attack } = useGame();
  const [chosen, setChosen] = useState<string | null>(null);
  const p = state.pending;
  const visible = p?.type === 'attack';
  const targets = visible ? state.rivals.filter((r) => p.targetIds.includes(r.id)) : [];
  const rival = targets.find((r) => r.id === chosen) ?? null;
  const theme = rival ? themeFor(islandDef(rival.islandIndex).key) : null;

  return (
    <Sheet visible={visible} title={rival ? t.attackPickBuilding : t.attackTitle} icon={<CannonIcon size={30} />}>
      {!rival || !theme ? (
        <View style={{ gap: 8 }}>
          {targets.map((r) => (
            <RivalRow key={r.id} rival={r} onPress={() => setChosen(r.id)} />
          ))}
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          <RivalRow rival={rival} onPress={() => setChosen(null)} selected />
          <View style={styles.scene}>
            <IslandScene theme={theme} buildings={rival.buildings} damaged={rival.damaged} compact />
          </View>
          <View style={styles.buildingRow}>
            {rival.buildings.map((level, b) => (
              <Pressable
                key={b}
                disabled={level === 0}
                onPress={() => {
                  const r = attack(rival.id, b);
                  setChosen(null);
                  if (r) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
                    onResult(r.coins, r.blocked ? t.blocked : t.hit);
                  }
                }}
                style={({ pressed }) => [styles.target, level === 0 && { opacity: 0.3 }, pressed && { transform: [{ scale: 0.92 }] }]}
              >
                <Building type={b} level={level} damaged={rival.damaged[b]} theme={theme} size={50} still />
                {level > 0 ? (
                  <View style={styles.crosshair}>
                    <Crosshair size={22} />
                  </View>
                ) : null}
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
  if (p?.type !== 'raid') return null;
  const rival = state.rivals.find((r) => r.id === p.rivalId);
  const done = raidFinished(state);
  const total = p.dug.reduce((s, i) => s + p.spots[i], 0);
  const best = Math.max(...p.spots);

  return (
    <Sheet visible title={t.raidTitle(rival?.name ?? '?')} icon={<MapIcon size={30} />}>
      <View style={styles.raidHeader}>
        {done ? (
          <>
            <CoinIcon size={28} />
            <GameText size={26} color="#ffcf33" outline="#5a3000">
              +{formatCoins(total)}
            </GameText>
          </>
        ) : (
          <GameText size={17} color="#7a4a1f" outline={false}>
            {t.raidHint(REWARD.raidDigs - p.dug.length)}
          </GameText>
        )}
      </View>
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
              style={({ pressed }) => [styles.spotWrap, pressed && { transform: [{ scale: 0.94 }] }]}
            >
              <LinearGradient
                colors={isDug ? ['#fff3c4', '#f2cf6b'] : ['#f2d394', '#d2a55c']}
                style={[styles.spot, done && !isDug && { opacity: 0.55 }]}
              >
                {reveal ? (
                  value === best ? (
                    <ChestIcon size={64} open />
                  ) : (
                    <View style={styles.pile}>
                      <CoinIcon size={40} />
                      <View style={{ marginLeft: -18, marginTop: 10 }}>
                        <CoinIcon size={34} />
                      </View>
                    </View>
                  )
                ) : (
                  <DigSpotIcon size={72} />
                )}
                {reveal ? (
                  <GameText size={17} color="#fff" outline="#5a3000">
                    {formatCoins(value)}
                  </GameText>
                ) : null}
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>
      {done ? <GameButton label={t.collect} variant="green" size="md" onPress={closeRaid} style={{ marginTop: 12 }} /> : null}
    </Sheet>
  );
}

export function StormSheet({ onResult }: { onResult: (coins: number, text: string) => void }) {
  const { state, unleashStorm, cancelStorm } = useGame();
  const p = state.pending;
  const visible = p?.type === 'storm';
  const targets = visible ? state.rivals.filter((r) => p.targetIds.includes(r.id)) : [];

  return (
    <Sheet visible={visible} title={t.stormChoose} icon={<StormIcon size={30} />} onClose={cancelStorm}>
      <GameText size={14} weight="bold" color="#5a35d6" outline={false} style={{ textAlign: 'center', marginBottom: 8 }}>
        {t.stormIgnoresShields}
      </GameText>
      <GameText size={12} weight="bold" color="#8c6a3e" outline={false} style={{ textAlign: 'center', marginTop: -4, marginBottom: 8 }}>
        {t.stormHint}
      </GameText>
      <View style={{ gap: 8 }}>
        {targets.map((r) => (
          <RivalRow
            key={r.id}
            rival={r}
            onPress={() => {
              const coins = unleashStorm(r.id);
              if (coins !== null) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
                onResult(coins, t.storm);
              }
            }}
          />
        ))}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  rival: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2c48a',
  },
  rivalSelected: { borderColor: '#d98a00', borderWidth: 3 },
  revenge: { backgroundColor: '#e5383b', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  scene: { height: 170, borderRadius: 18, overflow: 'hidden', borderWidth: 3, borderColor: '#8a5a2b' },
  buildingRow: { flexDirection: 'row', justifyContent: 'space-between' },
  target: {
    width: 58,
    height: 62,
    borderRadius: 14,
    backgroundColor: '#f1deb4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#d2a55c',
  },
  crosshair: { position: 'absolute', right: -4, bottom: -4 },
  raidHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10, minHeight: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  spotWrap: { width: '46%' },
  spot: {
    aspectRatio: 1.15,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#a87a3a',
  },
  pile: { flexDirection: 'row' },
});

import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { CoinIcon, GearIcon, ScrollIcon, ShieldIcon } from '../art/Icons';
import { MAX_SHIELDS } from '../game/config';
import { islandDef, islandProgress } from '../game/engine';
import { formatCoins, t } from '../i18n';
import { useGame } from '../state/GameProvider';
import { GameText } from '../ui/GameText';
import { useCountUp } from '../ui/useCountUp';

export function Hud({ onOpenNews, onOpenSettings }: { onOpenNews: () => void; onOpenSettings: () => void }) {
  const { state } = useGame();
  const def = islandDef(state.islandIndex);
  const progress = islandProgress(state);
  const coins = useCountUp(state.coins);

  const bump = useState(() => new Animated.Value(1))[0];
  const prevCoins = useRef(state.coins);
  useEffect(() => {
    if (state.coins > prevCoins.current) {
      bump.setValue(1.25);
      Animated.spring(bump, { toValue: 1, useNativeDriver: true, bounciness: 14 }).start();
    }
    prevCoins.current = state.coins;
  }, [state.coins, bump]);

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.row} pointerEvents="box-none">
        <View style={styles.coinPill}>
          <LinearGradient colors={['#1d3557', '#0b1e36']} style={styles.pillBg}>
            <GameText size={20} style={styles.coinText}>
              {formatCoins(coins)}
            </GameText>
          </LinearGradient>
          <Animated.View style={[styles.coinIcon, { transform: [{ scale: bump }] }]}>
            <CoinIcon size={44} />
          </Animated.View>
        </View>

        <LinearGradient colors={['#1d3557', '#0b1e36']} style={styles.shieldPill}>
          {Array.from({ length: MAX_SHIELDS }, (_, i) => (
            <ShieldIcon key={i} size={26} dim={i >= state.shields} />
          ))}
        </LinearGradient>

        <Pressable onPress={onOpenSettings} hitSlop={8} style={styles.settingsBtn}>
          <LinearGradient colors={['#c98a4b', '#7a4a1f']} style={styles.newsFace}>
            <GearIcon size={28} />
          </LinearGradient>
        </Pressable>
        <Pressable onPress={onOpenNews} hitSlop={8}>
          <LinearGradient colors={['#c98a4b', '#7a4a1f']} style={styles.newsFace}>
            <ScrollIcon size={30} />
          </LinearGradient>
          {state.unread > 0 ? (
            <View style={styles.badge}>
              <GameText size={12} outline={false}>
                {Math.min(9, state.unread)}
              </GameText>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={styles.islandBar}>
        <View style={styles.islandTitle}>
          <GameText size={15}>
            {t.islandN(state.islandIndex + 1)} · {t.islandNames[def.key]}
          </GameText>
          <GameText size={13} color="#ffe27a">
            {Math.round(progress * 100)}%
          </GameText>
        </View>
        <View style={styles.track}>
          <LinearGradient
            colors={['#fff38a', '#ffb02e']}
            style={[styles.fill, { width: `${Math.max(4, Math.round(progress * 100))}%` }]}
          />
          <View style={styles.trackGloss} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 12, paddingTop: 4, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  coinPill: { flexDirection: 'row', alignItems: 'center', paddingLeft: 18 },
  pillBg: {
    height: 34,
    borderRadius: 17,
    paddingLeft: 30,
    paddingRight: 14,
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#ffcf33',
    minWidth: 104,
  },
  coinText: { textAlign: 'right' },
  coinIcon: { position: 'absolute', left: 0 },
  shieldPill: {
    flexDirection: 'row',
    height: 34,
    alignItems: 'center',
    paddingHorizontal: 6,
    borderRadius: 17,
    borderWidth: 2.5,
    borderColor: '#4fb3ff',
    gap: 1,
  },
  settingsBtn: { marginLeft: 'auto' },
  newsFace: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#3a2210',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#e5383b',
    borderRadius: 11,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  islandBar: {
    backgroundColor: 'rgba(11,30,54,0.72)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  islandTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  track: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0b1e36',
    borderWidth: 1.5,
    borderColor: '#000',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 6 },
  trackGloss: { position: 'absolute', left: 0, right: 0, top: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
});

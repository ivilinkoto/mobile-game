import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { EnergyIcon, HammerIcon } from '../art/Icons';
import { IslandScene } from '../art/IslandScene';
import { themeFor } from '../art/themes';
import { findLongestChain } from '../game/board';
import { MAX_SPINS, MIN_CHAIN, REWARD, SPIN_REGEN_MS, chainValue } from '../game/config';
import { canPlay, islandDef, islandScale, msUntilNextSpin } from '../game/engine';
import type { ChainResult, TileKind } from '../game/types';
import { formatCoins, formatDuration, t } from '../i18n';
import { useGame } from '../state/GameProvider';
import { GameButton } from '../ui/GameButton';
import { GameText } from '../ui/GameText';
import { BuildSheet } from '../components/BuildSheet';
import { Hud } from '../components/Hud';
import { IslandCompleteSheet, NewsSheet } from '../components/InfoSheets';
import { Meters } from '../components/Meters';
import { SkyBoard } from '../components/SkyBoard';
import { AttackSheet, RaidSheet, StormSheet } from '../components/TargetSheets';
import { CoinBurst, Toast, type ToastData } from '../components/Toast';

function resultLines(r: ChainResult): string[] {
  const lines: string[] = [];
  if (r.shieldWon) lines.push(t.result.shield);
  if (r.raidReady) lines.push(t.chainResult.raidReady);
  if (r.attackReady) lines.push(t.chainResult.attackReady);
  if (r.stormSpawned && !r.backfire) lines.push(t.chainResult.stormSpawned);
  if (r.backfire) lines.push(t.result.backfire);
  return lines;
}

export function GameScreen() {
  const game = useGame();
  const { state } = game;
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [toast, setToast] = useState<ToastData | null>(null);
  const [burst, setBurst] = useState(0);
  const [busy, setBusy] = useState(false);
  const [showBuild, setShowBuild] = useState(false);
  // Open the news right away when the player returns to unread attacks.
  const [showNews, setShowNews] = useState(
    () => state.unread > 0 && !!state.log[0] && state.log[0].kind.startsWith('incoming'),
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Give the clouds time to pop and fall before a popup appears.
  useEffect(() => {
    if (!busy) return;
    const id = setTimeout(() => setBusy(false), 700);
    return () => clearTimeout(id);
  }, [busy]);

  const reward = (coins: number, lines: string[]) => {
    setToast((p) => ({ id: (p?.id ?? 0) + 1, coins, lines }));
    if (coins > 0) setBurst((n) => n + 1);
  };

  const onChain = (path: { r: number; c: number }[]) => {
    const r = game.playChain(path);
    if (!r) return;
    setBusy(true);
    Haptics.impactAsync(path.length >= 6 ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    reward(r.coinsWon, resultLines(r));
  };

  const preview = (kind: TileKind, length: number) => {
    const v = chainValue(length);
    if (kind === 'sun') return `+${formatCoins(Math.round(REWARD.sunCoin * v * islandScale(state.islandIndex)))}`;
    return `+${v}`;
  };

  const boardWidth = Math.min(width - 24, 360, (height - 380) * 1.0);
  const hint = useMemo(
    () => (state.totalSpins === 0 ? findLongestChain(state.board, MIN_CHAIN).slice(0, MIN_CHAIN) : null),
    [state.totalSpins, state.board],
  );

  const wait = msUntilNextSpin(state, now);
  const playable = canPlay(state);
  const theme = themeFor(islandDef(state.islandIndex).key);
  const regenPct = wait === null ? 1 : 1 - wait / SPIN_REGEN_MS;

  return (
    <View style={styles.root}>
      {/* island fills the top of the screen */}
      <View style={styles.islandArea}>
        <IslandScene
          theme={theme}
          buildings={state.buildings}
          damaged={state.damaged}
          insetTop={insets.top + 104}
          insetBottom={60}
        />
        <SafeAreaView edges={['top']} style={styles.hud} pointerEvents="box-none">
          <Hud
            onOpenNews={() => {
              setShowNews(true);
              game.markLogRead();
            }}
          />
        </SafeAreaView>
        <View style={styles.islandFooter} pointerEvents="box-none">
          <GameButton
            variant="blue"
            size="sm"
            onPress={() => setShowBuild(true)}
            style={styles.buildWrap}
            contentStyle={styles.buildBtn}
          >
            <HammerIcon size={28} />
            <GameText size={12} outline="#0f3a6b">
              {t.build}
            </GameText>
          </GameButton>
          <Meters />
        </View>
      </View>

      {/* the sky board */}
      <LinearGradient colors={['#8a5a2b', '#5e3b19', '#3d240d']} style={[styles.panel, { paddingBottom: Math.max(8, insets.bottom) }]}>
        <View style={styles.panelRim} />
        {state.totalSpins < 3 ? (
          <GameText size={14} color="#ffe9c2" style={styles.hintText}>
            {t.chainHint}
          </GameText>
        ) : null}
        <SkyBoard
          board={state.board}
          width={boardWidth}
          disabled={!playable || busy}
          hint={hint && hint.length >= MIN_CHAIN ? hint : null}
          onChain={onChain}
          onStormTap={game.prepareStorm}
          preview={preview}
        />

        <View style={styles.energy}>
          <EnergyIcon size={28} />
          <View style={{ flex: 1, gap: 2 }}>
            <View style={styles.energyText}>
              <GameText size={14}>
                {state.spins}/{MAX_SPINS} {t.spinsLabel}
              </GameText>
              <GameText size={12} weight="heavy" color="#9fe0ff">
                {wait === null ? t.spinsFull : t.nextSpinIn(formatDuration(wait))}
              </GameText>
            </View>
            <View style={styles.energyTrack}>
              <LinearGradient
                colors={['#7fe3ff', '#1572c9']}
                style={{ width: `${Math.round(Math.min(1, state.spins / MAX_SPINS) * 100)}%`, height: '100%' }}
              />
              {wait !== null ? <View style={[styles.regen, { width: `${Math.round(regenPct * 100)}%` }]} /> : null}
            </View>
          </View>
        </View>
      </LinearGradient>

      <Toast data={toast} />
      <CoinBurst key={burst} id={burst} from={{ x: width / 2, y: height * 0.68 }} to={{ x: 34, y: insets.top + 26 }} />

      <BuildSheet visible={showBuild} onClose={() => setShowBuild(false)} />
      <NewsSheet
        visible={showNews}
        onClose={() => {
          setShowNews(false);
          game.markLogRead();
        }}
      />
      {!busy ? (
        <>
          <AttackSheet onResult={(coins, text) => reward(coins, [text])} />
          <RaidSheet />
          <StormSheet onResult={(coins, text) => reward(coins, [text])} />
          <IslandCompleteSheet />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b1e36' },
  islandArea: { flex: 1, overflow: 'hidden' },
  hud: { position: 'absolute', top: 0, left: 0, right: 0 },
  islandFooter: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    gap: 6,
  },
  buildWrap: { alignSelf: 'flex-end' },
  buildBtn: { paddingHorizontal: 8, paddingVertical: 3 },
  panel: {
    paddingTop: 10,
    paddingHorizontal: 12,
    gap: 8,
    borderTopWidth: 4,
    borderColor: '#2b1606',
  },
  panelRim: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: '#d9a441' },
  hintText: { textAlign: 'center' },
  energy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  energyText: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  energyTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0b1e36',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#000',
  },
  regen: { position: 'absolute', left: 0, bottom: 0, height: 2, backgroundColor: '#fff38a' },
});

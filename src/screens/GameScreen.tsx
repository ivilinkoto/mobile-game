import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { EnergyIcon, HammerIcon } from '../art/Icons';
import { IslandScene } from '../art/IslandScene';
import { themeFor } from '../art/themes';
import { MAX_SPINS } from '../game/config';
import { availableBets, canSpin, islandDef, msUntilNextSpin } from '../game/engine';
import type { SpinResult } from '../game/types';
import { formatDuration, t } from '../i18n';
import { useGame } from '../state/GameProvider';
import { GameButton } from '../ui/GameButton';
import { GameText } from '../ui/GameText';
import { BuildSheet } from '../components/BuildSheet';
import { Hud } from '../components/Hud';
import { IslandCompleteSheet, NewsSheet } from '../components/InfoSheets';
import { StormMeter } from '../components/StormMeter';
import { AttackSheet, RaidSheet, StormSheet } from '../components/TargetSheets';
import { CoinBurst, Toast, type ToastData } from '../components/Toast';
import { Wheel, type WheelHandle } from '../components/Wheel';

function resultLines(r: SpinResult): string[] {
  const lines: string[] = [];
  if (r.spinsWon > 0) lines.push(t.result.spins(r.spinsWon));
  if (r.shieldWon) lines.push(t.result.shield);
  if (r.stormFormed) lines.push(t.result.stormFormed);
  if (r.stormPowerUp) lines.push(t.result.powerUp);
  if (r.backfire) lines.push(t.result.backfire);
  return lines;
}

export function GameScreen() {
  const game = useGame();
  const { state } = game;
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const wheelRef = useRef<WheelHandle>(null);
  const commitRef = useRef<(() => void) | null>(null);
  const resultRef = useRef<SpinResult | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [burst, setBurst] = useState(0);
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

  const reward = (coins: number, lines: string[]) => {
    setToast((p) => ({ id: (p?.id ?? 0) + 1, coins, lines }));
    if (coins > 0) setBurst((n) => n + 1);
  };

  const onSpin = () => {
    if (spinning) return;
    const ticket = game.spin();
    if (!ticket) return;
    commitRef.current = ticket.commit;
    resultRef.current = ticket.result;
    setSpinning(true);
    wheelRef.current?.spin(ticket.result.symbols);
  };

  const onReelsDone = () => {
    commitRef.current?.();
    commitRef.current = null;
    setSpinning(false);
    const r = resultRef.current;
    if (r) reward(r.coinsWon, resultLines(r));
    resultRef.current = null;
  };

  const wait = msUntilNextSpin(state, now);
  const enoughSpins = state.spins >= state.bet;
  const blocked = state.pending !== null || state.justCompletedIsland !== null;
  const bets = availableBets(state);
  const theme = themeFor(islandDef(state.islandIndex).key);
  const regenPct = wait === null ? 1 : 1 - wait / (10 * 60 * 1000);

  return (
    <View style={styles.root}>
      {/* island fills the top of the screen */}
      <View style={styles.islandArea}>
        <IslandScene
          theme={theme}
          buildings={state.buildings}
          damaged={state.damaged}
          insetTop={insets.top + 112}
          insetBottom={70}
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
          <View style={{ flex: 1 }}>
            <StormMeter disabled={spinning || blocked} />
          </View>
          <GameButton variant="blue" size="sm" onPress={() => setShowBuild(true)} contentStyle={styles.buildBtn}>
            <HammerIcon size={30} />
            <GameText size={13} outline="#0f3a6b">
              {t.build}
            </GameText>
          </GameButton>
        </View>
      </View>

      {/* the slot machine */}
      <LinearGradient colors={['#8a5a2b', '#5e3b19', '#3d240d']} style={[styles.machine, { paddingBottom: Math.max(10, insets.bottom) }]}>
        <View style={styles.machineRim} />
        <Wheel ref={wheelRef} onDone={onReelsDone} />

        <View style={styles.controls}>
          <GameButton
            variant="wood"
            size="sm"
            disabled={spinning || bets.length < 2}
            onPress={game.cycleBet}
            style={styles.betBtn}
            contentStyle={{ paddingVertical: 10 }}
          >
            <GameText size={11} weight="heavy" color="#ffe9c2">
              {t.bet}
            </GameText>
            <GameText size={24} color="#ffd84d" outline="#3a2210">
              x{state.bet}
            </GameText>
          </GameButton>

          <GameButton
            size="lg"
            variant={enoughSpins ? 'gold' : 'wood'}
            disabled={spinning || !canSpin(state)}
            onPress={onSpin}
            style={{ flex: 1 }}
          >
            <GameText size={30} outline="#8a3f00" style={{ letterSpacing: 1 }}>
              {enoughSpins ? t.spin : t.noSpins}
            </GameText>
          </GameButton>
        </View>

        <View style={styles.energy}>
          <EnergyIcon size={30} />
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
      <CoinBurst key={burst} id={burst} from={{ x: width / 2, y: height * 0.55 }} to={{ x: 34, y: insets.top + 26 }} />

      <BuildSheet visible={showBuild} onClose={() => setShowBuild(false)} />
      <NewsSheet
        visible={showNews}
        onClose={() => {
          setShowNews(false);
          game.markLogRead();
        }}
      />
      {!spinning ? (
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
    left: 0,
    right: 12,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  buildBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  machine: {
    paddingTop: 16,
    paddingHorizontal: 14,
    gap: 12,
    borderTopWidth: 4,
    borderColor: '#2b1606',
  },
  machineRim: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: '#d9a441' },
  controls: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  betBtn: { width: 82 },
  energy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
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

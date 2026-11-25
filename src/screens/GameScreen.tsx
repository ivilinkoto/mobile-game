import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { availableBets, canSpin, msUntilNextSpin } from '../game/engine';
import type { SpinResult, SymbolId } from '../game/types';
import { formatCoins, formatDuration, t } from '../i18n';
import { useGame } from '../state/GameProvider';
import { GameButton } from '../ui/GameButton';
import { colors } from '../ui/theme';
import { BuildSheet } from '../components/BuildSheet';
import { Hud } from '../components/Hud';
import { IslandCompleteSheet, NewsSheet } from '../components/InfoSheets';
import { IslandView } from '../components/IslandView';
import { StormMeter } from '../components/StormMeter';
import { AttackSheet, RaidSheet, StormSheet } from '../components/TargetSheets';
import { Toast } from '../components/Toast';
import { Wheel } from '../components/Wheel';

function describeResult(r: SpinResult): string | null {
  const parts: string[] = [];
  if (r.coinsWon > 0) parts.push(t.result.coins(formatCoins(r.coinsWon)));
  if (r.spinsWon > 0) parts.push(t.result.spins(r.spinsWon));
  if (r.shieldWon) parts.push(t.result.shield);
  if (r.stormFormed) parts.push(t.result.stormFormed);
  if (r.stormPowerUp) parts.push(t.result.powerUp);
  if (r.backfire) parts.push(t.result.backfire);
  return parts.length ? parts.join('\n') : null;
}

export function GameScreen() {
  const game = useGame();
  const { state } = game;
  const [spinId, setSpinId] = useState(0);
  const [target, setTarget] = useState<[SymbolId, SymbolId, SymbolId] | null>(null);
  const [commit, setCommit] = useState<(() => void) | null>(null);
  const [pendingResult, setPendingResult] = useState<SpinResult | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string | null }>({ id: 0, text: null });
  const [showBuild, setShowBuild] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Show news automatically when the player returns to unread events.
  useEffect(() => {
    if (state.unread > 0 && state.log[0] && state.log[0].kind.startsWith('incoming')) setShowNews(true);
    // only on first mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spinning = commit !== null;
  const showToast = (text: string | null) => setToast((p) => ({ id: p.id + 1, text }));

  const onSpin = () => {
    if (spinning) return;
    const ticket = game.spin();
    if (!ticket) return;
    setTarget(ticket.result.symbols);
    setPendingResult(ticket.result);
    setCommit(() => ticket.commit);
    setSpinId((n) => n + 1);
  };

  const onReelsDone = () => {
    commit?.();
    setCommit(null);
    if (pendingResult) showToast(describeResult(pendingResult));
    setPendingResult(null);
  };

  const wait = msUntilNextSpin(state, now);
  const enoughSpins = state.spins >= state.bet;
  const blocked = state.pending !== null || state.justCompletedIsland !== null;
  const bets = availableBets(state);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Hud
          onOpenNews={() => {
            setShowNews(true);
            game.markLogRead();
          }}
        />
        <View style={styles.island}>
          <IslandView islandIndex={state.islandIndex} buildings={state.buildings} damaged={state.damaged} />
          <GameButton label={`🔨 ${t.build}`} variant="wood" size="sm" onPress={() => setShowBuild(true)} style={styles.buildBtn} />
        </View>

        <StormMeter disabled={spinning || blocked} />

        <View style={styles.machine}>
          <Wheel target={target} spinId={spinId} onDone={onReelsDone} />
          <View style={styles.controls}>
            <GameButton
              variant="wood"
              size="sm"
              disabled={spinning || bets.length < 2}
              onPress={game.cycleBet}
              style={styles.betBtn}
            >
              <Text style={styles.betLabel}>{t.bet}</Text>
              <Text style={styles.betValue}>x{state.bet}</Text>
            </GameButton>
            <GameButton
              size="lg"
              variant={enoughSpins ? 'gold' : 'wood'}
              disabled={spinning || !canSpin(state)}
              onPress={onSpin}
              style={{ flex: 1 }}
            >
              <Text style={styles.spinLabel}>{enoughSpins ? t.spin : t.noSpins}</Text>
              <Text style={styles.spinCount}>
                ⚡ {state.spins} · {wait === null ? t.spinsFull : t.nextSpinIn(formatDuration(wait))}
              </Text>
            </GameButton>
          </View>
        </View>
      </SafeAreaView>

      <Toast id={toast.id} text={toast.text} />

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
          <AttackSheet onResult={showToast} />
          <RaidSheet />
          <StormSheet onResult={showToast} />
          <IslandCompleteSheet />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night },
  safe: { flex: 1, gap: 10 },
  island: { flex: 1 },
  buildBtn: { position: 'absolute', right: 22, bottom: 10 },
  machine: {
    backgroundColor: colors.deep,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 6,
    gap: 12,
  },
  controls: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  betBtn: { width: 76 },
  betLabel: { color: colors.textLight, fontSize: 12, fontWeight: '700' },
  betValue: { color: colors.gold, fontSize: 22, fontWeight: '900' },
  spinLabel: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: 1 },
  spinCount: { fontSize: 13, fontWeight: '800', color: colors.woodDark },
});

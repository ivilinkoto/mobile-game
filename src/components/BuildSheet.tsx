import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { Building } from '../art/Buildings';
import { CoinIcon, HammerIcon, StarIcon } from '../art/Icons';
import { themeFor } from '../art/themes';
import { MAX_BUILDING_LEVEL } from '../game/config';
import { islandDef, nextBuildCost, repairCost } from '../game/engine';
import { formatCoins, t } from '../i18n';
import { useGame } from '../state/GameProvider';
import { GameButton } from '../ui/GameButton';
import { GameText } from '../ui/GameText';
import { Sheet } from '../ui/Sheet';

export function BuildSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { state, build, repair } = useGame();
  const theme = themeFor(islandDef(state.islandIndex).key);

  return (
    <Sheet visible={visible} title={t.buildTitle} icon={<HammerIcon size={28} />} onClose={onClose}>
      <View style={styles.wallet}>
        <CoinIcon size={26} />
        <GameText size={20} color="#fff">
          {formatCoins(state.coins)}
        </GameText>
      </View>
      <ScrollView contentContainerStyle={{ gap: 8 }} style={{ flexGrow: 0 }}>
        {[0, 1, 2, 3, 4].map((b) => {
          const level = state.buildings[b];
          const damaged = state.damaged[b];
          const cost = damaged ? repairCost(state, b) : nextBuildCost(state, b);
          const affordable = cost !== null && state.coins >= cost;
          const preview = damaged || cost === null ? level : level + 1;
          return (
            <LinearGradient key={b} colors={['#fffaf0', '#f1deb4']} style={styles.row}>
              <View style={styles.art}>
                <Building type={b} level={preview} damaged={damaged} theme={theme} size={66} still />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <GameText size={17} color="#3a2210" outline={false}>
                  {t.buildingNames[b]}
                </GameText>
                <View style={styles.stars}>
                  {Array.from({ length: MAX_BUILDING_LEVEL }, (_, i) => (
                    <StarIcon key={i} size={18} filled={i < level} />
                  ))}
                </View>
                {damaged ? (
                  <GameText size={12} color="#d92c36" outline={false}>
                    {t.damaged}
                  </GameText>
                ) : null}
              </View>
              {cost === null ? (
                <GameText size={15} color="#2fa83a" outline={false}>
                  ✓ {t.maxed}
                </GameText>
              ) : (
                <GameButton
                  size="sm"
                  variant={damaged ? 'danger' : 'green'}
                  disabled={!affordable}
                  onPress={() => {
                    const ok = damaged ? repair(b) : build(b);
                    if (ok) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                  }}
                  contentStyle={styles.btn}
                >
                  <GameText size={12} outline="#145218">
                    {damaged ? t.repair : t.upgrade}
                  </GameText>
                  <View style={styles.cost}>
                    <CoinIcon size={16} />
                    <GameText size={15}>{formatCoins(cost)}</GameText>
                  </View>
                </GameButton>
              )}
            </LinearGradient>
          );
        })}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  wallet: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3a2210',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    padding: 8,
    borderWidth: 2,
    borderColor: '#e2c48a',
  },
  art: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: '#cdebb0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#9cc27a',
  },
  stars: { flexDirection: 'row', gap: 2 },
  btn: { paddingHorizontal: 10, minWidth: 92 },
  cost: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});

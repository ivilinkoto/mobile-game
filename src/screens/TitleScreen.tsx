// Title screen shown on launch: the logo drops in over the island, then a
// pulsing Play button. Tapping Play also counts as the first user gesture,
// which some platforms need before music can start.

import { useEffect, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ISLAND_IMAGES, LOGO_IMAGE } from '../art/images';
import { t } from '../i18n';
import { GameButton } from '../ui/GameButton';
import { GameText } from '../ui/GameText';

export function TitleScreen({ onPlay }: { onPlay: () => void }) {
  const { width, height } = useWindowDimensions();
  const [drop] = useState(() => new Animated.Value(0));
  const [float] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.spring(drop, { toValue: 1, useNativeDriver: true, bounciness: 12, speed: 6 }).start();
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    );
    floatLoop.start();
    pulseLoop.start();
    return () => {
      floatLoop.stop();
      pulseLoop.stop();
    };
  }, [drop, float, pulse]);

  const island = ISLAND_IMAGES.tropic;
  const logoSize = Math.min(width * 0.9, height * 0.48, 460);
  const bgH = Math.max(height, (width * island.height) / island.width);
  const bgW = (bgH * island.width) / island.height;

  return (
    <View style={styles.root}>
      <Image source={island.source} style={{ position: 'absolute', width: bgW, height: bgH, left: (width - bgW) / 2, top: (height - bgH) / 2 }} />
      <LinearGradient colors={['rgba(12,36,64,0.85)', 'rgba(12,36,64,0.25)', 'rgba(12,36,64,0.9)']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        <Animated.View
          style={{
            transform: [
              { translateY: drop.interpolate({ inputRange: [0, 1], outputRange: [-height * 0.6, 0] }) },
              { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
              { scale: drop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
            ],
          }}
        >
          <Image source={LOGO_IMAGE} style={{ width: logoSize, height: logoSize }} />
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }] }}>
          <GameButton label={t.play} variant="green" size="lg" onPress={onPlay} contentStyle={styles.play} />
        </Animated.View>

        <GameText size={11} weight="bold" color="rgba(255,255,255,0.5)" outline={false}>
          v0.1 · preview
        </GameText>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c2440', overflow: 'hidden' },
  safe: { flex: 1, alignItems: 'center', justifyContent: 'space-evenly', paddingBottom: 16 },
  play: { paddingHorizontal: 56 },
});

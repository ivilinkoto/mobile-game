import { type ReactNode, useState } from 'react';
import { Animated, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { sfx } from '../audio/sound';
import { GameText } from './GameText';

type Variant = 'gold' | 'green' | 'storm' | 'wood' | 'danger' | 'blue';

const PALETTE: Record<Variant, { top: string; bottom: string; edge: string; fg: string; outline: string }> = {
  gold: { top: '#ffe766', bottom: '#ffa81c', edge: '#b35f00', fg: '#fff', outline: '#8a3f00' },
  green: { top: '#8ee85a', bottom: '#2fa83a', edge: '#1b6b22', fg: '#fff', outline: '#145218' },
  storm: { top: '#b49bff', bottom: '#6a3fe0', edge: '#3b1f99', fg: '#fff', outline: '#2c1673' },
  wood: { top: '#c98a4b', bottom: '#8a5a2b', edge: '#4d2f12', fg: '#fff3d6', outline: '#3a2210' },
  danger: { top: '#ff8a7a', bottom: '#e0323a', edge: '#8f1820', fg: '#fff', outline: '#6b1016' },
  blue: { top: '#7fd3ff', bottom: '#2a86e0', edge: '#164f8f', fg: '#fff', outline: '#0f3a6b' },
};

interface Props {
  label?: string;
  children?: ReactNode;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

/** Glossy, chunky 3D button with a press-down bounce. */
export function GameButton({ label, children, onPress, variant = 'gold', disabled, size = 'md', style, contentStyle }: Props) {
  const scale = useState(() => new Animated.Value(1))[0];
  const p = PALETTE[disabled ? 'wood' : variant];
  const pad = size === 'lg' ? 14 : size === 'sm' ? 7 : 10;
  const font = size === 'lg' ? 30 : size === 'sm' ? 15 : 19;
  const radius = size === 'lg' ? 22 : 14;

  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 10 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        disabled={disabled}
        onPressIn={() => to(0.93)}
        onPressOut={() => to(1)}
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          sfx('tap', 0.6);
          onPress();
        }}
        style={[styles.outer, { borderRadius: radius + 3, backgroundColor: p.edge, opacity: disabled ? 0.6 : 1 }]}
      >
        <LinearGradient
          colors={[p.top, p.bottom]}
          style={[styles.face, { borderRadius: radius, paddingVertical: pad }, contentStyle]}
        >
          <View style={[styles.gloss, { borderRadius: radius }]} pointerEvents="none" />
          {label ? (
            <GameText size={font} color={p.fg} outline={p.outline}>
              {label}
            </GameText>
          ) : (
            children
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingBottom: 5,
    padding: 2,
    borderWidth: 2,
    borderColor: '#2b1606',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  face: {
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    left: 4,
    right: 4,
    top: 3,
    height: '42%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});

import { useRef, type ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

import { colors } from './theme';

type Variant = 'gold' | 'green' | 'storm' | 'wood' | 'danger';

const PALETTE: Record<Variant, { bg: string; edge: string; fg: string }> = {
  gold: { bg: colors.gold, edge: colors.goldDark, fg: colors.text },
  green: { bg: colors.green, edge: colors.greenDark, fg: '#fff' },
  storm: { bg: colors.storm, edge: colors.stormDark, fg: '#fff' },
  wood: { bg: colors.wood, edge: colors.woodDark, fg: colors.textLight },
  danger: { bg: colors.danger, edge: '#a3262a', fg: '#fff' },
};

interface Props {
  label?: string;
  children?: ReactNode;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

export function GameButton({ label, children, onPress, variant = 'gold', disabled, size = 'md', style }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const p = PALETTE[variant];
  const pad = size === 'lg' ? 16 : size === 'sm' ? 6 : 10;
  const font = size === 'lg' ? 26 : size === 'sm' ? 14 : 17;

  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 8 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        disabled={disabled}
        onPressIn={() => to(0.94)}
        onPressOut={() => to(1)}
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          onPress();
        }}
        style={[
          styles.btn,
          { backgroundColor: p.bg, borderBottomColor: p.edge, paddingVertical: pad, opacity: disabled ? 0.45 : 1 },
        ]}
      >
        {label ? <Text style={[styles.label, { color: p.fg, fontSize: font }]}>{label}</Text> : children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 14,
    borderBottomWidth: 5,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontWeight: '900', letterSpacing: 0.5 },
});

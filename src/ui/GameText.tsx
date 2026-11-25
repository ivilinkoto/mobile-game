import { Text, type TextProps, type TextStyle } from 'react-native';

export const FONT = {
  black: 'Rubik_900Black',
  heavy: 'Rubik_800ExtraBold',
  bold: 'Rubik_700Bold',
  medium: 'Rubik_500Medium',
};

interface Props extends TextProps {
  size?: number;
  color?: string;
  weight?: keyof typeof FONT;
  /** Dark outline-style shadow, like most casual games use for titles/numbers. */
  outline?: string | false;
}

export function GameText({ size = 16, color = '#fff', weight = 'black', outline = '#2b1606', style, ...rest }: Props) {
  const base: TextStyle = {
    fontFamily: FONT[weight],
    fontSize: size,
    color,
    ...(outline
      ? {
          textShadowColor: outline,
          textShadowOffset: { width: 0, height: Math.max(1.5, size / 12) },
          textShadowRadius: Math.max(1, size / 14),
        }
      : null),
  };
  return <Text {...rest} style={[base, style]} />;
}

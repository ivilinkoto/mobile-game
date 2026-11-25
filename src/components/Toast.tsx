import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { colors } from '../ui/theme';

/** Big floating reward text that rises and fades. Re-keys on `id`. */
export function Toast({ id, text }: { id: number; text: string | null }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!text) return;
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 1600, useNativeDriver: true }).start();
  }, [id, text, anim]);
  if (!text) return null;
  return (
    <Animated.Text
      pointerEvents="none"
      style={[
        styles.text,
        {
          opacity: anim.interpolate({ inputRange: [0, 0.1, 0.75, 1], outputRange: [0, 1, 1, 0] }),
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, -40] }) },
            { scale: anim.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0.6, 1.1, 1] }) },
          ],
        },
      ]}
    >
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
    fontSize: 30,
    fontWeight: '900',
    color: colors.gold,
    textShadowColor: '#000',
    textShadowRadius: 6,
    textShadowOffset: { width: 0, height: 2 },
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

import { useEffect, type ReactNode, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import { GameText } from './GameText';

interface Props {
  visible: boolean;
  title: string;
  icon?: ReactNode;
  onClose?: () => void;
  children: ReactNode;
}

/** Parchment popup with a red ribbon title and a springy entrance. */
export function Sheet({ visible, title, icon, onClose, children }: Props) {
  const pop = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    if (!visible) return;
    pop.setValue(0);
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, bounciness: 10, speed: 14 }).start();
  }, [visible, pop]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose ?? (() => {})}>
      <View style={styles.backdrop}>
        {onClose ? <Pressable style={StyleSheet.absoluteFill} onPress={onClose} /> : null}
        <Animated.View
          style={[
            styles.frame,
            { transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }], opacity: pop },
          ]}
        >
          <LinearGradient colors={['#fff7df', '#f3dfb3']} style={styles.panel}>
            <View style={styles.inner}>{children}</View>
          </LinearGradient>
          <Ribbon title={title} icon={icon} />
          {onClose ? (
            <Pressable onPress={onClose} style={styles.close} hitSlop={10}>
              <LinearGradient colors={['#ff8a7a', '#d92c36']} style={styles.closeFace}>
                <GameText size={18} outline="#6b1016">
                  ✕
                </GameText>
              </LinearGradient>
            </Pressable>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

function Ribbon({ title, icon }: { title: string; icon?: ReactNode }) {
  return (
    <View style={styles.ribbonWrap} pointerEvents="none">
      <View style={{ maxWidth: '100%' }}>
        <Svg width={28} height={40} viewBox="0 0 28 40" style={styles.tailL}>
          <Path d="M28 4 L2 4 L12 20 L2 36 L28 36 Z" fill="#a51f2a" stroke="#4d0d12" strokeWidth={2.5} />
        </Svg>
        <Svg width={28} height={40} viewBox="0 0 28 40" style={styles.tailR}>
          <Path d="M0 4 L26 4 L16 20 L26 36 L0 36 Z" fill="#a51f2a" stroke="#4d0d12" strokeWidth={2.5} />
        </Svg>
        <LinearGradient colors={['#ff6b6b', '#d62f3a']} style={styles.ribbon}>
          {icon}
          <GameText size={20} outline="#5a0d14" numberOfLines={2} style={{ textAlign: 'center', flexShrink: 1 }}>
            {title}
          </GameText>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,15,30,0.72)',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  frame: { maxHeight: '100%' },
  panel: {
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#8a5a2b',
    padding: 4,
    marginTop: 22,
    flexShrink: 1,
  },
  inner: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#e2c48a',
    paddingTop: 34,
    paddingHorizontal: 12,
    paddingBottom: 14,
    flexShrink: 1,
  },
  ribbonWrap: {
    position: 'absolute',
    top: 0,
    left: 44,
    right: 44,
    alignItems: 'center',
  },
  ribbon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 46,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#4d0d12',
    maxWidth: '100%',
  },
  tailL: { position: 'absolute', left: -20, top: 10 },
  tailR: { position: 'absolute', right: -20, top: 10 },
  close: { position: 'absolute', right: -6, top: 12 },
  closeFace: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    borderColor: '#4d0d12',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

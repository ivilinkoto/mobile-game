import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from './theme';

interface Props {
  visible: boolean;
  title: string;
  onClose?: () => void;
  children: ReactNode;
}

/** A parchment-style modal panel used for every popup in the game. */
export function Sheet({ visible, title, onClose, children }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose ?? (() => {})}>
      <View style={styles.backdrop}>
        {onClose ? <Pressable style={StyleSheet.absoluteFill} onPress={onClose} /> : null}
        <View style={styles.panel}>
          <Text style={styles.title}>{title}</Text>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,15,30,0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  panel: {
    backgroundColor: colors.panel,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: colors.panelEdge,
    padding: 16,
    maxHeight: '88%',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
});

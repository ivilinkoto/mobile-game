import { useSyncExternalStore } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { getAudioSettings, setAudioSettings, subscribeAudioSettings, type AudioSettings } from '../audio/sound';
import { GearIcon } from '../art/Icons';
import { LANGUAGES, getLang, setLang, subscribeLang, t, type Lang } from '../i18n';
import { GameText } from '../ui/GameText';
import { Sheet } from '../ui/Sheet';

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <LinearGradient colors={['#fffaf0', '#f1deb4']} style={styles.row}>
      <GameText size={17} color="#3a2210" outline={false} style={{ flex: 1 }}>
        {label}
      </GameText>
      <Pressable onPress={() => onChange(!value)} hitSlop={8}>
        <View style={[styles.track, value ? styles.trackOn : styles.trackOff]}>
          <View style={[styles.knob, value ? { right: 3 } : { left: 3 }]} />
          <GameText size={12} style={[styles.state, value ? { left: 10 } : { right: 8 }]}>
            {value ? t.settings.on : t.settings.off}
          </GameText>
        </View>
      </Pressable>
    </LinearGradient>
  );
}

export function SettingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const audio: AudioSettings = useSyncExternalStore(subscribeAudioSettings, getAudioSettings);
  const lang = useSyncExternalStore(subscribeLang, getLang);
  return (
    <Sheet visible={visible} title={t.settings.title} icon={<GearIcon size={26} />} onClose={onClose}>
      <View style={{ gap: 8 }}>
        <Toggle label={t.settings.music} value={audio.music} onChange={(music) => setAudioSettings({ music })} />
        <Toggle label={t.settings.sfx} value={audio.sfx} onChange={(sfx) => setAudioSettings({ sfx })} />
        <LinearGradient colors={['#fffaf0', '#f1deb4']} style={[styles.row, styles.langRow]}>
          <GameText size={17} color="#3a2210" outline={false}>
            {t.settings.language}
          </GameText>
          <View style={styles.langs}>
            {(Object.keys(LANGUAGES) as Lang[]).map((code) => (
              <Pressable
                key={code}
                onPress={() => setLang(code)}
                style={[styles.lang, code === lang ? styles.langOn : styles.langOff]}
              >
                <GameText size={14} outline={code === lang ? '#145218' : false} color={code === lang ? '#fff' : '#3a2210'}>
                  {LANGUAGES[code].name}
                </GameText>
              </Pressable>
            ))}
          </View>
        </LinearGradient>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    borderWidth: 2,
    borderColor: '#e2c48a',
  },
  track: {
    width: 78,
    height: 34,
    borderRadius: 17,
    borderWidth: 2.5,
    borderColor: '#2b1606',
    justifyContent: 'center',
  },
  trackOn: { backgroundColor: '#2fa83a' },
  trackOff: { backgroundColor: '#8c7a62' },
  knob: {
    position: 'absolute',
    top: 2,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2b1606',
  },
  state: { position: 'absolute' },
  langRow: { flexDirection: 'column', alignItems: 'stretch', gap: 8 },
  langs: { flexDirection: 'row', gap: 6 },
  lang: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2.5,
  },
  langOn: { backgroundColor: '#2fa83a', borderColor: '#145218' },
  langOff: { backgroundColor: '#fff6e0', borderColor: '#d2a55c' },
});

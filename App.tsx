import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Rubik_500Medium, Rubik_700Bold, Rubik_800ExtraBold, Rubik_900Black, useFonts } from '@expo-google-fonts/rubik';

import { ensureMusic, startAudio } from './src/audio/sound';
import { loadLang } from './src/i18n';
import { GameScreen } from './src/screens/GameScreen';
import { TitleScreen } from './src/screens/TitleScreen';
import { GameProvider } from './src/state/GameProvider';

const loading = (
  <View style={{ flex: 1, backgroundColor: '#0b1e36', alignItems: 'center', justifyContent: 'center' }}>
    <ActivityIndicator color="#ffcf33" size="large" />
  </View>
);

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ Rubik_500Medium, Rubik_700Bold, Rubik_800ExtraBold, Rubik_900Black });
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    startAudio();
    loadLang();
  }, []);
  if (!fontsLoaded && !fontError) return loading;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <GameProvider fallback={loading}>
        {playing ? <GameScreen /> : <TitleScreen
            onPlay={() => {
              ensureMusic();
              setPlaying(true);
            }}
          />}
      </GameProvider>
    </SafeAreaProvider>
  );
}

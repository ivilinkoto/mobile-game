import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GameScreen } from './src/screens/GameScreen';
import { GameProvider } from './src/state/GameProvider';
import { colors } from './src/ui/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <GameProvider
        fallback={
          <View style={{ flex: 1, backgroundColor: colors.night, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={colors.gold} size="large" />
          </View>
        }
      >
        <GameScreen />
      </GameProvider>
    </SafeAreaProvider>
  );
}

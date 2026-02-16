import { useCallback, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { AppProvider } from './src/context/AppContext';
import { LanguageProvider } from './src/i18n/LanguageContext';
import TabNavigator from './src/navigation/TabNavigator';
import SplashScreen from './src/components/SplashScreen';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashFinish = useCallback(() => {
    setSplashDone(true);
  }, []);

  if (!splashDone) {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen onFinish={handleSplashFinish} />
      </>
    );
  }

  return (
    <LanguageProvider>
      <AppProvider>
        <StatusBar style="light" />
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </AppProvider>
    </LanguageProvider>
  );
}

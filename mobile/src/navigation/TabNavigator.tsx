import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import type { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getAlertColorScheme } from '../utils/alertColors';
import { Colors } from '../constants/theme';

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import EvacuationScreen from '../screens/EvacuationScreen';
import SafetyScreen from '../screens/SafetyScreen';

const TAB_ICONS: Record<string, { outline: keyof typeof Ionicons.glyphMap; filled: keyof typeof Ionicons.glyphMap }> = {
  Home: { outline: 'home-outline', filled: 'home' },
  Map: { outline: 'map-outline', filled: 'map' },
  Evacuation: { outline: 'shield-checkmark-outline', filled: 'shield-checkmark' },
  Safety: { outline: 'information-circle-outline', filled: 'information-circle' },
};

const TAB_LABEL_KEYS: Record<string, 'navHome' | 'navMap' | 'navEvacuation' | 'navSafety'> = {
  Home: 'navHome',
  Map: 'navMap',
  Evacuation: 'navEvacuation',
  Safety: 'navSafety',
};

const Tab = createMaterialTopTabNavigator();

function CustomTabBar({ state, navigation }: MaterialTopTabBarProps) {
  const insets = useSafeAreaInsets();
  const { alertData } = useApp();
  const { t } = useLanguage();
  const level = alertData?.alertLevel ?? 0;
  const scheme = getAlertColorScheme(level);

  return (
    <View style={[styles.tabBar, { paddingBottom: 8 + insets.bottom, height: 60 + insets.bottom }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const color = isFocused ? Colors.accent : Colors.tabInactive;
        const icons = TAB_ICONS[route.name];
        const iconName = isFocused ? icons.filled : icons.outline;
        const showBadge = route.name === 'Home' && level >= 3;
        const labelKey = TAB_LABEL_KEYS[route.name];
        const label = labelKey ? t[labelKey] : route.name;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable key={route.key} style={styles.tabItem} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: isFocused }}>
            <View>
              <Ionicons name={iconName} size={22} color={color} />
              {showBadge ? (
                <View style={[styles.badge, { backgroundColor: scheme.primary }]}>
                  <Text style={styles.badgeText}>{level}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        lazy: true,
        swipeEnabled: true,
        animationEnabled: true,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} options={{ swipeEnabled: false }} />
      <Tab.Screen name="Evacuation" component={EvacuationScreen} />
      <Tab.Screen name="Safety" component={SafetyScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.tabBarBg,
    borderTopColor: Colors.tabBarBorder,
    borderTopWidth: 1,
    paddingTop: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});

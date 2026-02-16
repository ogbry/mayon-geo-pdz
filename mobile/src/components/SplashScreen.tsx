import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/theme';

type Props = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(subtitleFade, {
        toValue: 1,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
      }).start();
    });

    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, subtitleFade, onFinish]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.volcanoIcon}>
          <View style={styles.triangle} />
          <View style={styles.lavaGlow} />
        </View>
        <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>Ligtas Mayon</Animated.Text>
      </Animated.View>
      <Animated.Text style={[styles.subtitle, { opacity: subtitleFade }]}>Safety Monitoring</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
  },
  volcanoIcon: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 35,
    borderRightWidth: 35,
    borderBottomWidth: 60,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.accent,
    opacity: 0.9,
  },
  lavaGlow: {
    position: 'absolute',
    top: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.accentLight,
    opacity: 0.6,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
});

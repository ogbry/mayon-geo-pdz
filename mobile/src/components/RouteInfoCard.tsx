import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import { formatKm } from '../utils/geo';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';

type Props = {
  onViewOnMap?: () => void;
};

export default function RouteInfoCard({ onViewOnMap }: Props = {}) {
  const { selectedCenter, location, routeDistance, routeDuration, routeLoading, routeError, clearSelection } = useApp();
  const { t } = useLanguage();

  if (!selectedCenter) return null;

  const openDirections = () => {
    const dest = `${selectedCenter.lat},${selectedCenter.lng}`;
    // Use the native maps app on each platform
    const url = Platform.select({
      ios: location
        ? `maps://?saddr=${location.lat},${location.lng}&daddr=${dest}&dirflg=d`
        : `maps://?daddr=${dest}&dirflg=d`,
      android: location
        ? `google.navigation:q=${dest}&mode=d`
        : `geo:0,0?q=${dest}(${encodeURIComponent(selectedCenter.name)})`,
    });
    if (!url) return;
    Linking.openURL(url).catch(() => {
      // Fallback to Google Maps web URL
      const fallback = location
        ? `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${dest}&travelmode=driving`
        : `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
      Linking.openURL(fallback);
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t.routeDetails}</Text>

      <View style={styles.destRow}>
        <View style={styles.destDot} />
        <Text style={styles.destName} numberOfLines={1}>{selectedCenter.name}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t.distance}</Text>
          <Text style={styles.statValue}>
            {formatKm(routeDistance ? routeDistance / 1000 : null)}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t.duration}</Text>
          <Text style={styles.statValue}>
            {routeDuration ? `${Math.round(routeDuration / 60)} mins` : '—'}
          </Text>
        </View>
      </View>

      {routeError ? <Text style={styles.error}>{routeError}</Text> : null}
      {routeLoading ? <ActivityIndicator color={Colors.accent} style={{ marginTop: Spacing.sm }} /> : null}

      <Pressable style={styles.directionsBtn} onPress={openDirections}>
        <Ionicons name="navigate" size={16} color={Colors.white} />
        <Text style={styles.directionsBtnText}>{t.getDirections}</Text>
      </Pressable>

      <View style={styles.secondaryRow}>
        {onViewOnMap ? (
          <Pressable style={[styles.secondaryBtn, { flex: 1 }]} onPress={onViewOnMap}>
            <Ionicons name="map-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.secondaryBtnText}>{t.navMap}</Text>
          </Pressable>
        ) : null}
        <Pressable style={[styles.secondaryBtn, { flex: 1 }]} onPress={clearSelection}>
          <Text style={styles.secondaryBtnText}>{t.clearRoute}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginTop: Spacing.md,
  },
  title: {
    ...Typography.cardTitle,
    marginBottom: Spacing.md,
  },
  destRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  destDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  destName: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  statValue: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.cardBorder,
  },
  error: {
    color: Colors.redLight,
    marginTop: Spacing.sm,
    fontSize: 13,
  },
  directionsBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  directionsBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  secondaryBtnText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});

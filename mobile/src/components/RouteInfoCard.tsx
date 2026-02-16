import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import { formatKm } from '../utils/geo';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';

export default function RouteInfoCard() {
  const { selectedCenter, routeDistance, routeDuration, routeLoading, routeError, clearSelection } = useApp();
  const { t } = useLanguage();

  if (!selectedCenter) return null;

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

      <Pressable style={styles.clearBtn} onPress={clearSelection}>
        <Text style={styles.clearBtnText}>{t.clearRoute}</Text>
      </Pressable>
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
  clearBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  clearBtnText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});

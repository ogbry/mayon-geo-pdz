import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getAlertColorScheme } from '../utils/alertColors';
import { formatDate } from '../utils/geo';
import AlertLevelBar from './AlertLevelBar';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/theme';

export default function AlertLevelCard() {
  const { alertData, alertCachedAt, alertLoading, alertError, fetchAlert } = useApp();
  const { t } = useLanguage();
  const level = alertData?.alertLevel ?? 0;
  const scheme = getAlertColorScheme(level);

  const alertUpdatedLabel = formatDate(alertData?.updatedAt);
  const alertSyncedLabel = formatDate(alertCachedAt);

  return (
    <View style={[styles.card, { borderColor: scheme.border }]}>
      <View style={styles.header}>
        <Text style={styles.cardTitle}>{t.volcanoAlertLevel}</Text>
        <View style={[styles.badge, { backgroundColor: scheme.badge }]}>
          <Text style={[styles.badgeText, { color: scheme.badgeText }]}>{scheme.label}</Text>
        </View>
      </View>

      <View style={styles.levelRow}>
        <Text style={[styles.alertLevel, { color: scheme.primary }]}>{alertData?.alertLevel ?? '—'}</Text>
        <View style={styles.levelInfo}>
          <Text style={styles.description}>{alertData?.description ?? 'No data yet.'}</Text>
          <AlertLevelBar level={level} />
        </View>
      </View>

      <View style={styles.metaSection}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t.updated}</Text>
          <Text style={styles.metaValue}>{alertUpdatedLabel}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t.source}</Text>
          <Text style={styles.metaValue}>{alertData?.source ?? '—'}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t.lastSynced}</Text>
          <Text style={styles.metaValue}>{alertSyncedLabel}</Text>
        </View>
      </View>

      {alertError ? <Text style={styles.error}>{alertError}</Text> : null}

      <Pressable style={[styles.refreshBtn, { borderColor: scheme.border }]} onPress={fetchAlert}>
        {alertLoading ? (
          <ActivityIndicator color={scheme.primary} size="small" />
        ) : (
          <Text style={[styles.refreshText, { color: scheme.primary }]}>{t.refreshAlert}</Text>
        )}
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
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.cardTitle,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
  },
  alertLevel: {
    ...Typography.alertLevel,
  },
  levelInfo: {
    flex: 1,
    paddingTop: Spacing.sm,
  },
  description: {
    ...Typography.body,
    color: Colors.text,
  },
  metaSection: {
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  metaLabel: {
    ...Typography.label,
  },
  metaValue: {
    ...Typography.value,
  },
  error: {
    color: Colors.redLight,
    marginTop: Spacing.sm,
    fontSize: 13,
  },
  refreshBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  refreshText: {
    fontWeight: '600',
    fontSize: 14,
  },
});

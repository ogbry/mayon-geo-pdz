import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/theme';

export default function BulletinCard() {
  const { alertData } = useApp();
  const { t } = useLanguage();
  const bulletin = alertData?.bulletin;

  if (!bulletin) return null;

  const hasContent =
    bulletin.plume || bulletin.eruption || bulletin.seismicity || bulletin.sulfurDioxide;

  if (!hasContent) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.bulletinTitle}</Text>
        {bulletin.bulletinDate ? <Text style={styles.date}>{bulletin.bulletinDate}</Text> : null}
      </View>

      {bulletin.plume ? (
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(139,155,184,0.12)' }]}>
            <Ionicons name="cloudy-outline" size={18} color={Colors.textSecondary} />
          </View>
          <View style={styles.rowContent}>
            <View style={styles.rowHeader}>
              <Text style={styles.label}>{t.bulletinAshfall}</Text>
              {bulletin.plumeDirection ? (
                <View style={styles.directionPill}>
                  <Ionicons name="navigate-outline" size={11} color={Colors.accentLight} />
                  <Text style={styles.directionText}>
                    {t.directions[bulletin.plumeDirection as keyof typeof t.directions] ?? bulletin.plumeDirection}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.value}>{bulletin.plume}</Text>
          </View>
        </View>
      ) : null}

      {bulletin.eruption ? (
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(249,115,22,0.12)' }]}>
            <Ionicons name="flame-outline" size={18} color={Colors.accent} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.label}>{t.bulletinEruption}</Text>
            <Text style={styles.value}>{bulletin.eruption}</Text>
          </View>
        </View>
      ) : null}

      {bulletin.seismicity ? (
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
            <Ionicons name="pulse-outline" size={18} color={Colors.blueLight} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.label}>{t.bulletinSeismicity}</Text>
            <Text style={styles.value}>{bulletin.seismicity}</Text>
          </View>
        </View>
      ) : null}

      {bulletin.sulfurDioxide ? (
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(234,179,8,0.12)' }]}>
            <Ionicons name="warning-outline" size={18} color={Colors.yellowLight} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.label}>{t.bulletinSulfurDioxide}</Text>
            <Text style={styles.value}>{bulletin.sulfurDioxide}</Text>
          </View>
        </View>
      ) : null}

      {bulletin.groundDeformation ? (
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(20,184,166,0.12)' }]}>
            <Ionicons name="trending-up-outline" size={18} color={Colors.teal} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.label}>{t.bulletinGroundDeformation}</Text>
            <Text style={styles.value}>{bulletin.groundDeformation}</Text>
          </View>
        </View>
      ) : null}

      <Text style={styles.source}>{t.bulletinSource}</Text>
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
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.cardTitle,
  },
  date: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  directionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(249,115,22,0.12)',
  },
  directionText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentLight,
  },
  source: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: Spacing.md,
    textAlign: 'right',
  },
});

import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import { formatKm } from '../utils/geo';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/theme';

export default function StatusCard() {
  const { userDistanceInfo, searchedDistanceInfo, locationError } = useApp();
  const { t } = useLanguage();

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{t.status}</Text>

      <View style={styles.row}>
        <Text style={styles.label}>{t.distanceFromMayon}</Text>
        <Text style={styles.value}>
          {userDistanceInfo ? formatKm(userDistanceInfo.distanceKm) : '—'}
        </Text>
      </View>

      {userDistanceInfo ? (
        <View style={[styles.pdzBadge, { backgroundColor: userDistanceInfo.isInsidePDZ ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)' }]}>
          <View style={[styles.pdzDot, { backgroundColor: userDistanceInfo.isInsidePDZ ? Colors.red : Colors.green }]} />
          <Text style={[styles.pdzText, { color: userDistanceInfo.isInsidePDZ ? Colors.redLight : Colors.greenLight }]}>
            {userDistanceInfo.isInsidePDZ ? t.insidePDZ : t.outsidePDZ}
          </Text>
        </View>
      ) : null}

      {searchedDistanceInfo ? (
        <View style={styles.searchedSection}>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>{t.searchedLocation}</Text>
            <Text style={styles.value}>{formatKm(searchedDistanceInfo.distanceKm)}</Text>
          </View>
          <View style={[styles.pdzBadge, { backgroundColor: searchedDistanceInfo.isInsidePDZ ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)' }]}>
            <View style={[styles.pdzDot, { backgroundColor: searchedDistanceInfo.isInsidePDZ ? Colors.red : Colors.green }]} />
            <Text style={[styles.pdzText, { color: searchedDistanceInfo.isInsidePDZ ? Colors.redLight : Colors.greenLight }]}>
              {searchedDistanceInfo.isInsidePDZ ? t.insidePDZ : t.outsidePDZ}
            </Text>
          </View>
        </View>
      ) : null}

      {locationError ? <Text style={styles.error}>{locationError}</Text> : null}
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
  cardTitle: {
    ...Typography.cardTitle,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    ...Typography.label,
  },
  value: {
    ...Typography.value,
    fontWeight: '600',
  },
  pdzBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  pdzDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pdzText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchedSection: {
    marginTop: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: Spacing.md,
  },
  error: {
    color: Colors.redLight,
    marginTop: Spacing.sm,
    fontSize: 13,
  },
});

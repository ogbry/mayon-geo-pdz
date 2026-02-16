import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import SafetySection from '../components/SafetySection';
import EmergencyContactRow from '../components/EmergencyContactRow';
import { EMERGENCY_CONTACTS } from '../constants';
import { getAlertColorScheme } from '../utils/alertColors';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/theme';

export default function SafetyScreen() {
  const insets = useSafeAreaInsets();
  const { alertData, isRefreshing, refreshAlert } = useApp();
  const { t } = useLanguage();
  const level = alertData?.alertLevel ?? 0;
  const scheme = getAlertColorScheme(level);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.xl }]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refreshAlert}
          tintColor={Colors.accent}
          colors={[Colors.accent]}
          progressBackgroundColor={Colors.card}
        />
      }
    >
      <Text style={styles.title}>{t.safetyInformation}</Text>

      {level >= 3 ? (
        <View style={[styles.warningBanner, { backgroundColor: scheme.background, borderColor: scheme.border }]}>
          <Text style={[styles.warningText, { color: scheme.text }]}>
            Alert Level {level}: {t.beReadyToEvacuate}
          </Text>
        </View>
      ) : null}

      <Text style={styles.sectionHeader}>{t.safetyPrecautions}</Text>

      <SafetySection
        title={t.beforeEruption}
        tips={t.tipsBefore}
        icon="time-outline"
        defaultOpen
      />
      <SafetySection
        title={t.duringEvacuation}
        tips={t.tipsDuring}
        icon="walk-outline"
      />
      <SafetySection
        title={t.volcanicHazards}
        tips={t.tipsHazards}
        icon="warning-outline"
      />
      <SafetySection
        title={t.emergencyKit}
        tips={t.tipsKit}
        icon="medkit-outline"
      />

      <View style={styles.infoNote}>
        <Text style={styles.infoNoteText}>{t.stayInformed}</Text>
      </View>

      <Text style={styles.sectionHeader}>{t.emergencyContacts}</Text>

      {EMERGENCY_CONTACTS.map((contact, index) => (
        <EmergencyContactRow key={index} contact={contact} />
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.xl,
  },
  title: {
    ...Typography.heading,
    marginBottom: Spacing.lg,
  },
  warningBanner: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    ...Shadows.cardSmall,
  },
  warningText: {
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  sectionHeader: {
    ...Typography.cardTitle,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  infoNote: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  infoNoteText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});

import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import { languageNames } from '../i18n/translations';
import type { Language } from '../i18n/translations';
import AlertLevelCard from '../components/AlertLevelCard';
import StatusCard from '../components/StatusCard';
import SOSButton from '../components/SOSButton';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';

const LANGUAGES: Language[] = ['en', 'fil', 'bik'];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isRefreshing, refreshAll, tileCacheMeta } = useApp();
  const { language, setLanguage, t } = useLanguage();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.xl }]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refreshAll}
          tintColor={Colors.accent}
          colors={[Colors.accent]}
          progressBackgroundColor={Colors.card}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t.appName}</Text>
        <Text style={styles.subtitle}>{t.appTagline}</Text>
      </View>

      <View style={styles.langRow}>
        <Ionicons name="globe-outline" size={14} color={Colors.textMuted} />
        {LANGUAGES.map((lang) => (
          <Pressable
            key={lang}
            style={[styles.langPill, language === lang && styles.langPillActive]}
            onPress={() => setLanguage(lang)}
          >
            <Text style={[styles.langText, language === lang && styles.langTextActive]}>
              {languageNames[lang]}
            </Text>
          </Pressable>
        ))}
      </View>

      <AlertLevelCard />
      <StatusCard />
      <SOSButton />

      {tileCacheMeta?.completedAt ? (
        <View style={styles.offlineIndicator}>
          <Ionicons name="cloud-offline" size={14} color={Colors.teal} />
          <Text style={styles.offlineText}>{t.offlineMapCached}</Text>
        </View>
      ) : null}
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.title,
  },
  subtitle: {
    ...Typography.subtitle,
    marginTop: Spacing.xs,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  langPill: {
    paddingVertical: 5,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  langPillActive: {
    backgroundColor: Colors.accentDark,
    borderColor: Colors.accent,
  },
  langText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  langTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginTop: Spacing.lg,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.teal,
  },
});

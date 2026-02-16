import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import { BorderRadius, Colors, Spacing } from '../constants/theme';

export default function OfflineMapBanner() {
  const {
    isOfflineMode,
    tileCacheMeta,
    tileDownloadProgress,
    startTileDownload,
    cancelTileDownload,
    toggleOfflineMode,
    clearTiles,
  } = useApp();
  const { t } = useLanguage();

  const isDownloading = tileDownloadProgress?.isDownloading ?? false;
  const hasCachedTiles = tileCacheMeta?.completedAt != null;

  // Downloading state
  if (isDownloading && tileDownloadProgress) {
    const pct = tileDownloadProgress.total > 0
      ? Math.round((tileDownloadProgress.downloaded / tileDownloadProgress.total) * 100)
      : 0;

    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <Text style={styles.label}>{t.downloadingTiles} {pct}%</Text>
          <Pressable onPress={cancelTileDownload} style={styles.cancelBtn}>
            <Ionicons name="close-circle" size={20} color={Colors.red} />
          </Pressable>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.detail}>
          {tileDownloadProgress.downloaded} / {tileDownloadProgress.total} tiles
        </Text>
      </View>
    );
  }

  // Cached — show toggle + clear
  if (hasCachedTiles) {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <Pressable
            onPress={toggleOfflineMode}
            style={[styles.pill, isOfflineMode && styles.pillActive]}
          >
            <Ionicons
              name={isOfflineMode ? 'cloud-offline' : 'cloud-offline-outline'}
              size={16}
              color={isOfflineMode ? Colors.white : Colors.textSecondary}
            />
            <Text style={[styles.pillText, isOfflineMode && styles.pillTextActive]}>
              {isOfflineMode ? t.offlineMode : t.onlineMode}
            </Text>
          </Pressable>
          <Pressable onPress={clearTiles} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
          </Pressable>
        </View>
      </View>
    );
  }

  // No cache — show download button
  return (
    <View style={styles.container}>
      <Pressable onPress={startTileDownload} style={styles.downloadBtn}>
        <Ionicons name="download-outline" size={18} color={Colors.white} />
        <Text style={styles.downloadText}>{t.downloadOfflineMap}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  detail: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 2,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  cancelBtn: {
    padding: Spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  pillActive: {
    backgroundColor: Colors.tealDark,
    borderColor: Colors.teal,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.white,
  },
  clearBtn: {
    padding: Spacing.sm,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceLight,
  },
  downloadText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
});

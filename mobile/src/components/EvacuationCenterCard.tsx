import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { EvacuationCenter } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { formatKm } from '../utils/geo';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/theme';

type Props = {
  center: EvacuationCenter;
  isSelected: boolean;
  onPress: () => void;
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  shelter: { bg: 'rgba(249,115,22,0.15)', text: '#FDBA74' },
  school: { bg: 'rgba(59,130,246,0.15)', text: '#93C5FD' },
  hospital: { bg: 'rgba(239,68,68,0.15)', text: '#FCA5A5' },
  government: { bg: 'rgba(168,85,247,0.15)', text: '#C4B5FD' },
};

const TYPE_LABELS: Record<string, keyof import('../i18n/translations').Translations> = {
  shelter: 'shelter',
  school: 'school',
  hospital: 'hospital',
  government: 'government',
};

export default function EvacuationCenterCard({ center, isSelected, onPress }: Props) {
  const { t } = useLanguage();
  const typeColor = TYPE_COLORS[center.type] ?? TYPE_COLORS.shelter;
  const typeKey = TYPE_LABELS[center.type] ?? 'shelter';
  const typeLabel = (t[typeKey] as string).toUpperCase();

  return (
    <Pressable
      style={[styles.card, isSelected && styles.cardActive]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={2}>{center.name}</Text>
        <View style={[styles.typeBadge, { backgroundColor: typeColor.bg }]}>
          <Text style={[styles.typeText, { color: typeColor.text }]}>{typeLabel}</Text>
        </View>
      </View>

      {center.distanceFromUser !== undefined ? (
        <Text style={styles.distance}>{formatKm(center.distanceFromUser)}</Text>
      ) : null}

      {center.address ? (
        <Text style={styles.address} numberOfLines={1}>{center.address}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.sm,
    ...Shadows.cardSmall,
  },
  cardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.surfaceLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  name: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  distance: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  address: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
});

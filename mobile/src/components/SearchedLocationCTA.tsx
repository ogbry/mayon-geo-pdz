import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/theme';

export default function SearchedLocationCTA() {
  const navigation = useNavigation<{ navigate: (name: string) => void }>();
  const { searchedLocation, searchedDistanceInfo } = useApp();
  const { t } = useLanguage();

  if (!searchedLocation) return null;

  const insidePdz = searchedDistanceInfo?.isInsidePDZ ?? false;
  const distanceKm = searchedDistanceInfo?.distanceKm;

  return (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate('Home')}
      android_ripple={{ color: 'rgba(255,255,255,0.06)' }}
    >
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: insidePdz ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)' }]}>
          <Ionicons
            name={insidePdz ? 'warning' : 'checkmark-circle'}
            size={20}
            color={insidePdz ? Colors.red : Colors.green}
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {searchedLocation.name}
          </Text>
          <Text style={styles.meta}>
            {distanceKm != null ? `${distanceKm.toFixed(2)} km — ` : ''}
            <Text style={{ color: insidePdz ? Colors.redLight : Colors.greenLight, fontWeight: '700' }}>
              {insidePdz ? t.insidePDZ : t.outsidePDZ}
            </Text>
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

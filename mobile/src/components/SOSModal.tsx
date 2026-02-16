import { Alert, Linking, Modal, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function SOSModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { location, centersWithDistance } = useApp();
  const { t } = useLanguage();

  const nearestCenter = centersWithDistance.length > 0 ? centersWithDistance[0] : null;
  const hasLocation = location !== null;

  const handleCall911 = () => {
    Linking.openURL('tel:911');
  };

  const handleCallObservatory = () => {
    Linking.openURL('tel:+63528242383');
  };

  const handleShareLocation = async () => {
    if (!location) return;
    const mapsLink = `https://maps.google.com/?q=${location.lat},${location.lng}`;
    const message = `${t.sosLocationMessage} ${mapsLink}`;
    try {
      await Share.share({ message });
    } catch (err) {
      if (err instanceof Error && err.message !== 'User did not share') {
        Alert.alert('Error', err.message);
      }
    }
  };

  const handleNavigate = () => {
    if (!nearestCenter) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${nearestCenter.lat},${nearestCenter.lng}`;
    Linking.openURL(url);
  };

  type ActionItem = {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    description: string;
    onPress: () => void;
    disabled: boolean;
    color: string;
  };

  const actions: ActionItem[] = [
    {
      icon: 'call',
      label: t.sosCall911,
      description: t.sosCall911Desc,
      onPress: handleCall911,
      disabled: false,
      color: Colors.red,
    },
    {
      icon: 'call',
      label: t.sosCallObservatory,
      description: t.sosCallObservatoryDesc,
      onPress: handleCallObservatory,
      disabled: false,
      color: Colors.accent,
    },
    {
      icon: 'location',
      label: t.sosShareLocation,
      description: hasLocation ? t.sosShareLocationDesc : t.sosLocationUnavailable,
      onPress: handleShareLocation,
      disabled: !hasLocation,
      color: Colors.blue,
    },
    {
      icon: 'navigate',
      label: t.sosNavigate,
      description: !hasLocation
        ? t.sosLocationUnavailable
        : nearestCenter
          ? `${nearestCenter.name ?? t.sosNavigateDesc}`
          : t.sosNoNearbyCenter,
      onPress: handleNavigate,
      disabled: !hasLocation || !nearestCenter,
      color: Colors.green,
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[styles.container, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="warning" size={24} color={Colors.red} />
            <Text style={styles.headerTitle}>{t.emergencySOS}</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={12}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.actionList}>
          {actions.map((action) => (
            <Pressable
              key={action.label}
              style={[styles.actionCard, action.disabled && styles.actionCardDisabled]}
              onPress={action.onPress}
              disabled={action.disabled}
            >
              <View style={[styles.iconCircle, { backgroundColor: action.disabled ? Colors.surface : action.color + '20' }]}>
                <Ionicons
                  name={action.icon}
                  size={24}
                  color={action.disabled ? Colors.textMuted : action.color}
                />
              </View>
              <View style={styles.actionText}>
                <Text style={[styles.actionLabel, action.disabled && styles.actionLabelDisabled]}>
                  {action.label}
                </Text>
                <Text style={[styles.actionDesc, action.disabled && styles.actionDescDisabled]} numberOfLines={2}>
                  {action.description}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={action.disabled ? Colors.textMuted : Colors.textSecondary}
              />
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxxl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    ...Typography.heading,
    color: Colors.white,
  },
  closeButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
  },
  actionList: {
    gap: Spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Shadows.cardSmall,
  },
  actionCardDisabled: {
    opacity: 0.5,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
  },
  actionLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.white,
  },
  actionLabelDisabled: {
    color: Colors.textMuted,
  },
  actionDesc: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  actionDescDisabled: {
    color: Colors.textMuted,
  },
});

import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { EmergencyContact } from '../constants';
import { BorderRadius, Colors, Spacing } from '../constants/theme';

type Props = {
  contact: EmergencyContact;
};

export default function EmergencyContactRow({ contact }: Props) {
  const handlePress = () => {
    Linking.openURL(contact.url).catch(() => {});
  };

  return (
    <Pressable style={styles.row} onPress={handlePress}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={contact.type === 'phone' ? 'call-outline' : 'link-outline'}
          size={16}
          color={Colors.blueLight}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{contact.label}</Text>
        <Text style={styles.value}>{contact.value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59,130,246,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  label: {
    color: Colors.blueLight,
    fontWeight: '600',
    fontSize: 13,
  },
  value: {
    color: Colors.text,
    fontSize: 13,
    marginTop: 2,
  },
});

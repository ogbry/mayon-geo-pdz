import { useCallback, useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing } from '../constants/theme';

type Props = {
  title: string;
  tips: string[];
  icon: keyof typeof Ionicons.glyphMap;
  defaultOpen?: boolean;
};

export default function SafetySection({ title, tips, icon, defaultOpen = false }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <View style={styles.container}>
      <Pressable style={styles.header} onPress={toggle}>
        <View style={styles.headerLeft}>
          <Ionicons name={icon} size={18} color={Colors.blueLight} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Colors.textMuted}
        />
      </Pressable>

      {isOpen ? (
        <View style={styles.content}>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    color: Colors.blueLight,
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  bullet: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  tipText: {
    color: Colors.text,
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
});

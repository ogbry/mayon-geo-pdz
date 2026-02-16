import { StyleSheet, View } from 'react-native';
import { getAlertBarColors } from '../utils/alertColors';
import { BorderRadius, Spacing } from '../constants/theme';

type Props = {
  level: number;
};

export default function AlertLevelBar({ level }: Props) {
  const barColors = getAlertBarColors();

  return (
    <View style={styles.container}>
      {barColors.map((color, index) => (
        <View
          key={index}
          style={[
            styles.segment,
            {
              backgroundColor: index <= level ? color : 'rgba(255,255,255,0.06)',
              opacity: index <= level ? 1 : 0.4,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: BorderRadius.sm,
  },
});

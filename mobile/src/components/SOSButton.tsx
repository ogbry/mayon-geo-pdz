import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n/LanguageContext';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/theme';
import SOSModal from './SOSModal';

export default function SOSButton() {
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="warning" size={20} color={Colors.white} />
        <Text style={styles.text}>{t.sos}</Text>
      </Pressable>
      <SOSModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.red,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
    ...Shadows.card,
  },
  buttonPressed: {
    backgroundColor: Colors.redDark,
  },
  text: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 2,
  },
});

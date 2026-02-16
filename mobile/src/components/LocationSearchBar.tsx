import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';

export default function LocationSearchBar() {
  const {
    searchQuery,
    setSearchQuery,
    coordQuery,
    setCoordQuery,
    searchLoading,
    searchError,
    searchedLocation,
    searchByAddress,
    searchByCoordinates,
    clearSearch,
  } = useApp();
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={t.searchByAddress}
        placeholderTextColor={Colors.textMuted}
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={searchByAddress}
        returnKeyType="search"
      />
      <Pressable style={styles.searchBtn} onPress={searchByAddress}>
        <Text style={styles.searchBtnText}>{t.search}</Text>
      </Pressable>

      <TextInput
        style={[styles.input, { marginTop: Spacing.sm }]}
        placeholder={t.coordinates}
        placeholderTextColor={Colors.textMuted}
        value={coordQuery}
        onChangeText={setCoordQuery}
        onSubmitEditing={searchByCoordinates}
        returnKeyType="search"
        keyboardType="numbers-and-punctuation"
      />
      <Pressable style={styles.coordBtn} onPress={searchByCoordinates}>
        <Text style={styles.coordBtnText}>{t.searchCoordinates}</Text>
      </Pressable>

      {(searchQuery || coordQuery || searchedLocation) ? (
        <Pressable style={styles.clearBtn} onPress={clearSearch}>
          <Text style={styles.clearBtnText}>{t.clearSearch}</Text>
        </Pressable>
      ) : null}

      {searchLoading ? <ActivityIndicator color={Colors.blueLight} style={{ marginTop: Spacing.sm }} /> : null}
      {searchError ? <Text style={styles.error}>{searchError}</Text> : null}
      {searchedLocation ? (
        <View style={styles.resultRow}>
          <View style={styles.resultDot} />
          <Text style={styles.resultText} numberOfLines={2}>{searchedLocation.name}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    fontSize: 14,
  },
  searchBtn: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.blueDark,
    alignItems: 'center',
  },
  searchBtnText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  coordBtn: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.tealDark,
    alignItems: 'center',
  },
  coordBtnText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  clearBtn: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  clearBtnText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  error: {
    color: Colors.redLight,
    marginTop: Spacing.sm,
    fontSize: 13,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  resultDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.blue,
  },
  resultText: {
    ...Typography.bodySmall,
    color: Colors.text,
    flex: 1,
  },
});

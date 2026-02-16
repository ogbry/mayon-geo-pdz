import { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import { formatDate } from '../utils/geo';
import type { EvacuationCenter } from '../types';
import EvacuationCenterCard from '../components/EvacuationCenterCard';
import RouteInfoCard from '../components/RouteInfoCard';
import { Colors, Shadows, Spacing, Typography, BorderRadius } from '../constants/theme';

export default function EvacuationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {
    centersWithDistance,
    centersCachedAt,
    centersLoading,
    centersError,
    selectedCenter,
    handleSelectCenter,
    isRefreshing,
    refreshCenters,
  } = useApp();
  const { t } = useLanguage();

  const handleCenterPress = useCallback((center: EvacuationCenter) => {
    handleSelectCenter(center);
    navigation.navigate('Map');
  }, [handleSelectCenter, navigation]);

  const centersSyncedLabel = formatDate(centersCachedAt);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>{t.evacuationCenters}</Text>
      <Text style={styles.synced}>{t.lastSyncedColon} {centersSyncedLabel}</Text>
      {centersError ? <Text style={styles.error}>{centersError}</Text> : null}
      {centersLoading && !isRefreshing ? <ActivityIndicator color={Colors.accent} /> : null}
    </View>
  );

  const renderFooter = () => (
    <View>
      <RouteInfoCard />
      <View style={{ height: 40 }} />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={centersWithDistance.slice(0, 30)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EvacuationCenterCard
            center={item}
            isSelected={selectedCenter?.id === item.id}
            onPress={() => handleCenterPress(item)}
          />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !centersLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t.noCentersFound}</Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshCenters}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
            progressBackgroundColor={Colors.card}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.heading,
    marginBottom: Spacing.xs,
  },
  synced: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  error: {
    color: Colors.redLight,
    marginTop: Spacing.sm,
    fontSize: 13,
  },
  emptyContainer: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    ...Shadows.card,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});

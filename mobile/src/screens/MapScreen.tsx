import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Circle, Marker, Polyline, UrlTile } from 'react-native-maps';
import { useApp } from '../context/AppContext';
import LocationSearchBar from '../components/LocationSearchBar';
import OfflineMapBanner from '../components/OfflineMapBanner';
import { MAYON_COORDINATES, OSM_TILE_URL, PDZ_RADIUS_KM } from '../constants';
import { Colors, Spacing } from '../constants/theme';
import { getTileCachePath } from '../utils/tileCache';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { mapRef, location, searchedLocation, selectedCenter, routeCoordinates, isOfflineMode } = useApp();

  return (
    <View style={styles.container}>
      <MapView
        ref={(ref) => {
          mapRef.current = ref;
        }}
        style={StyleSheet.absoluteFillObject}
        mapType={isOfflineMode ? 'none' : 'standard'}
        initialRegion={{
          latitude: MAYON_COORDINATES.lat,
          longitude: MAYON_COORDINATES.lng,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3,
        }}
      >
        {isOfflineMode ? (
          <UrlTile
            urlTemplate={OSM_TILE_URL}
            tileCachePath={getTileCachePath()}
            offlineMode={true}
            maximumZ={15}
            tileSize={256}
          />
        ) : null}
        <Circle
          center={{ latitude: MAYON_COORDINATES.lat, longitude: MAYON_COORDINATES.lng }}
          radius={PDZ_RADIUS_KM * 1000}
          strokeColor={Colors.pdzStroke}
          fillColor={Colors.pdzFill}
        />
        <Marker
          coordinate={{ latitude: MAYON_COORDINATES.lat, longitude: MAYON_COORDINATES.lng }}
          title="Mayon Volcano"
        />
        {location ? (
          <Marker
            coordinate={{ latitude: location.lat, longitude: location.lng }}
            pinColor={Colors.green}
            title="Your location"
          />
        ) : null}
        {searchedLocation ? (
          <Marker
            coordinate={{ latitude: searchedLocation.lat, longitude: searchedLocation.lng }}
            pinColor={Colors.blue}
            title="Searched location"
            description={searchedLocation.name}
          />
        ) : null}
        {selectedCenter ? (
          <Marker
            coordinate={{ latitude: selectedCenter.lat, longitude: selectedCenter.lng }}
            pinColor={Colors.accent}
            title={selectedCenter.name}
            description={selectedCenter.type}
          />
        ) : null}
        {routeCoordinates.length ? (
          <Polyline
            coordinates={routeCoordinates.map((coord) => ({
              latitude: coord.lat,
              longitude: coord.lng,
            }))}
            strokeColor={Colors.accent}
            strokeWidth={4}
          />
        ) : null}
      </MapView>

      <View style={[styles.searchOverlay, { top: insets.top + Spacing.sm }]}>
        <LocationSearchBar />
      </View>

      <View style={styles.bannerOverlay}>
        <OfflineMapBanner />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchOverlay: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
  },
});

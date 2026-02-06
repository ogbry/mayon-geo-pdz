import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import MapView, { Circle, Marker, Polyline, Region } from 'react-native-maps';

type AlertResponse = {
  volcano?: string;
  alertLevel: number;
  description: string;
  updatedAt: string;
  source: string;
  cached?: boolean;
};

type CachePayload<T> = {
  data: T;
  cachedAt: string;
};

type EvacuationCenterType = 'shelter' | 'school' | 'hospital' | 'government';

type EvacuationCenter = {
  id: string;
  name: string;
  type: EvacuationCenterType;
  lat: number;
  lng: number;
  address?: string;
  distanceFromUser?: number;
};

type RouteCoordinate = { lat: number; lng: number };

type SearchedLocation = { lat: number; lng: number; name: string };

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const API_URL = 'https://mayon-geo.vercel.app/api/alert';
const OSRM_API_URL = 'https://router.project-osrm.org/route/v1/driving';
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

const ALERT_CACHE_KEY = 'mayon-alert-cache';
const CENTERS_CACHE_KEY = 'mayon-centers-cache';

const MAYON_COORDINATES = { lat: 13.2548, lng: 123.6861 };
const PDZ_RADIUS_KM = 6;
const ALBAY_BOUNDING_BOX = { south: 12.9, west: 123.2, north: 13.6, east: 124.1 };

const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const ALERT_DESCRIPTIONS: Record<number, string> = {
  0: 'No Alert - Background level',
  1: 'Low Level Unrest',
  2: 'Moderate Unrest',
  3: 'High Unrest - Magmatic activity',
  4: 'Hazardous Eruption Imminent',
  5: 'Hazardous Eruption Ongoing',
};

const SAFETY_TIPS = {
  before: [
    'Know your evacuation routes and nearest evacuation centers',
    'Prepare an emergency kit with essentials for at least 3 days',
    'Keep important documents in a waterproof container',
    'Stay updated with PHIVOLCS bulletins and local advisories',
    'Know the alert levels and what each one means',
  ],
  during: [
    'Follow official evacuation orders immediately',
    'Use designated evacuation routes only',
    'Bring your emergency kit and important documents',
    'Help elderly, children, and persons with disabilities',
    'Do not attempt to cross bridges covered by lahar',
    'Stay calm and avoid panic',
  ],
  hazards: [
    'Pyroclastic flows: Extremely hot and fast-moving - evacuate immediately',
    'Ashfall: Wear N95 masks, protect eyes, stay indoors when heavy',
    'Lahar: Avoid river channels and low-lying areas during rain',
    'Lava flows: Move perpendicular to flow direction to escape',
    'Volcanic gases: Leave area if you smell sulfur or have difficulty breathing',
  ],
  kit: [
    'Water (1 gallon per person per day for 3 days)',
    'Non-perishable food and manual can opener',
    'First aid kit and prescription medications',
    'Flashlight, batteries, and portable radio',
    'N95 masks, goggles, and protective clothing',
    'Cash, IDs, and important documents',
    'Phone charger and emergency contact list',
  ],
};

const buildOverpassQuery = (bbox: typeof ALBAY_BOUNDING_BOX): string => {
  const { south, west, north, east } = bbox;
  return `
[out:json][timeout:30];
(
  node["amenity"="shelter"](${south},${west},${north},${east});
  way["amenity"="shelter"](${south},${west},${north},${east});
  node["amenity"="school"](${south},${west},${north},${east});
  way["amenity"="school"](${south},${west},${north},${east});
  node["amenity"="hospital"](${south},${west},${north},${east});
  way["amenity"="hospital"](${south},${west},${north},${east});
  node["amenity"="townhall"](${south},${west},${north},${east});
  way["amenity"="townhall"](${south},${west},${north},${east});
  node["office"="government"](${south},${west},${north},${east});
  way["office"="government"](${south},${west},${north},${east});
  node["emergency"="shelter"](${south},${west},${north},${east});
  way["emergency"="shelter"](${south},${west},${north},${east});
);
out center;
`;
};

const getTypeFromTags = (tags: Record<string, string>): EvacuationCenterType => {
  if (tags.amenity === 'hospital') return 'hospital';
  if (tags.amenity === 'school') return 'school';
  if (tags.amenity === 'shelter' || tags.emergency === 'shelter') return 'shelter';
  if (tags.amenity === 'townhall' || tags.office === 'government') return 'government';
  return 'shelter';
};

const parseOverpassResponse = (data: { elements: OverpassElement[] }): EvacuationCenter[] => {
  return data.elements
    .filter((el) => el.tags?.name)
    .map((el) => {
      const lat = el.lat ?? el.center?.lat ?? 0;
      const lng = el.lon ?? el.center?.lon ?? 0;
      return {
        id: `${el.type}-${el.id}`,
        name: el.tags?.name ?? 'Unknown',
        type: getTypeFromTags(el.tags ?? {}),
        lat,
        lng,
        address: el.tags?.['addr:full'] ?? el.tags?.['addr:street'],
      };
    })
    .filter((center) => center.lat !== 0 && center.lng !== 0);
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg: number): number => deg * (Math.PI / 180);

const formatKm = (value?: number | null) => {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(2)} km`;
};

export default function App() {
  const mapRef = useRef<MapView | null>(null);

  const [alertData, setAlertData] = useState<AlertResponse | null>(null);
  const [alertCachedAt, setAlertCachedAt] = useState<string | null>(null);
  const [alertLoading, setAlertLoading] = useState(true);
  const [alertError, setAlertError] = useState<string | null>(null);

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [coordQuery, setCoordQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<SearchedLocation | null>(null);

  const [centers, setCenters] = useState<EvacuationCenter[]>([]);
  const [centersCachedAt, setCentersCachedAt] = useState<string | null>(null);
  const [centersLoading, setCentersLoading] = useState(false);
  const [centersError, setCentersError] = useState<string | null>(null);

  const [selectedCenter, setSelectedCenter] = useState<EvacuationCenter | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<RouteCoordinate[]>([]);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const loadAlertCache = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(ALERT_CACHE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CachePayload<AlertResponse>;
      setAlertData(parsed.data);
      setAlertCachedAt(parsed.cachedAt);
    } catch {
      // ignore cache errors
    }
  }, []);

  const fetchAlert = useCallback(async () => {
    setAlertLoading(true);
    setAlertError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(API_URL, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('API request failed');

      const json = (await response.json()) as AlertResponse;
      const normalized = {
        ...json,
        description: json.description || ALERT_DESCRIPTIONS[json.alertLevel] || 'Unknown',
      };

      const now = new Date().toISOString();
      setAlertData(normalized);
      setAlertCachedAt(now);
      await AsyncStorage.setItem(ALERT_CACHE_KEY, JSON.stringify({ data: normalized, cachedAt: now }));
    } catch {
      if (alertData) {
        setAlertError('Offline. Showing last cached alert.');
      } else {
        setAlertError('Unable to load alert data.');
      }
    } finally {
      setAlertLoading(false);
    }
  }, [alertData]);

  const loadCentersCache = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(CENTERS_CACHE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CachePayload<EvacuationCenter[]>;
      setCenters(parsed.data);
      setCentersCachedAt(parsed.cachedAt);
    } catch {
      // ignore cache errors
    }
  }, []);

  const fetchCenters = useCallback(async () => {
    setCentersLoading(true);
    setCentersError(null);

    const query = buildOverpassQuery(ALBAY_BOUNDING_BOX);

    for (const server of OVERPASS_SERVERS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(server, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(query)}`,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`Server returned ${response.status}`);

        const text = await response.text();
        if (text.includes('runtime error') || text.includes('timeout')) {
          throw new Error('Server busy');
        }

        const data = JSON.parse(text) as { elements: OverpassElement[] };
        const parsed = parseOverpassResponse(data);

        setCenters(parsed);
        setCentersCachedAt(new Date().toISOString());
        await AsyncStorage.setItem(
          CENTERS_CACHE_KEY,
          JSON.stringify({ data: parsed, cachedAt: new Date().toISOString() })
        );

        setCentersLoading(false);
        return;
      } catch {
        // try next server
      }
    }

    setCentersLoading(false);
    setCentersError('Servers busy. Please try again later.');
  }, []);

  const fetchRoute = useCallback(async (from: RouteCoordinate, to: RouteCoordinate) => {
    setRouteLoading(true);
    setRouteError(null);
    setRouteCoordinates([]);
    setRouteDistance(null);
    setRouteDuration(null);

    try {
      const url = `${OSRM_API_URL}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch route');
      const data = (await response.json()) as {
        code: string;
        routes: { geometry: { coordinates: [number, number][] }; distance: number; duration: number }[];
      };

      if (data.code !== 'Ok' || !data.routes?.length) throw new Error('No route found');

      const route = data.routes[0];
      const coordinates = route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));

      setRouteCoordinates(coordinates);
      setRouteDistance(route.distance);
      setRouteDuration(route.duration);
    } catch (err) {
      setRouteError(err instanceof Error ? err.message : 'Routing failed');
    } finally {
      setRouteLoading(false);
    }
  }, []);

  const requestLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission not granted.');
        return;
      }

      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ lat: current.coords.latitude, lng: current.coords.longitude });
    } catch {
      setLocationError('Unable to fetch your location.');
    }
  }, []);

  const searchByAddress = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a location.');
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        format: 'json',
        limit: '1',
        countrycodes: 'ph',
      });

      const response = await fetch(`${NOMINATIM_BASE_URL}?${params.toString()}`, {
        headers: {
          'Accept-Language': 'en',
        },
      });

      if (!response.ok) throw new Error('Failed to search location');

      const data = (await response.json()) as { lat: string; lon: string; display_name: string }[];
      if (!data?.length) {
        setSearchError('Location not found. Try another search term.');
        setSearchedLocation(null);
        return;
      }

      const result = data[0];
      setSearchedLocation({
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        name: result.display_name,
      });
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery]);

  const searchByCoordinates = useCallback(() => {
    if (!coordQuery.trim()) {
      setSearchError('Please enter coordinates.');
      return;
    }

    const parts = coordQuery.split(',').map((item) => item.trim());
    if (parts.length !== 2) {
      setSearchError('Use format: lat, lng');
      return;
    }

    const lat = Number(parts[0]);
    const lng = Number(parts[1]);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setSearchError('Invalid coordinates.');
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setSearchError('Coordinates out of range.');
      return;
    }

    setSearchError(null);
    setSearchedLocation({ lat, lng, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
  }, [coordQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setCoordQuery('');
    setSearchError(null);
    setSearchedLocation(null);
  }, []);

  const referenceLocation = useMemo(() => {
    if (searchedLocation) return { lat: searchedLocation.lat, lng: searchedLocation.lng };
    if (location) return { lat: location.lat, lng: location.lng };
    return null;
  }, [searchedLocation, location]);

  const centersWithDistance = useMemo(() => {
    if (!referenceLocation) return centers;
    return centers
      .map((center) => ({
        ...center,
        distanceFromUser: calculateDistance(referenceLocation.lat, referenceLocation.lng, center.lat, center.lng),
      }))
      .sort((a, b) => (a.distanceFromUser ?? Infinity) - (b.distanceFromUser ?? Infinity));
  }, [centers, referenceLocation]);

  const userDistanceInfo = useMemo(() => {
    if (!location) return null;
    const dist = calculateDistance(location.lat, location.lng, MAYON_COORDINATES.lat, MAYON_COORDINATES.lng);
    return { distanceKm: dist, isInsidePDZ: dist <= PDZ_RADIUS_KM };
  }, [location]);

  const searchedDistanceInfo = useMemo(() => {
    if (!searchedLocation) return null;
    const dist = calculateDistance(
      searchedLocation.lat,
      searchedLocation.lng,
      MAYON_COORDINATES.lat,
      MAYON_COORDINATES.lng
    );
    return { distanceKm: dist, isInsidePDZ: dist <= PDZ_RADIUS_KM };
  }, [searchedLocation]);

  const handleSelectCenter = useCallback(
    (center: EvacuationCenter) => {
      if (!referenceLocation) return;
      setSelectedCenter(center);
      fetchRoute(referenceLocation, { lat: center.lat, lng: center.lng });
    },
    [referenceLocation, fetchRoute]
  );

  const clearSelection = useCallback(() => {
    setSelectedCenter(null);
    setRouteCoordinates([]);
    setRouteDistance(null);
    setRouteDuration(null);
  }, []);

  const openLink = useCallback((url: string) => {
    Linking.openURL(url).catch(() => {
      // ignore
    });
  }, []);

  useEffect(() => {
    loadAlertCache().finally(fetchAlert);
    loadCentersCache().finally(fetchCenters);
    requestLocation();
  }, [loadAlertCache, fetchAlert, loadCentersCache, fetchCenters, requestLocation]);

  useEffect(() => {
    const target = searchedLocation ?? (location ? { ...location, name: 'Your location' } : null);
    if (!target || !mapRef.current) return;

    const region: Region = {
      latitude: target.lat,
      longitude: target.lng,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12,
    };

    mapRef.current.animateToRegion(region, 500);
  }, [searchedLocation, location]);

  const alertUpdatedLabel = alertData?.updatedAt ?? '—';
  const alertSyncedLabel = alertCachedAt ?? '—';
  const centersSyncedLabel = centersCachedAt ?? '—';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Ligtas Mayon</Text>
        <Text style={styles.subtitle}>Safety Monitoring</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Volcano Alert Level</Text>
          <Text style={styles.alertLevel}>{alertData?.alertLevel ?? '—'}</Text>
          <Text style={styles.cardText}>{alertData?.description ?? 'No data yet.'}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Updated</Text>
            <Text style={styles.metaValue}>{alertUpdatedLabel}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Source</Text>
            <Text style={styles.metaValue}>{alertData?.source ?? '—'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Last synced</Text>
            <Text style={styles.metaValue}>{alertSyncedLabel}</Text>
          </View>

          {alertError ? <Text style={styles.error}>{alertError}</Text> : null}

          <Pressable style={styles.button} onPress={fetchAlert}>
            <Text style={styles.buttonText}>Refresh Alert</Text>
          </Pressable>
          {alertLoading ? <ActivityIndicator color="#f97316" /> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Your location</Text>
            <Text style={styles.metaValue}>{userDistanceInfo ? formatKm(userDistanceInfo.distanceKm) : '—'}</Text>
          </View>
          {userDistanceInfo ? (
            <Text style={userDistanceInfo.isInsidePDZ ? styles.alert : styles.ok}>
              {userDistanceInfo.isInsidePDZ ? 'Inside 6km PDZ' : 'Outside 6km PDZ'}
            </Text>
          ) : null}

          {searchedDistanceInfo ? (
            <View style={styles.statusBlock}>
              <Text style={styles.metaLabel}>Searched location</Text>
              <Text style={styles.metaValue}>{formatKm(searchedDistanceInfo.distanceKm)}</Text>
              <Text style={searchedDistanceInfo.isInsidePDZ ? styles.alert : styles.ok}>
                {searchedDistanceInfo.isInsidePDZ ? 'Inside 6km PDZ' : 'Outside 6km PDZ'}
              </Text>
            </View>
          ) : null}

          {locationError ? <Text style={styles.error}>{locationError}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location Search</Text>
          <TextInput
            style={styles.input}
            placeholder="Search by address"
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Pressable style={styles.button} onPress={searchByAddress}>
            <Text style={styles.buttonText}>Search Address</Text>
          </Pressable>

          <TextInput
            style={styles.input}
            placeholder="Coordinates (lat, lng)"
            placeholderTextColor="#94a3b8"
            value={coordQuery}
            onChangeText={setCoordQuery}
          />
          <Pressable style={styles.buttonSecondary} onPress={searchByCoordinates}>
            <Text style={styles.buttonText}>Search Coordinates</Text>
          </Pressable>

          <Pressable style={styles.buttonGhost} onPress={clearSearch}>
            <Text style={styles.buttonGhostText}>Clear Search</Text>
          </Pressable>

          {searchLoading ? <ActivityIndicator color="#60a5fa" /> : null}
          {searchError ? <Text style={styles.error}>{searchError}</Text> : null}
          {searchedLocation ? (
            <Text style={styles.cardText}>Found: {searchedLocation.name}</Text>
          ) : null}
        </View>

        <View style={styles.mapCard}>
          <Text style={styles.cardTitle}>Map</Text>
          <MapView
            ref={(ref) => {
              mapRef.current = ref;
            }}
            style={styles.map}
            initialRegion={{
              latitude: MAYON_COORDINATES.lat,
              longitude: MAYON_COORDINATES.lng,
              latitudeDelta: 0.3,
              longitudeDelta: 0.3,
            }}
          >
            <Circle
              center={{ latitude: MAYON_COORDINATES.lat, longitude: MAYON_COORDINATES.lng }}
              radius={PDZ_RADIUS_KM * 1000}
              strokeColor="#f43f5e"
              fillColor="rgba(244,63,94,0.2)"
            />
            <Marker
              coordinate={{ latitude: MAYON_COORDINATES.lat, longitude: MAYON_COORDINATES.lng }}
              title="Mayon Volcano"
            />
            {location ? (
              <Marker
                coordinate={{ latitude: location.lat, longitude: location.lng }}
                pinColor="#10b981"
                title="Your location"
              />
            ) : null}
            {searchedLocation ? (
              <Marker
                coordinate={{ latitude: searchedLocation.lat, longitude: searchedLocation.lng }}
                pinColor="#3b82f6"
                title="Searched location"
                description={searchedLocation.name}
              />
            ) : null}
            {selectedCenter ? (
              <Marker
                coordinate={{ latitude: selectedCenter.lat, longitude: selectedCenter.lng }}
                pinColor="#f97316"
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
                strokeColor="#f97316"
                strokeWidth={4}
              />
            ) : null}
          </MapView>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Evacuation Centers</Text>
          <Text style={styles.cardSubText}>Last synced: {centersSyncedLabel}</Text>

          {centersError ? <Text style={styles.error}>{centersError}</Text> : null}
          {centersLoading ? <ActivityIndicator color="#f97316" /> : null}

          {centersWithDistance.slice(0, 20).map((center) => (
            <Pressable
              key={center.id}
              style={selectedCenter?.id === center.id ? styles.centerCardActive : styles.centerCard}
              onPress={() => handleSelectCenter(center)}
            >
              <Text style={styles.centerName}>{center.name}</Text>
              <Text style={styles.centerMeta}>{center.type.toUpperCase()}</Text>
              {center.distanceFromUser !== undefined ? (
                <Text style={styles.centerMeta}>Distance: {formatKm(center.distanceFromUser)}</Text>
              ) : null}
              {center.address ? <Text style={styles.centerMeta}>{center.address}</Text> : null}
            </Pressable>
          ))}

          <Pressable style={styles.buttonSecondary} onPress={fetchCenters}>
            <Text style={styles.buttonText}>Refresh Centers</Text>
          </Pressable>

          {selectedCenter ? (
            <View style={styles.routeCard}>
              <Text style={styles.cardTitle}>Route</Text>
              <Text style={styles.cardText}>To: {selectedCenter.name}</Text>
              <Text style={styles.cardText}>Distance: {formatKm(routeDistance ? routeDistance / 1000 : null)}</Text>
              <Text style={styles.cardText}>
                Duration: {routeDuration ? `${Math.round(routeDuration / 60)} mins` : '—'}
              </Text>
              {routeError ? <Text style={styles.error}>{routeError}</Text> : null}
              {routeLoading ? <ActivityIndicator color="#f97316" /> : null}
              <Pressable style={styles.buttonGhost} onPress={clearSelection}>
                <Text style={styles.buttonGhostText}>Clear Route</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Safety Precautions</Text>
          {alertData?.alertLevel && alertData.alertLevel >= 3 ? (
            <Text style={styles.alert}>Alert Level {alertData.alertLevel}: Be ready to evacuate at any moment.</Text>
          ) : null}

          <Text style={styles.sectionTitle}>Before an Eruption</Text>
          {SAFETY_TIPS.before.map((tip) => (
            <Text key={tip} style={styles.tip}>{`• ${tip}`}</Text>
          ))}

          <Text style={styles.sectionTitle}>During Evacuation</Text>
          {SAFETY_TIPS.during.map((tip) => (
            <Text key={tip} style={styles.tip}>{`• ${tip}`}</Text>
          ))}

          <Text style={styles.sectionTitle}>Volcanic Hazards</Text>
          {SAFETY_TIPS.hazards.map((tip) => (
            <Text key={tip} style={styles.tip}>{`• ${tip}`}</Text>
          ))}

          <Text style={styles.sectionTitle}>Emergency Kit Essentials</Text>
          {SAFETY_TIPS.kit.map((tip) => (
            <Text key={tip} style={styles.tip}>{`• ${tip}`}</Text>
          ))}

          <Text style={styles.cardSubText}>
            Stay informed: Monitor PHIVOLCS bulletins and follow instructions from local authorities.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Emergency Contacts</Text>
          <Pressable style={styles.contactRow} onPress={() => openLink('tel:+6328426146879')}>
            <Text style={styles.contactLabel}>PHIVOLCS Trunkline</Text>
            <Text style={styles.contactValue}>(02) 8426-1468 to 79</Text>
          </Pressable>
          <Pressable style={styles.contactRow} onPress={() => openLink('https://www.phivolcs.dost.gov.ph')}>
            <Text style={styles.contactLabel}>PHIVOLCS Website</Text>
            <Text style={styles.contactValue}>phivolcs.dost.gov.ph</Text>
          </Pressable>
          <Pressable style={styles.contactRow} onPress={() => openLink('https://www.facebook.com/PHIVOLCS')}>
            <Text style={styles.contactLabel}>PHIVOLCS Facebook</Text>
            <Text style={styles.contactValue}>/PHIVOLCS</Text>
          </Pressable>

          <Pressable style={styles.contactRow} onPress={() => openLink('tel:+63528242383')}>
            <Text style={styles.contactLabel}>Mayon Volcano Observatory</Text>
            <Text style={styles.contactValue}>(052) 824-2383</Text>
          </Pressable>
          <Pressable
            style={styles.contactRow}
            onPress={() => openLink('https://www.phivolcs.dost.gov.ph/mayon-volcano-observatory/')}
          >
            <Text style={styles.contactLabel}>MVO Page</Text>
            <Text style={styles.contactValue}>phivolcs.dost.gov.ph</Text>
          </Pressable>

          <Pressable style={styles.contactRow} onPress={() => openLink('tel:911')}>
            <Text style={styles.contactLabel}>National Emergency</Text>
            <Text style={styles.contactValue}>911</Text>
          </Pressable>
          <Pressable style={styles.contactRow} onPress={() => openLink('tel:143')}>
            <Text style={styles.contactLabel}>Red Cross</Text>
            <Text style={styles.contactValue}>143</Text>
          </Pressable>
          <Pressable style={styles.contactRow} onPress={() => openLink('https://www.albay.gov.ph/contact/')}>
            <Text style={styles.contactLabel}>Albay Gov</Text>
            <Text style={styles.contactValue}>albay.gov.ph/contact</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1220',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 20,
    color: '#94a3b8',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16,
  },
  mapCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16,
  },
  map: {
    height: 320,
    borderRadius: 12,
    marginTop: 12,
  },
  cardTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  cardText: {
    color: '#cbd5f5',
    marginBottom: 6,
  },
  cardSubText: {
    color: '#94a3b8',
    marginBottom: 8,
  },
  alertLevel: {
    color: '#f97316',
    fontSize: 40,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    color: '#94a3b8',
  },
  metaValue: {
    color: '#e2e8f0',
  },
  statusBlock: {
    marginTop: 10,
  },
  alert: {
    color: '#fca5a5',
    marginTop: 6,
  },
  ok: {
    color: '#86efac',
    marginTop: 6,
  },
  error: {
    color: '#fca5a5',
    marginTop: 8,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 10,
  },
  button: {
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonSecondary: {
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0f766e',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonGhost: {
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonGhostText: {
    color: '#cbd5f5',
  },
  centerCard: {
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#0f172a',
  },
  centerCardActive: {
    borderWidth: 1,
    borderColor: '#f97316',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#1f2937',
  },
  centerName: {
    color: '#e2e8f0',
    fontWeight: '600',
    marginBottom: 4,
  },
  centerMeta: {
    color: '#94a3b8',
    fontSize: 12,
  },
  routeCard: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  sectionTitle: {
    color: '#93c5fd',
    marginTop: 12,
    marginBottom: 6,
    fontWeight: '600',
  },
  tip: {
    color: '#cbd5f5',
    marginBottom: 4,
  },
  contactRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  contactLabel: {
    color: '#93c5fd',
    fontWeight: '600',
  },
  contactValue: {
    color: '#cbd5f5',
    marginTop: 2,
  },
});

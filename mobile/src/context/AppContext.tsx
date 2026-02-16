import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import type MapView from 'react-native-maps';
import type { Region } from 'react-native-maps';

import type { AlertResponse, CachePayload, EvacuationCenter, OverpassElement, RouteCoordinate, SearchedLocation, TileCacheMeta, TileDownloadProgress } from '../types';
import {
  ALBAY_BOUNDING_BOX,
  ALERT_CACHE_KEY,
  ALERT_DESCRIPTIONS,
  API_URL,
  CENTERS_CACHE_KEY,
  MAYON_COORDINATES,
  NOMINATIM_BASE_URL,
  OFFLINE_MODE_KEY,
  OSRM_API_URL,
  OVERPASS_SERVERS,
  PDZ_RADIUS_KM,
} from '../constants';
import { calculateDistance } from '../utils/geo';
import { buildOverpassQuery, parseOverpassResponse } from '../utils/overpass';
import { clearTileCache, downloadTiles, loadCacheMeta } from '../utils/tileCache';

type AppContextValue = {
  // Alert
  alertData: AlertResponse | null;
  alertCachedAt: string | null;
  alertLoading: boolean;
  alertError: string | null;
  fetchAlert: () => Promise<void>;

  // Location
  location: { lat: number; lng: number } | null;
  locationError: string | null;
  requestLocation: () => Promise<void>;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  coordQuery: string;
  setCoordQuery: (q: string) => void;
  searchLoading: boolean;
  searchError: string | null;
  searchedLocation: SearchedLocation | null;
  searchByAddress: () => Promise<void>;
  searchByCoordinates: () => void;
  clearSearch: () => void;

  // Centers
  centers: EvacuationCenter[];
  centersWithDistance: EvacuationCenter[];
  centersCachedAt: string | null;
  centersLoading: boolean;
  centersError: string | null;
  fetchCenters: () => Promise<void>;

  // Route
  selectedCenter: EvacuationCenter | null;
  routeCoordinates: RouteCoordinate[];
  routeDistance: number | null;
  routeDuration: number | null;
  routeLoading: boolean;
  routeError: string | null;
  handleSelectCenter: (center: EvacuationCenter) => void;
  clearSelection: () => void;

  // Computed
  referenceLocation: { lat: number; lng: number } | null;
  userDistanceInfo: { distanceKm: number; isInsidePDZ: boolean } | null;
  searchedDistanceInfo: { distanceKm: number; isInsidePDZ: boolean } | null;

  // Map
  mapRef: React.MutableRefObject<MapView | null>;

  // Offline tiles
  isOfflineMode: boolean;
  tileCacheMeta: TileCacheMeta | null;
  tileDownloadProgress: TileDownloadProgress | null;
  startTileDownload: () => void;
  cancelTileDownload: () => void;
  toggleOfflineMode: () => void;
  clearTiles: () => Promise<void>;

  // Pull-to-refresh
  isRefreshing: boolean;
  refreshAll: () => Promise<void>;
  refreshCenters: () => Promise<void>;
  refreshAlert: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const mapRef = useRef<MapView | null>(null);

  // Alert state
  const [alertData, setAlertData] = useState<AlertResponse | null>(null);
  const alertDataRef = useRef(alertData);
  const [alertCachedAt, setAlertCachedAt] = useState<string | null>(null);
  const [alertLoading, setAlertLoading] = useState(true);
  const [alertError, setAlertError] = useState<string | null>(null);

  // Location state
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [coordQuery, setCoordQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<SearchedLocation | null>(null);

  // Centers state
  const [centers, setCenters] = useState<EvacuationCenter[]>([]);
  const [centersCachedAt, setCentersCachedAt] = useState<string | null>(null);
  const [centersLoading, setCentersLoading] = useState(false);
  const [centersError, setCentersError] = useState<string | null>(null);

  // Route state
  const [selectedCenter, setSelectedCenter] = useState<EvacuationCenter | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<RouteCoordinate[]>([]);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Pull-to-refresh
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Offline tiles state
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [tileCacheMeta, setTileCacheMeta] = useState<TileCacheMeta | null>(null);
  const [tileDownloadProgress, setTileDownloadProgress] = useState<TileDownloadProgress | null>(null);
  const tileAbortRef = useRef(false);

  // Keep refs in sync (loop fix)
  alertDataRef.current = alertData;
  const locationRef = useRef(location);
  locationRef.current = location;

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
      if (alertDataRef.current) {
        setAlertError('Offline. Showing last cached alert.');
      } else {
        setAlertError('Unable to load alert data.');
      }
    } finally {
      setAlertLoading(false);
    }
  }, []);

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

      // Try last known position first (instant, no timeout risk)
      const last = await Location.getLastKnownPositionAsync();
      if (last) {
        setLocation({ lat: last.coords.latitude, lng: last.coords.longitude });
      }

      // Then get a fresh fix with lower accuracy to avoid long GPS lock
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });
      setLocation({ lat: current.coords.latitude, lng: current.coords.longitude });
    } catch {
      // If getCurrentPositionAsync failed but we already set from last known, keep it
      if (!locationRef.current) {
        setLocationError('Unable to fetch your location.');
      }
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
        headers: { 'Accept-Language': 'en', 'User-Agent': 'MayonGeoPDZ/1.0' },
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

      // Zoom map to fit both user location and the selected center
      if (mapRef.current) {
        mapRef.current.fitToCoordinates(
          [
            { latitude: referenceLocation.lat, longitude: referenceLocation.lng },
            { latitude: center.lat, longitude: center.lng },
          ],
          { edgePadding: { top: 120, right: 60, bottom: 60, left: 60 }, animated: true }
        );
      }
    },
    [referenceLocation, fetchRoute]
  );

  const clearSelection = useCallback(() => {
    setSelectedCenter(null);
    setRouteCoordinates([]);
    setRouteDistance(null);
    setRouteDuration(null);
  }, []);

  // Offline tile actions
  const startTileDownload = useCallback(() => {
    tileAbortRef.current = false;
    downloadTiles(
      (progress) => setTileDownloadProgress(progress),
      tileAbortRef,
    ).then(async (completed) => {
      if (completed) {
        const meta = await loadCacheMeta();
        setTileCacheMeta(meta);
        setIsOfflineMode(true);
        await AsyncStorage.setItem(OFFLINE_MODE_KEY, 'true');
      }
    });
  }, []);

  const cancelTileDownload = useCallback(() => {
    tileAbortRef.current = true;
  }, []);

  const toggleOfflineMode = useCallback(async () => {
    const next = !isOfflineMode;
    setIsOfflineMode(next);
    await AsyncStorage.setItem(OFFLINE_MODE_KEY, next ? 'true' : 'false');
  }, [isOfflineMode]);

  const clearTiles = useCallback(async () => {
    await clearTileCache();
    setTileCacheMeta(null);
    setIsOfflineMode(false);
    await AsyncStorage.setItem(OFFLINE_MODE_KEY, 'false');
  }, []);

  // Pull-to-refresh
  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchAlert(), fetchCenters(), requestLocation()]);
    setIsRefreshing(false);
  }, [fetchAlert, fetchCenters, requestLocation]);

  const refreshCenters = useCallback(async () => {
    setIsRefreshing(true);
    await fetchCenters();
    setIsRefreshing(false);
  }, [fetchCenters]);

  const refreshAlert = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAlert();
    setIsRefreshing(false);
  }, [fetchAlert]);

  // Initial load
  useEffect(() => {
    loadAlertCache().finally(fetchAlert);
    loadCentersCache().finally(fetchCenters);
    requestLocation();

    // Load offline preferences
    AsyncStorage.getItem(OFFLINE_MODE_KEY).then((val) => {
      if (val === 'true') setIsOfflineMode(true);
    });
    loadCacheMeta().then((meta) => {
      if (meta) setTileCacheMeta(meta);
    });
  }, [loadAlertCache, fetchAlert, loadCentersCache, fetchCenters, requestLocation]);

  // Animate map when location changes
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

  const value: AppContextValue = {
    alertData,
    alertCachedAt,
    alertLoading,
    alertError,
    fetchAlert,
    location,
    locationError,
    requestLocation,
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
    centers,
    centersWithDistance,
    centersCachedAt,
    centersLoading,
    centersError,
    fetchCenters,
    selectedCenter,
    routeCoordinates,
    routeDistance,
    routeDuration,
    routeLoading,
    routeError,
    handleSelectCenter,
    clearSelection,
    referenceLocation,
    userDistanceInfo,
    searchedDistanceInfo,
    mapRef,
    isOfflineMode,
    tileCacheMeta,
    tileDownloadProgress,
    startTileDownload,
    cancelTileDownload,
    toggleOfflineMode,
    clearTiles,
    isRefreshing,
    refreshAll,
    refreshCenters,
    refreshAlert,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

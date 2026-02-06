import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AlertResponse = {
  volcano?: string;
  alertLevel: number;
  description: string;
  updatedAt: string;
  source: string;
  cached?: boolean;
};

type CachePayload = {
  data: AlertResponse;
  cachedAt: string;
};

const API_URL = 'https://mayon-geo.vercel.app/api/alert';
const CACHE_KEY = 'mayon-alert-cache';

export default function App() {
  const [data, setData] = useState<AlertResponse | null>(null);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef<AlertResponse | null>(null);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const loadCache = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CachePayload;
      setData(parsed.data);
      setCachedAt(parsed.cachedAt);
    } catch {
      // Ignore cache errors
    }
  }, []);

  const fetchAlert = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(API_URL, { signal: controller.signal });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const json = (await response.json()) as AlertResponse;
      const now = new Date().toISOString();

      setData(json);
      setCachedAt(now);

      const payload: CachePayload = { data: json, cachedAt: now };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch {
      if (dataRef.current) {
        setError('Offline. Showing last cached alert.');
      } else {
        setError('Unable to load alert data.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCache().finally(fetchAlert);
  }, [loadCache, fetchAlert]);

  const lastUpdatedLabel = useMemo(() => {
    if (!data?.updatedAt) return '—';
    return data.updatedAt;
  }, [data]);

  const lastSyncedLabel = useMemo(() => {
    if (!cachedAt) return '—';
    return cachedAt;
  }, [cachedAt]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Ligtas Mayon</Text>
      <Text style={styles.subtitle}>Safety Monitoring (Mobile)</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Alert Level</Text>
        <Text style={styles.value}>{data?.alertLevel ?? '—'}</Text>
        <Text style={styles.desc}>{data?.description ?? 'No data yet.'}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Updated</Text>
          <Text style={styles.metaValue}>{lastUpdatedLabel}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Source</Text>
          <Text style={styles.metaValue}>{data?.source ?? '—'}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Last synced</Text>
          <Text style={styles.metaValue}>{lastSyncedLabel}</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={fetchAlert}>
          <Text style={styles.buttonText}>Refresh</Text>
        </Pressable>

        {loading ? <ActivityIndicator color="#f97316" /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1220',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 8,
  },
  label: {
    color: '#93c5fd',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    color: '#f97316',
    fontSize: 42,
    fontWeight: '700',
  },
  desc: {
    color: '#e2e8f0',
    marginBottom: 12,
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
  error: {
    marginTop: 8,
    color: '#fca5a5',
  },
  button: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export type AlertResponse = {
  volcano?: string;
  alertLevel: number;
  description: string;
  updatedAt: string;
  source: string;
  cached?: boolean;
};

export type CachePayload<T> = {
  data: T;
  cachedAt: string;
};

export type EvacuationCenterType = 'shelter' | 'school' | 'hospital' | 'government';

export type EvacuationCenter = {
  id: string;
  name: string;
  type: EvacuationCenterType;
  lat: number;
  lng: number;
  address?: string;
  distanceFromUser?: number;
};

export type RouteCoordinate = { lat: number; lng: number };

export type SearchedLocation = { lat: number; lng: number; name: string };

export type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

// Offline tile caching
export type TileCoord = { x: number; y: number; z: number };

export type TileCacheMeta = {
  totalTiles: number;
  cachedTiles: number;
  sizeBytes: number;
  completedAt: string | null;
};

export type TileDownloadProgress = {
  downloaded: number;
  total: number;
  isDownloading: boolean;
};

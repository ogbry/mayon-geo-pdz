import { Directory, File, Paths } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TileCacheMeta, TileCoord, TileDownloadProgress } from '../types';
import {
  ALBAY_BOUNDING_BOX,
  TILE_CACHE_META_KEY,
  TILE_DOWNLOAD_CONCURRENCY,
  TILE_ZOOM_MAX,
  TILE_ZOOM_MIN,
} from '../constants';

const TILES_DIR_NAME = 'tiles';

function getTilesDir(): Directory {
  return new Directory(Paths.document, TILES_DIR_NAME);
}

// --- Slippy map tile math ---

function lon2tile(lon: number, z: number): number {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, z));
}

function lat2tile(lat: number, z: number): number {
  const latRad = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, z));
}

export function enumerateTiles(
  bbox: { south: number; west: number; north: number; east: number },
  zMin: number,
  zMax: number,
): TileCoord[] {
  const tiles: TileCoord[] = [];

  for (let z = zMin; z <= zMax; z++) {
    const xMin = lon2tile(bbox.west, z);
    const xMax = lon2tile(bbox.east, z);
    const yMin = lat2tile(bbox.north, z); // north has smaller y
    const yMax = lat2tile(bbox.south, z);

    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        tiles.push({ x, y, z });
      }
    }
  }

  return tiles;
}

// --- File helpers ---

function tileFile(coord: TileCoord): File {
  // UrlTile tileCachePath expects /{z}/{x}/{y} — no file extension
  return new File(getTilesDir(), `${coord.z}`, `${coord.x}`, `${coord.y}`);
}

function isTileCached(coord: TileCoord): boolean {
  return tileFile(coord).exists;
}

// --- Download manager ---

export async function downloadTiles(
  onProgress: (progress: TileDownloadProgress) => void,
  abortRef: { current: boolean },
): Promise<boolean> {
  const tiles = enumerateTiles(ALBAY_BOUNDING_BOX, TILE_ZOOM_MIN, TILE_ZOOM_MAX);
  const total = tiles.length;
  let downloaded = 0;

  onProgress({ downloaded: 0, total, isDownloading: true });

  // Filter out already-cached tiles (resume support)
  const uncached: TileCoord[] = [];
  for (const tile of tiles) {
    if (isTileCached(tile)) {
      downloaded++;
    } else {
      uncached.push(tile);
    }
  }

  onProgress({ downloaded, total, isDownloading: true });

  // Download in batches with concurrency limit
  for (let i = 0; i < uncached.length; i += TILE_DOWNLOAD_CONCURRENCY) {
    if (abortRef.current) {
      onProgress({ downloaded, total, isDownloading: false });
      return false;
    }

    const batch = uncached.slice(i, i + TILE_DOWNLOAD_CONCURRENCY);

    const results = await Promise.allSettled(
      batch.map(async (coord) => {
        const url = `https://tile.openstreetmap.org/${coord.z}/${coord.x}/${coord.y}.png`;
        const dest = tileFile(coord);

        // Ensure parent directories exist
        const dir = new Directory(getTilesDir(), `${coord.z}`, `${coord.x}`);
        if (!dir.exists) {
          dir.create({ intermediates: true });
        }

        await File.downloadFileAsync(url, dest, { idempotent: true });
      }),
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        downloaded++;
      }
    }

    onProgress({ downloaded, total, isDownloading: true });
  }

  // Save meta
  const meta: TileCacheMeta = {
    totalTiles: total,
    cachedTiles: downloaded,
    sizeBytes: 0,
    completedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(TILE_CACHE_META_KEY, JSON.stringify(meta));

  onProgress({ downloaded, total, isDownloading: false });
  return downloaded === total;
}

// --- Cache status ---

export async function loadCacheMeta(): Promise<TileCacheMeta | null> {
  const raw = await AsyncStorage.getItem(TILE_CACHE_META_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as TileCacheMeta;
}

export async function clearTileCache(): Promise<void> {
  const dir = getTilesDir();
  if (dir.exists) {
    dir.delete();
  }
  await AsyncStorage.removeItem(TILE_CACHE_META_KEY);
}

export function getTileCachePath(): string {
  return getTilesDir().uri;
}

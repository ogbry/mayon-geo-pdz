import { useState, useCallback } from "react";
import type { EvacuationCenter, EvacuationCentersState, EvacuationCenterType } from "../types/evacuation";
import { ALBAY_BOUNDING_BOX } from "../utils/constants";
import { calculateDistance } from "../utils/haversine";

// Expanded list of Overpass API servers — tried in order
const OVERPASS_SERVERS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://z.overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

const CACHE_KEY = "evacuation_centers_cache";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

interface CachedCenters {
    centers: EvacuationCenter[];
    timestamp: number;
}

function loadFromCache(): EvacuationCenter[] | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed: CachedCenters = JSON.parse(raw);
        if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
        return parsed.centers;
    } catch {
        return null;
    }
}

function saveToCache(centers: EvacuationCenter[]) {
    try {
        const payload: CachedCenters = { centers, timestamp: Date.now() };
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch {
        // Storage quota exceeded — ignore
    }
}

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
    if (tags.amenity === "hospital") return "hospital";
    if (tags.amenity === "school") return "school";
    if (tags.amenity === "shelter" || tags.emergency === "shelter") return "shelter";
    if (tags.amenity === "townhall" || tags.office === "government") return "government";
    return "shelter";
};

interface OverpassElement {
    type: string;
    id: number;
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags?: Record<string, string>;
}

const parseOverpassResponse = (data: { elements: OverpassElement[] }): EvacuationCenter[] => {
    return data.elements
        .filter((el) => el.tags?.name)
        .map((el) => {
            const lat = el.lat ?? el.center?.lat ?? 0;
            const lng = el.lon ?? el.center?.lon ?? 0;
            return {
                id: `${el.type}-${el.id}`,
                name: el.tags?.name ?? "Unknown",
                type: getTypeFromTags(el.tags ?? {}),
                lat,
                lng,
                address: el.tags?.["addr:full"] ?? el.tags?.["addr:street"],
            };
        })
        .filter((center) => center.lat !== 0 && center.lng !== 0);
};

interface UseEvacuationCentersReturn extends EvacuationCentersState {
    fetchCenters: () => Promise<void>;
    getCentersWithDistance: (userLat: number, userLng: number) => EvacuationCenter[];
}

export default function useEvacuationCenters(): UseEvacuationCentersReturn {
    const cached = loadFromCache();

    const [state, setState] = useState<EvacuationCentersState>({
        centers: cached ?? [],
        loading: false,
        error: null,
    });

    const fetchCenters = useCallback(async (forceRefresh = false) => {
        // Return cached data if still fresh and not a forced refresh
        if (!forceRefresh) {
            const fresh = loadFromCache();
            if (fresh) {
                setState({ centers: fresh, loading: false, error: null });
                return;
            }
        }

        setState((prev) => ({ ...prev, loading: true, error: null }));

        const query = buildOverpassQuery(ALBAY_BOUNDING_BOX);

        for (const server of OVERPASS_SERVERS) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000);

                const response = await fetch(server, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `data=${encodeURIComponent(query)}`,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) throw new Error(`${response.status}`);

                const text = await response.text();
                if (text.includes("runtime error") || text.includes("timeout")) {
                    throw new Error("Server busy");
                }

                const data = JSON.parse(text);
                const centers = parseOverpassResponse(data);

                saveToCache(centers);
                setState({ centers, loading: false, error: null });
                return;
            } catch {
                // Try next server
            }
        }

        // All servers failed — show cached data if available, with a warning
        const stale = loadFromCache();
        if (stale) {
            setState({ centers: stale, loading: false, error: "Using cached data — servers temporarily unavailable." });
        } else {
            setState({ centers: [], loading: false, error: "Unable to load evacuation centers. Tap refresh to try again." });
        }
    }, []);

    const getCentersWithDistance = useCallback(
        (userLat: number, userLng: number): EvacuationCenter[] => {
            return state.centers
                .map((center) => ({
                    ...center,
                    distanceFromUser: calculateDistance(userLat, userLng, center.lat, center.lng),
                }))
                .sort((a, b) => (a.distanceFromUser ?? Infinity) - (b.distanceFromUser ?? Infinity));
        },
        [state.centers]
    );

    return { ...state, fetchCenters, getCentersWithDistance };
}

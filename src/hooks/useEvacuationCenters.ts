import { useState, useCallback } from "react";
import type { EvacuationCenter, EvacuationCentersState, EvacuationCenterType } from "../types/evacuation";
import { calculateDistance } from "../utils/haversine";

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
        localStorage.setItem(CACHE_KEY, JSON.stringify({ centers, timestamp: Date.now() }));
    } catch {
        // Storage quota exceeded — ignore
    }
}

type EvacuationCenterType_ = EvacuationCenterType;

interface OverpassElement {
    type: string;
    id: number;
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags?: Record<string, string>;
}

function getTypeFromTags(tags: Record<string, string>): EvacuationCenterType_ {
    if (tags.amenity === "hospital") return "hospital";
    if (tags.amenity === "school") return "school";
    if (tags.amenity === "shelter" || tags.emergency === "shelter") return "shelter";
    if (tags.amenity === "townhall" || tags.office === "government") return "government";
    return "shelter";
}

function parseElements(elements: OverpassElement[]): EvacuationCenter[] {
    return elements
        .filter((el) => el.tags?.name)
        .map((el) => ({
            id: `${el.type}-${el.id}`,
            name: el.tags?.name ?? "Unknown",
            type: getTypeFromTags(el.tags ?? {}),
            lat: el.lat ?? el.center?.lat ?? 0,
            lng: el.lon ?? el.center?.lon ?? 0,
            address: el.tags?.["addr:full"] ?? el.tags?.["addr:street"],
        }))
        .filter((c) => c.lat !== 0 && c.lng !== 0);
}

interface UseEvacuationCentersReturn extends EvacuationCentersState {
    fetchCenters: (forceRefresh?: boolean) => Promise<void>;
    getCentersWithDistance: (userLat: number, userLng: number) => EvacuationCenter[];
}

export default function useEvacuationCenters(): UseEvacuationCentersReturn {
    const cached = loadFromCache();

    const [state, setState] = useState<EvacuationCentersState>({
        centers: cached ?? [],
        loading: !cached,
        error: null,
    });

    const fetchCenters = useCallback(async (forceRefresh = false) => {
        if (!forceRefresh) {
            const fresh = loadFromCache();
            if (fresh) {
                setState({ centers: fresh, loading: false, error: null });
                return;
            }
        }

        setState((prev) => ({ ...prev, loading: true, error: null }));

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const res = await fetch("/api/centers", { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!res.ok) throw new Error(`API error ${res.status}`);

            const data = await res.json();
            const centers = parseElements(data.elements ?? []);

            saveToCache(centers);
            setState({
                centers,
                loading: false,
                error: data.isStatic ? "Showing known centers — live data temporarily unavailable." : null,
            });
        } catch {
            // Fall back to stale cache if available
            const stale = loadFromCache();
            if (stale) {
                setState({ centers: stale, loading: false, error: null });
            } else {
                setState({ centers: [], loading: false, error: "Unable to load evacuation centers. Tap refresh to try again." });
            }
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

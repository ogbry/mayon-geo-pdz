import { useState, useCallback } from "react";
import type { EvacuationCenter, EvacuationCentersState, EvacuationCenterType } from "../types/evacuation";
import { ALBAY_BOUNDING_BOX } from "../utils/constants";
import { calculateDistance } from "../utils/haversine";

// Multiple Overpass API servers for fallback
const OVERPASS_SERVERS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

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
    const [state, setState] = useState<EvacuationCentersState>({
        centers: [],
        loading: false,
        error: null,
    });

    const fetchCenters = useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const query = buildOverpassQuery(ALBAY_BOUNDING_BOX);

        // Try each server until one works
        for (const server of OVERPASS_SERVERS) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

                const response = await fetch(server, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: `data=${encodeURIComponent(query)}`,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}`);
                }

                const text = await response.text();

                // Check if response is an error message
                if (text.includes("runtime error") || text.includes("timeout")) {
                    throw new Error("Server busy, trying next...");
                }

                const data = JSON.parse(text);
                const centers = parseOverpassResponse(data);

                setState({
                    centers,
                    loading: false,
                    error: null,
                });
                return; // Success, exit the loop
            } catch {
                // Continue to next server
            }
        }

        // All servers failed
        setState({
            centers: [],
            loading: false,
            error: "Servers busy. Please try again later.",
        });
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

    return {
        ...state,
        fetchCenters,
        getCentersWithDistance,
    };
}

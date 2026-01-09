import { useState, useCallback } from "react";

export interface SearchedLocation {
    lat: number;
    lng: number;
    name: string;
}

interface LocationSearchState {
    location: SearchedLocation | null;
    loading: boolean;
    error: string | null;
}

interface UseLocationSearchReturn extends LocationSearchState {
    searchByAddress: (query: string) => Promise<void>;
    searchByCoordinates: (lat: number, lng: number) => void;
    clear: () => void;
}

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";

export default function useLocationSearch(): UseLocationSearchReturn {
    const [state, setState] = useState<LocationSearchState>({
        location: null,
        loading: false,
        error: null,
    });

    const searchByAddress = useCallback(async (query: string) => {
        if (!query.trim()) {
            setState({ location: null, loading: false, error: "Please enter a location" });
            return;
        }

        setState({ location: null, loading: true, error: null });

        try {
            const params = new URLSearchParams({
                q: query,
                format: "json",
                limit: "1",
                countrycodes: "ph",
            });

            const response = await fetch(`${NOMINATIM_BASE_URL}?${params}`, {
                headers: {
                    "User-Agent": "MayonGeo/1.0 (https://mayon-geo.app)",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to search location");
            }

            const data = await response.json();

            if (!data || data.length === 0) {
                setState({
                    location: null,
                    loading: false,
                    error: "Location not found. Try a different search term.",
                });
                return;
            }

            const result = data[0];
            setState({
                location: {
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon),
                    name: result.display_name,
                },
                loading: false,
                error: null,
            });
        } catch (err) {
            setState({
                location: null,
                loading: false,
                error: err instanceof Error ? err.message : "An error occurred",
            });
        }
    }, []);

    const searchByCoordinates = useCallback((lat: number, lng: number, name?: string) => {
        if (isNaN(lat) || isNaN(lng)) {
            setState({
                location: null,
                loading: false,
                error: "Invalid coordinates",
            });
            return;
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            setState({
                location: null,
                loading: false,
                error: "Coordinates out of range",
            });
            return;
        }

        setState({
            location: {
                lat,
                lng,
                name: name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            },
            loading: false,
            error: null,
        });
    }, []);

    const clear = useCallback(() => {
        setState({
            location: null,
            loading: false,
            error: null,
        });
    }, []);

    return {
        ...state,
        searchByAddress,
        searchByCoordinates,
        clear,
    };
}

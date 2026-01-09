import { useState, useCallback } from "react";
import type { RoutingState } from "../types/evacuation";

const OSRM_API_URL = "https://router.project-osrm.org/route/v1/driving";

export interface RouteCoordinate {
    lat: number;
    lng: number;
}

interface UseRoutingReturn extends RoutingState {
    routeCoordinates: RouteCoordinate[];
    getRoute: (from: RouteCoordinate, to: RouteCoordinate) => Promise<void>;
    clearRoute: () => void;
}

interface OSRMResponse {
    code: string;
    routes: {
        geometry: {
            coordinates: [number, number][];
        };
        distance: number;
        duration: number;
    }[];
}

// Decode polyline from OSRM response
const decodePolyline = (coordinates: [number, number][]): RouteCoordinate[] => {
    return coordinates.map(([lng, lat]) => ({ lat, lng }));
};

export default function useRouting(): UseRoutingReturn {
    const [state, setState] = useState<RoutingState>({
        distance: null,
        duration: null,
        loading: false,
        error: null,
    });
    const [routeCoordinates, setRouteCoordinates] = useState<RouteCoordinate[]>([]);

    const getRoute = useCallback(async (from: RouteCoordinate, to: RouteCoordinate) => {
        setState({ distance: null, duration: null, loading: true, error: null });
        setRouteCoordinates([]);

        try {
            const url = `${OSRM_API_URL}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Failed to fetch route");
            }

            const data: OSRMResponse = await response.json();

            if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
                throw new Error("No route found");
            }

            const route = data.routes[0];
            const coordinates = decodePolyline(route.geometry.coordinates);

            setRouteCoordinates(coordinates);
            setState({
                distance: route.distance,
                duration: route.duration,
                loading: false,
                error: null,
            });
        } catch (err) {
            setState({
                distance: null,
                duration: null,
                loading: false,
                error: err instanceof Error ? err.message : "Routing failed",
            });
            setRouteCoordinates([]);
        }
    }, []);

    const clearRoute = useCallback(() => {
        setState({
            distance: null,
            duration: null,
            loading: false,
            error: null,
        });
        setRouteCoordinates([]);
    }, []);

    return {
        ...state,
        routeCoordinates,
        getRoute,
        clearRoute,
    };
}

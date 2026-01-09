export type EvacuationCenterType = "shelter" | "school" | "hospital" | "government";

export interface EvacuationCenter {
    id: string;
    name: string;
    type: EvacuationCenterType;
    lat: number;
    lng: number;
    address?: string;
    distanceFromUser?: number;
}

export interface EvacuationCentersState {
    centers: EvacuationCenter[];
    loading: boolean;
    error: string | null;
}

export interface RoutingState {
    distance: number | null;
    duration: number | null;
    loading: boolean;
    error: string | null;
}

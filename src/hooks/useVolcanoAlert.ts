import { useState, useEffect, useCallback } from "react";

export interface VolcanoAlertState {
    level: number | null;
    description: string;
    lastUpdated: string | null;
    source: string | null;
    loading: boolean;
    error: string | null;
}

const ALERT_DESCRIPTIONS: Record<number, { short: string; detail: string; color: string }> = {
    0: {
        short: "No Alert",
        detail: "No magmatic unrest. Background level of volcanic activity.",
        color: "emerald",
    },
    1: {
        short: "Low Level Unrest",
        detail: "Low level volcanic earthquake activity. No imminent eruption.",
        color: "green",
    },
    2: {
        short: "Moderate Unrest",
        detail: "Increased seismic activity. Possible magmatic intrusion.",
        color: "yellow",
    },
    3: {
        short: "High Unrest",
        detail: "Relatively high unrest. Trend towards hazardous eruption.",
        color: "orange",
    },
    4: {
        short: "Hazardous Eruption Imminent",
        detail: "Intense unrest. Hazardous eruption imminent within days.",
        color: "red",
    },
    5: {
        short: "Hazardous Eruption Ongoing",
        detail: "Hazardous eruption in progress. Pyroclastic flows possible.",
        color: "rose",
    },
};

// Fallback if API fails
const FALLBACK = {
    level: 3,
    date: "January 2026",
};

export const getAlertInfo = (level: number | null) => {
    if (level === null || level < 0 || level > 5) {
        return {
            short: "Unknown",
            detail: "Unable to determine current alert level.",
            color: "gray",
        };
    }
    return ALERT_DESCRIPTIONS[level];
};

export default function useVolcanoAlert(): VolcanoAlertState & { refetch: () => Promise<void> } {
    const [state, setState] = useState<VolcanoAlertState>({
        level: null,
        description: "",
        lastUpdated: null,
        source: null,
        loading: true,
        error: null,
    });

    const fetchAlertLevel = useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            // Call our own API endpoint
            const response = await fetch("/api/alert", {
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error("API request failed");
            }

            const data = await response.json();

            const alertInfo = getAlertInfo(data.alertLevel);
            setState({
                level: data.alertLevel,
                description: alertInfo.short,
                lastUpdated: data.updatedAt + (data.cached ? " (cached)" : ""),
                source: data.source,
                loading: false,
                error: null,
            });
        } catch {
            // Use fallback on error
            const alertInfo = getAlertInfo(FALLBACK.level);
            setState({
                level: FALLBACK.level,
                description: alertInfo.short,
                lastUpdated: `${FALLBACK.date} (offline)`,
                source: "fallback",
                loading: false,
                error: null,
            });
        }
    }, []);

    useEffect(() => {
        fetchAlertLevel();

        // Refetch every 30 minutes
        const interval = setInterval(fetchAlertLevel, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchAlertLevel]);

    return {
        ...state,
        refetch: fetchAlertLevel,
    };
}

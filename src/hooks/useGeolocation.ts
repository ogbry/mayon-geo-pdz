import { useState, useEffect } from "react";

interface Location {
    latitude: number;
    longitude: number;
}

interface GeolocationState {
    loaded: boolean;
    coordinates?: Location;
    error?: {
        code: number;
        message: string;
    };
}

const useGeolocation = (): GeolocationState => {
    const [location, setLocation] = useState<GeolocationState>({
        loaded: false,
        coordinates: undefined,
    });

    const onSuccess = (location: GeolocationPosition) => {
        setLocation({
            loaded: true,
            coordinates: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            },
        });
    };

    const onError = (error: GeolocationPositionError) => {
        setLocation({
            loaded: true,
            error: {
                code: error.code,
                message: error.message,
            },
        });
    };

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            onError({
                code: 0,
                message: "Geolocation not supported",
            } as GeolocationPositionError);
            return;
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }, []);

    return location;
};

export default useGeolocation;

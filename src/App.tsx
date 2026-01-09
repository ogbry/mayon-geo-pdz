import { useMemo } from "react";
import BackgroundLayout from "./components/BackgroundLayout";
import Hero from "./components/Hero";
import StatusCard from "./components/StatusCard";
import MapComponent from "./components/MapComponent";
import LocationSearch from "./components/LocationSearch";
import useGeolocation from "./hooks/useGeolocation";
import useLocationSearch from "./hooks/useLocationSearch";
import { calculateDistance } from "./utils/haversine";
import { MAYON_COORDINATES, PDZ_RADIUS_KM } from "./utils/constants";

function App() {
  const { coordinates, loaded, error } = useGeolocation();
  const {
    location: searchedLocation,
    loading: searchLoading,
    error: searchError,
    searchByAddress,
    searchByCoordinates,
    clear: clearSearch,
  } = useLocationSearch();

  // Calculate distance for user's GPS location
  const userDistanceInfo = useMemo(() => {
    if (!coordinates) return null;

    const dist = calculateDistance(
      coordinates.latitude,
      coordinates.longitude,
      MAYON_COORDINATES.lat,
      MAYON_COORDINATES.lng
    );

    return {
      distanceKm: dist,
      isInsidePDZ: dist <= PDZ_RADIUS_KM,
    };
  }, [coordinates]);

  // Calculate distance for searched location
  const searchedDistanceInfo = useMemo(() => {
    if (!searchedLocation) return null;

    const dist = calculateDistance(
      searchedLocation.lat,
      searchedLocation.lng,
      MAYON_COORDINATES.lat,
      MAYON_COORDINATES.lng
    );

    return {
      distanceKm: dist,
      isInsidePDZ: dist <= PDZ_RADIUS_KM,
    };
  }, [searchedLocation]);

  const loading = !loaded;
  const errorMsg = error ? error.message : undefined;

  return (
    <BackgroundLayout>
      <div className="w-full px-4 md:px-8 lg:px-12 space-y-8">
        <Hero />

        {/* Location Search */}
        <LocationSearch
          onSearchAddress={searchByAddress}
          onSearchCoordinates={searchByCoordinates}
          onClear={clearSearch}
          loading={searchLoading}
          error={searchError}
          hasLocation={!!searchedLocation}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="space-y-6">
            {/* User GPS Location Status */}
            <StatusCard
              loading={loading}
              error={errorMsg}
              distance={userDistanceInfo?.distanceKm ?? null}
              isInsidePDZ={userDistanceInfo?.isInsidePDZ ?? false}
              label="Your Location"
            />

            {/* Searched Location Status */}
            {searchedLocation && searchedDistanceInfo && (
              <StatusCard
                loading={false}
                distance={searchedDistanceInfo.distanceKm}
                isInsidePDZ={searchedDistanceInfo.isInsidePDZ}
                label="Searched Location"
                locationName={searchedLocation.name}
              />
            )}
          </div>

          <MapComponent
            userLocation={
              coordinates
                ? { lat: coordinates.latitude, lng: coordinates.longitude }
                : undefined
            }
            searchedLocation={
              searchedLocation
                ? {
                    lat: searchedLocation.lat,
                    lng: searchedLocation.lng,
                    name: searchedLocation.name,
                  }
                : undefined
            }
          />
        </div>

        <footer className="text-center text-gray-500 text-sm py-8">
          <p>© {new Date().getFullYear()} Mayon Safety Initative.</p>
          <p className="mt-1">
            Stay safe. Always listen to local authorities and PHIVOLCS.
          </p>
        </footer>
      </div>
    </BackgroundLayout>
  );
}

export default App;

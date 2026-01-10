import { useMemo, useState, useEffect, useCallback } from "react";
import BackgroundLayout from "./components/BackgroundLayout";
import Hero from "./components/Hero";
import StatusCard from "./components/StatusCard";
import AlertLevelCard from "./components/AlertLevelCard";
import MapComponent from "./components/MapComponent";
import LocationSearch from "./components/LocationSearch";
import EvacuationPanel from "./components/EvacuationPanel";
import SafetyTipsCard from "./components/SafetyTipsCard";
import useGeolocation from "./hooks/useGeolocation";
import useLocationSearch from "./hooks/useLocationSearch";
import useEvacuationCenters from "./hooks/useEvacuationCenters";
import useRouting from "./hooks/useRouting";
import useVolcanoAlert from "./hooks/useVolcanoAlert";
import { calculateDistance } from "./utils/haversine";
import { MAYON_COORDINATES, PDZ_RADIUS_KM } from "./utils/constants";
import type { EvacuationCenter } from "./types/evacuation";

function App() {
  const { coordinates, loaded, error } = useGeolocation();
  const {
    level: alertLevel,
    lastUpdated: alertLastUpdated,
    loading: alertLoading,
    error: alertError,
    refetch: refetchAlert,
  } = useVolcanoAlert();
  const {
    location: searchedLocation,
    loading: searchLoading,
    error: searchError,
    searchByAddress,
    searchByCoordinates,
    clear: clearSearch,
  } = useLocationSearch();

  // Evacuation centers and routing
  const {
    centers: rawCenters,
    loading: centersLoading,
    error: centersError,
    fetchCenters,
    getCentersWithDistance,
  } = useEvacuationCenters();

  const {
    distance: routeDistance,
    duration: routeDuration,
    loading: routeLoading,
    routeCoordinates,
    getRoute,
    clearRoute,
  } = useRouting();

  // Evacuation UI state
  const [selectedCenter, setSelectedCenter] = useState<EvacuationCenter | null>(null);

  // Fetch evacuation centers on mount
  useEffect(() => {
    fetchCenters();
  }, [fetchCenters]);

  // Calculate distances from searched location (priority) or user location
  const centersWithDistance = useMemo(() => {
    if (rawCenters.length === 0) return rawCenters;

    // Prioritize searched location, fall back to user location
    if (searchedLocation) {
      return getCentersWithDistance(searchedLocation.lat, searchedLocation.lng);
    }
    if (coordinates) {
      return getCentersWithDistance(coordinates.latitude, coordinates.longitude);
    }
    return rawCenters;
  }, [coordinates, searchedLocation, rawCenters, getCentersWithDistance]);

  // Determine the reference location for routing (searched takes priority)
  const referenceLocation = useMemo(() => {
    if (searchedLocation) {
      return { lat: searchedLocation.lat, lng: searchedLocation.lng };
    }
    if (coordinates) {
      return { lat: coordinates.latitude, lng: coordinates.longitude };
    }
    return null;
  }, [searchedLocation, coordinates]);

  // Handle center selection - trigger routing from reference location
  const handleSelectCenter = useCallback(
    (center: EvacuationCenter) => {
      if (!referenceLocation) return;

      setSelectedCenter(center);
      getRoute(referenceLocation, { lat: center.lat, lng: center.lng });
    },
    [referenceLocation, getRoute]
  );

  // Clear selected center and route
  const handleClearSelection = useCallback(() => {
    setSelectedCenter(null);
    clearRoute();
  }, [clearRoute]);

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

        {/* Top Row: Alert Level + Status Cards | Map */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Alert + Status */}
          <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
            {/* Alert Level */}
            <AlertLevelCard
              level={alertLevel}
              lastUpdated={alertLastUpdated}
              loading={alertLoading}
              error={alertError}
              onRefresh={refetchAlert}
            />

            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatusCard
                loading={loading}
                error={errorMsg}
                distance={userDistanceInfo?.distanceKm ?? null}
                isInsidePDZ={userDistanceInfo?.isInsidePDZ ?? false}
                label="Your Location"
                compact
              />

              {searchedLocation && searchedDistanceInfo && (
                <StatusCard
                  loading={false}
                  distance={searchedDistanceInfo.distanceKm}
                  isInsidePDZ={searchedDistanceInfo.isInsidePDZ}
                  label="Searched Location"
                  locationName={searchedLocation.name}
                  compact
                />
              )}
            </div>
          </div>

          {/* Right: Map */}
          <div className="lg:col-span-3 order-1 lg:order-2">
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
              selectedCenter={selectedCenter}
              routeCoordinates={routeCoordinates}
            />
          </div>
        </div>

        {/* Bottom Row: Evacuation Centers | Safety Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EvacuationPanel
            centers={centersWithDistance}
            loading={centersLoading}
            error={centersError}
            onSelectCenter={handleSelectCenter}
            onClearSelection={handleClearSelection}
            selectedCenter={selectedCenter}
            routeInfo={{
              distance: routeDistance,
              duration: routeDuration,
              loading: routeLoading,
            }}
            hasUserLocation={!!referenceLocation}
            userLocation={referenceLocation}
            onRefresh={fetchCenters}
          />

          <SafetyTipsCard alertLevel={alertLevel} />
        </div>

        {/* Emergency Contacts & Resources */}
        <footer className="border-t border-white/10 pt-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* PHIVOLCS */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <h4 className="text-white font-semibold mb-3">PHIVOLCS</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="tel:+6328426146879"
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-blue-400">Trunkline:</span> (02) 8426-1468 to 79
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.phivolcs.dost.gov.ph"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-blue-400">Website:</span> phivolcs.dost.gov.ph
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.facebook.com/PHIVOLCS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-blue-400">Facebook:</span> /PHIVOLCS
                  </a>
                </li>
              </ul>
            </div>

            {/* Mayon Volcano Observatory */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <h4 className="text-white font-semibold mb-3">Mayon Volcano Observatory</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="tel:+63528242383"
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-blue-400">Hotline:</span> (052) 824-2383
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.phivolcs.dost.gov.ph/mayon-volcano-observatory/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-blue-400">Info:</span> MVO Page
                  </a>
                </li>
                <li className="text-gray-500">
                  Located at Ligñon Hill, Albay
                </li>
              </ul>
            </div>

            {/* Emergency Hotlines */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <h4 className="text-white font-semibold mb-3">Emergency Hotlines</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="tel:911"
                    className="text-gray-400 hover:text-rose-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-rose-400">National Emergency:</span> 911
                  </a>
                </li>
                <li>
                  <a
                    href="tel:143"
                    className="text-gray-400 hover:text-rose-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-rose-400">Red Cross:</span> 143
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.albay.gov.ph/contact/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-blue-400">Albay Gov:</span> albay.gov.ph/contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center text-gray-500 text-sm border-t border-white/10 pt-6">
            <p>A project from <a href="https://bryan-web.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">Bryan Alfuente</a></p>
            <p className="mt-1">© {new Date().getFullYear()} Mayon Safety Initiative.</p>
            <p className="mt-1">
              Stay safe. Always follow official advisories from local authorities and PHIVOLCS.
            </p>
          </div>
        </footer>
      </div>
    </BackgroundLayout>
  );
}

export default App;

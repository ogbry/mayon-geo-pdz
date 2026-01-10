import { useMemo, useState, useEffect, useCallback } from "react";
import BackgroundLayout from "./components/BackgroundLayout";
import Header from "./components/Header";
import Hero from "./components/Hero";
import StatusCard from "./components/StatusCard";
import AlertLevelCard from "./components/AlertLevelCard";
import MapComponent from "./components/MapComponent";
import LocationSearch from "./components/LocationSearch";
import EvacuationPanel from "./components/EvacuationPanel";
import SafetyTipsCard from "./components/SafetyTipsCard";
import MobileNav from "./components/MobileNav";
import useGeolocation from "./hooks/useGeolocation";
import useLocationSearch from "./hooks/useLocationSearch";
import useEvacuationCenters from "./hooks/useEvacuationCenters";
import useRouting from "./hooks/useRouting";
import useVolcanoAlert from "./hooks/useVolcanoAlert";
import { calculateDistance } from "./utils/haversine";
import { MAYON_COORDINATES, PDZ_RADIUS_KM } from "./utils/constants";
import type { EvacuationCenter } from "./types/evacuation";
import { useLanguage } from "./i18n";

function App() {
  const { t } = useLanguage();
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
      {/* Sticky Header */}
      <Header alertLevel={alertLevel} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <Hero />

        {/* Location Search */}
        <div className="mb-6">
          <LocationSearch
            onSearchAddress={searchByAddress}
            onSearchCoordinates={searchByCoordinates}
            onClear={clearSearch}
            loading={searchLoading}
            error={searchError}
            hasLocation={!!searchedLocation}
          />
        </div>

        {/* Main Grid: Map + Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Map - Takes 2/3 on large screens */}
          <div id="map" className="lg:col-span-2 order-1">
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
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

          {/* Right Sidebar - Info Cards */}
          <div className="lg:col-span-1 space-y-4 order-2">
            {/* Alert Level */}
            <AlertLevelCard
              level={alertLevel}
              lastUpdated={alertLastUpdated}
              loading={alertLoading}
              error={alertError}
              onRefresh={refetchAlert}
            />

            {/* Status Cards */}
            <StatusCard
              loading={loading}
              error={errorMsg}
              distance={userDistanceInfo?.distanceKm ?? null}
              isInsidePDZ={userDistanceInfo?.isInsidePDZ ?? false}
              label={t.yourLocation}
              compact
            />

            {searchedLocation && searchedDistanceInfo && (
              <StatusCard
                loading={false}
                distance={searchedDistanceInfo.distanceKm}
                isInsidePDZ={searchedDistanceInfo.isInsidePDZ}
                label={t.searchedLocation}
                locationName={searchedLocation.name}
                compact
              />
            )}
          </div>
        </div>

        {/* Bottom Row: Evacuation Centers | Safety Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
        <footer id="contacts" className="border-t border-slate-800 pt-8 pb-6">
          <h3 className="text-lg font-semibold text-white mb-6">{t.emergencyContacts}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* PHIVOLCS */}
            <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
              <h4 className="text-white font-medium mb-3">PHIVOLCS</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="tel:+6328426146879"
                    className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-blue-400">Trunkline:</span> (02) 8426-1468 to 79
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.phivolcs.dost.gov.ph"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-blue-400">{t.website}:</span> phivolcs.dost.gov.ph
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.facebook.com/PHIVOLCS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-blue-400">Facebook:</span> /PHIVOLCS
                  </a>
                </li>
              </ul>
            </div>

            {/* Mayon Volcano Observatory */}
            <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
              <h4 className="text-white font-medium mb-3">Mayon Volcano Observatory</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="tel:+63528242383"
                    className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-blue-400">{t.hotline}:</span> (052) 824-2383
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.phivolcs.dost.gov.ph/mayon-volcano-observatory/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-blue-400">Info:</span> MVO Page
                  </a>
                </li>
                <li className="text-slate-500">
                  {t.locatedAt}
                </li>
              </ul>
            </div>

            {/* Emergency Hotlines */}
            <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
              <h4 className="text-white font-medium mb-3">Emergency Hotlines</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="tel:911"
                    className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-rose-400">{t.nationalEmergency}:</span> 911
                  </a>
                </li>
                <li>
                  <a
                    href="tel:143"
                    className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-rose-400">{t.redCross}:</span> 143
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.albay.gov.ph/contact/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-blue-400">Albay Gov:</span> albay.gov.ph/contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center text-slate-500 text-sm border-t border-slate-800 pt-6">
            <p>{t.projectFrom} <a href="https://bryan-web.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">Bryan Alfuente</a></p>
            <p className="mt-1">© {new Date().getFullYear()} {t.appName}. {t.allRightsReserved}</p>
            <p className="mt-2 text-xs">
              {t.followAdvisories}
            </p>
          </div>
        </footer>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </BackgroundLayout>
  );
}

export default App;

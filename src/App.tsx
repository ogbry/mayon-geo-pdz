import { useMemo, useState, useEffect, useCallback } from "react";
import { Smartphone, Download } from "lucide-react";
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
import ObservationCard from "./components/ObservationCard";
import EmergencyContacts from "./components/EmergencyContacts";
import SOSModal, { SOSButton } from "./components/SOSModal";
import useGeolocation from "./hooks/useGeolocation";
import useLocationSearch from "./hooks/useLocationSearch";
import useEvacuationCenters from "./hooks/useEvacuationCenters";
import useRouting from "./hooks/useRouting";
import useVolcanoAlert from "./hooks/useVolcanoAlert";
import { calculateDistance } from "./utils/haversine";
import { MAYON_COORDINATES, PDZ_RADIUS_KM, PLAY_STORE_URL } from "./utils/constants";
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

  // SOS modal
  const [sosOpen, setSosOpen] = useState(false);

  // Fetch evacuation centers on mount (uses cache if fresh)
  useEffect(() => {
    fetchCenters(false);
  }, [fetchCenters]);

  // Calculate distances from searched location (priority) or user location
  const centersWithDistance = useMemo(() => {
    if (rawCenters.length === 0) return rawCenters;
    if (searchedLocation) {
      return getCentersWithDistance(searchedLocation.lat, searchedLocation.lng);
    }
    if (coordinates) {
      return getCentersWithDistance(coordinates.latitude, coordinates.longitude);
    }
    return rawCenters;
  }, [coordinates, searchedLocation, rawCenters, getCentersWithDistance]);

  // Determine the reference location for routing
  const referenceLocation = useMemo(() => {
    if (searchedLocation) return { lat: searchedLocation.lat, lng: searchedLocation.lng };
    if (coordinates) return { lat: coordinates.latitude, lng: coordinates.longitude };
    return null;
  }, [searchedLocation, coordinates]);

  // Nearest center (first sorted by distance)
  const nearestCenter = centersWithDistance.length > 0 ? centersWithDistance[0] : null;

  // Handle center selection
  const handleSelectCenter = useCallback(
    (center: EvacuationCenter) => {
      if (!referenceLocation) return;
      setSelectedCenter(center);
      getRoute(referenceLocation, { lat: center.lat, lng: center.lng });
    },
    [referenceLocation, getRoute]
  );

  const handleClearSelection = useCallback(() => {
    setSelectedCenter(null);
    clearRoute();
  }, [clearRoute]);

  // Distance for user GPS location
  const userDistanceInfo = useMemo(() => {
    if (!coordinates) return null;
    const dist = calculateDistance(
      coordinates.latitude, coordinates.longitude,
      MAYON_COORDINATES.lat, MAYON_COORDINATES.lng
    );
    return { distanceKm: dist, isInsidePDZ: dist <= PDZ_RADIUS_KM };
  }, [coordinates]);

  // Distance for searched location
  const searchedDistanceInfo = useMemo(() => {
    if (!searchedLocation) return null;
    const dist = calculateDistance(
      searchedLocation.lat, searchedLocation.lng,
      MAYON_COORDINATES.lat, MAYON_COORDINATES.lng
    );
    return { distanceKm: dist, isInsidePDZ: dist <= PDZ_RADIUS_KM };
  }, [searchedLocation]);

  const loading = !loaded;
  const errorMsg = error ? error.message : undefined;

  return (
    <BackgroundLayout>
      {/* Sticky Header */}
      <Header alertLevel={alertLevel} onSOSClick={() => setSosOpen(true)} />

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
          {/* Map — 2/3 */}
          <div id="map" className="lg:col-span-2 order-1">
            <div className="glass-card rounded-2xl border border-white/[0.07] overflow-hidden">
              <MapComponent
                userLocation={coordinates ? { lat: coordinates.latitude, lng: coordinates.longitude } : undefined}
                searchedLocation={searchedLocation ? { lat: searchedLocation.lat, lng: searchedLocation.lng, name: searchedLocation.name } : undefined}
                selectedCenter={selectedCenter}
                routeCoordinates={routeCoordinates}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-4 order-2">
            <AlertLevelCard
              level={alertLevel}
              lastUpdated={alertLastUpdated}
              loading={alertLoading}
              error={alertError}
              onRefresh={refetchAlert}
            />

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

        {/* Observation Card — full width */}
        <div className="mb-6">
          <ObservationCard
            level={alertLevel}
            lastUpdated={alertLastUpdated}
            loading={alertLoading}
          />
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
            routeInfo={{ distance: routeDistance, duration: routeDuration, loading: routeLoading }}
            hasUserLocation={!!referenceLocation}
            userLocation={referenceLocation}
            onRefresh={() => fetchCenters(true)}
          />

          <SafetyTipsCard alertLevel={alertLevel} />
        </div>

        {/* Emergency Contacts */}
        <footer className="border-t border-white/[0.06] pt-8 pb-6">
          <EmergencyContacts />

          {/* Android app */}
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card group mb-8 flex items-center gap-4 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 px-4 py-3.5 transition-all duration-200"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 flex-shrink-0">
              <Smartphone size={18} className="text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{t.getAndroidApp}</p>
              <p className="text-[11px] text-slate-500 leading-tight">{t.androidAppSubtitle}</p>
            </div>
            <span className="flex items-center gap-1.5 flex-shrink-0 text-xs font-medium text-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
              <Download size={13} />
              {t.install}
            </span>
          </a>

          <div className="text-center text-slate-600 text-sm border-t border-white/[0.05] pt-6">
            <p>
              {t.projectFrom}{" "}
              <a
                href="https://bryan.dxlabs.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Bryan Alfuente
              </a>
            </p>
            <p className="mt-1">© {new Date().getFullYear()} {t.appName}. {t.allRightsReserved}</p>
            <p className="mt-2 text-xs text-slate-700">{t.followAdvisories}</p>
          </div>
        </footer>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* SOS Floating Button */}
      <SOSButton onClick={() => setSosOpen(true)} />

      {/* SOS Modal */}
      <SOSModal
        isOpen={sosOpen}
        onClose={() => setSosOpen(false)}
        userLocation={referenceLocation}
        nearestCenterName={nearestCenter?.name ?? null}
        nearestCenterCoords={nearestCenter ? { lat: nearestCenter.lat, lng: nearestCenter.lng } : null}
      />
    </BackgroundLayout>
  );
}

export default App;

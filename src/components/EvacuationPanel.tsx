import React from "react";
import { clsx } from "clsx";
import {
    Shield,
    Building2,
    GraduationCap,
    Cross,
    Navigation,
    Loader2,
    ChevronRight,
    MapPin,
    Clock,
    Route,
    X,
    ExternalLink,
    RefreshCw,
} from "lucide-react";
import type { EvacuationCenter, EvacuationCenterType } from "../types/evacuation";
import { useLanguage } from "../i18n";

interface EvacuationPanelProps {
    centers: EvacuationCenter[];
    loading: boolean;
    error: string | null;
    onSelectCenter: (center: EvacuationCenter) => void;
    onClearSelection: () => void;
    selectedCenter: EvacuationCenter | null;
    routeInfo: {
        distance: number | null;
        duration: number | null;
        loading: boolean;
    } | null;
    hasUserLocation: boolean;
    userLocation?: { lat: number; lng: number } | null;
    onRefresh: () => void;
}

const typeIcons: Record<EvacuationCenterType, React.ElementType> = {
    shelter: Shield,
    school: GraduationCap,
    hospital: Cross,
    government: Building2,
};

const typeColors: Record<EvacuationCenterType, string> = {
    shelter: "text-orange-400",
    school: "text-yellow-400",
    hospital: "text-red-400",
    government: "text-blue-400",
};

const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
};

const formatDuration = (seconds: number): string => {
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
};

const getGoogleMapsUrl = (
    destination: { lat: number; lng: number; name: string },
    origin?: { lat: number; lng: number } | null
): string => {
    const destParam = `${destination.lat},${destination.lng}`;
    const destName = encodeURIComponent(destination.name);

    if (origin) {
        return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destParam}&destination_place_id=${destName}&travelmode=driving`;
    }
    // If no origin, Google Maps will use user's current location
    return `https://www.google.com/maps/dir/?api=1&destination=${destParam}&travelmode=driving`;
};

const EvacuationPanel: React.FC<EvacuationPanelProps> = ({
    centers,
    loading,
    error,
    onSelectCenter,
    onClearSelection,
    selectedCenter,
    routeInfo,
    hasUserLocation,
    userLocation,
    onRefresh,
}) => {
    const { t } = useLanguage();

    const typeLabels: Record<EvacuationCenterType, string> = {
        shelter: t.shelter,
        school: t.school,
        hospital: t.hospital,
        government: t.government,
    };

    return (
        <div id="evacuation" className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <Shield size={16} className="text-orange-400" />
                    <span className="text-sm font-medium text-slate-300">{t.evacuationCenters}</span>
                    {centers.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-400">
                            {centers.length}
                        </span>
                    )}
                </div>
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                    title={t.refresh}
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Content */}
            <div className="p-4">

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-8 text-gray-400">
                    <Loader2 size={24} className="animate-spin mr-2" />
                    <span>{t.loadingCenters}</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm mb-4">
                    {error}
                    <button
                        onClick={onRefresh}
                        className="ml-2 underline hover:no-underline"
                    >
                        {t.retry}
                    </button>
                </div>
            )}

            {/* Selected Center Route Info */}
            {selectedCenter && routeInfo && (
                <div className="mb-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <Route size={16} className="text-orange-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-orange-400 truncate">
                                {t.routeTo} {selectedCenter.name}
                            </span>
                        </div>
                        <button
                            onClick={onClearSelection}
                            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                            title={t.clearSelection}
                        >
                            <X size={16} />
                        </button>
                    </div>
                    {routeInfo.loading ? (
                        <div className="flex items-center text-gray-400 text-sm">
                            <Loader2 size={14} className="animate-spin mr-2" />
                            {t.calculatingRoute}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-4 text-sm">
                                {routeInfo.distance !== null && (
                                    <div className="flex items-center gap-1 text-gray-300">
                                        <MapPin size={14} className="text-gray-500" />
                                        {formatDistance(routeInfo.distance)}
                                    </div>
                                )}
                                {routeInfo.duration !== null && (
                                    <div className="flex items-center gap-1 text-gray-300">
                                        <Clock size={14} className="text-gray-500" />
                                        {formatDuration(routeInfo.duration)} {t.drive}
                                    </div>
                                )}
                            </div>
                            <a
                                href={getGoogleMapsUrl(
                                    { lat: selectedCenter.lat, lng: selectedCenter.lng, name: selectedCenter.name },
                                    userLocation
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
                            >
                                <ExternalLink size={14} />
                                {t.getDirections}
                            </a>
                        </div>
                    )}
                </div>
            )}

            {/* Centers List */}
            {!loading && centers.length > 0 && (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    {centers.slice(0, 15).map((center) => {
                        const Icon = typeIcons[center.type];
                        const isSelected = selectedCenter?.id === center.id;

                        return (
                            <button
                                key={center.id}
                                onClick={() => onSelectCenter(center)}
                                disabled={!hasUserLocation}
                                className={clsx(
                                    "w-full p-3 rounded-xl text-left transition-colors flex items-center gap-3",
                                    isSelected
                                        ? "bg-orange-500/10 border border-orange-500/20"
                                        : "bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800",
                                    !hasUserLocation && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <div className={clsx("p-2 rounded-lg bg-slate-800", typeColors[center.type])}>
                                    <Icon size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={clsx(
                                            "text-sm font-medium truncate",
                                            isSelected ? "text-orange-400" : "text-white"
                                        )}
                                    >
                                        {center.name}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span className="capitalize">{typeLabels[center.type]}</span>
                                        {center.distanceFromUser !== undefined && (
                                            <>
                                                <span>•</span>
                                                <span>{center.distanceFromUser.toFixed(1)} km</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {hasUserLocation && (
                                    <ChevronRight
                                        size={16}
                                        className={isSelected ? "text-orange-400" : "text-slate-500"}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* No Location Warning */}
            {!hasUserLocation && !loading && centers.length > 0 && (
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-amber-400 text-sm">
                    <Navigation size={16} />
                    <span>{t.enableLocation}</span>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && centers.length === 0 && (
                <div className="py-8 text-center text-slate-400">
                    <Shield size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{t.noCentersFound}</p>
                    <button
                        onClick={onRefresh}
                        className="mt-2 text-xs text-orange-400 hover:underline"
                    >
                        {t.refresh}
                    </button>
                </div>
            )}
            </div>
        </div>
    );
};

export default React.memo(EvacuationPanel);

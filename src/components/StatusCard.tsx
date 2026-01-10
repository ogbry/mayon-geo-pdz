import React from "react";
import { clsx } from "clsx";
import { AlertTriangle, CheckCircle, Navigation, MapPin } from "lucide-react";
import { useLanguage } from "../i18n";

interface StatusCardProps {
    isInsidePDZ: boolean;
    distance: number | null;
    loading: boolean;
    error?: string;
    label?: string;
    locationName?: string;
    compact?: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({
    isInsidePDZ,
    distance,
    loading,
    error,
    label,
    locationName,
    compact = false,
}) => {
    const { t } = useLanguage();

    // Determine status config
    const status = loading
        ? {
            color: "text-slate-400",
            bg: "bg-slate-800/50",
            border: "border-slate-700/50",
            iconBg: "bg-slate-800",
            icon: Navigation,
            title: t.locating,
            message: t.acquiringLocation,
        }
        : error
            ? {
                color: "text-amber-400",
                bg: "bg-amber-500/10",
                border: "border-amber-500/20",
                iconBg: "bg-amber-500/10",
                icon: AlertTriangle,
                title: t.error,
                message: error,
            }
            : isInsidePDZ
                ? {
                    color: "text-rose-400",
                    bg: "bg-rose-500/10",
                    border: "border-rose-500/20",
                    iconBg: "bg-rose-500/10",
                    icon: AlertTriangle,
                    title: t.danger,
                    message: t.insidePDZ,
                }
                : {
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                    border: "border-emerald-500/20",
                    iconBg: "bg-emerald-500/10",
                    icon: CheckCircle,
                    title: t.safe,
                    message: t.outsidePDZ,
                };

    const Icon = status.icon;

    // Compact layout (used in dashboard)
    if (compact) {
        return (
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
                {/* Header */}
                {label && (
                    <div className="px-4 py-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-slate-400" />
                            <span className="text-sm font-medium text-slate-300">
                                {label}
                            </span>
                        </div>
                        {locationName && (
                            <p className="text-xs text-slate-500 mt-1 truncate" title={locationName}>
                                {locationName}
                            </p>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="p-4">
                    <div className="flex items-center gap-3">
                        <div className={clsx("p-2.5 rounded-xl", status.iconBg)}>
                            <Icon size={22} className={clsx(status.color, loading && "animate-pulse")} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className={clsx("text-base font-semibold", status.color)}>
                                {status.title}
                            </h3>
                            <p className="text-slate-400 text-xs truncate">{status.message}</p>
                        </div>

                        {!loading && !error && distance !== null && (
                            <div className="text-right pl-2">
                                <div className="flex items-baseline gap-0.5">
                                    <span className="text-2xl font-mono font-bold text-white">
                                        {distance.toFixed(1)}
                                    </span>
                                    <span className="text-sm text-slate-500">km</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Full layout
    return (
        <div className={clsx(
            "rounded-2xl p-6 border",
            status.bg,
            status.border
        )}>
            {/* Label Header */}
            {label && (
                <div className="mb-4 pb-3 border-b border-slate-800">
                    <span className="text-sm font-medium text-slate-400">
                        {label}
                    </span>
                    {locationName && (
                        <p className="text-xs text-slate-500 mt-1 truncate" title={locationName}>
                            {locationName}
                        </p>
                    )}
                </div>
            )}

            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className={clsx("p-4 rounded-2xl", status.iconBg)}>
                    <Icon size={40} className={clsx(status.color, loading && "animate-pulse")} />
                </div>

                <div className="flex-1 space-y-1">
                    <h2 className={clsx("text-2xl font-bold", status.color)}>
                        {status.title}
                    </h2>
                    <p className="text-slate-400">{status.message}</p>
                </div>

                {!loading && !error && distance !== null && (
                    <div className="flex flex-col items-center md:items-end bg-slate-800/50 rounded-xl p-4 min-w-[120px]">
                        <span className="text-xs font-medium text-slate-500 uppercase">
                            {t.distance}
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-mono font-bold text-white">
                                {distance.toFixed(2)}
                            </span>
                            <span className="text-sm text-slate-500">km</span>
                        </div>
                        <span className="text-xs text-slate-500 mt-1">{t.fromCrater}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatusCard;

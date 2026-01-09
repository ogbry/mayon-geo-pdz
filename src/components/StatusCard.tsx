import React from "react";
import { clsx } from "clsx";
import { AlertTriangle, CheckCircle, Navigation } from "lucide-react";
import { motion } from "framer-motion";

interface StatusCardProps {
    isInsidePDZ: boolean;
    distance: number | null;
    loading: boolean;
    error?: string;
    label?: string;
    locationName?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({
    isInsidePDZ,
    distance,
    loading,
    error,
    label,
    locationName,
}) => {
    // Determine status config
    const status = loading
        ? {
            color: "text-gray-400",
            bg: "bg-gray-500/10",
            border: "border-gray-500/20",
            icon: Navigation,
            title: "Locating...",
            message: "Acquiring your precise location.",
        }
        : error
            ? {
                color: "text-amber-400",
                bg: "bg-amber-500/10",
                border: "border-amber-500/20",
                icon: AlertTriangle,
                title: "Location Error",
                message: error,
            }
            : isInsidePDZ
                ? {
                    color: "text-rose-500",
                    bg: "bg-rose-500/10",
                    border: "border-rose-500/20",
                    icon: AlertTriangle,
                    title: "DANGER ZONE!",
                    message: "You are inside the 6km Permanent Danger Zone.",
                }
                : {
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                    border: "border-emerald-500/20",
                    icon: CheckCircle,
                    title: "Safe Zone",
                    message: "You are outside the 6km Permanent Danger Zone.",
                };

    const Icon = status.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                "backdrop-blur-xl rounded-3xl p-6 md:p-8 border shadow-lg transition-all duration-500",
                status.bg,
                status.border
            )}
        >
            {/* Label Header */}
            {label && (
                <div className="mb-4 pb-3 border-b border-white/10">
                    <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        {label}
                    </span>
                    {locationName && (
                        <p className="text-xs text-gray-500 mt-1 truncate" title={locationName}>
                            {locationName}
                        </p>
                    )}
                </div>
            )}

            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className={clsx("p-4 rounded-full bg-white/5 ring-1 ring-white/10", status.color)}>
                    <Icon size={48} className={loading ? "animate-pulse" : ""} />
                </div>

                <div className="flex-1 space-y-2">
                    <h2 className={clsx("text-3xl font-bold tracking-tight", status.color)}>
                        {status.title}
                    </h2>
                    <p className="text-gray-300 text-lg leading-relaxed">{status.message}</p>
                </div>

                {!loading && !error && distance !== null && (
                    <div className="flex flex-col items-center md:items-end bg-white/5 rounded-2xl p-4 min-w-[140px] border border-white/5">
                        <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                            Distance
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-mono font-bold text-white">
                                {distance.toFixed(2)}
                            </span>
                            <span className="text-lg text-gray-500 font-medium">km</span>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">from Crater</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default StatusCard;

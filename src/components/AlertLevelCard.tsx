import React from "react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { AlertTriangle, Activity, RefreshCw, ExternalLink } from "lucide-react";
import { getAlertInfo } from "../hooks/useVolcanoAlert";

interface AlertLevelCardProps {
    level: number | null;
    lastUpdated: string | null;
    loading: boolean;
    error: string | null;
    onRefresh: () => void;
}

const levelColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    emerald: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        text: "text-emerald-400",
        glow: "shadow-emerald-500/20",
    },
    green: {
        bg: "bg-green-500/10",
        border: "border-green-500/30",
        text: "text-green-400",
        glow: "shadow-green-500/20",
    },
    yellow: {
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/30",
        text: "text-yellow-400",
        glow: "shadow-yellow-500/20",
    },
    orange: {
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
        text: "text-orange-400",
        glow: "shadow-orange-500/20",
    },
    red: {
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        text: "text-red-400",
        glow: "shadow-red-500/20",
    },
    rose: {
        bg: "bg-rose-500/10",
        border: "border-rose-500/30",
        text: "text-rose-400",
        glow: "shadow-rose-500/20",
    },
    gray: {
        bg: "bg-gray-500/10",
        border: "border-gray-500/30",
        text: "text-gray-400",
        glow: "shadow-gray-500/20",
    },
};

const AlertLevelCard: React.FC<AlertLevelCardProps> = ({
    level,
    lastUpdated,
    loading,
    error,
    onRefresh,
}) => {
    const alertInfo = getAlertInfo(level);
    const colors = levelColors[alertInfo.color] || levelColors.gray;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                "backdrop-blur-xl rounded-2xl p-4 border shadow-lg transition-colors duration-300",
                colors.bg,
                colors.border,
                colors.glow
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Activity size={16} className={colors.text} />
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Mayon Alert Level
                    </span>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    title="Refresh alert level"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Alert Level Display */}
            {error ? (
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-amber-500/10">
                        <AlertTriangle size={20} className="text-amber-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-amber-400">Unable to fetch</p>
                        <p className="text-xs text-gray-500">Check PHIVOLCS directly</p>
                    </div>
                    <a
                        href="https://www.phivolcs.dost.gov.ph/index.php/mayon-volcano-bulletin-menu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <ExternalLink size={14} />
                    </a>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    {/* Large Level Number */}
                    <div
                        className={clsx(
                            "w-14 h-14 rounded-xl flex items-center justify-center font-mono font-bold text-3xl",
                            "bg-white/5 ring-1 ring-white/10",
                            colors.text
                        )}
                    >
                        {loading ? (
                            <span className="text-lg text-gray-500">...</span>
                        ) : level !== null ? (
                            level
                        ) : (
                            "?"
                        )}
                    </div>

                    {/* Alert Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className={clsx("text-lg font-bold", colors.text)}>
                            {loading ? "Loading..." : alertInfo.short}
                        </h3>
                        <p className="text-xs text-gray-400 line-clamp-2">
                            {loading ? "Fetching from PHIVOLCS..." : alertInfo.detail}
                        </p>
                        {lastUpdated && !loading && (
                            <p className="text-xs text-gray-500 mt-1">
                                Updated: {lastUpdated}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Alert Level Scale */}
            {!error && !loading && level !== null && (
                <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="flex gap-1">
                        {[0, 1, 2, 3, 4, 5].map((l) => (
                            <div
                                key={l}
                                className={clsx(
                                    "flex-1 h-1.5 rounded-full transition-all",
                                    l <= level
                                        ? l <= 1
                                            ? "bg-emerald-500"
                                            : l === 2
                                            ? "bg-yellow-500"
                                            : l === 3
                                            ? "bg-orange-500"
                                            : "bg-rose-500"
                                        : "bg-white/10"
                                )}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-gray-500">0</span>
                        <span className="text-[10px] text-gray-500">5</span>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default AlertLevelCard;

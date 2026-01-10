import React from "react";
import { clsx } from "clsx";
import { AlertTriangle, Activity, RefreshCw, ExternalLink } from "lucide-react";
import { getAlertInfo } from "../hooks/useVolcanoAlert";
import { useLanguage } from "../i18n";

interface AlertLevelCardProps {
    level: number | null;
    lastUpdated: string | null;
    loading: boolean;
    error: string | null;
    onRefresh: () => void;
}

const levelColors: Record<string, { bg: string; border: string; text: string; indicator: string }> = {
    emerald: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        text: "text-emerald-400",
        indicator: "bg-emerald-500",
    },
    green: {
        bg: "bg-green-500/10",
        border: "border-green-500/20",
        text: "text-green-400",
        indicator: "bg-green-500",
    },
    yellow: {
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        text: "text-yellow-400",
        indicator: "bg-yellow-500",
    },
    orange: {
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        text: "text-orange-400",
        indicator: "bg-orange-500",
    },
    red: {
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        text: "text-red-400",
        indicator: "bg-red-500",
    },
    rose: {
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
        text: "text-rose-400",
        indicator: "bg-rose-500",
    },
    gray: {
        bg: "bg-slate-800/50",
        border: "border-slate-700/50",
        text: "text-slate-400",
        indicator: "bg-slate-500",
    },
};

const AlertLevelCard: React.FC<AlertLevelCardProps> = ({
    level,
    lastUpdated,
    loading,
    error,
    onRefresh,
}) => {
    const { t } = useLanguage();
    const alertInfo = getAlertInfo(level);
    const colors = levelColors[alertInfo.color] || levelColors.gray;

    return (
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">
                        {t.volcanoAlertLevel}
                    </span>
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
                {error ? (
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10">
                            <AlertTriangle size={20} className="text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-amber-400">{t.unableToFetch}</p>
                            <p className="text-xs text-slate-500">{t.checkPhivolcs}</p>
                        </div>
                        <a
                            href="https://www.phivolcs.dost.gov.ph/index.php/mayon-volcano-bulletin-menu"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                            <ExternalLink size={14} />
                        </a>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        {/* Large Level Number */}
                        <div
                            className={clsx(
                                "w-16 h-16 rounded-2xl flex items-center justify-center font-mono font-bold text-3xl border",
                                colors.bg,
                                colors.border,
                                colors.text
                            )}
                        >
                            {loading ? (
                                <span className="text-lg text-slate-500">...</span>
                            ) : level !== null ? (
                                level
                            ) : (
                                "?"
                            )}
                        </div>

                        {/* Alert Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className={clsx("text-lg font-semibold", colors.text)}>
                                {loading ? t.loading : alertInfo.short}
                            </h3>
                            <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                                {loading ? t.fetchingFromPhivolcs : alertInfo.detail}
                            </p>
                            {lastUpdated && !loading && (
                                <p className="text-xs text-slate-500 mt-1.5">
                                    {t.updated}: {lastUpdated}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Alert Level Scale */}
                {!error && !loading && level !== null && (
                    <div className="mt-4 pt-4 border-t border-slate-800">
                        <div className="flex gap-1.5">
                            {[0, 1, 2, 3, 4, 5].map((l) => (
                                <div
                                    key={l}
                                    className={clsx(
                                        "flex-1 h-2 rounded-full transition-all",
                                        l <= level
                                            ? l <= 1
                                                ? "bg-emerald-500"
                                                : l === 2
                                                ? "bg-yellow-500"
                                                : l === 3
                                                ? "bg-orange-500"
                                                : "bg-rose-500"
                                            : "bg-slate-800"
                                    )}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between mt-1.5">
                            <span className="text-[10px] text-slate-500">{t.normal}</span>
                            <span className="text-[10px] text-slate-500">{t.hazardous}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertLevelCard;

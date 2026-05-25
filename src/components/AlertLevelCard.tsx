import React from "react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { AlertTriangle, Activity, RefreshCw, ExternalLink, Zap } from "lucide-react";
import { getAlertInfo } from "../hooks/useVolcanoAlert";
import { useLanguage } from "../i18n";

interface AlertLevelCardProps {
    level: number | null;
    lastUpdated: string | null;
    loading: boolean;
    error: string | null;
    onRefresh: () => void;
}

const STATUS_BADGES: Record<number, string> = {
    0: "NORMAL",
    1: "LOW UNREST",
    2: "MODERATE",
    3: "HIGH UNREST",
    4: "IMMINENT",
    5: "ONGOING",
};

const levelConfig: Record<string, {
    bg: string; border: string; text: string; indicator: string;
    badgeBg: string; badgeText: string; glowClass: string; numberBg: string;
}> = {
    emerald: {
        bg: "bg-emerald-500/5", border: "border-emerald-500/20", text: "text-emerald-400",
        indicator: "bg-emerald-500", badgeBg: "bg-emerald-500/15", badgeText: "text-emerald-300",
        glowClass: "", numberBg: "bg-emerald-500/10",
    },
    green: {
        bg: "bg-green-500/5", border: "border-green-500/20", text: "text-green-400",
        indicator: "bg-green-500", badgeBg: "bg-green-500/15", badgeText: "text-green-300",
        glowClass: "", numberBg: "bg-green-500/10",
    },
    yellow: {
        bg: "bg-yellow-500/5", border: "border-yellow-500/20", text: "text-yellow-400",
        indicator: "bg-yellow-500", badgeBg: "bg-yellow-500/15", badgeText: "text-yellow-300",
        glowClass: "", numberBg: "bg-yellow-500/10",
    },
    orange: {
        bg: "bg-orange-500/5", border: "border-orange-500/25", text: "text-orange-400",
        indicator: "bg-orange-500", badgeBg: "bg-orange-500/20", badgeText: "text-orange-300",
        glowClass: "glow-orange", numberBg: "bg-orange-500/15",
    },
    red: {
        bg: "bg-red-500/5", border: "border-red-500/25", text: "text-red-400",
        indicator: "bg-red-500", badgeBg: "bg-red-500/20", badgeText: "text-red-300",
        glowClass: "glow-red", numberBg: "bg-red-500/15",
    },
    rose: {
        bg: "bg-rose-500/8", border: "border-rose-500/30", text: "text-rose-400",
        indicator: "bg-rose-500", badgeBg: "bg-rose-500/20", badgeText: "text-rose-300",
        glowClass: "glow-rose", numberBg: "bg-rose-500/15",
    },
    gray: {
        bg: "bg-slate-800/30", border: "border-slate-700/40", text: "text-slate-400",
        indicator: "bg-slate-500", badgeBg: "bg-slate-700/50", badgeText: "text-slate-400",
        glowClass: "", numberBg: "bg-slate-800/60",
    },
};

const segmentColor = (seg: number, level: number): string => {
    if (seg > level) return "bg-slate-800";
    if (seg <= 1) return "bg-emerald-500";
    if (seg === 2) return "bg-yellow-500";
    if (seg === 3) return "bg-orange-500";
    return "bg-rose-500";
};

const AlertLevelCard: React.FC<AlertLevelCardProps> = ({ level, lastUpdated, loading, error, onRefresh }) => {
    const { t } = useLanguage();
    const alertInfo = getAlertInfo(level);
    const cfg = levelConfig[alertInfo.color] || levelConfig.gray;
    const isHighAlert = level !== null && level >= 3;
    const badge = level !== null ? (STATUS_BADGES[level] ?? "UNKNOWN") : null;

    return (
        <div className={clsx(
            "glass-card rounded-2xl overflow-hidden transition-all duration-500",
            cfg.border,
            isHighAlert ? cfg.bg : "bg-slate-900/40"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <Activity size={15} className={isHighAlert ? cfg.text : "text-slate-400"} />
                    <span className="text-sm font-medium text-slate-300">{t.volcanoAlertLevel}</span>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                    title={t.refresh}
                >
                    <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Body */}
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
                            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                        >
                            <ExternalLink size={14} />
                        </a>
                    </div>
                ) : (
                    <>
                        {/* Level + Info Row */}
                        <div className="flex items-center gap-4 mb-4">
                            {/* Glowing level number */}
                            <div className="relative flex-shrink-0">
                                {isHighAlert && (
                                    <span className={clsx(
                                        "absolute inset-0 rounded-2xl ring-ripple",
                                        cfg.text
                                    )} />
                                )}
                                <motion.div
                                    className={clsx(
                                        "relative w-20 h-20 rounded-2xl flex items-center justify-center font-mono font-black text-4xl border",
                                        cfg.numberBg, cfg.border, cfg.text,
                                        isHighAlert && cfg.glowClass
                                    )}
                                    animate={isHighAlert ? { scale: [1, 1.03, 1] } : {}}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    {loading ? (
                                        <span className="text-xl text-slate-500 animate-pulse">…</span>
                                    ) : level !== null ? level : "?"}
                                </motion.div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                {/* Status badge */}
                                {badge && !loading && (
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        {isHighAlert && <Zap size={11} className={cfg.text} />}
                                        <span className={clsx(
                                            "text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full",
                                            cfg.badgeBg, cfg.badgeText
                                        )}>
                                            {badge}
                                        </span>
                                    </div>
                                )}
                                <h3 className={clsx("text-base font-semibold leading-tight", cfg.text)}>
                                    {loading ? t.loading : alertInfo.short}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                                    {loading ? t.fetchingFromPhivolcs : alertInfo.detail}
                                </p>
                            </div>
                        </div>

                        {/* Metadata */}
                        {!loading && lastUpdated && (
                            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3 px-0.5">
                                <span>{t.updated}: <span className="text-slate-400">{lastUpdated}</span></span>
                                <a
                                    href="https://www.phivolcs.dost.gov.ph/index.php/mayon-volcano-bulletin-menu"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-slate-500 hover:text-orange-400 transition-colors"
                                >
                                    PHIVOLCS <ExternalLink size={10} />
                                </a>
                            </div>
                        )}

                        {/* Alert Level Scale */}
                        {!loading && level !== null && (
                            <div className="pt-3 border-t border-white/[0.05]">
                                <div className="flex gap-1.5">
                                    {[0, 1, 2, 3, 4, 5].map((seg) => (
                                        <div key={seg} className="flex-1 flex flex-col items-center gap-1">
                                            <div className={clsx(
                                                "w-full h-1.5 rounded-full transition-all duration-500",
                                                segmentColor(seg, level)
                                            )} />
                                            <span className={clsx(
                                                "text-[9px] font-mono",
                                                seg === level ? cfg.text : "text-slate-600"
                                            )}>
                                                {seg}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-[10px] text-slate-600">{t.normal}</span>
                                    <span className="text-[10px] text-slate-600">{t.hazardous}</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AlertLevelCard;

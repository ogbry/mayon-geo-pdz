import React from "react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { Telescope, Flame, Wind, Activity, ExternalLink, Clock } from "lucide-react";
import { PHIVOLCS_BULLETIN_URL } from "../utils/constants";

interface ObservationCardProps {
    level: number | null;
    lastUpdated: string | null;
    loading?: boolean;
}

interface ObservationEntry {
    icon: React.ElementType;
    label: string;
    value: string;
    color: string;
    bg: string;
}

const LEVEL_OBSERVATIONS: Record<number, {
    eruption: string;
    ashfall: string;
    seismic: string;
    gases: string;
}> = {
    0: {
        eruption: "No eruptive activity observed",
        ashfall: "No ashfall risk",
        seismic: "Background seismicity only",
        gases: "Sulfur dioxide within safe levels",
    },
    1: {
        eruption: "Minor steaming and degassing",
        ashfall: "Minimal ashfall risk",
        seismic: "Low-level volcanic earthquakes",
        gases: "Low SO₂ flux detected",
    },
    2: {
        eruption: "Increased steaming, possible minor ash venting",
        ashfall: "Light ashfall possible in downwind barangays",
        seismic: "Increased seismicity, ground deformation noted",
        gases: "Elevated SO₂ emissions detected",
    },
    3: {
        eruption: "Lava flows, rockfall, and pyroclastic density currents",
        ashfall: "Ashfall expected in downwind communities",
        seismic: "Intense seismic swarms and ground deformation",
        gases: "High SO₂ flux — hazardous near summit",
    },
    4: {
        eruption: "Hazardous eruption imminent — major explosions possible",
        ashfall: "Heavy ashfall expected across wide areas",
        seismic: "Continuous tremor and rapid ground deformation",
        gases: "Dangerous volcanic gas concentrations",
    },
    5: {
        eruption: "Hazardous eruption ongoing — pyroclastic flows active",
        ashfall: "Continuous heavy ashfall — widespread areas affected",
        seismic: "Continuous tremor — eruption tremor detected",
        gases: "Lethal volcanic gas levels near summit",
    },
};

const ASHFALL_DIRECTION = "SE–NW (prevailing winds)";

const getColorForLevel = (level: number | null) => {
    if (level === null) return { text: "text-slate-400", border: "border-slate-700/40", badge: "bg-slate-700/30" };
    if (level <= 1) return { text: "text-emerald-400", border: "border-emerald-500/20", badge: "bg-emerald-500/10" };
    if (level === 2) return { text: "text-yellow-400", border: "border-yellow-500/20", badge: "bg-yellow-500/10" };
    if (level === 3) return { text: "text-orange-400", border: "border-orange-500/20", badge: "bg-orange-500/10" };
    return { text: "text-rose-400", border: "border-rose-500/25", badge: "bg-rose-500/10" };
};

const ObservationCard: React.FC<ObservationCardProps> = ({ level, lastUpdated, loading }) => {
    const obs = level !== null ? LEVEL_OBSERVATIONS[level] ?? LEVEL_OBSERVATIONS[0] : null;
    const colors = getColorForLevel(level);

    const entries: ObservationEntry[] = obs
        ? [
            { icon: Flame, label: "Eruption Activity", value: obs.eruption, color: "text-orange-400", bg: "bg-orange-500/8" },
            { icon: Wind, label: "Ashfall Risk", value: obs.ashfall, color: "text-sky-400", bg: "bg-sky-500/8" },
            { icon: Activity, label: "Seismic Activity", value: obs.seismic, color: "text-purple-400", bg: "bg-purple-500/8" },
            { icon: Wind, label: "Volcanic Gases", value: obs.gases, color: "text-yellow-400", bg: "bg-yellow-500/8" },
        ]
        : [];

    return (
        <div className={clsx(
            "glass-card rounded-2xl overflow-hidden border",
            colors.border
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <Telescope size={15} className={colors.text} />
                    <span className="text-sm font-medium text-slate-300">24-Hour Activity Summary</span>
                    <span className={clsx(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                        colors.badge, colors.text
                    )}>
                        PHIVOLCS
                    </span>
                </div>
                <a
                    href={PHIVOLCS_BULLETIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                    title="View full bulletin"
                >
                    <ExternalLink size={13} />
                </a>
            </div>

            {/* Body */}
            <div className="p-4">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />
                        ))}
                    </div>
                ) : obs ? (
                    <>
                        {/* Ashfall direction badge */}
                        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-sky-500/8 border border-sky-500/15">
                            <Wind size={13} className="text-sky-400 flex-shrink-0" />
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-sky-400 font-medium">Ashfall Direction:</span>
                                <span className="text-xs text-slate-300">{ASHFALL_DIRECTION}</span>
                            </div>
                        </div>

                        {/* Observation rows */}
                        <div className="space-y-2">
                            {entries.map((entry, idx) => {
                                const Icon = entry.icon;
                                return (
                                    <motion.div
                                        key={entry.label}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.06 }}
                                        className={clsx(
                                            "flex items-start gap-3 p-3 rounded-xl border border-white/[0.04]",
                                            entry.bg
                                        )}
                                    >
                                        <div className="mt-0.5 flex-shrink-0">
                                            <Icon size={14} className={entry.color} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={clsx("text-[10px] font-semibold uppercase tracking-wide mb-0.5", entry.color)}>
                                                {entry.label}
                                            </p>
                                            <p className="text-xs text-slate-300 leading-snug">{entry.value}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        {lastUpdated && (
                            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.05]">
                                <Clock size={11} className="text-slate-600" />
                                <p className="text-[11px] text-slate-600">
                                    Based on data as of <span className="text-slate-500">{lastUpdated}</span>
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-6 text-center text-slate-500 text-sm">
                        <Telescope size={28} className="mx-auto mb-2 opacity-30" />
                        <p>Waiting for alert data…</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ObservationCard;

import React, { useState } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldAlert,
    ChevronDown,
    Siren,
    Backpack,
    Home,
    Radio,
    Wind,
    Car,
} from "lucide-react";
import { useLanguage } from "../i18n";

interface SafetyTipsCardProps {
    alertLevel?: number | null;
}

interface SafetySection {
    id: string;
    titleKey: "beforeEruption" | "duringEvacuation" | "volcanicHazards" | "emergencyKit";
    tipsKey: "tipsBefore" | "tipsDuring" | "tipsHazards" | "tipsKit";
    icon: React.ElementType;
    color: string;
}

const safetySectionConfig: SafetySection[] = [
    {
        id: "before",
        titleKey: "beforeEruption",
        tipsKey: "tipsBefore",
        icon: Home,
        color: "text-blue-400",
    },
    {
        id: "during",
        titleKey: "duringEvacuation",
        tipsKey: "tipsDuring",
        icon: Car,
        color: "text-orange-400",
    },
    {
        id: "hazards",
        titleKey: "volcanicHazards",
        tipsKey: "tipsHazards",
        icon: Wind,
        color: "text-rose-400",
    },
    {
        id: "kit",
        titleKey: "emergencyKit",
        tipsKey: "tipsKit",
        icon: Backpack,
        color: "text-emerald-400",
    },
];

const SafetyTipsCard: React.FC<SafetyTipsCardProps> = ({ alertLevel }) => {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const { t } = useLanguage();

    const toggleSection = (id: string) => {
        setExpandedSection(expandedSection === id ? null : id);
    };

    // Determine urgency based on alert level
    const isHighAlert = alertLevel != null && alertLevel >= 3;

    return (
        <div id="safety" className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <ShieldAlert size={16} className={isHighAlert ? "text-orange-400" : "text-amber-400"} />
                    <span className="text-sm font-medium text-slate-300">{t.safetyPrecautions}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* High Alert Warning */}
                {isHighAlert && (
                    <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2">
                        <Siren size={16} className="text-rose-400 flex-shrink-0" />
                        <p className="text-sm text-rose-400">
                            {t.alertLevel} {alertLevel ?? 0} - {t.beReadyToEvacuate}
                        </p>
                    </div>
                )}

                {/* Safety Sections */}
                <div className="space-y-2">
                    {safetySectionConfig.map((section) => {
                        const Icon = section.icon;
                        const isExpanded = expandedSection === section.id;
                        const title = t[section.titleKey];
                        const tips = t[section.tipsKey];

                        return (
                            <div
                                key={section.id}
                                className="rounded-xl overflow-hidden border border-slate-700/50"
                            >
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full p-3 flex items-center gap-3 bg-slate-800/50 hover:bg-slate-800 transition-colors"
                                >
                                    <Icon size={16} className={section.color} />
                                    <span className="text-sm font-medium text-white flex-1 text-left">
                                        {title}
                                    </span>
                                    <ChevronDown
                                        size={16}
                                        className={clsx(
                                            "text-slate-400 transition-transform duration-200",
                                            isExpanded && "rotate-180"
                                        )}
                                    />
                                </button>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden bg-slate-800/30"
                                        >
                                            <ul className="p-3 space-y-2">
                                                {tips.map((tip, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-start gap-2 text-xs text-slate-400"
                                                    >
                                                        <span className={clsx("mt-0.5", section.color)}>•</span>
                                                        <span>{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Reminder */}
                <div className="mt-4 p-3 bg-slate-800/50 rounded-xl flex items-start gap-2">
                    <Radio size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-400">
                        <span className="text-blue-400 font-medium">{t.stayInformed}</span>{" "}
                        {t.monitorPhivolcs}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default React.memo(SafetyTipsCard);

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

interface SafetyTipsCardProps {
    alertLevel?: number | null;
}

interface SafetySection {
    id: string;
    title: string;
    icon: React.ElementType;
    color: string;
    tips: string[];
}

const safetySections: SafetySection[] = [
    {
        id: "before",
        title: "Before an Eruption",
        icon: Home,
        color: "text-blue-400",
        tips: [
            "Know your evacuation routes and nearest evacuation centers",
            "Prepare an emergency kit with essentials for at least 3 days",
            "Keep important documents in a waterproof container",
            "Stay updated with PHIVOLCS bulletins and local advisories",
            "Know the alert levels and what each one means",
        ],
    },
    {
        id: "during",
        title: "During Evacuation",
        icon: Car,
        color: "text-orange-400",
        tips: [
            "Follow official evacuation orders immediately",
            "Use designated evacuation routes only",
            "Bring your emergency kit and important documents",
            "Help elderly, children, and persons with disabilities",
            "Do not attempt to cross bridges covered by lahar",
            "Stay calm and avoid panic",
        ],
    },
    {
        id: "hazards",
        title: "Volcanic Hazards",
        icon: Wind,
        color: "text-rose-400",
        tips: [
            "Pyroclastic flows: Extremely hot and fast-moving - evacuate immediately",
            "Ashfall: Wear N95 masks, protect eyes, stay indoors when heavy",
            "Lahar: Avoid river channels and low-lying areas during rain",
            "Lava flows: Move perpendicular to flow direction to escape",
            "Volcanic gases: Leave area if you smell sulfur or have difficulty breathing",
        ],
    },
    {
        id: "kit",
        title: "Emergency Kit Essentials",
        icon: Backpack,
        color: "text-emerald-400",
        tips: [
            "Water (1 gallon per person per day for 3 days)",
            "Non-perishable food and manual can opener",
            "First aid kit and prescription medications",
            "Flashlight, batteries, and portable radio",
            "N95 masks, goggles, and protective clothing",
            "Cash, IDs, and important documents",
            "Phone charger and emergency contact list",
        ],
    },
];

const SafetyTipsCard: React.FC<SafetyTipsCardProps> = ({ alertLevel }) => {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const toggleSection = (id: string) => {
        setExpandedSection(expandedSection === id ? null : id);
    };

    // Determine urgency based on alert level
    const isHighAlert = alertLevel != null && alertLevel >= 3;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                "backdrop-blur-xl rounded-3xl p-4 md:p-6 border shadow-lg",
                isHighAlert
                    ? "bg-orange-500/10 border-orange-500/30"
                    : "bg-white/5 border-white/10"
            )}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div
                    className={clsx(
                        "p-2 rounded-full",
                        isHighAlert ? "bg-orange-500/20" : "bg-amber-500/10"
                    )}
                >
                    <ShieldAlert
                        size={20}
                        className={isHighAlert ? "text-orange-400" : "text-amber-400"}
                    />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">
                        Safety Precautions
                    </h3>
                    <p className="text-xs text-gray-500">
                        Stay prepared for volcanic emergencies
                    </p>
                </div>
            </div>

            {/* High Alert Warning */}
            {isHighAlert && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2">
                    <Siren size={16} className="text-rose-400 flex-shrink-0" />
                    <p className="text-sm text-rose-400">
                        Alert Level {alertLevel ?? 0} - Be ready to evacuate at any moment
                    </p>
                </div>
            )}

            {/* Safety Sections */}
            <div className="space-y-2">
                {safetySections.map((section) => {
                    const Icon = section.icon;
                    const isExpanded = expandedSection === section.id;

                    return (
                        <div
                            key={section.id}
                            className="rounded-xl overflow-hidden border border-white/10"
                        >
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full p-3 flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <Icon size={16} className={section.color} />
                                <span className="text-sm font-medium text-white flex-1 text-left">
                                    {section.title}
                                </span>
                                <ChevronDown
                                    size={16}
                                    className={clsx(
                                        "text-gray-400 transition-transform duration-200",
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
                                        className="overflow-hidden"
                                    >
                                        <ul className="p-3 pt-0 space-y-2">
                                            {section.tips.map((tip, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-start gap-2 text-xs text-gray-400"
                                                >
                                                    <span className={clsx("mt-1", section.color)}>
                                                        •
                                                    </span>
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
            <div className="mt-4 p-3 bg-white/5 rounded-xl flex items-start gap-2">
                <Radio size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-400">
                    <span className="text-blue-400 font-medium">Stay informed:</span>{" "}
                    Monitor PHIVOLCS bulletins and follow instructions from local
                    authorities.
                </p>
            </div>
        </motion.div>
    );
};

export default React.memo(SafetyTipsCard);

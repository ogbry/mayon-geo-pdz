import React, { useState, useCallback } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Phone, Radio, Navigation,
    AlertTriangle, Copy, Check,
} from "lucide-react";

interface SOSModalProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation?: { lat: number; lng: number } | null;
    nearestCenterName?: string | null;
    nearestCenterCoords?: { lat: number; lng: number } | null;
}

interface ActionCard {
    id: string;
    icon: React.ElementType;
    title: string;
    subtitle: string;
    color: string;
    iconBg: string;
    border: string;
    onClick: () => void;
    disabled?: boolean;
    disabledReason?: string;
}

const SOSModal: React.FC<SOSModalProps> = ({
    isOpen,
    onClose,
    userLocation,
    nearestCenterName,
    nearestCenterCoords,
}) => {
    const [copied, setCopied] = useState(false);

    const handleCall911 = useCallback(() => {
        window.location.href = "tel:911";
    }, []);

    const handleCallObservatory = useCallback(() => {
        window.location.href = "tel:+63528242383";
    }, []);

    const handleShareLocation = useCallback(async () => {
        if (!userLocation) return;
        const text = `My location: ${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}\nhttps://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
        if (navigator.share) {
            try {
                await navigator.share({ title: "My Location — Ligtas Mayon", text });
            } catch {
                // fall through to clipboard
            }
        }
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    }, [userLocation]);

    const handleNavigate = useCallback(() => {
        if (!nearestCenterCoords) return;
        const origin = userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : "";
        window.open(
            `https://www.google.com/maps/dir/?api=1${origin}&destination=${nearestCenterCoords.lat},${nearestCenterCoords.lng}&travelmode=driving`,
            "_blank"
        );
    }, [userLocation, nearestCenterCoords]);

    const actions: ActionCard[] = [
        {
            id: "call911",
            icon: Phone,
            title: "Call 911",
            subtitle: "National Emergency Hotline",
            color: "text-rose-400",
            iconBg: "bg-rose-500/15",
            border: "border-rose-500/25 hover:border-rose-500/50",
            onClick: handleCall911,
        },
        {
            id: "observatory",
            icon: Radio,
            title: "Call Observatory",
            subtitle: "(052) 824-2383 — Mayon MVO",
            color: "text-orange-400",
            iconBg: "bg-orange-500/15",
            border: "border-orange-500/25 hover:border-orange-500/50",
            onClick: handleCallObservatory,
        },
        {
            id: "share",
            icon: copied ? Check : Copy,
            title: copied ? "Copied!" : "Share Location",
            subtitle: userLocation
                ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                : "Location unavailable",
            color: copied ? "text-emerald-400" : "text-blue-400",
            iconBg: copied ? "bg-emerald-500/15" : "bg-blue-500/15",
            border: copied
                ? "border-emerald-500/40"
                : "border-blue-500/25 hover:border-blue-500/50",
            onClick: handleShareLocation,
            disabled: !userLocation,
            disabledReason: "Enable location to share",
        },
        {
            id: "navigate",
            icon: Navigation,
            title: "Navigate to Center",
            subtitle: nearestCenterName ?? "No center selected",
            color: "text-emerald-400",
            iconBg: "bg-emerald-500/15",
            border: "border-emerald-500/25 hover:border-emerald-500/50",
            onClick: handleNavigate,
            disabled: !nearestCenterCoords,
            disabledReason: "Select an evacuation center first",
        },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="glass-card rounded-2xl w-full max-w-md pointer-events-auto border border-rose-500/20 overflow-hidden"
                            initial={{ y: 60, opacity: 0, scale: 0.96 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 40, opacity: 0, scale: 0.97 }}
                            transition={{ type: "spring", damping: 24, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-rose-500/15">
                                        <AlertTriangle size={18} className="text-rose-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-white">Emergency Actions</h2>
                                        <p className="text-xs text-slate-400">Choose an action below</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Action Grid */}
                            <div className="p-4 grid grid-cols-2 gap-3">
                                {actions.map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <button
                                            key={action.id}
                                            onClick={action.disabled ? undefined : action.onClick}
                                            disabled={action.disabled}
                                            className={clsx(
                                                "relative flex flex-col items-start gap-3 p-4 rounded-xl border transition-all duration-200 text-left",
                                                "bg-white/[0.02] hover:bg-white/[0.05]",
                                                action.border,
                                                action.disabled && "opacity-40 cursor-not-allowed"
                                            )}
                                        >
                                            <div className={clsx("p-2.5 rounded-xl", action.iconBg)}>
                                                <Icon size={20} className={action.color} />
                                            </div>
                                            <div>
                                                <p className={clsx("text-sm font-semibold", action.color)}>
                                                    {action.title}
                                                </p>
                                                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                                                    {action.disabled && action.disabledReason
                                                        ? action.disabledReason
                                                        : action.subtitle}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Footer note */}
                            <div className="px-5 pb-4">
                                <p className="text-[11px] text-slate-600 text-center">
                                    Always follow official advisories from PHIVOLCS and local authorities.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Floating SOS trigger button
export const SOSButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <motion.button
        onClick={onClick}
        className="sos-pulse fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-full shadow-xl shadow-rose-900/50 transition-colors"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
    >
        <AlertTriangle size={16} />
        SOS
    </motion.button>
);

export default SOSModal;

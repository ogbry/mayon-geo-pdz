import React from "react";
import { MapPin } from "lucide-react";
import { useLanguage } from "../i18n";

const Hero: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                    {t.dashboardTitle}
                </h1>
                <p className="text-sm md:text-base text-slate-400 mt-1">
                    {t.dashboardSubtitle}
                </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm">
                <MapPin size={14} className="text-orange-400" />
                <span>{t.location}</span>
            </div>
        </div>
    );
};

export default Hero;

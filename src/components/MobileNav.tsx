import React from "react";
import { Map, Shield, ShieldAlert, Phone } from "lucide-react";
import { clsx } from "clsx";
import { useLanguage } from "../i18n";

interface MobileNavProps {
    activeSection?: string;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeSection = "map" }) => {
    const { t } = useLanguage();

    const navItems = [
        { id: "map", label: t.navMap, icon: Map, href: "#map" },
        { id: "evacuation", label: t.navEvacuation, icon: Shield, href: "#evacuation" },
        { id: "safety", label: t.navSafety, icon: ShieldAlert, href: "#safety" },
        { id: "contacts", label: t.navEmergency, icon: Phone, href: "#contacts" },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 safe-area-pb">
            <div className="flex items-center justify-around px-2 py-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;

                    return (
                        <a
                            key={item.id}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[64px]",
                                isActive
                                    ? "bg-orange-500/10 text-orange-400"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                            )}
                        >
                            <Icon size={20} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </a>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileNav;

import React from "react";
import { clsx } from "clsx";
import { Phone, Globe, Facebook, Radio, Siren, Building2 } from "lucide-react";
import { useLanguage } from "../i18n";

interface ContactAction {
    icon: React.ElementType;
    label: string;
    value: string;
    href: string;
    color: string;
}

interface ContactGroup {
    id: string;
    title: string;
    subtitle: string;
    headerIcon: React.ElementType;
    headerColor: string;
    headerBg: string;
    border: string;
    actions: ContactAction[];
}

const EmergencyContacts: React.FC = () => {
    const { t } = useLanguage();

    const groups: ContactGroup[] = [
        {
            id: "phivolcs",
            title: "PHIVOLCS",
            subtitle: "Philippine Institute of Volcanology",
            headerIcon: Radio,
            headerColor: "text-blue-400",
            headerBg: "bg-blue-500/10",
            border: "border-blue-500/20 hover:border-blue-500/35",
            actions: [
                {
                    icon: Phone,
                    label: t.hotline,
                    value: "(02) 8426-1468",
                    href: "tel:+6328426146879",
                    color: "text-blue-400",
                },
                {
                    icon: Globe,
                    label: t.website,
                    value: "phivolcs.dost.gov.ph",
                    href: "https://www.phivolcs.dost.gov.ph",
                    color: "text-sky-400",
                },
                {
                    icon: Facebook,
                    label: "Facebook",
                    value: "/PHIVOLCS",
                    href: "https://www.facebook.com/PHIVOLCS",
                    color: "text-indigo-400",
                },
            ],
        },
        {
            id: "mvo",
            title: "Mayon Observatory",
            subtitle: "Ligñon Hill, Legazpi City, Albay",
            headerIcon: Building2,
            headerColor: "text-orange-400",
            headerBg: "bg-orange-500/10",
            border: "border-orange-500/20 hover:border-orange-500/35",
            actions: [
                {
                    icon: Phone,
                    label: t.hotline,
                    value: "(052) 824-2383",
                    href: "tel:+63528242383",
                    color: "text-orange-400",
                },
                {
                    icon: Globe,
                    label: "Info",
                    value: "MVO Page",
                    href: "https://www.phivolcs.dost.gov.ph/mayon-volcano-observatory/",
                    color: "text-amber-400",
                },
            ],
        },
        {
            id: "hotlines",
            title: "Emergency Hotlines",
            subtitle: "National & local emergency lines",
            headerIcon: Siren,
            headerColor: "text-rose-400",
            headerBg: "bg-rose-500/10",
            border: "border-rose-500/20 hover:border-rose-500/35",
            actions: [
                {
                    icon: Phone,
                    label: t.nationalEmergency,
                    value: "911",
                    href: "tel:911",
                    color: "text-rose-400",
                },
                {
                    icon: Phone,
                    label: t.redCross,
                    value: "143",
                    href: "tel:143",
                    color: "text-red-400",
                },
                {
                    icon: Globe,
                    label: "Albay Gov",
                    value: "albay.gov.ph",
                    href: "https://www.albay.gov.ph/contact/",
                    color: "text-blue-400",
                },
            ],
        },
    ];

    return (
        <div id="contacts">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Siren size={18} className="text-rose-400" />
                {t.emergencyContacts}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {groups.map((group) => {
                    const HeaderIcon = group.headerIcon;
                    return (
                        <div
                            key={group.id}
                            className={clsx(
                                "glass-card rounded-2xl overflow-hidden border transition-all duration-200",
                                group.border
                            )}
                        >
                            {/* Card header */}
                            <div className="px-4 py-3 border-b border-white/[0.05]">
                                <div className="flex items-center gap-3">
                                    <div className={clsx("p-2 rounded-xl", group.headerBg)}>
                                        <HeaderIcon size={16} className={group.headerColor} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{group.title}</p>
                                        <p className="text-[10px] text-slate-500 leading-tight">{group.subtitle}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-3 space-y-1.5">
                                {group.actions.map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <a
                                            key={action.href}
                                            href={action.href}
                                            target={action.href.startsWith("http") ? "_blank" : undefined}
                                            rel={action.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                            className={clsx(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                                                "bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/[0.10]",
                                                "transition-all duration-150 group"
                                            )}
                                        >
                                            <Icon size={14} className={clsx(action.color, "flex-shrink-0")} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wide">{action.label}</p>
                                                <p className="text-xs text-slate-200 font-medium truncate group-hover:text-white transition-colors">
                                                    {action.value}
                                                </p>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EmergencyContacts;

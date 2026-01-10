import React from "react";
import { Mountain, Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { useLanguage, languageNames } from "../i18n";
import type { Language } from "../i18n";

interface HeaderProps {
    alertLevel?: number | null;
}

const Header: React.FC<HeaderProps> = ({ alertLevel }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();

    const getAlertBadgeColor = () => {
        if (alertLevel === null || alertLevel === undefined) return "bg-gray-500";
        if (alertLevel <= 1) return "bg-emerald-500";
        if (alertLevel === 2) return "bg-yellow-500";
        if (alertLevel === 3) return "bg-orange-500";
        return "bg-rose-500";
    };

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
        setLangMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/80 backdrop-blur-lg">
            <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
                    {/* Logo */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 shadow-lg shadow-orange-500/20 flex-shrink-0">
                            <Mountain size={18} className="text-white sm:w-[22px] sm:h-[22px]" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-sm sm:text-lg font-bold text-white truncate">Ligtas Mayon</h1>
                            <p className="text-[10px] sm:text-xs text-slate-400 hidden xs:block">Safety Monitoring</p>
                        </div>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        <a href="#map" className="text-sm text-slate-300 hover:text-white transition-colors">
                            {t.navMap}
                        </a>
                        <a href="#evacuation" className="text-sm text-slate-300 hover:text-white transition-colors">
                            {t.navEvacuation}
                        </a>
                        <a href="#safety" className="text-sm text-slate-300 hover:text-white transition-colors">
                            {t.navSafety}
                        </a>
                        <a href="#contacts" className="text-sm text-slate-300 hover:text-white transition-colors">
                            {t.navEmergency}
                        </a>

                        {/* Language Switcher - Desktop */}
                        <div className="relative">
                            <button
                                onClick={() => setLangMenuOpen(!langMenuOpen)}
                                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                                <Globe size={14} />
                                <span>{languageNames[language]}</span>
                            </button>
                            {langMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setLangMenuOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden">
                                        {(Object.keys(languageNames) as Language[]).map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => handleLanguageChange(lang)}
                                                className={clsx(
                                                    "w-full px-3 py-2 text-left text-sm transition-colors",
                                                    language === lang
                                                        ? "bg-orange-500/10 text-orange-400"
                                                        : "text-slate-300 hover:bg-slate-700"
                                                )}
                                            >
                                                {languageNames[lang]}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </nav>

                    {/* Alert Badge + Mobile Menu */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        {alertLevel !== null && alertLevel !== undefined && (
                            <div className={clsx(
                                "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold text-white",
                                getAlertBadgeColor()
                            )}>
                                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                                    <span className={clsx(
                                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                        getAlertBadgeColor()
                                    )} />
                                    <span className={clsx(
                                        "relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2",
                                        getAlertBadgeColor()
                                    )} />
                                </span>
                                <span className="hidden sm:inline">{t.alertLevel}</span>
                                <span className="sm:hidden">{t.alertLevelShort}</span>
                                {alertLevel}
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/10">
                        <nav className="flex flex-col gap-2">
                            <a
                                href="#map"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                                {t.navMap}
                            </a>
                            <a
                                href="#evacuation"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                                {t.navEvacuation}
                            </a>
                            <a
                                href="#safety"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                                {t.navSafety}
                            </a>
                            <a
                                href="#contacts"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                                {t.navEmergency}
                            </a>
                        </nav>

                        {/* Language Switcher - Mobile */}
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="px-3 text-xs text-slate-500 mb-2">{t.language}</p>
                            <div className="flex flex-wrap gap-2 px-3">
                                {(Object.keys(languageNames) as Language[]).map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => {
                                            handleLanguageChange(lang);
                                            setMobileMenuOpen(false);
                                        }}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-full text-sm transition-colors",
                                            language === lang
                                                ? "bg-orange-500 text-white"
                                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                        )}
                                    >
                                        {languageNames[lang]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;

import React from "react";
import { clsx } from "clsx";

interface BackgroundLayoutProps {
    children: React.ReactNode;
    className?: string;
}

const BackgroundLayout: React.FC<BackgroundLayoutProps> = ({
    children,
    className,
}) => {
    return (
        <div className="relative min-h-screen w-full bg-slate-950 text-white overflow-x-hidden selection:bg-orange-500/30">
            {/* Subtle gradient overlay */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />

            {/* Subtle accent glow - top */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className={clsx("relative z-10 w-full", className)}>
                {children}
            </div>
        </div>
    );
};

export default BackgroundLayout;

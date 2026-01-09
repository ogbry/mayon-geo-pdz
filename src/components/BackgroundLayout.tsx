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
        <div className="relative min-h-screen w-full bg-[#0a0f1c] text-white overflow-x-hidden selection:bg-rose-500/30">
            {/* Ambient background effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
            </div>

            {/* Grid pattern overlay (optional for tech feel) */}
            <div className="fixed inset-0 z-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

            <div className={clsx("relative z-10 w-full py-8 md:py-12", className)}>
                {children}
            </div>
        </div>
    );
};

export default BackgroundLayout;

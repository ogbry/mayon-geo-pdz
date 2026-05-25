import React from "react";
import { clsx } from "clsx";

interface BackgroundLayoutProps {
    children: React.ReactNode;
    className?: string;
}

const BackgroundLayout: React.FC<BackgroundLayoutProps> = ({ children, className }) => {
    return (
        <div className="relative min-h-screen w-full bg-[#04080f] text-white overflow-x-hidden selection:bg-orange-500/30">
            {/* Deep base gradient */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#06101a] via-[#04080f] to-[#020609]" />

            {/* Volcano orange glow — bottom center */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

            {/* Deep red magma accent — lower left */}
            <div className="fixed bottom-[-100px] left-[-100px] w-[600px] h-[400px] bg-rose-900/15 rounded-full blur-[100px] pointer-events-none z-0" />

            {/* Subtle cyan/teal atmosphere — upper right */}
            <div className="fixed top-[-80px] right-[-80px] w-[500px] h-[400px] bg-sky-900/10 rounded-full blur-[100px] pointer-events-none z-0" />

            {/* Top center header glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[200px] bg-orange-500/5 rounded-full blur-[80px] pointer-events-none z-0" />

            {/* Noise texture overlay for depth */}
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-[0.025]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat",
                    backgroundSize: "128px",
                }}
            />

            <div className={clsx("relative z-10 w-full", className)}>
                {children}
            </div>
        </div>
    );
};

export default BackgroundLayout;

import React from "react";
import { motion } from "framer-motion";

const Hero: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 mb-8 md:mb-12"
        >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase backdrop-blur-md mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                Albay, Philippines
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400 drop-shadow-sm">
                Mayon Safety Zone
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                Real-time awareness of your proximity to the Mayon Volcano Permanent Danger Zone (PDZ).
            </p>
        </motion.div>
    );
};

export default Hero;

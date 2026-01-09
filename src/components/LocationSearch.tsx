import React, { useState, useEffect, useRef } from "react";
import { clsx } from "clsx";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type InputMode = "address" | "coordinates";

interface Suggestion {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

interface LocationSearchProps {
    onSearchAddress: (query: string) => Promise<void>;
    onSearchCoordinates: (lat: number, lng: number, name?: string) => void;
    onClear: () => void;
    loading: boolean;
    error: string | null;
    hasLocation: boolean;
}

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";

const LocationSearch: React.FC<LocationSearchProps> = ({
    onSearchAddress,
    onSearchCoordinates,
    onClear,
    loading,
    error,
    hasLocation,
}) => {
    const [mode, setMode] = useState<InputMode>("address");
    const [addressQuery, setAddressQuery] = useState("");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");

    // Autocomplete state
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Debounced fetch suggestions
    useEffect(() => {
        if (addressQuery.trim().length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            setLoadingSuggestions(true);
            try {
                const params = new URLSearchParams({
                    q: addressQuery,
                    format: "json",
                    limit: "5",
                    countrycodes: "ph",
                });

                const response = await fetch(`${NOMINATIM_BASE_URL}?${params}`, {
                    headers: {
                        "User-Agent": "MayonGeo/1.0 (https://mayon-geo.app)",
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data);
                    setShowSuggestions(data.length > 0);
                    setSelectedIndex(-1);
                }
            } catch (err) {
                console.error("Failed to fetch suggestions:", err);
            } finally {
                setLoadingSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [addressQuery]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(e.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(e.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectSuggestion = (suggestion: Suggestion) => {
        setAddressQuery(suggestion.display_name);
        setShowSuggestions(false);
        setSuggestions([]);
        // Directly search with the selected coordinates and name
        onSearchCoordinates(parseFloat(suggestion.lat), parseFloat(suggestion.lon), suggestion.display_name);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case "Enter":
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    e.preventDefault();
                    handleSelectSuggestion(suggestions[selectedIndex]);
                }
                break;
            case "Escape":
                setShowSuggestions(false);
                break;
        }
    };

    const handleAddressSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (addressQuery.trim()) {
            setShowSuggestions(false);
            onSearchAddress(addressQuery.trim());
        }
    };

    const handleCoordinateSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        if (!isNaN(latNum) && !isNaN(lngNum)) {
            onSearchCoordinates(latNum, lngNum);
        }
    };

    const handleClear = () => {
        setAddressQuery("");
        setLat("");
        setLng("");
        setSuggestions([]);
        setShowSuggestions(false);
        onClear();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10 bg-white/5 shadow-lg"
        >
            <div className="flex items-center gap-2 mb-4">
                <MapPin size={20} className="text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Check a Location</h3>
            </div>

            {/* Mode Tabs */}
            <div className="flex gap-2 mb-4">
                <button
                    type="button"
                    onClick={() => setMode("address")}
                    className={clsx(
                        "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                        mode === "address"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                    )}
                >
                    Address Search
                </button>
                <button
                    type="button"
                    onClick={() => setMode("coordinates")}
                    className={clsx(
                        "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                        mode === "coordinates"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                    )}
                >
                    Coordinates
                </button>
            </div>

            {/* Address Search Form */}
            {mode === "address" && (
                <form onSubmit={handleAddressSearch} className="space-y-3">
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={addressQuery}
                            onChange={(e) => setAddressQuery(e.target.value)}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter address or place name..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                            autoComplete="off"
                        />

                        {/* Loading indicator */}
                        {loadingSuggestions && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 size={18} className="animate-spin text-gray-400" />
                            </div>
                        )}

                        {/* Suggestions Dropdown */}
                        <AnimatePresence>
                            {showSuggestions && suggestions.length > 0 && (
                                <motion.div
                                    ref={suggestionsRef}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute z-50 w-full mt-2 bg-[#1a1f2e] border border-white/10 rounded-xl shadow-xl overflow-hidden"
                                >
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={suggestion.place_id}
                                            type="button"
                                            onClick={() => handleSelectSuggestion(suggestion)}
                                            className={clsx(
                                                "w-full px-4 py-3 text-left text-sm transition-all flex items-start gap-3",
                                                index === selectedIndex
                                                    ? "bg-blue-500/20 text-white"
                                                    : "text-gray-300 hover:bg-white/5"
                                            )}
                                        >
                                            <MapPin size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{suggestion.display_name}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={loading || !addressQuery.trim()}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-white/5 disabled:text-gray-600 text-blue-400 border border-blue-500/30 disabled:border-white/10 rounded-xl px-4 py-3 font-medium transition-all"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Search size={18} />
                            )}
                            {loading ? "Searching..." : "Search"}
                        </button>
                        {hasLocation && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 rounded-xl px-4 py-3 font-medium transition-all"
                            >
                                <X size={18} />
                                Clear
                            </button>
                        )}
                    </div>
                </form>
            )}

            {/* Coordinates Form */}
            {mode === "coordinates" && (
                <form onSubmit={handleCoordinateSearch} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Latitude</label>
                            <input
                                type="number"
                                step="any"
                                value={lat}
                                onChange={(e) => setLat(e.target.value)}
                                placeholder="e.g., 13.2548"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Longitude</label>
                            <input
                                type="number"
                                step="any"
                                value={lng}
                                onChange={(e) => setLng(e.target.value)}
                                placeholder="e.g., 123.6861"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={!lat || !lng}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-white/5 disabled:text-gray-600 text-blue-400 border border-blue-500/30 disabled:border-white/10 rounded-xl px-4 py-3 font-medium transition-all"
                        >
                            <MapPin size={18} />
                            Check Location
                        </button>
                        {hasLocation && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 rounded-xl px-4 py-3 font-medium transition-all"
                            >
                                <X size={18} />
                                Clear
                            </button>
                        )}
                    </div>
                </form>
            )}

            {/* Error Display */}
            {error && (
                <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
                    {error}
                </div>
            )}
        </motion.div>
    );
};

export default LocationSearch;

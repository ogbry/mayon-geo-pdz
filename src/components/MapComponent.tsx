import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MAYON_COORDINATES, PDZ_RADIUS_KM } from "../utils/constants";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for Leaflet default icon not showing in Vite/Webpack
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom blue icon for searched location
const SearchedIcon = L.divIcon({
    className: "custom-marker",
    html: `<div style="
        background-color: #3b82f6;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

// Custom green icon for user location
const UserIcon = L.divIcon({
    className: "custom-marker",
    html: `<div style="
        background-color: #10b981;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

interface MapComponentProps {
    userLocation?: { lat: number; lng: number };
    searchedLocation?: { lat: number; lng: number; name: string };
}

// Component to fly to a location when updated
const FlyToLocation: React.FC<{ coords?: { lat: number; lng: number }; priority?: boolean }> = ({ coords, priority }) => {
    const map = useMap();
    const hasFlown = useRef(false);

    useEffect(() => {
        if (coords && (priority || !hasFlown.current)) {
            map.flyTo([coords.lat, coords.lng], 12);
            hasFlown.current = true;
        }
    }, [coords, map, priority]);

    return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ userLocation, searchedLocation }) => {
    const pdzRadiusMeters = PDZ_RADIUS_KM * 1000;

    return (
        <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-white/20 shadow-2xl relative z-0">
            <MapContainer
                center={[MAYON_COORDINATES.lat, MAYON_COORDINATES.lng]}
                zoom={11}
                scrollWheelZoom={false}
                className="h-full w-full bg-[#0a0f1c]"
                preferCanvas={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Mayon Volcano Center and PDZ */}
                <Circle
                    center={[MAYON_COORDINATES.lat, MAYON_COORDINATES.lng]}
                    radius={pdzRadiusMeters}
                    pathOptions={{
                        color: "#f43f5e", // Rose 500
                        fillColor: "#f43f5e",
                        fillOpacity: 0.2,
                        weight: 2,
                        dashArray: "5, 10",
                    }}
                >
                    <Popup>
                        <div className="text-center">
                            <h3 className="font-bold text-rose-600">6km PDZ Boundary</h3>
                            <p className="text-xs text-gray-600">Permanent Danger Zone</p>
                        </div>
                    </Popup>
                </Circle>

                <Marker position={[MAYON_COORDINATES.lat, MAYON_COORDINATES.lng]}>
                    <Popup>
                        <div className="text-center font-bold">Mayon Volcano Crater</div>
                    </Popup>
                </Marker>

                {/* User Location - Green marker */}
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={UserIcon}>
                        <Popup>
                            <div className="text-center">
                                <span className="font-bold text-emerald-600">Your Location</span>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Searched Location - Blue marker */}
                {searchedLocation && (
                    <Marker position={[searchedLocation.lat, searchedLocation.lng]} icon={SearchedIcon}>
                        <Popup>
                            <div className="text-center max-w-[200px]">
                                <span className="font-bold text-blue-600">Searched Location</span>
                                <p className="text-xs text-gray-600 mt-1 truncate">{searchedLocation.name}</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Fly to searched location when it changes (priority), otherwise fly to user */}
                {searchedLocation ? (
                    <FlyToLocation coords={searchedLocation} priority />
                ) : (
                    <FlyToLocation coords={userLocation} />
                )}
            </MapContainer>
        </div>
    );
};

export default MapComponent;

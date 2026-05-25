import type { VercelRequest, VercelResponse } from "@vercel/node";

const OVERPASS_SERVERS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://z.overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
];

const BBOX = { south: 12.9, west: 123.2, north: 13.6, east: 124.1 };

const QUERY = `[out:json][timeout:25];(node["amenity"~"shelter|school|hospital|townhall"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});way["amenity"~"shelter|school|hospital|townhall"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});node["office"="government"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});node["emergency"="shelter"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east}););out center;`;

// Known Albay evacuation centers — static fallback when all APIs fail
const STATIC_FALLBACK = [
    { id: "static-1",  name: "Legazpi City Sports Complex",           type: "shelter",    lat: 13.1391, lng: 123.7438 },
    { id: "static-2",  name: "Daraga Municipal Gymnasium",            type: "government", lat: 13.1564, lng: 123.6994 },
    { id: "static-3",  name: "Camalig Municipal Gymnasium",           type: "government", lat: 13.1748, lng: 123.6583 },
    { id: "static-4",  name: "Guinobatan Municipal Gymnasium",        type: "government", lat: 13.1820, lng: 123.5951 },
    { id: "static-5",  name: "Ligao City Sports Complex",             type: "shelter",    lat: 13.2290, lng: 123.5240 },
    { id: "static-6",  name: "Santo Domingo Municipal Hall",          type: "government", lat: 13.2534, lng: 123.7260 },
    { id: "static-7",  name: "Tabaco City Gymnasium",                 type: "shelter",    lat: 13.3580, lng: 123.7337 },
    { id: "static-8",  name: "Malilipot Municipal Hall",              type: "government", lat: 13.2910, lng: 123.7220 },
    { id: "static-9",  name: "Sto. Domingo Central School",           type: "school",     lat: 13.2521, lng: 123.7264 },
    { id: "static-10", name: "Legazpi City Hall",                     type: "government", lat: 13.1390, lng: 123.7340 },
    { id: "static-11", name: "Albay Capitol",                         type: "government", lat: 13.1492, lng: 123.7360 },
    { id: "static-12", name: "Bicol Medical Center",                  type: "hospital",   lat: 13.1528, lng: 123.7356 },
    { id: "static-13", name: "Camalig Central School",                type: "school",     lat: 13.1762, lng: 123.6589 },
    { id: "static-14", name: "Guinobatan Central School",             type: "school",     lat: 13.1831, lng: 123.5967 },
    { id: "static-15", name: "Daraga Central School",                 type: "school",     lat: 13.1579, lng: 123.6998 },
];

// In-memory cache
let cache: { elements: object[]; timestamp: number; isStatic?: boolean } | null = null;
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

async function tryFetchOverpass(): Promise<object[] | null> {
    for (const server of OVERPASS_SERVERS) {
        // Try POST
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 12000);

            const res = await fetch(server, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "LigtasMayonApp/3.0 (https://mayon-geo.vercel.app; safety monitoring)",
                    "Accept": "application/json",
                },
                body: `data=${encodeURIComponent(QUERY)}`,
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json() as { elements: object[] };
            if (json.elements?.length) return json.elements;
        } catch {
            // Try GET fallback for same server
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 12000);

                const url = `${server}?data=${encodeURIComponent(QUERY)}`;
                const res = await fetch(url, {
                    headers: {
                        "User-Agent": "LigtasMayonApp/3.0 (https://mayon-geo.vercel.app; safety monitoring)",
                        "Accept": "application/json",
                    },
                    signal: controller.signal,
                });

                clearTimeout(timeout);

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json() as { elements: object[] };
                if (json.elements?.length) return json.elements;
            } catch {
                // Next server
            }
        }
    }
    return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const now = Date.now();

    // Serve warm cache
    if (cache && now - cache.timestamp < CACHE_TTL) {
        return res.status(200).json({
            elements: cache.elements,
            cached: true,
            isStatic: cache.isStatic ?? false,
        });
    }

    // Try live Overpass fetch
    const elements = await tryFetchOverpass();

    if (elements) {
        cache = { elements, timestamp: now, isStatic: false };
        res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate");
        return res.status(200).json({ elements, cached: false, isStatic: false });
    }

    // All live sources failed — serve stale cache if available
    if (cache) {
        return res.status(200).json({
            elements: cache.elements,
            cached: true,
            isStatic: cache.isStatic ?? false,
        });
    }

    // Last resort — static fallback dataset
    cache = { elements: STATIC_FALLBACK, timestamp: now, isStatic: true };
    return res.status(200).json({ elements: STATIC_FALLBACK, cached: false, isStatic: true });
}

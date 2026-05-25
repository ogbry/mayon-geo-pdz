import type { VercelRequest, VercelResponse } from "@vercel/node";

const OVERPASS_SERVERS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://z.overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

const BBOX = { south: 12.9, west: 123.2, north: 13.6, east: 124.1 };

const QUERY = `
[out:json][timeout:30];
(
  node["amenity"="shelter"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
  way["amenity"="shelter"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
  node["amenity"="school"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
  way["amenity"="school"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
  node["amenity"="hospital"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
  way["amenity"="hospital"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
  node["amenity"="townhall"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
  way["amenity"="townhall"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
  node["office"="government"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
  way["office"="government"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
  node["emergency"="shelter"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
  way["emergency"="shelter"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
);
out center;
`.trim();

// In-memory cache (persists across warm function invocations)
let cache: { data: object[]; timestamp: number } | null = null;
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

async function fetchFromOverpass(): Promise<object[]> {
    for (const server of OVERPASS_SERVERS) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 20000);

            const res = await fetch(server, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `data=${encodeURIComponent(QUERY)}`,
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const text = await res.text();
            if (text.includes("runtime error") || text.includes("timeout")) {
                throw new Error("Server busy");
            }

            const json = JSON.parse(text);
            return json.elements ?? [];
        } catch {
            // Try next server
        }
    }
    throw new Error("All Overpass servers failed");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const now = Date.now();

        // Serve from cache if still fresh
        if (cache && now - cache.timestamp < CACHE_TTL) {
            return res.status(200).json({
                elements: cache.data,
                cached: true,
                cachedAt: new Date(cache.timestamp).toISOString(),
            });
        }

        const elements = await fetchFromOverpass();
        cache = { data: elements, timestamp: now };

        // Tell CDN to cache for 6 hours too
        res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate");

        return res.status(200).json({
            elements,
            cached: false,
            cachedAt: new Date(now).toISOString(),
        });
    } catch {
        // Return stale cache rather than failing
        if (cache) {
            return res.status(200).json({
                elements: cache.data,
                cached: true,
                stale: true,
                cachedAt: new Date(cache.timestamp).toISOString(),
            });
        }

        return res.status(503).json({ error: "Unable to fetch evacuation centers" });
    }
}

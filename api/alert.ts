import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as cheerio from "cheerio";

// URLs to scrape for alert level
const SOURCES = [
    {
        url: "https://www.phivolcs.dost.gov.ph/category/volcano/volcano-bulletin/mayon-volcano-bulletin/",
        name: "PHIVOLCS Bulletins",
    },
    {
        url: "https://www.phivolcs.dost.gov.ph/index.php/mayon-volcano-bulletin-menu",
        name: "PHIVOLCS Menu",
    },
];

// Fallback if all sources fail
const FALLBACK = {
    level: 3,
    date: "January 2026",
    source: "fallback",
};

interface AlertResponse {
    volcano: string;
    alertLevel: number;
    description: string;
    updatedAt: string;
    source: string;
    cached: boolean;
}

// In-memory cache (persists across warm invocations)
let cache: { data: AlertResponse; timestamp: number } | null = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Alert level descriptions
const ALERT_DESCRIPTIONS: Record<number, string> = {
    0: "No Alert - Background level",
    1: "Low Level Unrest",
    2: "Moderate Unrest",
    3: "High Unrest - Magmatic activity",
    4: "Hazardous Eruption Imminent",
    5: "Hazardous Eruption Ongoing",
};

// Parse alert level from HTML
function parseAlertLevel(html: string): { level: number | null; date: string | null } {
    const $ = cheerio.load(html);
    const text = $("body").text();

    // Look for alert level patterns
    const patterns = [
        /alert\s*level\s*:?\s*(\d)/i,
        /level\s*(\d)\s*(?:is|has been|remains|was)/i,
        /raised.*?level\s*(\d)/i,
        /lowered.*?level\s*(\d)/i,
        /maintains.*?level\s*(\d)/i,
        /mayon.*?level\s*(\d)/i,
    ];

    let level: number | null = null;
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const parsed = parseInt(match[1], 10);
            if (parsed >= 0 && parsed <= 5) {
                level = parsed;
                break;
            }
        }
    }

    // Try to find date
    const datePatterns = [
        /(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/i,
        /(?:as of|dated?|updated?)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    ];

    let date: string | null = null;
    for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
            date = match[1];
            break;
        }
    }

    return { level, date };
}

async function fetchAlertLevel(): Promise<AlertResponse> {
    // Try each source
    for (const source of SOURCES) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(source.url, {
                headers: {
                    "User-Agent": "MayonGeo/1.0 (Safety App)",
                    Accept: "text/html",
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) continue;

            const html = await response.text();
            const { level, date } = parseAlertLevel(html);

            if (level !== null) {
                return {
                    volcano: "Mayon",
                    alertLevel: level,
                    description: ALERT_DESCRIPTIONS[level] || "Unknown",
                    updatedAt: date || new Date().toISOString().split("T")[0],
                    source: source.name,
                    cached: false,
                };
            }
        } catch {
            // Continue to next source
        }
    }

    // All sources failed - use fallback
    return {
        volcano: "Mayon",
        alertLevel: FALLBACK.level,
        description: ALERT_DESCRIPTIONS[FALLBACK.level],
        updatedAt: FALLBACK.date,
        source: FALLBACK.source,
        cached: false,
    };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate"); // 15 min CDN cache

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Check in-memory cache
        const now = Date.now();
        if (cache && now - cache.timestamp < CACHE_DURATION) {
            return res.status(200).json({ ...cache.data, cached: true });
        }

        // Fetch fresh data
        const data = await fetchAlertLevel();

        // Update cache
        cache = { data, timestamp: now };

        return res.status(200).json(data);
    } catch (error) {
        // Return fallback on error
        return res.status(200).json({
            volcano: "Mayon",
            alertLevel: FALLBACK.level,
            description: ALERT_DESCRIPTIONS[FALLBACK.level],
            updatedAt: FALLBACK.date,
            source: "error-fallback",
            cached: false,
        });
    }
}

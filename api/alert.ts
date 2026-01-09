import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as cheerio from "cheerio";

const SOURCES = [
    {
        url: "https://hazardhunter.georisk.gov.ph/monitoring/volcano",
        name: "HazardHunterPH Volcano Monitoring",
    },
];


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

let cache: { data: AlertResponse; timestamp: number } | null = null;
const CACHE_DURATION = 15 * 60 * 1000;

const ALERT_DESCRIPTIONS: Record<number, string> = {
    0: "No Alert - Background level",
    1: "Low Level Unrest",
    2: "Moderate Unrest",
    3: "High Unrest - Magmatic activity",
    4: "Hazardous Eruption Imminent",
    5: "Hazardous Eruption Ongoing",
};

// ---- UTIL: Safe timeout wrapper ----
async function fetchWithTimeout(url: string, options: any = {}, ms = 5000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ms);

    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeout);
        return res;
    } catch (err) {
        clearTimeout(timeout);
        throw err;
    }
}

// ---- HTML Parsing ----
function parseAlertLevel(html: string): { level: number | null; date: string | null } {
    const $ = cheerio.load(html);

    let level: number | null = null;
    let date: string | null = null;

    // Find the Mayon section
    $("h2").each((_, el) => {
        const volcanoName = $(el).text().trim();

        if (/Mayon/i.test(volcanoName)) {
            const container = $(el).parent(); // same section

            // Find nearest h4 containing "Alert Level"
            const levelText = container.find("h4:contains('Alert Level')").text();

            const match = levelText.match(/Alert Level\s*(\d)/i);
            if (match) {
                const parsed = parseInt(match[1], 10);
                if (parsed >= 0 && parsed <= 5) level = parsed;
            }

            // Find date text
            const dateText = container.text();
            const dateMatch = dateText.match(/Since\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i);
            if (dateMatch) date = dateMatch[1];
        }
    });
    console.log(level, date)
    return { level, date };
}

// ---- Fetch Logic ----
async function fetchAlertLevel(): Promise<AlertResponse> {
    for (const source of SOURCES) {
        try {
            // Try direct request (5s timeout)
            const res = await fetchWithTimeout(
                source.url,
                {
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        Accept: "text/html",
                    },
                },
                5000
            );

            if (!res.ok) throw new Error("Source returned non-200");

            const html = await res.text();
            const { level, date } = parseAlertLevel(html);

            if (level !== null) {
                return {
                    volcano: "Mayon",
                    alertLevel: level,
                    description: ALERT_DESCRIPTIONS[level],
                    updatedAt: date || new Date().toISOString().split("T")[0],
                    source: source.name,
                    cached: false,
                };
            }
        } catch {
            // Proxy fallback (also timeout)
            try {
                const proxy = await fetchWithTimeout(
                    `https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}`,
                    {},
                    5000
                );

                const json = await proxy.json();
                if (json?.contents) {
                    const { level, date } = parseAlertLevel(json.contents);
                    if (level !== null) {
                        return {
                            volcano: "Mayon",
                            alertLevel: level,
                            description: ALERT_DESCRIPTIONS[level],
                            updatedAt: date || new Date().toISOString().split("T")[0],
                            source: `${source.name} (proxy)`,
                            cached: false,
                        };
                    }
                }
            } catch {
                // ignore → fallback later
            }
        }
    }

    return {
        volcano: "Mayon",
        alertLevel: FALLBACK.level,
        description: ALERT_DESCRIPTIONS[FALLBACK.level],
        updatedAt: FALLBACK.date,
        source: FALLBACK.source,
        cached: false,
    };
}

// ---- Handler ----
export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate");

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const now = Date.now();

        if (cache && now - cache.timestamp < CACHE_DURATION) {
            return res.status(200).json({ ...cache.data, cached: true });
        }

        const data = await fetchAlertLevel();
        cache = { data, timestamp: now };

        return res.status(200).json(data);
    } catch {
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

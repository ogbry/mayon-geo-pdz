import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as cheerio from "cheerio";
import { Agent, fetch as undiciFetch } from "undici";

// PHIVOLCS has an incomplete SSL cert chain; Node rejects it.
// This agent skips cert validation — only used for known PHIVOLCS public URLs.
const insecureAgent = new Agent({
    connect: { rejectUnauthorized: false },
});

const SOURCES = [
    {
        url: "https://hazardhunter.georisk.gov.ph/monitoring/volcano",
        name: "HazardHunterPH Volcano Monitoring",
    },
];

const PHIVOLCS_BULLETIN_LIST = "https://wovodat.phivolcs.dost.gov.ph/bulletin/list-of-bulletin";
const PHIVOLCS_BULLETIN_BASE = "https://wovodat.phivolcs.dost.gov.ph";

const FALLBACK = {
    level: 3,
    date: "January 2026",
    source: "fallback",
};

interface BulletinDetails {
    eruption?: string;
    seismicity?: string;
    craterGlow?: string;
    sulfurDioxide?: string;
    plume?: string;
    plumeDirection?: string;
    groundDeformation?: string;
    bulletinDate?: string;
    bulletinUrl?: string;
}

interface AlertResponse {
    volcano: string;
    alertLevel: number;
    description: string;
    updatedAt: string;
    source: string;
    cached: boolean;
    bulletin?: BulletinDetails;
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
async function fetchWithTimeout(url: string, options: RequestInit = {}, ms = 5000) {
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

// ---- HTML Parsing: Alert Level ----
function parseAlertLevel(html: string): { level: number | null; date: string | null } {
    const $ = cheerio.load(html);

    let level: number | null = null;
    let date: string | null = null;

    $("h2").each((_, el) => {
        const volcanoName = $(el).text().trim();

        if (/Mayon/i.test(volcanoName)) {
            const container = $(el).parent();
            const levelText = container.find("h4:contains('Alert Level')").text();

            const match = levelText.match(/Alert Level\s*(\d)/i);
            if (match) {
                const parsed = parseInt(match[1], 10);
                if (parsed >= 0 && parsed <= 5) level = parsed;
            }

            const dateText = container.text();
            const dateMatch = dateText.match(/Since\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i);
            if (dateMatch) date = dateMatch[1];
        }
    });

    return { level, date };
}

// ---- HTML Parsing: PHIVOLCS Bulletin ----
function extractPlumeDirection(plumeText: string): string | undefined {
    // Common patterns: "Southwest drift", "drifted southwest", "to the southwest"
    const match = plumeText.match(
        /\b(north|south|east|west|northeast|northwest|southeast|southwest|N|S|E|W|NE|NW|SE|SW)(?:east|west)?\b/i,
    );
    return match ? match[0].toLowerCase() : undefined;
}

function parseBulletin(html: string, bulletinUrl: string): BulletinDetails {
    const $ = cheerio.load(html);
    const details: BulletinDetails = { bulletinUrl };

    // Each parameter label is in a <b> tag inside a <td>, and the value is in the next <td>
    const fieldMap: Record<string, keyof BulletinDetails> = {
        "Eruption": "eruption",
        "Seismicity": "seismicity",
        "Crater glow": "craterGlow",
        "Sulfur Dioxide Flux": "sulfurDioxide",
        "Plume": "plume",
        "Ground Deformation": "groundDeformation",
    };

    $("b").each((_, el) => {
        const label = $(el).text().trim();
        const key = fieldMap[label];
        if (!key) return;

        const td = $(el).closest("td");
        const value = td.next("td").text().trim().replace(/\s+/g, " ");
        if (value) details[key] = value;
    });

    if (details.plume) {
        details.plumeDirection = extractPlumeDirection(details.plume);
    }

    // Try to find bulletin date in header
    const dateMatch = $("body").text().match(/Summary of 24Hr Observation[^\d]*(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i);
    if (dateMatch) details.bulletinDate = dateMatch[1];

    return details;
}

let lastBulletinError: string | null = null;

async function fetchPhivolcsHtml(url: string, ms = 8000): Promise<string | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ms);
    try {
        const res = await undiciFetch(url, {
            dispatcher: insecureAgent,
            signal: controller.signal,
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; LigtasMayon/1.0)",
                Accept: "text/html",
            },
        });
        clearTimeout(timeout);
        if (!res.ok) return null;
        return await res.text();
    } catch {
        clearTimeout(timeout);
        return null;
    }
}

async function fetchLatestBulletin(): Promise<BulletinDetails | null> {
    lastBulletinError = null;
    try {
        const listHtml = await fetchPhivolcsHtml(PHIVOLCS_BULLETIN_LIST);
        if (!listHtml) {
            lastBulletinError = "failed to fetch bulletin list";
            return null;
        }

        // Find the first Mayon English bulletin URL
        const urlMatch = listHtml.match(/activity-mvo\?bid=(\d+)&lang=en/);
        if (!urlMatch) {
            lastBulletinError = "no bulletin URL in list";
            return null;
        }

        const bulletinUrl = `${PHIVOLCS_BULLETIN_BASE}/bulletin/${urlMatch[0]}`;
        const bulletinHtml = await fetchPhivolcsHtml(bulletinUrl);
        if (!bulletinHtml) {
            lastBulletinError = "failed to fetch bulletin detail";
            return null;
        }

        const parsed = parseBulletin(bulletinHtml, bulletinUrl);
        if (!parsed.plume && !parsed.eruption && !parsed.seismicity) {
            lastBulletinError = "parsed empty";
        }
        return parsed;
    } catch (err) {
        lastBulletinError = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
        return null;
    }
}

// ---- Fetch Logic ----
async function fetchAlertLevel(): Promise<AlertResponse> {
    // Run alert + bulletin in parallel
    const bulletinPromise = fetchLatestBulletin();

    for (const source of SOURCES) {
        try {
            const res = await fetchWithTimeout(
                source.url,
                {
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        Accept: "text/html",
                    },
                },
                5000,
            );

            if (!res.ok) throw new Error("Source returned non-200");

            const html = await res.text();
            const { level, date } = parseAlertLevel(html);

            if (level !== null) {
                const bulletin = await bulletinPromise;
                return {
                    volcano: "Mayon",
                    alertLevel: level,
                    description: ALERT_DESCRIPTIONS[level],
                    updatedAt: date || new Date().toISOString().split("T")[0],
                    source: source.name,
                    cached: false,
                    ...(bulletin && { bulletin }),
                };
            }
        } catch {
            try {
                const proxy = await fetchWithTimeout(
                    `https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}`,
                    {},
                    5000,
                );

                const json = (await proxy.json()) as { contents?: string };
                if (json?.contents) {
                    const { level, date } = parseAlertLevel(json.contents);
                    if (level !== null) {
                        const bulletin = await bulletinPromise;
                        return {
                            volcano: "Mayon",
                            alertLevel: level,
                            description: ALERT_DESCRIPTIONS[level],
                            updatedAt: date || new Date().toISOString().split("T")[0],
                            source: `${source.name} (proxy)`,
                            cached: false,
                            ...(bulletin && { bulletin }),
                        };
                    }
                }
            } catch {
                // ignore → fallback later
            }
        }
    }

    const bulletin = await bulletinPromise;
    return {
        volcano: "Mayon",
        alertLevel: FALLBACK.level,
        description: ALERT_DESCRIPTIONS[FALLBACK.level],
        updatedAt: FALLBACK.date,
        source: FALLBACK.source,
        cached: false,
        ...(bulletin && { bulletin }),
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
        const debug = req.query.debug === "1";
        const noCache = req.query.nocache === "1" || debug;

        if (!noCache && cache && now - cache.timestamp < CACHE_DURATION) {
            return res.status(200).json({ ...cache.data, cached: true });
        }

        const data = await fetchAlertLevel();
        cache = { data, timestamp: now };

        if (debug) {
            return res.status(200).json({ ...data, _debug: { bulletinError: lastBulletinError } });
        }
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

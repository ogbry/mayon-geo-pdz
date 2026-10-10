export const MAYON_COORDINATES = {
    lat: 13.2548,
    lng: 123.6861,
};

export const PDZ_RADIUS_KM = 6;

// Live PHIVOLCS bulletin list. The old www.phivolcs.dost.gov.ph bulletin-menu
// page was retired and now 404s; this is the same source /api/alert scrapes.
export const PHIVOLCS_BULLETIN_URL =
    "https://wovodat.phivolcs.dost.gov.ph/bulletin/list-of-bulletin";

export const PLAY_STORE_URL =
    "https://play.google.com/store/apps/details?id=com.ligtasmayon.app";

// CARTO began watermarking keyless basemap tiles on 25 September 2026 — they
// still return HTTP 200, just an "API KEY REQUIRED" image. The key is free from
// carto.com/basemaps/apikey. Tile keys are necessarily public in the bundle;
// restrict it by domain in the CARTO dashboard rather than treating it a secret.
// Without a key we fall back to plain OSM: lighter than the UI wants, but a
// readable map beats a watermarked one on a safety app.
const CARTO_KEY = import.meta.env.VITE_CARTO_KEY;

export const MAP_TILE_URL = CARTO_KEY
    ? `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`
    : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export const MAP_TILE_ATTRIBUTION = CARTO_KEY
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Albay province bounding box for Overpass API queries
export const ALBAY_BOUNDING_BOX = {
    south: 12.9,
    west: 123.2,
    north: 13.6,
    east: 124.1,
};

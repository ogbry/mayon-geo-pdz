export const API_URL = 'https://mayon-geo.vercel.app/api/alert';
export const OSRM_API_URL = 'https://router.project-osrm.org/route/v1/driving';
export const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

export const ALERT_CACHE_KEY = 'mayon-alert-cache';
export const CENTERS_CACHE_KEY = 'mayon-centers-cache';
export const TILE_CACHE_META_KEY = 'mayon-tile-cache-meta';
export const OFFLINE_MODE_KEY = 'mayon-offline-mode';

export const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ZOOM_MIN = 10;
export const TILE_ZOOM_MAX = 15;
export const TILE_DOWNLOAD_CONCURRENCY = 2;

export const MAYON_COORDINATES = { lat: 13.2548, lng: 123.6861 };
export const PDZ_RADIUS_KM = 6;
export const ALBAY_BOUNDING_BOX = { south: 12.9, west: 123.2, north: 13.6, east: 124.1 };

export const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

export const ALERT_DESCRIPTIONS: Record<number, string> = {
  0: 'No Alert - Background level',
  1: 'Low Level Unrest',
  2: 'Moderate Unrest',
  3: 'High Unrest - Magmatic activity',
  4: 'Hazardous Eruption Imminent',
  5: 'Hazardous Eruption Ongoing',
};

export const SAFETY_TIPS = {
  before: [
    'Know your evacuation routes and nearest evacuation centers',
    'Prepare an emergency kit with essentials for at least 3 days',
    'Keep important documents in a waterproof container',
    'Stay updated with PHIVOLCS bulletins and local advisories',
    'Know the alert levels and what each one means',
  ],
  during: [
    'Follow official evacuation orders immediately',
    'Use designated evacuation routes only',
    'Bring your emergency kit and important documents',
    'Help elderly, children, and persons with disabilities',
    'Do not attempt to cross bridges covered by lahar',
    'Stay calm and avoid panic',
  ],
  hazards: [
    'Pyroclastic flows: Extremely hot and fast-moving - evacuate immediately',
    'Ashfall: Wear N95 masks, protect eyes, stay indoors when heavy',
    'Lahar: Avoid river channels and low-lying areas during rain',
    'Lava flows: Move perpendicular to flow direction to escape',
    'Volcanic gases: Leave area if you smell sulfur or have difficulty breathing',
  ],
  kit: [
    'Water (1 gallon per person per day for 3 days)',
    'Non-perishable food and manual can opener',
    'First aid kit and prescription medications',
    'Flashlight, batteries, and portable radio',
    'N95 masks, goggles, and protective clothing',
    'Cash, IDs, and important documents',
    'Phone charger and emergency contact list',
  ],
};

export type EmergencyContact = {
  label: string;
  value: string;
  url: string;
  type: 'phone' | 'link';
};

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { label: 'PHIVOLCS Trunkline', value: '(02) 8426-1468 to 79', url: 'tel:+6328426146879', type: 'phone' },
  { label: 'PHIVOLCS Website', value: 'phivolcs.dost.gov.ph', url: 'https://www.phivolcs.dost.gov.ph', type: 'link' },
  { label: 'PHIVOLCS Facebook', value: '/PHIVOLCS', url: 'https://www.facebook.com/PHIVOLCS', type: 'link' },
  { label: 'Mayon Volcano Observatory', value: '(052) 824-2383', url: 'tel:+63528242383', type: 'phone' },
  { label: 'MVO Page', value: 'phivolcs.dost.gov.ph', url: 'https://www.phivolcs.dost.gov.ph/mayon-volcano-observatory/', type: 'link' },
  { label: 'National Emergency', value: '911', url: 'tel:911', type: 'phone' },
  { label: 'Red Cross', value: '143', url: 'tel:143', type: 'phone' },
  { label: 'Albay Gov', value: 'albay.gov.ph/contact', url: 'https://www.albay.gov.ph/contact/', type: 'link' },
];

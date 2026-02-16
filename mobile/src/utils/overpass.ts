import type { EvacuationCenter, EvacuationCenterType, OverpassElement } from '../types';

export const buildOverpassQuery = (bbox: { south: number; west: number; north: number; east: number }): string => {
  const { south, west, north, east } = bbox;
  return `
[out:json][timeout:30];
(
  node["amenity"="shelter"](${south},${west},${north},${east});
  way["amenity"="shelter"](${south},${west},${north},${east});
  node["amenity"="school"](${south},${west},${north},${east});
  way["amenity"="school"](${south},${west},${north},${east});
  node["amenity"="hospital"](${south},${west},${north},${east});
  way["amenity"="hospital"](${south},${west},${north},${east});
  node["amenity"="townhall"](${south},${west},${north},${east});
  way["amenity"="townhall"](${south},${west},${north},${east});
  node["office"="government"](${south},${west},${north},${east});
  way["office"="government"](${south},${west},${north},${east});
  node["emergency"="shelter"](${south},${west},${north},${east});
  way["emergency"="shelter"](${south},${west},${north},${east});
);
out center;
`;
};

export const getTypeFromTags = (tags: Record<string, string>): EvacuationCenterType => {
  if (tags.amenity === 'hospital') return 'hospital';
  if (tags.amenity === 'school') return 'school';
  if (tags.amenity === 'shelter' || tags.emergency === 'shelter') return 'shelter';
  if (tags.amenity === 'townhall' || tags.office === 'government') return 'government';
  return 'shelter';
};

export const parseOverpassResponse = (data: { elements: OverpassElement[] }): EvacuationCenter[] => {
  return data.elements
    .filter((el) => el.tags?.name)
    .map((el) => {
      const lat = el.lat ?? el.center?.lat ?? 0;
      const lng = el.lon ?? el.center?.lon ?? 0;
      return {
        id: `${el.type}-${el.id}`,
        name: el.tags?.name ?? 'Unknown',
        type: getTypeFromTags(el.tags ?? {}),
        lat,
        lng,
        address: el.tags?.['addr:full'] ?? el.tags?.['addr:street'],
      };
    })
    .filter((center) => center.lat !== 0 && center.lng !== 0);
};

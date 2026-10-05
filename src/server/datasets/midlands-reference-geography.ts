import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { createHash } from "node:crypto";
import proj4 from "proj4";

import { midlandsGeographyScope } from "@/server/datasets/geography-scopes";

export const MIDLANDS_LSOA_BOUNDARY_URL =
  "https://open-geography-portalx-ons.hub.arcgis.com/api/download/v1/items/68515293204e43ca8ab56fa13ae8a547/geojson?layers=0";
export const MIDLANDS_LSOA_LOOKUP_URL =
  "https://open-geography-portalx-ons.hub.arcgis.com/api/download/v1/items/0352e811ec2c4fc5917f39aea2d1b8a3/csv?layers=0";

const OSGB36_BNG = "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.1502,0.2470,0.8421,-20.4894 +units=m +no_defs";

type LsoaBoundaryProperties = {
  LSOA21CD?: string;
  LSOA21NM?: string;
};

export type MidlandsLsoaLookupRow = {
  LSOA21CD: string;
  LSOA21NM: string;
  LAD22CD: string;
  LAD22NM: string;
  RGN22CD: string;
  RGN22NM: string;
};

export type MidlandsLsoaReferenceFeatureProperties = {
  areaId: string;
  areaName: string;
  localAuthorityCode: string;
  localAuthorityName: string;
  regionCode: string;
  regionName: string;
  centroid: { lon: number; lat: number };
};

export type MidlandsLsoaReferenceGeography = {
  geographyId: "midlands-lsoa-2021";
  geographyLabel: "LSOA 2021";
  scopeId: "midlands";
  sourceUrls: { boundary: string; lookup: string };
  boundaryVintage: "December 2021";
  expectedAreaCount: number;
  areaIdChecksum: string;
  geojson: FeatureCollection<Polygon | MultiPolygon, MidlandsLsoaReferenceFeatureProperties>;
  expectedAreaIds: string[];
};

function reprojectPosition([eastings, northings]: number[]) {
  return proj4(OSGB36_BNG, "WGS84", [eastings, northings]) as [number, number];
}

function reprojectGeometry(geometry: Polygon | MultiPolygon): Polygon | MultiPolygon {
  if (geometry.type === "Polygon") {
    return { ...geometry, coordinates: geometry.coordinates.map((ring) => ring.map(reprojectPosition)) };
  }
  return { ...geometry, coordinates: geometry.coordinates.map((polygon) => polygon.map((ring) => ring.map(reprojectPosition))) };
}

function centroid(geometry: Polygon | MultiPolygon) {
  const coordinates = geometry.type === "Polygon" ? geometry.coordinates.flat(1) : geometry.coordinates.flat(2);
  const total = coordinates.reduce((result, coordinate) => ({ lon: result.lon + coordinate[0], lat: result.lat + coordinate[1] }), { lon: 0, lat: 0 });
  return { lon: total.lon / coordinates.length, lat: total.lat / coordinates.length };
}

function required(value: unknown, field: string) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing required reference-geography field '${field}'.`);
  }
  return value;
}

/** Builds the approved scope and rejects lookup/boundary mismatch before layer joins occur. */
export function buildMidlandsLsoaReferenceGeography(
  boundaries: FeatureCollection<Polygon | MultiPolygon, LsoaBoundaryProperties>,
  lookupRows: MidlandsLsoaLookupRow[],
): MidlandsLsoaReferenceGeography {
  const scopeRows = lookupRows.filter((row) => midlandsGeographyScope.regionCodes.includes(row.RGN22CD as never));
  const byAreaId = new Map<string, MidlandsLsoaLookupRow>();

  for (const row of scopeRows) {
    const areaId = required(row.LSOA21CD, "LSOA21CD");
    if (byAreaId.has(areaId)) {
      throw new Error(`Duplicate LSOA lookup code '${areaId}'.`);
    }
    byAreaId.set(areaId, row);
  }

  const features: Array<Feature<Polygon | MultiPolygon, MidlandsLsoaReferenceFeatureProperties>> = [];
  const seenAreaIds = new Set<string>();
  for (const feature of boundaries.features) {
    const areaId = required(feature.properties?.LSOA21CD, "LSOA21CD");
    const row = byAreaId.get(areaId);
    if (!row) continue;
    if (seenAreaIds.has(areaId)) throw new Error(`Duplicate LSOA boundary code '${areaId}'.`);
    seenAreaIds.add(areaId);
    const geometry = reprojectGeometry(feature.geometry);
    features.push({
      type: "Feature",
      geometry,
      properties: {
        areaId,
        areaName: required(row.LSOA21NM, "LSOA21NM"),
        localAuthorityCode: required(row.LAD22CD, "LAD22CD"),
        localAuthorityName: required(row.LAD22NM, "LAD22NM"),
        regionCode: required(row.RGN22CD, "RGN22CD"),
        regionName: required(row.RGN22NM, "RGN22NM"),
        centroid: centroid(geometry),
      },
    });
  }

  const expectedAreaIds = [...byAreaId.keys()].sort();
  const missingBoundaryIds = expectedAreaIds.filter((areaId) => !seenAreaIds.has(areaId));
  if (missingBoundaryIds.length > 0) {
    throw new Error(`Midlands LSOA boundary coverage missing ${missingBoundaryIds.length} areas (${missingBoundaryIds.slice(0, 8).join(", ")}).`);
  }

  return {
    geographyId: "midlands-lsoa-2021",
    geographyLabel: "LSOA 2021",
    scopeId: midlandsGeographyScope.id,
    sourceUrls: { boundary: MIDLANDS_LSOA_BOUNDARY_URL, lookup: MIDLANDS_LSOA_LOOKUP_URL },
    boundaryVintage: "December 2021",
    expectedAreaCount: expectedAreaIds.length,
    areaIdChecksum: createHash("sha256").update(expectedAreaIds.join("\n")).digest("hex"),
    geojson: { type: "FeatureCollection", features },
    expectedAreaIds,
  };
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (character === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  values.push(current);
  return values;
}

function parseLookupCsv(text: string): MidlandsLsoaLookupRow[] {
  const [headerLine, ...lines] = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (!headerLine) throw new Error("Midlands LSOA lookup is empty.");
  const headers = parseCsvLine(headerLine);
  const requiredHeaders = ["LSOA21CD", "LSOA21NM", "LAD22CD", "LAD22NM", "RGN22CD", "RGN22NM"];
  for (const header of requiredHeaders) {
    if (!headers.includes(header)) throw new Error(`Midlands LSOA lookup is missing '${header}'.`);
  }
  return lines.map((line) => Object.fromEntries(headers.map((header, index) => [header, parseCsvLine(line)[index] ?? ""])) as MidlandsLsoaLookupRow);
}

async function fetchJson<T>(url: string, userAgent: string) {
  const response = await fetch(url, { headers: { Accept: "application/geo+json, application/json", "User-Agent": userAgent } });
  if (!response.ok) throw new Error(`Request failed (${response.status}) for ${url}`);
  return response.json() as Promise<T>;
}

async function fetchText(url: string, userAgent: string) {
  const response = await fetch(url, { headers: { Accept: "text/csv, text/plain", "User-Agent": userAgent } });
  if (!response.ok) throw new Error(`Request failed (${response.status}) for ${url}`);
  return response.text();
}

export async function fetchMidlandsLsoaReferenceGeography(userAgent: string) {
  const [boundaries, lookupCsv] = await Promise.all([
    fetchJson<FeatureCollection<Polygon | MultiPolygon, LsoaBoundaryProperties>>(MIDLANDS_LSOA_BOUNDARY_URL, userAgent),
    fetchText(MIDLANDS_LSOA_LOOKUP_URL, userAgent),
  ]);
  return buildMidlandsLsoaReferenceGeography(boundaries, parseLookupCsv(lookupCsv));
}

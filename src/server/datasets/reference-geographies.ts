import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";

import type {
  ReferenceGeography,
  ReferenceGeographyFeatureProperties,
  ReferenceGeographyLookup,
} from "@/server/datasets/types";

type SubIcbBoundaryProperties = {
  SICBL26CD?: string;
  SICBL26NM?: string;
  LONG?: number;
  LAT?: number;
};

const SUB_ICB_GEOJSON_URL =
  "https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Sub_Integrated_Care_Board_Locations_April_2026_Boundaries_EN_BSC/FeatureServer/0/query?where=1%3D1&outFields=SICBL26CD%2CSICBL26NM%2CLONG%2CLAT&returnGeometry=true&outSR=4326&f=geojson";

function assertString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Expected string field '${fieldName}'.`);
  }

  return value;
}

function assertNumber(value: unknown, fieldName: string) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Expected numeric field '${fieldName}'.`);
  }

  return value;
}

export function normalizeNhsGeographyLookupValue(value: string) {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

async function fetchReferenceGeometryResponse(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/geo+json, application/json",
      "User-Agent": "urbanmetrics-uk-reference-geography/0.1",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  const text = await response.text();
  const payload = JSON.parse(text) as unknown;

  if (
    typeof payload === "object" &&
    payload !== null &&
    "type" in payload &&
    (payload as { type?: unknown }).type === "FeatureCollection"
  ) {
    return payload as FeatureCollection<Polygon | MultiPolygon, SubIcbBoundaryProperties>;
  }

  throw new Error(`Unexpected reference geography response for ${url}: ${text.slice(0, 240)}`);
}

export function buildReferenceGeographyLookup(
  geographyId: string,
  lookupField: string,
  features: Array<Feature<Polygon | MultiPolygon, ReferenceGeographyFeatureProperties>>,
): ReferenceGeographyLookup {
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    geographyId,
    lookupField,
    items: features.map((feature) => ({
      lookupValue: feature.properties.areaName,
      normalizedLookupValue: normalizeNhsGeographyLookupValue(feature.properties.areaName),
      areaId: feature.properties.areaId,
      areaName: feature.properties.areaName,
    })),
  };
}

export async function fetchSubIcbReferenceGeography(): Promise<ReferenceGeography> {
  const source = await fetchReferenceGeometryResponse(SUB_ICB_GEOJSON_URL);

  const features: Array<Feature<Polygon | MultiPolygon, ReferenceGeographyFeatureProperties>> = source.features.map(
    (feature) => ({
      type: "Feature",
      geometry: feature.geometry,
      properties: {
        areaId: assertString(feature.properties?.SICBL26CD, "SICBL26CD"),
        areaName: assertString(feature.properties?.SICBL26NM, "SICBL26NM"),
        centroid: {
          lon: assertNumber(feature.properties?.LONG, "LONG"),
          lat: assertNumber(feature.properties?.LAT, "LAT"),
        },
      },
    }),
  );

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    geography: {
      id: "sub-icb",
      title: "Sub Integrated Care Board Locations",
      sourceUrl: SUB_ICB_GEOJSON_URL,
      codeField: "SICBL26CD",
      nameField: "SICBL26NM",
    },
    geojson: {
      type: "FeatureCollection",
      features,
    },
  };
}

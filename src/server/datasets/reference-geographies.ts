import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";

import type {
  ReferenceGeography,
  ReferenceGeographyFeatureProperties,
  ReferenceGeographyLookup,
} from "@/server/datasets/types";

type SubIcbBoundaryProperties = {
  SICBL23CD?: string;
  SICBL23NM?: string;
  LONG?: number;
  LAT?: number;
};

const SUB_ICB_GEOJSON_URL =
  "https://open-geography-portalx-ons.hub.arcgis.com/api/download/v1/items/fe17bb9ca66446b6b8faf992b5d24274/geojson?layers=0";
const referenceGeometryPollDelayMs = 2000;
const referenceGeometryMaxAttempts = 10;

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

async function waitForReferenceGeometryResponse(url: string) {
  for (let attempt = 1; attempt <= referenceGeometryMaxAttempts; attempt += 1) {
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

    const status = typeof payload === "object" && payload !== null ? (payload as { status?: unknown }).status : undefined;
    if (status === "Pending" && attempt < referenceGeometryMaxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, referenceGeometryPollDelayMs));
      continue;
    }

    throw new Error(`Unexpected reference geography response for ${url}: ${text.slice(0, 240)}`);
  }

  throw new Error(`Reference geography did not become ready after ${referenceGeometryMaxAttempts} attempts for ${url}`);
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
  const source = await waitForReferenceGeometryResponse(SUB_ICB_GEOJSON_URL);

  const features: Array<Feature<Polygon | MultiPolygon, ReferenceGeographyFeatureProperties>> = source.features.map(
    (feature) => ({
      type: "Feature",
      geometry: feature.geometry,
      properties: {
        areaId: assertString(feature.properties?.SICBL23CD, "SICBL23CD"),
        areaName: assertString(feature.properties?.SICBL23NM, "SICBL23NM"),
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
      codeField: "SICBL23CD",
      nameField: "SICBL23NM",
    },
    geojson: {
      type: "FeatureCollection",
      features,
    },
  };
}

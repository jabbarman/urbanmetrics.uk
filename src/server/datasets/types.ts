import type { FeatureCollection, Geometry } from "geojson";

export type FreshnessPolicy =
  | { kind: "maxAgeDays"; days: number }
  | { kind: "referenceOnly" };

export type LayerInterpretation = {
  summary: string;
  higherValuesMean: string;
  rankingTitle: string;
};

export type LayerDefinition = {
  id: string;
  title: string;
  shortLabel: string;
  description: string;
  interpretation: LayerInterpretation;
  compareGroup: string;
  geographyLabel: string;
  geographyVintage: string;
  unit: string;
  precision: number;
  cadenceLabel: string;
  freshnessPolicy: FreshnessPolicy;
  palette: string[];
  source: {
    provider: string;
    publisher: string;
    apiBaseUrl: string;
    datasetId: string;
    datasetUrl: string;
    datasetApiUrl: string;
    licence: string;
    caveat: string;
  };
  fields: {
    areaId: string;
    areaName: string;
    value: string;
    date: string;
    geometry: string;
    centroid: string;
    localAuthorityName: string;
    localAuthorityCode: string;
  };
};

export type GeneratedFeatureProperties = {
  areaId: string;
  areaName: string;
  localAuthorityName: string;
  localAuthorityCode: string;
  value: number;
  formattedValue: string;
  valueLabel: string;
  sourceDate: string;
  centroid: { lon: number; lat: number };
};

export type GeneratedLayer = {
  schemaVersion: 1;
  generatedAt: string;
  layer: {
    id: string;
    title: string;
    shortLabel: string;
    description: string;
    interpretation: LayerInterpretation;
    compareGroup: string;
    geographyLabel: string;
    geographyVintage: string;
    unit: string;
    precision: number;
    cadenceLabel: string;
    freshnessPolicy: FreshnessPolicy;
    palette: string[];
    legendBreaks: number[];
    source: LayerDefinition["source"] & {
      datasetTitle: string;
      dataProcessedAt: string;
      updateFrequency: string;
      recordsFetched: number;
      latestSourceDate: string;
      fetchedAt: string;
    };
    summary: {
      min: number;
      max: number;
      mean: number;
      median: number;
      topAreas: Array<{ areaId: string; areaName: string; value: number }>;
      bottomAreas: Array<{ areaId: string; areaName: string; value: number }>;
    };
  };
  geojson: FeatureCollection<Geometry, GeneratedFeatureProperties>;
};

export type CatalogEntry = GeneratedLayer["layer"];

export type GeneratedStatus = {
  generatedAt: string;
  layers: Array<{
    id: string;
    title: string;
    status: "ok" | "stale" | "warning";
    dataProcessedAt: string;
    latestSourceDate: string;
    updateFrequency: string;
    recordsFetched: number;
    message: string;
  }>;
};

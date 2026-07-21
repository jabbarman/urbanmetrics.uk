import type { FeatureCollection, Geometry, Polygon, MultiPolygon } from "geojson";

export type FreshnessPolicy =
  | { kind: "maxAgeDays"; days: number }
  | { kind: "referenceOnly" };

export type LayerInterpretation = {
  summary: string;
  higherValuesMean: string;
  rankingTitle: string;
};

export type BcoApiSourceDefinition = {
  kind: "bco_api";
  provider: string;
  publisher: string;
  apiBaseUrl: string;
  datasetId: string;
  datasetUrl: string;
  datasetApiUrl: string;
  licence: string;
  caveat: string;
};

export type CsvDownloadSourceDefinition = {
  kind: "csv_download";
  provider: string;
  publisher: string;
  publicationUrl: string;
  fileUrl: string;
  latestPublicationSeriesUrl?: string;
  fileFormat: "csv" | "zip_csv";
  datasetTitle: string;
  updateFrequency: string;
  geographyId: "sub-icb";
  geographyField: string;
  geographyValue: string;
  areaNameField: string;
  sourceDateField: string;
  valueField: string;
  suppressedValues?: string[];
  measureIdField: string;
  measureId: string;
  licence: string;
  caveat: string;
};

export type LayerSourceDefinition = BcoApiSourceDefinition | CsvDownloadSourceDefinition;

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
  source: LayerSourceDefinition;
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
    source: LayerSourceDefinition & {
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

export type TalkingTherapiesTherapyTypeContext = {
  schemaVersion: 1;
  generatedAt: string;
  id: "talking-therapies-therapy-types";
  title: string;
  reportingPeriod: string;
  geographyLabel: string;
  source: {
    publisher: string;
    publicationUrl: string;
    fileUrl: string;
    datasetTitle: string;
    updateFrequency: string;
    latestSourceDate: string;
    dataProcessedAt: string;
    fetchedAt: string;
    caveat: string;
  };
  therapies: Array<{
    therapyType: string;
    coursesOfTherapy: number;
    finishingCourseTreatment: number;
    recoveryRate: number;
    improvementRate: number;
  }>;
};

export type ReferenceGeographyFeatureProperties = {
  areaId: string;
  areaName: string;
  centroid: { lon: number; lat: number };
};

export type ReferenceGeography = {
  schemaVersion: 1;
  generatedAt: string;
  geography: {
    id: string;
    title: string;
    sourceUrl: string;
    codeField: string;
    nameField: string;
  };
  geojson: FeatureCollection<Polygon | MultiPolygon, ReferenceGeographyFeatureProperties>;
};

export type ReferenceGeographyLookup = {
  schemaVersion: 1;
  generatedAt: string;
  geographyId: string;
  lookupField: string;
  items: Array<{
    lookupValue: string;
    normalizedLookupValue: string;
    areaId: string;
    areaName: string;
  }>;
};

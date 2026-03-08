import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Feature, FeatureCollection, Geometry } from "geojson";

import { layerDefinitions } from "../src/server/datasets/catalog";
import { evaluateFreshness, formatValue, mean, median, quantileBreaks } from "../src/server/datasets/utils";
import type { GeneratedFeatureProperties, GeneratedLayer, GeneratedStatus, LayerDefinition } from "../src/server/datasets/types";

const dataGeneratedDir = path.join(process.cwd(), "data", "generated");
const publicGeneratedDir = path.join(process.cwd(), "public", "generated");
const sourceCacheDir = path.join(process.cwd(), "data", "source-cache");

const pageSize = 100;

type RawRecord = Record<string, unknown>;

type DatasetMetadata = {
  dataset_id: string;
  metas: {
    default: {
      title: string;
      data_processed: string;
      update_frequency: string;
    };
  };
};

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

function parseDateWeight(value: string) {
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-").map(Number);
    return year * 100 + month;
  }

  if (/^\d{4}$/.test(value)) {
    return Number(value) * 100;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function centroidFrom(record: RawRecord, definition: LayerDefinition) {
  const centroid = record[definition.fields.centroid] as { lon?: number; lat?: number } | undefined;

  if (!centroid || typeof centroid.lon !== "number" || typeof centroid.lat !== "number") {
    throw new Error(`Missing centroid for dataset '${definition.id}'.`);
  }

  return { lon: centroid.lon, lat: centroid.lat };
}

function geometryFrom(record: RawRecord, definition: LayerDefinition) {
  const geometryWrapper = record[definition.fields.geometry] as { geometry?: Geometry } | undefined;

  if (!geometryWrapper?.geometry) {
    throw new Error(`Missing geometry for dataset '${definition.id}'.`);
  }

  return geometryWrapper.geometry;
}

function selectLatestRecords(records: RawRecord[], definition: LayerDefinition) {
  const latestByArea = new Map<string, RawRecord>();

  for (const record of records) {
    const areaId = record[definition.fields.areaId];
    const rawValue = record[definition.fields.value];
    const rawDate = record[definition.fields.date];
    const geometryWrapper = record[definition.fields.geometry] as { geometry?: Geometry } | null | undefined;
    const centroid = record[definition.fields.centroid] as { lon?: number; lat?: number } | null | undefined;
    const localAuthorityName = record[definition.fields.localAuthorityName];
    const localAuthorityCode = record[definition.fields.localAuthorityCode];

    if (
      typeof areaId !== "string" ||
      typeof rawDate !== "string" ||
      typeof rawValue !== "number" ||
      typeof localAuthorityName !== "string" ||
      typeof localAuthorityCode !== "string" ||
      !geometryWrapper?.geometry ||
      typeof centroid?.lon !== "number" ||
      typeof centroid?.lat !== "number"
    ) {
      continue;
    }

    const current = latestByArea.get(areaId);
    if (!current) {
      latestByArea.set(areaId, record);
      continue;
    }

    const currentDate = assertString(current[definition.fields.date], definition.fields.date);
    if (parseDateWeight(rawDate) >= parseDateWeight(currentDate)) {
      latestByArea.set(areaId, record);
    }
  }

  return [...latestByArea.values()];
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "west-midland-signals-data-sync/0.1",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return (await response.json()) as T;
}

async function fetchDatasetMetadata(definition: LayerDefinition) {
  return fetchJson<DatasetMetadata>(definition.source.datasetApiUrl);
}

async function fetchAllRecords(definition: LayerDefinition) {
  const records: RawRecord[] = [];
  let offset = 0;
  let totalCount = Infinity;

  while (offset < totalCount) {
    const url = new URL(`${definition.source.datasetApiUrl}/records`);
    url.searchParams.set("limit", String(pageSize));
    url.searchParams.set("offset", String(offset));

    const page = await fetchJson<{ total_count: number; results: RawRecord[] }>(url.toString());
    totalCount = page.total_count;
    records.push(...page.results);
    offset += pageSize;
  }

  return records;
}

function buildLayer(
  definition: LayerDefinition,
  metadata: DatasetMetadata,
  allRecords: RawRecord[],
): GeneratedLayer {
  const records = selectLatestRecords(allRecords, definition);
  const values: number[] = [];
  const features: Array<Feature<Geometry, GeneratedFeatureProperties>> = [];

  for (const record of records) {
    const value = assertNumber(record[definition.fields.value], definition.fields.value);
    const areaId = assertString(record[definition.fields.areaId], definition.fields.areaId);
    const areaName = assertString(record[definition.fields.areaName], definition.fields.areaName);
    const localAuthorityName = assertString(
      record[definition.fields.localAuthorityName],
      definition.fields.localAuthorityName,
    );
    const localAuthorityCode = assertString(
      record[definition.fields.localAuthorityCode],
      definition.fields.localAuthorityCode,
    );
    const sourceDate = assertString(record[definition.fields.date], definition.fields.date);
    const centroid = centroidFrom(record, definition);
    const geometry = geometryFrom(record, definition);

    values.push(value);

    features.push({
      type: "Feature",
      geometry,
      properties: {
        areaId,
        areaName,
        localAuthorityName,
        localAuthorityCode,
        value,
        formattedValue: formatValue(value, definition.unit, definition.precision),
        valueLabel: definition.shortLabel,
        sourceDate,
        centroid,
      },
    });
  }

  if (values.length === 0) {
    throw new Error(`No valid records were normalized for layer '${definition.id}'.`);
  }

  const sortedByValue = [...features].sort((left, right) => left.properties.value - right.properties.value);
  const topAreas = [...sortedByValue]
    .slice(-5)
    .reverse()
    .map((feature) => ({
      areaId: feature.properties.areaId,
      areaName: feature.properties.areaName,
      value: feature.properties.value,
    }));
  const bottomAreas = sortedByValue.slice(0, 5).map((feature) => ({
    areaId: feature.properties.areaId,
    areaName: feature.properties.areaName,
    value: feature.properties.value,
  }));

  const latestSourceDate = records
    .map((record) => assertString(record[definition.fields.date], definition.fields.date))
    .sort((left, right) => parseDateWeight(right) - parseDateWeight(left))[0];

  const geojson: FeatureCollection<Geometry, GeneratedFeatureProperties> = {
    type: "FeatureCollection",
    features,
  };

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    layer: {
      id: definition.id,
      title: definition.title,
      shortLabel: definition.shortLabel,
      description: definition.description,
      compareGroup: definition.compareGroup,
      geographyLabel: definition.geographyLabel,
      geographyVintage: definition.geographyVintage,
      unit: definition.unit,
      precision: definition.precision,
      cadenceLabel: definition.cadenceLabel,
      freshnessPolicy: definition.freshnessPolicy,
      palette: definition.palette,
      legendBreaks: quantileBreaks(values, definition.palette.length),
      source: {
        ...definition.source,
        datasetTitle: metadata.metas.default.title,
        dataProcessedAt: metadata.metas.default.data_processed,
        updateFrequency: metadata.metas.default.update_frequency,
        recordsFetched: records.length,
        latestSourceDate,
        fetchedAt: new Date().toISOString(),
      },
      summary: {
        min: Math.min(...values),
        max: Math.max(...values),
        mean: mean(values),
        median: median(values),
        topAreas,
        bottomAreas,
      },
    },
    geojson,
  };
}

async function ensureDirectories() {
  await Promise.all([
    mkdir(path.join(dataGeneratedDir, "layers"), { recursive: true }),
    mkdir(path.join(publicGeneratedDir, "layers"), { recursive: true }),
    mkdir(sourceCacheDir, { recursive: true }),
  ]);
}

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main() {
  await ensureDirectories();

  const generatedLayers: GeneratedLayer[] = [];

  for (const definition of layerDefinitions) {
    const metadata = await fetchDatasetMetadata(definition);
    const records = await fetchAllRecords(definition);

    await writeJson(path.join(sourceCacheDir, `${definition.source.datasetId}.json`), {
      fetchedAt: new Date().toISOString(),
      metadata,
      records,
    });

    const generated = buildLayer(definition, metadata, records);
    generatedLayers.push(generated);

    const layerOutput = path.join(dataGeneratedDir, "layers", `${definition.id}.json`);
    const publicLayerOutput = path.join(publicGeneratedDir, "layers", `${definition.id}.json`);
    await Promise.all([writeJson(layerOutput, generated), writeJson(publicLayerOutput, generated)]);
  }

  const catalog = generatedLayers.map((layer) => layer.layer);
  const status: GeneratedStatus = {
    generatedAt: new Date().toISOString(),
    layers: generatedLayers.map((layer) => {
      const freshness = evaluateFreshness(layer.layer.freshnessPolicy, layer.layer.source.dataProcessedAt);
      return {
        id: layer.layer.id,
        title: layer.layer.title,
        status: freshness.status,
        dataProcessedAt: layer.layer.source.dataProcessedAt,
        latestSourceDate: layer.layer.source.latestSourceDate,
        updateFrequency: layer.layer.source.updateFrequency,
        recordsFetched: layer.layer.source.recordsFetched,
        message: freshness.message,
      };
    }),
  };

  await Promise.all([
    writeJson(path.join(dataGeneratedDir, "catalog.json"), catalog),
    writeJson(path.join(publicGeneratedDir, "catalog.json"), catalog),
    writeJson(path.join(dataGeneratedDir, "status.json"), status),
    writeJson(path.join(publicGeneratedDir, "status.json"), status),
  ]);

  console.log(`Generated ${generatedLayers.length} layers.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

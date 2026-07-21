import type { LayerDefinition } from "@/server/datasets/types";
import type { RawRecord } from "@/server/datasets/normalization";
import { buildReferenceGeographyLookup, fetchSubIcbReferenceGeography, normalizeNhsGeographyLookupValue } from "@/server/datasets/reference-geographies";

const pageSize = 100;
const csvTextCache = new Map<string, Promise<string>>();
const resolvedCsvSourceCache = new Map<string, Promise<ResolvedCsvSource>>();
let referenceGeographyCache: ReturnType<typeof fetchSubIcbReferenceGeography> | null = null;

export type BcoDatasetMetadata = {
  dataset_id: string;
  metas: {
    default: {
      title: string;
      data_processed: string;
      update_frequency: string;
    };
  };
};

export type SourcePayload = {
  cacheKey: string;
  metadata: BcoDatasetMetadata;
  records: RawRecord[];
  resolvedSource?: {
    publicationUrl: string;
    fileUrl: string;
  };
};

type ResolvedCsvSource = {
  publicationUrl: string;
  fileUrl: string;
};

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      const nextChar = line[index + 1];
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

export function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  const [headerLine, ...rowLines] = lines;
  const headers = parseCsvLine(headerLine).map((header) => header.trim());

  return rowLines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])) as Record<string, string>;
  });
}

function geometryWrapperFromFeature(record: Awaited<ReturnType<typeof fetchSubIcbReferenceGeography>>["geojson"]["features"][number]) {
  return { geometry: record.geometry };
}

async function fetchText(url: string, userAgent: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "text/csv, application/octet-stream, text/plain",
      "User-Agent": userAgent,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return response.text();
}

function fetchCsvText(url: string, userAgent: string) {
  const cached = csvTextCache.get(url);
  if (cached) {
    return cached;
  }

  const request = fetchText(url, userAgent);
  csvTextCache.set(url, request);
  return request;
}

async function fetchHtml(url: string, userAgent: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html, application/xhtml+xml",
      "User-Agent": userAgent,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return response.text();
}

export function discoverLatestTalkingTherapiesUrls(seriesUrl: string, seriesHtml: string, publicationHtml: string) {
  const latestPublicationMatch = seriesHtml.match(
    /data-uipath="ps\.series\.publications-list\.latest"[\s\S]*?<a\s+href="([^"]+)"/i,
  );
  if (!latestPublicationMatch) {
    throw new Error(`Could not discover the latest published Talking Therapies release from ${seriesUrl}`);
  }

  const publicationUrl = new URL(latestPublicationMatch[1], seriesUrl).toString();
  const activityFileMatch = publicationHtml.match(
    /href="([^"]*nhstalkingtherapies_month_[^"]+_activity_performance\.csv)"/i,
  );
  if (!activityFileMatch) {
    throw new Error(`Could not discover the monthly activity and performance CSV from ${publicationUrl}`);
  }

  return {
    publicationUrl,
    fileUrl: new URL(activityFileMatch[1], publicationUrl).toString(),
  };
}

async function resolveCsvSource(definition: LayerDefinition, userAgent: string): Promise<ResolvedCsvSource> {
  if (definition.source.kind !== "csv_download") {
    throw new Error(`Expected csv_download source for layer '${definition.id}'.`);
  }

  const source = definition.source;
  if (!source.latestPublicationSeriesUrl) {
    return { publicationUrl: source.publicationUrl, fileUrl: source.fileUrl };
  }
  const seriesUrl = source.latestPublicationSeriesUrl;

  const cached = resolvedCsvSourceCache.get(seriesUrl);
  if (cached) {
    return cached;
  }

  const request = (async () => {
    const seriesHtml = await fetchHtml(seriesUrl, userAgent);
    const latestPublicationMatch = seriesHtml.match(
      /data-uipath="ps\.series\.publications-list\.latest"[\s\S]*?<a\s+href="([^"]+)"/i,
    );
    if (!latestPublicationMatch) {
      throw new Error(
        `Could not discover the latest published Talking Therapies release from ${seriesUrl}`,
      );
    }

    const publicationUrl = new URL(latestPublicationMatch[1], seriesUrl).toString();
    const publicationHtml = await fetchHtml(publicationUrl, userAgent);
    return discoverLatestTalkingTherapiesUrls(seriesUrl, seriesHtml, publicationHtml);
  })();
  resolvedCsvSourceCache.set(seriesUrl, request);
  return request;
}

export async function buildCsvDownloadRecords(definition: LayerDefinition, userAgent: string): Promise<SourcePayload> {
  if (definition.source.kind !== "csv_download") {
    throw new Error(`Expected csv_download source for layer '${definition.id}'.`);
  }

  const source = definition.source;
  const resolvedSource = await resolveCsvSource(definition, userAgent);
  const csvText = await fetchCsvText(resolvedSource.fileUrl, userAgent);
  const rows = parseCsv(csvText);
  referenceGeographyCache ??= fetchSubIcbReferenceGeography();
  const referenceGeography = await referenceGeographyCache;
  const lookup = buildReferenceGeographyLookup(
    referenceGeography.geography.id,
    "areaName",
    referenceGeography.geojson.features,
  );
  const lookupByNormalizedName = new Map(
    lookup.items.map((item) => [item.normalizedLookupValue, item]),
  );
  const featureByAreaId = new Map(
    referenceGeography.geojson.features.map((feature) => [feature.properties.areaId, feature]),
  );

  const records: RawRecord[] = [];
  const suppressedValues = new Set(source.suppressedValues ?? []);
  const unmatchedAreas = new Set<string>();

  for (const row of rows) {
    if (row[source.geographyField] !== source.geographyValue) {
      continue;
    }

    if (row[source.measureIdField] !== source.measureId) {
      continue;
    }

    const rawValue = row[source.valueField];
    if (suppressedValues.has(rawValue) || rawValue === "") {
      continue;
    }

    const areaName = row[source.areaNameField].trim();
    if (!areaName.startsWith("NHS ")) {
      continue;
    }

    const lookupEntry = lookupByNormalizedName.get(normalizeNhsGeographyLookupValue(areaName));
    if (!lookupEntry) {
      unmatchedAreas.add(areaName);
      continue;
    }

    const feature = featureByAreaId.get(lookupEntry.areaId);
    if (!feature) {
      throw new Error(`Missing reference geometry for '${lookupEntry.areaId}'.`);
    }

    const value = Number(rawValue);
    if (Number.isNaN(value)) {
      throw new Error(`Expected numeric value for '${source.valueField}' in layer '${definition.id}'.`);
    }

    records.push({
      areaId: lookupEntry.areaId,
      areaName: lookupEntry.areaName,
      value,
      sourceDate: row[source.sourceDateField],
      geometry: geometryWrapperFromFeature(feature),
      centroid: feature.properties.centroid,
      localAuthorityName: "Sub Integrated Care Board",
      localAuthorityCode: lookupEntry.areaId,
    });
  }

  if (unmatchedAreas.size > 0) {
    const preview = [...unmatchedAreas].slice(0, 5).join(", ");
    throw new Error(`Unmatched CSV geography names for layer '${definition.id}': ${preview}`);
  }

  const fetchedAt = new Date().toISOString();

  return {
    cacheKey: definition.id,
    metadata: {
      dataset_id: definition.id,
      metas: {
        default: {
          title: source.datasetTitle,
          data_processed: fetchedAt,
          update_frequency: source.updateFrequency,
        },
      },
    },
    records,
    resolvedSource,
  };
}

async function fetchJson<T>(url: string, userAgent: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": userAgent,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return (await response.json()) as T;
}

async function fetchBcoSourcePayload(definition: LayerDefinition, userAgent: string): Promise<SourcePayload> {
  if (definition.source.kind !== "bco_api") {
    throw new Error(`Expected bco_api source for layer '${definition.id}'.`);
  }

  const metadata = await fetchJson<BcoDatasetMetadata>(definition.source.datasetApiUrl, userAgent);
  const records: RawRecord[] = [];
  let offset = 0;
  let totalCount = Infinity;

  while (offset < totalCount) {
    const url = new URL(`${definition.source.datasetApiUrl}/records`);
    url.searchParams.set("limit", String(pageSize));
    url.searchParams.set("offset", String(offset));

    const page = await fetchJson<{ total_count: number; results: RawRecord[] }>(url.toString(), userAgent);
    totalCount = page.total_count;
    records.push(...page.results);
    offset += pageSize;
  }

  return {
    cacheKey: definition.source.datasetId,
    metadata,
    records,
  };
}

export async function fetchSourcePayload(definition: LayerDefinition, userAgent: string): Promise<SourcePayload> {
  switch (definition.source.kind) {
    case "bco_api":
      return fetchBcoSourcePayload(definition, userAgent);
    case "csv_download":
      return buildCsvDownloadRecords(definition, userAgent);
    default: {
      const exhaustiveCheck: never = definition.source;
      throw new Error(`Unsupported source adapter: ${String(exhaustiveCheck)}`);
    }
  }
}

import { layerDefinitions } from "../src/server/datasets/catalog";
import { evaluateFreshness, sourceDateSortWeight } from "../src/server/datasets/utils";

const pageSize = 100;

type RawRecord = Record<string, unknown>;

async function fetchJson<T>(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "urbanmetrics-uk-monitor/0.1",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return (await response.json()) as T;
}

async function fetchAllRecords(datasetApiUrl: string) {
  const records: RawRecord[] = [];
  let offset = 0;
  let totalCount = Infinity;

  while (offset < totalCount) {
    const url = new URL(`${datasetApiUrl}/records`);
    url.searchParams.set("limit", String(pageSize));
    url.searchParams.set("offset", String(offset));

    const page = await fetchJson<{ total_count: number; results: RawRecord[] }>(url.toString());
    totalCount = page.total_count;
    records.push(...page.results);
    offset += pageSize;
  }

  return records;
}

function latestSourceDate(records: RawRecord[], dateField: string) {
  const dates = records
    .map((record) => record[dateField])
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .sort((left, right) => sourceDateSortWeight(right) - sourceDateSortWeight(left));

  return dates[0] ?? null;
}

async function main() {
  const failures: string[] = [];

  for (const definition of layerDefinitions) {
    await fetchJson<{
      dataset_id: string;
      metas: { default: { data_processed: string; title: string; update_frequency: string } };
    }>(definition.source.datasetApiUrl);

    const records = await fetchAllRecords(definition.source.datasetApiUrl);
    const sampleRecord = records[0];
    if (!sampleRecord) {
      failures.push(`${definition.id}: no sample records returned`);
      continue;
    }

    for (const field of Object.values(definition.fields)) {
      if (!(field in sampleRecord)) {
        failures.push(`${definition.id}: missing expected field '${field}'`);
      }
    }

    const latestDate = latestSourceDate(records, definition.fields.date);
    if (!latestDate) {
      failures.push(`${definition.id}: no valid source period values returned`);
      continue;
    }

    const freshness = evaluateFreshness(definition.freshnessPolicy, latestDate);
    if (freshness.status === "stale") {
      failures.push(`${definition.id}: ${freshness.message}`);
    }
  }

  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
    return;
  }

  console.log(`Checked ${layerDefinitions.length} active layer sources with no blocking failures.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

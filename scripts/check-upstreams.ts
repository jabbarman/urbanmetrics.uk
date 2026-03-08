import { layerDefinitions } from "../src/server/datasets/catalog";
import { evaluateFreshness } from "../src/server/datasets/utils";

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

async function main() {
  const failures: string[] = [];

  for (const definition of layerDefinitions) {
    const metadata = await fetchJson<{
      dataset_id: string;
      metas: { default: { data_processed: string; title: string; update_frequency: string } };
    }>(definition.source.datasetApiUrl);

    const sample = await fetchJson<{ results: Record<string, unknown>[] }>(
      `${definition.source.datasetApiUrl}/records?limit=1`,
    );

    const sampleRecord = sample.results[0];
    if (!sampleRecord) {
      failures.push(`${definition.id}: no sample records returned`);
      continue;
    }

    for (const field of Object.values(definition.fields)) {
      if (!(field in sampleRecord)) {
        failures.push(`${definition.id}: missing expected field '${field}'`);
      }
    }

    const freshness = evaluateFreshness(definition.freshnessPolicy, metadata.metas.default.data_processed);
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

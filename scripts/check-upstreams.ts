import { layerDefinitions } from "../src/server/datasets/catalog";
import { expectedAreaIdsByCompareGroup } from "../src/server/datasets/coverage";
import {
  compareAreaCoverage,
  formatCoverageIssues,
  hasCoverageIssues,
  selectLatestRecordsByArea,
  type RawRecord,
} from "../src/server/datasets/normalization";
import { evaluateFreshness, sourceDateSortWeight } from "../src/server/datasets/utils";

const pageSize = 100;

type FailureClass = "freshness" | "schema" | "request" | "runtime";

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

function classifyError(message: string): FailureClass {
  if (message.includes("coverage mismatch") || message.includes("latest record") || message.includes("source period")) {
    return "schema";
  }

  if (message.includes("Request failed")) {
    return "request";
  }

  return "runtime";
}

function formatFailure(layerId: string, failureClass: FailureClass, message: string) {
  return `${layerId} [${failureClass}]: ${message}`;
}

async function main() {
  const failures: string[] = [];

  for (const definition of layerDefinitions) {
    try {
      await fetchJson<{
        dataset_id: string;
        metas: { default: { data_processed: string; title: string; update_frequency: string } };
      }>(definition.source.datasetApiUrl);

      const allRecords = await fetchAllRecords(definition.source.datasetApiUrl);
      const expectedAreaIds =
        expectedAreaIdsByCompareGroup[definition.compareGroup as keyof typeof expectedAreaIdsByCompareGroup];
      const records = selectLatestRecordsByArea(allRecords, definition, expectedAreaIds);

      if (expectedAreaIds) {
        const coverage = compareAreaCoverage(
          expectedAreaIds,
          records.map((record) => record[definition.fields.areaId] as string),
        );

        if (hasCoverageIssues(coverage)) {
          failures.push(formatFailure(definition.id, "schema", formatCoverageIssues(definition.compareGroup, coverage)));
          continue;
        }
      }

      const latestDate = latestSourceDate(records, definition.fields.date);
      if (!latestDate) {
        failures.push(formatFailure(definition.id, "schema", "No valid source period values returned."));
        continue;
      }

      const freshness = evaluateFreshness(definition.freshnessPolicy, latestDate);
      if (freshness.status === "stale") {
        failures.push(formatFailure(definition.id, "freshness", freshness.message));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(formatFailure(definition.id, classifyError(message), message));
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

import { layerDefinitions } from "../src/server/datasets/catalog";
import { expectedAreaIdsByCompareGroup } from "../src/server/datasets/coverage";
import {
  compareAreaCoverage,
  formatCoverageIssues,
  hasCoverageIssues,
  selectLatestRecordsByArea,
} from "../src/server/datasets/normalization";
import { fetchSourcePayload } from "../src/server/datasets/source-adapters";
import { fetchMidlandsFuelPovertyValues } from "../src/server/datasets/midlands-fuel-poverty";
import { fetchMidlandsImdValues } from "../src/server/datasets/midlands-imd";
import { fetchMidlandsLsoaReferenceGeography } from "../src/server/datasets/midlands-reference-geography";
import { evaluateFreshness, sourceDateSortWeight } from "../src/server/datasets/utils";

type FailureClass = "freshness" | "schema" | "request" | "runtime";
import type { RawRecord } from "../src/server/datasets/normalization";

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
      const sourcePayload = await fetchSourcePayload(definition, "urbanmetrics-uk-monitor/0.1");
      const expectedAreaIds =
        expectedAreaIdsByCompareGroup[definition.compareGroup as keyof typeof expectedAreaIdsByCompareGroup];
      const records = selectLatestRecordsByArea(sourcePayload.records, definition, expectedAreaIds);
      const rawLatestDate = latestSourceDate(sourcePayload.records, definition.fields.date);

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

      if (rawLatestDate && rawLatestDate !== latestDate) {
        failures.push(
          formatFailure(
            definition.id,
            "schema",
            `Latest source period '${rawLatestDate}' is incomplete; sync would fall back to '${latestDate}'.`,
          ),
        );
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

  try {
    const reference = await fetchMidlandsLsoaReferenceGeography("urbanmetrics-uk-monitor/0.1");
    const [imd, fuelPoverty] = await Promise.all([
      fetchMidlandsImdValues(reference, "urbanmetrics-uk-monitor/0.1"),
      fetchMidlandsFuelPovertyValues(reference, "urbanmetrics-uk-monitor/0.1"),
    ]);
    for (const [id, values] of [["midlands-imd-2025", imd], ["midlands-fuel-poverty-2024", fuelPoverty]] as const) {
      if (values.length !== reference.expectedAreaCount) {
        failures.push(formatFailure(id, "schema", `Expected ${reference.expectedAreaCount} LSOAs but observed ${values.length}; boundary checksum ${reference.areaIdChecksum}.`));
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push(formatFailure("midlands-lsoa-2021", classifyError(message), message));
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

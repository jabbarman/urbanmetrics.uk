import type { LayerDefinition } from "@/server/datasets/types";
import { sourceDateSortWeight } from "@/server/datasets/utils";

export type RawRecord = Record<string, unknown>;

export type CoverageCheck = {
  duplicateAreaIds: string[];
  missingAreaIds: string[];
  unexpectedAreaIds: string[];
};

function missingLatestRecordFields(record: RawRecord, definition: LayerDefinition) {
  const missing: string[] = [];

  if (typeof record[definition.fields.areaName] !== "string") {
    missing.push(definition.fields.areaName);
  }

  if (typeof record[definition.fields.value] !== "number") {
    missing.push(definition.fields.value);
  }

  if (typeof record[definition.fields.localAuthorityName] !== "string") {
    missing.push(definition.fields.localAuthorityName);
  }

  if (typeof record[definition.fields.localAuthorityCode] !== "string") {
    missing.push(definition.fields.localAuthorityCode);
  }

  const geometryWrapper = record[definition.fields.geometry] as { geometry?: unknown } | null | undefined;
  if (!geometryWrapper?.geometry) {
    missing.push(definition.fields.geometry);
  }

  const centroid = record[definition.fields.centroid] as { lon?: number; lat?: number } | null | undefined;
  if (typeof centroid?.lon !== "number" || typeof centroid.lat !== "number") {
    missing.push(definition.fields.centroid);
  }

  return missing;
}

function sourceDatesForRecords(recordsByArea: Map<string, RawRecord[]>, definition: LayerDefinition) {
  return [...new Set(
    [...recordsByArea.values()].flatMap((areaRecords) =>
      areaRecords
        .map((record) => record[definition.fields.date])
        .filter((value): value is string => typeof value === "string" && value.length > 0),
    ),
  )].sort((left, right) => sourceDateSortWeight(right) - sourceDateSortWeight(left));
}

export function selectLatestRecordsByArea(records: RawRecord[], definition: LayerDefinition, expectedAreaIds?: readonly string[]) {
  const expectedAreaIdSet = expectedAreaIds ? new Set(expectedAreaIds) : null;
  const recordsByArea = new Map<string, RawRecord[]>();

  for (const record of records) {
    const areaId = record[definition.fields.areaId];
    const sourceDate = record[definition.fields.date];

    if (typeof areaId !== "string" || areaId.length === 0 || typeof sourceDate !== "string" || sourceDate.length === 0) {
      continue;
    }

    if (expectedAreaIdSet && !expectedAreaIdSet.has(areaId)) {
      continue;
    }

    const areaRecords = recordsByArea.get(areaId) ?? [];
    areaRecords.push(record);
    areaRecords.sort((left, right) => {
      const leftDate = left[definition.fields.date] as string;
      const rightDate = right[definition.fields.date] as string;
      return sourceDateSortWeight(rightDate) - sourceDateSortWeight(leftDate);
    });
    recordsByArea.set(areaId, areaRecords);
  }

  if (expectedAreaIds && expectedAreaIds.length > 0) {
    const candidateDates = sourceDatesForRecords(recordsByArea, definition);

    for (const candidateDate of candidateDates) {
      const selectedRecords: RawRecord[] = [];
      let incompletePeriod = false;

      for (const areaId of expectedAreaIds) {
        const recordForDate = recordsByArea
          .get(areaId)
          ?.find((record) => record[definition.fields.date] === candidateDate);

        if (!recordForDate) {
          incompletePeriod = true;
          break;
        }

        const missingFields = missingLatestRecordFields(recordForDate, definition);
        if (missingFields.length > 0) {
          incompletePeriod = true;
          break;
        }

        selectedRecords.push(recordForDate);
      }

      if (!incompletePeriod) {
        return selectedRecords;
      }
    }

    const latestDate = candidateDates[0];
    throw new Error(
      `${definition.id}: no complete source period was found${latestDate ? `; latest observed period '${latestDate}' is incomplete` : ""}.`,
    );
  }

  const selectedRecords: RawRecord[] = [];
  const errors: string[] = [];

  for (const [areaId, areaRecords] of recordsByArea) {
    const latestCompleteRecord = areaRecords.find((record) => missingLatestRecordFields(record, definition).length === 0);

    if (!latestCompleteRecord) {
      const latestRecord = areaRecords[0];
      const missingFields = latestRecord ? missingLatestRecordFields(latestRecord, definition) : ["source record"];
      errors.push(`latest usable record for area '${areaId}' is missing ${missingFields.join(", ")}`);
      continue;
    }

    selectedRecords.push(latestCompleteRecord);
  }

  if (errors.length > 0) {
    const preview = errors.slice(0, 5).join("\n");
    const suffix = errors.length > 5 ? `\n...and ${errors.length - 5} more latest-record validation failures.` : "";
    throw new Error(`${definition.id}: ${preview}${suffix}`);
  }

  return selectedRecords;
}

export function compareAreaCoverage(expectedAreaIds: readonly string[], actualAreaIds: string[]): CoverageCheck {
  const duplicates = actualAreaIds.filter((areaId, index) => actualAreaIds.indexOf(areaId) !== index);
  const expectedSet = new Set(expectedAreaIds);
  const actualSet = new Set(actualAreaIds);

  return {
    duplicateAreaIds: [...new Set(duplicates)].sort(),
    missingAreaIds: expectedAreaIds.filter((areaId) => !actualSet.has(areaId)),
    unexpectedAreaIds: actualAreaIds.filter((areaId) => !expectedSet.has(areaId)).sort(),
  };
}

export function hasCoverageIssues(result: CoverageCheck) {
  return result.duplicateAreaIds.length > 0 || result.missingAreaIds.length > 0 || result.unexpectedAreaIds.length > 0;
}

export function formatCoverageIssues(compareGroup: string, result: CoverageCheck) {
  const messages: string[] = [];

  if (result.missingAreaIds.length > 0) {
    messages.push(`missing ${result.missingAreaIds.length} expected areas (${result.missingAreaIds.slice(0, 8).join(", ")})`);
  }

  if (result.unexpectedAreaIds.length > 0) {
    messages.push(`found ${result.unexpectedAreaIds.length} unexpected areas (${result.unexpectedAreaIds.slice(0, 8).join(", ")})`);
  }

  if (result.duplicateAreaIds.length > 0) {
    messages.push(`found duplicate areas (${result.duplicateAreaIds.slice(0, 8).join(", ")})`);
  }

  return `${compareGroup} coverage mismatch: ${messages.join("; ")}`;
}

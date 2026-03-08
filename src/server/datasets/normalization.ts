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
    recordsByArea.set(areaId, areaRecords);
  }

  const selectedRecords: RawRecord[] = [];
  const errors: string[] = [];

  for (const [areaId, areaRecords] of recordsByArea) {
    areaRecords.sort((left, right) => {
      const leftDate = left[definition.fields.date] as string;
      const rightDate = right[definition.fields.date] as string;
      return sourceDateSortWeight(rightDate) - sourceDateSortWeight(leftDate);
    });

    const latestRecord = areaRecords[0];
    const missingFields = missingLatestRecordFields(latestRecord, definition);
    if (missingFields.length > 0) {
      errors.push(`latest record for area '${areaId}' is missing ${missingFields.join(", ")}`);
      continue;
    }

    selectedRecords.push(latestRecord);
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

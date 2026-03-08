import { describe, expect, it } from "vitest";

import { compareAreaCoverage, hasCoverageIssues, selectLatestRecordsByArea, type RawRecord } from "@/server/datasets/normalization";
import type { LayerDefinition } from "@/server/datasets/types";

const definition: LayerDefinition = {
  id: "test-layer",
  title: "Test Layer",
  shortLabel: "Test",
  description: "Test layer for normalization",
  compareGroup: "test-group",
  geographyLabel: "Test geography",
  geographyVintage: "2025",
  unit: "%",
  precision: 1,
  cadenceLabel: "Monthly",
  freshnessPolicy: { kind: "maxAgeDays", days: 60 },
  palette: ["#000000"],
  source: {
    provider: "Test",
    publisher: "Test",
    apiBaseUrl: "https://example.com",
    datasetId: "test-dataset",
    datasetUrl: "https://example.com/dataset",
    datasetApiUrl: "https://example.com/api",
    licence: "test",
    caveat: "test",
  },
  fields: {
    areaId: "areaId",
    areaName: "areaName",
    value: "value",
    date: "date",
    geometry: "geometry",
    centroid: "centroid",
    localAuthorityName: "localAuthorityName",
    localAuthorityCode: "localAuthorityCode",
  },
};

function record(overrides: Partial<RawRecord>): RawRecord {
  return {
    areaId: "A",
    areaName: "Area A",
    value: 1,
    date: "2026-01",
    geometry: { geometry: { type: "Point", coordinates: [0, 0] } },
    centroid: { lon: 0, lat: 0 },
    localAuthorityName: "Authority",
    localAuthorityCode: "AUTH",
    ...overrides,
  };
}

describe("dataset normalization", () => {
  it("selects the latest record for each area", () => {
    const selected = selectLatestRecordsByArea(
      [record({ areaId: "A", date: "2025-12", value: 10 }), record({ areaId: "A", date: "2026-01", value: 20 })],
      definition,
    );

    expect(selected).toHaveLength(1);
    expect(selected[0].value).toBe(20);
  });

  it("fails when the latest record for an area is structurally incomplete", () => {
    expect(() =>
      selectLatestRecordsByArea(
        [record({ areaId: "A", date: "2025-12", value: 10 }), record({ areaId: "A", date: "2026-01", geometry: null })],
        definition,
      ),
    ).toThrow(/latest record for area 'A' is missing geometry/);
  });

  it("detects missing expected areas", () => {
    const coverage = compareAreaCoverage(["A", "B"], ["A"]);

    expect(hasCoverageIssues(coverage)).toBe(true);
    expect(coverage.missingAreaIds).toEqual(["B"]);
  });
});

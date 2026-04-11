import { describe, expect, it } from "vitest";

import { compareAreaCoverage, hasCoverageIssues, selectLatestRecordsByArea, type RawRecord } from "@/server/datasets/normalization";
import type { LayerDefinition } from "@/server/datasets/types";

const definition: LayerDefinition = {
  id: "test-layer",
  title: "Test Layer",
  shortLabel: "Test",
  description: "Test layer for normalization",
  interpretation: {
    summary: "Test summary",
    higherValuesMean: "Higher values mean more test output.",
    rankingTitle: "Highest test values",
  },
  compareGroup: "test-group",
  geographyLabel: "Test geography",
  geographyVintage: "2025",
  unit: "%",
  precision: 1,
  cadenceLabel: "Monthly",
  freshnessPolicy: { kind: "maxAgeDays", days: 60 },
  palette: ["#000000"],
  source: {
    kind: "bco_api",
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

  it("falls back to the latest complete record for an area when coverage is not fixed", () => {
    const selected = selectLatestRecordsByArea(
      [record({ areaId: "A", date: "2025-12", value: 10 }), record({ areaId: "A", date: "2026-01", geometry: null })],
      definition,
    );

    expect(selected).toHaveLength(1);
    expect(selected[0].date).toBe("2025-12");
    expect(selected[0].value).toBe(10);
  });

  it("falls back to the latest complete shared source period when coverage is fixed", () => {
    const selected = selectLatestRecordsByArea(
      [
        record({ areaId: "A", areaName: "Area A", date: "2025-12", value: 10 }),
        record({ areaId: "B", areaName: "Area B", date: "2025-12", value: 20 }),
        record({ areaId: "A", areaName: "Area A", date: "2026-01", value: 30 }),
        record({ areaId: "B", areaName: "Area B", date: "2026-01", geometry: null }),
      ],
      definition,
      ["A", "B"],
    );

    expect(selected).toHaveLength(2);
    expect(selected.every((item) => item.date === "2025-12")).toBe(true);
  });

  it("fails when no complete shared source period exists for the expected footprint", () => {
    expect(() =>
      selectLatestRecordsByArea(
        [
          record({ areaId: "A", areaName: "Area A", date: "2026-01", geometry: null }),
          record({ areaId: "B", areaName: "Area B", date: "2026-01", value: 20 }),
        ],
        definition,
        ["A", "B"],
      ),
    ).toThrow(/no complete source period was found/);
  });

  it("detects missing expected areas", () => {
    const coverage = compareAreaCoverage(["A", "B"], ["A"]);

    expect(hasCoverageIssues(coverage)).toBe(true);
    expect(coverage.missingAreaIds).toEqual(["B"]);
  });

  it("filters out areas outside the expected footprint", () => {
    const selected = selectLatestRecordsByArea(
      [record({ areaId: "A", areaName: "Area A" }), record({ areaId: "B", areaName: "Area B" })],
      definition,
      ["A"],
    );

    expect(selected).toHaveLength(1);
    expect(selected[0].areaId).toBe("A");
  });
});

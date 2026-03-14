import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MetricCards } from "@/features/dashboard/metric-cards";
import type { CatalogEntry, GeneratedStatus } from "@/server/datasets/types";

function makeCatalogEntry(): CatalogEntry {
  return {
    id: "imd-employment-score",
    title: "IMD Employment Score",
    shortLabel: "IMD employment",
    description: "Employment deprivation score.",
    interpretation: {
      summary: "IMD stands for Indices of Multiple Deprivation.",
      higherValuesMean: "Higher values mean greater employment deprivation.",
      rankingTitle: "Most employment-deprived areas",
    },
    compareGroup: "wmca-ward",
    geographyLabel: "WMCA ward",
    geographyVintage: "ward 2025",
    unit: "%",
    precision: 1,
    cadenceLabel: "Irregular",
    freshnessPolicy: { kind: "referenceOnly" },
    palette: ["#ffffff"],
    legendBreaks: [10],
    source: {
      provider: "Test",
      publisher: "Test Publisher",
      apiBaseUrl: "https://example.com",
      datasetId: "imd-employment-score",
      datasetUrl: "https://example.com/dataset",
      datasetApiUrl: "https://example.com/api",
      licence: "OGL",
      caveat: "Test caveat",
      datasetTitle: "IMD Employment Score",
      dataProcessedAt: "2026-03-01T00:00:00.000Z",
      updateFrequency: "IRREG",
      recordsFetched: 1,
      latestSourceDate: "2025",
      fetchedAt: "2026-03-08T00:00:00.000Z",
    },
    summary: {
      min: 10,
      max: 20,
      mean: 15,
      median: 15,
      topAreas: [],
      bottomAreas: [],
    },
  };
}

describe("MetricCards", () => {
  it("shows a status breakdown instead of only healthy upstream count", () => {
    const activeLayer = makeCatalogEntry();
    const status: GeneratedStatus["layers"] = [
      {
        id: "ok-layer",
        title: "OK Layer",
        status: "ok",
        dataProcessedAt: "2026-03-01T00:00:00.000Z",
        latestSourceDate: "2026-02",
        updateFrequency: "MONTHLY",
        recordsFetched: 1,
        message: "ok",
      },
      {
        id: "warning-layer",
        title: "Warning Layer",
        status: "warning",
        dataProcessedAt: "2026-03-01T00:00:00.000Z",
        latestSourceDate: "2025",
        updateFrequency: "IRREG",
        recordsFetched: 1,
        message: "warning",
      },
      {
        id: "stale-layer",
        title: "Stale Layer",
        status: "stale",
        dataProcessedAt: "2026-03-01T00:00:00.000Z",
        latestSourceDate: "2024",
        updateFrequency: "ANNUAL",
        recordsFetched: 1,
        message: "stale",
      },
    ];

    render(<MetricCards activeLayer={activeLayer} catalog={[activeLayer]} status={status} />);

    expect(screen.getByText("Layer status")).toBeInTheDocument();
    expect(screen.getByText("1 current, 1 reference-only, 1 stale.")).toBeInTheDocument();
  });
});

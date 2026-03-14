import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MapExplorer } from "@/features/map/map-explorer";
import type { CatalogEntry, GeneratedLayer, GeneratedStatus } from "@/server/datasets/types";

vi.mock("@/features/dashboard/area-inspector", () => ({
  AreaInspector: () => <div>area inspector</div>,
}));

vi.mock("@/features/dashboard/metric-cards", () => ({
  MetricCards: () => <div>metric cards</div>,
}));

vi.mock("@/features/dashboard/ranking-chart", () => ({
  RankingChart: () => <div>ranking chart</div>,
}));

vi.mock("@/features/map/legend", () => ({
  Legend: () => <div>legend</div>,
}));

vi.mock("@/features/map/map-view", () => ({
  MapView: () => <div>map view</div>,
}));

function makeCatalogEntry(id: string, title: string): CatalogEntry {
  return {
    id,
    title,
    shortLabel: title,
    description: `${title} description`,
    interpretation: {
      summary: `${title} summary`,
      higherValuesMean: `${title} higher values meaning`,
      rankingTitle: `${title} rankings`,
    },
    compareGroup: "wmca-ward",
    geographyLabel: "WMCA ward",
    geographyVintage: "ward 2025",
    unit: "%",
    precision: 1,
    cadenceLabel: "Monthly",
    freshnessPolicy: { kind: "maxAgeDays", days: 60 },
    palette: ["#ffffff"],
    legendBreaks: [10],
    source: {
      provider: "Test",
      publisher: "Test Publisher",
      apiBaseUrl: "https://example.com",
      datasetId: id,
      datasetUrl: "https://example.com/dataset",
      datasetApiUrl: "https://example.com/api",
      licence: "OGL",
      caveat: "Test caveat",
      datasetTitle: title,
      dataProcessedAt: "2026-03-01T00:00:00.000Z",
      updateFrequency: "MONTHLY",
      recordsFetched: 1,
      latestSourceDate: "2026-02",
      fetchedAt: "2026-03-08T00:00:00.000Z",
    },
    summary: {
      min: 10,
      max: 10,
      mean: 10,
      median: 10,
      topAreas: [],
      bottomAreas: [],
    },
  };
}

function makeGeneratedLayer(layer: CatalogEntry): GeneratedLayer {
  return {
    schemaVersion: 1,
    generatedAt: "2026-03-08T00:00:00.000Z",
    layer,
    geojson: {
      type: "FeatureCollection",
      features: [],
    },
  };
}

const status: GeneratedStatus["layers"] = [];

describe("MapExplorer", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps the workspace usable when one layer fails to load", async () => {
    const firstLayer = makeCatalogEntry("layer-a", "Layer A");
    const secondLayer = makeCatalogEntry("layer-b", "Layer B");

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string) => {
        if (input.includes("layer-a")) {
          return new Response(JSON.stringify(makeGeneratedLayer(firstLayer)), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response("not found", { status: 404 });
      }),
    );

    render(<MapExplorer catalog={[firstLayer, secondLayer]} status={status} />);

    await waitFor(() => {
      expect(screen.getByText(/some overlays are temporarily unavailable/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/remaining layers continue to work/i)).toBeInTheDocument();
    expect(screen.getByText("map view")).toBeInTheDocument();

    const primaryLayerSelect = screen.getByLabelText(/primary fill layer/i);
    expect(within(primaryLayerSelect).getByRole("option", { name: "Layer A" })).toBeInTheDocument();
    expect(primaryLayerSelect).toHaveValue("layer-a");
    expect(screen.queryByRole("option", { name: "Layer B" })).not.toBeInTheDocument();
  });
});

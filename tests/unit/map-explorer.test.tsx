import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
  Legend: ({ compareLayer, primaryLayer }: { compareLayer: { title: string } | null; primaryLayer: { title: string } | null }) => (
    <div>
      legend:{primaryLayer?.title ?? "none"}:{compareLayer?.title ?? "none"}
    </div>
  ),
}));

vi.mock("@/features/map/map-view", () => ({
  MapView: ({ compareLayer, primaryLayer }: { compareLayer: { layer: { title: string } } | null; primaryLayer: { layer: { title: string } } | null }) => (
    <div>
      map view:{primaryLayer?.layer.title ?? "none"}:{compareLayer?.layer.title ?? "none"}
    </div>
  ),
}));

function makeCatalogEntry(id: string, title: string, compareGroup = "wmca-ward"): CatalogEntry {
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
    compareGroup,
    geographyLabel: "WMCA ward",
    geographyVintage: "ward 2025",
    unit: "%",
    precision: 1,
    cadenceLabel: "Monthly",
    freshnessPolicy: { kind: "maxAgeDays", days: 60 },
    palette: ["#ffffff"],
    legendBreaks: [10],
    source: {
      kind: "bco_api",
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
const sourceCaveat = "Workspace-specific source caveat.";

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

    render(<MapExplorer catalog={[firstLayer, secondLayer]} sourceCaveat={sourceCaveat} status={status} />);

    await waitFor(() => {
      expect(screen.getByText(/some overlays are temporarily unavailable/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/remaining layers continue to work/i)).toBeInTheDocument();
    expect(screen.getByText("map view:Layer A:none")).toBeInTheDocument();

    const primaryLayerSelect = screen.getByLabelText(/primary fill layer/i);
    expect(within(primaryLayerSelect).getByRole("option", { name: "Layer A" })).toBeInTheDocument();
    expect(primaryLayerSelect).toHaveValue("layer-a");
    expect(screen.queryByRole("option", { name: "Layer B" })).not.toBeInTheDocument();
  });

  it("limits compare options to the active layer compare group", async () => {
    const wardLayer = makeCatalogEntry("layer-a", "Ward Layer", "wmca-ward");
    const icbLayer = makeCatalogEntry("layer-b", "ICB Layer", "sub-icb");
    const wardCompareLayer = makeCatalogEntry("layer-c", "Ward Compare Layer", "wmca-ward");

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string) => {
        if (input.includes("layer-a")) {
          return new Response(JSON.stringify(makeGeneratedLayer(wardLayer)), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (input.includes("layer-b")) {
          return new Response(JSON.stringify(makeGeneratedLayer(icbLayer)), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(makeGeneratedLayer(wardCompareLayer)), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }),
    );

    render(<MapExplorer catalog={[wardLayer, icbLayer, wardCompareLayer]} sourceCaveat={sourceCaveat} status={status} />);

    await waitFor(() => {
      expect(screen.getByText("map view:Ward Layer:Ward Compare Layer")).toBeInTheDocument();
    });

    const compareLayerSelect = screen.getByLabelText(/secondary compare layer/i);
    expect(within(compareLayerSelect).getByRole("option", { name: "Ward Compare Layer" })).toBeInTheDocument();
    expect(within(compareLayerSelect).queryByRole("option", { name: "ICB Layer" })).not.toBeInTheDocument();
  });

  it("resets the active compare layer when the primary layer changes to a different compare group", async () => {
    const wardLayer = makeCatalogEntry("layer-a", "Ward Layer", "wmca-ward");
    const wardCompareLayer = makeCatalogEntry("layer-b", "Ward Compare Layer", "wmca-ward");
    const subIcbLayer = makeCatalogEntry("layer-c", "SubICB Layer", "sub-icb");
    const subIcbCompareLayer = makeCatalogEntry("layer-d", "SubICB Compare Layer", "sub-icb");

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string) => {
        if (input.includes("layer-a")) {
          return new Response(JSON.stringify(makeGeneratedLayer(wardLayer)), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (input.includes("layer-b")) {
          return new Response(JSON.stringify(makeGeneratedLayer(wardCompareLayer)), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (input.includes("layer-c")) {
          return new Response(JSON.stringify(makeGeneratedLayer(subIcbLayer)), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(makeGeneratedLayer(subIcbCompareLayer)), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }),
    );

    render(
      <MapExplorer
        catalog={[wardLayer, wardCompareLayer, subIcbLayer, subIcbCompareLayer]}
        sourceCaveat={sourceCaveat}
        status={status}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("map view:Ward Layer:Ward Compare Layer")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/primary fill layer/i), {
      target: { value: "layer-c" },
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/secondary compare layer/i)).toHaveValue("layer-d");
    });

    expect(screen.getByText("legend:SubICB Layer:SubICB Compare Layer")).toBeInTheDocument();
    expect(screen.getByText("map view:SubICB Layer:SubICB Compare Layer")).toBeInTheDocument();
  });

  it("honors workspace default layers instead of relying on catalog order", async () => {
    const firstLayer = makeCatalogEntry("layer-a", "Layer A", "wmca-ward");
    const secondLayer = makeCatalogEntry("layer-b", "Layer B", "wmca-ward");
    const thirdLayer = makeCatalogEntry("layer-c", "Layer C", "wmca-ward");

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string) => {
        if (input.includes("layer-a")) {
          return new Response(JSON.stringify(makeGeneratedLayer(firstLayer)), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (input.includes("layer-b")) {
          return new Response(JSON.stringify(makeGeneratedLayer(secondLayer)), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(makeGeneratedLayer(thirdLayer)), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }),
    );

    render(
      <MapExplorer
        catalog={[firstLayer, secondLayer, thirdLayer]}
        defaultCompareLayerId="layer-c"
        defaultPrimaryLayerId="layer-b"
        sourceCaveat={sourceCaveat}
        status={status}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("map view:Layer B:Layer C")).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/primary fill layer/i)).toHaveValue("layer-b");
    expect(screen.getByLabelText(/secondary compare layer/i)).toHaveValue("layer-c");
    expect(screen.getByText(sourceCaveat)).toBeInTheDocument();
  });
});

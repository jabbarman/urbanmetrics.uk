import { describe, expect, it } from "vitest";

import {
  buildReferenceGeographyLookup,
  normalizeNhsGeographyLookupValue,
} from "@/server/datasets/reference-geographies";

describe("reference geographies", () => {
  it("normalizes NHS geography names for stable lookup keys", () => {
    expect(normalizeNhsGeographyLookupValue("  NHS Birmingham and Solihull ICB - 15E  ")).toBe(
      "NHS BIRMINGHAM AND SOLIHULL ICB - 15E",
    );
  });

  it("builds a lookup from reference geometry names", () => {
    const lookup = buildReferenceGeographyLookup("sub-icb", "areaName", [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 0],
            ],
          ],
        },
        properties: {
          areaId: "E38000001",
          areaName: "NHS Birmingham and Solihull ICB - 15E",
          centroid: { lon: -1.9, lat: 52.5 },
        },
      },
    ]);

    expect(lookup.items).toHaveLength(1);
    expect(lookup.items[0]).toEqual({
      lookupValue: "NHS Birmingham and Solihull ICB - 15E",
      normalizedLookupValue: "NHS BIRMINGHAM AND SOLIHULL ICB - 15E",
      areaId: "E38000001",
      areaName: "NHS Birmingham and Solihull ICB - 15E",
    });
  });
});

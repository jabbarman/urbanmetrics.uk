import { describe, expect, it } from "vitest";

import { buildMidlandsLsoaReferenceGeography } from "@/server/datasets/midlands-reference-geography";

const polygon = {
  type: "Polygon" as const,
  coordinates: [
    [
      [-2, 52],
      [-1, 52],
      [-1, 53],
      [-2, 52],
    ],
  ],
};

const rows = [
  { LSOA21CD: "E01000001", LSOA21NM: "Midlands 001A", LAD22CD: "E06000001", LAD22NM: "Midlands Council", RGN22CD: "E12000004", RGN22NM: "East Midlands" },
  { LSOA21CD: "E01000002", LSOA21NM: "Elsewhere 001A", LAD22CD: "E06000002", LAD22NM: "Elsewhere Council", RGN22CD: "E12000007", RGN22NM: "London" },
];

describe("Midlands LSOA reference geography", () => {
  it("filters to the approved regions and preserves lookup context", () => {
    const reference = buildMidlandsLsoaReferenceGeography(
      { type: "FeatureCollection", features: [{ type: "Feature", geometry: polygon, properties: { LSOA21CD: "E01000001", LSOA21NM: "Midlands 001A" } }] },
      rows,
    );

    expect(reference.expectedAreaIds).toEqual(["E01000001"]);
    expect(reference.geojson.features[0].properties).toMatchObject({ areaName: "Midlands 001A", regionName: "East Midlands" });
  });

  it("rejects a lookup area that does not have a boundary", () => {
    expect(() => buildMidlandsLsoaReferenceGeography({ type: "FeatureCollection", features: [] }, rows)).toThrow("missing 1 areas");
  });

  it("rejects duplicate scoped lookup codes", () => {
    expect(() => buildMidlandsLsoaReferenceGeography(
      { type: "FeatureCollection", features: [{ type: "Feature", geometry: polygon, properties: { LSOA21CD: "E01000001" } }] },
      [...rows, { ...rows[0] }],
    )).toThrow("Duplicate LSOA lookup code");
  });
});

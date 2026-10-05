import { describe, expect, it } from "vitest";

import { buildMidlandsLsoaReferenceGeography } from "@/server/datasets/midlands-reference-geography";

const polygon = {
  type: "Polygon" as const,
  coordinates: [
    [
      [400000, 300000],
      [401000, 300000],
      [401000, 301000],
      [400000, 300000],
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
    expect(reference.geojson.features[0].geometry.coordinates[0][0][0]).toBeGreaterThan(-3);
    expect(reference.geojson.features[0].geometry.coordinates[0][0][0]).toBeLessThan(1);
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

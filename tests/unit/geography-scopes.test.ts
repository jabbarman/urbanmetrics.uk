import { describe, expect, it } from "vitest";

import { midlandsGeographyScope } from "@/server/datasets/geography-scopes";

describe("midlands geography scope", () => {
  it("uses the approved official East and West Midlands region codes", () => {
    expect(midlandsGeographyScope).toMatchObject({
      id: "midlands",
      regionCodes: ["E12000004", "E12000005"],
      primaryGeography: { id: "lsoa-2021", vintage: "December 2021" },
    });
  });
});

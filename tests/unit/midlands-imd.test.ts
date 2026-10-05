import { describe, expect, it } from "vitest";

import { buildMidlandsImdValues } from "@/server/datasets/midlands-imd";
import type { MidlandsLsoaReferenceGeography } from "@/server/datasets/midlands-reference-geography";

const reference = { expectedAreaIds: ["E01000001", "E01000002"] } as MidlandsLsoaReferenceGeography;
const header = "LSOA code (2021),Index of Multiple Deprivation (IMD) Decile (where 1 is most deprived 10% of LSOAs)";

describe("Midlands IMD adapter", () => {
  it("normalizes a complete LSOA 2021 decile extract", () => {
    expect(buildMidlandsImdValues(`${header}\nE01000001,1\nE01000002,10\n`, reference)).toEqual([
      { areaId: "E01000001", value: 1, sourceDate: "2025-10-30" },
      { areaId: "E01000002", value: 10, sourceDate: "2025-10-30" },
    ]);
  });

  it("rejects incomplete coverage and invalid deciles", () => {
    expect(() => buildMidlandsImdValues(`${header}\nE01000001,1\n`, reference)).toThrow("coverage missing 1");
    expect(() => buildMidlandsImdValues(`${header}\nE01000001,0\nE01000002,2\n`, reference)).toThrow("Invalid IMD decile");
  });
});

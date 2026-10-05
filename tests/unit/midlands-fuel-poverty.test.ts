import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";

import { buildMidlandsFuelPovertyValues } from "@/server/datasets/midlands-fuel-poverty";
import type { MidlandsLsoaReferenceGeography } from "@/server/datasets/midlands-reference-geography";

const reference = { expectedAreaIds: ["E01000001", "E01000002"] } as MidlandsLsoaReferenceGeography;

function workbook(rows: unknown[][]) {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows), "Table 4");
  return XLSX.write(book, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

const header = ["LSOA Code", "Proportion of households fuel poor (%)"];

describe("Midlands fuel-poverty adapter", () => {
  it("normalizes the official LSOA percentage column with complete coverage", () => {
    expect(buildMidlandsFuelPovertyValues(workbook([["title"], header, ["E01000001", 4.5], ["E01000002", 12.2]]), reference)).toEqual([
      { areaId: "E01000001", value: 4.5, sourceDate: "2024-03-31" },
      { areaId: "E01000002", value: 12.2, sourceDate: "2024-03-31" },
    ]);
  });

  it("rejects missing, duplicate, and malformed values", () => {
    expect(() => buildMidlandsFuelPovertyValues(workbook([header, ["E01000001", 4.5]]), reference)).toThrow("coverage missing 1");
    expect(() => buildMidlandsFuelPovertyValues(workbook([header, ["E01000001", 4.5], ["E01000001", 5], ["E01000002", 2]]), reference)).toThrow("Duplicate");
    expect(() => buildMidlandsFuelPovertyValues(workbook([header, ["E01000001", 101], ["E01000002", 2]]), reference)).toThrow("Invalid");
  });
});

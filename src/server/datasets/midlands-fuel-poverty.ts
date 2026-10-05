import * as XLSX from "xlsx";

import type { MidlandsLsoaReferenceGeography } from "@/server/datasets/midlands-reference-geography";

export const MIDLANDS_FUEL_POVERTY_URL =
  "https://assets.publishing.service.gov.uk/media/6a02febf81a251700a20b42a/fuel-poverty-sub-regional-2026-2024-data-tables.xlsx";

export type MidlandsFuelPovertyValue = { areaId: string; value: number; sourceDate: "2024-03-31" };

export function buildMidlandsFuelPovertyValues(workbookBytes: ArrayBuffer, reference: MidlandsLsoaReferenceGeography): MidlandsFuelPovertyValue[] {
  const workbook = XLSX.read(workbookBytes, { type: "array" });
  const sheet = workbook.Sheets["Table 4"];
  if (!sheet) throw new Error("Fuel-poverty source is missing Table 4.");
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
  const headerIndex = rows.findIndex((row) => row.includes("LSOA Code") && row.includes("Proportion of households fuel poor (%)"));
  if (headerIndex < 0) throw new Error("Fuel-poverty source is missing the required LSOA headers.");
  const headers = rows[headerIndex].map(String);
  const codeIndex = headers.indexOf("LSOA Code");
  const valueIndex = headers.indexOf("Proportion of households fuel poor (%)");
  const expected = new Set(reference.expectedAreaIds);
  const values = new Map<string, MidlandsFuelPovertyValue>();
  for (const row of rows.slice(headerIndex + 1)) {
    const areaId = String(row[codeIndex] ?? "").trim();
    if (!areaId || !expected.has(areaId)) continue;
    const value = Number(row[valueIndex]);
    if (!Number.isFinite(value) || value < 0 || value > 100) throw new Error(`Invalid fuel-poverty percentage for '${areaId}'.`);
    if (values.has(areaId)) throw new Error(`Duplicate fuel-poverty LSOA code '${areaId}'.`);
    values.set(areaId, { areaId, value, sourceDate: "2024-03-31" });
  }
  const missing = reference.expectedAreaIds.filter((areaId) => !values.has(areaId));
  if (missing.length) throw new Error(`Fuel-poverty coverage missing ${missing.length} Midlands LSOAs (${missing.slice(0, 8).join(", ")}).`);
  return reference.expectedAreaIds.map((areaId) => values.get(areaId)!);
}

export async function fetchMidlandsFuelPovertyValues(reference: MidlandsLsoaReferenceGeography, userAgent: string) {
  const response = await fetch(MIDLANDS_FUEL_POVERTY_URL, { headers: { Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "User-Agent": userAgent } });
  if (!response.ok) throw new Error(`Request failed (${response.status}) for ${MIDLANDS_FUEL_POVERTY_URL}`);
  return buildMidlandsFuelPovertyValues(await response.arrayBuffer(), reference);
}

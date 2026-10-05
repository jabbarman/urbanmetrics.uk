import type { MidlandsLsoaReferenceGeography } from "@/server/datasets/midlands-reference-geography";

export const MIDLANDS_IMD_URL =
  "https://assets.publishing.service.gov.uk/media/691ded56d140bbbaa59a2a7d/File_7_IoD2025_All_Ranks_Scores_Deciles_Population_Denominators.csv";

export type MidlandsImdValue = { areaId: string; value: number; sourceDate: "2025-10-30" };

function parseCsvLine(line: string) {
  const values: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) { values.push(value); value = ""; }
    else value += character;
  }
  values.push(value);
  return values;
}

export function buildMidlandsImdValues(csvText: string, reference: MidlandsLsoaReferenceGeography): MidlandsImdValue[] {
  const [header, ...lines] = csvText.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (!header) throw new Error("IMD source is empty.");
  const columns = parseCsvLine(header);
  const codeIndex = columns.indexOf("LSOA code (2021)");
  const valueIndex = columns.indexOf("Index of Multiple Deprivation (IMD) Decile (where 1 is most deprived 10% of LSOAs)");
  if (codeIndex < 0 || valueIndex < 0) throw new Error("IMD source is missing the required LSOA code or decile column.");
  const expected = new Set(reference.expectedAreaIds);
  const values = new Map<string, MidlandsImdValue>();
  for (const line of lines) {
    const fields = parseCsvLine(line);
    const areaId = fields[codeIndex];
    if (!expected.has(areaId)) continue;
    const value = Number(fields[valueIndex]);
    if (!Number.isInteger(value) || value < 1 || value > 10) throw new Error(`Invalid IMD decile for '${areaId}'.`);
    if (values.has(areaId)) throw new Error(`Duplicate IMD LSOA code '${areaId}'.`);
    values.set(areaId, { areaId, value, sourceDate: "2025-10-30" });
  }
  const missing = reference.expectedAreaIds.filter((areaId) => !values.has(areaId));
  if (missing.length) throw new Error(`IMD coverage missing ${missing.length} Midlands LSOAs (${missing.slice(0, 8).join(", ")}).`);
  return reference.expectedAreaIds.map((areaId) => values.get(areaId)!);
}

export async function fetchMidlandsImdValues(reference: MidlandsLsoaReferenceGeography, userAgent: string) {
  const response = await fetch(MIDLANDS_IMD_URL, { headers: { Accept: "text/csv", "User-Agent": userAgent } });
  if (!response.ok) throw new Error(`Request failed (${response.status}) for ${MIDLANDS_IMD_URL}`);
  return buildMidlandsImdValues(await response.text(), reference);
}

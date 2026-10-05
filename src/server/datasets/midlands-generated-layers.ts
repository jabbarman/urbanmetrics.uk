import type { GeneratedReferenceJoinedLayer } from "@/server/datasets/types";
import type { MidlandsLsoaReferenceGeography } from "@/server/datasets/midlands-reference-geography";
import type { MidlandsImdValue } from "@/server/datasets/midlands-imd";
import type { MidlandsFuelPovertyValue } from "@/server/datasets/midlands-fuel-poverty";

export function buildMidlandsImdLayer(
  reference: MidlandsLsoaReferenceGeography,
  values: MidlandsImdValue[],
): GeneratedReferenceJoinedLayer {
  const numbers = values.map((entry) => entry.value);
  const ordered = [...values].sort((left, right) => left.value - right.value);
  const nameFor = (areaId: string) => reference.geojson.features.find((feature) => feature.properties.areaId === areaId)?.properties.areaName ?? areaId;
  return {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    layer: {
      id: "midlands-imd-2025",
      title: "IMD 2025 Overall Deprivation",
      shortLabel: "IMD decile",
      description: "Overall relative deprivation across Midlands LSOA 2021 neighbourhoods.",
      interpretation: { summary: "English IMD deprivation decile.", higherValuesMean: "Higher values mean less relative deprivation.", rankingTitle: "Least deprived areas" },
      compareGroup: "midlands-lsoa-2021",
      geographyLabel: "LSOA 2021",
      geographyVintage: "December 2021",
      unit: "decile",
      precision: 0,
      cadenceLabel: "Irregular",
      freshnessPolicy: { kind: "referenceOnly" },
      palette: ["#7b2d15", "#bf5a2a", "#e29c6d", "#f1d3bf", "#f9efe8"],
      legendBreaks: [2, 4, 6, 8],
      source: { kind: "reference_joined_file", provider: "MHCLG", publisher: "MHCLG", publicationUrl: "https://www.gov.uk/government/statistics/english-indices-of-deprivation-2025", fileUrl: "https://assets.publishing.service.gov.uk/media/691ded56d140bbbaa59a2a7d/File_7_IoD2025_All_Ranks_Scores_Deciles_Population_Denominators.csv", datasetTitle: "English indices of deprivation 2025", updateFrequency: "IRREGULAR", referenceGeographyId: reference.geographyId, licence: "Open Government Licence v3.0", caveat: "Deciles are relative to England.", dataProcessedAt: new Date().toISOString(), recordsFetched: values.length, latestSourceDate: "2025-10-30", fetchedAt: new Date().toISOString() },
      summary: { min: Math.min(...numbers), max: Math.max(...numbers), mean: numbers.reduce((sum, value) => sum + value, 0) / numbers.length, median: ordered[Math.floor(ordered.length / 2)].value, topAreas: ordered.slice(-5).reverse().map((entry) => ({ areaId: entry.areaId, areaName: nameFor(entry.areaId), value: entry.value })), bottomAreas: ordered.slice(0, 5).map((entry) => ({ areaId: entry.areaId, areaName: nameFor(entry.areaId), value: entry.value })) },
      referenceGeographyId: reference.geographyId,
      scopeId: reference.scopeId,
    },
    values: values.map((entry) => ({ ...entry, formattedValue: `${entry.value}` })),
  };
}

export function buildMidlandsFuelPovertyLayer(
  reference: MidlandsLsoaReferenceGeography,
  values: MidlandsFuelPovertyValue[],
): GeneratedReferenceJoinedLayer {
  const numbers = values.map((entry) => entry.value);
  const ordered = [...values].sort((left, right) => left.value - right.value);
  const nameFor = (areaId: string) => reference.geojson.features.find((feature) => feature.properties.areaId === areaId)?.properties.areaName ?? areaId;
  return {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    layer: {
      id: "midlands-fuel-poverty-2024",
      title: "Households In Fuel Poverty",
      shortLabel: "Fuel poverty",
      description: "Estimated proportion of households in fuel poverty across Midlands LSOA 2021 neighbourhoods.",
      interpretation: { summary: "Shows the modelled proportion of households in fuel poverty.", higherValuesMean: "Higher values mean a larger estimated share of households is in fuel poverty.", rankingTitle: "Areas with the highest estimated fuel poverty" },
      compareGroup: "midlands-lsoa-2021",
      geographyLabel: "LSOA 2021",
      geographyVintage: "December 2021",
      unit: "%",
      precision: 1,
      cadenceLabel: "Annual",
      freshnessPolicy: { kind: "maxAgeDays", days: 450 },
      palette: ["#fff3d9", "#f8d98b", "#ecb347", "#c97817", "#86460d"],
      legendBreaks: [5, 10, 15, 20],
      source: { kind: "reference_joined_file", provider: "DESNZ", publisher: "Department for Energy Security and Net Zero", publicationUrl: "https://www.gov.uk/government/statistics/sub-regional-fuel-poverty-data-2026-2024-data", fileUrl: "https://assets.publishing.service.gov.uk/media/6a02febf81a251700a20b42a/fuel-poverty-sub-regional-2026-2024-data-tables.xlsx", datasetTitle: "Sub-regional fuel poverty data 2026 (2024 data)", updateFrequency: "ANNUAL", referenceGeographyId: reference.geographyId, licence: "Open Government Licence v3.0", caveat: "Small-area estimates are modelled and should not be used to infer precise differences or trends.", dataProcessedAt: new Date().toISOString(), recordsFetched: values.length, latestSourceDate: "2024-03-31", fetchedAt: new Date().toISOString() },
      summary: { min: Math.min(...numbers), max: Math.max(...numbers), mean: numbers.reduce((sum, value) => sum + value, 0) / numbers.length, median: ordered[Math.floor(ordered.length / 2)].value, topAreas: ordered.slice(-5).reverse().map((entry) => ({ areaId: entry.areaId, areaName: nameFor(entry.areaId), value: entry.value })), bottomAreas: ordered.slice(0, 5).map((entry) => ({ areaId: entry.areaId, areaName: nameFor(entry.areaId), value: entry.value })) },
      referenceGeographyId: reference.geographyId,
      scopeId: reference.scopeId,
    },
    values: values.map((entry) => ({ ...entry, formattedValue: `${entry.value.toFixed(1)}%` })),
  };
}

import { afterEach, describe, expect, it, vi } from "vitest";

import { buildCsvDownloadRecords } from "@/server/datasets/source-adapters";
import type { LayerDefinition } from "@/server/datasets/types";

vi.mock("@/server/datasets/reference-geographies", () => ({
  normalizeNhsGeographyLookupValue: (value: string) => value.trim().replace(/\s+/g, " ").toUpperCase(),
  fetchSubIcbReferenceGeography: vi.fn(async () => ({
    schemaVersion: 1,
    generatedAt: "2026-03-15T00:00:00.000Z",
    geography: {
      id: "sub-icb",
      title: "Sub Integrated Care Board Locations",
      sourceUrl: "https://example.com/sub-icb.geojson",
      codeField: "SICBL23CD",
      nameField: "SICBL23NM",
    },
    geojson: {
      type: "FeatureCollection",
      features: [
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
      ],
    },
  })),
  buildReferenceGeographyLookup: vi.fn(() => ({
    schemaVersion: 1,
    generatedAt: "2026-03-15T00:00:00.000Z",
    geographyId: "sub-icb",
    lookupField: "areaName",
    items: [
      {
        lookupValue: "NHS Birmingham and Solihull ICB - 15E",
        normalizedLookupValue: "NHS BIRMINGHAM AND SOLIHULL ICB - 15E",
        areaId: "E38000001",
        areaName: "NHS Birmingham and Solihull ICB - 15E",
      },
    ],
  })),
}));

const layerDefinition: LayerDefinition = {
  id: "nhs-talking-therapies-wait-time",
  title: "Talking Therapies Mean Wait",
  shortLabel: "Therapy wait",
  description: "Mean wait in days for people accessing NHS Talking Therapies services.",
  interpretation: {
    summary: "Shows mean wait in days.",
    higherValuesMean: "Higher values mean longer waits.",
    rankingTitle: "Areas with the longest waits",
  },
  compareGroup: "sub-icb",
  geographyLabel: "Sub Integrated Care Board",
  geographyVintage: "Sub ICB 2023",
  unit: "days",
  precision: 1,
  cadenceLabel: "Monthly",
  freshnessPolicy: { kind: "maxAgeDays", days: 60 },
  palette: ["#ffffff"],
  source: {
    kind: "csv_download",
    provider: "NHS England",
    publisher: "NHS England",
    publicationUrl: "https://example.com/publication",
    fileUrl: "https://example.com/file.csv",
    fileFormat: "csv",
    datasetTitle: "Talking Therapies monthly activity and performance",
    updateFrequency: "MONTHLY",
    geographyId: "sub-icb",
    geographyField: "GROUP_TYPE",
    geographyValue: "SubICB",
    areaNameField: "ORG_NAME1",
    sourceDateField: "REPORTING_PERIOD_END",
    valueField: "MEASURE_VALUE_SUPPRESSED",
    suppressedValues: ["*"],
    measureIdField: "MEASURE_ID",
    measureId: "M048",
    licence: "OGL",
    caveat: "Test caveat",
  },
  fields: {
    areaId: "areaId",
    areaName: "areaName",
    value: "value",
    date: "sourceDate",
    geometry: "geometry",
    centroid: "centroid",
    localAuthorityName: "localAuthorityName",
    localAuthorityCode: "localAuthorityCode",
  },
};

describe("source adapters", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds normalized records from a CSV download source", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        text: async () =>
          [
            "REPORTING_PERIOD_START,REPORTING_PERIOD_END,GROUP_TYPE,ORG_CODE1,ORG_NAME1,MEASURE_ID,MEASURE_NAME,MEASURE_VALUE_SUPPRESSED",
            "2026-01-01,2026-01-31,SubICB,15E,NHS Birmingham and Solihull ICB - 15E,M048,Mean_WaitAccessingServices,20.4",
            "2026-01-01,2026-01-31,SubICB,15E,NHS Birmingham and Solihull ICB - 15E,M044,Count_WaitingForTreatmentOver18weeks,310",
          ].join("\n"),
      })),
    );

    const payload = await buildCsvDownloadRecords(layerDefinition, "test-agent/1.0");

    expect(payload.records).toHaveLength(1);
    expect(payload.records[0]).toMatchObject({
      areaId: "E38000001",
      areaName: "NHS Birmingham and Solihull ICB - 15E",
      value: 20.4,
      sourceDate: "2026-01-31",
      localAuthorityName: "Sub Integrated Care Board",
      localAuthorityCode: "E38000001",
    });
    expect(payload.metadata.metas.default.title).toBe("Talking Therapies monthly activity and performance");
  });
});

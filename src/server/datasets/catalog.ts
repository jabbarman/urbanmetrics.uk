import type { LayerDefinition } from "@/server/datasets/types";

const API_BASE = "https://www.cityobservatory.birmingham.gov.uk/api/explore/v2.1/catalog/datasets";
const DATASET_BASE = "https://www.cityobservatory.birmingham.gov.uk/explore/dataset";

function datasetUrls(datasetId: string) {
  return {
    datasetUrl: `${DATASET_BASE}/${datasetId}/`,
    datasetApiUrl: `${API_BASE}/${datasetId}`,
  };
}

export const layerDefinitions: LayerDefinition[] = [
  {
    id: "uc-in-work-rate",
    title: "Universal Credit Claimants In Employment",
    shortLabel: "UC in work",
    description:
      "Share of Universal Credit claimants who are in employment. Useful as a monthly economic stress and labour-market participation signal.",
    interpretation: {
      summary: "Shows the share of Universal Credit claimants who are already in employment.",
      higherValuesMean: "Higher values mean a larger share of claimants are in work.",
      rankingTitle: "Areas with the highest share of claimants in work",
    },
    compareGroup: "wmca-ward",
    geographyLabel: "WMCA ward",
    geographyVintage: "ward 2025",
    unit: "%",
    precision: 1,
    cadenceLabel: "Monthly",
    freshnessPolicy: { kind: "maxAgeDays", days: 60 },
    palette: ["#edf7fb", "#c8e4ef", "#88c6dc", "#2f89b8", "#0d4f76"],
    source: {
      provider: "Birmingham City Observatory API",
      publisher: "Department for Work and Pensions",
      apiBaseUrl: API_BASE,
      datasetId: "percentage-universal-credit-claimants-in-employment-wmca-wards-2025",
      ...datasetUrls("percentage-universal-credit-claimants-in-employment-wmca-wards-2025"),
      licence: "Open Government Licence v3.0 via Birmingham City Observatory metadata",
      caveat:
        "This is a claimant-based rate, not a share of the total working-age population.",
    },
    fields: {
      areaId: "areaidentifier",
      areaName: "arealabel",
      value: "value",
      date: "date",
      geometry: "geo_shape",
      centroid: "geo_point_2d",
      localAuthorityName: "local_authority_name",
      localAuthorityCode: "local_authority_code",
    },
  },
  {
    id: "imd-employment-score",
    title: "IMD Employment Score",
    shortLabel: "IMD employment",
    description:
      "Employment deprivation score from the Indices of Multiple Deprivation, surfaced at WMCA ward geography for visual comparison.",
    interpretation: {
      summary: "IMD stands for Indices of Multiple Deprivation. This employment score is a relative deprivation measure, not a direct unemployment rate.",
      higherValuesMean: "Higher values mean greater employment deprivation.",
      rankingTitle: "Most employment-deprived areas",
    },
    compareGroup: "wmca-ward",
    geographyLabel: "WMCA ward",
    geographyVintage: "ward 2025",
    unit: "%",
    precision: 1,
    cadenceLabel: "Irregular",
    freshnessPolicy: { kind: "referenceOnly" },
    palette: ["#f9efe8", "#f1d3bf", "#e29c6d", "#bf5a2a", "#7b2d15"],
    source: {
      provider: "Birmingham City Observatory API",
      publisher: "Department for Levelling Up, Housing & Communities",
      apiBaseUrl: API_BASE,
      datasetId: "imd-employment-score-wmca-wards-2025",
      ...datasetUrls("imd-employment-score-wmca-wards-2025"),
      licence: "Open Government Licence v3.0 via Birmingham City Observatory metadata",
      caveat:
        "IMD is a relative deprivation measure. Higher values indicate stronger employment deprivation and should not be read as a direct unemployment rate.",
    },
    fields: {
      areaId: "areaidentifier",
      areaName: "arealabel",
      value: "value",
      date: "date",
      geometry: "geo_shape",
      centroid: "geo_point_2d",
      localAuthorityName: "local_authority_name",
      localAuthorityCode: "local_authority_code",
    },
  },
  {
    id: "fuel-poverty-rate",
    title: "Households In Fuel Poverty",
    shortLabel: "Fuel poverty",
    description:
      "Estimated share of households in fuel poverty. Strong social-context overlay for comparison against labour and deprivation signals.",
    interpretation: {
      summary: "Shows the estimated share of households living in fuel poverty.",
      higherValuesMean: "Higher values mean a larger share of households are in fuel poverty.",
      rankingTitle: "Areas with the highest estimated fuel poverty",
    },
    compareGroup: "wmca-ward",
    geographyLabel: "WMCA ward",
    geographyVintage: "ward 2025",
    unit: "%",
    precision: 1,
    cadenceLabel: "Annual",
    freshnessPolicy: { kind: "maxAgeDays", days: 450 },
    palette: ["#fff3d9", "#f8d98b", "#ecb347", "#c97817", "#86460d"],
    source: {
      provider: "Birmingham City Observatory API",
      publisher: "Department for Business, Energy & Industrial Strategy",
      apiBaseUrl: API_BASE,
      datasetId: "percentage-households-in-fuel-poverty-wmca-wards",
      ...datasetUrls("percentage-households-in-fuel-poverty-wmca-wards"),
      licence: "Open Government Licence v3.0 via Birmingham City Observatory metadata",
      caveat:
        "Annual fuel-poverty estimates can lag current energy conditions and should be read as structural context rather than a real-time signal.",
    },
    fields: {
      areaId: "areaidentifier",
      areaName: "arealabel",
      value: "value",
      date: "date",
      geometry: "geo_shape",
      centroid: "geo_point_2d",
      localAuthorityName: "local_authority_name",
      localAuthorityCode: "local_authority_code",
    },
  },
  {
    id: "gva-all-industries",
    title: "Gross Value Added: All Industries",
    shortLabel: "GVA",
    description:
      "Smoothed gross value added at ward level, useful as a productivity and commercial intensity proxy.",
    interpretation: {
      summary: "Shows estimated gross value added, a proxy for local economic output rather than a direct business ledger.",
      higherValuesMean: "Higher values mean higher estimated economic output.",
      rankingTitle: "Areas with the highest estimated GVA",
    },
    compareGroup: "wmca-ward",
    geographyLabel: "WMCA ward",
    geographyVintage: "ward 2025",
    unit: "GBP million",
    precision: 0,
    cadenceLabel: "Annual",
    freshnessPolicy: { kind: "maxAgeDays", days: 450 },
    palette: ["#edf4e7", "#c9dfb3", "#8dbe74", "#4b8f41", "#24552d"],
    source: {
      provider: "Birmingham City Observatory API",
      publisher: "Office for National Statistics",
      apiBaseUrl: API_BASE,
      datasetId: "gross-value-added-gva-all-industries-wmca-wards-2025",
      ...datasetUrls("gross-value-added-gva-all-industries-wmca-wards-2025"),
      licence: "Open Government Licence v3.0 via Birmingham City Observatory metadata",
      caveat:
        "Ward-level GVA is modelled and smoothed. It should be used as indicative economic context, not as a precise local-business ledger.",
    },
    fields: {
      areaId: "areaidentifier",
      areaName: "arealabel",
      value: "value",
      date: "date",
      geometry: "geo_shape",
      centroid: "geo_point_2d",
      localAuthorityName: "local_authority_name",
      localAuthorityCode: "local_authority_code",
    },
  },
  {
    id: "travel-to-work-bicycle-rate",
    title: "Travel To Work By Bicycle",
    shortLabel: "Cycle commute",
    description:
      "Share of residents aged 16 to 74 who travel to work by bicycle. A transport-related overlay suitable for v1 while live TfWM layers remain phase 2 work.",
    interpretation: {
      summary: "Shows the share of residents aged 16 to 74 who usually travel to work by bicycle.",
      higherValuesMean: "Higher values mean a larger share of residents cycle to work.",
      rankingTitle: "Areas with the highest cycle-to-work share",
    },
    compareGroup: "wmca-ward",
    geographyLabel: "WMCA ward",
    geographyVintage: "ward 2025",
    unit: "%",
    precision: 1,
    cadenceLabel: "Decennial",
    freshnessPolicy: { kind: "referenceOnly" },
    palette: ["#ecfaf2", "#bfe8cb", "#7cc596", "#2f8b64", "#14503a"],
    source: {
      provider: "Birmingham City Observatory API",
      publisher: "Office for National Statistics",
      apiBaseUrl: API_BASE,
      datasetId: "travel-to-work-by-bicycle-percentage-of-pop-aged-16-74-wmca-wards-2025",
      ...datasetUrls("travel-to-work-by-bicycle-percentage-of-pop-aged-16-74-wmca-wards-2025"),
      licence: "Open Government Licence v3.0 via Birmingham City Observatory metadata",
      caveat:
        "This is a Census travel-to-work indicator, not a live transport-services feed. It captures transport behaviour rather than service performance.",
    },
    fields: {
      areaId: "areaidentifier",
      areaName: "arealabel",
      value: "value",
      date: "date",
      geometry: "geo_shape",
      centroid: "geo_point_2d",
      localAuthorityName: "local_authority_name",
      localAuthorityCode: "local_authority_code",
    },
  },
];

export const layerDefinitionMap = new Map(layerDefinitions.map((layer) => [layer.id, layer]));

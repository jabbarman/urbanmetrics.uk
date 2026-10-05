export type GeographyScope = {
  id: "midlands";
  label: string;
  description: string;
  regionCodes: readonly ["E12000004", "E12000005"];
  primaryGeography: {
    id: "lsoa-2021";
    label: string;
    vintage: string;
  };
  initialViewport: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
};

/**
 * The approved product scope is the two official English regions. The reference
 * adapter validates its source lookup fields before these codes are applied.
 */
export const midlandsGeographyScope: GeographyScope = {
  id: "midlands",
  label: "Midlands",
  description: "East Midlands and West Midlands, using official English-region boundaries.",
  regionCodes: ["E12000004", "E12000005"],
  primaryGeography: {
    id: "lsoa-2021",
    label: "LSOA 2021",
    vintage: "December 2021",
  },
  initialViewport: {
    longitude: -1.78,
    latitude: 52.72,
    zoom: 7.1,
  },
};

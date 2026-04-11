import type { Route } from "next";

export type WorkspaceId = "regional-context" | "health-access";

export type WorkspaceDefinition = {
  id: WorkspaceId;
  href: Route;
  title: string;
  shortTitle: string;
  description: string;
  geographyLabel: string;
  introEyebrow: string;
  introTitle: string;
  introDescription: string;
  mapHeading: string;
  mapDescription: string;
  sourceCaveat: string;
  allowedLayerIds: string[];
  defaultPrimaryLayerId: string;
  defaultCompareLayerId: string;
};

export const workspaceDefinitions: WorkspaceDefinition[] = [
  {
    id: "regional-context",
    href: "/regional-context" as Route,
    title: "Regional Context",
    shortTitle: "Regional Context",
    description:
      "Economic, deprivation, and civic context across the West Midlands at ward geography.",
    geographyLabel: "WMCA ward",
    introEyebrow: "Regional Context",
    introTitle: "Explore labour, deprivation, and civic context at ward geography",
    introDescription:
      "This workspace keeps the original Urban Metrics stack together so users can compare local economic and civic indicators without crossing into health-service geography.",
    mapHeading: "Compare regional context signals without losing the local geography",
    mapDescription:
      "The primary fill layer sets the base story. A second local-area metric can be drawn as centroid bubbles so overlapping hotspots and outliers remain legible.",
    sourceCaveat:
      "This workspace uses geometry-rich Birmingham City Observatory datasets to keep the local-area context stack robust, transparent, and inexpensive to operate.",
    allowedLayerIds: [
      "uc-in-work-rate",
      "imd-employment-score",
      "fuel-poverty-rate",
      "gva-all-industries",
      "travel-to-work-bicycle-rate",
    ],
    defaultPrimaryLayerId: "uc-in-work-rate",
    defaultCompareLayerId: "imd-employment-score",
  },
  {
    id: "health-access",
    href: "/health-access" as Route,
    title: "Health Access",
    shortTitle: "Health Access",
    description:
      "Talking Therapies and future health/service indicators, currently presented at Sub Integrated Care Board geography.",
    geographyLabel: "Sub Integrated Care Board",
    introEyebrow: "Health Access",
    introTitle: "Explore Talking Therapies access and service signals at Sub ICB geography",
    introDescription:
      "This workspace keeps the health and service-access layers together so waits, access performance, and supporting therapy context can be interpreted without mixing geographies or policy domains.",
    mapHeading: "Compare Talking Therapies access signals without losing the service geography",
    mapDescription:
      "The primary fill layer sets the service-access story. A second health metric can be drawn as centroid bubbles so stronger and weaker signals remain legible within the same Sub ICB footprint.",
    sourceCaveat:
      "This workspace uses official NHS publication files joined to Sub ICB reference geography. The annual therapy-type panel is supporting regional context, not a Sub ICB performance layer.",
    allowedLayerIds: ["nhs-talking-therapies-wait-time", "nhs-talking-therapies-six-week-access"],
    defaultPrimaryLayerId: "nhs-talking-therapies-wait-time",
    defaultCompareLayerId: "nhs-talking-therapies-six-week-access",
  },
];

export function getWorkspaceDefinition(workspaceId: WorkspaceId) {
  return workspaceDefinitions.find((workspace) => workspace.id === workspaceId) ?? null;
}

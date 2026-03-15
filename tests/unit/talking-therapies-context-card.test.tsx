import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TalkingTherapiesContextCard } from "@/features/dashboard/talking-therapies-context-card";
import type { TalkingTherapiesTherapyTypeContext } from "@/server/datasets/types";

const context: TalkingTherapiesTherapyTypeContext = {
  schemaVersion: 1,
  generatedAt: "2026-03-15T00:00:00.000Z",
  id: "talking-therapies-therapy-types",
  title: "Talking Therapies therapy-type context",
  reportingPeriod: "2024-25",
  geographyLabel: "Midlands Commissioning Region",
  source: {
    publisher: "NHS England",
    publicationUrl: "https://example.com/publication",
    fileUrl: "https://example.com/file.zip",
    datasetTitle: "Therapy Based Outcomes Table 4-2.csv",
    updateFrequency: "ANNUAL",
    latestSourceDate: "2024-25",
    dataProcessedAt: "2026-03-15T00:00:00.000Z",
    fetchedAt: "2026-03-15T00:00:00.000Z",
    caveat: "Annual regional context only.",
  },
  therapies: [
    {
      therapyType: "Cognitive Behaviour Therapy (CBT)",
      coursesOfTherapy: 53725,
      finishingCourseTreatment: 63615,
      recoveryRate: 47,
      improvementRate: 64,
    },
    {
      therapyType: "Counselling for Depression",
      coursesOfTherapy: 18920,
      finishingCourseTreatment: 21160,
      recoveryRate: 51,
      improvementRate: 65,
    },
  ],
};

describe("TalkingTherapiesContextCard", () => {
  it("renders Midlands therapy-type context rows", () => {
    render(<TalkingTherapiesContextCard context={context} />);

    expect(screen.getByText("Midlands annual therapy outcomes")).toBeInTheDocument();
    expect(screen.getByText("Cognitive Behaviour Therapy (CBT)")).toBeInTheDocument();
    expect(screen.getByText("53,725 completed courses")).toBeInTheDocument();
    expect(screen.getByText("Recovery 47%")).toBeInTheDocument();
    expect(screen.getByText("Improvement 64%")).toBeInTheDocument();
  });
});

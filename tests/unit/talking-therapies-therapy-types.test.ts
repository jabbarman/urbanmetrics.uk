import { describe, expect, it } from "vitest";

import { buildTalkingTherapiesTherapyTypeContextFromCsv } from "@/server/datasets/talking-therapies-therapy-types";

const csvText = `OrganisationType,OrganisationCode,OrganisationName,Diagnosis,TherapyType,Count_TotalFinishingCourseTreatment,Count_CoursesOfTherapy,Percentage_TherRecovery,Percentage_TherImprovement
Commissioning Region,Y60,MIDLANDS COMMISSIONING REGION,Total,Cognitive Behaviour Therapy (CBT),63615,53725,47,64
Commissioning Region,Y60,MIDLANDS COMMISSIONING REGION,Total,Counselling for Depression,21160,18920,51,65
Commissioning Region,Y60,MIDLANDS COMMISSIONING REGION,Total,Guided Self Help (Book),31940,18175,38,55
Commissioning Region,Y56,NORTH WEST COMMISSIONING REGION,Total,Cognitive Behaviour Therapy (CBT),50000,40000,42,60
Commissioning Region,Y60,MIDLANDS COMMISSIONING REGION,Depression,Cognitive Behaviour Therapy (CBT),100,90,45,61
Commissioning Region,Y60,MIDLANDS COMMISSIONING REGION,Total,Collaborative care,1950,465,45,60
Commissioning Region,Y60,MIDLANDS COMMISSIONING REGION,Total,Suppressed example,*,*,*,*
`;

describe("Talking Therapies therapy-type context", () => {
  it("keeps only Midlands commissioning-region total rows and sorts by completed courses", () => {
    const context = buildTalkingTherapiesTherapyTypeContextFromCsv(csvText, "2026-03-15T00:00:00.000Z");

    expect(context.geographyLabel).toBe("Midlands Commissioning Region");
    expect(context.reportingPeriod).toBe("2024-25");
    expect(context.therapies).toHaveLength(4);
    expect(context.therapies[0]).toEqual({
      therapyType: "Cognitive Behaviour Therapy (CBT)",
      coursesOfTherapy: 53725,
      finishingCourseTreatment: 63615,
      recoveryRate: 47,
      improvementRate: 64,
    });
    expect(context.therapies.at(-1)?.therapyType).toBe("Collaborative care");
  });
});

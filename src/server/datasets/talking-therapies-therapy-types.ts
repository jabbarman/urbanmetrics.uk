import { execFile } from "node:child_process";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { parseCsv } from "@/server/datasets/source-adapters";
import type { TalkingTherapiesTherapyTypeContext } from "@/server/datasets/types";

const execFileAsync = promisify(execFile);

const THERAPY_TYPES_PUBLICATION_URL =
  "https://digital.nhs.uk/data-and-information/publications/statistical/nhs-talking-therapies-for-anxiety-and-depression-annual-reports/2024-25/therapy-based-outcomes";
const THERAPY_TYPES_FILE_URL = "https://files.digital.nhs.uk/B7/464F54/ther-based-outcomes2425-2.zip";
const THERAPY_TYPES_ZIP_MEMBER = "Therapy Based Outcomes Table 4-2.csv";
const MIDLANDS_COMMISSIONING_REGION_CODE = "Y60";

function parseNumber(value: string, fieldName: string) {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed === "*") {
    return null;
  }

  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    throw new Error(`Expected numeric value for '${fieldName}', received '${value}'.`);
  }

  return parsed;
}

function normalizeTherapyType(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

async function unzipMemberText(zipPath: string, memberPath: string) {
  const { stdout } = await execFileAsync("unzip", ["-p", zipPath, memberPath], {
    maxBuffer: 16 * 1024 * 1024,
  });
  return stdout;
}

export function buildTalkingTherapiesTherapyTypeContextFromCsv(
  csvText: string,
  fetchedAt = new Date().toISOString(),
): TalkingTherapiesTherapyTypeContext {
  const rows = parseCsv(csvText);
  const therapies = rows
    .filter(
      (row) =>
        row.OrganisationType === "Commissioning Region" &&
        row.OrganisationCode === MIDLANDS_COMMISSIONING_REGION_CODE &&
        row.Diagnosis === "Total",
    )
    .map((row) => {
      const coursesOfTherapy = parseNumber(row.Count_CoursesOfTherapy ?? "", "Count_CoursesOfTherapy");
      const finishingCourseTreatment = parseNumber(
        row.Count_TotalFinishingCourseTreatment ?? "",
        "Count_TotalFinishingCourseTreatment",
      );
      const recoveryRate = parseNumber(row.Percentage_TherRecovery ?? "", "Percentage_TherRecovery");
      const improvementRate = parseNumber(row.Percentage_TherImprovement ?? "", "Percentage_TherImprovement");

      if (
        coursesOfTherapy === null ||
        finishingCourseTreatment === null ||
        recoveryRate === null ||
        improvementRate === null
      ) {
        return null;
      }

      return {
        therapyType: normalizeTherapyType(row.TherapyType ?? ""),
        coursesOfTherapy,
        finishingCourseTreatment,
        recoveryRate,
        improvementRate,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((left, right) => right.coursesOfTherapy - left.coursesOfTherapy);

  if (therapies.length === 0) {
    throw new Error("No Midlands commissioning-region therapy-type rows were found in the annual Talking Therapies file.");
  }

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    id: "talking-therapies-therapy-types",
    title: "Talking Therapies therapy-type context",
    reportingPeriod: "2024-25",
    geographyLabel: "Midlands Commissioning Region",
    source: {
      publisher: "NHS England",
      publicationUrl: THERAPY_TYPES_PUBLICATION_URL,
      fileUrl: THERAPY_TYPES_FILE_URL,
      datasetTitle: THERAPY_TYPES_ZIP_MEMBER,
      updateFrequency: "ANNUAL",
      latestSourceDate: "2024-25",
      dataProcessedAt: fetchedAt,
      fetchedAt,
      caveat:
        "Annual therapy-based outcomes for courses of therapy in the Midlands Commissioning Region. This is regional context, not a Sub ICB breakdown, and it is not directly comparable with the monthly access and wait layers.",
    },
    therapies,
  };
}

export async function buildTalkingTherapiesTherapyTypeContext(
  cacheDir: string,
  userAgent: string,
): Promise<TalkingTherapiesTherapyTypeContext> {
  const response = await fetch(THERAPY_TYPES_FILE_URL, {
    headers: {
      Accept: "application/zip, application/octet-stream",
      "User-Agent": userAgent,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${THERAPY_TYPES_FILE_URL}`);
  }

  const fetchedAt = new Date().toISOString();
  const zipPath = path.join(cacheDir, "talking-therapies-therapy-types.zip");
  const zipBuffer = Buffer.from(await response.arrayBuffer());
  await writeFile(zipPath, zipBuffer);

  const csvText = await unzipMemberText(zipPath, THERAPY_TYPES_ZIP_MEMBER);
  return buildTalkingTherapiesTherapyTypeContextFromCsv(csvText, fetchedAt);
}

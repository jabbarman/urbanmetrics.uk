import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { describeStatusHealth, evaluateFreshness, formatValue, overallStatusHealth, quantileBreaks } from "@/server/datasets/utils";

describe("dataset utilities", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-08T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats percentage values", () => {
    expect(formatValue(38.8, "%", 1)).toBe("38.8%");
  });

  it("creates ascending quantile breaks", () => {
    expect(quantileBreaks([1, 5, 9, 12, 18, 30], 4)).toEqual([5, 9, 12]);
  });

  it("flags annual source periods as stale when max age is exceeded", () => {
    const stale = evaluateFreshness({ kind: "maxAgeDays", days: 450 }, "2023");

    expect(stale.status).toBe("stale");
    expect(stale.message).toMatch(/450 days/);
  });

  it("treats recent monthly source periods as fresh", () => {
    const fresh = evaluateFreshness({ kind: "maxAgeDays", days: 60 }, "2026-02");

    expect(fresh.status).toBe("ok");
  });

  it("allows for publication lag on monthly official statistics when the threshold is wider", () => {
    vi.setSystemTime(new Date("2026-04-12T00:00:00Z"));

    const fresh = evaluateFreshness({ kind: "maxAgeDays", days: 90 }, "2026-01-31");

    expect(fresh.status).toBe("ok");
  });

  it("warns when the source period cannot be parsed", () => {
    const warning = evaluateFreshness({ kind: "maxAgeDays", days: 60 }, "FY2025/26");

    expect(warning.status).toBe("warning");
    expect(warning.message).toMatch(/Unable to evaluate freshness/);
  });

  it("derives workspace health from the supplied layer subset", () => {
    expect(
      overallStatusHealth({
        generatedAt: "2026-04-12T00:00:00Z",
        layers: [
          {
            id: "layer-a",
            title: "Layer A",
            status: "warning",
            dataProcessedAt: "2026-04-12T00:00:00Z",
            latestSourceDate: "2025",
            updateFrequency: "IRREG",
            recordsFetched: 1,
            message: "Reference dataset; freshness tracked for visibility only.",
          },
        ],
      }),
    ).toBe("warning");
  });

  it("softens degraded status wording for workspace headers", () => {
    expect(describeStatusHealth("degraded")).toEqual({
      label: "Upstream delay",
      summary:
        "At least one source in this workspace is delayed or incomplete upstream. The layers remain available, and the full cross-product operational view remains on the service status page.",
    });
  });
});

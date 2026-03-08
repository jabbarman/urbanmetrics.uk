import { describe, expect, it } from "vitest";

import { evaluateFreshness, formatValue, quantileBreaks } from "@/server/datasets/utils";

describe("dataset utilities", () => {
  it("formats percentage values", () => {
    expect(formatValue(38.8, "%", 1)).toBe("38.8%");
  });

  it("creates ascending quantile breaks", () => {
    expect(quantileBreaks([1, 5, 9, 12, 18, 30], 4)).toEqual([5, 9, 12]);
  });

  it("flags stale datasets when max age is exceeded", () => {
    const stale = evaluateFreshness(
      { kind: "maxAgeDays", days: 10 },
      new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    );

    expect(stale.status).toBe("stale");
  });
});

import type { FreshnessPolicy, GeneratedStatus } from "@/server/datasets/types";

export function formatValue(value: number, unit: string, precision: number) {
  const formatter = new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: precision,
    minimumFractionDigits: precision,
  });

  if (unit === "%") {
    return `${formatter.format(value)}%`;
  }

  if (unit === "GBP million") {
    return `£${formatter.format(value)}m`;
  }

  return `${formatter.format(value)} ${unit}`.trim();
}

export function quantileBreaks(values: number[], steps = 5) {
  const sorted = [...values].sort((a, b) => a - b);
  const breaks = new Set<number>();

  for (let index = 1; index < steps; index += 1) {
    const position = Math.floor((index / steps) * (sorted.length - 1));
    breaks.add(sorted[position]);
  }

  return [...breaks].sort((a, b) => a - b);
}

export function mean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

export function sourceDateSortWeight(value: string) {
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-").map(Number);
    return year * 100 + month;
  }

  if (/^\d{4}$/.test(value)) {
    return Number(value) * 100;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function sourceDateToTimestamp(value: string) {
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-").map(Number);
    return Date.UTC(year, month, 0, 23, 59, 59, 999);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return Date.UTC(year, month - 1, day, 23, 59, 59, 999);
  }

  if (/^\d{4}$/.test(value)) {
    return Date.UTC(Number(value), 12, 0, 23, 59, 59, 999);
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function evaluateFreshness(policy: FreshnessPolicy, sourceDate: string) {
  if (policy.kind === "referenceOnly") {
    return { status: "warning" as const, message: "Reference dataset; freshness tracked for visibility only." };
  }

  const sourceTimestamp = sourceDateToTimestamp(sourceDate);
  if (sourceTimestamp === null) {
    return {
      status: "warning" as const,
      message: `Unable to evaluate freshness from source period '${sourceDate}'.`,
    };
  }

  const ageMs = Date.now() - sourceTimestamp;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (ageDays <= policy.days) {
    return { status: "ok" as const, message: `Latest source period is within ${policy.days} days.` };
  }

  return {
    status: "stale" as const,
    message: `Latest source period exceeded ${policy.days} days (${Math.round(ageDays)} days observed).`,
  };
}

export function overallStatusHealth(status: GeneratedStatus) {
  if (status.layers.some((layer) => layer.status === "stale")) {
    return "degraded" as const;
  }

  if (status.layers.some((layer) => layer.status === "warning")) {
    return "warning" as const;
  }

  return "ok" as const;
}

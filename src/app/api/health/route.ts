import { NextResponse } from "next/server";

import { loadStatus } from "@/server/datasets/load-generated";
import { overallStatusHealth } from "@/server/datasets/utils";

export async function GET() {
  const status = await loadStatus();

  return NextResponse.json({
    status: overallStatusHealth(status),
    generatedAt: status.generatedAt,
    layers: status.layers,
  });
}

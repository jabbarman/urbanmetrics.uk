"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { GeneratedLayer } from "@/server/datasets/types";
import { formatValue } from "@/server/datasets/utils";

type RankingChartProps = {
  layer: GeneratedLayer | null;
};

export function RankingChart({ layer }: RankingChartProps) {
  if (!layer) {
    return (
      <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
        <h2 className="text-lg font-semibold text-slate-950">Top areas</h2>
        <p className="mt-4 text-sm text-slate-600">Loading the ranking view.</p>
      </section>
    );
  }

  const data = layer.layer.summary.topAreas.map((area) => ({
    name: area.areaName,
    value: area.value,
  }));

  return (
    <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Rankings</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">{layer.layer.interpretation.rankingTitle}</h2>
        </div>
        <p className="max-w-[15rem] text-right text-xs text-slate-500">Top five wards by the active primary layer. Use the compare selector to switch the ranking context.</p>
      </div>
      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 16 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={110} tick={{ fill: "#334155", fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: "rgba(13, 79, 118, 0.08)" }}
              formatter={(value: number) => formatValue(value, layer.layer.unit, layer.layer.precision)}
            />
            <Bar dataKey="value" radius={[999, 999, 999, 999]} fill={layer.layer.palette.at(-1) ?? "#0d4f76"} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

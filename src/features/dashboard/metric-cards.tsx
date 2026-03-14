import { formatValue } from "@/server/datasets/utils";
import type { CatalogEntry, GeneratedStatus } from "@/server/datasets/types";

type MetricCardsProps = {
  catalog: CatalogEntry[];
  status: GeneratedStatus["layers"];
  activeLayer: CatalogEntry | null;
};

export function MetricCards({ catalog, status, activeLayer }: MetricCardsProps) {
  const okCount = status.filter((layer) => layer.status === "ok").length;
  const warningCount = status.filter((layer) => layer.status !== "ok").length;

  return (
    <div className="grid gap-3 md:grid-cols-4">
      <article className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Tracked layers</p>
        <p className="mt-3 text-3xl font-semibold text-slate-950">{catalog.length}</p>
        <p className="mt-2 text-sm text-slate-600">Ward-scale compare layers generated for the map workspace.</p>
      </article>
      <article className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Healthy upstreams</p>
        <p className="mt-3 text-3xl font-semibold text-slate-950">{okCount}</p>
        <p className="mt-2 text-sm text-slate-600">{warningCount} layers are reference-only or need operator attention.</p>
      </article>
      <article className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Primary geography</p>
        <p className="mt-3 text-2xl font-semibold text-slate-950">WMCA wards</p>
        <p className="mt-2 text-sm text-slate-600">Public-facing, fast to render, and consistent across the initial compare stack.</p>
      </article>
      <article className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Current focus</p>
        <p className="mt-3 text-lg font-semibold text-slate-950">{activeLayer?.title ?? "Loading layer"}</p>
        <p className="mt-2 text-sm text-slate-600">
          {activeLayer
            ? `${activeLayer.interpretation.higherValuesMean} Median ${formatValue(
                activeLayer.summary.median,
                activeLayer.unit,
                activeLayer.precision,
              )}.`
            : "Waiting for the first layer to load."}
        </p>
      </article>
    </div>
  );
}

import type { GeneratedLayer } from "@/server/datasets/types";

type AreaInspectorProps = {
  selectedAreaId: string | null;
  layers: GeneratedLayer[];
};

export function AreaInspector({ selectedAreaId, layers }: AreaInspectorProps) {
  if (!selectedAreaId) {
    return (
      <aside className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Area summary</p>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">Click a ward on the map</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The side panel compares the selected ward across every loaded layer, including source dates and caveats.
        </p>
      </aside>
    );
  }

  const records = layers
    .map((layer) => {
      const feature = layer.geojson.features.find((item) => item.properties.areaId === selectedAreaId);
      return feature ? { layer, feature } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const first = records[0]?.feature.properties;

  if (!first) {
    return null;
  }

  return (
    <aside className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Area summary</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-950">{first.areaName}</h2>
      <p className="mt-1 text-sm text-slate-500">{first.localAuthorityName}</p>
      <div className="mt-6 space-y-3">
        {records.map(({ layer, feature }) => (
          <div key={layer.layer.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{layer.layer.title}</p>
                <p className="text-xs text-slate-500">{layer.layer.source.latestSourceDate} · {layer.layer.cadenceLabel}</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{layer.layer.interpretation.higherValuesMean}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-slate-950">{feature.properties.formattedValue}</p>
                <p className="mt-1 text-xs text-slate-500">{feature.properties.valueLabel}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

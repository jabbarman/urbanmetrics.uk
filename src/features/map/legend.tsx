import type { CatalogEntry } from "@/server/datasets/types";

type LegendProps = {
  primaryLayer: CatalogEntry | null;
  compareLayer: CatalogEntry | null;
};

function legendRows(layer: CatalogEntry) {
  const breaks = [Number.NEGATIVE_INFINITY, ...layer.legendBreaks];

  return layer.palette.map((color, index) => {
    const lowerBound = breaks[index];
    const upperBound = layer.legendBreaks[index];

    const label =
      index === 0
        ? `Below ${upperBound.toFixed(layer.precision)}`
        : upperBound === undefined
          ? `${lowerBound.toFixed(layer.precision)}+`
          : `${lowerBound.toFixed(layer.precision)}–${upperBound.toFixed(layer.precision)}`;

    return { color, label };
  });
}

export function Legend({ primaryLayer, compareLayer }: LegendProps) {
  if (!primaryLayer) {
    return null;
  }

  return (
    <section className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Primary legend</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">{primaryLayer.title}</h2>
          <div className="mt-4 grid gap-2">
            {legendRows(primaryLayer).map((row) => (
              <div key={`${primaryLayer.id}-${row.label}`} className="flex items-center gap-3 text-sm text-slate-700">
                <span className="h-4 w-4 rounded-full border border-slate-200" style={{ backgroundColor: row.color }} />
                <span>{row.label}{primaryLayer.unit === "%" ? "%" : ""}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Compare overlay</p>
          {compareLayer ? (
            <>
              <h2 className="mt-2 text-lg font-semibold text-slate-950">{compareLayer.title}</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                The compare layer renders as centroid bubbles over the primary fill so users can spot where strong and weak signals overlap without losing the base geography.
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm leading-6 text-slate-600">Choose a secondary layer to render centroid bubbles on top of the primary choropleth.</p>
          )}
        </div>
      </div>
    </section>
  );
}

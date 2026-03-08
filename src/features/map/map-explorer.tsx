"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { AreaInspector } from "@/features/dashboard/area-inspector";
import { MetricCards } from "@/features/dashboard/metric-cards";
import { RankingChart } from "@/features/dashboard/ranking-chart";
import { Legend } from "@/features/map/legend";
import { MapView } from "@/features/map/map-view";
import { cn } from "@/components/cn";
import type { CatalogEntry, GeneratedLayer, GeneratedStatus } from "@/server/datasets/types";

type MapExplorerProps = {
  catalog: CatalogEntry[];
  status: GeneratedStatus["layers"];
};

async function fetchLayer(layerId: string) {
  const response = await fetch(`/generated/layers/${layerId}.json`);

  if (!response.ok) {
    throw new Error(`Failed to load layer '${layerId}'.`);
  }

  return (await response.json()) as GeneratedLayer;
}

export function MapExplorer({ catalog, status }: MapExplorerProps) {
  const [layersById, setLayersById] = useState<Record<string, GeneratedLayer>>({});
  const [primaryLayerId, setPrimaryLayerId] = useState(catalog[0]?.id ?? "");
  const [compareLayerId, setCompareLayerId] = useState(catalog[1]?.id ?? "");
  const [opacity, setOpacity] = useState(0.78);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadLayers() {
      setLoading(true);
      setError(null);

      try {
        const entries = await Promise.all(catalog.map((entry) => fetchLayer(entry.id)));
        if (cancelled) {
          return;
        }

        const nextState = Object.fromEntries(entries.map((entry) => [entry.layer.id, entry]));
        setLayersById(nextState);
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : "Unknown layer loading error.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadLayers();

    return () => {
      cancelled = true;
    };
  }, [catalog]);

  const primaryLayer = primaryLayerId ? layersById[primaryLayerId] ?? null : null;
  const compareLayer = compareLayerId && compareLayerId !== primaryLayerId ? layersById[compareLayerId] ?? null : null;
  const compareOptions = catalog.filter((entry) => entry.id !== primaryLayerId);
  const loadedLayers = Object.values(layersById);

  const selectedCatalogEntry = useMemo(
    () => catalog.find((entry) => entry.id === primaryLayerId) ?? null,
    [catalog, primaryLayerId],
  );

  return (
    <div className="space-y-6">
      <MetricCards activeLayer={selectedCatalogEntry} catalog={catalog} status={status} />
      <div className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)_22rem]">
        <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Layer controls</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Choose what the map emphasises</h2>
            </div>
            <Link className="text-sm font-medium text-sky-700 hover:text-sky-900" href="/status">
              Status
            </Link>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-900" htmlFor="primary-layer">
                Primary fill layer
              </label>
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400"
                id="primary-layer"
                onChange={(event) => setPrimaryLayerId(event.target.value)}
                value={primaryLayerId}
              >
                {catalog.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900" htmlFor="compare-layer">
                Secondary compare layer
              </label>
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400"
                id="compare-layer"
                onChange={(event) => setCompareLayerId(event.target.value)}
                value={compareLayerId}
              >
                {compareOptions.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm font-medium text-slate-900">
                <label htmlFor="opacity">Primary opacity</label>
                <span>{Math.round(opacity * 100)}%</span>
              </div>
              <input
                className="mt-3 h-2 w-full accent-sky-700"
                id="opacity"
                max="0.95"
                min="0.25"
                onChange={(event) => setOpacity(Number(event.target.value))}
                step="0.05"
                type="range"
                value={opacity}
              />
            </div>

            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span>Show ward boundaries</span>
              <input checked={showBoundaries} onChange={(event) => setShowBoundaries(event.target.checked)} type="checkbox" />
            </label>

            <div className="space-y-2 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Source caveat</p>
              <p className="text-sm leading-6 text-slate-600">
                This v1 uses geometry-rich Birmingham City Observatory datasets to keep the first release robust and cheap. Live TfWM service overlays are planned once credentials and rate-limit handling are in place.
              </p>
            </div>

            <div className="space-y-3">
              {status.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200/80 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em]",
                        item.status === "ok" && "bg-emerald-100 text-emerald-700",
                        item.status === "warning" && "bg-amber-100 text-amber-700",
                        item.status === "stale" && "bg-rose-100 text-rose-700",
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{item.message}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <MapView
            compareLayer={compareLayer}
            onSelectArea={setSelectedAreaId}
            opacity={opacity}
            primaryLayer={primaryLayer}
            selectedAreaId={selectedAreaId}
            showBoundaries={showBoundaries}
          />
          <Legend compareLayer={compareLayer?.layer ?? null} primaryLayer={primaryLayer?.layer ?? null} />
          <RankingChart layer={primaryLayer} />
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
              <p className="text-sm text-slate-600">Loading generated layers.</p>
            </div>
          ) : null}
          {error ? (
            <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
              {error}
            </div>
          ) : null}
          <AreaInspector layers={loadedLayers} selectedAreaId={selectedAreaId} />
          <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Active layer notes</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950">{primaryLayer?.layer.title ?? "Waiting for data"}</h2>
            <dl className="mt-5 space-y-4 text-sm text-slate-600">
              <div>
                <dt className="font-medium text-slate-900">Source</dt>
                <dd>{primaryLayer?.layer.source.publisher ?? "-"}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-900">Latest source period</dt>
                <dd>{primaryLayer?.layer.source.latestSourceDate ?? "-"}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-900">Processed</dt>
                <dd>{primaryLayer?.layer.source.dataProcessedAt ?? "-"}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-900">Caveat</dt>
                <dd>{primaryLayer?.layer.source.caveat ?? "-"}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

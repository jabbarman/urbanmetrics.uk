import Link from "next/link";

import { MapExplorer } from "@/features/map/map-explorer";
import { siteCopy } from "@/content/site";
import { loadCatalog, loadStatus } from "@/server/datasets/load-generated";
import { overallStatusHealth } from "@/server/datasets/utils";

export default async function HomePage() {
  const [catalog, status] = await Promise.all([loadCatalog(), loadStatus()]);
  const serviceHealth = overallStatusHealth(status);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 py-6 md:px-8 lg:px-10">
      <header className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-[rgba(255,255,255,0.78)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur md:p-10 lg:p-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="font-[var(--font-display)] text-xs uppercase tracking-[0.38em] text-sky-800">Regional intelligence platform</p>
            <h1 className="mt-4 max-w-4xl font-[var(--font-display)] text-4xl font-bold tracking-tight text-slate-950 md:text-5xl lg:text-6xl">
              {siteCopy.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">{siteCopy.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800" href="#map-workspace">
                Open the map workspace
              </Link>
              <Link className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-sky-500 hover:text-sky-700" href="/status">
                View service status
              </Link>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3 lg:w-[32rem] lg:grid-cols-1">
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Operational status</p>
              <p className="mt-2 text-xl font-semibold capitalize text-slate-950">{serviceHealth}</p>
              <p className="mt-2 text-sm text-slate-600">Generated data, health endpoint, and source freshness are tracked together.</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Initial overlay stack</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{catalog.length} ward layers</p>
              <p className="mt-2 text-sm text-slate-600">Economic, deprivation, civic-pressure, and transport-behaviour signals in one view.</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Built for extension</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">AI-first repo</p>
              <p className="mt-2 text-sm text-slate-600">Docs, adapters, health checks, and release rules are already part of the project shape.</p>
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-3 lg:grid-cols-3">
          {siteCopy.highlights.map((highlight) => (
            <div key={highlight} className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/90 px-4 py-4 text-sm leading-6 text-slate-700">
              {highlight}
            </div>
          ))}
        </div>
      </header>

      <section id="map-workspace" className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Map workspace</p>
            <h2 className="mt-2 font-[var(--font-display)] text-3xl font-bold text-slate-950 md:text-4xl">Compare economic and civic signals without losing the geography</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            The primary fill layer sets the base story. A second metric can be drawn as centroid bubbles so overlapping hotspots and outliers remain legible.
          </p>
        </div>
        <MapExplorer catalog={catalog} status={status.layers} />
      </section>
    </main>
  );
}

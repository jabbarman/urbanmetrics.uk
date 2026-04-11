import type { Route } from "next";
import Link from "next/link";

import { siteCopy } from "@/content/site";
import { workspaceDefinitions } from "@/content/workspaces";
import { loadCatalog, loadStatus } from "@/server/datasets/load-generated";
import { overallStatusHealth } from "@/server/datasets/utils";

export default async function HomePage() {
  const [catalog, status] = await Promise.all([loadCatalog(), loadStatus()]);
  const serviceHealth = overallStatusHealth(status);

  const workspaceCards = workspaceDefinitions.map((workspace) => {
    const allowedLayerIds = new Set(workspace.allowedLayerIds);
    const layerCount = catalog.filter((entry) => allowedLayerIds.has(entry.id)).length;

    return {
      ...workspace,
      layerCount,
    };
  });

  return (
    <main className="flex min-h-screen w-full flex-col gap-8 py-2">
      <header className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-[rgba(255,255,255,0.78)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur md:p-10 lg:p-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="font-[var(--font-display)] text-xs uppercase tracking-[0.38em] text-sky-800">
              Regional observatory
            </p>
            <h1 className="mt-4 max-w-4xl font-[var(--font-display)] text-4xl font-bold tracking-tight text-slate-950 md:text-5xl lg:text-6xl">
              {siteCopy.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">{siteCopy.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                href={"/regional-context" as Route}
              >
                Open Regional Context
              </Link>
              <Link
                className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-sky-500 hover:text-sky-700"
                href={"/health-access" as Route}
              >
                Open Health Access
              </Link>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3 lg:w-[34rem] lg:grid-cols-1">
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Operational status</p>
              <p className="mt-2 text-xl font-semibold capitalize text-slate-950">{serviceHealth}</p>
              <p className="mt-2 text-sm text-slate-600">
                Generated data, health endpoint, and source freshness are tracked together.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Workspaces</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{workspaceCards.length} focused routes</p>
              <p className="mt-2 text-sm text-slate-600">
                Regional context and health access now live separately so geography and interpretation stay coherent.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Published layers</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{catalog.length} monitored overlays</p>
              <p className="mt-2 text-sm text-slate-600">
                Every shipped layer still exposes source, freshness, geography, and caveat metadata.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-3 lg:grid-cols-3">
          {siteCopy.highlights.map((highlight) => (
            <div
              key={highlight}
              className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/90 px-4 py-4 text-sm leading-6 text-slate-700"
            >
              {highlight}
            </div>
          ))}
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-6 md:grid-cols-2">
          {workspaceCards.map((workspace) => (
            <article
              key={workspace.id}
              className="flex h-full flex-col justify-between rounded-[1.9rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{workspace.introEyebrow}</p>
                <h2 className="mt-3 font-[var(--font-display)] text-2xl font-bold text-slate-950">{workspace.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{workspace.description}</p>
                <dl className="mt-5 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
                  <div>
                    <dt className="font-medium text-slate-900">Primary geography</dt>
                    <dd>{workspace.geographyLabel}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-900">Included layers</dt>
                    <dd>{workspace.layerCount}</dd>
                  </div>
                </dl>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                  href={workspace.href}
                >
                  Open {workspace.shortTitle}
                </Link>
              </div>
            </article>
          ))}
        </div>

        <aside className="rounded-[1.9rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Service status</p>
          <h2 className="mt-3 font-[var(--font-display)] text-2xl font-bold text-slate-950">Operational visibility stays shared</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Monitoring, freshness checks, and generated artifacts remain global even though the user experience is now split into focused workspaces.
          </p>
          <div className="mt-6 rounded-[1.5rem] border border-slate-200/80 bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Current health</p>
            <p className="mt-2 text-xl font-semibold capitalize text-slate-950">{serviceHealth}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-sky-500 hover:text-sky-700"
              href="/status"
            >
              Open Service Status
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}

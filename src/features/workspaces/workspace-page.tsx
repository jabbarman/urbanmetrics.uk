import Link from "next/link";

import { getWorkspaceDefinition, workspaceDefinitions, type WorkspaceId } from "@/content/workspaces";
import { MapExplorer } from "@/features/map/map-explorer";
import { loadCatalog, loadStatus } from "@/server/datasets/load-generated";
import { describeStatusHealth, overallStatusHealth } from "@/server/datasets/utils";

type WorkspacePageProps = {
  workspaceId: WorkspaceId;
};

export async function WorkspacePage({ workspaceId }: WorkspacePageProps) {
  const workspace = getWorkspaceDefinition(workspaceId);

  if (!workspace) {
    return null;
  }

  const [catalog, status] = await Promise.all([loadCatalog(), loadStatus()]);
  const allowedLayerIds = new Set(workspace.allowedLayerIds);
  const workspaceCatalog = catalog.filter((entry) => allowedLayerIds.has(entry.id));
  const workspaceStatus = status.layers.filter((entry) => allowedLayerIds.has(entry.id));
  const serviceHealth = overallStatusHealth({
    generatedAt: status.generatedAt,
    layers: workspaceStatus,
  });
  const serviceHealthPresentation = describeStatusHealth(serviceHealth);
  const siblingWorkspaces = workspaceDefinitions.filter((entry) => entry.id !== workspace.id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 py-6 md:px-8 lg:px-10">
      <header className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-[rgba(255,255,255,0.78)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur md:p-10 lg:p-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="font-[var(--font-display)] text-xs uppercase tracking-[0.38em] text-sky-800">
              {workspace.introEyebrow}
            </p>
            <h1 className="mt-4 max-w-4xl font-[var(--font-display)] text-4xl font-bold tracking-tight text-slate-950 md:text-5xl lg:text-6xl">
              {workspace.introTitle}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">{workspace.introDescription}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                href="#map-workspace"
              >
                Open this workspace
              </Link>
              <Link
                className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-sky-500 hover:text-sky-700"
                href="/"
              >
                Back to overview
              </Link>
              <Link
                className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-sky-500 hover:text-sky-700"
                href="/status"
              >
                View service status
              </Link>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3 lg:w-[42rem] lg:grid-cols-1">
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Workspace scope</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{workspace.shortTitle}</p>
              <p className="mt-2 text-sm text-slate-600">{workspace.description}</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Primary geography</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{workspace.geographyLabel}</p>
              <p className="mt-2 text-sm text-slate-600">
                This workspace keeps one geography model in view so comparisons remain interpretable.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Operational status</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{serviceHealthPresentation.label}</p>
              <p className="mt-2 text-sm text-slate-600">{serviceHealthPresentation.summary}</p>
            </div>
          </div>
        </div>
        {siblingWorkspaces.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {siblingWorkspaces.map((entry) => (
              <Link
                key={entry.id}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-sky-500 hover:text-sky-700"
                href={entry.href}
              >
                Switch to {entry.shortTitle}
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      <section id="map-workspace" className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Map workspace</p>
            <h2 className="mt-2 font-[var(--font-display)] text-3xl font-bold text-slate-950 md:text-4xl">
              {workspace.mapHeading}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">{workspace.mapDescription}</p>
        </div>
        <MapExplorer
          catalog={workspaceCatalog}
          defaultCompareLayerId={workspace.defaultCompareLayerId}
          defaultPrimaryLayerId={workspace.defaultPrimaryLayerId}
          sourceCaveat={workspace.sourceCaveat}
          status={workspaceStatus}
        />
      </section>
    </main>
  );
}

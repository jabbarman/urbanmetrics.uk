import Link from "next/link";

import { loadStatus } from "@/server/datasets/load-generated";
import { overallStatusHealth } from "@/server/datasets/utils";

export default async function StatusPage() {
  const status = await loadStatus();
  const overall = overallStatusHealth(status);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-6 md:px-8">
      <header className="rounded-[2.2rem] border border-slate-200/80 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Service status</p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-[var(--font-display)] text-4xl font-bold text-slate-950">Operational status: {overall}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              This page reflects the most recent generated layer status produced by the ingestion and monitoring pipeline.
            </p>
          </div>
          <Link className="text-sm font-medium text-sky-700 hover:text-sky-900" href="/">
            Back to map
          </Link>
        </div>
      </header>

      <section className="grid gap-4">
        {status.layers.map((layer) => (
          <article key={layer.id} className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">{layer.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{layer.message}</p>
              </div>
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white">{layer.status}</span>
            </div>
            <dl className="mt-5 grid gap-4 text-sm text-slate-600 md:grid-cols-4">
              <div>
                <dt className="font-medium text-slate-900">Source period</dt>
                <dd>{layer.latestSourceDate}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-900">Processed</dt>
                <dd>{layer.dataProcessedAt}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-900">Frequency</dt>
                <dd>{layer.updateFrequency}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-900">Mapped records</dt>
                <dd>{layer.recordsFetched}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </main>
  );
}

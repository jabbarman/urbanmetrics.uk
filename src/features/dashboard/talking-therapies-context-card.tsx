import type { TalkingTherapiesTherapyTypeContext } from "@/server/datasets/types";

function formatInteger(value: number) {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 0,
  }).format(value);
}

type TalkingTherapiesContextCardProps = {
  context: TalkingTherapiesTherapyTypeContext;
};

export function TalkingTherapiesContextCard({ context }: TalkingTherapiesContextCardProps) {
  const topTherapies = context.therapies.slice(0, 5);

  return (
    <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Therapy-type context</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">Midlands annual therapy outcomes</h2>
        </div>
        <p className="max-w-[10rem] text-right text-xs text-slate-500">{context.reportingPeriod} annual file</p>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        Top therapy types in the {context.geographyLabel}, ranked by completed courses of therapy. This is regional annual context and does not provide a Sub ICB breakdown.
      </p>

      <div className="mt-5 space-y-3">
        {topTherapies.map((therapy) => (
          <div key={therapy.therapyType} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-900">{therapy.therapyType}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatInteger(therapy.coursesOfTherapy)} completed courses
                </p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>Recovery {therapy.recoveryRate.toFixed(0)}%</p>
                <p className="mt-1">Improvement {therapy.improvementRate.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-2 rounded-[1.35rem] border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
        <p>{context.source.caveat}</p>
        <p>
          Source:{" "}
          <a className="font-medium text-sky-700 hover:text-sky-900" href={context.source.publicationUrl} rel="noreferrer" target="_blank">
            NHS England therapy-based outcomes
          </a>
        </p>
      </div>
    </section>
  );
}

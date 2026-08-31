import { PIPELINE_LABELS } from '../lib/labels';
import type { PipelineStage } from '../types';

const VISIBLE: PipelineStage[] = [
  'NEW',
  'REVIEWING',
  'CONTACTED',
  'DEMO_SCHEDULED',
  'QUALIFIED',
  'ONBOARDING',
  'REJECTED',
];

export default function PipelineSummary({ counts }: { counts: Record<PipelineStage, number> }) {
  const max = Math.max(1, ...VISIBLE.map((stage) => counts[stage] ?? 0));
  return (
    <section className="card p-4">
      <h2 className="m-0 text-[15px] font-bold">Application pipeline</h2>
      <div className="pipeline mt-3">
        {VISIBLE.map((stage) => {
          const count = counts[stage] ?? 0;
          return (
            <div key={stage}>
              <div className="h-12 rounded-lg bg-[#eef2ff] overflow-hidden flex items-end">
                <div
                  className={`stage-${stage} w-full rounded-lg`}
                  style={{ height: `${Math.max(12, (count / max) * 100)}%` }}
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 mb-0 text-[12px] font-bold">{PIPELINE_LABELS[stage]}</p>
              <p className="m-0 text-[13px] text-[var(--color-muted)]">{count}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

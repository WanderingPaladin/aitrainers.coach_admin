import type { ReactNode } from 'react';

export default function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <article className="card p-4">
      <p className="text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--color-muted)] m-0">{label}</p>
      <p className="text-[28px] font-extrabold tracking-tight mt-2 mb-0">{value}</p>
      {hint ? <p className="text-[13px] text-[var(--color-muted)] mt-1 mb-0">{hint}</p> : null}
    </article>
  );
}

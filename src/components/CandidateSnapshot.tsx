export default function CandidateSnapshot({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="snapshot-grid">
      {items.map((item) => (
        <article key={item.label} className="card p-3">
          <p className="m-0 text-[11.5px] font-bold uppercase tracking-[0.04em] text-[var(--color-muted)]">{item.label}</p>
          <p className="mt-1 mb-0 font-semibold">{item.value}</p>
        </article>
      ))}
    </div>
  );
}

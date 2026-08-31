import type { ReactNode } from 'react';

export default function EmptyState({
  image,
  title,
  body,
  action,
}: {
  image: string;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="py-16 px-6 text-center">
      <img src={image} alt="" className="mx-auto mb-4" width={220} height={160} />
      <h2 className="m-0 text-[18px] font-bold tracking-tight">{title}</h2>
      <p className="mt-2 mb-0 text-[var(--color-muted)]">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

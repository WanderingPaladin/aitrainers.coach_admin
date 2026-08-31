export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  danger = false,
  busy = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) {
    return null;
  }
  return (
    <div className="drawer-backdrop" role="presentation" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="card absolute left-1/2 top-1/2 w-[min(420px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title" className="m-0 text-[18px] font-bold">
          {title}
        </h2>
        <p className="mt-2 mb-4 text-[var(--color-muted)]">{body}</p>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className={danger ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

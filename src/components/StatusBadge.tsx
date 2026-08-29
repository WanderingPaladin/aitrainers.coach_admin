import type { ApplicationStatus } from '../types';

const STYLES: Record<ApplicationStatus, string> = {
  submitted: 'bg-sky-50 text-sky-700 border-sky-200',
  booked: 'bg-violet-50 text-violet-700 border-violet-200',
  reviewed: 'bg-amber-50 text-amber-800 border-amber-200',
  advanced: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  declined: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STYLES[status]}`}>
      {status}
    </span>
  );
}

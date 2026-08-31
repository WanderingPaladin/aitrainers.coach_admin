import {
  CalendarClock,
  FilePlus2,
  StickyNote,
  Tag,
  UserRound,
  ArrowRightLeft,
  Archive,
  Ban,
} from 'lucide-react';
import { formatDateTime } from '../lib/labels';
import type { ApplicationActivity } from '../types';

const ICONS: Record<string, typeof FilePlus2> = {
  submitted: FilePlus2,
  stage_changed: ArrowRightLeft,
  assignee_changed: UserRound,
  note_added: StickyNote,
  tag_changed: Tag,
  demo_scheduled: CalendarClock,
  demo_updated: CalendarClock,
  archived: Archive,
  rejected: Ban,
  bulk_updated: ArrowRightLeft,
};

export default function ActivityTimeline({ items }: { items: ApplicationActivity[] }) {
  if (!items.length) {
    return (
      <section className="card p-4">
        <h2 className="m-0 text-[15px] font-bold">Activity</h2>
        <p className="mt-2 mb-0 text-[13px] text-[var(--color-muted)]">No activity recorded yet.</p>
      </section>
    );
  }

  return (
    <section className="card p-4">
      <h2 className="m-0 text-[15px] font-bold">Activity</h2>
      <ol className="mt-3 mb-0 grid gap-3 p-0 list-none">
        {items.map((item) => {
          const Icon = ICONS[item.type] ?? FilePlus2;
          return (
            <li key={item.id} className="flex gap-3">
              <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-full bg-[#eef2ff] text-[#4338ca]">
                <Icon size={14} aria-hidden="true" />
              </span>
              <span>
                <strong className="block text-[13.5px]">{item.message}</strong>
                <span className="text-[12px] text-[var(--color-muted)]">
                  {item.actor} · {formatDateTime(item.createdAt)}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

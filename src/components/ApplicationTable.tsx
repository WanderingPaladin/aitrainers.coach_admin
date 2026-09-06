import { MoreHorizontal } from 'lucide-react';
import { ATTENDANCE_LABELS, formatIpAddress, initials, relativeTime, sourceLabel } from '../lib/labels';
import type { Application } from '../types';
import CandidateSituationBadge from './CandidateSituationBadge';
import JourneyStageBadge from './JourneyStageBadge';

type Props = {
  items: Application[];
  selected: Set<string>;
  onToggle: (id: string, selected: boolean) => void;
  onToggleAll: (selected: boolean) => void;
  onOpen: (id: string) => void;
  onStage: (id: string) => void;
  onArchive: (id: string) => void;
};

export default function ApplicationTable({
  items,
  selected,
  onToggle,
  onToggleAll,
  onOpen,
  onStage,
  onArchive,
}: Props) {
  const allSelected = items.length > 0 && items.every((item) => selected.has(item.id));

  return (
    <>
      <div className="table-wrap table-desktop">
        <table className="data">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => onToggleAll(event.target.checked)}
                  aria-label="Select all applications on this page"
                />
              </th>
              <th>Applicant</th>
              <th>Profession</th>
              <th className="hide-lg">Location</th>
              <th className="hide-lg">IP</th>
              <th>Source</th>
              <th>Current stage</th>
              <th>Applied</th>
              <th>Intro call</th>
              <th className="hide-md">Platform progress</th>
              <th className="hide-md">Last activity</th>
              <th><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} onClick={() => onOpen(item.id)}>
                <td onClick={(event) => event.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={(event) => onToggle(item.id, event.target.checked)}
                    aria-label={`Select ${item.fullName}`}
                  />
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#eef2ff] text-[12px] font-bold text-[#4338ca]">
                      {initials(item.fullName)}
                    </span>
                    <span>
                      <strong className="block">{item.fullName}</strong>
                      <span className="text-[12.5px] text-[var(--color-muted)]">{item.email}</span>
                    </span>
                  </div>
                </td>
                <td>
                  {item.profession}
                </td>
                <td className="hide-lg">
                  {item.location || [item.city, item.state].filter(Boolean).join(', ') || '—'}
                </td>
                <td className="hide-lg">{formatIpAddress(item)}</td>
                <td>{sourceLabel(item.firstSource)}</td>
                <td>
                  <JourneyStageBadge stage={item.journeyStage} />
                </td>
                <td>{relativeTime(item.submittedAt)}</td>
                <td>
                  {item.introCall
                    ? ATTENDANCE_LABELS[item.introCall.attendance as keyof typeof ATTENDANCE_LABELS] ??
                      item.introCall.attendance
                    : '—'}
                </td>
                <td className="hide-md">{item.platformProgressSummary ?? '—'}</td>
                <td className="hide-md">{relativeTime(item.lastActivityAt ?? item.updatedAt)}</td>
                <td onClick={(event) => event.stopPropagation()}>
                  <details className="relative">
                    <summary className="btn btn-ghost list-none px-2" aria-label={`Actions for ${item.fullName}`}>
                      <MoreHorizontal size={16} />
                    </summary>
                    <div className="absolute right-0 z-10 mt-1 min-w-40 overflow-hidden rounded-xl border border-[var(--color-line)] bg-white shadow-lg">
                      <button type="button" className="btn btn-ghost w-full justify-start" onClick={() => onOpen(item.id)}>
                        View
                      </button>
                      <button type="button" className="btn btn-ghost w-full justify-start" onClick={() => onStage(item.id)}>
                        Change stage
                      </button>
                      <button type="button" className="btn btn-ghost w-full justify-start text-[#b42318]" onClick={() => onArchive(item.id)}>
                        Archive
                      </button>
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3">
        {items.map((item) => (
          <article key={item.id} className="app-card">
            <label className="flex items-start gap-3" onClick={(event) => event.stopPropagation()}>
              <input
                type="checkbox"
                checked={selected.has(item.id)}
                onChange={(event) => onToggle(item.id, event.target.checked)}
                aria-label={`Select ${item.fullName}`}
              />
              <button type="button" className="flex flex-1 items-start gap-3 text-left" onClick={() => onOpen(item.id)}>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#eef2ff] text-[12px] font-bold text-[#4338ca]">
                  {initials(item.fullName)}
                </span>
                <span className="min-w-0">
                  <strong className="block truncate">{item.fullName}</strong>
                  <span className="block truncate text-[12.5px] text-[var(--color-muted)]">{item.email}</span>
                  <span className="mt-2 flex flex-wrap gap-2">
                    <JourneyStageBadge stage={item.journeyStage} />
                    <CandidateSituationBadge stage={item.applicant_stage} label={item.candidateSituation} />
                  </span>
                  <span className="mt-2 block text-[13px] text-[var(--color-muted)]">
                    {item.profession} · {sourceLabel(item.firstSource)} · {formatIpAddress(item)} · {relativeTime(item.submittedAt)}
                  </span>
                </span>
              </button>
            </label>
          </article>
        ))}
      </div>
    </>
  );
}

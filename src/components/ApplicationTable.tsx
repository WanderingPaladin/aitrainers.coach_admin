import { MoreHorizontal } from 'lucide-react';
import { initials, relativeTime } from '../lib/labels';
import type { Application } from '../types';
import ApplicationStageBadge from './ApplicationStageBadge';
import CandidateSituationBadge from './CandidateSituationBadge';

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
              <th>Situation</th>
              <th>Experience</th>
              <th className="hide-lg">Location</th>
              <th>Submitted</th>
              <th>Stage</th>
              <th className="hide-md">Assignee</th>
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
                <td>
                  <CandidateSituationBadge stage={item.applicant_stage} label={item.candidateSituation} />
                </td>
                <td>{item.experienceLabel}</td>
                <td className="hide-lg">
                  <div>
                    {item.location || [item.city, item.state].filter(Boolean).join(', ') || '—'}
                    <div className="text-[12px] text-[var(--color-muted)]">{item.timezone}</div>
                  </div>
                </td>
                <td>{relativeTime(item.submittedAt)}</td>
                <td>
                  <ApplicationStageBadge stage={item.pipelineStage} />
                </td>
                <td className="hide-md">{item.assignee ?? '—'}</td>
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
                    <ApplicationStageBadge stage={item.pipelineStage} />
                    <CandidateSituationBadge stage={item.applicant_stage} label={item.candidateSituation} />
                  </span>
                  <span className="mt-2 block text-[13px] text-[var(--color-muted)]">
                    {item.profession} · {item.experienceLabel} · {relativeTime(item.submittedAt)}
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

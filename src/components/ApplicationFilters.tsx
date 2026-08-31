import { X } from 'lucide-react';
import { PIPELINE_LABELS, PROFESSIONS, SITUATION_LABELS } from '../lib/labels';
import { PIPELINE_STAGES, type ApplicantStage, type ApplicationFilters, type FilterOptions, type PipelineStage } from '../types';

type Props = {
  value: ApplicationFilters;
  options: FilterOptions | null;
  onChange: (next: ApplicationFilters) => void;
  onClose?: () => void;
};

const SITUATIONS: ApplicantStage[] = ['new_no_account', 'has_accounts_no_time', 'working_no_progress'];

function toggle<T extends string>(list: T[] | undefined, item: T): T[] | undefined {
  const current = list ?? [];
  const next = current.includes(item) ? current.filter((value) => value !== item) : [...current, item];
  return next.length ? next : undefined;
}

export function filterChips(value: ApplicationFilters): Array<{ key: string; label: string }> {
  const chips: Array<{ key: string; label: string }> = [];
  for (const stage of value.stage ?? []) {
    chips.push({ key: `stage:${stage}`, label: PIPELINE_LABELS[stage] ?? stage });
  }
  for (const situation of value.applicantStage ?? []) {
    chips.push({ key: `situation:${situation}`, label: SITUATION_LABELS[situation] ?? situation });
  }
  if (value.profession) chips.push({ key: 'profession', label: value.profession });
  if (value.state) chips.push({ key: 'state', label: value.state });
  if (value.assignee) chips.push({ key: 'assignee', label: value.assignee });
  if (value.unassigned) chips.push({ key: 'unassigned', label: 'Unassigned' });
  if (value.experienceMin != null || value.experienceMax != null) {
    chips.push({
      key: 'experience',
      label: `Experience ${value.experienceMin ?? 0}–${value.experienceMax ?? 4}`,
    });
  }
  if (value.submittedFrom || value.submittedTo) {
    chips.push({ key: 'dates', label: 'Date range' });
  }
  if (value.tag) chips.push({ key: 'tag', label: `Tag: ${value.tag}` });
  return chips;
}

export function clearChip(value: ApplicationFilters, key: string): ApplicationFilters {
  if (key.startsWith('stage:')) {
    const stage = key.slice(6) as PipelineStage;
    return { ...value, stage: toggle(value.stage, stage), page: 1 };
  }
  if (key.startsWith('situation:')) {
    const situation = key.slice(10) as ApplicantStage;
    return { ...value, applicantStage: toggle(value.applicantStage, situation), page: 1 };
  }
  if (key === 'profession') return { ...value, profession: undefined, page: 1 };
  if (key === 'state') return { ...value, state: undefined, page: 1 };
  if (key === 'assignee') return { ...value, assignee: undefined, page: 1 };
  if (key === 'unassigned') return { ...value, unassigned: undefined, page: 1 };
  if (key === 'experience') return { ...value, experienceMin: undefined, experienceMax: undefined, page: 1 };
  if (key === 'dates') return { ...value, submittedFrom: undefined, submittedTo: undefined, page: 1 };
  if (key === 'tag') return { ...value, tag: undefined, page: 1 };
  return value;
}

export default function ApplicationFilters({ value, options, onChange, onClose }: Props) {
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onClose?.();
      }}
    >
      <fieldset>
        <legend className="text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--color-muted)]">Stage</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {PIPELINE_STAGES.map((stage) => (
            <label key={stage} className="chip bg-[#f3f4f6] text-[var(--color-ink)]">
              <input
                type="checkbox"
                checked={value.stage?.includes(stage) ?? false}
                onChange={() => onChange({ ...value, stage: toggle(value.stage, stage), page: 1 })}
              />
              {PIPELINE_LABELS[stage]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--color-muted)]">Situation</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SITUATIONS.map((situation) => (
            <label key={situation} className="chip bg-[#eef2ff] text-[#3730a3]">
              <input
                type="checkbox"
                checked={value.applicantStage?.includes(situation) ?? false}
                onChange={() => onChange({ ...value, applicantStage: toggle(value.applicantStage, situation), page: 1 })}
              />
              {SITUATION_LABELS[situation]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="grid gap-1 text-[13px] font-semibold">
        Profession
        <select
          className="select"
          value={value.profession ?? ''}
          onChange={(event) => onChange({ ...value, profession: event.target.value || undefined, page: 1 })}
        >
          <option value="">Any</option>
          {PROFESSIONS.map((profession) => (
            <option key={profession} value={profession}>
              {profession}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1 text-[13px] font-semibold">
          Experience min
          <select
            className="select"
            value={value.experienceMin ?? ''}
            onChange={(event) =>
              onChange({ ...value, experienceMin: event.target.value ? Number(event.target.value) : undefined, page: 1 })
            }
          >
            <option value="">Any</option>
            {[0, 1, 2, 3, 4].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-[13px] font-semibold">
          Experience max
          <select
            className="select"
            value={value.experienceMax ?? ''}
            onChange={(event) =>
              onChange({ ...value, experienceMax: event.target.value ? Number(event.target.value) : undefined, page: 1 })
            }
          >
            <option value="">Any</option>
            {[0, 1, 2, 3, 4].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-1 text-[13px] font-semibold">
        State
        <select
          className="select"
          value={value.state ?? ''}
          onChange={(event) => onChange({ ...value, state: event.target.value || undefined, page: 1 })}
        >
          <option value="">Any</option>
          {(options?.states ?? []).map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-[13px] font-semibold">
        Assignee
        <select
          className="select"
          value={value.unassigned ? 'unassigned' : (value.assignee ?? '')}
          onChange={(event) => {
            const selected = event.target.value;
            onChange({
              ...value,
              assignee: selected && selected !== 'unassigned' ? selected : undefined,
              unassigned: selected === 'unassigned',
              page: 1,
            });
          }}
        >
          <option value="">Anyone</option>
          <option value="unassigned">Unassigned</option>
          {(options?.assignees ?? []).map((assignee) => (
            <option key={assignee} value={assignee}>
              {assignee}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1 text-[13px] font-semibold">
          Submitted from
          <input
            className="field"
            type="date"
            value={value.submittedFrom?.slice(0, 10) ?? ''}
            onChange={(event) =>
              onChange({
                ...value,
                submittedFrom: event.target.value ? new Date(`${event.target.value}T00:00:00.000Z`).toISOString() : undefined,
                page: 1,
              })
            }
          />
        </label>
        <label className="grid gap-1 text-[13px] font-semibold">
          Submitted to
          <input
            className="field"
            type="date"
            value={value.submittedTo?.slice(0, 10) ?? ''}
            onChange={(event) =>
              onChange({
                ...value,
                submittedTo: event.target.value ? new Date(`${event.target.value}T23:59:59.000Z`).toISOString() : undefined,
                page: 1,
              })
            }
          />
        </label>
      </div>

      {onClose ? (
        <button type="submit" className="btn btn-primary">
          Apply filters
        </button>
      ) : null}
    </form>
  );
}

export function ActiveFilterChips({
  value,
  onChange,
}: {
  value: ApplicationFilters;
  onChange: (next: ApplicationFilters) => void;
}) {
  const chips = filterChips(value);
  if (!chips.length) {
    return null;
  }
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          className="chip bg-white border border-[var(--color-line)]"
          onClick={() => onChange(clearChip(value, chip.key))}
        >
          {chip.label}
          <X size={12} aria-hidden="true" />
        </button>
      ))}
      <button type="button" className="btn btn-ghost" onClick={() => onChange({ q: value.q, sort: value.sort, page: 1 })}>
        Clear all
      </button>
    </div>
  );
}

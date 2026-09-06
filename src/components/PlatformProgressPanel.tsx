import { useState } from 'react';
import { upsertPlatformProgress } from '../lib/api';
import { ApiError } from '../lib/http';
import { PLATFORM_STATUS_LABELS, PLATFORM_STATUSES, formatDate } from '../lib/labels';
import type { Application, PlatformProgress, PlatformProgressStatus } from '../types';
import { useToast } from './Toast';

const COMMON_PLATFORMS = ['Outlier', 'Snorkel', 'micro1', 'DataAnnotation', 'Handshake', 'Other'];

export default function PlatformProgressPanel({
  applicationId,
  items,
  onUpdated,
}: {
  applicationId: string;
  items: PlatformProgress[];
  onUpdated: (application: Application, platforms: PlatformProgress[], events: Application['journeyEvents']) => void;
}) {
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [platform, setPlatform] = useState('Outlier');
  const [customPlatform, setCustomPlatform] = useState('');
  const [status, setStatus] = useState<PlatformProgressStatus>('applied');
  const [occurredAt, setOccurredAt] = useState('');
  const [notes, setNotes] = useState('');

  async function save() {
    const name = platform === 'Other' ? customPlatform.trim() : platform;
    if (!name) {
      push('Enter a platform name', 'error');
      return;
    }
    setBusy(true);
    try {
      const result = await upsertPlatformProgress(applicationId, {
        platform: name,
        status,
        occurredAt: occurredAt ? new Date(occurredAt).toISOString() : undefined,
        notes: notes.trim() || undefined,
      });
      onUpdated(result.application, result.platforms, result.events);
      setOpen(false);
      setNotes('');
      push('Platform progress saved');
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not save platform progress', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="m-0 text-[15px] font-bold">Platform progress</h2>
        <button type="button" className="btn" onClick={() => setOpen((value) => !value)}>
          {open ? 'Cancel' : items.length ? 'Update progress' : 'Add platform'}
        </button>
      </div>
      {items.length === 0 && !open ? (
        <p className="mt-2 mb-0 text-[13px] text-[var(--color-muted)]">
          No external platform applications recorded yet. This is separate from the AI Trainers intro call.
        </p>
      ) : (
        <ul className="mt-3 mb-0 grid gap-2 p-0 list-none">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border border-[var(--color-line)] px-3 py-2">
              <strong className="uppercase tracking-[0.04em] text-[12px]">{item.platform}</strong>
              <div className="text-[13px]">
                {PLATFORM_STATUS_LABELS[item.status as PlatformProgressStatus] ?? item.status}
              </div>
              <div className="text-[12px] text-[var(--color-muted)]">
                {[
                  item.appliedAt ? `Applied ${formatDate(item.appliedAt)}` : null,
                  item.assessmentAt ? `Assessment ${formatDate(item.assessmentAt)}` : null,
                  item.interviewAt ? `Interview ${formatDate(item.interviewAt)}` : null,
                  item.resultAt ? `Result ${formatDate(item.resultAt)}` : null,
                  item.projectStartedAt ? `Project ${formatDate(item.projectStartedAt)}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ') || 'Waiting'}
              </div>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <div className="mt-3 grid gap-2">
          <label className="grid gap-1 text-[13px] font-semibold">
            Platform
            <select className="select" value={platform} onChange={(event) => setPlatform(event.target.value)}>
              {COMMON_PLATFORMS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          {platform === 'Other' ? (
            <input
              className="field"
              value={customPlatform}
              onChange={(event) => setCustomPlatform(event.target.value)}
              placeholder="Platform name"
            />
          ) : null}
          <label className="grid gap-1 text-[13px] font-semibold">
            Status
            <select
              className="select"
              value={status}
              onChange={(event) => setStatus(event.target.value as PlatformProgressStatus)}
            >
              {PLATFORM_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {PLATFORM_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-[13px] font-semibold">
            Date
            <input className="field" type="datetime-local" value={occurredAt} onChange={(event) => setOccurredAt(event.target.value)} />
          </label>
          <label className="grid gap-1 text-[13px] font-semibold">
            Notes
            <textarea className="textarea" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void save()}>
            {busy ? 'Saving…' : 'Save update'}
          </button>
        </div>
      ) : null}
    </section>
  );
}

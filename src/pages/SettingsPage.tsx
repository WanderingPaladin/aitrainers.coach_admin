import { useEffect, useState } from 'react';
import { createAvailability, deleteAvailability, listAvailability, patchAvailability } from '../lib/api';
import { ApiError } from '../lib/http';
import { WEEKDAYS } from '../lib/labels';
import type { AvailabilityRule } from '../types';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyRule = {
  weekday: 1,
  startTime: '09:00',
  endTime: '17:00',
  timezone: 'America/New_York',
  slotMinutes: 30,
  bufferMinutes: 0,
  isActive: true,
};

export default function SettingsPage() {
  const { push } = useToast();
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [draft, setDraft] = useState(emptyRule);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function reload() {
    return listAvailability()
      .then((result) => setRules(result.rules))
      .catch((err: unknown) => push(err instanceof ApiError ? err.message : 'Could not load availability', 'error'));
  }

  useEffect(() => {
    void reload();
  }, []);

  return (
    <div className="page">
      <h1 className="page-title">Settings</h1>
      <p className="page-copy">Intro-call availability windows used by the public booking form.</p>

      <section className="card mt-5 overflow-hidden">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Day</th>
                <th>Window</th>
                <th>Timezone</th>
                <th>Slot</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} className="cursor-default">
                  <td>{WEEKDAYS[rule.weekday] ?? rule.weekday}</td>
                  <td>
                    {rule.startTime}–{rule.endTime}
                  </td>
                  <td>{rule.timezone}</td>
                  <td>{rule.slotMinutes} min</td>
                  <td>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        void patchAvailability(rule.id, { isActive: !rule.isActive })
                          .then(() => reload())
                          .then(() => push(rule.isActive ? 'Window paused' : 'Window activated'))
                          .catch((err: unknown) => push(err instanceof ApiError ? err.message : 'Update failed', 'error'));
                      }}
                    >
                      {rule.isActive ? 'On' : 'Off'}
                    </button>
                  </td>
                  <td>
                    <button type="button" className="btn btn-danger" onClick={() => setDeleteId(rule.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <form
        className="card mt-4 grid gap-3 p-4 md:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          void createAvailability(draft)
            .then(() => {
              setDraft(emptyRule);
              push('Availability window added');
              return reload();
            })
            .catch((err: unknown) => push(err instanceof ApiError ? err.message : 'Could not add window', 'error'));
        }}
      >
        <h2 className="m-0 text-[15px] font-bold md:col-span-3">Add window</h2>
        <label className="grid gap-1 text-[13px] font-semibold">
          Weekday
          <select
            className="select"
            value={draft.weekday}
            onChange={(event) => setDraft({ ...draft, weekday: Number(event.target.value) })}
          >
            {WEEKDAYS.map((day, index) => (
              <option key={day} value={index}>
                {day}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-[13px] font-semibold">
          Start
          <input
            className="field"
            type="time"
            value={draft.startTime}
            onChange={(event) => setDraft({ ...draft, startTime: event.target.value })}
            required
          />
        </label>
        <label className="grid gap-1 text-[13px] font-semibold">
          End
          <input
            className="field"
            type="time"
            value={draft.endTime}
            onChange={(event) => setDraft({ ...draft, endTime: event.target.value })}
            required
          />
        </label>
        <label className="grid gap-1 text-[13px] font-semibold md:col-span-2">
          Timezone
          <input
            className="field"
            value={draft.timezone}
            onChange={(event) => setDraft({ ...draft, timezone: event.target.value })}
            required
          />
        </label>
        <button type="submit" className="btn btn-primary self-end">
          Add window
        </button>
      </form>

      <ConfirmDialog
        open={deleteId != null}
        title="Delete this availability window?"
        body="Existing bookings are kept. New applicants will no longer see these slots."
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          const target = deleteId;
          setDeleteId(null);
          if (!target) return;
          void deleteAvailability(target)
            .then(() => {
              push('Window deleted');
              return reload();
            })
            .catch((err: unknown) => push(err instanceof ApiError ? err.message : 'Delete failed', 'error'));
        }}
      />
    </div>
  );
}

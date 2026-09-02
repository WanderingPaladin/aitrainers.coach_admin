import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createJobSource, listJobSources, patchJobSource, syncJobSource } from '../lib/api';
import { ApiError } from '../lib/http';
import type { JobSource, JobSourceType } from '../types';
import { useToast } from '../components/Toast';

const emptyForm = {
  companyName: '',
  companySlug: '',
  companyLogoUrl: '',
  sourceType: 'greenhouse' as JobSourceType,
  boardToken: '',
  careersUrl: '',
  enabled: true,
  priority: 100,
};

const helpFallback: Record<string, string> = {
  greenhouse: 'Board token from boards.greenhouse.io/{token}',
  lever: 'Site identifier from jobs.lever.co/{site}',
  ashby: 'Board name from jobs.ashbyhq.com/{boardName}',
  jsonld: 'Leave the board token empty and set the public careers URL',
  custom: 'Registered custom adapter key',
};

export default function JobSourcesPage() {
  const { push } = useToast();
  const [sources, setSources] = useState<JobSource[]>([]);
  const [help, setHelp] = useState<Record<string, string>>(helpFallback);
  const [draft, setDraft] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  function reload() {
    return listJobSources()
      .then((result) => {
        setSources(result.sources);
        setHelp(result.identifierHelp);
      })
      .catch((err: unknown) => push(err instanceof ApiError ? err.message : 'Could not load sources', 'error'));
  }

  useEffect(() => {
    void reload();
  }, []);

  return (
    <div className="page">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Job sources</h1>
          <p className="page-copy">Public employer ATS feeds used by the /opportunities board. Do not add marketplace scrapers.</p>
        </div>
        <Link to="/admin/jobs" className="btn">
          View collected jobs
        </Link>
      </div>

      <section className="card mt-5 overflow-hidden">
        {sources.length === 0 ? (
          <p className="p-4 mb-0 text-[var(--color-muted)]">
            No sources yet. Add a real Greenhouse, Lever, Ashby, or JSON-LD careers identifier below. Do not invent board IDs.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Identifier</th>
                  <th>Status</th>
                  <th>Last sync</th>
                  <th>Jobs</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <tr key={source.id} className="cursor-default">
                    <td>
                      <strong>{source.companyName}</strong>
                      <div className="text-[12px] text-[var(--color-muted)]">{source.companySlug}</div>
                    </td>
                    <td>{source.sourceType}</td>
                    <td className="max-w-[220px] truncate">{source.boardToken || source.careersUrl || '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => {
                          void patchJobSource(source.id, { enabled: !source.enabled })
                            .then(() => reload())
                            .then(() => push(source.enabled ? 'Source paused' : 'Source enabled'));
                        }}
                      >
                        {source.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </td>
                    <td>
                      <div>{source.lastRun?.status ?? 'never'}</div>
                      {source.lastError ? (
                        <div className="text-[12px] text-[#b42318]">{source.lastError}</div>
                      ) : (
                        <div className="text-[12px] text-[var(--color-muted)]">
                          {source.lastRun ? `${source.lastRun.jobsFetched} fetched` : 'No runs yet'}
                        </div>
                      )}
                    </td>
                    <td>{source.jobCount}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn"
                          onClick={() => {
                            setEditingId(source.id);
                            setDraft({
                              companyName: source.companyName,
                              companySlug: source.companySlug,
                              companyLogoUrl: source.companyLogoUrl ?? '',
                              sourceType: source.sourceType,
                              boardToken: source.boardToken,
                              careersUrl: source.careersUrl,
                              enabled: source.enabled,
                              priority: source.priority,
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={syncingId === source.id}
                          onClick={() => {
                            setSyncingId(source.id);
                            void syncJobSource(source.id)
                              .then((result) => {
                                const run = result.results[0];
                                push(
                                  result.locked
                                    ? 'Sync already running'
                                    : `Sync ${run?.status ?? 'finished'} · ${run?.jobsFetched ?? 0} fetched`,
                                );
                                return reload();
                              })
                              .catch((err: unknown) =>
                                push(err instanceof ApiError ? err.message : 'Sync failed', 'error'),
                              )
                              .finally(() => setSyncingId(null));
                          }}
                        >
                          {syncingId === source.id ? 'Syncing…' : 'Sync now'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <form
        className="card mt-4 grid gap-3 p-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          const payload = {
            ...draft,
            companyLogoUrl: draft.companyLogoUrl || null,
          };
          const action = editingId ? patchJobSource(editingId, payload) : createJobSource(payload);
          void action
            .then(() => {
              setDraft(emptyForm);
              setEditingId(null);
              push(editingId ? 'Source updated' : 'Source added');
              return reload();
            })
            .catch((err: unknown) => push(err instanceof ApiError ? err.message : 'Could not save source', 'error'));
        }}
      >
        <h2 className="m-0 text-[15px] font-bold md:col-span-2">{editingId ? 'Edit source' : 'Add source'}</h2>
        <label className="grid gap-1 text-[13px] font-semibold">
          Company name
          <input className="field" value={draft.companyName} onChange={(event) => setDraft({ ...draft, companyName: event.target.value })} required />
        </label>
        <label className="grid gap-1 text-[13px] font-semibold">
          Company slug
          <input className="field" value={draft.companySlug} onChange={(event) => setDraft({ ...draft, companySlug: event.target.value })} placeholder="auto from name" />
        </label>
        <label className="grid gap-1 text-[13px] font-semibold md:col-span-2">
          Company logo URL
          <input className="field" value={draft.companyLogoUrl} onChange={(event) => setDraft({ ...draft, companyLogoUrl: event.target.value })} />
        </label>
        <label className="grid gap-1 text-[13px] font-semibold">
          Source type
          <select
            className="select"
            value={draft.sourceType}
            onChange={(event) => setDraft({ ...draft, sourceType: event.target.value as JobSourceType })}
          >
            <option value="greenhouse">Greenhouse</option>
            <option value="lever">Lever</option>
            <option value="ashby">Ashby</option>
            <option value="jsonld">JSON-LD</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        <label className="grid gap-1 text-[13px] font-semibold">
          Priority
          <input
            className="field"
            type="number"
            min={0}
            max={1000}
            value={draft.priority}
            onChange={(event) => setDraft({ ...draft, priority: Number(event.target.value) })}
          />
        </label>
        <label className="grid gap-1 text-[13px] font-semibold md:col-span-2">
          Board token / identifier
          <input className="field" value={draft.boardToken} onChange={(event) => setDraft({ ...draft, boardToken: event.target.value })} />
          <span className="font-medium text-[12px] text-[var(--color-muted)]">{help[draft.sourceType]}</span>
        </label>
        <label className="grid gap-1 text-[13px] font-semibold md:col-span-2">
          Careers URL
          <input className="field" value={draft.careersUrl} onChange={(event) => setDraft({ ...draft, careersUrl: event.target.value })} />
        </label>
        <label className="flex items-center gap-2 text-[13px] font-semibold">
          <input type="checkbox" checked={draft.enabled} onChange={(event) => setDraft({ ...draft, enabled: event.target.checked })} />
          Enabled
        </label>
        <div className="flex gap-2 md:col-span-2">
          <button type="submit" className="btn btn-primary">
            {editingId ? 'Save source' : 'Add source'}
          </button>
          {editingId ? (
            <button
              type="button"
              className="btn"
              onClick={() => {
                setEditingId(null);
                setDraft(emptyForm);
              }}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}

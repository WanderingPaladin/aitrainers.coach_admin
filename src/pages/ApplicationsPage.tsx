import { Download, Filter, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import emptyApplications from '../assets/empty-applications.svg';
import emptySearch from '../assets/empty-search.svg';
import ApplicationFilters, { ActiveFilterChips, filterChips } from '../components/ApplicationFilters';
import ApplicationTable from '../components/ApplicationTable';
import CandidateDetail from '../components/CandidateDetail';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { bulkUpdate, exportCsv, downloadCsvFile, getFilterOptions, listApplications, patchApplication } from '../lib/api';
import { ApiError } from '../lib/http';
import { PIPELINE_LABELS } from '../lib/labels';
import { PIPELINE_STAGES, type Application, type ApplicationFilters as Filters, type FilterOptions, type PipelineStage } from '../types';

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}

export default function ApplicationsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const [filters, setFilters] = useState<Filters>({ page: 1, pageSize: 20, sort: 'newest' });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search, 300);
  const query = useMemo(() => ({ ...filters, q: debouncedSearch || undefined }), [filters, debouncedSearch]);
  const [items, setItems] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<FilterOptions | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [bulkArchive, setBulkArchive] = useState(false);
  const [stageFor, setStageFor] = useState<string | null>(null);

  useEffect(() => {
    void getFilterOptions().then(setOptions).catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listApplications(query)
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setTotal(result.total);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load applications.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const hasFilters = filterChips(query).length > 0 || Boolean(query.q);
  const pageCount = Math.max(1, Math.ceil(total / (filters.pageSize ?? 20)));

  function open(applicationId: string) {
    navigate(`/admin/applications/${applicationId}`);
  }

  async function applyBulk(body: Parameters<typeof bulkUpdate>[0], success: string) {
    try {
      await bulkUpdate(body);
      setSelected(new Set());
      const result = await listApplications(query);
      setItems(result.items);
      setTotal(result.total);
      push(success);
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Bulk update failed', 'error');
    }
  }

  return (
    <div className={id ? 'applications-layout has-detail' : 'applications-layout'}>
      <div className="applications-list page">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="page-title">Applications</h1>
            <p className="page-copy">{total} result{total === 1 ? '' : 's'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn" onClick={() => setFiltersOpen(true)}>
              <Filter size={16} /> Filters
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                void exportCsv({ ...query, ids: selected.size ? [...selected] : undefined })
                  .then((csv) => {
                    downloadCsvFile(csv, 'applications.csv');
                    push('Export downloaded');
                  })
                  .catch((err: unknown) => push(err instanceof ApiError ? err.message : 'Export failed', 'error'));
              }}
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        <label className="relative mt-4 block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" size={16} />
          <input
            className="field pl-10"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setFilters((current) => ({ ...current, page: 1 }));
            }}
            placeholder="Search name, email, or profession"
            aria-label="Search applications"
          />
        </label>

        <div className="mt-3">
          <ActiveFilterChips value={filters} onChange={setFilters} />
        </div>

        {error ? (
          <p className="mt-6" role="alert">{error}</p>
        ) : loading && items.length === 0 ? (
          <div className="mt-6 grid gap-2">
            <div className="skeleton h-14" />
            <div className="skeleton h-14" />
            <div className="skeleton h-14" />
          </div>
        ) : items.length === 0 ? (
          <div className="card mt-6">
            <EmptyState
              image={hasFilters ? emptySearch : emptyApplications}
              title={hasFilters ? 'No matching applications' : 'No applications yet'}
              body={
                hasFilters
                  ? 'Try clearing filters or searching a different name, email, or profession.'
                  : 'New submissions from the public application form will appear here.'
              }
              action={
                hasFilters ? (
                  <button type="button" className="btn" onClick={() => { setFilters({ page: 1, pageSize: 20, sort: 'newest' }); setSearch(''); }}>
                    Clear all
                  </button>
                ) : null
              }
            />
          </div>
        ) : (
          <div className="card mt-4 overflow-hidden">
            <ApplicationTable
              items={items}
              selected={selected}
              onToggle={(applicationId, isSelected) => {
                setSelected((current) => {
                  const next = new Set(current);
                  if (isSelected) next.add(applicationId);
                  else next.delete(applicationId);
                  return next;
                });
              }}
              onToggleAll={(isSelected) => {
                setSelected(isSelected ? new Set(items.map((item) => item.id)) : new Set());
              }}
              onOpen={open}
              onStage={setStageFor}
              onArchive={setArchiveId}
            />
          </div>
        )}

        {total > (filters.pageSize ?? 20) ? (
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              className="btn"
              disabled={(filters.page ?? 1) <= 1 || loading}
              onClick={() => setFilters((current) => ({ ...current, page: Math.max(1, (current.page ?? 1) - 1) }))}
            >
              Previous
            </button>
            <span className="text-[13px] text-[var(--color-muted)]">
              Page {filters.page ?? 1} of {pageCount}
            </span>
            <button
              type="button"
              className="btn"
              disabled={(filters.page ?? 1) >= pageCount || loading}
              onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}
            >
              Next
            </button>
          </div>
        ) : null}

        {selected.size > 0 ? (
          <div className="bulk-bar mt-4">
            <span>{selected.size} selected</span>
            <select
              className="select max-w-44 bg-white text-[var(--color-ink)]"
              defaultValue=""
              onChange={(event) => {
                const stage = event.target.value as PipelineStage;
                if (!stage) return;
                void applyBulk({ ids: [...selected], pipelineStage: stage }, `Updated ${selected.size} to ${PIPELINE_LABELS[stage]}`);
                event.currentTarget.value = '';
              }}
            >
              <option value="">Change stage</option>
              {PIPELINE_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {PIPELINE_LABELS[stage]}
                </option>
              ))}
            </select>
            <input
              className="field max-w-40"
              placeholder="Assign to"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  const assignee = event.currentTarget.value.trim();
                  if (assignee) void applyBulk({ ids: [...selected], assignee }, `Assigned ${selected.size}`);
                }
              }}
            />
            <input
              className="field max-w-36"
              placeholder="Add tag"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  const addTag = event.currentTarget.value.trim();
                  if (addTag) void applyBulk({ ids: [...selected], addTag }, `Tagged ${selected.size}`);
                }
              }}
            />
            <button type="button" className="btn" onClick={() => setBulkArchive(true)}>
              Archive
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                void exportCsv({ ids: [...selected] })
                  .then((csv) => downloadCsvFile(csv, 'applications-selected.csv'))
                  .catch((err: unknown) => push(err instanceof ApiError ? err.message : 'Export failed', 'error'));
              }}
            >
              Export selected
            </button>
          </div>
        ) : null}
      </div>

      {id ? (
        <div className="applications-detail">
          <CandidateDetail id={id} onClose={() => navigate('/admin/applications')} />
        </div>
      ) : null}

      {filtersOpen ? (
        <div className="drawer-backdrop" onClick={() => setFiltersOpen(false)}>
          <div className="drawer drawer-bottom filter-drawer p-4" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="m-0 text-[18px] font-bold">Filters</h2>
              <button type="button" className="btn" onClick={() => setFiltersOpen(false)}>
                Close
              </button>
            </div>
            <ApplicationFilters value={filters} options={options} onChange={setFilters} onClose={() => setFiltersOpen(false)} />
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={archiveId != null || bulkArchive}
        title="Archive application?"
        body="Archived applicants leave the active pipeline. Original submission data is kept."
        confirmLabel="Archive"
        danger
        onCancel={() => {
          setArchiveId(null);
          setBulkArchive(false);
        }}
        onConfirm={() => {
          if (bulkArchive) {
            setBulkArchive(false);
            void applyBulk({ ids: [...selected], archive: true }, `Archived ${selected.size}`);
            return;
          }
          const target = archiveId;
          setArchiveId(null);
          if (!target) return;
          void patchApplication(target, { pipelineStage: 'ARCHIVED' })
            .then(() => listApplications(query))
            .then((result) => {
              setItems(result.items);
              setTotal(result.total);
              push('Archived');
            })
            .catch((err: unknown) => push(err instanceof ApiError ? err.message : 'Archive failed', 'error'));
        }}
      />

      {stageFor ? (
        <div className="drawer-backdrop" onClick={() => setStageFor(null)}>
          <div className="card absolute left-1/2 top-1/2 w-[min(360px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 p-5" onClick={(event) => event.stopPropagation()}>
            <h2 className="m-0 text-[18px] font-bold">Change stage</h2>
            <div className="mt-3 grid gap-2">
              {PIPELINE_STAGES.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  className="btn justify-start"
                  onClick={() => {
                    const target = stageFor;
                    setStageFor(null);
                    void patchApplication(target, { pipelineStage: stage })
                      .then(() => listApplications(query))
                      .then((result) => {
                        setItems(result.items);
                        setTotal(result.total);
                        push(`Moved to ${PIPELINE_LABELS[stage]}`);
                      })
                      .catch((err: unknown) => push(err instanceof ApiError ? err.message : 'Update failed', 'error'));
                  }}
                >
                  {PIPELINE_LABELS[stage]}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

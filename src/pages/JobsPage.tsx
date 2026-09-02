import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listAdminJobs, patchAdminJob } from '../lib/api';
import { ApiError } from '../lib/http';
import type { AdminJob } from '../types';
import { useToast } from '../components/Toast';

export default function JobsPage() {
  const { push } = useToast();
  const [items, setItems] = useState<AdminJob[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [visibility, setVisibility] = useState('all');

  function reload(next = { q, visibility }) {
    return listAdminJobs(next)
      .then((result) => {
        setItems(result.items);
        setTotal(result.total);
      })
      .catch((err: unknown) => push(err instanceof ApiError ? err.message : 'Could not load jobs', 'error'));
  }

  useEffect(() => {
    void reload();
  }, []);

  return (
    <div className="page">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Collected jobs</h1>
          <p className="page-copy">Inspect relevance, deactivate stale listings, and confirm apply URLs point at the employer.</p>
        </div>
        <Link to="/admin/job-sources" className="btn">
          Manage sources
        </Link>
      </div>

      <form
        className="mt-5 flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void reload({ q, visibility });
        }}
      >
        <input className="field max-w-xs" value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search title or company" />
        <select className="select max-w-[180px]" value={visibility} onChange={(event) => setVisibility(event.target.value)}>
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="review">Review</option>
          <option value="hidden">Hidden</option>
        </select>
        <button type="submit" className="btn btn-primary">
          Filter
        </button>
      </form>

      <section className="card mt-4 overflow-hidden">
        {items.length === 0 ? (
          <p className="p-4 mb-0 text-[var(--color-muted)]">No jobs in this view. {total} total after filters.</p>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Company</th>
                  <th>Score</th>
                  <th>Visibility</th>
                  <th>Active</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((job) => (
                  <tr key={job.id} className="cursor-default">
                    <td>
                      <strong>{job.title}</strong>
                      <div className="text-[12px] text-[var(--color-muted)]">
                        {job.category ?? 'Uncategorized'} · {job.location ?? 'Location n/a'}
                      </div>
                    </td>
                    <td>{job.companyName}</td>
                    <td>{job.relevanceScore}</td>
                    <td>{job.visibility}{job.isDuplicate ? ' · duplicate' : ''}</td>
                    <td>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => {
                          void patchAdminJob(job.id, !job.isActive)
                            .then(() => reload())
                            .then(() => push(job.isActive ? 'Job deactivated' : 'Job reactivated'));
                        }}
                      >
                        {job.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <a className="btn" href={job.applyUrl} target="_blank" rel="noreferrer">
                        Apply URL
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

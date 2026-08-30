import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listApplications } from '../api';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { STATUSES, formatYearsOfAiTraining, type Application, type ApplicationStatus } from '../types';

function formatWhen(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function ApplicationsPage() {
  const [items, setItems] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [status, setStatus] = useState<ApplicationStatus | ''>('');
  const [error, setError] = useState('');
  const [watching, setWatching] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [q]);

  const query = debouncedQ;

  async function load() {
    try {
      const result = await listApplications({
        q: query || undefined,
        status,
        pageSize: 50,
      });
      setItems(result.items);
      setTotal(result.total);
      setUpdatedAt(new Date());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load applications.');
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        window.location.href = '/login';
      }
    }
  }

  useEffect(() => {
    void load();
  }, [query, status]);

  useEffect(() => {
    if (!watching) return;
    const timer = window.setInterval(() => {
      void load();
    }, 8000);
    return () => window.clearInterval(timer);
  }, [watching, query, status]);

  return (
    <Layout title="Incoming applications">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Applications</h2>
          <p className="mt-1 text-sm text-slate-500">
            {total} total{updatedAt ? ` · refreshed ${updatedAt.toLocaleTimeString()}` : ''}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <input type="checkbox" checked={watching} onChange={(event) => setWatching(event.target.checked)} />
          Live watch
        </label>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search name, email, phone, city"
          className="min-w-[240px] flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-sky-400"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as ApplicationStatus | '')}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.08em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Applicant</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Profession</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Applied</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                  No applications yet.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link to={`/applications/${item.id}`} className="font-semibold text-[#16306a] hover:underline">
                      {item.fullName}
                    </Link>
                    <div className="text-xs text-slate-500">{item.email}</div>
                    <div className="text-xs text-slate-400">{item.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.city}, {item.state}
                    <div className="text-xs text-slate-400">{item.timezone}</div>
                  </td>
                  <td className="px-4 py-3">
                    {item.profession}
                    <div className="text-xs text-slate-400">{formatYearsOfAiTraining(item.yearsOfExperience)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatWhen(item.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

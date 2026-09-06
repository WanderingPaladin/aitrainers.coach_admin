import {
  BadgeCheck,
  CalendarCheck,
  ClipboardCheck,
  Eye,
  FileText,
  Filter,
  Rocket,
  TrendingDown,
  Users,
  Video,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ConversionFunnel from '../components/ConversionFunnel';
import { getFunnelAnalytics } from '../lib/api';
import { ApiError } from '../lib/http';
import { formatPercent } from '../lib/labels';
import type { FunnelResponse } from '../types';

const RANGES = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: 'all', label: 'All time' },
  { id: 'custom', label: 'Custom' },
] as const;

const STAGE_ICONS = [Eye, FileText, CalendarCheck, Video, ClipboardCheck, BadgeCheck, Rocket];

export default function AnalyticsPage() {
  const [range, setRange] = useState<(typeof RANGES)[number]['id']>('30d');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [data, setData] = useState<FunnelResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    if (range !== 'custom') {
      return { range };
    }
    return {
      range,
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(`${to}T23:59:59.000Z`).toISOString() : undefined,
    };
  }, [from, range, to]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getFunnelAnalytics(query)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Could not load funnel analytics.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="page">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-copy">
            Candidate conversion from first visit through real platform work. Counts are unique people, not
            duplicate events.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Filter size={16} className="text-[var(--color-muted)]" />
        {RANGES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`btn${range === item.id ? ' btn-primary' : ''}`}
            onClick={() => setRange(item.id)}
          >
            {item.label}
          </button>
        ))}
        {range === 'custom' ? (
          <span className="flex flex-wrap gap-2">
            <input className="field" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
            <input className="field" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="mt-6" role="alert">
          {error}
        </p>
      ) : null}

      {loading || !data ? (
        <div className="mt-6 grid gap-4">
          <div className="skeleton h-28" />
          <div className="skeleton h-40" />
          <div className="skeleton h-48" />
        </div>
      ) : (
        <>
          <p className="mt-4 mb-0 text-[13px] text-[var(--color-muted)]">
            {data.range.cohort}
            {data.trackingStartedAt
              ? ` Visitor analytics start ${new Date(data.trackingStartedAt).toLocaleDateString()}.`
              : ' Visitor analytics start when first-party tracking records its first visit.'}
          </p>

          <div className="metric-grid metric-grid-funnel mt-5">
            {data.stages.map((stage, index) => {
              const Icon = STAGE_ICONS[index] ?? Users;
              return (
                <article key={stage.key} className="card p-4">
                  <p className="m-0 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--color-muted)]">
                    <Icon size={14} />
                    {stage.label}
                  </p>
                  <p className="mt-2 mb-0 text-[28px] font-extrabold tracking-tight">{stage.count.toLocaleString()}</p>
                </article>
              );
            })}
          </div>

          <section className="card mt-4 p-4">
            <h2 className="m-0 text-[15px] font-bold">Conversion funnel</h2>
            <p className="mt-1 mb-4 text-[13px] text-[var(--color-muted)]">
              {data.range.label}. Percentages are unique candidates moving to the next stage.
            </p>
            <ConversionFunnel stages={data.stages} conversions={data.conversions} />
          </section>

          {data.biggestDropOff ? (
            <section className="card mt-4 p-4">
              <h2 className="m-0 flex items-center gap-2 text-[15px] font-bold">
                <TrendingDown size={16} />
                Biggest drop-off
              </h2>
              <p className="mt-2 mb-0">
                <strong>
                  {data.biggestDropOff.fromLabel} → {data.biggestDropOff.toLabel}
                </strong>
                <span className="ml-2 text-[var(--color-muted)]">
                  {data.biggestDropOff.dropped.toLocaleString()} candidates did not continue ·{' '}
                  {formatPercent(data.biggestDropOff.conversion)} conversion
                </span>
              </p>
            </section>
          ) : null}

          <section className="card mt-4 p-4">
            <h2 className="m-0 text-[15px] font-bold">Acquisition sources</h2>
            <p className="mt-1 mb-3 text-[13px] text-[var(--color-muted)]">
              First-touch attribution from UTM and referrer. Unknown and Direct stay explicit when a source cannot
              be determined.
            </p>
            {data.sources.length === 0 ? (
              <p className="mb-0 text-[13px] text-[var(--color-muted)]">No acquisition sources in this range yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Source</th>
                      <th>Visitors</th>
                      <th>Applications</th>
                      <th>Bookings</th>
                      <th>Attended</th>
                      <th>Interviews</th>
                      <th>Passed</th>
                      <th>Projects</th>
                      <th>Visitor → App</th>
                      <th>App → Book</th>
                      <th>Interview → Pass</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sources.map((row) => (
                      <tr key={row.source}>
                        <td>
                          <strong>{row.label}</strong>
                        </td>
                        <td>{row.visitors.toLocaleString()}</td>
                        <td>{row.applications.toLocaleString()}</td>
                        <td>{row.bookings.toLocaleString()}</td>
                        <td>{row.attended.toLocaleString()}</td>
                        <td>{row.interviews.toLocaleString()}</td>
                        <td>{row.passed.toLocaleString()}</td>
                        <td>{row.projects.toLocaleString()}</td>
                        <td>{formatPercent(row.visitorToApplication)}</td>
                        <td>{formatPercent(row.applicationToBooking)}</td>
                        <td>{formatPercent(row.interviewToPass)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

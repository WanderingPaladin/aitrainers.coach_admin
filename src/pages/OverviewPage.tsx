import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MetricCard from '../components/MetricCard';
import PipelineSummary from '../components/PipelineSummary';
import ApplicationStageBadge from '../components/ApplicationStageBadge';
import { getOverview } from '../lib/api';
import { ApiError } from '../lib/http';
import { attentionReason, relativeTime } from '../lib/labels';
import type { OverviewResponse } from '../types';

export default function OverviewPage() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOverview()
      .then(setData)
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'Could not load overview.'));
  }, []);

  if (error) {
    return (
      <div className="page">
        <h1 className="page-title">Applications overview</h1>
        <p className="page-copy" role="alert">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page grid gap-4">
        <div className="skeleton h-16" />
        <div className="skeleton h-28" />
        <div className="skeleton h-40" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Applications overview</h1>
          <p className="page-copy">
            Review applicants, move candidates through the pipeline, and keep follow-ups organized.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/analytics" className="btn">
            Analytics
          </Link>
          <Link to="/admin/applications" className="btn btn-primary">
            View applications
          </Link>
        </div>
      </div>

      <div className="metric-grid mt-6">
        <MetricCard label="New this week" value={data.kpis.newThisWeek} hint="Submitted in the last 7 days" />
        <MetricCard label="Needs review" value={data.kpis.needsReview} hint="New or reviewing" />
        <MetricCard label="Demo scheduled" value={data.kpis.demoScheduled} />
        <MetricCard label="Qualified / onboarding" value={data.kpis.qualifiedOnboarding} />
      </div>

      <div className="mt-4">
        <PipelineSummary counts={data.pipeline} />
      </div>

      <section className="card mt-4 p-4">
        <h2 className="m-0 text-[15px] font-bold">Needs attention</h2>
        {data.needsAttention.length === 0 ? (
          <p className="mt-2 mb-0 text-[13px] text-[var(--color-muted)]">Nothing is overdue right now.</p>
        ) : (
          <ul className="mt-3 mb-0 grid gap-2 p-0 list-none">
            {data.needsAttention.map((item) => (
              <li key={item.id}>
                <Link to={`/admin/applications/${item.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-2 py-2 hover:bg-[#f8faff]">
                  <span>
                    <strong>{item.fullName}</strong>
                    <span className="ml-2 text-[13px] text-[var(--color-muted)]">{attentionReason(item)}</span>
                  </span>
                  <ApplicationStageBadge stage={item.pipelineStage} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card mt-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 text-[15px] font-bold">Recent applications</h2>
          <Link to="/admin/applications" className="btn btn-ghost">
            See all
          </Link>
        </div>
        <ul className="mt-3 mb-0 grid gap-2 p-0 list-none">
          {data.recent.map((item) => (
            <li key={item.id}>
              <Link to={`/admin/applications/${item.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-2 py-2 hover:bg-[#f8faff]">
                <span>
                  <strong>{item.fullName}</strong>
                  <span className="ml-2 text-[13px] text-[var(--color-muted)]">{item.profession}</span>
                </span>
                <span className="text-[13px] text-[var(--color-muted)]">{relativeTime(item.submittedAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

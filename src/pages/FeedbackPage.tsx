import { useEffect, useState } from 'react';
import { listFeedback, patchFeedback } from '../lib/api';
import { ApiError } from '../lib/http';
import { relativeTime } from '../lib/labels';
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  type FeedbackStatus,
  type SiteFeedback,
} from '../types';
import { useToast } from '../components/Toast';

const CATEGORY_LABELS: Record<string, string> = {
  confusing: 'Confusing',
  improvement: 'Improvement',
  problem: 'Problem',
  general: 'General',
  question: 'Question',
};

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  planned: 'Planned',
  resolved: 'Resolved',
  archived: 'Archived',
};

const RATING_LABELS = ['', 'Poor', 'Okay', 'Good', 'Great'];

export default function FeedbackPage() {
  const { push } = useToast();
  const [items, setItems] = useState<SiteFeedback[]>([]);
  const [total, setTotal] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');

  function reload(next = { status, category, q }) {
    return listFeedback(next)
      .then((result) => {
        setItems(result.items);
        setTotal(result.total);
        setNewCount(result.newCount);
      })
      .catch((err: unknown) => push(err instanceof ApiError ? err.message : 'Could not load feedback', 'error'));
  }

  useEffect(() => {
    void reload();
  }, []);

  return (
    <div className="page">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Feedback</h1>
          <p className="page-copy">Recent visitor comments from the AI Trainers Assistant.</p>
        </div>
        <p className="m-0 text-[13px] font-semibold text-[var(--color-muted)]">{newCount} new</p>
      </div>

      <form
        className="mt-5 flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void reload({ status, category, q });
        }}
      >
        <input className="field max-w-xs" value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search message or page" />
        <select className="select max-w-[180px]" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {FEEDBACK_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {CATEGORY_LABELS[item]}
            </option>
          ))}
        </select>
        <select className="select max-w-[180px]" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {FEEDBACK_STATUSES.map((item) => (
            <option key={item} value={item}>
              {STATUS_LABELS[item]}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary">
          Filter
        </button>
      </form>

      <section className="card mt-4 overflow-hidden">
        {items.length === 0 ? (
          <p className="p-4 mb-0 text-[var(--color-muted)]">No feedback in this view. {total} total after filters.</p>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Page</th>
                  <th>Rating</th>
                  <th>Message</th>
                  <th>From</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="cursor-default">
                    <td>
                      <strong>{CATEGORY_LABELS[item.category] ?? item.category}</strong>
                      {item.subcategory ? (
                          <div className="text-[12px] text-[var(--color-muted)]">{item.subcategory.replace(/_/g, ' ')}</div>
                      ) : null}
                    </td>
                    <td>
                      <code className="text-[12px]">{item.pagePath}</code>
                    </td>
                    <td>{item.rating ? RATING_LABELS[item.rating] ?? item.rating : '—'}</td>
                    <td className="max-w-[320px]">
                      <span className="line-clamp-3">{item.message || '—'}</span>
                    </td>
                    <td>{item.userId ? 'Logged in' : 'Anonymous'}{item.email ? ` · ${item.email}` : ''}</td>
                    <td>{relativeTime(item.createdAt)}</td>
                    <td>
                      <select
                        className="select"
                        value={item.status}
                        aria-label={`Status for feedback ${item.id}`}
                        onChange={(event) => {
                          const next = event.target.value as FeedbackStatus;
                          void patchFeedback(item.id, next)
                            .then(() => reload())
                            .then(() => push('Feedback updated'));
                        }}
                      >
                        {FEEDBACK_STATUSES.map((value) => (
                          <option key={value} value={value}>
                            {STATUS_LABELS[value]}
                          </option>
                        ))}
                      </select>
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

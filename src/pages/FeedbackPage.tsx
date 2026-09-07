import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFeedbackSummary, listFeedback, openFeedbackConversation, patchFeedback } from '../lib/api';
import { ApiError } from '../lib/http';
import { relativeTime } from '../lib/labels';
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  type FeedbackStatus,
  type FeedbackSummary,
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
  spam: 'Spam',
};

const RATING_LABELS = ['', 'Poor', 'Okay', 'Good', 'Great'];

function clampMessage(value: string) {
  const text = value.trim();
  if (!text) return '—';
  return text.length > 90 ? `${text.slice(0, 87)}...` : text;
}

export default function FeedbackPage() {
  const { push } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState<SiteFeedback[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<SiteFeedback | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  function reload(next = { status, category, q }) {
    return Promise.all([
      listFeedback(next),
      getFeedbackSummary(),
    ])
      .then(([result, nextSummary]) => {
        setItems(result.items);
        setTotal(result.total);
        setSummary(nextSummary);
        setSelected((current) => current ? result.items.find((item) => item.id === current.id) ?? current : null);
      })
      .catch((err: unknown) => push(err instanceof ApiError ? err.message : 'Could not load feedback', 'error'));
  }

  useEffect(() => {
    void reload();
  }, []);

  function changeStatus(item: SiteFeedback, next: FeedbackStatus) {
    const previous = item.status;
    setItems((current) => current.map((row) => (row.id === item.id ? { ...row, status: next } : row)));
    if (selected?.id === item.id) setSelected({ ...item, status: next });
    setSavingId(item.id);
    void patchFeedback(item.id, next)
      .then((result) => {
        setItems((current) => current.map((row) => (row.id === item.id ? result.feedback : row)));
        if (selected?.id === item.id) setSelected(result.feedback);
        push('Feedback updated');
        return getFeedbackSummary().then(setSummary);
      })
      .catch((err: unknown) => {
        setItems((current) => current.map((row) => (row.id === item.id ? { ...row, status: previous } : row)));
        if (selected?.id === item.id) setSelected({ ...item, status: previous });
        push(err instanceof ApiError ? err.message : 'Could not update feedback', 'error');
      })
      .finally(() => setSavingId(null));
  }

  function reply(item: SiteFeedback) {
    if (item.conversationId) {
      navigate(`/admin/inbox?conversation=${item.conversationId}`);
      return;
    }
    if (!item.replyAvailable) {
      push(item.replyUnavailableReason || 'Conversation unavailable for this older anonymous feedback.', 'error');
      return;
    }
    setSavingId(item.id);
    void openFeedbackConversation(item.id)
      .then((result) => {
        navigate(`/admin/inbox?conversation=${result.conversation.id}`);
      })
      .catch((err: unknown) => {
        push(err instanceof ApiError ? err.message : 'Conversation unavailable for this older anonymous feedback.', 'error');
      })
      .finally(() => setSavingId(null));
  }

  return (
    <div className="page">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Feedback</h1>
          <p className="page-copy">Recent visitor comments from the AI Trainers Assistant.</p>
        </div>
      </div>

      {summary ? (
        <div className="feedback-stat-grid">
          <article className="card p-4">
            <p className="m-0 text-[12px] font-semibold text-[var(--color-muted)]">Total Feedback</p>
            <p className="mt-1 mb-0 text-[28px] font-bold">{summary.total}</p>
          </article>
          <article className="card p-4">
            <p className="m-0 text-[12px] font-semibold text-[var(--color-muted)]">New</p>
            <p className="mt-1 mb-0 text-[28px] font-bold">{summary.newCount}</p>
          </article>
          <article className="card p-4">
            <p className="m-0 text-[12px] font-semibold text-[var(--color-muted)]">UX Confusion</p>
            <p className="mt-1 mb-0 text-[28px] font-bold">{summary.confusingCount}</p>
          </article>
          <article className="card p-4">
            <p className="m-0 text-[12px] font-semibold text-[var(--color-muted)]">Positive Ratings</p>
            <p className="mt-1 mb-0 text-[28px] font-bold">{summary.positiveRatings}</p>
          </article>
          <article className="card p-4">
            <p className="m-0 text-[12px] font-semibold text-[var(--color-muted)]">Problems</p>
            <p className="mt-1 mb-0 text-[28px] font-bold">{summary.problemCount}</p>
          </article>
        </div>
      ) : null}

      {summary?.areas.length ? (
        <section className="card mt-4 p-4">
          <h2 className="m-0 text-[15px] font-bold">Most Reported Areas</h2>
          <ul className="feedback-area-list">
            {summary.areas.map((area) => (
              <li key={area.label}>
                <span>{area.label}</span>
                <strong>{area.count}</strong>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {summary?.similar.length ? (
        <section className="card mt-4 p-4">
          <h2 className="m-0 text-[15px] font-bold">Similar feedback</h2>
          <ul className="feedback-area-list">
            {summary.similar.map((group) => (
              <li key={`${group.category}-${group.subcategory}-${group.pagePath}`}>
                <span>
                  {group.label}
                  {group.count > 1 ? ` · ${group.pagePath}` : ''}
                </span>
                <strong>{group.count} {group.count === 1 ? 'report' : 'reports'}</strong>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
                  <th>Reply</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <button type="button" className="feedback-row-btn" onClick={() => setSelected(item)}>
                        <strong>{CATEGORY_LABELS[item.category] ?? item.category}</strong>
                        {item.subcategory ? (
                          <div className="text-[12px] text-[var(--color-muted)]">{item.subcategory.replace(/_/g, ' ')}</div>
                        ) : null}
                      </button>
                    </td>
                    <td>
                      <code className="text-[12px]">{item.pagePath}</code>
                    </td>
                    <td>{item.rating ? RATING_LABELS[item.rating] ?? item.rating : '—'}</td>
                    <td className="max-w-[320px]">
                      <button type="button" className="feedback-row-btn" onClick={() => setSelected(item)}>
                        <span className="line-clamp-2">{clampMessage(item.message)}</span>
                      </button>
                    </td>
                    <td>{item.userId ? 'Logged in' : 'Anonymous'}{item.email ? ` · ${item.email}` : ''}</td>
                    <td>{relativeTime(item.createdAt)}</td>
                    <td>
                      <select
                        className="select"
                        value={item.status}
                        disabled={savingId === item.id}
                        aria-label={`Status for feedback ${item.id}`}
                        onChange={(event) => changeStatus(item, event.target.value as FeedbackStatus)}
                      >
                        {FEEDBACK_STATUSES.map((value) => (
                          <option key={value} value={value}>
                            {STATUS_LABELS[value]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="btn" onClick={() => setSelected(item)}>
                          View
                        </button>
                        {item.replyAvailable !== false && item.status !== 'spam' && item.status !== 'archived' ? (
                          <button type="button" className="btn btn-primary" disabled={savingId === item.id} onClick={() => reply(item)}>
                            Reply
                          </button>
                        ) : (
                          <span className="text-[12px] text-[var(--color-muted)]" title={item.replyUnavailableReason || undefined}>
                            {item.replyUnavailableReason || 'No conversation'}
                          </span>
                        )}
                        {item.status === 'new' ? (
                          <button type="button" className="btn" disabled={savingId === item.id} onClick={() => changeStatus(item, 'reviewed')}>
                            Mark Reviewed
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected ? (
        <div className="drawer-backdrop" onClick={() => setSelected(null)}>
          <aside className="drawer drawer-right p-5" onClick={(event) => event.stopPropagation()} aria-labelledby="feedback-detail-title">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="m-0 text-[12px] font-semibold text-[var(--color-muted)]">Feedback Detail</p>
                <h2 id="feedback-detail-title" className="mt-1 mb-0 text-[18px] font-bold">
                  {CATEGORY_LABELS[selected.category] ?? selected.category}
                </h2>
              </div>
              <button type="button" className="btn" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
            <dl className="feedback-detail-list">
              <div>
                <dt>Subcategory</dt>
                <dd>{selected.subcategory ? selected.subcategory.replace(/_/g, ' ') : '—'}</dd>
              </div>
              <div>
                <dt>Message</dt>
                <dd>{selected.message || '—'}</dd>
              </div>
              <div>
                <dt>Rating</dt>
                <dd>{selected.rating ? RATING_LABELS[selected.rating] : '—'}</dd>
              </div>
              <div>
                <dt>Page</dt>
                <dd>{selected.pagePath}</dd>
              </div>
              <div>
                <dt>From</dt>
                <dd>
                  {selected.candidateName || (selected.userId ? 'Logged in visitor' : 'Anonymous visitor')}
                  {selected.email ? ` · ${selected.email}` : ''}
                </dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd>{relativeTime(selected.createdAt)}</dd>
              </div>
              <div>
                <dt>Journey stage</dt>
                <dd>{selected.journeyLabel || 'Visitor'}</dd>
              </div>
              <div>
                <dt>Acquisition source</dt>
                <dd>{selected.firstSource || '—'}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <select
                    className="select"
                    value={selected.status}
                    disabled={savingId === selected.id}
                    onChange={(event) => changeStatus(selected, event.target.value as FeedbackStatus)}
                  >
                    {FEEDBACK_STATUSES.map((value) => (
                      <option key={value} value={value}>
                        {STATUS_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </dd>
              </div>
              <div>
                <dt>Conversation status</dt>
                <dd>{selected.conversationStatus ? selected.conversationStatus.replace(/_/g, ' ') : '—'}</dd>
              </div>
              <div>
                <dt>Last team reply</dt>
                <dd>
                  {selected.lastTeamReplyAt
                    ? `${relativeTime(selected.lastTeamReplyAt)}${selected.lastTeamReplyPreview ? ` · ${selected.lastTeamReplyPreview}` : ''}`
                    : 'None yet'}
                </dd>
              </div>
              <div>
                <dt>Unread</dt>
                <dd>{selected.unreadForVisitor ? 'Visitor has not seen the latest team reply' : 'No unread team reply'}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {selected.replyAvailable !== false && selected.status !== 'spam' && selected.status !== 'archived' ? (
                <button type="button" className="btn btn-primary" disabled={savingId === selected.id} onClick={() => reply(selected)}>
                  Open Conversation
                </button>
              ) : (
                <p className="m-0 text-[13px] text-[var(--color-muted)]">
                  {selected.replyUnavailableReason || 'Conversation unavailable for this older anonymous feedback.'}
                </p>
              )}
              {selected.status === 'new' ? (
                <button type="button" className="btn" disabled={savingId === selected.id} onClick={() => changeStatus(selected, 'reviewed')}>
                  Mark Reviewed
                </button>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

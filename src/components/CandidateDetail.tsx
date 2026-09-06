import { ChevronLeft, ChevronRight, Copy, ExternalLink, Github, Linkedin, Mail, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { addNote, getApplication, patchApplication, patchIntroCallAttendance } from '../lib/api';
import { ApiError } from '../lib/http';
import { ATTENDANCE_LABELS, formatDateTime, formatIpAddress, formatIpPlace, initials, PIPELINE_LABELS, SITUATION_LABELS, sourceLabel } from '../lib/labels';
import { PIPELINE_STAGES, type Application, type PipelineStage } from '../types';
import ActivityTimeline from './ActivityTimeline';
import AdminNotes from './AdminNotes';
import ApplicationStageBadge from './ApplicationStageBadge';
import CandidateJourney from './CandidateJourney';
import CandidateSnapshot from './CandidateSnapshot';
import ConfirmDialog from './ConfirmDialog';
import JourneyStageBadge from './JourneyStageBadge';
import PlatformProgressPanel from './PlatformProgressPanel';
import { useToast } from './Toast';

export default function CandidateDetail({
  id,
  onClose,
}: {
  id: string;
  onClose?: () => void;
}) {
  const { push } = useToast();
  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noteBusy, setNoteBusy] = useState(false);
  const [tag, setTag] = useState('');
  const [pendingStage, setPendingStage] = useState<PipelineStage | null>(null);

  useEffect(() => {
    let cancelled = false;
    setApplication(null);
    setError(null);
    getApplication(id)
      .then((result) => {
        if (!cancelled) setApplication(result.application);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Could not load this applicant.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function save(body: Parameters<typeof patchApplication>[1], success: string) {
    if (!application) return;
    const previous = application;
    try {
      const result = await patchApplication(id, body);
      setApplication(result.application);
      push(success);
    } catch (err) {
      setApplication(previous);
      push(err instanceof ApiError ? err.message : 'Update failed', 'error');
    }
  }

  async function markAttendance(bookingId: string, attendance: 'attended' | 'no_show' | 'completed') {
    try {
      await patchIntroCallAttendance(bookingId, attendance);
      const fresh = await getApplication(id);
      setApplication(fresh.application);
      push(
        attendance === 'attended'
          ? 'Intro call marked attended'
          : attendance === 'no_show'
            ? 'Intro call marked no-show'
            : 'Intro call marked completed',
      );
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not update intro call', 'error');
    }
  }

  if (error) {
    return (
      <div className="page">
        <p>{error}</p>
        {onClose ? (
          <button type="button" className="btn" onClick={onClose}>
            Back
          </button>
        ) : (
          <Link to="/admin/applications" className="btn">
            Back to applications
          </Link>
        )}
      </div>
    );
  }

  if (!application) {
    return (
      <div className="page grid gap-3">
        <div className="skeleton h-16" />
        <div className="skeleton h-32" />
        <div className="skeleton h-48" />
      </div>
    );
  }

  const situation =
    application.candidateSituation ??
    (application.applicant_stage ? SITUATION_LABELS[application.applicant_stage] : undefined) ??
    'Unknown';

  return (
    <div className="page">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {onClose ? (
            <button type="button" className="btn" onClick={onClose} aria-label="Close applicant">
              <ChevronLeft size={16} />
            </button>
          ) : (
            <Link to="/admin/applications" className="btn" aria-label="Back to applications">
              <ChevronLeft size={16} />
            </Link>
          )}
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#eef2ff] text-[14px] font-bold text-[#4338ca]">
            {initials(application.fullName)}
          </span>
          <div className="min-w-0">
            <h1 className="page-title truncate">{application.fullName}</h1>
            <p className="page-copy">
              {[application.profession, application.location || [application.city, application.state].filter(Boolean).join(', '), application.timezone]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {application.previousId ? (
            <Link className="btn" to={`/admin/applications/${application.previousId}`} aria-label="Previous applicant">
              <ChevronLeft size={16} />
            </Link>
          ) : (
            <button type="button" className="btn" disabled aria-label="No previous applicant">
              <ChevronLeft size={16} />
            </button>
          )}
          {application.nextId ? (
            <Link className="btn" to={`/admin/applications/${application.nextId}`} aria-label="Next applicant">
              <ChevronRight size={16} />
            </Link>
          ) : (
            <button type="button" className="btn" disabled aria-label="No next applicant">
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <JourneyStageBadge stage={application.journeyStage} />
        <ApplicationStageBadge stage={application.pipelineStage} />
        <span className="text-[13px] text-[var(--color-muted)]">Submitted {formatDateTime(application.submittedAt)}</span>
      </div>

      <div className="mt-5">
        <CandidateSnapshot
          items={[
            { label: 'Situation', value: situation },
            { label: 'Experience', value: application.experienceLabel },
            { label: 'Primary specialization', value: application.profession },
            { label: 'Location', value: application.location || [application.city, application.state].filter(Boolean).join(', ') || '—' },
            { label: 'Timezone', value: application.timezone },
            { label: 'Source', value: sourceLabel(application.firstSource) },
            { label: 'IP address', value: formatIpAddress(application) },
            { label: 'IP location', value: formatIpPlace(application) },
            { label: 'Last activity', value: formatDateTime(application.lastActivityAt ?? application.updatedAt) },
          ]}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-4">
          <CandidateJourney events={application.journeyEvents ?? []} source={application.firstSource} />

          <section className="card p-4">
            <h2 className="m-0 text-[15px] font-bold">Acquisition</h2>
            <p className="mt-1 mb-0 text-[12px] text-[var(--color-muted)]">
              First-touch source is preserved. Later visits do not overwrite it.
            </p>
            <dl className="mt-3 mb-0 grid gap-2 text-[13px]">
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-[var(--color-muted)]">Source</dt>
                <dd className="m-0 font-semibold">{sourceLabel(application.firstSource)}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-[var(--color-muted)]">Landing page</dt>
                <dd className="m-0 break-all">{application.visitor?.landingPage || '—'}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-[var(--color-muted)]">Referrer</dt>
                <dd className="m-0 break-all">{application.visitor?.referrer || '—'}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-[var(--color-muted)]">UTM</dt>
                <dd className="m-0 text-right">
                  {[
                    application.utmSource || application.visitor?.utmSource,
                    application.utmMedium || application.visitor?.utmMedium,
                    application.utmCampaign || application.visitor?.utmCampaign,
                  ]
                    .filter(Boolean)
                    .join(' / ') || '—'}
                </dd>
              </div>
              {(application.utmContent || application.visitor?.utmContent || application.utmTerm || application.visitor?.utmTerm) ? (
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-[var(--color-muted)]">Content / term</dt>
                  <dd className="m-0">
                    {[application.utmContent || application.visitor?.utmContent, application.utmTerm || application.visitor?.utmTerm]
                      .filter(Boolean)
                      .join(' / ')}
                  </dd>
                </div>
              ) : null}
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-[var(--color-muted)]">First seen</dt>
                <dd className="m-0">{formatDateTime(application.visitor?.firstSeenAt)}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-[var(--color-muted)]">IP address</dt>
                <dd className="m-0 font-semibold">{formatIpAddress(application)}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-[var(--color-muted)]">IP location</dt>
                <dd className="m-0">{formatIpPlace(application)}</dd>
              </div>
              {application.referral_source ? (
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-[var(--color-muted)]">Form referral</dt>
                  <dd className="m-0">{application.referral_source}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="card p-4">
            <h2 className="m-0 text-[15px] font-bold">Contact</h2>
            <ul className="mt-3 mb-0 grid gap-2 p-0 list-none">
              <li className="flex flex-wrap items-center gap-2">
                <Mail size={16} aria-hidden="true" />
                <a href={`mailto:${application.email}`}>{application.email}</a>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    void navigator.clipboard.writeText(application.email);
                    push('Email copied');
                  }}
                >
                  <Copy size={14} /> Copy
                </button>
              </li>
              {application.phone ? (
                <li className="flex items-center gap-2">
                  <Phone size={16} aria-hidden="true" />
                  <a href={`tel:${application.phone}`}>{application.phone}</a>
                </li>
              ) : null}
              {application.linkedinUrl ? (
                <li className="flex items-center gap-2">
                  <Linkedin size={16} aria-hidden="true" />
                  <a href={application.linkedinUrl} target="_blank" rel="noreferrer">
                    LinkedIn <ExternalLink size={12} />
                  </a>
                </li>
              ) : null}
              {application.githubUrl ? (
                <li className="flex items-center gap-2">
                  <Github size={16} aria-hidden="true" />
                  <a href={application.githubUrl} target="_blank" rel="noreferrer">
                    GitHub <ExternalLink size={12} />
                  </a>
                </li>
              ) : null}
            </ul>
          </section>

          <section className="card p-4">
            <h2 className="m-0 text-[15px] font-bold">Application</h2>
            <p className="mt-3 mb-0 whitespace-pre-wrap">
              {application.interestReason?.trim()
                ? application.interestReason
                : 'No written interest response was included with this application. The public form currently collects situation, profession, and contact details.'}
            </p>
            {application.referral_source ? (
              <p className="mt-3 mb-0 text-[13px] text-[var(--color-muted)]">Referral: {application.referral_source}</p>
            ) : null}
          </section>

          <section className="card p-4">
            <h2 className="m-0 text-[15px] font-bold">Resume</h2>
            <p className="mt-2 mb-0 text-[var(--color-muted)]">
              {application.resume
                ? application.resume.fileName
                : 'No resume was attached to this application.'}
            </p>
          </section>

          <AdminNotes
            notes={application.notes ?? []}
            busy={noteBusy}
            onAdd={async (body) => {
              setNoteBusy(true);
              try {
                await addNote(id, body);
                const fresh = await getApplication(id);
                setApplication(fresh.application);
                push('Note saved');
              } catch (err) {
                push(err instanceof ApiError ? err.message : 'Could not save note', 'error');
                throw err;
              } finally {
                setNoteBusy(false);
              }
            }}
          />

          <ActivityTimeline items={application.activities ?? []} />
        </div>

        <aside className="grid gap-4 self-start">
          <section className="card p-4">
            <h2 className="m-0 text-[15px] font-bold">Admin workspace</h2>
            <label className="mt-3 grid gap-1 text-[13px] font-semibold">
              Stage
              <select
                className="select"
                value={application.pipelineStage}
                onChange={(event) => {
                  const stage = event.target.value as PipelineStage;
                  if (stage === 'REJECTED' || stage === 'ARCHIVED') {
                    setPendingStage(stage);
                    return;
                  }
                  void save({ pipelineStage: stage }, `Moved to ${PIPELINE_LABELS[stage]}`);
                }}
              >
                {PIPELINE_STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {PIPELINE_LABELS[stage]}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 grid gap-1 text-[13px] font-semibold">
              Assignee
              <input
                className="field"
                defaultValue={application.assignee ?? ''}
                key={application.assignee ?? 'none'}
                onBlur={(event) => {
                  const next = event.target.value.trim() || null;
                  if (next === application.assignee) return;
                  void save({ assignee: next }, next ? `Assigned to ${next}` : 'Assignee cleared');
                }}
              />
            </label>
            <label className="mt-3 grid gap-1 text-[13px] font-semibold">
              Next action
              <input
                className="field"
                type="datetime-local"
                value={toLocalInput(application.nextActionAt)}
                onChange={(event) => {
                  void save(
                    { nextActionAt: event.target.value ? new Date(event.target.value).toISOString() : null },
                    'Next action updated',
                  );
                }}
              />
            </label>
            <label className="mt-3 grid gap-1 text-[13px] font-semibold">
              Demo scheduled
              <input
                className="field"
                type="datetime-local"
                value={toLocalInput(application.demoScheduledAt)}
                onChange={(event) => {
                  void save(
                    { demoScheduledAt: event.target.value ? new Date(event.target.value).toISOString() : null },
                    'Demo time updated',
                  );
                }}
              />
            </label>
            <div className="mt-3">
              <p className="m-0 text-[13px] font-semibold">Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {application.tags.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="chip bg-[#eef2ff] text-[#3730a3]"
                    onClick={() =>
                      void save(
                        { tags: application.tags.filter((tagName) => tagName !== item) },
                        `Removed ${item}`,
                      )
                    }
                  >
                    {item} ×
                  </button>
                ))}
              </div>
              <form
                className="mt-2 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const next = tag.trim();
                  if (!next) return;
                  void save({ addTag: next }, `Added ${next}`);
                  setTag('');
                }}
              >
                <input className="field" value={tag} onChange={(event) => setTag(event.target.value)} placeholder="Add tag" />
                <button type="submit" className="btn" disabled={!tag.trim()}>
                  Add
                </button>
              </form>
            </div>
          </section>

          {application.bookings?.length ? (
            <section className="card p-4">
              <h2 className="m-0 text-[15px] font-bold">Intro calls</h2>
              <p className="mt-1 mb-0 text-[12px] text-[var(--color-muted)]">
                AI Trainers intro call attendance, not an external platform interview.
              </p>
              <ul className="mt-3 mb-0 grid gap-2 p-0 list-none">
                {application.bookings.map((booking) => (
                  <li key={booking.id}>
                    <strong>{formatDateTime(booking.startsAt)}</strong>
                    <div className="text-[13px] text-[var(--color-muted)]">
                      {ATTENDANCE_LABELS[booking.attendance ?? (booking.status === 'cancelled' ? 'cancelled' : 'scheduled')]}
                    </div>
                    {booking.status === 'confirmed' ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button type="button" className="btn" onClick={() => void markAttendance(booking.id, 'attended')}>
                          Mark attended
                        </button>
                        <button type="button" className="btn" onClick={() => void markAttendance(booking.id, 'no_show')}>
                          Mark no-show
                        </button>
                        <button type="button" className="btn" onClick={() => void markAttendance(booking.id, 'completed')}>
                          Mark completed
                        </button>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <PlatformProgressPanel
            applicationId={application.id}
            items={application.platformProgress ?? []}
            onUpdated={(next, platforms, events) =>
              setApplication({
                ...next,
                platformProgress: platforms,
                journeyEvents: events ?? next.journeyEvents,
              })
            }
          />
        </aside>
      </div>

      <ConfirmDialog
        open={pendingStage != null}
        title={pendingStage === 'REJECTED' ? 'Reject this applicant?' : 'Archive this applicant?'}
        body="This updates admin pipeline status only. The original application submission is preserved."
        confirmLabel={pendingStage === 'REJECTED' ? 'Reject' : 'Archive'}
        danger
        onCancel={() => setPendingStage(null)}
        onConfirm={() => {
          if (!pendingStage) return;
          const stage = pendingStage;
          setPendingStage(null);
          void save({ pipelineStage: stage }, `Moved to ${PIPELINE_LABELS[stage]}`);
        }}
      />
    </div>
  );
}

function toLocalInput(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

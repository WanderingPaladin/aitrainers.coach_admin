import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cancelBooking, getApplication, updateApplicationStatus } from '../api';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { STATUSES, formatYearsOfAiTraining, type ApplicationDetail, type ApplicationStatus } from '../types';

function formatWhen(value: string, timeZone?: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(value));
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{value || '—'}</dd>
    </div>
  );
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!id) return;
    try {
      const result = await getApplication(id);
      setApplication(result.application);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load application.');
    }
  }

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 8000);
    return () => window.clearInterval(timer);
  }, [id]);

  async function onStatus(status: ApplicationStatus) {
    if (!id) return;
    setSaving(true);
    try {
      await updateApplicationStatus(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update status.');
    } finally {
      setSaving(false);
    }
  }

  async function onCancelBooking(bookingId: string) {
    if (!window.confirm('Cancel this intro call?')) return;
    setSaving(true);
    try {
      await cancelBooking(bookingId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not cancel booking.');
    } finally {
      setSaving(false);
    }
  }

  if (!application && !error) {
    return (
      <Layout title="Application">
        <p className="text-sm text-slate-500">Loading…</p>
      </Layout>
    );
  }

  if (!application) {
    return (
      <Layout title="Application">
        <p className="text-sm text-rose-600">{error}</p>
      </Layout>
    );
  }

  return (
    <Layout title={application.fullName}>
      <Link to="/" className="text-sm font-semibold text-sky-700 hover:underline">
        ← All applications
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{application.fullName}</h2>
          <p className="mt-1 text-slate-500">{application.email}</p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-semibold">Status</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              disabled={saving || status === application.status}
              onClick={() => onStatus(status)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
                status === application.status
                  ? 'border-slate-800 bg-slate-800 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
              } disabled:opacity-50`}
            >
              {status}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-5 md:grid-cols-2">
        <dl className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
          <Field label="Phone" value={application.phone} />
          <Field label="City / state" value={`${application.city}, ${application.state}`} />
          <Field label="Profession" value={application.profession} />
          <Field label="Years of AI training" value={formatYearsOfAiTraining(application.yearsOfExperience)} />
          <Field label="Timezone" value={application.timezone} />
          <Field label="Applied" value={formatWhen(application.createdAt)} />
          <Field label="IP" value={application.ipAddress} />
          <Field label="IP location" value={application.ipLocation} />
          <Field label="LinkedIn" value={application.linkedinUrl} />
          <Field label="Path" value={application.path.replace('_', ' ')} />
          <Field
            label="Applicant stage"
            value={
              application.applicant_stage === 'new_no_account'
                ? "New, no account yet"
                : application.applicant_stage === 'has_accounts_no_time'
                  ? 'Has accounts, not enough time'
                  : application.applicant_stage === 'working_no_progress'
                    ? 'Working, not enough progress'
                    : application.applicant_stage
            }
          />
          <Field label="Where they found us" value={application.referral_source} />
          <Field
            label="U.S. eligibility"
            value={application.us_eligibility_confirmed ? 'Confirmed' : 'Not confirmed'}
          />
        </dl>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold">Intro calls</h3>
          {application.bookings.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No intro call booked yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {application.bookings.map((booking) => (
                <li key={booking.id} className="rounded-xl border border-slate-100 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold capitalize">{booking.status}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {formatWhen(booking.startsAt, application.timezone)}
                      </p>
                      {booking.meetingUrl ? (
                        <a
                          className="mt-2 inline-block text-sm font-semibold text-sky-700 hover:underline"
                          href={booking.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Join meeting
                        </a>
                      ) : null}
                    </div>
                    {booking.status === 'confirmed' ? (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => onCancelBooking(booking.id)}
                        className="text-xs font-semibold text-rose-600 hover:underline"
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </Layout>
  );
}

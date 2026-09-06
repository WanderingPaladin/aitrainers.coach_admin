import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cancelBooking, listBookings, patchIntroCallAttendance } from '../lib/api';
import { ApiError } from '../lib/http';
import { ATTENDANCE_LABELS, formatDateTime } from '../lib/labels';
import type { Booking, IntroCallAttendance } from '../types';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

export default function CalendarPage() {
  const { push } = useToast();
  const [items, setItems] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  function reload() {
    return listBookings({ pageSize: 100, status: 'confirmed' })
      .then((result) => setItems(result.items))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'Could not load demo calls.'));
  }

  async function markAttendance(bookingId: string, attendance: IntroCallAttendance) {
    try {
      await patchIntroCallAttendance(bookingId, attendance);
      push(attendance === 'attended' ? 'Marked attended' : attendance === 'no_show' ? 'Marked no-show' : 'Attendance updated');
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not update attendance', 'error');
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  const upcoming = items.filter((item) => new Date(item.startsAt).getTime() >= Date.now());
  const past = items.filter((item) => new Date(item.startsAt).getTime() < Date.now());

  return (
    <div className="page">
      <h1 className="page-title">Demo calls</h1>
      <p className="page-copy">Intro calls booked from the public application flow.</p>
      {error ? <p className="mt-4" role="alert">{error}</p> : null}

      <section className="card mt-5 p-4">
        <h2 className="m-0 text-[15px] font-bold">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="mt-2 mb-0 text-[13px] text-[var(--color-muted)]">No upcoming intro calls.</p>
        ) : (
          <ul className="mt-3 mb-0 grid gap-2 p-0 list-none">
            {upcoming.map((booking) => (
              <li key={booking.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--color-line)] p-3">
                <div>
                  <strong>{booking.application?.fullName ?? 'Applicant'}</strong>
                  <div className="text-[13px] text-[var(--color-muted)]">
                    {formatDateTime(booking.startsAt)}
                    {booking.attendance ? ` · ${ATTENDANCE_LABELS[booking.attendance]}` : ''}
                  </div>
                </div>
                <div className="flex gap-2">
                  {booking.application ? (
                    <Link className="btn" to={`/admin/applications/${booking.application.id}`}>
                      Open
                    </Link>
                  ) : null}
                  <button type="button" className="btn btn-danger" onClick={() => setCancelId(booking.id)}>
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card mt-4 p-4">
        <h2 className="m-0 text-[15px] font-bold">Past</h2>
        {past.length === 0 ? (
          <p className="mt-2 mb-0 text-[13px] text-[var(--color-muted)]">No past intro calls.</p>
        ) : (
          <ul className="mt-3 mb-0 grid gap-2 p-0 list-none">
            {past.map((booking) => (
              <li key={booking.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  <strong>{booking.application?.fullName ?? 'Applicant'}</strong>
                  <span className="ml-2 text-[13px] text-[var(--color-muted)]">
                    {formatDateTime(booking.startsAt)}
                    {booking.attendance ? ` · ${ATTENDANCE_LABELS[booking.attendance]}` : ''}
                  </span>
                </span>
                <span className="flex flex-wrap gap-2">
                  {booking.attendance !== 'attended' && booking.attendance !== 'completed' ? (
                    <>
                      <button type="button" className="btn" onClick={() => void markAttendance(booking.id, 'attended')}>
                        Attended
                      </button>
                      <button type="button" className="btn" onClick={() => void markAttendance(booking.id, 'no_show')}>
                        No-show
                      </button>
                    </>
                  ) : null}
                  {booking.application ? (
                    <Link className="btn" to={`/admin/applications/${booking.application.id}`}>
                      Open
                    </Link>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={cancelId != null}
        title="Cancel this intro call?"
        body="The applicant will be emailed and the slot will open again."
        confirmLabel="Cancel call"
        danger
        onCancel={() => setCancelId(null)}
        onConfirm={() => {
          const target = cancelId;
          setCancelId(null);
          if (!target) return;
          void cancelBooking(target)
            .then(() => {
              push('Intro call cancelled');
              return reload();
            })
            .catch((err: unknown) => push(err instanceof ApiError ? err.message : 'Cancel failed', 'error'));
        }}
      />
    </div>
  );
}

import { JOURNEY_EVENT_LABELS, formatDate, sourceLabel } from '../lib/labels';
import type { JourneyEvent } from '../types';

function eventCopy(event: JourneyEvent): string {
  const base = JOURNEY_EVENT_LABELS[event.eventType] ?? event.eventType.replace(/_/g, ' ');
  if (event.platform) {
    return `${base}: ${event.platform}`;
  }
  if (event.eventType === 'site_visited') {
    const source = typeof event.metadata === 'object' && event.metadata && 'source' in event.metadata
      ? String((event.metadata as { source?: string }).source)
      : null;
    return source ? `${base}. Source: ${sourceLabel(source)}` : base;
  }
  return base;
}

export default function CandidateJourney({
  events,
  source,
}: {
  events: JourneyEvent[];
  source?: string | null;
}) {
  const items = events.filter((event) => event.eventType !== 'page_view');
  if (items.length === 0) {
    return (
      <section className="card p-4">
        <h2 className="m-0 text-[15px] font-bold">Candidate journey</h2>
        <p className="mt-2 mb-0 text-[13px] text-[var(--color-muted)]">
          No tracking events yet. Historical applications keep their real submission and booking dates, but visitor
          events are only recorded after tracking launched.
        </p>
      </section>
    );
  }

  return (
    <section className="card p-4">
      <h2 className="m-0 text-[15px] font-bold">Candidate journey</h2>
      {source ? (
        <p className="mt-1 mb-0 text-[13px] text-[var(--color-muted)]">First-touch source: {sourceLabel(source)}</p>
      ) : null}
      <ol className="journey-timeline">
        {items.map((event) => (
          <li key={event.id}>
            <span className="journey-date">{formatDate(event.createdAt)}</span>
            <strong>{eventCopy(event)}</strong>
            {event.pagePath && event.eventType !== 'page_view' ? (
              <span className="block text-[12px] text-[var(--color-muted)]">{event.pagePath}</span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

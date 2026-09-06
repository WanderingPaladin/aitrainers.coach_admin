import { JOURNEY_LABELS } from '../lib/labels';
import type { JourneyStage } from '../types';

export default function JourneyStageBadge({ stage }: { stage?: JourneyStage | null }) {
  if (!stage) {
    return <span className="chip journey-unknown">Applied</span>;
  }
  return (
    <span className={`chip journey-${stage}`} title={JOURNEY_LABELS[stage]}>
      {JOURNEY_LABELS[stage]}
    </span>
  );
}

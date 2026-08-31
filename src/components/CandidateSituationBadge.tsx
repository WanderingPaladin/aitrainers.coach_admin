import { SITUATION_LABELS } from '../lib/labels';
import type { ApplicantStage } from '../types';

export default function CandidateSituationBadge({
  stage,
  label,
}: {
  stage: ApplicantStage | null;
  label?: string | null;
}) {
  const text = label ?? (stage ? SITUATION_LABELS[stage] : 'Unknown');
  return <span className="chip situation-chip">{text}</span>;
}

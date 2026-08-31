import { PIPELINE_HINTS, PIPELINE_LABELS } from '../lib/labels';
import type { PipelineStage } from '../types';

export default function ApplicationStageBadge({ stage }: { stage: PipelineStage }) {
  return (
    <span className={`chip stage-${stage}`} title={PIPELINE_HINTS[stage]}>
      <span aria-hidden="true">●</span>
      {PIPELINE_LABELS[stage]}
    </span>
  );
}

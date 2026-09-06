import { ChevronRight } from 'lucide-react';
import { formatPercent } from '../lib/labels';
import type { FunnelConversion, FunnelStage } from '../types';

export default function ConversionFunnel({
  stages,
  conversions,
}: {
  stages: FunnelStage[];
  conversions: FunnelConversion[];
}) {
  const conversionByFrom = new Map(conversions.map((item) => [item.from, item]));
  const max = Math.max(...stages.map((stage) => stage.count), 1);

  return (
    <div className="funnel">
      {stages.map((stage, index) => {
        const conversion = conversionByFrom.get(stage.key);
        return (
          <div key={stage.key} className="funnel-item">
            <article className="funnel-card">
              <p className="funnel-label">{stage.label}</p>
              <p className="funnel-count">{stage.count.toLocaleString()}</p>
              <span className="funnel-bar" style={{ width: `${Math.max(8, (stage.count / max) * 100)}%` }} />
            </article>
            {index < stages.length - 1 ? (
              <div className="funnel-connector" aria-hidden="true">
                <ChevronRight size={16} />
                <span>{conversion ? formatPercent(conversion.conversion) : '—'}</span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

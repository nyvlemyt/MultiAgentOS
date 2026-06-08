import { RiskBadge } from './RiskBadge';

export interface TimelineRow {
  id: string;
  ts: string;
  agent: string;
  action: string;
  tokens?: number;
  risk?: 'low' | 'medium' | 'high' | 'blocking';
  filesTouched?: string[];
  skills?: string[];
}

export function Timeline({ rows }: Readonly<{ rows: TimelineRow[] }>) {
  return (
    <ol className="flex flex-col gap-2">
      {rows.map((r) => (
        <li key={r.id} className="surface flex items-center gap-3 px-3 py-2">
          <span className="mono text-[10px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
            {r.ts}
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{r.agent}</span>
          <span className="flex-1 truncate text-xs" style={{ color: 'var(--text-secondary)' }}>{r.action}</span>
          {r.skills && r.skills.length > 0 && (
            <span className="mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{r.skills.join(', ')}</span>
          )}
          {typeof r.tokens === 'number' && (
            <span className="mono text-[10px] tabular-nums" style={{ color: 'var(--text-muted)' }}>{r.tokens}t</span>
          )}
          {r.risk && <RiskBadge risk={r.risk} />}
        </li>
      ))}
    </ol>
  );
}

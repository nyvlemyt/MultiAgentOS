import Link from 'next/link';
import { AgentAvatar } from './AgentAvatar';
import { Sparkline } from './Sparkline';

export interface AgentCardData {
  id: string;
  name: string;
  emoji?: string | null;
  avatarPath?: string | null;
  tier: 'A' | 'B';
  status: 'idle' | 'running' | 'blocked' | 'waiting' | 'done';
  currentTask?: string;
  model: string;
  successRate: number;
  totalTokens: number;
  spark?: number[];
}

export function AgentCard({ a }: { a: AgentCardData }) {
  const href = `/agents/${a.id}`;
  return (
    <Link href={href} className="surface group flex flex-col gap-3 px-4 py-3 transition-colors hover:bg-[color:var(--bg-hover)]">
      <div className="flex items-start gap-3">
        <AgentAvatar src={a.avatarPath ?? undefined} alt={a.name} status={a.status} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{a.name}</span>
            <span className="text-xs">{a.emoji}</span>
            <span className="ml-auto text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>tier {a.tier}</span>
          </div>
          <div className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>
            {a.currentTask ?? <span style={{ color: 'var(--text-muted)' }}>idle</span>}
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{a.model}</span>
          <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            <span className="mono tabular-nums">{Math.round(a.successRate * 100)}%</span> success ·{' '}
            <span className="mono tabular-nums">{(a.totalTokens / 1000).toFixed(1)}k</span> tokens
          </span>
        </div>
        {a.spark && <Sparkline data={a.spark} width={70} height={20} />}
      </div>
    </Link>
  );
}

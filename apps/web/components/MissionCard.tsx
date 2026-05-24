import Link from 'next/link';
import { RiskBadge } from './RiskBadge';
import { BudgetBar } from './BudgetBar';
import { AgentAvatar } from './AgentAvatar';

export interface MissionCardData {
  id: string;
  title: string;
  agents: { name: string; avatarPath?: string | null }[];
  skills: string[];
  risk: 'low' | 'medium' | 'high' | 'blocking';
  budgetSpent: number;
  budgetCap: number;
}

export function MissionCard({ m }: { m: MissionCardData }) {
  return (
    <Link
      href={`/missions/${m.id}`}
      className="surface flex flex-col gap-2 px-3 py-3 transition-colors hover:bg-[color:var(--bg-hover)]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>{m.title}</span>
        <RiskBadge risk={m.risk} />
      </div>
      <div className="flex flex-wrap gap-1">
        {m.skills.slice(0, 3).map((s) => (
          <span key={s} className="rounded-sm px-1.5 py-0.5 text-[10px]" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
            {s}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {m.agents.slice(0, 3).map((a, i) => (
            <AgentAvatar key={i} src={a.avatarPath ?? undefined} alt={a.name} status="running" size={22} />
          ))}
        </div>
        <BudgetBar spent={m.budgetSpent} cap={m.budgetCap} />
      </div>
    </Link>
  );
}

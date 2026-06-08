import { AgentAvatar } from '../AgentAvatar';
import type { OrbitNode } from './OrbitView';

export function OrgChartView({ nodes }: Readonly<{ nodes: OrbitNode[] }>) {
  const tierA = nodes.filter((n) => n.tier === 'A');
  const tierB = nodes.filter((n) => n.tier === 'B');

  return (
    <div className="surface flex flex-col items-center gap-6 p-6">
      <div className="flex flex-col items-center gap-1">
        {tierA[0] && <AgentAvatar src={tierA[0].avatarPath ?? undefined} alt={tierA[0].name} status="running" size={44} />}
        <span className="text-xs font-medium">{tierA[0]?.name ?? 'Mission Planner'}</span>
      </div>
      <div className="h-4 w-px" style={{ background: 'var(--border-default)' }} />
      <div className="grid grid-cols-5 gap-4">
        {tierA.slice(1).map((n) => (
          <div key={n.id} className="flex flex-col items-center gap-1 text-center">
            <AgentAvatar src={n.avatarPath ?? undefined} alt={n.name} status={n.status} size={36} />
            <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{n.name}</span>
          </div>
        ))}
      </div>
      <div className="h-4 w-px" style={{ background: 'var(--border-default)' }} />
      <div className="flex flex-wrap justify-center gap-3">
        {tierB.map((n) => (
          <div key={n.id} className="flex flex-col items-center gap-1 text-center">
            <AgentAvatar src={n.avatarPath ?? undefined} alt={n.name} status={n.status} size={28} />
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{n.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

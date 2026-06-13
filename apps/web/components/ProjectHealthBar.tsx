import type { ProjectHealth } from '@/lib/health';

function Stat({ label, value, accent }: Readonly<{ label: string; value: string; accent?: string }>) {
  return (
    <div className="flex flex-col">
      <span className="mono tabular-nums text-sm font-semibold" style={{ color: accent ?? 'var(--text-primary)' }}>{value}</span>
      <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}

/** Compact server-rendered status bar. No client JS, no LLM. */
export function ProjectHealthBar({ health }: Readonly<{ health: ProjectHealth }>) {
  const deadline = health.nextDeadline ? health.nextDeadline.toISOString().slice(0, 10) : '—';
  return (
    <div className="flex flex-wrap items-center gap-5" data-testid="project-health">
      <Stat label="missions" value={String(health.missionsTotal)} />
      <Stat label="done" value={String(health.missionsDone)} accent="var(--success)" />
      <Stat label="blocked" value={String(health.missionsBlocked)} accent={health.missionsBlocked > 0 ? 'var(--danger)' : undefined} />
      <Stat label="open ideas" value={String(health.openIdeas)} />
      <Stat label="validations" value={String(health.pendingValidations)} accent={health.pendingValidations > 0 ? 'var(--warning)' : undefined} />
      <Stat label="budget used" value={`${health.budgetUsedPct}%`} />
      <Stat label="next deadline" value={deadline} />
    </div>
  );
}

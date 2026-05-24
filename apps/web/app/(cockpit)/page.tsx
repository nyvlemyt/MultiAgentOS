import { Sparkline } from '@/components/Sparkline';
import { AgentAvatar } from '@/components/AgentAvatar';
import { RiskBadge } from '@/components/RiskBadge';
import { BudgetBar } from '@/components/BudgetBar';
import { Timeline } from '@/components/Timeline';
import { allAgents, missions, trace, dailyTokens } from '@/lib/fixtures';
import Link from 'next/link';

export default function CommandCenter() {
  const busy = allAgents.filter((a) => a.status === 'running');
  const blocked: typeof missions = [];
  const pendingValidations = missions.filter((m) => m.risk === 'high');

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Command Center</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>1 project active · {missions.length} missions in flight · {busy.length} agents working</p>
        </div>
        <Link href="/missions" className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[color:var(--bg-hover)]" style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>New mission</Link>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card title="Active projects" subtitle="last active 15 min ago">
          <Link href="/projects/otakugo" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md" style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-soft))' }} />
            <div>
              <div className="text-sm font-semibold">OtakuGO_UP</div>
              <div className="text-[11px] mono" style={{ color: 'var(--text-muted)' }}>/Users/melvyn/.../OtakuGO_UP</div>
            </div>
          </Link>
        </Card>

        <Card title="Missions in flight" subtitle={`${missions.length} active`}>
          <ul className="space-y-1.5">
            {missions.slice(0, 3).map((m) => (
              <li key={m.id} className="flex items-center justify-between text-xs">
                <span className="truncate" style={{ color: 'var(--text-primary)' }}>{m.title}</span>
                <RiskBadge risk={m.risk} />
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Agents busy" subtitle={`${busy.length} running`}>
          <div className="flex flex-wrap gap-1.5">
            {busy.map((a) => (
              <AgentAvatar key={a.id} src={a.avatarPath ?? undefined} alt={a.name} status="running" size={32} />
            ))}
            {busy.length === 0 && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>All idle.</span>}
          </div>
        </Card>

        <Card title="Blocked" subtitle={`${blocked.length} tasks`} accent={blocked.length > 0 ? 'danger' : undefined}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>None right now.</p>
        </Card>

        <Card title="Pending validations" subtitle={`${pendingValidations.length} action${pendingValidations.length !== 1 ? 's' : ''}`} accent={pendingValidations.length > 0 ? 'warning' : undefined}>
          {pendingValidations.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Nothing to validate.</p>
          ) : (
            <ul className="space-y-1.5">
              {pendingValidations.map((m) => (
                <li key={m.id} className="text-xs">
                  <span style={{ color: 'var(--text-primary)' }}>{m.title}</span>
                  <span className="ml-1" style={{ color: 'var(--text-muted)' }}>· risk {m.risk}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Token budget" subtitle="today · €0.35 / €3.00">
          <div className="flex items-center gap-3">
            <Sparkline data={dailyTokens} width={120} height={32} />
            <BudgetBar spent={35} cap={300} />
          </div>
        </Card>

        <Card title="Cache hit ratio" subtitle="5-min window">
          <div className="flex items-end gap-2">
            <span className="mono text-2xl font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>62%</span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>target ≥60%</span>
          </div>
        </Card>

        <Card title="Recommendations">
          <ul className="space-y-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <li>3 low-risk missions could batch tonight in autopilot.</li>
            <li>Promote <code>theme-factory</code> to project-pinned for OtakuGO.</li>
            <li>Context pack older than 24h — rebuild suggested.</li>
          </ul>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="surface lg:col-span-2 p-4">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Live trace</h2>
            <Link href="/trace" className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>view all →</Link>
          </header>
          <Timeline rows={trace.slice(0, 7)} />
        </div>
        <div className="surface p-4">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Today's spend</h2>
          </header>
          <div className="flex flex-col gap-1">
            <span className="mono text-3xl font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>€0.35</span>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>cap €3.00 · 12% used</span>
            <Sparkline data={dailyTokens} width={220} height={48} />
          </div>
        </div>
      </section>
    </div>
  );
}

function Card({ title, subtitle, children, accent }: { title: string; subtitle?: string; children: React.ReactNode; accent?: 'warning' | 'danger' }) {
  const accentBorder = accent === 'danger' ? 'border-l-2 border-l-red-500' : accent === 'warning' ? 'border-l-2 border-l-amber-500' : '';
  return (
    <article className={`surface p-4 ${accentBorder}`}>
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        {subtitle && <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{subtitle}</span>}
      </header>
      {children}
    </article>
  );
}

import { allAgents, trace } from '@/lib/fixtures';
import { AgentAvatar } from '@/components/AgentAvatar';
import { Sparkline } from '@/components/Sparkline';
import { Timeline } from '@/components/Timeline';

export default async function AgentDetail({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const a = allAgents.find((x) => x.id === id) ?? allAgents[0]!;
  return (
    <div className="flex flex-col gap-6">
      <header className="surface flex items-start gap-4 p-5">
        <AgentAvatar src={a.avatarPath ?? undefined} alt={a.name} status={a.status} size={64} />
        <div className="flex-1">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{a.name} <span className="ml-1">{a.emoji}</span></h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tier {a.tier} · model <span className="mono">{a.model}</span></p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.currentTask ?? 'idle'}</p>
        </div>
        <button className="rounded-md border px-3 py-1.5 text-xs" style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>Edit fiche</button>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Success rate" value={`${Math.round(a.successRate * 100)}%`} />
        <Stat label="Tokens (lifetime)" value={`${(a.totalTokens / 1000).toFixed(1)}k`} />
        <Stat label="Avg cost / task" value="€0.04" />
        <Stat label="Modes used" value="eco 80% · std 20%" />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="surface lg:col-span-2 p-4">
          <h2 className="mb-3 text-sm font-semibold">Recent activity</h2>
          <Timeline rows={trace.slice(0, 8)} />
        </article>
        <aside className="surface p-4">
          <h2 className="mb-3 text-sm font-semibold">Capabilities</h2>
          <div className="space-y-3 text-xs">
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>favorite skills</div>
              <div className="flex flex-wrap gap-1">
                {['superpowers:writing-plans', 'caveman'].map((s) => (
                  <span key={s} className="rounded-sm px-1.5 py-0.5 text-[10px]" style={{ background: 'var(--bg-hover)' }}>{s}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>delegates to</div>
              <div className="flex flex-wrap gap-1">
                {['frontend-developer', 'ux-architect'].map((s) => (
                  <span key={s} className="rounded-sm px-1.5 py-0.5 text-[10px]" style={{ background: 'var(--bg-hover)' }}>{s}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>token usage (7d)</div>
              <Sparkline data={a.spark ?? [1, 2, 3, 2, 4, 3, 5]} width={220} height={32} />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Stat({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <article className="surface p-3">
      <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="mono text-lg font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{value}</div>
    </article>
  );
}

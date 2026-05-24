import { missions, trace } from '@/lib/fixtures';
import { Timeline } from '@/components/Timeline';
import { RiskBadge } from '@/components/RiskBadge';
import { BudgetBar } from '@/components/BudgetBar';

const fsm = ['draft', 'clarified', 'planned', 'dispatched', 'executing', 'review', 'validated', 'archived'] as const;

export default async function MissionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = missions.find((x) => x.id === id) ?? missions[0]!;
  const currentStage = 2;
  return (
    <div className="flex flex-col gap-6">
      <header className="surface flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{m.title}</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>OtakuGO_UP · mission <span className="mono">{m.id}</span></p>
          </div>
          <RiskBadge risk={m.risk} />
        </div>
        <ol className="flex items-center gap-1 overflow-x-auto">
          {fsm.map((s, i) => {
            const active = i === currentStage;
            const done = i < currentStage;
            return (
              <li key={s} className="flex items-center gap-1">
                <span
                  className="rounded-md px-2 py-1 text-[11px] font-medium capitalize"
                  style={{
                    background: active ? 'var(--accent)' : done ? 'var(--accent-soft)' : 'var(--bg-hover)',
                    color: active ? '#fff' : done ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  {s}
                </span>
                {i < fsm.length - 1 && <span className="h-px w-3" style={{ background: 'var(--border-default)' }} />}
              </li>
            );
          })}
        </ol>
        <div className="flex items-center gap-3">
          <BudgetBar spent={m.budgetSpent} cap={m.budgetCap} label={`${m.budgetSpent}/${m.budgetCap} tokens`} />
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="surface lg:col-span-2 p-4">
          <h2 className="mb-3 text-sm font-semibold">Task DAG</h2>
          <ol className="flex flex-col gap-2">
            {[
              { id: 't1', t: 'Survey 5 best-in-class empty-states', agent: 'Mission Planner', status: 'done' },
              { id: 't2', t: 'Pick skills + tier B agents', agent: 'Skill Router', status: 'done' },
              { id: 't3', t: 'Draft UX wireframe', agent: 'UX Architect', status: 'running' },
              { id: 't4', t: 'Implement empty-state component', agent: 'Frontend Developer', status: 'todo' },
              { id: 't5', t: 'Review + sec check', agent: 'Reviewer + Sec Reviewer', status: 'todo' },
            ].map((t) => (
              <li key={t.id} className="surface flex items-center justify-between px-3 py-2 text-xs">
                <span className="flex items-center gap-2">
                  <span className="mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.id}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{t.t}</span>
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>{t.agent}</span>
                <span className="mono uppercase text-[10px]" style={{ color: t.status === 'running' ? 'var(--accent)' : t.status === 'done' ? 'var(--success)' : 'var(--text-muted)' }}>{t.status}</span>
              </li>
            ))}
          </ol>
        </article>
        <article className="surface p-4">
          <h2 className="mb-3 text-sm font-semibold">Diff preview</h2>
          <pre className="mono overflow-x-auto rounded-md p-3 text-[10px]" style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)' }}>{`No diff yet — wireframe in progress.

Phase 5 will populate this panel with
the real unified diff produced by the
Frontend Developer.`}</pre>
        </article>
      </section>

      <section className="surface p-4">
        <h2 className="mb-3 text-sm font-semibold">Live trace</h2>
        <Timeline rows={trace.slice(0, 8)} />
      </section>
    </div>
  );
}

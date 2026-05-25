import { notFound } from 'next/navigation';
import { getDb, missions as missionsTable, tasks as tasksTable, events as eventsTable, validations as validationsTable } from '@mas/db';
import { and, asc, desc, eq } from 'drizzle-orm';
import { RiskBadge } from '@/components/RiskBadge';
import { BudgetBar } from '@/components/BudgetBar';
import { Timeline, type TimelineRow } from '@/components/Timeline';
import { MissionActions } from '@/components/MissionActions';
import { ValidationModal, type PendingValidation } from '@/components/ValidationModal';

export const dynamic = 'force-dynamic';

const fsm = ['draft', 'clarified', 'planned', 'dispatched', 'executing', 'review', 'validated', 'archived'] as const;

export default async function MissionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const [m] = await db.select().from(missionsTable).where(eq(missionsTable.id, id));
  if (!m) return notFound();

  const ts = await db.select().from(tasksTable).where(eq(tasksTable.missionId, id)).orderBy(asc(tasksTable.createdAt));
  const evs = await db.select().from(eventsTable).where(eq(eventsTable.missionId, id)).orderBy(desc(eventsTable.createdAt)).limit(25);
  const pendingRows = await db
    .select({
      v: validationsTable,
      t: tasksTable,
    })
    .from(validationsTable)
    .innerJoin(tasksTable, eq(validationsTable.taskId, tasksTable.id))
    .where(and(eq(tasksTable.missionId, id), eq(validationsTable.status, 'pending')));

  const pending: PendingValidation[] = pendingRows.map((r) => ({
    id: r.v.id,
    taskId: r.v.taskId,
    taskTitle: r.t.title,
    risk: r.t.risk,
    actionSummary: r.v.actionSummary,
  }));

  const currentStage = Math.max(0, fsm.indexOf(m.status as (typeof fsm)[number]));

  const timelineRows: TimelineRow[] = evs.map((e) => ({
    id: e.id,
    ts: e.createdAt.toISOString().slice(11, 19),
    agent: e.agentId ?? 'system',
    action: e.type,
    tokens: e.tokensIn + e.tokensOut,
    risk: e.risk,
    skills: undefined,
  }));

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
        <MissionActions id={m.id} status={m.status} />
        <ol className="flex items-center gap-1 overflow-x-auto" data-testid="fsm-ribbon">
          {fsm.map((s, i) => {
            const active = i === currentStage;
            const done = i < currentStage;
            return (
              <li key={s} className="flex items-center gap-1">
                <span
                  className="rounded-md px-2 py-1 text-[11px] font-medium capitalize"
                  data-stage={s}
                  data-active={active ? '1' : '0'}
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
        <BudgetBar spent={m.spentTokens} cap={m.budgetTokens} label={`${m.spentTokens}/${m.budgetTokens} tokens`} />
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="surface lg:col-span-2 p-4">
          <h2 className="mb-3 text-sm font-semibold">Task DAG</h2>
          {ts.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No tasks yet. Click <strong>Plan mission</strong> to generate the DAG.</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {ts.map((t) => (
                <li key={t.id} className="surface flex items-center justify-between px-3 py-2 text-xs" data-testid="task-row">
                  <span className="flex items-center gap-2">
                    <span className="mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.id.slice(-3)}</span>
                    <span style={{ color: 'var(--text-primary)' }}>{t.title}</span>
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{t.agentId ?? '—'}</span>
                  <RiskBadge risk={t.risk} />
                  <span className="mono uppercase text-[10px] tabular-nums" data-task-status={t.status} style={{
                    color:
                      t.status === 'running' ? 'var(--accent)' :
                      t.status === 'done' ? 'var(--success)' :
                      t.status === 'needs_validation' ? 'var(--warning)' :
                      t.status === 'blocked' ? 'var(--danger)' :
                      'var(--text-muted)',
                  }}>{t.status}</span>
                </li>
              ))}
            </ol>
          )}
        </article>
        <article className="surface p-4">
          <h2 className="mb-3 text-sm font-semibold">Diff preview</h2>
          <pre className="mono overflow-x-auto rounded-md p-3 text-[10px]" style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)' }}>{`Phase 5 will populate this panel with the
real unified diff produced by the Frontend
Developer. Phase 1 only orchestrates the
FSM and writes mock outputs to
data/outputs/<task>.md.`}</pre>
        </article>
      </section>

      <section className="surface p-4">
        <h2 className="mb-3 text-sm font-semibold">Live trace · this mission</h2>
        {timelineRows.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No events yet.</p>
        ) : (
          <Timeline rows={timelineRows} />
        )}
      </section>

      <ValidationModal pending={pending} />
    </div>
  );
}

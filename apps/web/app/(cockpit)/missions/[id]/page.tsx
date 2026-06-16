import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb, missions as missionsTable, tasks as tasksTable, events as eventsTable, validations as validationsTable, projects as projectsTable } from '@mas/db';
import { and, asc, desc, eq } from 'drizzle-orm';
import { RiskBadge } from '@/components/RiskBadge';
import { BudgetBar } from '@/components/BudgetBar';
import { Timeline, type TimelineRow } from '@/components/Timeline';
import { MissionActions } from '@/components/MissionActions';
import { ValidationModal, type PendingValidation } from '@/components/ValidationModal';
import { DecisionLog } from '@/components/DecisionLog';
import { listDecisions } from '@/lib/decisions';
import { MissionDeadlineEditor } from '@/components/MissionDeadlineEditor';
import { isDeadlineSoon } from '@/lib/prioritize';
import { listMissionReports } from '@/lib/reports';
import { allAgents } from '@/lib/fixtures';
import { FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

const fsm = ['draft', 'clarified', 'planned', 'dispatched', 'executing', 'review', 'validated', 'archived'] as const;

function stageBg(active: boolean, done: boolean): string {
  if (active) return 'var(--accent)';
  if (done) return 'var(--accent-soft)';
  return 'var(--bg-hover)';
}

function stageColor(active: boolean, done: boolean): string {
  if (active) return '#fff';
  if (done) return 'var(--accent)';
  return 'var(--text-muted)';
}

function taskStatusColor(status: string): string {
  switch (status) {
    case 'running':
      return 'var(--accent)';
    case 'done':
      return 'var(--success)';
    case 'needs_validation':
      return 'var(--warning)';
    case 'blocked':
      return 'var(--danger)';
    default:
      return 'var(--text-muted)';
  }
}

export default async function MissionDetail({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const db = getDb();
  const [m] = await db.select().from(missionsTable).where(eq(missionsTable.id, id));
  if (!m) return notFound();
  const [proj] = await db.select().from(projectsTable).where(eq(projectsTable.id, m.projectId));
  const missionReports = await listMissionReports(db, id);

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

  const missionDecisions = (await listDecisions(db, { missionId: id })).map((d) => ({
    id: d.id, title: d.title, body: d.body, source: d.source, createdAt: d.createdAt.toISOString(),
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
        <div className="flex items-center gap-3">
          <MissionDeadlineEditor
            id={m.id}
            deadline={m.deadline ? m.deadline.toISOString().slice(0, 10) : null}
            milestone={m.milestone}
          />
          {isDeadlineSoon(m.deadline) && (
            <span
              data-testid="deadline-badge"
              className="rounded-sm px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: 'var(--warning)', color: '#1a1a1a' }}
            >
              ⚠ deadline &lt; 7d
            </span>
          )}
        </div>
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
                    background: stageBg(active, done),
                    color: stageColor(active, done),
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
          <h2 className="mb-3 text-sm font-semibold">Graphe des tâches</h2>
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
                  <span className="mono uppercase text-[10px] tabular-nums" data-task-status={t.status} style={{ color: taskStatusColor(t.status) }}>{t.status}</span>
                </li>
              ))}
            </ol>
          )}
        </article>
        <article className="surface p-4">
          <h2 className="mb-1 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Rapports de la mission</h2>
          <p className="mb-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>un rapport par tâche produite — clique pour la page rapport (vue humaine + IA)</p>
          {missionReports.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Aucun rapport encore.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {missionReports.map((r) => {
                const author = r.agentId ? allAgents.find((a) => a.id === r.agentId)?.name ?? r.agentId : 'Système';
                return (
                  <li key={r.id}>
                    <Link href={`/projects/${proj?.slug ?? ''}/reports/${r.id}`} className="surface flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-[color:var(--bg-hover)]">
                      <FileText size={15} style={{ color: 'var(--accent)' }} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{r.title}</div>
                        <div className="mono text-[10px]" style={{ color: 'var(--text-muted)' }}>par {author}</div>
                      </div>
                      <span className="mono text-[10px]" style={{ color: 'var(--accent)' }}>ouvrir →</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </article>
      </section>

      <section className="surface p-4">
        <h2 className="mb-3 text-sm font-semibold">Trace live · cette mission</h2>
        {timelineRows.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Aucun événement.</p>
        ) : (
          <Timeline rows={timelineRows} />
        )}
      </section>

      <section className="surface p-4">
        <h2 className="mb-3 text-sm font-semibold">Décisions</h2>
        <DecisionLog decisions={missionDecisions} projectId={m.projectId} missionId={m.id} />
      </section>

      <ValidationModal pending={pending} />
    </div>
  );
}

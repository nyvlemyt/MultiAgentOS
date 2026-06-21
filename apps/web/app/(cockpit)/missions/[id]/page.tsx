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
import { ConversationPanel } from '@/components/manager/ConversationPanel';
import { ConversationThreads } from '@/components/manager/ConversationThreads';
import { ensureConversation, listConversations, getConversation, listMessages } from '@/lib/conversations';
import { newMissionConversation } from '@/app/(cockpit)/conversation-actions';
import { missionProgress } from '@/lib/mission-progress';
import { GenerateReportButton } from '@/components/GenerateReportButton';

export const dynamic = 'force-dynamic';

const STEP_STATUS_FR: Record<string, string> = {
  todo: 'à faire',
  running: 'en cours',
  done: 'terminée',
  blocked: 'bloquée',
  needs_validation: 'à valider',
};

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

export default async function MissionDetail({
  params,
  searchParams,
}: Readonly<{ params: Promise<{ id: string }>; searchParams: Promise<{ c?: string }> }>) {
  const { id } = await params;
  const { c } = await searchParams;
  const db = getDb();
  const [m] = await db.select().from(missionsTable).where(eq(missionsTable.id, id));
  if (!m) return notFound();
  const [proj] = await db.select().from(projectsTable).where(eq(projectsTable.id, m.projectId));
  const slug = proj?.slug ?? '';
  const missionReports = await listMissionReports(db, id);

  const ts = await db.select().from(tasksTable).where(eq(tasksTable.missionId, id)).orderBy(asc(tasksTable.createdAt));

  // Mission chat (scope='mission', per projectId+missionId) — multi-thread like manager/agent.
  await ensureConversation(db, 'mission', m.projectId, null, new Date(), id);
  const threads = await listConversations(db, 'mission', m.projectId, null, id);
  const selectedRaw = (c ? await getConversation(db, c) : undefined) ?? threads[0]!;
  const conv = selectedRaw.scope === 'mission' && selectedRaw.missionId === id ? selectedRaw : threads[0]!;
  const chatMessages = (await listMessages(db, conv.id)).map((msg) => ({ role: msg.role, text: msg.text }));
  const newThread = newMissionConversation.bind(null, id, m.projectId);

  // Progress index (pure) + agents involved (unique tasks.agentId).
  const progress = missionProgress(
    ts.map((t) => ({ id: t.id, title: t.title, agentId: t.agentId, status: t.status })),
    missionReports.map((r) => ({ id: r.id, taskId: r.taskId, kind: r.kind })),
  );
  const involvedAgentIds = [...new Set(ts.map((t) => t.agentId).filter((a): a is string => Boolean(a)))];
  const involvedAgents = involvedAgentIds.map((aid) => ({ id: aid, name: allAgents.find((a) => a.id === aid)?.name ?? aid }));
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

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex gap-4">
          <ConversationThreads
            threads={threads.map((t) => ({ id: t.id, title: t.title }))}
            activeId={conv.id}
            basePath={`/missions/${id}`}
            onNew={newThread}
          />
          <div className="min-w-0 flex-1">
            <ConversationPanel
              kind="mission"
              conversationId={conv.id}
              initialMessages={chatMessages}
              presenceName="Pilote de mission"
              presenceRole="manager"
              subtitle={`Mission ${m.id} · ${STEP_STATUS_FR[m.status] ?? m.status}`}
              mission={m.title}
              greeting={`Je pilote « ${m.title} ». Demande-moi l'avancement, d'ajuster les tâches, ou de générer le rapport final.`}
            />
          </div>
        </div>

        <aside className="flex flex-col gap-5">
          <section className="surface p-4" data-testid="progress-index">
            <h2 className="mb-1 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Avancement</h2>
            <p className="mb-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>{progress.done}/{progress.total} tâches terminées</p>
            {progress.steps.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Aucune tâche encore.</p>
            ) : (
              <ol className="flex flex-col gap-2">
                {progress.steps.map((s) => (
                  <li key={s.taskId} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="min-w-0 flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{s.title}</span>
                    <span className="mono shrink-0" style={{ color: 'var(--text-muted)' }}>{s.agentId ?? '—'}</span>
                    <span className="mono shrink-0 uppercase" style={{ color: 'var(--text-secondary)' }} data-step-status={s.status}>{STEP_STATUS_FR[s.status] ?? s.status}</span>
                    {s.reportId ? (
                      <Link href={`/projects/${slug}/reports/${s.reportId}`} className="mono shrink-0" style={{ color: 'var(--accent)' }}>rapport →</Link>
                    ) : (
                      <span className="mono shrink-0" style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="surface p-4">
            <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Agents impliqués</h2>
            {involvedAgents.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Aucun agent assigné encore.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {involvedAgents.map((a) => (
                  <li key={a.id}>
                    <Link href={`/projects/${slug}/agents/${a.id}`} className="surface inline-flex items-center gap-2 px-2.5 py-1.5 text-[11px] transition-colors hover:bg-[color:var(--bg-hover)]" style={{ color: 'var(--text-secondary)' }}>
                      {a.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="surface p-4">
            <h2 className="mb-1 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Rapport final</h2>
            <p className="mb-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>agrège les rapports de tâche en un rapport de mission</p>
            <GenerateReportButton missionId={m.id} />
          </section>
        </aside>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="surface lg:col-span-2 p-4">
          <h2 className="mb-3 text-sm font-semibold">Graphe des tâches</h2>
          {ts.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Aucune tâche pour l'instant. Clique sur <strong>Plan mission</strong> pour générer le DAG.</p>
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

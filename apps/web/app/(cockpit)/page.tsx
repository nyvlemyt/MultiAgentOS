import Link from 'next/link';
import { isNotNull, desc } from 'drizzle-orm';
import { getDb, missions as missionsTable, projects as projectsTable } from '@mas/db';
import { ManagerConsole } from '@/components/manager/ManagerConsole';
import { AgentAvatar } from '@/components/AgentAvatar';
import { allAgents } from '@/lib/fixtures';
import { isDeadlineSoon } from '@/lib/prioritize';
import { listPendingValidations, latestDailyReport } from '@/lib/autopilot';
import { FolderPlus, AlertTriangle, CalendarClock, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CommandCenter() {
  const db = getDb();
  const projectRows = await db.select().from(projectsTable).orderBy(desc(projectsTable.lastActiveAt));
  const active = projectRows[0];
  const allMissions = await db.select().from(missionsTable);
  const deadlineMissions = (await db.select().from(missionsTable).where(isNotNull(missionsTable.deadline)))
    .filter((m) => isDeadlineSoon(m.deadline));
  const pendingValidations = await listPendingValidations(db);
  const dailyReport = await latestDailyReport(db);
  const busy = allAgents.filter((a) => a.status === 'running');

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Command Center</h1>
        <p className="mono text-xs" style={{ color: 'var(--text-muted)' }}>
          parle au Manager — il route vers le bon projet et les bons agents
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        <ManagerConsole project={active?.name ?? 'OtakuGO_UP'} />

        <aside className="flex flex-col gap-5">
          {/* Projects */}
          <section className="surface p-4">
            <header className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Tes projets</h2>
              <Link href="/projects" className="text-[11px]" style={{ color: 'var(--accent)' }}>tout voir →</Link>
            </header>
            <div className="flex flex-col gap-2.5">
              {projectRows.map((p) => {
                const slug = p.slug;
                const missionCount = allMissions.filter((m) => m.projectId === p.id).length;
                const nextDeadline = deadlineMissions.find((m) => m.projectId === p.id)?.deadline;
                return (
                  <Link
                    key={p.id}
                    href={`/projects/${slug}`}
                    className="surface lift block p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-9 w-9 shrink-0 rounded-lg" style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dim))' }} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--status-running)' }} />
                          <span className="truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                        </div>
                        <div className="mono truncate text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.path}</div>
                      </div>
                      <div className="flex -space-x-1.5">
                        {busy.slice(0, 3).map((a) => (
                          <AgentAvatar key={a.id} role={a.id} alt={a.name} status="running" size={22} />
                        ))}
                      </div>
                    </div>
                    <div className="mono mt-2.5 flex items-center gap-3 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                      <span>{missionCount} mission{missionCount === 1 ? '' : 's'}</span>
                      <span>·</span>
                      <span>{busy.length} agents actifs</span>
                      {nextDeadline && (
                        <>
                          <span>·</span>
                          <span style={{ color: 'var(--warning)' }}>échéance {nextDeadline.toISOString().slice(0, 10)}</span>
                        </>
                      )}
                    </div>
                  </Link>
                );
              })}
              <Link
                href="/projects/new"
                className="flex items-center justify-center gap-2 rounded-lg border border-dashed py-3 text-xs font-medium transition-colors hover:bg-[color:var(--bg-hover)]"
                style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
              >
                <FolderPlus size={14} /> nouveau projet
              </Link>
            </div>
          </section>

          {/* À traiter — consolidated */}
          <section className="surface p-4">
            <header className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>À traiter</h2>
              <span className="mono text-[10px]" style={{ color: 'var(--text-muted)' }}>ce qui t'attend</span>
            </header>

            <div data-testid="pending-validations" className="flex flex-col gap-2">
              {pendingValidations.length === 0 && deadlineMissions.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Rien ne t'attend. 🎉</p>
              ) : (
                <>
                  {pendingValidations.map((v) => (
                    <div key={v.validationId} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2" style={{ background: 'var(--bg-hover)' }}>
                      <ShieldCheck size={15} style={{ color: 'var(--warning)' }} />
                      <span className="flex-1 truncate text-xs" style={{ color: 'var(--text-primary)' }}>{v.taskTitle}</span>
                      <span className="mono text-[10px]" style={{ color: 'var(--text-muted)' }}>risk {v.risk}</span>
                    </div>
                  ))}
                  <div data-testid="deadline-card" className="flex flex-col gap-2">
                    {deadlineMissions.slice(0, 4).map((m) => (
                      <Link key={m.id} href={`/missions/${m.id}`} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2" style={{ background: 'var(--bg-hover)' }}>
                        <CalendarClock size={15} style={{ color: 'var(--warning)' }} />
                        <span className="flex-1 truncate text-xs" style={{ color: 'var(--text-primary)' }}>{m.title}</span>
                        <span className="mono text-[10px]" style={{ color: 'var(--warning)' }}>{m.deadline?.toISOString().slice(0, 10)}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Compact autopilot report */}
          <section data-testid="daily-report-card" className="surface p-4">
            <header className="mb-2 flex items-center gap-2">
              <AlertTriangle size={14} style={{ color: 'var(--text-muted)' }} />
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Dernier rapport autopilote</h2>
            </header>
            {dailyReport === null ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Aucun rapport pour le moment.</p>
            ) : (
              <div className="mono flex flex-wrap gap-x-4 gap-y-1 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                <span>missions avancées <b style={{ color: 'var(--text-primary)' }}>{dailyReport.missionsAdvanced}</b></span>
                <span>bloquées <b style={{ color: 'var(--text-primary)' }}>{dailyReport.missionsBlocked}</b></span>
                <span>tâches faites <b style={{ color: 'var(--text-primary)' }}>{dailyReport.tasksDone}</b></span>
                <span>quota <b style={{ color: 'var(--accent)' }}>{dailyReport.quotaUnits}</b></span>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

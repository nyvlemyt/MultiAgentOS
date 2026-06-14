import { Sparkline } from '@/components/Sparkline';
import { AgentAvatar } from '@/components/AgentAvatar';
import { RiskBadge } from '@/components/RiskBadge';
import { BudgetBar } from '@/components/BudgetBar';
import { Timeline } from '@/components/Timeline';
import { allAgents, missions, trace, dailyTokens } from '@/lib/fixtures';
import { DecisionLog } from '@/components/DecisionLog';
import { listDecisions } from '@/lib/decisions';
import { isDeadlineSoon } from '@/lib/prioritize';
import { topMissionsByPriority } from '@/lib/missions';
import { getDb, missions as missionsTable, projects } from '@mas/db';
import { isNotNull, desc } from 'drizzle-orm';
import Link from 'next/link';
import { listPendingValidations, latestDailyReport } from '@/lib/autopilot';
import { t, type Language } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function CommandCenter() {
  const busy = allAgents.filter((a) => a.status === 'running');
  const blocked: typeof missions = [];

  // Real-DB cards (Phase 4.5-receptacle) live alongside the fixture cards.
  const recentDecisions = (await listDecisions(getDb(), { scope: 'global', limit: 5 })).map((d) => ({
    id: d.id, title: d.title, body: d.body, source: d.source, createdAt: d.createdAt.toISOString(),
  }));
  const deadlineMissions = await getDb().select().from(missionsTable).where(isNotNull(missionsTable.deadline));
  const soonMissions = deadlineMissions.filter((m) => isDeadlineSoon(m.deadline));
  const topPriorities = await topMissionsByPriority(getDb(), { limit: 3 });

  // Phase 6 autopilot surface: real pending validations + latest daily report.
  const [activeProject] = await getDb()
    .select({ language: projects.language })
    .from(projects)
    .orderBy(desc(projects.lastActiveAt))
    .limit(1);
  const lang = (activeProject?.language ?? 'fr') as Language;
  const pendingValidations = await listPendingValidations(getDb());
  const dailyReport = await latestDailyReport(getDb());

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

        <Card title={t('card.pendingValidations', lang)} subtitle={`${pendingValidations.length} action${pendingValidations.length === 1 ? '' : 's'}`} accent={pendingValidations.length > 0 ? 'warning' : undefined}>
          <div data-testid="pending-validations">
            {pendingValidations.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Nothing to validate.</p>
            ) : (
              <ul className="space-y-1.5">
                {pendingValidations.map((v) => (
                  <li key={v.validationId} className="text-xs">
                    <span style={{ color: 'var(--text-primary)' }}>{v.taskTitle}</span>
                    <span className="ml-1" style={{ color: 'var(--text-muted)' }}>· risk {v.risk}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card title={t('card.dailyReport', lang)} subtitle={t('card.dailyReport.subtitle', lang)}>
          <div data-testid="daily-report-card">
            {dailyReport === null ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('card.dailyReport.empty', lang)}</p>
            ) : (
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <dt style={{ color: 'var(--text-muted)' }}>{t('card.dailyReport.advanced', lang)}</dt>
                <dd className="mono tabular-nums text-right" style={{ color: 'var(--text-primary)' }}>{dailyReport.missionsAdvanced}</dd>
                <dt style={{ color: 'var(--text-muted)' }}>{t('card.dailyReport.blocked', lang)}</dt>
                <dd className="mono tabular-nums text-right" style={{ color: 'var(--text-primary)' }}>{dailyReport.missionsBlocked}</dd>
                <dt style={{ color: 'var(--text-muted)' }}>{t('card.dailyReport.tasksDone', lang)}</dt>
                <dd className="mono tabular-nums text-right" style={{ color: 'var(--text-primary)' }}>{dailyReport.tasksDone}</dd>
                <dt style={{ color: 'var(--text-muted)' }}>{t('card.dailyReport.quota', lang)}</dt>
                <dd className="mono tabular-nums text-right" style={{ color: 'var(--accent)' }}>{dailyReport.quotaUnits}</dd>
              </dl>
            )}
          </div>
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

        <Card title="Top priorities" subtitle="by score">
          {topPriorities.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No prioritized missions yet.</p>
          ) : (
            <ul className="space-y-1.5 text-xs" data-testid="top-priorities">
              {topPriorities.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2">
                  <Link href={`/missions/${m.id}`} className="truncate" style={{ color: 'var(--text-primary)' }}>{m.title}</Link>
                  <span className="mono tabular-nums text-[10px]" style={{ color: 'var(--accent)' }}>{m.priorityScore}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recent decisions" subtitle="last 5 · global">
          <DecisionLog decisions={recentDecisions} compact />
        </Card>

        <Card title="Deadlines" subtitle={`${soonMissions.length} within 7d`} accent={soonMissions.length > 0 ? 'warning' : undefined}>
          {soonMissions.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No imminent deadlines.</p>
          ) : (
            <ul className="space-y-1.5" data-testid="deadline-card">
              {soonMissions.slice(0, 5).map((m) => (
                <li key={m.id} className="flex items-center justify-between text-xs">
                  <Link href={`/missions/${m.id}`} className="truncate" style={{ color: 'var(--text-primary)' }}>{m.title}</Link>
                  <span className="mono text-[10px]" style={{ color: 'var(--warning)' }}>{m.deadline?.toISOString().slice(0, 10)}</span>
                </li>
              ))}
            </ul>
          )}
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

function accentBorderFor(accent?: 'warning' | 'danger'): string {
  if (accent === 'danger') return 'border-l-2 border-l-red-500';
  if (accent === 'warning') return 'border-l-2 border-l-amber-500';
  return '';
}

function Card({ title, subtitle, children, accent }: Readonly<{ title: string; subtitle?: string; children: React.ReactNode; accent?: 'warning' | 'danger' }>) {
  const accentBorder = accentBorderFor(accent);
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

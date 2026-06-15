import { missions, allAgents } from '@/lib/fixtures';
import { MissionCard } from '@/components/MissionCard';
import { AgentCard } from '@/components/AgentCard';
import { BudgetBar } from '@/components/BudgetBar';
import { DecisionLog } from '@/components/DecisionLog';
import { listDecisions } from '@/lib/decisions';
import { computeProjectHealth } from '@/lib/health';
import { ProjectHealthBar } from '@/components/ProjectHealthBar';
import { getDb, projects as projectsTable } from '@mas/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function ProjectDetail({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  const projectName = slug === 'otakugo' ? 'OtakuGO_UP' : slug;
  const projectPath = slug === 'otakugo' ? '/Users/melvyn/Documents/03_PROFESSIONNEL/OtakuGO_UP' : '—';
  const stack = slug === 'otakugo' ? ['next', 'ts', 'tailwind', 'prisma', 'postgres'] : [];

  const [project] = await getDb().select().from(projectsTable).where(eq(projectsTable.slug, slug));
  const projectDecisions = project
    ? (await listDecisions(getDb(), { projectId: project.id })).map((d) => ({
        id: d.id, title: d.title, body: d.body, source: d.source, createdAt: d.createdAt.toISOString(),
      }))
    : [];
  const health = project ? await computeProjectHealth(getDb(), project.id) : null;

  return (
    <div className="flex flex-col gap-6">
      <header className="surface flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{projectName}</h1>
            <div className="mono mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>{projectPath}</div>
          </div>
          <button type="button" className="rounded-md border px-3 py-1.5 text-xs" style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>Reveal in Finder</button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {stack.map((s) => (
            <span key={s} className="rounded-sm px-1.5 py-0.5 text-[10px]" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{s}</span>
          ))}
        </div>
        {health && (
          <div className="border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <ProjectHealthBar health={health} />
          </div>
        )}
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="surface p-4">
          <h3 className="mb-2 text-sm font-semibold">Context pack health</h3>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>v3 · 3,420 tokens · 142 files · indexed 18 h ago</p>
          <button className="mt-3 w-full rounded-md px-3 py-1.5 text-xs text-white" style={{ background: 'var(--accent)' }}>Rebuild</button>
        </article>
        <article className="surface p-4">
          <h3 className="mb-2 text-sm font-semibold">Budget · this month</h3>
          <BudgetBar spent={240} cap={500} label="€2.40 / €5.00" />
          <p className="mt-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>cap raises require a logged event</p>
        </article>
        <article className="surface p-4">
          <h3 className="mb-2 text-sm font-semibold">Settings</h3>
          <ul className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <li>Autonomy: <span className="mono">manual</span></li>
            <li>Mode: <span className="mono">eco</span></li>
            <li>Default model: <span className="mono">claude-haiku-4-5</span></li>
          </ul>
        </article>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Recent missions</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {missions.slice(0, 5).map((m) => <MissionCard key={m.id} m={m} />)}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Decisions</h2>
        <div className="surface p-4">
          <DecisionLog decisions={projectDecisions} projectId={project?.id} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Agents sur ce projet — clique pour leur parler</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {allAgents.filter((a) => a.status !== 'idle').map((a) => <AgentCard key={a.id} a={a} href={`/projects/${slug}/agents/${a.id}`} />)}
        </div>
      </section>
    </div>
  );
}

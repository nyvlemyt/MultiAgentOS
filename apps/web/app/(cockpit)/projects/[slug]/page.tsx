import { missions, allAgents } from '@/lib/fixtures';
import { MissionCard } from '@/components/MissionCard';
import { AgentCard } from '@/components/AgentCard';
import { BudgetBar } from '@/components/BudgetBar';
import { DecisionLog } from '@/components/DecisionLog';
import { ProjectSettings } from '@/components/ProjectSettings';
import { listDecisions } from '@/lib/decisions';
import { computeProjectHealth } from '@/lib/health';
import { ProjectHealthBar } from '@/components/ProjectHealthBar';
import { getDb, projects as projectsTable } from '@mas/db';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const RISK_RANK: Record<string, number> = { blocking: 0, high: 1, medium: 2, low: 3 };

export default async function ProjectDetail({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  const [project] = await getDb().select().from(projectsTable).where(eq(projectsTable.slug, slug));
  if (!project) notFound();

  const stack = JSON.parse(project.stackJson || '[]') as string[];
  const projectDecisions = (await listDecisions(getDb(), { projectId: project.id })).map((d) => ({
    id: d.id, title: d.title, body: d.body, source: d.source, createdAt: d.createdAt.toISOString(),
  }));
  const health = await computeProjectHealth(getDb(), project.id);
  const byImportance = [...missions].sort((a, b) => (RISK_RANK[a.risk] ?? 9) - (RISK_RANK[b.risk] ?? 9));
  const projectAgents = allAgents.filter((a) => a.status !== 'idle');

  return (
    <div className="flex flex-col gap-6">
      <header className="surface flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{project.name}</h1>
            <div className="mono mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>{project.path}</div>
          </div>
          <button type="button" className="rounded-md border px-3 py-1.5 text-xs" style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>Ouvrir dans Finder</button>
        </div>
        {stack.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {stack.map((s) => (
              <span key={s} className="rounded-sm px-1.5 py-0.5 text-[10px]" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{s}</span>
            ))}
          </div>
        )}
        {health && (
          <div className="border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <ProjectHealthBar health={health} />
          </div>
        )}
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="surface p-4">
          <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Pack de contexte</h3>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>v3 · 3 420 tokens · 142 fichiers · indexé il y a 18 h</p>
          <button className="mt-3 w-full rounded-md px-3 py-1.5 text-xs font-semibold" style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dim))', color: '#04141a' }}>Reconstruire</button>
        </article>
        <article className="surface p-4">
          <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Budget · ce mois</h3>
          <BudgetBar spent={240} cap={project.monthlyBudgetCents} label={`€2.40 / €${(project.monthlyBudgetCents / 100).toFixed(2)}`} />
          <p className="mt-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>relever le plafond demande un événement tracé</p>
        </article>
        <article className="surface p-4">
          <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Réglages</h3>
          <ProjectSettings projectId={project.id} slug={slug} autonomy={project.autonomy} defaultMode={project.defaultMode} defaultModel={project.defaultModel} />
        </article>
      </section>

      <section>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Agents sur ce projet</h2>
        <p className="mb-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>clique un agent pour lui parler et voir ce qu'il a fait ici</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {projectAgents.map((a) => <AgentCard key={a.id} a={a} href={`/projects/${slug}/agents/${a.id}`} />)}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Missions · par importance</h2>
        <p className="mb-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>les plus risquées / urgentes d'abord</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {byImportance.slice(0, 6).map((m) => <MissionCard key={m.id} m={m} />)}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Décisions &amp; arbitrages</h2>
        <p className="mb-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>choix structurants tracés (ex : techno, périmètre) — pour ne pas les reperdre</p>
        <div className="surface p-4">
          <DecisionLog decisions={projectDecisions} projectId={project.id} />
        </div>
      </section>
    </div>
  );
}

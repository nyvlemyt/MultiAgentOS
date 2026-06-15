import { missions, allAgents } from '@/lib/fixtures';
import { MissionCard } from '@/components/MissionCard';
import { AgentCard } from '@/components/AgentCard';
import { DecisionLog } from '@/components/DecisionLog';
import { ProjectSettings } from '@/components/ProjectSettings';
import { OpenButtons } from '@/components/OpenButtons';
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
          <OpenButtons projectId={project.id} />
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

      {/* WORK FIRST — what matters */}
      <section>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Agents sur ce projet</h2>
        <p className="mb-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>clique un agent pour lui parler et voir ce qu'il a fait ici</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {projectAgents.map((a) => <AgentCard key={a.id} a={a} href={`/projects/${slug}/agents/${a.id}`} />)}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Missions · par importance</h2>
        <p className="mb-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>les plus risquées / urgentes d'abord — la barre = budget tokens consommé</p>
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

      {/* SYSTEM — secondary, at the bottom */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Système</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <article className="surface p-4">
            <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Budget tokens</h3>
            <dl className="mono grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
              <dt style={{ color: 'var(--text-muted)' }}>session</dt>
              <dd className="text-right tabular-nums" style={{ color: 'var(--text-primary)' }}>12.4k</dd>
              <dt style={{ color: 'var(--text-muted)' }}>aujourd'hui</dt>
              <dd className="text-right tabular-nums" style={{ color: 'var(--text-primary)' }}>42.0k / 1.0M</dd>
              <dt style={{ color: 'var(--text-muted)' }}>cette semaine</dt>
              <dd className="text-right tabular-nums" style={{ color: 'var(--text-primary)' }}>180k / 5.0M</dd>
            </dl>
            <p className="mt-2 text-[11px]" style={{ color: 'var(--text-secondary)' }}>estimation : ~9 missions restantes ce mois</p>
          </article>
          <article className="surface p-4">
            <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Réglages</h3>
            <ProjectSettings projectId={project.id} slug={slug} autonomy={project.autonomy} defaultMode={project.defaultMode} />
          </article>
          <article className="surface p-4">
            <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Pack de contexte</h3>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>cache des fichiers du projet indexés pour les agents (économise des tokens à chaque tâche).</p>
            <p className="mono mt-2 text-[11px]" style={{ color: 'var(--text-secondary)' }}>v3 · 3 420 tokens · 142 fichiers · il y a 18 h</p>
            <button className="mt-3 w-full rounded-md px-3 py-1.5 text-xs font-semibold" style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dim))', color: '#04141a' }}>Reconstruire</button>
          </article>
        </div>
      </section>
    </div>
  );
}

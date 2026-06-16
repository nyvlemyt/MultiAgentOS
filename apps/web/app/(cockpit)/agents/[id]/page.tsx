import { notFound } from 'next/navigation';
import { getDb } from '@mas/db';
import { allAgents, trace } from '@/lib/fixtures';
import { AgentAvatar } from '@/components/AgentAvatar';
import { AgentControlPanel } from '@/components/agent/AgentControlPanel';
import { getAgentConfig, agentSkills } from '@/lib/agent-config';
import { readFiche, listFicheRevisions, revisionsNeedCleanup } from '@/lib/agent-fiche';

export const dynamic = 'force-dynamic';

// Project-less synthetic scope for the base agent: no override row will ever match
// it, so getAgentConfig returns the fixture defaults (Profil/Skills are read-only
// here — the editable surface is the fiche).
const BASE_SCOPE = '__base__';

export default async function AgentDetail({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const a = allAgents.find((x) => x.id === id);
  if (!a) notFound();
  const db = getDb();

  const config = await getAgentConfig(db, id, BASE_SCOPE);
  const skills = agentSkills(id, config.enabledSkills);
  const fiche = await readFiche(id);
  const revisionRows = await listFicheRevisions(db, id);
  const revisions = revisionRows.map((r) => ({ id: r.id, summary: r.summary, savedAt: r.savedAt.getTime() }));
  const needCleanup = revisionsNeedCleanup(revisionRows, new Date());
  const activity = trace.filter((r) => r.agent === id).slice(0, 8).map((r) => ({ id: r.id, ts: r.ts, action: r.action }));

  return (
    <div className="flex flex-col gap-6">
      <header className="surface flex items-start gap-4 p-5">
        <AgentAvatar role={a.id} alt={a.name} status={a.status} size={64} />
        <div className="flex-1">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{a.name} <span className="ml-1">{a.emoji}</span></h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tier {a.tier} · model <span className="mono">{a.model}</span></p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.currentTask ?? 'idle'}</p>
        </div>
        <span className="mono rounded px-1.5 py-0.5 text-[11px]" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>agent de base</span>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Taux de succès" value={`${Math.round(a.successRate * 100)}%`} />
        <Stat label="Tokens (total)" value={`${(a.totalTokens / 1000).toFixed(1)}k`} />
        <Stat label="Coût moy / tâche" value="€0.04" />
        <Stat label="Modes utilisés" value="eco 80% · std 20%" />
      </section>

      <AgentControlPanel
        mode="fiche"
        agentId={a.id}
        config={config}
        skills={skills}
        fiche={{ found: fiche.found, content: fiche.content }}
        revisions={revisions}
        needCleanup={needCleanup}
        activity={activity}
      />
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

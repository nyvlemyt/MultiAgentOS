import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb, projects as projectsTable } from '@mas/db';
import { ConversationPanel } from '@/components/manager/ConversationPanel';
import { ConversationThreads } from '@/components/manager/ConversationThreads';
import { AgentControlPanel } from '@/components/agent/AgentControlPanel';
import { allAgents, trace } from '@/lib/fixtures';
import { ensureConversation, listConversations, getConversation, listMessages } from '@/lib/conversations';
import { getAgentConfig, agentSkills } from '@/lib/agent-config';
import { readFiche } from '@/lib/agent-fiche';
import { newAgentConversation } from '@/app/(cockpit)/conversation-actions';

export const dynamic = 'force-dynamic';

export default async function ProjectAgentConversation({
  params,
  searchParams,
}: Readonly<{ params: Promise<{ slug: string; agentId: string }>; searchParams: Promise<{ c?: string }> }>) {
  const { slug, agentId } = await params;
  const { c } = await searchParams;
  const db = getDb();
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.slug, slug));
  if (!project) notFound();
  const agent = allAgents.find((a) => a.id === agentId);
  if (!agent) notFound();

  await ensureConversation(db, 'agent', project.id, agentId);
  const threads = await listConversations(db, 'agent', project.id, agentId);
  const selected = (c ? await getConversation(db, c) : undefined) ?? threads[0]!;
  const conv = selected.scope === 'agent' && selected.agentId === agentId ? selected : threads[0]!;
  const messages = (await listMessages(db, conv.id)).map((m) => ({ role: m.role, text: m.text }));
  const activity = trace.filter((r) => r.agent === agentId).slice(0, 8).map((r) => ({ id: r.id, ts: r.ts, action: r.action }));
  const newThread = newAgentConversation.bind(null, slug, project.id, agentId);

  const config = await getAgentConfig(db, agentId, project.id);
  const skills = agentSkills(agentId, config.enabledSkills);
  const fiche = await readFiche(agentId);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <Link href={`/projects/${slug}`} className="hover:underline" style={{ color: 'var(--accent)' }}>{project.name}</Link>
        <span>/</span>
        <span>{agent.name}</span>
        <span className="mono ml-2 rounded px-1.5 py-0.5" style={{ background: 'var(--bg-hover)' }}>instance projet</span>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex gap-4">
          <ConversationThreads
            threads={threads.map((t) => ({ id: t.id, title: t.title }))}
            activeId={conv.id}
            basePath={`/projects/${slug}/agents/${agentId}`}
            onNew={newThread}
          />
          <div className="min-w-0 flex-1">
            <ConversationPanel
              kind="agent"
              conversationId={conv.id}
              initialMessages={messages}
              presenceName={agent.name}
              presenceRole={agent.id}
              subtitle={`Tier ${agent.tier} · ${agent.model} · sur ${project.name}`}
              agentId={agent.id}
              greeting={`Salut, je suis ${agent.name} sur ${project.name}. Demande-moi ce que tu veux que je fasse ici.`}
            />
          </div>
        </div>

        <aside className="flex flex-col gap-3">
          <Link href={`/agents/${agent.id}`} className="mono text-[11px]" style={{ color: 'var(--accent)' }}>
            voir l&apos;agent de base →
          </Link>
          <AgentControlPanel
            mode="override"
            agentId={agent.id}
            projectId={project.id}
            config={config}
            skills={skills}
            fiche={{ found: fiche.found, content: fiche.content }}
            revisions={[]}
            needCleanup={false}
            activity={activity}
          />
        </aside>
      </div>
    </div>
  );
}

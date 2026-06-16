import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb, projects as projectsTable } from '@mas/db';
import { ConversationPanel } from '@/components/manager/ConversationPanel';
import { ConversationThreads } from '@/components/manager/ConversationThreads';
import { AgentAvatar } from '@/components/AgentAvatar';
import { allAgents, trace } from '@/lib/fixtures';
import { ensureConversation, listConversations, getConversation, listMessages } from '@/lib/conversations';
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
  const activity = trace.filter((r) => r.agent === agentId).slice(0, 8);
  const newThread = newAgentConversation.bind(null, slug, project.id, agentId);

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

        <aside className="flex flex-col gap-5">
          <section className="surface p-4">
            <header className="mb-3 flex items-center gap-3">
              <AgentAvatar role={agent.id} alt={agent.name} status={agent.status} size={40} />
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{agent.name}</div>
                <div className="mono text-[11px]" style={{ color: 'var(--text-muted)' }}>Tier {agent.tier} · {agent.model}</div>
              </div>
            </header>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{agent.currentTask ?? 'au repos sur ce projet'}</p>
            <Link href={`/agents/${agent.id}`} className="mono mt-3 inline-block text-[11px]" style={{ color: 'var(--accent)' }}>
              voir l'agent de base →
            </Link>
          </section>

          <section className="surface p-4">
            <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Activité sur ce projet</h2>
            {activity.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Aucune activité encore.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {activity.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 text-[11px]">
                    <span className="mono" style={{ color: 'var(--text-muted)' }}>{r.ts}</span>
                    <span className="truncate" style={{ color: 'var(--text-secondary)' }}>{r.action}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

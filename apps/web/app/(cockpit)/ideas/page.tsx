import { getDb, ideas as ideasTable } from '@mas/db';
import { desc } from 'drizzle-orm';
import { IdeasKanbanClient, type BoardIdea } from '@/components/IdeasKanbanClient';

export const dynamic = 'force-dynamic';

export default async function IdeasInboxPage() {
  const rows = await getDb().select().from(ideasTable).orderBy(desc(ideasTable.priorityScore));
  const data: BoardIdea[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    scope: r.scope,
    priorityScore: r.priorityScore,
    ideaIdLink: r.ideaIdLink,
  }));

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Ideas Inbox</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{data.length} ideas · capture → clarify → prioritize → convert to mission</p>
        </div>
      </header>
      <IdeasKanbanClient ideas={data} />
    </div>
  );
}

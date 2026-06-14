import { getDb, missions as missionsTable } from '@mas/db';
import { desc } from 'drizzle-orm';
import { MissionsBoardClient, type BoardMission, type BoardStatus } from '@/components/MissionsBoardClient';
import { EmptyState } from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

export default async function MissionsBoardPage() {
  const db = getDb();
  const rows = await db.select().from(missionsTable).orderBy(desc(missionsTable.updatedAt));
  const data: BoardMission[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status as BoardStatus,
    risk: r.risk,
    budgetSpent: r.spentTokens,
    budgetCap: r.budgetTokens,
  }));

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Missions</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{data.length} missions · drag between Inbox / To clarify / Planned</p>
        </div>
      </header>
      {data.length === 0 ? (
        <EmptyState
          title="No missions yet"
          hint="Capture an idea and convert it to a mission, or start one from a project page."
          cta={{ label: 'Open the Ideas Inbox', href: '/ideas' }}
        />
      ) : (
        <MissionsBoardClient missions={data} />
      )}
    </div>
  );
}

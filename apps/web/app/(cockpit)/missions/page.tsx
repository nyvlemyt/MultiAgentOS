import { getDb, missions as missionsTable } from '@mas/db';
import { desc } from 'drizzle-orm';
import { MissionsBoardClient, type BoardMission, type BoardStatus } from '@/components/MissionsBoardClient';
import { EmptyState } from '@/components/EmptyState';
import { missionReconciliations } from '@/lib/mission-facts';
import { missionDesyncAlert } from '@/lib/alerts';

export const dynamic = 'force-dynamic';

export default async function MissionsBoardPage() {
  const db = getDb();
  const rows = await db.select().from(missionsTable).orderBy(desc(missionsTable.updatedAt));
  const recs = await missionReconciliations(db, rows.map((r) => r.id));
  const data: BoardMission[] = rows.map((r) => {
    const rec = recs.get(r.id);
    return {
      id: r.id,
      title: r.title,
      status: r.status as BoardStatus,
      risk: r.risk,
      budgetSpent: r.spentTokens,
      budgetCap: r.budgetTokens,
      desync: rec ? missionDesyncAlert(r.id, rec) : null,
    };
  });

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Missions</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{data.length} missions · glisse entre Boîte / À clarifier / Planifié</p>
        </div>
      </header>
      {data.length === 0 ? (
        <EmptyState
          title="No missions yet"
          hint="Capture an idea and convert it to a mission, or start one from a project page."
          cta={{ label: 'Open the Boîte à idées', href: '/ideas' }}
        />
      ) : (
        <MissionsBoardClient missions={data} />
      )}
    </div>
  );
}

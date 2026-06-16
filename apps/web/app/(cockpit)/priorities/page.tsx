import Link from 'next/link';
import { getDb, projects as projectsTable } from '@mas/db';
import { topMissionsByPriority } from '@/lib/missions';
import { PrioritiesClient, type PriorityMission } from '@/components/PrioritiesClient';

export const dynamic = 'force-dynamic';

export default async function PrioritiesPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ project?: string }> }>) {
  const { project } = await searchParams;
  const db = getDb();
  const allProjects = await db.select().from(projectsTable);
  const rows = await topMissionsByPriority(db, { projectId: project });
  const data: PriorityMission[] = rows.map((m) => ({
    id: m.id,
    title: m.title,
    priorityScore: m.priorityScore,
    budgetTokens: m.budgetTokens,
    deadline: m.deadline ? m.deadline.toISOString().slice(0, 10) : null,
  }));

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Priorités</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{data.length} missions · glisse le curseur pour fixer la priorité 0–100</p>
        </div>
      </header>

      <nav className="flex gap-2 text-xs">
        <Link href="/priorities" className="rounded-md border px-2 py-1" style={{ borderColor: project ? 'var(--border-default)' : 'var(--accent)', color: 'var(--text-primary)' }}>All</Link>
        {allProjects.map((p) => (
          <Link
            key={p.id}
            href={`/priorities?project=${p.id}`}
            className="rounded-md border px-2 py-1"
            style={{ borderColor: project === p.id ? 'var(--accent)' : 'var(--border-default)', color: 'var(--text-primary)' }}
          >
            {p.name}
          </Link>
        ))}
      </nav>

      <PrioritiesClient missions={data} />
    </div>
  );
}

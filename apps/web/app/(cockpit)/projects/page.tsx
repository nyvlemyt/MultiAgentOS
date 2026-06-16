import Link from 'next/link';
import { FolderKanban } from 'lucide-react';
import { getDb, projects as projectsTable } from '@mas/db';
import { computeProjectHealth } from '@/lib/health';
import { ProjectHealthBar } from '@/components/ProjectHealthBar';
import { EmptyState } from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

export default async function ProjectsList() {
  const db = getDb();
  const rows = await db.select().from(projectsTable);
  const projects = await Promise.all(
    rows.map(async (p) => ({ ...p, health: await computeProjectHealth(db, p.id) })),
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Projets</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{projects.length} enregistré · chemins externes uniquement</p>
        </div>
        <Link href="/projects/new" className="rounded-md px-3 py-1.5 text-xs font-medium text-white" style={{ background: 'var(--accent)' }}>+ New project</Link>
      </header>
      {projects.length === 0 ? (
        <EmptyState
          title="No projects enregistré yet"
          hint="Register an external project by absolute path to start dispatching missions. Your code never moves."
          cta={{ label: '+ New project', href: '/projects/new' }}
        />
      ) : (
      <ul className="flex flex-col gap-3">
        {projects.map((p) => (
          <li key={p.id}>
            <Link href={`/projects/${p.slug}`} className="surface flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-[color:var(--bg-hover)]">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-md" style={{ background: 'var(--bg-hover)', color: 'var(--accent)' }}>
                  <FolderKanban size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                    <span className="rounded-sm px-1.5 py-0.5 text-[10px] uppercase tracking-wider" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>{p.type}</span>
                  </div>
                  <div className="mono truncate text-[11px]" style={{ color: 'var(--text-muted)' }}>{p.path}</div>
                </div>
              </div>
              <div className="border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <ProjectHealthBar health={p.health} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}

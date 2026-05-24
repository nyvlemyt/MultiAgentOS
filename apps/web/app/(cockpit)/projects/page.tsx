import Link from 'next/link';
import { FolderKanban } from 'lucide-react';

const projects = [
  { id: 'otakugo', name: 'OtakuGO_UP', type: 'manga-app', path: '/Users/melvyn/Documents/03_PROFESSIONNEL/OtakuGO_UP', missions: 5, lastActive: '15 min ago' },
];

export default function ProjectsList() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Projects</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{projects.length} registered · external paths only</p>
        </div>
        <Link href="/projects/new" className="rounded-md px-3 py-1.5 text-xs font-medium text-white" style={{ background: 'var(--accent)' }}>+ New project</Link>
      </header>
      <ul className="flex flex-col gap-3">
        {projects.map((p) => (
          <li key={p.id}>
            <Link href={`/projects/${p.id}`} className="surface flex items-center gap-4 px-4 py-4 transition-colors hover:bg-[color:var(--bg-hover)]">
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
              <div className="flex flex-col items-end text-right">
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.missions}</span>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>missions</span>
              </div>
              <div className="flex flex-col items-end text-right">
                <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>last active</span>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{p.lastActive}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

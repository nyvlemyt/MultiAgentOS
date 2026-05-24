'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, ListTodo, Users, Workflow, Sparkles, Coins, Activity, Brain } from 'lucide-react';
import { cn } from '@/lib/cn';

const nav = [
  { href: '/', label: 'Command', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/missions', label: 'Missions', icon: ListTodo },
  { href: '/agents', label: 'Agents', icon: Users },
  { href: '/studio', label: 'Studio', icon: Workflow },
  { href: '/skills', label: 'Skills', icon: Sparkles },
  { href: '/tokens', label: 'Tokens', icon: Coins },
  { href: '/trace', label: 'Trace', icon: Activity },
  { href: '/memory', label: 'Memory', icon: Brain },
];

export function Sidebar() {
  const path = usePathname() || '/';
  return (
    <aside
      className="flex h-full w-56 flex-col gap-1 border-r px-3 py-4"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="px-2 pb-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md" style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-soft))' }} />
          <div className="leading-tight">
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>MultiAgentOS</div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>local agent studio</div>
          </div>
        </div>
      </div>
      <nav className="flex flex-col gap-0.5">
        {nav.map((item) => {
          const active = item.href === '/' ? path === '/' : path.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                active
                  ? 'bg-[color:var(--accent-soft)] text-[color:var(--accent)]'
                  : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-primary)]',
              )}
            >
              <Icon size={14} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-md border px-2 py-2 text-[10px]" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
        <div className="font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Phase 0</div>
        <div>Foundation — mocked data. No live LLM yet.</div>
      </div>
    </aside>
  );
}

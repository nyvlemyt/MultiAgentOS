'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Users, Brain, Workflow, Sparkles, Coins, Activity, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { t, type Language } from '@/lib/i18n';

type Item = { href: string; key: string; icon: typeof Users };

const primary: Item[] = [
  { href: '/', key: 'nav.command', icon: LayoutDashboard },
  { href: '/projects', key: 'nav.projects', icon: FolderKanban },
  { href: '/agents', key: 'nav.agents', icon: Users },
  { href: '/memory', key: 'nav.memory', icon: Brain },
];

const system: Item[] = [
  { href: '/studio', key: 'nav.studio', icon: Workflow },
  { href: '/skills', key: 'nav.skills', icon: Sparkles },
  { href: '/tokens', key: 'nav.tokens', icon: Coins },
  { href: '/trace', key: 'nav.trace', icon: Activity },
];

export function Sidebar({ lang = 'fr' }: Readonly<{ lang?: Language }>) {
  const path = usePathname() || '/';
  const [sysOpen, setSysOpen] = useState(false);

  const renderItem = (item: Item) => {
    const active = item.href === '/' ? path === '/' : path.startsWith(item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'relative flex cursor-pointer items-center gap-2.5 rounded-lg py-2 pl-3 pr-2 text-sm transition-colors',
          active
            ? 'bg-[color:var(--accent-soft)] text-[color:var(--accent)]'
            : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-primary)]',
        )}
      >
        {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full glow-accent" style={{ background: 'var(--accent)' }} />}
        <Icon size={16} />
        {t(item.key, lang)}
      </Link>
    );
  };

  return (
    <aside
      className="flex h-full w-56 shrink-0 flex-col gap-5 border-r px-3 py-4"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center gap-2.5 px-2">
        <div className="h-8 w-8 rounded-lg glow-accent" style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dim))' }} />
        <div className="leading-tight">
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>MultiAgentOS</div>
          <div className="mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>local agent studio</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">{primary.map(renderItem)}</nav>

      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => setSysOpen((o) => !o)}
          className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors hover:bg-[color:var(--bg-hover)]"
          style={{ color: 'var(--text-muted)' }}
          aria-expanded={sysOpen}
        >
          {t('navgroup.system', lang)}
          <ChevronDown size={13} className={cn('transition-transform', sysOpen && 'rotate-180')} />
        </button>
        {sysOpen && <div className="flex flex-col gap-1">{system.map(renderItem)}</div>}
      </div>

      <div className="mt-auto rounded-lg border px-2.5 py-2 text-[10px]" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--warning)' }} />
          <span className="mono font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Phase 0</span>
        </div>
        <div className="mt-1">Foundation — mocked data. No live LLM yet.</div>
      </div>
    </aside>
  );
}

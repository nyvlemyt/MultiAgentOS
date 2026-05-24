'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

const map: Record<string, string> = {
  '': 'Command Center',
  projects: 'Projects',
  missions: 'Missions',
  agents: 'Agents',
  studio: 'Studio',
  skills: 'Skills',
  tokens: 'Tokens',
  trace: 'Trace',
  memory: 'Memory',
  new: 'New',
};

export function ScopeBreadcrumb() {
  const path = usePathname() || '/';
  const segs = path.split('/').filter(Boolean);
  return (
    <nav className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
      <Link href="/" className="hover:text-[color:var(--text-primary)]">MultiAgentOS</Link>
      {segs.map((s, i) => {
        const url = '/' + segs.slice(0, i + 1).join('/');
        const label = map[s] ?? decodeURIComponent(s);
        const isLast = i === segs.length - 1;
        return (
          <span key={url} className="flex items-center gap-1">
            <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
            <Link
              href={url}
              className={cn('hover:text-[color:var(--text-primary)]', isLast && 'text-[color:var(--text-primary)] font-medium')}
            >
              {label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}

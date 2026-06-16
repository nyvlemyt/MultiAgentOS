'use client';
import { useState } from 'react';
import { Eye, Bot } from 'lucide-react';
import { renderMarkdown } from '@/lib/markdown';

function diffColor(line: string): string {
  if (line.startsWith('+') && !line.startsWith('+++')) return 'var(--success)';
  if (line.startsWith('-') && !line.startsWith('---')) return 'var(--danger)';
  if (line.startsWith('@@')) return 'var(--accent)';
  return 'var(--text-secondary)';
}

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export function ReportViewer({ humanMd, ai, diff }: Readonly<{ humanMd: string; ai: string; diff: string }>) {
  const [view, setView] = useState<'human' | 'ai'>('human');
  const diffRows = diff ? diff.split('\n').map((line, i) => ({ id: `${i}`, line })) : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="inline-flex w-fit items-center gap-0.5 rounded-lg p-0.5 text-[11px] font-medium" style={{ background: 'var(--bg-hover)' }}>
        <button type="button" onClick={() => setView('human')} className="inline-flex items-center gap-1 rounded-md px-3 py-1.5" style={{ background: view === 'human' ? 'var(--accent)' : 'transparent', color: view === 'human' ? '#04141a' : 'var(--text-secondary)' }}>
          <Eye size={13} /> Vue humaine
        </button>
        <button type="button" onClick={() => setView('ai')} className="inline-flex items-center gap-1 rounded-md px-3 py-1.5" style={{ background: view === 'ai' ? 'var(--accent)' : 'transparent', color: view === 'ai' ? '#04141a' : 'var(--text-secondary)' }}>
          <Bot size={13} /> Vue IA
        </button>
      </div>

      {view === 'human' ? (
        <div className="flex flex-col gap-4">
          {/* eslint-disable-next-line react/no-danger */}
          <div className="report-prose text-sm" style={{ color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: renderMarkdown(humanMd) }} />
          {diffRows.length > 0 && (
            <div>
              <div className="mono mb-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>diff produit</div>
              <pre className="mono overflow-x-auto rounded-lg p-3 text-[11px] leading-relaxed" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
                {diffRows.map((r) => <div key={r.id} style={{ color: diffColor(r.line) }}>{r.line || ' '}</div>)}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <div className="mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>rapport machine — structuré, pour l'agent suivant / le LLM</div>
          <pre className="mono overflow-x-auto whitespace-pre rounded-lg p-4 text-[12px] leading-relaxed" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>{prettyJson(ai)}</pre>
        </div>
      )}
    </div>
  );
}

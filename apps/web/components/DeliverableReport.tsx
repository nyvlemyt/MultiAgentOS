'use client';
import { useState } from 'react';
import { Eye, Bot } from 'lucide-react';
import { renderMarkdown } from '@/lib/markdown';
import type { Deliverable } from '@/lib/deliverables';

function DiffBlock({ diff }: Readonly<{ diff: string }>) {
  return (
    <pre className="mono overflow-x-auto rounded-lg p-3 text-[11px] leading-relaxed" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
      {diff.split('\n').map((line, i) => {
        let color = 'var(--text-secondary)';
        if (line.startsWith('+') && !line.startsWith('+++')) color = 'var(--success)';
        else if (line.startsWith('-') && !line.startsWith('---')) color = 'var(--danger)';
        else if (line.startsWith('@@')) color = 'var(--accent)';
        return <div key={i} style={{ color }}>{line || ' '}</div>;
      })}
    </pre>
  );
}

export function DeliverableReport({ deliverable }: Readonly<{ deliverable: Deliverable }>) {
  const [view, setView] = useState<'human' | 'ai'>('human');

  return (
    <div className="flex flex-col gap-3">
      <div className="inline-flex w-fit items-center gap-0.5 rounded-lg p-0.5 text-[11px] font-medium" style={{ background: 'var(--bg-hover)' }}>
        <button type="button" onClick={() => setView('human')} className="inline-flex items-center gap-1 rounded-md px-2.5 py-1" style={{ background: view === 'human' ? 'var(--accent)' : 'transparent', color: view === 'human' ? '#04141a' : 'var(--text-secondary)' }}>
          <Eye size={12} /> Vue humaine
        </button>
        <button type="button" onClick={() => setView('ai')} className="inline-flex items-center gap-1 rounded-md px-2.5 py-1" style={{ background: view === 'ai' ? 'var(--accent)' : 'transparent', color: view === 'ai' ? '#04141a' : 'var(--text-secondary)' }}>
          <Bot size={12} /> Vue IA
        </button>
      </div>

      {view === 'human' ? (
        <div className="flex flex-col gap-4">
          {/* eslint-disable-next-line react/no-danger */}
          <div className="report-prose text-sm" style={{ color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: renderMarkdown(deliverable.humanMd) }} />
          <div>
            <div className="mono mb-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>diff produit</div>
            <DiffBlock diff={deliverable.diff} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <div className="mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>rapport machine (pour l'agent suivant / le LLM)</div>
          <pre className="mono overflow-x-auto rounded-lg p-3 text-[11px]" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>{deliverable.aiReport}</pre>
        </div>
      )}
    </div>
  );
}

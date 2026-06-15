'use client';
import { useState } from 'react';
import { FolderOpen, Code2 } from 'lucide-react';

export function OpenButtons({ projectId }: Readonly<{ projectId: string }>) {
  const [msg, setMsg] = useState('');

  async function open(target: 'finder' | 'vscode') {
    setMsg('');
    try {
      const res = await fetch(`/api/projects/${projectId}/open`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ with: target }),
      });
      if (!res.ok) setMsg('chemin introuvable sur le disque');
    } catch {
      setMsg('échec');
    }
  }

  return (
    <div className="flex items-center gap-2">
      {msg && <span className="text-[10px]" style={{ color: 'var(--warning)' }}>{msg}</span>}
      <button type="button" onClick={() => open('finder')} className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors hover:bg-[color:var(--bg-hover)]" style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
        <FolderOpen size={13} /> Finder
      </button>
      <button type="button" onClick={() => open('vscode')} className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors hover:bg-[color:var(--bg-hover)]" style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
        <Code2 size={13} /> VS Code
      </button>
    </div>
  );
}

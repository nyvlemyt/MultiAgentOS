'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { managerReply } from '@/lib/manager-script';
import { AgentAvatar } from '@/components/AgentAvatar';

type Msg = { id: number; from: 'you' | 'manager'; text: string };

const CHIPS = ['+ nouveau projet', 'une idée…', 'état du projet'];

export function ManagerConsole({ project = 'OtakuGO_UP' }: Readonly<{ project?: string }>) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 0, from: 'manager', text: `Bonjour. Sur ${project}, que veut-on accomplir ? Décris une mission, lance une idée, ou demande l'état.` },
  ]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, thinking]);

  function send(text: string) {
    const value = text.trim();
    if (!value || thinking) return;
    const youId = Date.now();
    setMsgs((m) => [...m, { id: youId, from: 'you', text: value }]);
    setDraft('');
    setThinking(true);
    const reply = managerReply(value, project);
    globalThis.setTimeout(() => {
      setMsgs((m) => [...m, { id: youId + 1, from: 'manager', text: reply.text }]);
      setThinking(false);
    }, 520);
  }

  return (
    <section className="surface flex min-h-[60vh] flex-col overflow-hidden">
      <header className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
        <AgentAvatar role="mission-planner" alt="Manager" status="running" size={40} />
        <div className="leading-tight">
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Manager
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} /><span>en ligne</span></span>
          </div>
          <div className="mono text-[11px]" style={{ color: 'var(--text-muted)' }}>orchestrateur · {project}</div>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {msgs.map((m) => (
          <div key={m.id} className={m.from === 'you' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className="max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
              style={
                m.from === 'you'
                  ? { background: 'linear-gradient(135deg,var(--accent),var(--accent-dim))', color: '#04141a' }
                  : { background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }
              }
            >
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
              <span className="mono text-xs" style={{ color: 'var(--text-muted)' }}>Manager réfléchit…</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <footer className="border-t px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => send(c)}
              className="rounded-full border px-2.5 py-1 text-[11px] transition-colors hover:bg-[color:var(--bg-hover)]"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
            >
              {c}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); send(draft); }}
          className="flex items-center gap-2 rounded-xl border px-3 py-2"
          style={{ borderColor: 'var(--border-default)', background: 'var(--bg-base)' }}
        >
          <Sparkles size={16} style={{ color: 'var(--accent)' }} />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Décris une mission, une idée, ou pose une question…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
            aria-label="Message au Manager"
          />
          <button
            type="submit"
            disabled={!draft.trim() || thinking}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dim))', color: '#04141a' }}
          >
            <Send size={13} /> Envoyer
          </button>
        </form>
      </footer>
    </section>
  );
}

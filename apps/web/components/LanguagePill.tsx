'use client';
import { useState } from 'react';
import { cn } from '@/lib/cn';

type Language = 'fr' | 'en';
const order: Language[] = ['fr', 'en'];

export function LanguagePill({
  projectId,
  value,
}: Readonly<{ projectId?: string; value?: Language }>) {
  const [lang, setLang] = useState<Language>(value ?? 'fr');
  const [busy, setBusy] = useState(false);

  async function pick(next: Language) {
    if (next === lang || busy) return;
    if (!projectId) {
      setLang(next);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/language`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ language: next }),
      });
      if (res.ok) setLang(next);
    } catch {
      // Keep the current language on a failed write.
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      data-testid="language-pill"
      className="inline-flex items-center gap-0.5 rounded-md p-0.5 text-[11px] font-medium uppercase"
      style={{ background: 'var(--bg-hover)' }}
    >
      {order.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => pick(l)}
          aria-pressed={lang === l}
          className={cn(
            'rounded px-2 py-0.5 transition-colors',
            lang === l ? 'bg-[color:var(--accent)] text-white' : 'text-[color:var(--text-secondary)]',
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

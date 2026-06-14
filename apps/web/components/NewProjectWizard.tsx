'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PROJECT_TEMPLATES, getTemplate, type ProjectType } from '@/lib/templates';
import { t, type Language } from '@/lib/i18n';

const TYPES: ProjectType[] = ['manga-app', 'bot', 'business-website', 'automation', 'other'];
const AUTONOMIES = ['manual', 'assisted', 'autonomous', 'autopilot'] as const;
const MODES = ['eco', 'standard', 'expert'] as const;

export function NewProjectWizard({ language }: Readonly<{ language: Language }>) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [type, setType] = useState<ProjectType>('other');
  const [autonomy, setAutonomy] = useState<(typeof AUTONOMIES)[number]>('manual');
  const [mode, setMode] = useState<(typeof MODES)[number]>('eco');
  const [stack, setStack] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selected = useMemo(() => (templateId ? getTemplate(templateId) : undefined), [templateId]);

  function applyTemplate(id: string) {
    setTemplateId(id);
    const tpl = getTemplate(id);
    if (!tpl) return;
    setType(tpl.type);
    setAutonomy(tpl.autonomyFloor);
    setMode(tpl.defaultMode);
    setStack(tpl.stack.join(', '));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          path,
          type,
          templateId: templateId ?? undefined,
          autonomy,
          mode,
          stack: stack.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (res.status === 201) {
        const { project } = await res.json();
        router.push(`/projects/${project.slug}`);
        return;
      }
      setError(t('wizard.error', language));
    } catch {
      setError(t('wizard.error', language));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {t('wizard.title', language)}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('wizard.subtitle', language)}</p>
      </header>

      <section aria-label={t('wizard.templates', language)} className="flex flex-col gap-3">
        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{t('wizard.templates', language)}</span>
        <div className="grid grid-cols-2 gap-3">
          {PROJECT_TEMPLATES.map((tpl) => {
            const active = tpl.id === templateId;
            return (
              <button
                key={tpl.id}
                type="button"
                aria-pressed={active}
                onClick={() => applyTemplate(tpl.id)}
                className="surface flex flex-col gap-1 rounded-md p-3 text-left transition-colors"
                style={{ borderColor: active ? 'var(--accent)' : 'var(--border-default)', outline: active ? '2px solid var(--accent-soft)' : 'none' }}
              >
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{tpl.label}</span>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{tpl.type} · {tpl.autonomyFloor}</span>
              </button>
            );
          })}
        </div>
        {selected && (
          <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{selected.blurb}</p>
        )}
      </section>

      <form className="surface flex flex-col gap-4 p-6" onSubmit={submit}>
        <Field label={t('wizard.name', language)} hint={t('wizard.nameHint', language)}>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="OtakuGO_UP" className="input" />
        </Field>
        <Field label={t('wizard.path', language)} hint={t('wizard.pathHint', language)}>
          <input type="text" required value={path} onChange={(e) => setPath(e.target.value)} placeholder="/Users/you/Projects/your-project" className="input mono" />
        </Field>
        <Field label={t('wizard.type', language)}>
          <select className="input" value={type} onChange={(e) => setType(e.target.value as ProjectType)}>
            {TYPES.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
          </select>
        </Field>
        <Field label={t('wizard.stack', language)}>
          <input type="text" value={stack} onChange={(e) => setStack(e.target.value)} placeholder="next, ts, tailwind" className="input" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t('wizard.autonomy', language)}>
            <select className="input" value={autonomy} onChange={(e) => setAutonomy(e.target.value as (typeof AUTONOMIES)[number])}>
              {AUTONOMIES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
          <Field label={t('wizard.mode', language)}>
            <select className="input" value={mode} onChange={(e) => setMode(e.target.value as (typeof MODES)[number])}>
              {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
        </div>
        {error && <p role="alert" className="text-xs" style={{ color: 'var(--danger, #e5484d)' }}>{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="submit" disabled={busy} className="rounded-md px-3 py-1.5 text-xs font-medium text-white" style={{ background: 'var(--accent)' }}>
            {busy ? t('wizard.submitting', language) : t('wizard.submit', language)}
          </button>
        </div>
      </form>

      <style>{`
        .input { width: 100%; background: var(--bg-base); border: 1px solid var(--border-default); border-radius: 0.5rem; padding: 0.5rem 0.625rem; font-size: 0.8125rem; color: var(--text-primary); }
        .input:focus { outline: 2px solid var(--accent-soft); border-color: var(--accent); }
      `}</style>
    </div>
  );
}

function Field({ label, hint, children }: Readonly<{ label: string; hint?: string; children: React.ReactNode }>) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
      {hint && <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{hint}</span>}
      {children}
    </label>
  );
}

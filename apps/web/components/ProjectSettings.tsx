'use client';
import { useState, useTransition } from 'react';
import { Check } from 'lucide-react';
import { updateProjectSettings } from '@/app/(cockpit)/project-actions';
import { MODE_MODEL, MODE_LABEL, type Mode } from '@/lib/modes';

const AUTONOMY = [
  { v: 'manual', label: 'Manuel — tout est proposé, tu valides chaque action' },
  { v: 'assisted', label: 'Assisté — édits internes auto, le reste validé' },
  { v: 'autonomous', label: 'Autonome — agit dans le bac à sable, risqué gardé' },
  { v: 'autopilot', label: 'Autopilote — lots longs non-risqués, rapport au réveil' },
];
const MODES: Mode[] = ['eco', 'standard', 'expert'];

function Field({ label, value, onChange, options }: Readonly<{ label: string; value: string; onChange: (v: string) => void; options: { v: string; label: string }[] }>) {
  return (
    <label className="flex flex-col gap-1">
      <span className="mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border bg-transparent px-2.5 py-1.5 text-xs"
        style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)', background: 'var(--bg-base)' }}
      >
        {options.map((o) => <option key={o.v} value={o.v} style={{ background: 'var(--bg-elevated)' }}>{o.label}</option>)}
      </select>
    </label>
  );
}

export function ProjectSettings({
  projectId,
  slug,
  autonomy,
  defaultMode,
}: Readonly<{ projectId: string; slug: string; autonomy: string; defaultMode: string }>) {
  const [a, setA] = useState(autonomy);
  const [m, setM] = useState(defaultMode);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const dirty = a !== autonomy || m !== defaultMode;
  const derivedModel = MODE_MODEL[m as Mode] ?? MODE_MODEL.standard;

  let buttonLabel: React.ReactNode = 'Enregistrer';
  if (saved) buttonLabel = <><Check size={13} /> Enregistré</>;
  else if (pending) buttonLabel = 'Enregistrement…';

  function save() {
    start(async () => {
      await updateProjectSettings(projectId, slug, { autonomy: a, defaultMode: m });
      setSaved(true);
      globalThis.setTimeout(() => setSaved(false), 1800);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Field label="Autonomie" value={a} onChange={setA} options={AUTONOMY} />
      <Field label="Mode (pilote le modèle)" value={m} onChange={setM} options={MODES.map((v) => ({ v, label: MODE_LABEL[v] }))} />
      <div className="mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
        modèle : <span style={{ color: 'var(--accent)' }}>{derivedModel}</span>
      </div>
      <button
        type="button"
        onClick={save}
        disabled={!dirty || pending}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dim))', color: '#04141a' }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

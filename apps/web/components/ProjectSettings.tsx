'use client';
import { useState, useTransition } from 'react';
import { Check } from 'lucide-react';
import { updateProjectSettings } from '@/app/(cockpit)/project-actions';

const AUTONOMY = [
  { v: 'manual', label: 'Manuel — tout est proposé, tu valides chaque action' },
  { v: 'assisted', label: 'Assisté — édits internes auto, le reste validé' },
  { v: 'autonomous', label: 'Autonome — agit dans le bac à sable, risqué gardé' },
  { v: 'autopilot', label: 'Autopilote — lots longs non-risqués, rapport au réveil' },
];
const MODE = [
  { v: 'eco', label: 'Eco — Haiku, prose compressée, budget mini' },
  { v: 'standard', label: 'Standard — Sonnet, équilibre coût/qualité' },
  { v: 'expert', label: 'Expert — Opus, qualité max sur les gros travaux' },
];
const MODEL = [
  { v: 'claude-haiku-4-5', label: 'Haiku — rapide, pas cher (volume)' },
  { v: 'claude-sonnet-4-6', label: 'Sonnet — défaut conseillé' },
  { v: 'claude-opus-4-8', label: 'Opus — gros travaux' },
];

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
  defaultModel,
}: Readonly<{ projectId: string; slug: string; autonomy: string; defaultMode: string; defaultModel: string }>) {
  const [a, setA] = useState(autonomy);
  const [m, setM] = useState(defaultMode);
  const [model, setModel] = useState(defaultModel);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const dirty = a !== autonomy || m !== defaultMode || model !== defaultModel;

  function save() {
    start(async () => {
      await updateProjectSettings(projectId, slug, { autonomy: a, defaultMode: m, defaultModel: model });
      setSaved(true);
      globalThis.setTimeout(() => setSaved(false), 1800);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Field label="Autonomie" value={a} onChange={setA} options={AUTONOMY} />
      <Field label="Mode" value={m} onChange={setM} options={MODE} />
      <Field label="Modèle par défaut" value={model} onChange={setModel} options={MODEL} />
      <button
        type="button"
        onClick={save}
        disabled={!dirty || pending}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dim))', color: '#04141a' }}
      >
        {saved ? <><Check size={13} /> Enregistré</> : pending ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </div>
  );
}

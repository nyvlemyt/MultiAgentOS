'use client';
import { useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { updateAgentConfig } from '@/app/(cockpit)/agent-config-actions';
import {
  autonomyRaiseNeedsConfirm,
  budgetRaiseNeedsConfirm,
  type AgentConfig,
  type Autonomy,
  type EffortMode,
} from '@/lib/agent-config-rules';
import { ConfirmDialog } from './ConfirmDialog';

const MODELS = ['claude-haiku-4-5', 'claude-sonnet-4-6', 'claude-opus-4-8'];
const AUTONOMY: { v: Autonomy; label: string }[] = [
  { v: 'manual', label: 'Manuel — tout est proposé, tu valides' },
  { v: 'assisted', label: 'Assisté — édits internes auto, le reste validé' },
  { v: 'autonomous', label: 'Autonome — agit dans le bac à sable' },
  { v: 'autopilot', label: 'Autopilote — lots longs non-risqués' },
];
const EFFORTS: { v: EffortMode; label: string }[] = [
  { v: 'eco', label: 'Éco' },
  { v: 'standard', label: 'Standard' },
  { v: 'expert', label: 'Expert' },
];

function Row({ label, children }: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <label className="flex flex-col gap-1">
      <span className="mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
      {children}
    </label>
  );
}

const selectStyle = { borderColor: 'var(--border-default)', color: 'var(--text-primary)', background: 'var(--bg-base)' };

export function ProfilTab({
  editable,
  agentId,
  projectId,
  config,
}: Readonly<{ editable: boolean; agentId: string; projectId?: string; config: AgentConfig }>) {
  const [model, setModel] = useState(config.model);
  const [autonomy, setAutonomy] = useState<Autonomy>(config.autonomy);
  const [budget, setBudget] = useState(config.budgetCap);
  const [effort, setEffort] = useState<EffortMode>(config.effortMode);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  if (!editable) {
    return (
      <dl className="grid grid-cols-2 gap-3 text-xs">
        <ReadOnly label="Modèle" value={config.model} />
        <ReadOnly label="Autonomie" value={config.autonomy} />
        <ReadOnly label="Budget (tokens)" value={config.budgetCap.toLocaleString('fr-FR')} />
        <ReadOnly label="Effort" value={config.effortMode} />
        <p className="col-span-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Le profil de l&apos;agent de base reflète la fiche. Édite-le sur la page projet (override) ou via l&apos;onglet Fiche.
        </p>
      </dl>
    );
  }

  const dirty =
    model !== config.model || autonomy !== config.autonomy || budget !== config.budgetCap || effort !== config.effortMode;
  const needsConfirm =
    autonomyRaiseNeedsConfirm(config.autonomy, autonomy) || budgetRaiseNeedsConfirm(config.budgetCap, budget);

  function commit() {
    start(async () => {
      await updateAgentConfig(agentId, projectId!, { model, autonomy, budgetCap: budget, effortMode: effort });
      setConfirmOpen(false);
      setSaved(true);
      router.refresh();
      globalThis.setTimeout(() => setSaved(false), 1800);
    });
  }

  function onSave() {
    if (needsConfirm) setConfirmOpen(true);
    else commit();
  }

  let buttonLabel: ReactNode = 'Enregistrer';
  if (saved) buttonLabel = <><Check size={13} /> Enregistré</>;
  else if (pending) buttonLabel = 'Enregistrement…';

  return (
    <div className="flex flex-col gap-3">
      <Row label="Modèle">
        <select value={model} onChange={(e) => setModel(e.target.value)} className="rounded-lg border bg-transparent px-2.5 py-1.5 text-xs" style={selectStyle}>
          {MODELS.map((m) => <option key={m} value={m} style={{ background: 'var(--bg-elevated)' }}>{m}</option>)}
        </select>
      </Row>
      <Row label="Autonomie">
        <select value={autonomy} onChange={(e) => setAutonomy(e.target.value as Autonomy)} className="rounded-lg border bg-transparent px-2.5 py-1.5 text-xs" style={selectStyle}>
          {AUTONOMY.map((o) => <option key={o.v} value={o.v} style={{ background: 'var(--bg-elevated)' }}>{o.label}</option>)}
        </select>
      </Row>
      <Row label="Budget (tokens)">
        <input type="number" min={0} step={1000} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="rounded-lg border bg-transparent px-2.5 py-1.5 text-xs" style={selectStyle} />
      </Row>
      <Row label="Effort">
        <select value={effort} onChange={(e) => setEffort(e.target.value as EffortMode)} className="rounded-lg border bg-transparent px-2.5 py-1.5 text-xs" style={selectStyle}>
          {EFFORTS.map((o) => <option key={o.v} value={o.v} style={{ background: 'var(--bg-elevated)' }}>{o.label}</option>)}
        </select>
      </Row>
      <button
        type="button"
        onClick={onSave}
        disabled={!dirty || pending}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dim))', color: '#04141a' }}
      >
        {buttonLabel}
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmer la montée de privilèges"
        body="Tu augmentes l'autonomie ou le budget de cet agent sur ce projet. Confirme pour appliquer."
        confirmLabel="Appliquer"
        busy={pending}
        onConfirm={commit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function ReadOnly({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <dt className="mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</dt>
      <dd className="mono" style={{ color: 'var(--text-primary)' }}>{value}</dd>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { User, Wrench, FileText, Activity } from 'lucide-react';
import type { AgentConfig, SkillToggle } from '@/lib/agent-config-rules';
import { ProfilTab } from './ProfilTab';
import { SkillsTab } from './SkillsTab';
import { FicheTab, type RevisionRow } from './FicheTab';
import { ActivityTab, type ActivityRow } from './ActivityTab';

// Tabbed Agent Control Panel — replaces the static aside. `mode` decides the
// write path: 'override' (project instance) makes Profil/Skills editable against
// the DB override layer and the fiche read-only; 'fiche' (base agent) makes the
// fiche editable on disk with revision history and Profil/Skills read-only.
export type PanelMode = 'override' | 'fiche';
type TabKey = 'profil' | 'skills' | 'fiche' | 'activite';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'profil', label: 'Profil', icon: <User size={13} /> },
  { key: 'skills', label: 'Skills', icon: <Wrench size={13} /> },
  { key: 'fiche', label: 'Fiche', icon: <FileText size={13} /> },
  { key: 'activite', label: 'Activité', icon: <Activity size={13} /> },
];

export function AgentControlPanel({
  mode,
  agentId,
  projectId,
  config,
  skills,
  fiche,
  revisions,
  needCleanup,
  activity,
}: Readonly<{
  mode: PanelMode;
  agentId: string;
  projectId?: string;
  config: AgentConfig;
  skills: SkillToggle[];
  fiche: { found: boolean; content: string };
  revisions: RevisionRow[];
  needCleanup: boolean;
  activity: ActivityRow[];
}>) {
  const [tab, setTab] = useState<TabKey>('profil');
  const overrideEditable = mode === 'override';
  const ficheEditable = mode === 'fiche';

  return (
    <section className="surface flex flex-col gap-3 p-4">
      <nav className="flex gap-1 border-b pb-2" style={{ borderColor: 'var(--border-default)' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs"
            style={tab === t.key ? { background: 'var(--accent-soft)', color: 'var(--accent)' } : { color: 'var(--text-muted)' }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      {tab === 'profil' && <ProfilTab editable={overrideEditable} agentId={agentId} projectId={projectId} config={config} />}
      {tab === 'skills' && <SkillsTab editable={overrideEditable} agentId={agentId} projectId={projectId} skills={skills} />}
      {tab === 'fiche' && <FicheTab editable={ficheEditable} agentId={agentId} fiche={fiche} revisions={revisions} needCleanup={needCleanup} />}
      {tab === 'activite' && <ActivityTab activity={activity} />}
    </section>
  );
}

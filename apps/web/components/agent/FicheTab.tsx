'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, History, FileText, Trash2, RotateCcw } from 'lucide-react';
import { saveFiche, restoreFicheRevision, cleanupFicheRevisions } from '@/app/(cockpit)/agent-config-actions';
import { ConfirmDialog } from './ConfirmDialog';

export interface RevisionRow {
  id: string;
  summary: string;
  savedAt: number; // epoch ms
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

export function FicheTab({
  editable,
  agentId,
  fiche,
  revisions,
  needCleanup,
}: Readonly<{
  editable: boolean;
  agentId: string;
  fiche: { found: boolean; content: string };
  revisions: RevisionRow[];
  needCleanup: boolean;
}>) {
  if (!editable) {
    if (!fiche.found) {
      return <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fiche introuvable sur disque.</p>;
    }
    return (
      <pre className="mono max-h-[55vh] overflow-auto rounded-md p-3 text-[11px] leading-relaxed" style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)' }}>
        {fiche.content}
      </pre>
    );
  }
  return <EditableFiche agentId={agentId} fiche={fiche} revisions={revisions} needCleanup={needCleanup} />;
}

function EditableFiche({
  agentId,
  fiche,
  revisions,
  needCleanup,
}: Readonly<{ agentId: string; fiche: { found: boolean; content: string }; revisions: RevisionRow[]; needCleanup: boolean }>) {
  const [sub, setSub] = useState<'editor' | 'history'>('editor');
  const [content, setContent] = useState(fiche.content);
  const [saveOpen, setSaveOpen] = useState(false);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  function commitSave() {
    start(async () => {
      await saveFiche(agentId, content);
      setSaveOpen(false);
      setSaved(true);
      router.refresh();
      globalThis.setTimeout(() => setSaved(false), 1800);
    });
  }
  function commitRestore() {
    const id = restoreId;
    if (!id) return;
    start(async () => {
      await restoreFicheRevision(agentId, id);
      setRestoreId(null);
      router.refresh();
    });
  }
  function commitCleanup() {
    start(async () => {
      await cleanupFicheRevisions(agentId);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1">
        <SubTab active={sub === 'editor'} onClick={() => setSub('editor')} icon={<FileText size={12} />} label="Éditeur" />
        <SubTab active={sub === 'history'} onClick={() => setSub('history')} icon={<History size={12} />} label={`Historique (${revisions.length})`} />
      </div>

      {needCleanup && !dismissed && (
        <div className="surface flex items-start justify-between gap-3 p-3" style={{ borderColor: 'var(--warning, #d9a441)' }}>
          <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            Nettoyer l&apos;historique ? Il dépasse 10 révisions ou contient des entrées de plus de 30 jours.
          </p>
          <div className="flex shrink-0 gap-1.5">
            <button type="button" disabled={pending} onClick={commitCleanup} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold disabled:opacity-40" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
              <Trash2 size={11} /> Nettoyer
            </button>
            <button type="button" onClick={() => setDismissed(true)} className="rounded-md px-2 py-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Plus tard
            </button>
          </div>
        </div>
      )}

      {sub === 'editor' ? (
        <>
          {!fiche.found && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Fiche introuvable — l&apos;enregistrement la créera.</p>}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
            className="mono min-h-[40vh] w-full rounded-md border p-3 text-[11px] leading-relaxed"
            style={{ borderColor: 'var(--border-default)', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
          />
          <button
            type="button"
            onClick={() => setSaveOpen(true)}
            disabled={pending || content === fiche.content}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dim))', color: '#04141a' }}
          >
            {saved ? <><Check size={13} /> Enregistré</> : 'Enregistrer la fiche'}
          </button>
        </>
      ) : (
        <RevisionList revisions={revisions} pending={pending} onRestore={setRestoreId} />
      )}

      <ConfirmDialog
        open={saveOpen}
        title="Écrire la fiche sur disque"
        body="Cette action écrit le fichier .md réel de l'agent et archive la version précédente. Confirme."
        confirmLabel="Écrire"
        busy={pending}
        onConfirm={commitSave}
        onCancel={() => setSaveOpen(false)}
      />
      <ConfirmDialog
        open={restoreId !== null}
        title="Restaurer cette révision"
        body="La fiche sur disque sera réécrite depuis cette révision. La version actuelle est archivée."
        confirmLabel="Restaurer"
        busy={pending}
        onConfirm={commitRestore}
        onCancel={() => setRestoreId(null)}
      />
    </div>
  );
}

function SubTab({ active, onClick, icon, label }: Readonly<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px]"
      style={active ? { background: 'var(--accent-soft)', color: 'var(--accent)' } : { color: 'var(--text-muted)' }}
    >
      {icon} {label}
    </button>
  );
}

function RevisionList({ revisions, pending, onRestore }: Readonly<{ revisions: RevisionRow[]; pending: boolean; onRestore: (id: string) => void }>) {
  if (revisions.length === 0) {
    return <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Aucune révision archivée pour l&apos;instant.</p>;
  }
  return (
    <ul className="flex flex-col gap-1.5">
      {revisions.map((r) => (
        <li key={r.id} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs" style={{ background: 'var(--bg-hover)' }}>
          <div className="min-w-0">
            <div className="truncate" style={{ color: 'var(--text-secondary)' }}>{r.summary}</div>
            <div className="mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{dateFmt.format(new Date(r.savedAt))}</div>
          </div>
          <button type="button" disabled={pending} onClick={() => onRestore(r.id)} className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] disabled:opacity-40" style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)' }}>
            <RotateCcw size={11} /> Restaurer
          </button>
        </li>
      ))}
    </ul>
  );
}

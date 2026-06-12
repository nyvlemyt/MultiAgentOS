import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { getDb } from '@mas/db';
import { captureCandidates, type CandidateType } from './capture';

type Db = ReturnType<typeof getDb>;

export type SourceKind = 'note' | 'skill' | 'pattern' | 'repo' | 'course';

/** Sources that can carry executable or arbitrary third-party content (§5). */
const GATED_KINDS: ReadonlySet<SourceKind> = new Set(['repo', 'course']);

export class IntakeSecurityError extends Error {
  constructor(kind: SourceKind) {
    super(
      `Intake of kind '${kind}' requires a mas-sec-reviewer PASS before ingestion (CLAUDE.md §5). ` +
        'Pass secReviewPass:true only after the security gate returned PASS.',
    );
    this.name = 'IntakeSecurityError';
  }
}

export interface IntakeSourceInput {
  kind: SourceKind;
  title: string;
  body: string;
  url?: string;
  projectId?: string;
}

export interface IntakeOpts {
  /** Directory receiving dossiers (prod: docs/intake at the repo root). */
  intakeDir: string;
  /** Set true ONLY after mas-sec-reviewer returned PASS (gated kinds). */
  secReviewPass?: boolean;
  /** Optional originating task for provenance. */
  sourceTaskId?: string;
}

export interface IntakeResult {
  dossierPath: string;
  candidateId: string;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const CANDIDATE_TYPE: Record<SourceKind, CandidateType> = {
  note: 'project',
  skill: 'reference',
  pattern: 'reference',
  repo: 'reference',
  course: 'reference',
};

function renderDossier(src: IntakeSourceInput, date: string): string {
  const meta = [
    `- date: ${date}`,
    `- kind: ${src.kind}`,
    src.url ? `- url: ${src.url}` : null,
    src.projectId ? `- project: ${src.projectId}` : null,
    '- status: pending-triage',
  ].filter(Boolean);
  return [
    `# Intake dossier — ${src.title}`,
    '',
    meta.join('\n'),
    '',
    '## Source summary',
    '',
    src.body.trim(),
    '',
    '## Audit',
    '',
    '_Complete with the `intake-audit` skill: identity → fit → 3 costs → KILL criteria →',
    'decision (keep/adapt/defer/reject) → integration plan → re-audit date._',
    '',
  ].join('\n');
}

/**
 * Ingest an external source (ADR 0004 §3): write the intake dossier, then emit
 * a memory CANDIDATE through the captureCandidates() seam. Never writes a
 * register (§8). Gated kinds (repo/course) are refused without an explicit
 * security PASS (§5) — and the refusal happens before any file or row exists.
 */
export async function intakeSource(
  db: Db,
  src: IntakeSourceInput,
  opts: IntakeOpts,
): Promise<IntakeResult> {
  if (GATED_KINDS.has(src.kind) && opts.secReviewPass !== true) {
    throw new IntakeSecurityError(src.kind);
  }

  const date = new Date().toISOString().slice(0, 10);
  const dossierPath = join(opts.intakeDir, `${date}-${slugify(src.title)}.md`);
  mkdirSync(opts.intakeDir, { recursive: true });
  writeFileSync(dossierPath, renderDossier(src, date), 'utf8');

  const body = [
    `[intake:${src.kind}] ${src.title} — ${src.body.trim()}`,
    src.url ? `url: ${src.url}` : null,
    `dossier: ${dossierPath}`,
  ]
    .filter(Boolean)
    .join('\n');

  const [candidateId] = await captureCandidates(db, opts.sourceTaskId ?? null, [
    { type: CANDIDATE_TYPE[src.kind], body, sourceKind: src.kind, dossierPath },
  ]);

  return { dossierPath, candidateId: candidateId! };
}

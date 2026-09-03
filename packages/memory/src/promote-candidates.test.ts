import { describe, it, expect } from 'vitest';
import { mkdtempSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eq } from 'drizzle-orm';
import { getDb, memoryCandidates } from '@mas/db';
import { MemoryStore, MEMORY_KEEPER_AGENT, GLOBAL_PROJECT } from './registers';
import {
  parseClassifierDecision,
  candidateTitle,
  promoteClassifiedCandidates,
  formatCandidatesSummary,
} from './promote-candidates';
import { useTestDb } from './testing';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, '../../db/migrations');

useTestDb(MIGRATIONS_FOLDER);

function keeperStore(): { store: MemoryStore; root: string } {
  const root = mkdtempSync(join(tmpdir(), 'mas-registers-'));
  return { store: new MemoryStore({ root, writerAgent: MEMORY_KEEPER_AGENT }), root };
}

async function candidate(id: string, decision: string | null, body = 'We learned that X.'): Promise<void> {
  await getDb().insert(memoryCandidates).values({
    id, type: 'reference', body, status: 'pending',
    createdAt: new Date(), classifierDecision: decision, trust: 'untrusted',
  });
}

const registerFile = (root: string, kind: string): string => join(root, GLOBAL_PROJECT, `${kind}.md`);

describe('parseClassifierDecision', () => {
  it.each([
    ['learnings/global (rule:kw-learning)', 'learnings', 'global'],
    ['blockers/global (rule:kw-blocker)', 'blockers', 'global'],
    ['evals/global (rule:kw-eval)', 'evals', 'global'],
    ['decisions/project (rule:kw-decision)', 'decisions', 'project'],
    ['journal/global (rule:mission-summary)', 'journal', 'global'],
  ])('reads %s as %s/%s', (decision, register, scope) => {
    expect(parseClassifierDecision(decision)).toEqual({ register, scope });
  });

  it('tolerates a decision without the trailing rule annotation', () => {
    expect(parseClassifierDecision('learnings/global')).toEqual({ register: 'learnings', scope: 'global' });
  });

  it.each([
    'abstain — needs human triage',
    'capture_failed: ocr_empty — extraction produced no text',
    'nonsense/global (rule:x)',
    'learnings/elsewhere (rule:x)',
    '',
  ])('returns null for a non-register decision (%s)', (decision) => {
    expect(parseClassifierDecision(decision)).toBeNull();
  });

  it('returns null for a missing decision', () => {
    expect(parseClassifierDecision(null)).toBeNull();
  });
});

describe('candidateTitle', () => {
  it('skips the pipeline part_of marker and takes the first real text line', () => {
    expect(candidateTitle('<!-- part_of: S7 - DevOps order: 4 -->\nTD part 01 - Docker - Devops\n\n23/04/2026'))
      .toBe('TD part 01 - Docker - Devops');
  });

  it('falls back past blank and punctuation-only lines', () => {
    expect(candidateTitle('\n\n---\n\nReal heading here\n')).toBe('Real heading here');
  });

  it('strips a leading markdown heading marker', () => {
    expect(candidateTitle('# Agent Memory\n\nbody')).toBe('Agent Memory');
  });

  it('caps a very long line', () => {
    expect(candidateTitle('x'.repeat(200)).length).toBeLessThanOrEqual(80);
  });

  it('never returns an empty title', () => {
    expect(candidateTitle('   \n\n')).toBe('(sans titre)');
  });
});

describe('promoteClassifiedCandidates', () => {
  it('promotes every classified pending candidate into its register', async () => {
    const { store, root } = keeperStore();
    await candidate('c1', 'learnings/global (rule:kw-learning)');
    await candidate('c2', 'blockers/global (rule:kw-blocker)', 'We are blocked on Y.');
    const res = await promoteClassifiedCandidates(getDb(), store, {});
    expect(res.promoted.map((p) => p.register).sort()).toEqual(['blockers', 'learnings']);
    expect(existsSync(registerFile(root, 'learnings'))).toBe(true);
    expect(readFileSync(registerFile(root, 'learnings'), 'utf8')).toContain('LRN-001');
    expect(readFileSync(registerFile(root, 'blockers'), 'utf8')).toContain('BLK-001');
  });

  it('leaves abstained and capture_failed candidates untouched, with a visible reason', async () => {
    const { store } = keeperStore();
    await candidate('c3', 'abstain — needs human triage');
    await candidate('c4', 'capture_failed: ocr_empty — no text');
    await candidate('c5', null);
    const res = await promoteClassifiedCandidates(getDb(), store, {});
    expect(res.promoted).toEqual([]);
    expect(res.skipped).toHaveLength(3);
    expect(res.skipped.every((s) => s.reason.length > 0)).toBe(true);
    const [row] = await getDb().select().from(memoryCandidates).where(eq(memoryCandidates.id, 'c3'));
    expect(row!.status).toBe('pending');
  });

  it('marks a promoted candidate accepted, so a second run is idempotent', async () => {
    const { store } = keeperStore();
    await candidate('c6', 'learnings/global (rule:kw-learning)');
    await promoteClassifiedCandidates(getDb(), store, {});
    const again = await promoteClassifiedCandidates(getDb(), store, {});
    expect(again.promoted).toEqual([]);
    const [row] = await getDb().select().from(memoryCandidates).where(eq(memoryCandidates.id, 'c6'));
    expect(row!.status).toBe('accepted');
  });

  it('titles the entry from the body, not from the pipeline marker', async () => {
    const { store, root } = keeperStore();
    await candidate('c7', 'learnings/global (rule:kw-learning)', '<!-- part_of: S7 - DevOps order: 4 -->\nTD part 01 - Docker - Devops\n\nbody');
    await promoteClassifiedCandidates(getDb(), store, {});
    const raw = readFileSync(registerFile(root, 'learnings'), 'utf8');
    expect(raw).toContain('LRN-001 — TD part 01 - Docker - Devops');
    expect(raw).not.toContain('## LRN-001 — <!--');
  });

  it('keeps candidate provenance on the register entry', async () => {
    const { store, root } = keeperStore();
    await candidate('c8', 'learnings/global (rule:kw-learning)');
    await promoteClassifiedCandidates(getDb(), store, {});
    expect(readFileSync(registerFile(root, 'learnings'), 'utf8')).toContain('source: candidate:c8');
  });

  it('dry-run reports what WOULD move and writes nothing', async () => {
    const { store, root } = keeperStore();
    await candidate('c9', 'learnings/global (rule:kw-learning)');
    const res = await promoteClassifiedCandidates(getDb(), store, { dryRun: true });
    expect(res.promoted).toHaveLength(1);
    expect(res.dryRun).toBe(true);
    expect(existsSync(registerFile(root, 'learnings'))).toBe(false);
    const [row] = await getDb().select().from(memoryCandidates).where(eq(memoryCandidates.id, 'c9'));
    expect(row!.status).toBe('pending');
  });

  it('honours a limit', async () => {
    const { store } = keeperStore();
    await candidate('ca', 'learnings/global (rule:kw-learning)');
    await candidate('cb', 'learnings/global (rule:kw-learning)');
    const res = await promoteClassifiedCandidates(getDb(), store, { limit: 1 });
    expect(res.promoted).toHaveLength(1);
    expect(res.remaining).toBe(1);
  });

  it('routes a project-scope decision to the given projectId', async () => {
    const { store, root } = keeperStore();
    await candidate('cc', 'decisions/project (rule:kw-decision)', 'Decided to ship X.');
    const res = await promoteClassifiedCandidates(getDb(), store, { projectId: 'maos' });
    expect(res.promoted[0]!.projectId).toBe('maos');
    expect(existsSync(join(root, 'maos', 'decisions.md'))).toBe(true);
  });

  it('skips a project-scope decision when no projectId is given, rather than guessing', async () => {
    const { store } = keeperStore();
    await candidate('cd', 'decisions/project (rule:kw-decision)', 'Decided to ship X.');
    const res = await promoteClassifiedCandidates(getDb(), store, {});
    expect(res.promoted).toEqual([]);
    expect(res.skipped[0]!.reason).toMatch(/projectId/);
  });

  it('records a write failure without aborting the run', async () => {
    const readOnly = new MemoryStore({ root: mkdtempSync(join(tmpdir(), 'mas-ro-')), writerAgent: 'not-the-keeper' });
    await candidate('ce', 'learnings/global (rule:kw-learning)');
    await candidate('cf', 'learnings/global (rule:kw-learning)');
    const res = await promoteClassifiedCandidates(getDb(), readOnly, {});
    expect(res.failed).toHaveLength(2);
    expect(res.failed[0]!.reason).toMatch(/memory-keeper|denied/i);
  });
});

describe('formatCandidatesSummary', () => {
  it('reports the buckets', () => {
    const out = formatCandidatesSummary({
      promoted: [{ id: 'c1', register: 'learnings', projectId: '_global', entryId: 'LRN-001', title: 'T' }],
      skipped: [{ id: 'c2', reason: 'abstain' }], failed: [], remaining: 0, dryRun: false,
    });
    expect(out).toContain('1 promoted');
    expect(out).toContain('1 skipped');
    expect(out).toContain('learnings');
  });

  it('flags a dry run so nobody mistakes it for a real write', () => {
    const out = formatCandidatesSummary({ promoted: [], skipped: [], failed: [], remaining: 0, dryRun: true });
    expect(out).toMatch(/dry-run/i);
  });
});

import { describe, it, expect } from 'vitest';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eq } from 'drizzle-orm';
import { getDb, memoryCandidates } from '@mas/db';
import { INGESTED_ABSTAIN } from './classifier';
import { revokedDecision, reclassifyPendingCandidates, formatReclassifySummary } from './reclassify';
import { useTestDb } from './testing';

const __dirname = dirname(fileURLToPath(import.meta.url));
useTestDb(resolve(__dirname, '../../db/migrations'));

type Row = Parameters<typeof revokedDecision>[0];

const ingested = (decision: string | null): Row => ({
  id: 'x', type: 'reference', sourceKind: null, trust: 'untrusted', classifierDecision: decision,
});
const mission = (decision: string | null): Row => ({
  id: 'x', type: 'project', sourceKind: 'mission', trust: null, classifierDecision: decision,
});

describe('revokedDecision — which stored decisions the provenance gate withdraws', () => {
  it('withdraws a mission-register decision stamped on an ingested row', () => {
    expect(revokedDecision(ingested('learnings/global (rule:kw-learning)'))).toBe(INGESTED_ABSTAIN);
    expect(revokedDecision(ingested('blockers/global (rule:kw-blocker)'))).toBe(INGESTED_ABSTAIN);
    expect(revokedDecision(ingested('evals/global (rule:kw-eval)'))).toBe(INGESTED_ABSTAIN);
  });

  it('leaves a mission row alone — the 5 rules are correct in their own domain', () => {
    expect(revokedDecision(mission('learnings/project (rule:kw-learning)'))).toBeNull();
    expect(revokedDecision(mission('journal/project (rule:mission-summary)'))).toBeNull();
  });

  it('leaves an explicit human tag alone, even on an ingested row', () => {
    expect(revokedDecision(ingested('learnings/global (rule:user-tag)'))).toBeNull();
  });

  it('is idempotent: an already-withdrawn or never-routable decision is not rewritten', () => {
    expect(revokedDecision(ingested(INGESTED_ABSTAIN))).toBeNull();
    expect(revokedDecision(ingested('abstain — needs human triage'))).toBeNull();
    expect(revokedDecision(ingested('capture_failed: ocr_empty — no text'))).toBeNull();
    expect(revokedDecision(ingested(null))).toBeNull();
  });

  it('reads a null trust as "not stamped", never as a provenance signal', () => {
    // trust=null is how a ritual row looks. Treating null like a stamped value would gate
    // every mission candidate and empty the registers for the opposite reason.
    expect(revokedDecision({ ...mission('learnings/project (rule:kw-learning)'), sourceKind: null })).toBeNull();
  });

  it('gates on the reference type alone when the row carries no trust stamp', () => {
    expect(
      revokedDecision({ id: 'x', type: 'reference', sourceKind: null, trust: null, classifierDecision: 'learnings/global (rule:kw-learning)' }),
    ).toBe(INGESTED_ABSTAIN);
  });
});

async function row(id: string, values: Partial<Row> & { status?: 'pending' | 'accepted' }): Promise<void> {
  await getDb().insert(memoryCandidates).values({
    id,
    type: values.type ?? 'reference',
    body: 'Deep Learning — cours 3.',
    status: values.status ?? 'pending',
    createdAt: new Date(),
    classifierDecision: values.classifierDecision ?? null,
    trust: values.trust ?? null,
    sourceKind: (values.sourceKind ?? null) as 'mission' | null,
  });
}

const decisionOf = async (id: string): Promise<string | null> => {
  const [r] = await getDb().select().from(memoryCandidates).where(eq(memoryCandidates.id, id));
  return r!.classifierDecision;
};

describe('reclassifyPendingCandidates', () => {
  it('withdraws every out-of-domain decision and reports each one', async () => {
    await row('a', { trust: 'untrusted', classifierDecision: 'learnings/global (rule:kw-learning)' });
    await row('b', { trust: 'untrusted', classifierDecision: 'blockers/global (rule:kw-blocker)' });
    const res = await reclassifyPendingCandidates(getDb(), {});
    expect(res.revoked).toHaveLength(2);
    expect(res.revoked[0]).toMatchObject({ id: 'a', from: 'learnings/global (rule:kw-learning)', to: INGESTED_ABSTAIN });
    expect(await decisionOf('a')).toBe(INGESTED_ABSTAIN);
    expect(await decisionOf('b')).toBe(INGESTED_ABSTAIN);
  });

  it('leaves mission rows and already-abstaining rows untouched', async () => {
    await row('c', { type: 'project', sourceKind: 'mission', classifierDecision: 'learnings/project (rule:kw-learning)' });
    await row('d', { trust: 'untrusted', classifierDecision: 'abstain — needs human triage' });
    const res = await reclassifyPendingCandidates(getDb(), {});
    expect(res.revoked).toHaveLength(0);
    expect(res.untouched).toBe(2);
    expect(await decisionOf('c')).toBe('learnings/project (rule:kw-learning)');
  });

  it('is replayable: a second run withdraws nothing', async () => {
    await row('e', { trust: 'untrusted', classifierDecision: 'learnings/global (rule:kw-learning)' });
    await reclassifyPendingCandidates(getDb(), {});
    const again = await reclassifyPendingCandidates(getDb(), {});
    expect(again.revoked).toHaveLength(0);
  });

  it('dry-run reports what WOULD change and writes nothing', async () => {
    await row('f', { trust: 'untrusted', classifierDecision: 'learnings/global (rule:kw-learning)' });
    const res = await reclassifyPendingCandidates(getDb(), { dryRun: true });
    expect(res.dryRun).toBe(true);
    expect(res.revoked).toHaveLength(1);
    expect(await decisionOf('f')).toBe('learnings/global (rule:kw-learning)');
  });

  it('touches only pending rows — an accepted row is already filed, not a triage decision', async () => {
    await row('g', { trust: 'untrusted', classifierDecision: 'learnings/global (rule:kw-learning)', status: 'accepted' });
    const res = await reclassifyPendingCandidates(getDb(), {});
    expect(res.scanned).toBe(0);
    expect(await decisionOf('g')).toBe('learnings/global (rule:kw-learning)');
  });
});

describe('formatReclassifySummary', () => {
  it('names the counts and every withdrawal, so the pass is reviewable', () => {
    const out = formatReclassifySummary({
      scanned: 3,
      revoked: [{ id: 'a', from: 'learnings/global (rule:kw-learning)', to: INGESTED_ABSTAIN }],
      untouched: 2,
      dryRun: false,
    });
    expect(out).toContain('3 scanned');
    expect(out).toContain('1 withdrawn');
    expect(out).toContain('2 untouched');
    expect(out).toContain('learnings/global (rule:kw-learning)');
  });

  it('flags a dry run so nobody mistakes it for a write', () => {
    expect(formatReclassifySummary({ scanned: 0, revoked: [], untouched: 0, dryRun: true })).toMatch(/dry-run/i);
  });
});

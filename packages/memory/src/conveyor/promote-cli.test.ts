import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import matter from 'gray-matter';
import type { LLMClient, LLMRequest } from '@mas/core';
import { FicheSchema } from '../fiche';
import { promoteAll, promoteTarget, formatPromoteSummary, parsePromoteArgs } from './promote-cli';
import type { PromoteApplyDeps } from './promote-apply';
import type { QualityVerdict } from './promote';

let dir: string;
let logPath: string;
let calls: LLMRequest[];

function stubLLM(verdict: QualityVerdict = 'PASS'): LLMClient {
  return {
    async call(req) {
      calls.push(req);
      return {
        text: JSON.stringify({ verdict, findings: [] }), inputTokens: 300, outputTokens: 40,
        cacheReadTokens: 0, cacheCreationTokens: 0, quotaUnits: 0, model: req.model,
      };
    },
  };
}

function deps(over: Partial<PromoteApplyDeps> = {}): PromoteApplyDeps {
  return {
    llm: stubLLM(), dir, logPath, date: '2026-09-04', keeper: 'memory-keeper',
    approveUntrusted: true, ...over,
  };
}

function fiche(id: string, over: Record<string, unknown> = {}): string {
  const key = `sha256:${id.padEnd(64, '0').slice(0, 64).replace(/[^0-9a-f]/g, '0')}`;
  const fm = FicheSchema.parse({
    id, slug: id, source_key: key, derived_from: key, lifecycle: 'distilled', trust: 'untrusted',
    kind: 'resource', register: 'learnings', scope: 'global', doc_type: 'reference',
    actionability: 'resource', lane: 'knowledge', ...over,
  });
  const path = join(dir, `${id}.md`);
  writeFileSync(path, matter.stringify(`# ${id}\n\n## Summary\n\nreal knowledge here\n`, fm), 'utf8');
  return path;
}

const lifecycleOf = (id: string): unknown => matter(readFileSync(join(dir, `${id}.md`), 'utf8')).data.lifecycle;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'mas-promote-cli-'));
  logPath = join(dir, 'consolidation-log.md');
  writeFileSync(logPath, '# log\n', 'utf8');
  calls = [];
});
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

describe('promoteAll', () => {
  it('judges and promotes every distilled fiche in the store', async () => {
    fiche('aaa'); fiche('bbb');
    const res = await promoteAll(deps());
    expect(res.promoted).toEqual(['aaa', 'bbb']);
    expect(calls).toHaveLength(2);
    expect(lifecycleOf('aaa')).toBe('active');
  });

  it('skips non-candidates without spending a single LLM call', async () => {
    fiche('ccc', { lifecycle: 'active' });
    fiche('ddd', { lifecycle: 'rejected-kept' });
    const res = await promoteAll(deps());
    expect(res.promoted).toEqual([]);
    expect(res.skipped).toBe(2);
    expect(calls).toHaveLength(0);
  });

  it('is idempotent: a second run over a promoted store is free', async () => {
    fiche('eee');
    await promoteAll(deps());
    calls = [];
    const again = await promoteAll(deps());
    expect(again.promoted).toEqual([]);
    expect(again.skipped).toBe(1);
    expect(calls).toHaveLength(0);
  });

  it('buckets a NEEDS_WORK fiche as held, leaving it re-judgeable at distilled', async () => {
    fiche('hhh');
    const res = await promoteAll(deps({ llm: stubLLM('NEEDS_WORK') }));
    expect(res.held).toEqual(['hhh']);
    expect(res.promoted).toEqual([]);
    expect(lifecycleOf('hhh')).toBe('distilled');
  });

  it('buckets a BLOCKed fiche as rejected and archives it', async () => {
    fiche('rrr');
    const res = await promoteAll(deps({ llm: stubLLM('BLOCK') }));
    expect(res.rejected).toEqual(['rrr']);
    expect(res.promoted).toEqual([]);
    expect(lifecycleOf('rrr')).toBe('rejected-kept');
  });

  it('records a failing fiche and keeps going (one bad doc never stops the batch)', async () => {
    writeFileSync(join(dir, 'broken.md'), matter.stringify('b', { id: 'broken', slug: 'broken', source_key: 'sha256:x', lifecycle: 'distilled', trust: 'trusted' }), 'utf8');
    fiche('good');
    const res = await promoteAll(deps());
    expect(res.failed).toHaveLength(1);
    expect(res.failed[0]!.id).toBe('broken');
    expect(res.promoted).toEqual(['good']);
  });

  it('stops BEFORE the call that would cross the cumulative cap, and counts what is left', async () => {
    fiche('one'); fiche('two'); fiche('three');
    const res = await promoteAll(deps({ tokenCap: 100_000 }), { runCap: 900 });
    expect(res.budgetStopped).toBe(true);
    expect(res.promoted.length).toBeLessThan(3);
    expect(res.remaining).toBeGreaterThan(0);
    expect(calls.length).toBe(res.promoted.length + res.held.length + res.rejected.length);
  });

  it('honours an explicit limit (promote a handful, verify, then widen)', async () => {
    fiche('l1'); fiche('l2'); fiche('l3');
    const res = await promoteAll(deps(), { limit: 2 });
    expect(res.promoted).toHaveLength(2);
    expect(res.remaining).toBe(1);
  });

  it('surfaces the fiches it flipped to superseded', async () => {
    const key = `sha256:${'c'.repeat(64)}`;
    fiche('old-one', { lifecycle: 'active', source_key: key, derived_from: key });
    fiche('new-one', { source_key: key, derived_from: key });
    const res = await promoteAll(deps());
    expect(res.superseded).toHaveLength(1);
    expect(res.superseded[0]).toContain('old-one.md');
    expect(lifecycleOf('old-one')).toBe('superseded');
  });

  it('ignores the consolidation log itself and any dotfile in the store', async () => {
    fiche('kept');
    writeFileSync(join(dir, '.hidden.md'), 'nope', 'utf8');
    const res = await promoteAll(deps());
    expect(res.promoted).toEqual(['kept']);
    expect(res.failed).toEqual([]);
  });
});

describe('promoteTarget', () => {
  it('promotes one fiche by id', async () => {
    fiche('by-id');
    const res = await promoteTarget('by-id', deps());
    expect(res.promoted).toEqual(['by-id']);
  });

  it('promotes one fiche by path', async () => {
    const path = fiche('by-path');
    const res = await promoteTarget(path, deps());
    expect(res.promoted).toEqual(['by-path']);
  });

  it('reports an unknown id as a failure rather than pretending success', async () => {
    const res = await promoteTarget('ghost', deps());
    expect(res.failed[0]!.reason).toMatch(/not found/i);
    expect(res.promoted).toEqual([]);
  });
});

describe('formatPromoteSummary', () => {
  it('reports every bucket on one head line', () => {
    const out = formatPromoteSummary({
      promoted: ['a'], held: ['b'], rejected: ['c'], superseded: ['/k/old.md'],
      failed: [], skipped: 4, budgetStopped: false, remaining: 0,
    });
    expect(out).toContain('1 promoted');
    expect(out).toContain('1 held');
    expect(out).toContain('1 rejected');
    expect(out).toContain('1 superseded');
    expect(out).toContain('4 skipped');
  });

  it('says the run paused on the budget and how much is left', () => {
    const out = formatPromoteSummary({
      promoted: [], held: [], rejected: [], superseded: [], failed: [], skipped: 0,
      budgetStopped: true, remaining: 12,
    });
    expect(out).toMatch(/Budget cap reached/i);
    expect(out).toContain('12 remaining');
  });

  it('lists each failure with its reason', () => {
    const out = formatPromoteSummary({
      promoted: [], held: [], rejected: [], superseded: [], skipped: 0,
      failed: [{ id: 'bad', path: '/k/bad.md', reason: 'lane: Required' }],
      budgetStopped: false, remaining: 0,
    });
    expect(out).toContain('FAIL bad');
    expect(out).toContain('lane: Required');
  });
});

describe('parsePromoteArgs', () => {
  it('reads a single fiche id', () => {
    expect(parsePromoteArgs(['resource-x-abc'])).toEqual({ mode: 'one', target: 'resource-x-abc' });
  });

  it('reads --all with its optional dir', () => {
    expect(parsePromoteArgs(['--all'])).toEqual({ mode: 'all' });
    expect(parsePromoteArgs(['--all', 'docs/knowledge'])).toEqual({ mode: 'all', dir: 'docs/knowledge' });
  });

  it('reads the candidates mode with its flags', () => {
    expect(parsePromoteArgs(['--candidates', '--dry-run', '--limit', '5', '--project', 'maos']))
      .toEqual({ mode: 'candidates', dryRun: true, limit: 5, projectId: 'maos' });
  });

  it('reads the batch flags in any order', () => {
    expect(parsePromoteArgs(['--all', '--approve-untrusted', '--limit', '3']))
      .toEqual({ mode: 'all', approveUntrusted: true, limit: 3 });
    expect(parsePromoteArgs(['--limit', '3', '--all'])).toEqual({ mode: 'all', limit: 3 });
  });

  it('never treats a flag as a fiche id', () => {
    expect(parsePromoteArgs(['--approve-untrusted'])).toEqual({ mode: 'usage', approveUntrusted: true });
  });

  it('rejects a non-numeric or missing --limit rather than silently promoting everything', () => {
    expect(parsePromoteArgs(['--all', '--limit', 'abc']).error).toMatch(/--limit/);
    expect(parsePromoteArgs(['--all', '--limit']).error).toMatch(/--limit/);
  });

  it('rejects a --project without a value', () => {
    expect(parsePromoteArgs(['--candidates', '--project']).error).toMatch(/--project/);
  });

  it('falls back to usage on no argument at all', () => {
    expect(parsePromoteArgs([])).toEqual({ mode: 'usage' });
  });
});

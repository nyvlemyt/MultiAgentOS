import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import matter from 'gray-matter';
import type { LLMClient, LLMRequest } from '@mas/core';
import { FicheSchema } from '../fiche';
import { checkFiche } from '../frontmatter-check';
import { promoteFile, fichePath, type PromoteApplyDeps } from './promote-apply';
import type { QualityVerdict } from './promote';

let dir: string;
let logPath: string;
let calls: LLMRequest[];

function stubLLM(verdict: QualityVerdict, findings: string[] = []): LLMClient {
  return {
    async call(req) {
      calls.push(req);
      return {
        text: JSON.stringify({ verdict, findings }), inputTokens: 300, outputTokens: 40,
        cacheReadTokens: 0, cacheCreationTokens: 0, quotaUnits: 0, model: req.model,
      };
    },
  };
}

const KEY = `sha256:${'a'.repeat(64)}`;

function deps(verdict: QualityVerdict, extra: Partial<PromoteApplyDeps> = {}): PromoteApplyDeps {
  return { llm: stubLLM(verdict), dir, logPath, date: '2026-09-04', keeper: 'memory-keeper', ...extra };
}

/** A FicheSchema-valid fiche on disk, written at `<dir>/<id>.md` as distill would. */
function fiche(id: string, over: Record<string, unknown> = {}): string {
  const fm = FicheSchema.parse({
    id, slug: id, source_key: KEY, derived_from: KEY,
    lifecycle: 'distilled', trust: 'untrusted', kind: 'resource', register: 'learnings',
    scope: 'global', doc_type: 'reference', actionability: 'resource', lane: 'knowledge',
    ...over,
  });
  const path = join(dir, `${id}.md`);
  writeFileSync(path, matter.stringify(`# ${id}\n\n## Summary\n\nreal knowledge\n`, fm), 'utf8');
  return path;
}

const fm = (path: string): Record<string, unknown> => matter(readFileSync(path, 'utf8')).data;
const log = (): string => readFileSync(logPath, 'utf8');

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'mas-promote-'));
  logPath = join(dir, 'consolidation-log.md');
  writeFileSync(logPath, '# log\n', 'utf8');
  calls = [];
});
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

describe('promoteFile — PASS', () => {
  it('promotes a trusted distilled fiche to active and stamps quality_score', async () => {
    const path = fiche('f-trusted', { trust: 'trusted' });
    const r = await promoteFile(path, deps('PASS'));
    expect(r.outcome).toBe('promoted');
    expect(r.verdict).toBe('PASS');
    expect(fm(path).lifecycle).toBe('active');
    expect(fm(path).quality_score).toBe('PASS');
  });

  it('records the walk distilled→audited→active in the consolidation log', async () => {
    const path = fiche('f-walk', { trust: 'trusted' });
    await promoteFile(path, deps('PASS'));
    expect(log()).toContain('2026-09-04 | promote | ids=f-walk');
    expect(log()).toContain('distilled→audited→active');
  });

  it('leaves the promoted fiche FicheSchema-valid and gardien-clean', async () => {
    const path = fiche('f-valid', { trust: 'trusted' });
    await promoteFile(path, deps('PASS'));
    const data = fm(path);
    expect(FicheSchema.safeParse(data).success).toBe(true);
    const known = new Set<string>(['f-valid']);
    expect(checkFiche(data, { knownPaths: known, tier: 'strict' }).errors).toEqual([]);
  });

  it('holds an untrusted fiche even on PASS, but still records the verdict', async () => {
    const path = fiche('f-untrusted');
    const r = await promoteFile(path, deps('PASS'));
    expect(r.outcome).toBe('held');
    expect(r.reason).toMatch(/trust/i);
    expect(fm(path).lifecycle).toBe('distilled');
    expect(fm(path).quality_score).toBe('PASS');
    expect(log()).toContain('| promote-hold | ids=f-untrusted');
  });

  it('promotes an untrusted fiche under an explicit approval, and says so in the log', async () => {
    const path = fiche('f-approved');
    const r = await promoteFile(path, deps('PASS', { approveUntrusted: true }));
    expect(r.outcome).toBe('promoted');
    expect(fm(path).lifecycle).toBe('active');
    expect(log()).toContain('human-approved-untrusted');
  });
});

describe('promoteFile — NEEDS_WORK and BLOCK', () => {
  it('holds a NEEDS_WORK fiche at distilled and keeps the findings visible', async () => {
    const path = fiche('f-thin', { trust: 'trusted' });
    const r = await promoteFile(path, { ...deps('NEEDS_WORK'), llm: stubLLM('NEEDS_WORK', ['too thin']) });
    expect(r.outcome).toBe('held');
    expect(r.findings).toContain('too thin');
    expect(fm(path).lifecycle).toBe('distilled');
    expect(fm(path).quality_score).toBe('NEEDS_WORK');
  });

  it('archives a BLOCKed fiche as rejected-kept and NEVER deletes the file', async () => {
    const path = fiche('f-husk', { trust: 'trusted' });
    const r = await promoteFile(path, deps('BLOCK'));
    expect(r.outcome).toBe('rejected');
    expect(existsSync(path)).toBe(true);
    expect(fm(path).lifecycle).toBe('rejected-kept');
    expect(fm(path).quality_score).toBe('BLOCK');
    expect(log()).toContain('| promote-reject | ids=f-husk');
  });
});

describe('promoteFile — the pending supersede is finally applied', () => {
  it('flips an active same-source_key fiche to superseded and links it (archive-never-delete)', async () => {
    const oldPath = fiche('f-old', { lifecycle: 'active', trust: 'trusted' });
    const newPath = fiche('f-new', { trust: 'trusted' });
    const r = await promoteFile(newPath, deps('PASS'));
    expect(r.outcome).toBe('promoted');
    expect(r.superseded).toContain('f-old.md');
    expect(existsSync(oldPath)).toBe(true);
    expect(fm(oldPath).lifecycle).toBe('superseded');
    expect(fm(oldPath).superseded_by).toBe('f-new');
    expect(fm(newPath).lifecycle).toBe('active');
    expect(log()).toContain('| supersede | ids=f-old,f-new');
  });

  it('does not touch an active fiche carrying a different source_key', async () => {
    const other = fiche('f-other', { lifecycle: 'active', trust: 'trusted', source_key: `sha256:${'b'.repeat(64)}`, derived_from: `sha256:${'b'.repeat(64)}` });
    await promoteFile(fiche('f-solo', { trust: 'trusted' }), deps('PASS'));
    expect(fm(other).lifecycle).toBe('active');
    expect(log()).not.toContain('| supersede |');
  });
});

describe('promoteFile — guards', () => {
  it('skips a fiche that is not at distilled, without spending an LLM call', async () => {
    const path = fiche('f-already', { lifecycle: 'active', trust: 'trusted' });
    const before = readFileSync(path, 'utf8');
    const r = await promoteFile(path, deps('PASS'));
    expect(r.outcome).toBe('skipped');
    expect(calls).toHaveLength(0);
    expect(readFileSync(path, 'utf8')).toBe(before);
  });

  it('skips a file whose name does not match its id, rather than minting a duplicate', async () => {
    const stray = join(dir, 'stray-name.md');
    writeFileSync(stray, readFileSync(fiche('f-real', { trust: 'trusted' }), 'utf8'), 'utf8');
    rmSync(join(dir, 'f-real.md'));
    const r = await promoteFile(stray, deps('PASS'));
    expect(r.outcome).toBe('skipped');
    expect(r.reason).toMatch(/filename/i);
    expect(existsSync(join(dir, 'f-real.md'))).toBe(false);
    expect(calls).toHaveLength(0);
  });

  it('fails visibly on a fiche whose frontmatter is not FicheSchema-valid (never promotes it)', async () => {
    const path = join(dir, 'f-broken.md');
    writeFileSync(path, matter.stringify('body', { id: 'f-broken', slug: 'f-broken', source_key: KEY, lifecycle: 'distilled', trust: 'trusted' }), 'utf8');
    const r = await promoteFile(path, deps('PASS'));
    expect(r.outcome).toBe('failed');
    expect(r.reason).toMatch(/lane|register|derived_from/);
    expect(fm(path).lifecycle).toBe('distilled');
    expect(calls).toHaveLength(0);
  });

  it('fences the fiche body as untrusted data before the judge', async () => {
    await promoteFile(fiche('f-fence', { trust: 'trusted' }), deps('PASS'));
    expect(calls[0]!.user).toContain('<untrusted-source>');
  });
});

describe('fichePath', () => {
  it('maps a fiche id onto its immutable slug path', () => {
    expect(fichePath('/k', 'resource-x-abc')).toBe(join('/k', 'resource-x-abc.md'));
  });
});

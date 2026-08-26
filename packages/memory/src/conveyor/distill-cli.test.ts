import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import matter from 'gray-matter';
import type { LLMClient, LLMRequest } from '@mas/core';
import {
  sasDocToInput,
  distillPath,
  distillAll,
  formatDistillSummary,
  type DistillCliDeps,
} from './distill-cli';

const REFERENCE_REPLY = JSON.stringify({
  doc_type: 'reference', lane: 'knowledge', tags: ['t'],
  summary: 's', fields: '| a | b |\n|---|---|\n| 1 | 2 |', constraints: 'c', examples: 'e',
});

function stubLLM(reply = REFERENCE_REPLY): { client: LLMClient; calls: LLMRequest[] } {
  const calls: LLMRequest[] = [];
  const client: LLMClient = {
    async call(req) {
      calls.push(req);
      return { text: reply, inputTokens: 100, outputTokens: 50, cacheReadTokens: 0, cacheCreationTokens: 0, quotaUnits: 0, model: req.model };
    },
  };
  return { client, calls };
}

let root: string;
let sasDir: string;
let outDir: string;
let logPath: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'mas-distill-cli-'));
  sasDir = join(root, 'docs/resources/inbox');
  outDir = join(root, 'docs/knowledge');
  mkdirSync(sasDir, { recursive: true });
  mkdirSync(outDir, { recursive: true });
  logPath = join(root, 'consolidation-log.md');
  writeFileSync(logPath, '# log\n', 'utf8');
});
afterEach(() => { rmSync(root, { recursive: true, force: true }); });

function writeSasDoc(name: string, body: string): string {
  const p = join(sasDir, name);
  writeFileSync(p, body, 'utf8');
  return p;
}

function deps(): DistillCliDeps {
  return { llm: stubLLM().client, outDir, logPath, date: '2026-07-08', keeper: 'memory-keeper' };
}

describe('sasDocToInput', () => {
  it('builds a DistillInput whose derived_from is the portable source_key, never a machine path', () => {
    const p = writeSasDoc('agent-memory.md', '# Agent Memory\n\nFive registers.');
    const input = sasDocToInput(p);
    expect(input.derivedFrom).toBe(input.sourceKey);
    expect(input.derivedFrom).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(input.rawMarkdown).toContain('Five registers');
    // id is stable across two calls on the same file (immutable anchor, STRUCTURE.md §5).
    expect(sasDocToInput(p).id).toBe(input.id);
    // charset is kebab [a-z0-9-].
    expect(input.id).toMatch(/^[a-z0-9-]+$/);
    // untrusted by default (ingested source).
    expect(input.trust).toBe('untrusted');
    expect(input.sourceKey.length).toBeGreaterThan(0);
  });
});

describe('distillPath', () => {
  it('distills one SAS doc to a distilled fiche on disk under docs/knowledge', async () => {
    const p = writeSasDoc('a.md', '# A\n\nsome captured knowledge about agents.');
    const res = await distillPath(p, deps());
    expect(res.distilled).toHaveLength(1);
    expect(existsSync(res.distilled[0]!)).toBe(true);
    const data = matter(readFileSync(res.distilled[0]!, 'utf8')).data;
    expect(data.lifecycle).toBe('distilled');
    expect(data.derived_from).toBe(data.source_key);
    expect(data.derived_from).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('surfaces a malformed-output failure without writing a fiche', async () => {
    const p = writeSasDoc('bad.md', '# Bad\n\nx');
    const d: DistillCliDeps = { ...deps(), llm: stubLLM('not json').client };
    const res = await distillPath(p, d);
    expect(res.distilled).toHaveLength(0);
    expect(res.failed).toHaveLength(1);
    expect(res.failed[0]!.reason).toMatch(/malformed|distill/i);
  });
});

describe('distillAll', () => {
  it('distills every SAS doc not yet distilled, skipping ones already done', async () => {
    writeSasDoc('one.md', '# One\n\nalpha content here.');
    writeSasDoc('two.md', '# Two\n\nbeta content here.');
    const first = await distillAll(sasDir, deps());
    expect(first.distilled).toHaveLength(2);
    // second run is idempotent: both already have a distilled fiche → skipped.
    const second = await distillAll(sasDir, deps());
    expect(second.distilled).toHaveLength(0);
    expect(second.skipped).toBe(2);
  });

  it('stops cleanly on budget exhaustion and reports how many remain', async () => {
    writeSasDoc('big1.md', '# Big1\n\n' + 'x'.repeat(100));
    writeSasDoc('big2.md', '# Big2\n\n' + 'y'.repeat(100));
    const d: DistillCliDeps = { ...deps(), tokenCap: 1 }; // every doc exceeds a 1-token cap
    const res = await distillAll(sasDir, d);
    expect(res.distilled).toHaveLength(0);
    expect(res.budgetStopped).toBe(true);
    expect(res.remaining).toBeGreaterThan(0);
  });

  it('spends the run budget CUMULATIVELY: distils until the next doc would exceed the cap', async () => {
    // Two similar docs. Cap fits one full distill but not two → exactly one lands, one remains.
    const a = sasDocToInput(writeSasDoc('c1.md', '# C1\n\nalpha alpha alpha content.'));
    const b = sasDocToInput(writeSasDoc('c2.md', '# C2\n\nbeta beta beta content.'));
    const { distillPromptEstimate } = await import('./distill');
    const oneDoc = Math.max(distillPromptEstimate(a), distillPromptEstimate(b));
    const cap = Math.floor(oneDoc * 1.5); // room for one, not two
    const res = await distillAll(sasDir, { ...deps(), tokenCap: cap });
    expect(res.distilled).toHaveLength(1);
    expect(res.budgetStopped).toBe(true);
    expect(res.remaining).toBe(1);
  });

  it('does NOT stop the whole batch on a single malformed doc (only budget stops the batch)', async () => {
    writeSasDoc('ok.md', '# Ok\n\ngood content.');
    const d: DistillCliDeps = { ...deps(), llm: stubLLM('not json').client };
    const res = await distillAll(sasDir, d);
    expect(res.budgetStopped).toBe(false);
    expect(res.failed).toHaveLength(1);
  });
});

describe('formatDistillSummary', () => {
  it('renders a one-line human summary', () => {
    const line = formatDistillSummary({ distilled: ['a', 'b'], failed: [{ path: 'c', reason: 'x' }], skipped: 1, budgetStopped: false, remaining: 0 });
    expect(line).toContain('2 distilled');
    expect(line).toContain('1 failed');
    expect(line).toContain('1 skipped');
  });

  it('flags a budget stop in the summary', () => {
    const line = formatDistillSummary({ distilled: [], failed: [], skipped: 0, budgetStopped: true, remaining: 3 });
    expect(line).toMatch(/budget/i);
    expect(line).toContain('3 remaining');
  });

  it('lists each failure path and reason — a failure is never silent', () => {
    const line = formatDistillSummary({
      distilled: [],
      failed: [
        { path: '/inbox/a.md', reason: 'malformed model output: fields' },
        { path: '/inbox/b.md', reason: 'reply is not valid JSON' },
      ],
      skipped: 0, budgetStopped: false, remaining: 0,
    });
    expect(line).toContain('/inbox/a.md');
    expect(line).toContain('malformed model output: fields');
    expect(line).toContain('/inbox/b.md');
    expect(line).toContain('reply is not valid JSON');
  });
});

describe('titres hérités du manifeste (P1-2 / P1-7)', () => {
  const LONG = 'Contenu de cours suffisamment long pour dépasser le seuil de fragment. '.repeat(5);

  it('hérite « part_of — titre du manifeste » quand le doc n’a pas de H1', () => {
    writeSasDoc('s7-eco-aaaa1111.md', '# S7 - eco\n\n## Contents\n1. [[S7 - eco-1]] — TP_Marge.pdf\n2. [[S7 - eco-2]] — Cours2.pdf\n');
    const child = writeSasDoc('cand-x-bbbb2222.md', `<!-- part_of: S7 - eco order: 2 -->\n${LONG}`);
    const input = sasDocToInput(child);
    expect(input.title).toBe('S7 - eco — Cours2.pdf');
    expect(input.partOf).toBe('S7 - eco');
    expect(input.order).toBe(2);
    expect(input.id.startsWith('resource-s7-eco-cours2-pdf-')).toBe(true);
  });

  it('retombe sur « part_of — document N » quand la ligne de manifeste manque', () => {
    const child = writeSasDoc('cand-y-cccc3333.md', `<!-- part_of: S9 - inconnu order: 4 -->\n${LONG}`);
    const input = sasDocToInput(child);
    expect(input.title).toBe('S9 - inconnu — document 4');
  });

  it('un H1 présent garde la priorité sur le manifeste', () => {
    writeSasDoc('s7-eco-dddd4444.md', '# S7 - eco\n\n## Contents\n1. [[S7 - eco-1]] — X.pdf\n');
    const child = writeSasDoc('cand-z-eeee5555.md', `<!-- part_of: S7 - eco order: 1 -->\n# Mon vrai titre\n${LONG}`);
    expect(sasDocToInput(child).title).toBe('Mon vrai titre');
  });
});

describe('fragments sans valeur → rejected-kept (P1-2)', () => {
  it('écarte un doc < 200 caractères utiles sans appel LLM, fiche rejected-kept sur disque', async () => {
    const { client, calls } = stubLLM();
    writeSasDoc('cand-frag-ffff6666.md', '<!-- part_of: S7 - ml2 order: 29 -->\n\x0eMelvyn POMMIER\x00');
    const res = await distillAll(sasDir, { llm: client, outDir, logPath, date: '2026-08-25', keeper: 'memory-keeper' });
    expect(res.rejectedKept).toHaveLength(1);
    expect(calls).toHaveLength(0);
    const fm = matter(readFileSync(res.rejectedKept![0]!, 'utf8'));
    expect(fm.data.lifecycle).toBe('rejected-kept');
    expect(fm.data.part_of).toBe('S7 - ml2');
    expect(readFileSync(logPath, 'utf8')).toContain('reject-kept');
  });

  it('un doc au-dessus du seuil part bien en distillation (régression)', async () => {
    const { client, calls } = stubLLM();
    writeSasDoc('cand-ok-gggg7777.md', `<!-- part_of: S7 - ml2 order: 1 -->\n${'x'.repeat(400)}`);
    const res = await distillAll(sasDir, { llm: client, outDir, logPath, date: '2026-08-25', keeper: 'memory-keeper' });
    expect(res.distilled).toHaveLength(1);
    expect(res.rejectedKept).toHaveLength(0);
    expect(calls).toHaveLength(1);
  });
});

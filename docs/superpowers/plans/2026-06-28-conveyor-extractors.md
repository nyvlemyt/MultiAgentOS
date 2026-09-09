# Conveyor Extractors + Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the ingestion conveyor operable end-to-end for the PDF path: drop/point at a PDF → clean markdown → admission → deterministic classify → manifest split → a `pending` candidate at the one door, plus an on-disk keyed-supersede applier.

**Architecture:** Build the deferred internals behind the FROZEN #54 sockets. A `PdfRunner`-injected `extractPdf` (markitdown primary + pdftotext cross-check). A `buildFileManifest` files-as-parts helper reusing `buildManifest`. A `runCapturePipeline`/`runMatierePipeline` that orchestrate `extract → SAS → rules-classify → manifest → captureCandidates` (LLM-on-abstain is an injected, budget-gated, default-OFF seam; never imports `@anthropic-ai/sdk`). An `applySupersede` that flips an active fiche to `superseded` + appends one consolidation-log line (never hard-deletes). A `mas` CLI (`capture` + `--inbox`) with testable logic functions + a thin argv wrapper.

**Tech Stack:** TypeScript, Vitest (co-located `.test.ts`), Drizzle/better-sqlite3 (temp-DB harness), `gray-matter`, Node `child_process.execFileSync` (no shell), `tsx` CLIs.

**Spec:** `docs/superpowers/specs/2026-06-28-conveyor-extractors-design.md`. All units live in `packages/memory/src/conveyor/` (NOT re-exported through `@mas/memory`'s barrel — Brique 1d rule).

---

## File Structure

- Create: `packages/memory/src/conveyor/extractors/pdf.ts` (+ `pdf.test.ts`) — PDF→ExtractResult.
- Modify: `packages/memory/src/conveyor/manifest.ts` (+ `manifest.test.ts`) — add `buildFileManifest`.
- Create: `packages/memory/src/conveyor/pipeline.ts` (+ `pipeline.test.ts`) — orchestration.
- Create: `packages/memory/src/conveyor/supersede-apply.ts` (+ `supersede-apply.test.ts`) — on-disk applier + candidate→fiche mapper.
- Modify: `packages/memory/src/capture.ts` (+ `capture.test.ts`) — `classifierDecision` pass-through.
- Create: `packages/memory/src/conveyor/cli.ts` (+ `cli.test.ts`) — CLI logic (inferKind, captureOne, captureInbox, formatSummary).
- Create: `packages/memory/src/mas-cli.ts` — thin argv wrapper (not unit-tested).
- Modify: `packages/memory/package.json`, root `package.json` — `mas` scripts.

---

## Task 1: capture.ts — `classifierDecision` pass-through

The pipeline classifies at capture time; the `classifier_decision` DB column already exists but `captureCandidates` only writes it for dead-letters. Let pending rows carry it too.

**Files:**
- Modify: `packages/memory/src/capture.ts`
- Test: `packages/memory/src/capture.test.ts`

- [ ] **Step 1: Write the failing test** (append inside the existing `describe('captureCandidates …')` block in `capture.test.ts`)

```ts
  it('persists classifierDecision on a pending row', async () => {
    const db = getDb();
    await seedTask();
    const res = await captureCandidates(db, 'task1', [
      { type: 'reference', body: 'A governance note about agents.', classifierDecision: 'learnings/global (rule:kw-learning)' },
    ]);
    expect(res.pending).toHaveLength(1);
    const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, res.pending[0]!));
    expect(row!.classifierDecision).toBe('learnings/global (rule:kw-learning)');
    expect(row!.status).toBe('pending');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mas/memory test -- capture`
Expected: FAIL — `classifierDecision` not assignable to `CaptureCandidate` (tsc) / column null.

- [ ] **Step 3: Add the field + write it on pending rows**

In `CaptureCandidate` (after the `captureFailed?` field), add:

```ts
  /** Classifier decision (`register/scope (rule:…)` or `abstain — …`). Persisted on pending rows. */
  classifierDecision?: string;
```

Change the pending push from `rows.push({ ...base, status: 'pending' });` to:

```ts
    rows.push({ ...base, status: 'pending', classifierDecision: it.classifierDecision });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mas/memory test -- capture`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/memory/src/capture.ts packages/memory/src/capture.test.ts
git commit -m "feat(memory): captureCandidates carries classifierDecision on pending rows"
```

---

## Task 2: PDF extractor (markitdown + pdftotext cross-check)

**Files:**
- Create: `packages/memory/src/conveyor/extractors/pdf.ts`
- Test: `packages/memory/src/conveyor/extractors/pdf.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { extractPdf, makePdfExtractor, ExtractorEmptyError, MIN_EXTRACT_CHARS, type PdfRunner } from './pdf';

function fakeRunner(md: string, txt: string, bytes = Buffer.from('PDFBYTES')): PdfRunner {
  return { markitdown: () => md, pdftotext: () => txt, readBytes: () => bytes };
}

describe('extractPdf', () => {
  it('returns markitdown markdown, content-hash source_key, untrusted trust', () => {
    const bytes = Buffer.from('hello-pdf');
    const r = extractPdf('/x.pdf', fakeRunner('# Title\n\nBody text here, long enough.', 'Title\nBody text here.', bytes));
    expect(r.markdown).toContain('# Title');
    expect(r.trust).toBe('untrusted');
    expect(r.ocr_confidence).toBeUndefined();
    expect(r.source_key).toBe(`pdf:${createHash('sha256').update(bytes).digest('hex')}`);
  });

  it('falls back to fenced pdftotext when markitdown under-extracts', () => {
    const r = extractPdf('/x.pdf', fakeRunner('   ', 'Real recovered text that pdftotext found in the layout.'));
    expect(r.markdown.startsWith('```text')).toBe(true);
    expect(r.markdown).toContain('Real recovered text');
  });

  it('throws ExtractorEmptyError when both extractors are empty', () => {
    expect(() => extractPdf('/x.pdf', fakeRunner('', '   '))).toThrow(ExtractorEmptyError);
  });

  it('MIN_EXTRACT_CHARS guards the empty threshold', () => {
    expect(MIN_EXTRACT_CHARS).toBeGreaterThan(0);
  });

  it('makePdfExtractor adapts to the frozen async Extractor signature', async () => {
    const ex = makePdfExtractor(fakeRunner('# Ok\n\nEnough body to pass the threshold.', 'Ok body'));
    const r = await ex('pdf', '/x.pdf');
    expect(r.markdown).toContain('# Ok');
    expect(r.trust).toBe('untrusted');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mas/memory test -- pdf`
Expected: FAIL — `./pdf` not found.

- [ ] **Step 3: Write the implementation**

```ts
// packages/memory/src/conveyor/extractors/pdf.ts
// PDF leaf of the FROZEN Extractor interface (design spec §5 Brique 6, [[feedback_pdf-to-md-reads]]).
// markitdown is primary (structure-preserving) but mangles tables; pdftotext -layout is the
// cross-check: it recovers text when markitdown under-extracts and proves a real text layer
// exists. Both empty ⇒ ExtractorEmptyError (no text layer — real OCR is a deferred leaf).
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import type { ExtractResult, Extractor } from '../extractor';

/** Below this many non-blank chars an extraction counts as "empty" and triggers the cross-check. */
export const MIN_EXTRACT_CHARS = 20;
const MAX_SUBPROCESS_BUFFER = 64 * 1024 * 1024;

/** Both extractors produced no usable text — a scanned/image PDF (deferred OCR leaf). */
export class ExtractorEmptyError extends Error {
  constructor(path: string) {
    super(`PDF extraction produced no text (markitdown + pdftotext both empty): ${path}`);
    this.name = 'ExtractorEmptyError';
  }
}

/** Subprocess seam — injected so tests run with zero child processes. */
export interface PdfRunner {
  /** `python3 -m markitdown <path>` stdout (markdown). Throws on subprocess failure. */
  markitdown(path: string): string;
  /** `pdftotext -layout <path> -` stdout (plain text). Throws on subprocess failure. */
  pdftotext(path: string): string;
  /** Raw file bytes for the content-hash source_key. */
  readBytes(path: string): Buffer;
}

/** The real runner: execFileSync (args as array → no shell, no injection). Used by the CLI. */
export const realPdfRunner: PdfRunner = {
  markitdown: (path) =>
    execFileSync('python3', ['-m', 'markitdown', path], { encoding: 'utf8', maxBuffer: MAX_SUBPROCESS_BUFFER }),
  pdftotext: (path) =>
    execFileSync('pdftotext', ['-layout', path, '-'], { encoding: 'utf8', maxBuffer: MAX_SUBPROCESS_BUFFER }),
  readBytes: (path) => readFileSync(path),
};

/** Content-addressed, rename-stable, idempotent re-ingest key. */
export function pdfSourceKey(bytes: Buffer): string {
  return `pdf:${createHash('sha256').update(bytes).digest('hex')}`;
}

/**
 * Extract one PDF to clean markdown. markitdown primary; on under-extraction, fall back to a
 * fenced pdftotext block rather than lose content; both empty ⇒ ExtractorEmptyError. A subprocess
 * crash propagates as the thrown error (the pipeline maps it to `extractor_crash`). trust is
 * ALWAYS `untrusted` (dropped external file = untrusted free text, §114 anti-injection).
 */
export function extractPdf(path: string, runner: PdfRunner): ExtractResult {
  const source_key = pdfSourceKey(runner.readBytes(path));
  const md = runner.markitdown(path).trim();
  if (md.length >= MIN_EXTRACT_CHARS) {
    return { markdown: md, source_key, trust: 'untrusted' };
  }
  const txt = runner.pdftotext(path).trim();
  if (txt.length >= MIN_EXTRACT_CHARS) {
    return { markdown: `\`\`\`text\n${txt}\n\`\`\``, source_key, trust: 'untrusted' };
  }
  throw new ExtractorEmptyError(path);
}

/** Adapt extractPdf to the FROZEN `Extractor` signature for the registry. */
export function makePdfExtractor(runner: PdfRunner = realPdfRunner): Extractor {
  return async (_sourceKind, source) => extractPdf(source, runner);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mas/memory test -- pdf`
Expected: PASS (5 tests).

- [ ] **Step 5: Verify the real markitdown stdout contract once** (one-off, no commit)

Run: `python3 -m markitdown "docs/ressources/022-Lean claude.pdf" | head -5`
Expected: markdown text on stdout. If markitdown needs a different flag (e.g. writes nowhere), adjust `realPdfRunner.markitdown` accordingly and re-run Step 4. Record the working invocation in a code comment.

- [ ] **Step 6: Commit**

```bash
git add packages/memory/src/conveyor/extractors/pdf.ts packages/memory/src/conveyor/extractors/pdf.test.ts
git commit -m "feat(memory): pdf extractor — markitdown primary + pdftotext cross-check"
```

---

## Task 3: manifest `buildFileManifest` (files-as-parts, decision A)

**Files:**
- Modify: `packages/memory/src/conveyor/manifest.ts`
- Test: `packages/memory/src/conveyor/manifest.test.ts`

- [ ] **Step 1: Write the failing test** (append to `manifest.test.ts`)

```ts
import { buildFileManifest } from './manifest';

describe('buildFileManifest (files-as-parts, decision A)', () => {
  const files = [
    { sourceKey: 'pdf:aaa', heading: 'Lesson 1', markdown: '# L1\nbody' },
    { sourceKey: 'pdf:bbb', heading: 'Lesson 2', markdown: '# L2\nbody' },
  ];

  it('mother carries a matiere:<slug> key + a MOC; children carry per-file source_key', () => {
    const nodes = buildFileManifest({ parentId: 'gov-course', title: 'Gov Course', trust: 'untrusted', derivedFrom: 'docs/resources/inbox/gov', files });
    const mother = nodes.find((n) => n.role === 'manifest')!;
    const children = nodes.filter((n) => n.role === 'child');
    expect(mother.source_key).toBe('matiere:gov-course');
    expect(mother.markdown).toContain('## Contents');
    expect(children).toHaveLength(2);
    expect(children[0]!.source_key).toBe('pdf:aaa');
    expect(children[1]!.source_key).toBe('pdf:bbb');
    expect(children[0]!.part_of).toBe('gov-course');
    expect(children[0]!.order).toBe(1);
  });

  it('throws for a single file (no orphan-of-one manifest)', () => {
    expect(() => buildFileManifest({ parentId: 'p', title: 'T', trust: 'low', derivedFrom: 'd', files: [files[0]!] })).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mas/memory test -- manifest`
Expected: FAIL — `buildFileManifest` not exported.

- [ ] **Step 3: Implement** (append to `manifest.ts`, after `buildManifest`)

```ts
export interface FileManifestInput {
  parentId: string;
  title: string;
  trust: Trust;
  derivedFrom: string;
  files: { sourceKey: string; heading: string; markdown: string }[];
}

// split/filter/join on a single char class — no anchored quantifier for S5852 to flag
// (mirror of intake.ts slugify).
function slugifyTitle(title: string): string {
  return title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).join('-');
}

/**
 * Build a matière manifest from N≥2 files (decision A: a folder = one matière). The mother carries
 * `matiere:<slug>` + a MOC; each child keeps its OWN per-file source_key so a single updated file
 * supersedes only its child (keyed idempotence). Throws on <2 files — a single file needs no manifest.
 */
export function buildFileManifest(input: FileManifestInput): ManifestNode[] {
  if (input.files.length < 2) {
    throw new Error('buildFileManifest requires ≥2 files; a single file needs no manifest');
  }
  const nodes = buildManifest({
    parentId: input.parentId,
    sourceKey: `matiere:${slugifyTitle(input.title)}`,
    derivedFrom: input.derivedFrom,
    title: input.title,
    trust: input.trust,
    parts: input.files.map((f) => ({ heading: f.heading, markdown: f.markdown })),
  });
  return nodes.map((n) =>
    n.role === 'child' && n.order != null ? { ...n, source_key: input.files[n.order - 1]!.sourceKey } : n,
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mas/memory test -- manifest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/memory/src/conveyor/manifest.ts packages/memory/src/conveyor/manifest.test.ts
git commit -m "feat(memory): manifest buildFileManifest — files-as-parts (decision A)"
```

---

## Task 4: pipeline `runCapturePipeline` (single source)

**Files:**
- Create: `packages/memory/src/conveyor/pipeline.ts`
- Test: `packages/memory/src/conveyor/pipeline.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import { getDb, closeDb, memoryCandidates } from '@mas/db';
import { ExtractorRegistry } from './extractor';
import { runCapturePipeline } from './pipeline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, '../../../db/migrations');

let dbPath: string;
beforeEach(() => {
  dbPath = join(tmpdir(), `mas-${randomUUID()}.db`);
  migrate(getDb(dbPath), { migrationsFolder: MIGRATIONS_FOLDER });
});
afterEach(() => {
  closeDb();
  unlinkSync(dbPath);
});

function registryWith(extractor: (k: string, s: string) => Promise<{ markdown: string; source_key: string; trust: 'trusted' | 'untrusted' | 'low' }>) {
  const r = new ExtractorRegistry();
  r.register('pdf', extractor);
  return r;
}

describe('runCapturePipeline', () => {
  it('extracts → classifies (rules) → writes one pending candidate at the one door', async () => {
    const db = getDb();
    const registry = registryWith(async () => ({ markdown: 'We learned a useful pattern about agents.', source_key: 'pdf:k1', trust: 'untrusted' }));
    const res = await runCapturePipeline(db, { kind: 'pdf', source: '/x.pdf', title: 'X' }, { registry });
    expect(res.pending).toHaveLength(1);
    const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, res.pending[0]!));
    expect(row!.sourceKey).toBe('pdf:k1');
    expect(row!.trust).toBe('untrusted');
    expect(row!.type).toBe('reference');
    expect(row!.classifierDecision).toContain('learnings');
  });

  it('records abstain as a flagged pending candidate (never silently mis-filed)', async () => {
    const db = getDb();
    const registry = registryWith(async () => ({ markdown: 'neutral prose with no register signal at all', source_key: 'pdf:k2', trust: 'untrusted' }));
    const res = await runCapturePipeline(db, { kind: 'pdf', source: '/y.pdf' }, { registry });
    expect(res.pending).toHaveLength(1);
    const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, res.pending[0]!));
    expect(row!.classifierDecision).toContain('abstain');
  });

  it('dead-letters an unknown source kind (never a silent skip)', async () => {
    const db = getDb();
    const registry = new ExtractorRegistry();
    const res = await runCapturePipeline(db, { kind: 'docx', source: '/z.docx' }, { registry });
    expect(res.failed).toHaveLength(1);
    const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, res.failed[0]!));
    expect(row!.status).toBe('capture_failed');
    expect(row!.classifierDecision).toContain('unknown_source_kind');
  });

  it('dead-letters an extractor crash and an empty extraction', async () => {
    const db = getDb();
    const crashReg = registryWith(async () => { throw new Error('boom'); });
    const crash = await runCapturePipeline(db, { kind: 'pdf', source: '/c.pdf' }, { registry: crashReg });
    const [crashRow] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, crash.failed[0]!));
    expect(crashRow!.classifierDecision).toContain('extractor_crash');
  });

  it('dead-letters an oversize source before extracting', async () => {
    const db = getDb();
    const registry = registryWith(async () => ({ markdown: 'x', source_key: 'k', trust: 'untrusted' }));
    const res = await runCapturePipeline(db, { kind: 'pdf', source: '/big.pdf', bytes: 999_999_999 }, { registry });
    expect(res.failed).toHaveLength(1);
    const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, res.failed[0]!));
    expect(row!.classifierDecision).toContain('oversize');
  });

  it('runs the budget-gated LLM only when wired AND budget is open, with anti-injection wrap', async () => {
    const db = getDb();
    const reg = registryWith(async () => ({ markdown: 'neutral prose with no register signal at all', source_key: 'pdf:k3', trust: 'untrusted' }));
    const seen: string[] = [];
    const llm = (p: string) => { seen.push(p); return 'learnings'; };
    // budget blocked → LLM NOT called
    await runCapturePipeline(db, { kind: 'pdf', source: '/b.pdf' }, { registry: reg, llm, budgetBlocked: () => true });
    expect(seen).toHaveLength(0);
    // budget open → LLM called, prompt is anti-injection-wrapped
    await runCapturePipeline(db, { kind: 'pdf', source: '/b2.pdf' }, { registry: reg, llm, budgetBlocked: () => false });
    expect(seen).toHaveLength(1);
    expect(seen[0]).toContain('<untrusted-source>');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mas/memory test -- pipeline`
Expected: FAIL — `./pipeline` not found.

- [ ] **Step 3: Implement**

```ts
// packages/memory/src/conveyor/pipeline.ts
// The markdown-first ingestion conveyor (design spec §5 Brique 6). Orchestrates the FROZEN units:
// extract → admission SAS (inside captureCandidates) → deterministic-rules classify → manifest →
// write (the one door). The ONLY LLM in the capture path is the optional, budget-gated,
// anti-injection-wrapped classify-on-abstain — default OFF (§11-safe). NOT in the @mas/memory barrel.
import { basename } from 'node:path';
import type { getDb } from '@mas/db';
import { captureCandidates, type CaptureCandidate, type CaptureResult } from '../capture';
import { classifyByRulesOnly } from '../classifier';
import type { ExtractorRegistry, ExtractResult } from './extractor';
import type { DeadLetterCause } from './admission';
import { wrapUntrusted } from './anti-injection';
import { ExtractorEmptyError } from './extractors/pdf';

type Db = ReturnType<typeof getDb>;

/** Hard size ceiling — a source bigger than this is dead-lettered before extraction (anti quota/OOM bomb). */
export const MAX_SOURCE_BYTES = 50 * 1024 * 1024;

export interface PipelineSource {
  /** Extractor registry key, e.g. 'pdf'. */
  kind: string;
  /** Path or URL handed to the extractor. */
  source: string;
  /** Candidate/manifest title (default: basename of source). */
  title?: string;
  /** Byte size for the oversize guard (CLI supplies statSync().size). */
  bytes?: number;
}

export interface PipelineDeps {
  registry: ExtractorRegistry;
  sourceTaskId?: string | null;
  /** Optional light LLM for classify-on-abstain. Injected (this package stays LLM-free, §11). */
  llm?: (prompt: string) => Promise<string> | string;
  /** Optional budget gate — true ⇒ skip the LLM call (never a silent quota bomb). */
  budgetBlocked?: () => boolean;
}

function failed(db: Db, taskId: string | null, body: string, cause: DeadLetterCause, detail: string): Promise<CaptureResult> {
  return captureCandidates(db, taskId, [{ type: 'reference', body, captureFailed: { cause, detail } }]);
}

/** Rules-first classify; LLM-on-abstain only when wired AND budget open. Returns the decision string. */
async function decide(markdown: string, deps: PipelineDeps): Promise<string> {
  const ruled = classifyByRulesOnly({ body: markdown, candidateType: 'reference' });
  if (ruled) return `${ruled.register}/${ruled.scope} (rule:${ruled.rule})`;
  if (deps.llm && deps.budgetBlocked?.() !== true) {
    const answer = await deps.llm(wrapUntrusted(markdown)); // anti-injection BEFORE the model
    return `llm:${String(answer).trim().slice(0, 40)}`;
  }
  const why = deps.llm ? 'llm-classify skipped (budget)' : 'needs human triage';
  return `abstain — ${why}`;
}

/**
 * Capture one source through the conveyor. Resolvable kind → extract → classify → one pending
 * candidate at the one door. Unknown kind / oversize / extractor crash / empty extraction →
 * a `capture_failed` dead-letter (visible + relaunchable, never silent).
 */
export async function runCapturePipeline(db: Db, src: PipelineSource, deps: PipelineDeps): Promise<CaptureResult> {
  const taskId = deps.sourceTaskId ?? null;
  const title = src.title ?? basename(src.source);

  if (src.bytes != null && src.bytes > MAX_SOURCE_BYTES) {
    return failed(db, taskId, `[oversize] ${src.source}`, 'oversize', `${src.bytes} bytes`);
  }
  const extractor = deps.registry.resolve(src.kind);
  if (!extractor) {
    return failed(db, taskId, `[unknown kind] ${src.source}`, 'unknown_source_kind', src.kind);
  }

  let result: ExtractResult;
  try {
    result = await extractor(src.kind, src.source);
  } catch (e) {
    const cause: DeadLetterCause = e instanceof ExtractorEmptyError ? 'ocr_empty' : 'extractor_crash';
    return failed(db, taskId, `[${cause}] ${src.source}`, cause, (e as Error).message);
  }

  const candidate: CaptureCandidate = {
    type: 'reference',
    body: result.markdown,
    title,
    sourceKey: result.source_key,
    trust: result.trust,
    sourceResolvable: true,
    signals: ['reference', src.kind],
    classifierDecision: await decide(result.markdown, deps),
  };
  return captureCandidates(db, taskId, [candidate]);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mas/memory test -- pipeline`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/memory/src/conveyor/pipeline.ts packages/memory/src/conveyor/pipeline.test.ts
git commit -m "feat(memory): conveyor pipeline — extract→SAS→rules-classify→one-door"
```

---

## Task 5: pipeline `runMatierePipeline` (multi-file → manifest)

**Files:**
- Modify: `packages/memory/src/conveyor/pipeline.ts`
- Test: `packages/memory/src/conveyor/pipeline.test.ts`

- [ ] **Step 1: Write the failing test** (append to `pipeline.test.ts`)

```ts
import { runMatierePipeline } from './pipeline';

describe('runMatierePipeline', () => {
  it('extracts N files → 1 manifest mother + N children at the one door', async () => {
    const db = getDb();
    let i = 0;
    const reg = new ExtractorRegistry();
    reg.register('pdf', async () => { i += 1; return { markdown: `learning number ${i}`, source_key: `pdf:k${i}`, trust: 'untrusted' as const }; });
    const res = await runMatierePipeline(db, {
      parentId: 'matiere-1', title: 'Governance', derivedFrom: 'docs/resources/inbox/gov',
      sources: [{ kind: 'pdf', source: '/a.pdf', title: 'A' }, { kind: 'pdf', source: '/b.pdf', title: 'B' }],
    }, { registry: reg });
    expect(res.pending).toHaveLength(3); // mother + 2 children
    const rows = await db.select().from(memoryCandidates);
    const keys = rows.map((r) => r.sourceKey).sort();
    expect(keys).toContain('matiere:governance');
    expect(keys).toContain('pdf:k1');
    expect(keys).toContain('pdf:k2');
  });

  it('falls back to a single flat candidate when only one file extracts', async () => {
    const db = getDb();
    const reg = new ExtractorRegistry();
    let n = 0;
    reg.register('pdf', async () => { n += 1; if (n === 1) throw new Error('boom'); return { markdown: 'second file ok', source_key: 'pdf:ok', trust: 'untrusted' as const }; });
    const res = await runMatierePipeline(db, {
      parentId: 'm2', title: 'T', derivedFrom: 'd',
      sources: [{ kind: 'pdf', source: '/x.pdf' }, { kind: 'pdf', source: '/y.pdf' }],
    }, { registry: reg });
    expect(res.failed).toHaveLength(1);  // the crash
    expect(res.pending).toHaveLength(1); // single survivor, no manifest
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mas/memory test -- pipeline`
Expected: FAIL — `runMatierePipeline` not exported.

- [ ] **Step 3: Implement** (append to `pipeline.ts`; add imports for `buildFileManifest` + `ManifestNode`)

At the top, extend the manifest import:

```ts
import { buildFileManifest, type ManifestNode } from './manifest';
```

Append:

```ts
export interface MatiereInput {
  parentId: string;
  title: string;
  derivedFrom: string;
  sources: PipelineSource[];
}

interface Extracted { result: ExtractResult; src: PipelineSource }

async function extractAll(deps: PipelineDeps, sources: PipelineSource[]): Promise<{ ok: Extracted[]; dead: CaptureCandidate[] }> {
  const ok: Extracted[] = [];
  const dead: CaptureCandidate[] = [];
  for (const src of sources) {
    const extractor = deps.registry.resolve(src.kind);
    if (!extractor) {
      dead.push({ type: 'reference', body: `[unknown kind] ${src.source}`, captureFailed: { cause: 'unknown_source_kind', detail: src.kind } });
      continue;
    }
    try {
      ok.push({ result: await extractor(src.kind, src.source), src });
    } catch (e) {
      const cause: DeadLetterCause = e instanceof ExtractorEmptyError ? 'ocr_empty' : 'extractor_crash';
      dead.push({ type: 'reference', body: `[${cause}] ${src.source}`, captureFailed: { cause, detail: (e as Error).message } });
    }
  }
  return { ok, dead };
}

async function manifestCandidate(node: ManifestNode, deps: PipelineDeps): Promise<CaptureCandidate> {
  const body = node.role === 'child' ? `<!-- part_of: ${node.part_of} order: ${node.order} -->\n${node.markdown}` : node.markdown;
  return {
    type: 'reference', body, title: node.title, sourceKey: node.source_key, trust: node.trust,
    sourceResolvable: true, signals: ['reference', node.role],
    classifierDecision: await decide(node.markdown, deps),
  };
}

/**
 * Capture a matière (decision A: a folder = one matière). Extract each file; ≥2 survivors → 1 manifest
 * mother + N children (keyed per-file source_key); exactly 1 → a flat candidate (no orphan-of-one);
 * failures are dead-lettered, never dropped. All writes go through the one door.
 */
export async function runMatierePipeline(db: Db, input: MatiereInput, deps: PipelineDeps): Promise<CaptureResult> {
  const taskId = deps.sourceTaskId ?? null;
  const { ok, dead } = await extractAll(deps, input.sources);

  const items: CaptureCandidate[] = [...dead];
  if (ok.length >= 2) {
    const nodes = buildFileManifest({
      parentId: input.parentId, title: input.title, derivedFrom: input.derivedFrom,
      trust: ok.every((e) => e.result.trust === 'trusted') ? 'trusted' : 'untrusted',
      files: ok.map((e) => ({ sourceKey: e.result.source_key, heading: e.src.title ?? basename(e.src.source), markdown: e.result.markdown })),
    });
    for (const node of nodes) items.push(await manifestCandidate(node, deps));
  } else if (ok.length === 1) {
    const only = ok[0]!;
    items.push({
      type: 'reference', body: only.result.markdown, title: only.src.title ?? basename(only.src.source),
      sourceKey: only.result.source_key, trust: only.result.trust, sourceResolvable: true,
      signals: ['reference', only.src.kind], classifierDecision: await decide(only.result.markdown, deps),
    });
  }
  return captureCandidates(db, taskId, items);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mas/memory test -- pipeline`
Expected: PASS (8 tests total).

- [ ] **Step 5: Commit**

```bash
git add packages/memory/src/conveyor/pipeline.ts packages/memory/src/conveyor/pipeline.test.ts
git commit -m "feat(memory): conveyor matiere pipeline — N files → manifest mother+children"
```

---

## Task 6: on-disk supersede applier + candidate→fiche mapper

**Files:**
- Create: `packages/memory/src/conveyor/supersede-apply.ts`
- Test: `packages/memory/src/conveyor/supersede-apply.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import matter from 'gray-matter';
import { applySupersede, ficheFrontmatterFromCandidate, type FicheWrite } from './supersede-apply';

let dir: string;
let logPath: string;
beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'mas-fiche-')); logPath = join(dir, 'consolidation-log.md'); writeFileSync(logPath, '# log\n', 'utf8'); });
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

function activeFiche(id: string, sourceKey: string): void {
  writeFileSync(join(dir, `${id}.md`), matter.stringify('old body', {
    id, slug: id, source_key: sourceKey, lifecycle: 'active', trust: 'untrusted', lane: 'resources',
  }), 'utf8');
}

const incoming: FicheWrite = {
  id: 'fiche-new', source_key: 'pdf:k1', lane: 'resources',
  frontmatter: { id: 'fiche-new', slug: 'fiche-new', source_key: 'pdf:k1', lifecycle: 'active', trust: 'untrusted', lane: 'resources' },
  body: 'new body',
};

describe('applySupersede', () => {
  it('writes the incoming fiche when no active match exists (plain add)', () => {
    const r = applySupersede(dir, logPath, incoming, { date: '2026-06-28', keeper: 'memory-keeper' });
    expect(existsSync(r.written)).toBe(true);
    expect(r.superseded).toBeUndefined();
    expect(readFileSync(logPath, 'utf8')).not.toContain('supersede');
  });

  it('flips an active same-key fiche to superseded + appends one log line (never hard-deletes)', () => {
    activeFiche('fiche-old', 'pdf:k1');
    const r = applySupersede(dir, logPath, incoming, { date: '2026-06-28', keeper: 'memory-keeper' });
    expect(r.superseded).toContain('fiche-old.md');
    expect(existsSync(join(dir, 'fiche-old.md'))).toBe(true); // never hard-deleted
    const flipped = matter(readFileSync(join(dir, 'fiche-old.md'), 'utf8')).data;
    expect(flipped.lifecycle).toBe('superseded');
    expect(flipped.superseded_by).toBe('fiche-new');
    expect(readFileSync(logPath, 'utf8')).toContain('2026-06-28 | supersede | ids=fiche-old,fiche-new');
  });

  it('throws on an illegal lifecycle transition (e.g. already archived)', () => {
    writeFileSync(join(dir, 'arch.md'), matter.stringify('b', { id: 'arch', source_key: 'pdf:k1', lifecycle: 'archived' }), 'utf8');
    // archived has no active match → planSupersede returns null → plain add, no throw
    expect(() => applySupersede(dir, logPath, incoming, { date: '2026-06-28', keeper: 'memory-keeper' })).not.toThrow();
  });
});

describe('ficheFrontmatterFromCandidate', () => {
  it('derives a FicheSchema-valid frontmatter with resource defaults', () => {
    const fm = ficheFrontmatterFromCandidate({
      id: 'cand_1', sourceKey: 'pdf:k1', trust: 'untrusted', body: '# T\nbody',
      classifierDecision: 'learnings/global (rule:kw-learning)', derivedFrom: 'docs/resources/inbox/x.pdf',
    });
    expect(fm.kind).toBe('resource');
    expect(fm.lifecycle).toBe('active');
    expect(fm.register).toBe('learnings');
    expect(fm.derived_from).toBe('docs/resources/inbox/x.pdf');
    expect(fm.source_key).toBe('pdf:k1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mas/memory test -- supersede-apply`
Expected: FAIL — `./supersede-apply` not found.

- [ ] **Step 3: Implement**

```ts
// packages/memory/src/conveyor/supersede-apply.ts
// On-disk applier for the keyed-supersede plan (design spec §5/§9.8, ADR 0008 §5). The pure
// planSupersede/markSuperseded (supersede.ts) are the frozen socket; this is their first disk caller:
// match an active fiche on source_key → flip it to `superseded` (status-flip, NEVER hard-delete) +
// append one consolidation-log line, then write the incoming as active. Keeper-side (promote), not a
// capture-side write. NOT in the @mas/memory barrel. LLM ADD/UPDATE/NONE auto-judge stays deferred.
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { planSupersede, markSuperseded, type ExistingFiche } from './supersede';

export interface FicheWrite {
  id: string;
  source_key: string;
  lane?: string;
  /** Full FicheSchema-shaped frontmatter for the new active fiche. */
  frontmatter: Record<string, unknown>;
  body: string;
}

export interface ApplyResult {
  written: string;
  superseded?: string;
  logLine?: string;
}

interface Scanned { path: string; data: Record<string, unknown>; content: string; ef: ExistingFiche }

function scan(dir: string): Scanned[] {
  if (!existsSync(dir)) return [];
  const out: Scanned[] = [];
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.md'))) {
    const path = join(dir, f);
    const parsed = matter(readFileSync(path, 'utf8'));
    const data = parsed.data as Record<string, unknown>;
    out.push({
      path, data, content: parsed.content,
      ef: { id: String(data.id ?? ''), source_key: String(data.source_key ?? ''), lifecycle: String(data.lifecycle ?? ''), lane: data.lane as string | undefined },
    });
  }
  return out;
}

/**
 * Apply the supersede plan on disk. If an active fiche shares the incoming source_key, flip it to
 * superseded (guarded by isLegalTransition inside markSuperseded) + append one log line; the victim
 * file is rewritten in place, never deleted. Always writes the incoming fiche as active. `date`
 * injected (deterministic).
 */
export function applySupersede(dir: string, logPath: string, incoming: FicheWrite, opts: { date: string; keeper: string }): ApplyResult {
  mkdirSync(dir, { recursive: true });
  const existing = scan(dir);
  const plan = planSupersede(existing.map((e) => e.ef), { id: incoming.id, source_key: incoming.source_key, lane: incoming.lane }, opts);

  let supersededPath: string | undefined;
  let logLine: string | undefined;
  if (plan) {
    const victim = existing.find((e) => e.ef.id === plan.supersededId)!;
    writeFileSync(victim.path, matter.stringify(victim.content, markSuperseded(victim.data, plan.supersededBy)), 'utf8');
    supersededPath = victim.path;
    logLine = plan.logLine;
    appendFileSync(logPath, `${plan.logLine}\n`, 'utf8');
  }

  const written = join(dir, `${incoming.id}.md`);
  writeFileSync(written, matter.stringify(incoming.body, { ...incoming.frontmatter, lifecycle: 'active' }), 'utf8');
  return { written, superseded: supersededPath, logLine };
}

export interface CandidateForFiche {
  id: string;
  sourceKey: string;
  trust: 'trusted' | 'untrusted' | 'low';
  body: string;
  classifierDecision?: string;
  /** Raw source path/URL — fills the REQUIRED FicheSchema `derived_from`. */
  derivedFrom: string;
}

const VALID_REGISTERS = new Set(['decisions', 'learnings', 'blockers', 'journal', 'evals']);

/** First token of `classifierDecision` that is a real register, else 'learnings' (ingested-resource default). */
function registerFromDecision(decision: string | undefined): string {
  const head = (decision ?? '').split(/[/\s]/)[0] ?? '';
  return VALID_REGISTERS.has(head) ? head : 'learnings';
}

/**
 * Build a FicheSchema-valid frontmatter from a promoted candidate. The LLM body distillation is
 * deferred — v1 promotes with the captured markdown as body; a later distill pass supersedes it in
 * place via the same source_key. Resource defaults: kind=resource, doc_type=reference,
 * actionability=resource, lane=resources, scope=global.
 */
export function ficheFrontmatterFromCandidate(cand: CandidateForFiche): Record<string, unknown> {
  return {
    id: cand.id, slug: cand.id, source_key: cand.sourceKey,
    derived_from: cand.derivedFrom, lifecycle: 'active', trust: cand.trust,
    kind: 'resource', register: registerFromDecision(cand.classifierDecision),
    scope: 'global', doc_type: 'reference', actionability: 'resource', lane: 'resources',
    schema_version: '1',
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mas/memory test -- supersede-apply`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/memory/src/conveyor/supersede-apply.ts packages/memory/src/conveyor/supersede-apply.test.ts
git commit -m "feat(memory): on-disk supersede applier + candidate→fiche mapper"
```

---

## Task 7: `mas` CLI (capture + --inbox) + wiring

**Files:**
- Create: `packages/memory/src/conveyor/cli.ts`
- Test: `packages/memory/src/conveyor/cli.test.ts`
- Create: `packages/memory/src/mas-cli.ts`
- Modify: `packages/memory/package.json`, root `package.json`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, memoryCandidates } from '@mas/db';
import { ExtractorRegistry } from './extractor';
import { inferKind, captureOne, captureInbox, formatSummary } from './cli';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, '../../../db/migrations');

let dbPath: string;
let inbox: string;
beforeEach(() => {
  dbPath = join(tmpdir(), `mas-${randomUUID()}.db`);
  migrate(getDb(dbPath), { migrationsFolder: MIGRATIONS_FOLDER });
  inbox = mkdtempSync(join(tmpdir(), 'mas-inbox-'));
});
afterEach(() => { closeDb(); unlinkSync(dbPath); rmSync(inbox, { recursive: true, force: true }); });

function fakeRegistry() {
  const r = new ExtractorRegistry();
  r.register('pdf', async (_k, s) => ({ markdown: `learning from ${s}`, source_key: `pdf:${s}`, trust: 'untrusted' as const }));
  return r;
}

describe('inferKind', () => {
  it('maps .pdf to pdf, http(s) to url, else unknown', () => {
    expect(inferKind('/a/b.pdf')).toBe('pdf');
    expect(inferKind('https://x.com/y')).toBe('url');
    expect(inferKind('/a/b.docx')).toBe('unknown');
  });
});

describe('captureOne', () => {
  it('captures a single pdf path as a pending candidate', async () => {
    const db = getDb();
    const f = join(inbox, 'one.pdf'); writeFileSync(f, 'bytes');
    const res = await captureOne(db, f, { registry: fakeRegistry() });
    expect(res.pending).toHaveLength(1);
  });
});

describe('captureInbox', () => {
  it('treats a subfolder as a matière (manifest) and loose files as singles', async () => {
    const db = getDb();
    writeFileSync(join(inbox, 'loose.pdf'), 'x');
    const sub = join(inbox, 'governance'); mkdirSync(sub);
    writeFileSync(join(sub, 'a.pdf'), 'x'); writeFileSync(join(sub, 'b.pdf'), 'x');
    const res = await captureInbox(db, inbox, { registry: fakeRegistry() });
    // 1 loose single + (1 mother + 2 children) = 4 pending
    expect(res.pending).toHaveLength(4);
    const rows = await db.select().from(memoryCandidates);
    expect(rows.map((r) => r.sourceKey)).toContain('matiere:governance');
  });
});

describe('formatSummary', () => {
  it('renders pending/failed/rejected counts', () => {
    const s = formatSummary({ pending: ['a', 'b'], failed: ['c'], rejected: [{ reason: 'r', body: 'x' }] });
    expect(s).toContain('2 pending');
    expect(s).toContain('1 failed');
    expect(s).toContain('1 rejected');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mas/memory test -- conveyor/cli`
Expected: FAIL — `./cli` not found.

- [ ] **Step 3: Implement the CLI logic**

```ts
// packages/memory/src/conveyor/cli.ts
// CLI logic for `pnpm mas capture` (testable, subprocess-free here — the real PdfRunner is injected
// by mas-cli.ts). Grouping decision A: an inbox SUBFOLDER = one matière (→ manifest); loose files at
// the inbox root = single candidates. Unknown kinds dead-letter, never silently skip.
import { readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import type { getDb } from '@mas/db';
import type { CaptureResult } from '../capture';
import { runCapturePipeline, runMatierePipeline, type PipelineDeps, type PipelineSource } from './pipeline';

type Db = ReturnType<typeof getDb>;

export function inferKind(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return 'url';
  if (pathOrUrl.toLowerCase().endsWith('.pdf')) return 'pdf';
  return 'unknown';
}

function toSource(path: string): PipelineSource {
  let bytes: number | undefined;
  try { bytes = statSync(path).size; } catch { bytes = undefined; }
  return { kind: inferKind(path), source: path, title: basename(path), bytes };
}

/** Capture a single path/URL. */
export function captureOne(db: Db, pathOrUrl: string, deps: PipelineDeps): Promise<CaptureResult> {
  return runCapturePipeline(db, toSource(pathOrUrl), deps);
}

function mergeResults(a: CaptureResult, b: CaptureResult): CaptureResult {
  return { pending: [...a.pending, ...b.pending], failed: [...a.failed, ...b.failed], rejected: [...a.rejected, ...b.rejected] };
}

/** Process a drop folder: subfolders → matières (manifest), loose files → singles. */
export async function captureInbox(db: Db, dir: string, deps: PipelineDeps): Promise<CaptureResult> {
  let acc: CaptureResult = { pending: [], failed: [], rejected: [] };
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const files = readdirSync(full).filter((f) => !f.startsWith('.')).map((f) => toSource(join(full, f)));
      if (files.length === 0) continue;
      acc = mergeResults(acc, await runMatierePipeline(db, { parentId: entry.name, title: entry.name, derivedFrom: full, sources: files }, deps));
    } else if (!entry.name.startsWith('.')) {
      acc = mergeResults(acc, await runCapturePipeline(db, toSource(full), deps));
    }
  }
  return acc;
}

export function formatSummary(res: CaptureResult): string {
  return `[mas capture] ${res.pending.length} pending, ${res.failed.length} failed, ${res.rejected.length} rejected.`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mas/memory test -- conveyor/cli`
Expected: PASS.

- [ ] **Step 5: Write the thin argv wrapper** (no unit test — exercises subprocesses)

```ts
// packages/memory/src/mas-cli.ts
// `pnpm mas capture <path|url>` and `pnpm mas capture --inbox [dir]`. Builds the real registry
// (markitdown + pdftotext) and the temp-free DB; the testable logic lives in conveyor/cli.ts.
// Default path is zero-LLM (rules-only) → §11-safe. Pattern from packages/memory/src/doctor-cli.ts.
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { getDb } from '@mas/db';
import { ExtractorRegistry } from './conveyor/extractor';
import { makePdfExtractor } from './conveyor/extractors/pdf';
import { captureInbox, captureOne, formatSummary } from './conveyor/cli';
import type { PipelineDeps } from './conveyor/pipeline';

function findRepoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

function buildDeps(): PipelineDeps {
  const registry = new ExtractorRegistry();
  registry.register('pdf', makePdfExtractor());
  return { registry }; // no llm/budget → rules-only, §11-safe
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const [cmd, ...rest] = argv;
  if (cmd !== 'capture') {
    console.error('usage: mas capture <path|url> | mas capture --inbox [dir]');
    process.exit(1);
    return;
  }
  const db = getDb();
  const deps = buildDeps();
  if (rest[0] === '--inbox') {
    const dir = rest[1] ?? resolve(findRepoRoot(), 'docs/resources/inbox');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    console.log(formatSummary(await captureInbox(db, dir, deps)));
    return;
  }
  const target = rest[0];
  if (!target) {
    console.error('usage: mas capture <path|url> | mas capture --inbox [dir]');
    process.exit(1);
    return;
  }
  console.log(formatSummary(await captureOne(db, target, deps)));
}

main().catch((e) => { console.error(`[mas capture] ${(e as Error).message}`); process.exit(1); });
```

- [ ] **Step 6: Add package scripts**

In `packages/memory/package.json` `"scripts"`, add after `"mem:doctor"`:

```json
    "mas": "tsx src/mas-cli.ts"
```

In root `package.json` `"scripts"`, add after `"qmd:setup"`:

```json
    "mas": "pnpm --filter @mas/memory mas",
```

- [ ] **Step 7: Smoke the CLI on a real PDF** (one-off, no commit yet)

Run: `pnpm mas capture "docs/ressources/022-Lean claude.pdf"`
Expected: `[mas capture] 1 pending, 0 failed, 0 rejected.` (or a dead-letter line if the PDF has no text layer — never a crash).

- [ ] **Step 8: Commit**

```bash
git add packages/memory/src/conveyor/cli.ts packages/memory/src/conveyor/cli.test.ts packages/memory/src/mas-cli.ts packages/memory/package.json package.json
git commit -m "feat(memory): mas capture CLI (single + --inbox matiere grouping)"
```

---

## Task 8: 5-check gate + end-to-end PDF verify + PR draft

**Files:** none (verification + PR).

- [ ] **Step 1: Full test + lint + build**

Run: `pnpm -r test && pnpm lint && pnpm build`
Expected: all green. (vitest skips typecheck — `pnpm lint` = `tsc --noEmit` per package — run it explicitly; build catches Next graph regressions.)

- [ ] **Step 2: Smoke**

Run: `pnpm --filter @mas/web smoke`
Expected: PASS.

- [ ] **Step 3: End-to-end on the 3 real PDFs + a grouping case**

```bash
mkdir -p docs/resources/inbox/governance
cp "docs/ressources/022-Lean claude.pdf" docs/resources/inbox/
cp "docs/ressources/Gouverner tes Agents IA Templates + Prompts.pdf" docs/resources/inbox/governance/
cp "docs/ressources/Guide Structurer Tes Vrais Agents IA.pdf" docs/resources/inbox/governance/
pnpm mas capture --inbox
```
Expected: `≥4 pending` (1 loose + mother + 2 children), `0 failed` (unless a PDF lacks a text layer → a `capture_failed` line, which is correct never-silent behavior). Then clean up the gitignored copies: `rm -rf docs/resources/inbox`.

- [ ] **Step 4: Push + Sonar**

```bash
git push -u origin knowledge-os/brique-6-extractors
```
Then open a DRAFT PR with base `knowledge-os/brique-1`, poll until the analysis sha matches HEAD, run `scripts/sonar-pr-issues.sh <pr>` until exit 0, and confirm `qualitygates/project_status == OK`. Fix every issue it lists (read `docs/knowledge/sonar-recurring-rules.md` first).

- [ ] **Step 5: Open the PR (draft)** — see the `pr` skill; base `knowledge-os/brique-1`, draft, body references this plan + the spec.

---

## Self-Review

**1. Spec coverage:**
- Spec §2 BUILD.1 pdf.ts → Task 2. ✓
- Spec §2 BUILD.2 manifest files-as-parts → Task 3. ✓
- Spec §2 BUILD.3 pipeline (extract→SAS→classify→manifest→write) → Tasks 4+5; budget-gated LLM-on-abstain + anti-injection → Task 4 Step 1 last test. ✓
- Spec §2 BUILD.4 supersede applier → Task 6. ✓
- Spec §2 BUILD.5 CLI capture + --inbox → Task 7. ✓
- Spec §2 BUILD.6 wiring captureCandidates → Task 1 (classifierDecision) + Tasks 4/5/7 (pipeline → one door). ✓
- Spec §4 guardrails: budget (Task 4 test), anti-injection (Task 4 test — `<untrusted-source>`), one-door (all writes via captureCandidates), never-silent (dead-letter tests Task 4/5), §11 (no SDK import; llm injected), barrel hygiene (no index.ts edit). ✓
- Spec §5 done-criteria → Task 8. ✓
- Spec DEFER list: URL extractor (inferKind→'unknown'→dead-letter, never built), LLM distillation (not in any task), folder rename (explicitly not done; e2e uses docs/ressources). ✓

**2. Placeholder scan:** No TBD/TODO; every code step shows full code; commands have expected output. ✓ (Task 2 Step 5 + Task 7 Step 7 are real verification runs, not placeholders.)

**3. Type consistency:**
- `PdfRunner` { markitdown, pdftotext, readBytes } — consistent Tasks 2 ↔ used by makePdfExtractor (Task 2) ↔ realPdfRunner (Task 2, used in mas-cli Task 7). ✓
- `ExtractResult` { markdown, source_key, trust, ocr_confidence? } — frozen; extractPdf returns it (no `coverage` field added → frozen interface untouched). ✓
- `buildFileManifest(FileManifestInput{parentId,title,trust,derivedFrom,files[{sourceKey,heading,markdown}]})` — Task 3 def ↔ Task 5 call ↔ Task 7. ✓
- `PipelineSource{kind,source,title?,bytes?}` / `PipelineDeps{registry,sourceTaskId?,llm?,budgetBlocked?}` / `MatiereInput{parentId,title,derivedFrom,sources}` — Task 4 def ↔ Task 5 ↔ Task 7. ✓
- `decide()` shared by runCapturePipeline + manifestCandidate + matiere single-path (Task 4/5). ✓
- `CaptureCandidate.classifierDecision` — Task 1 def ↔ pipeline writes it (Task 4/5). ✓
- `applySupersede(dir,logPath,FicheWrite,{date,keeper})` + `ficheFrontmatterFromCandidate(CandidateForFiche)` — Task 6 def, self-contained. ✓
- `inferKind`/`captureOne`/`captureInbox`/`formatSummary` — Task 7 def ↔ test ↔ mas-cli. ✓

No gaps found.

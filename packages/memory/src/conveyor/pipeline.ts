// packages/memory/src/conveyor/pipeline.ts
// The markdown-first ingestion conveyor (design spec §5 Brique 6). Orchestrates the FROZEN units:
// extract → admission SAS (inside captureCandidates) → manifest → write (the one door).
// The capture path is now UNCONDITIONALLY zero-LLM (§11-safe by construction, not by default):
// register classification left it on 2026-09-07. Everything this conveyor produces is an ingested
// document, and the mission registers take no ingested material (ADR 0004 §5, amendement
// 2026-09-07), so there is no register question left to ask — of a rule table or of a model. The
// optional budget-gated classify-on-abstain seam went with it: it could only have laundered the
// same category error at one quota call per document. NOT in the @mas/memory barrel.
import { basename } from 'node:path';
import type { getDb } from '@mas/db';
import { captureCandidates, type CaptureCandidate, type CaptureResult } from '../capture';
import { INGESTED_ABSTAIN } from '../classifier';
import type { ExtractorRegistry, ExtractResult } from './extractor';
import type { DeadLetterCause } from './admission';
import { ExtractorEmptyError } from './extractors/pdf';
import { BlockedHostError } from './net-guard';
import { FetchFailedError } from './extractors/url';
import { buildFileManifest, type ManifestNode } from './manifest';

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
}

function failed(db: Db, taskId: string | null, body: string, cause: DeadLetterCause, detail: string): Promise<CaptureResult> {
  return captureCandidates(db, taskId, [{ type: 'reference', body, captureFailed: { cause, detail } }]);
}

/** Map an extractor throw to its dead-letter cause (net-guard block / fetch failure / empty / crash). */
function causeFor(e: unknown): DeadLetterCause {
  if (e instanceof ExtractorEmptyError) return 'ocr_empty';
  if (e instanceof BlockedHostError) return 'host_not_allowed';
  if (e instanceof FetchFailedError) return 'paywall_404';
  return 'extractor_crash';
}

/**
 * Capture one source through the conveyor. Resolvable kind → extract → one pending candidate at
 * the one door, stamped for human triage. Unknown kind / oversize / extractor crash / empty
 * extraction → a `capture_failed` dead-letter (visible + relaunchable, never silent).
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
    const cause = causeFor(e);
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
    classifierDecision: INGESTED_ABSTAIN,
  };
  return captureCandidates(db, taskId, [candidate]);
}

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
      const cause = causeFor(e);
      dead.push({ type: 'reference', body: `[${cause}] ${src.source}`, captureFailed: { cause, detail: (e as Error).message } });
    }
  }
  return { ok, dead };
}

function manifestCandidate(node: ManifestNode): CaptureCandidate {
  const body = node.role === 'child' ? `<!-- part_of: ${node.part_of} order: ${node.order} -->\n${node.markdown}` : node.markdown;
  return {
    type: 'reference', body, title: node.title, sourceKey: node.source_key, trust: node.trust,
    sourceResolvable: true, signals: ['reference', node.role],
    classifierDecision: INGESTED_ABSTAIN,
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
    for (const node of nodes) items.push(manifestCandidate(node));
  } else if (ok.length === 1) {
    const only = ok[0]!;
    items.push({
      type: 'reference', body: only.result.markdown, title: only.src.title ?? basename(only.src.source),
      sourceKey: only.result.source_key, trust: only.result.trust, sourceResolvable: true,
      signals: ['reference', only.src.kind], classifierDecision: INGESTED_ABSTAIN,
    });
  }
  return captureCandidates(db, taskId, items);
}

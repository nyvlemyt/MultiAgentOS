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

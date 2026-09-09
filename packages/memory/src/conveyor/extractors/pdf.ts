// packages/memory/src/conveyor/extractors/pdf.ts
// PDF leaf of the FROZEN Extractor interface (design spec §5 Brique 6, [[feedback_pdf-to-md-reads]]).
// markitdown is primary (structure-preserving) but mangles tables; pdftotext -layout is the
// cross-check: it recovers text when markitdown under-extracts and proves a real text layer
// exists. Both empty ⇒ ExtractorEmptyError (no text layer — real OCR is a deferred leaf).
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import type { ExtractResult, Extractor } from '../extractor';
import { resolveBin } from './bin';

/** Below this many non-blank chars an extraction counts as "empty" and triggers the cross-check. */
export const MIN_EXTRACT_CHARS = 20;
export const MAX_SUBPROCESS_BUFFER = 64 * 1024 * 1024;

/** Extraction produced no usable text — e.g. a scanned/image PDF (deferred OCR leaf). */
export class ExtractorEmptyError extends Error {
  constructor(path: string, detail = 'markitdown + pdftotext both empty') {
    super(`extraction produced no text (${detail}): ${path}`);
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
    execFileSync(resolveBin('python3'), ['-m', 'markitdown', path], { encoding: 'utf8', maxBuffer: MAX_SUBPROCESS_BUFFER }),
  pdftotext: (path) =>
    execFileSync(resolveBin('pdftotext'), ['-layout', path, '-'], { encoding: 'utf8', maxBuffer: MAX_SUBPROCESS_BUFFER }),
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

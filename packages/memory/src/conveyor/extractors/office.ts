// packages/memory/src/conveyor/extractors/office.ts
// Office leaf (docx/pptx) of the FROZEN Extractor interface (design spec §5 Brique 6).
// markitdown (installed with the [docx,pptx] extras) is the only converter — no pdftotext-style
// cross-check exists for OOXML, so empty output goes straight to ExtractorEmptyError (→ ocr_empty).
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import type { ExtractResult, Extractor } from '../extractor';
import { resolveBin } from './bin';
import { ExtractorEmptyError, MAX_SUBPROCESS_BUFFER, MIN_EXTRACT_CHARS } from './pdf';

export type OfficeKind = 'docx' | 'pptx';

/** Subprocess seam — injected so tests run with zero child processes. */
export interface OfficeRunner {
  /** `python3 -m markitdown <path>` stdout (markdown). Throws on subprocess failure. */
  markitdown(path: string): string;
  /** Raw file bytes for the content-hash source_key. */
  readBytes(path: string): Buffer;
}

/** The real runner: execFileSync (args as array → no shell, no injection). Used by the CLI. */
export const realOfficeRunner: OfficeRunner = {
  markitdown: (path) =>
    execFileSync(resolveBin('python3'), ['-m', 'markitdown', path], { encoding: 'utf8', maxBuffer: MAX_SUBPROCESS_BUFFER }),
  readBytes: (path) => readFileSync(path),
};

/**
 * Extract one docx/pptx to clean markdown via markitdown. Empty output ⇒ ExtractorEmptyError
 * (the pipeline maps it to `ocr_empty`); a subprocess crash propagates (→ `extractor_crash`).
 * trust is ALWAYS `untrusted` (dropped external file = untrusted free text, §114 anti-injection).
 */
export function extractOffice(path: string, kind: OfficeKind, runner: OfficeRunner): ExtractResult {
  const source_key = `${kind}:${createHash('sha256').update(runner.readBytes(path)).digest('hex')}`;
  const md = runner.markitdown(path).trim();
  if (md.length >= MIN_EXTRACT_CHARS) {
    return { markdown: md, source_key, trust: 'untrusted' };
  }
  throw new ExtractorEmptyError(path, 'markitdown empty');
}

/** Adapt extractOffice to the FROZEN `Extractor` signature; the registry key IS the OfficeKind. */
export function makeOfficeExtractor(runner: OfficeRunner = realOfficeRunner): Extractor {
  return async (sourceKind, source) => extractOffice(source, sourceKind as OfficeKind, runner);
}

// packages/memory/src/conveyor/extractor.ts — FROZEN in Brique 6 (design spec §5 Brique 6, ADR 0008).
// The interface is graved now; the 2 v1 extractor bodies (url/pdf) and the deferred
// leaves (docx/pptx/youtube/ocr) are written against a real dropped file later.

export type Trust = 'trusted' | 'untrusted' | 'low';

export interface ExtractResult {
  markdown: string;
  source_key: string;
  trust: Trust;
  ocr_confidence?: number;
}

/** Type-aware seam. The ONLY type-aware component of the conveyor; everything downstream is markdown-only. */
export type Extractor = (sourceKind: string, source: string) => Promise<ExtractResult>;

/**
 * Registry keyed on an OPEN string `sourceKind` (deliberately NOT a closed Zod union, so a
 * future kind is an additive leaf). An unknown kind resolves to `undefined`; the caller maps
 * that to a `capture_failed` dead-letter (`deadLetterReason('unknown_source_kind', kind)`).
 */
export class ExtractorRegistry {
  private readonly byKind = new Map<string, Extractor>();

  register(kind: string, extractor: Extractor): void {
    this.byKind.set(kind, extractor);
  }

  resolve(kind: string): Extractor | undefined {
    return this.byKind.get(kind);
  }

  has(kind: string): boolean {
    return this.byKind.has(kind);
  }

  kinds(): string[] {
    return [...this.byKind.keys()];
  }
}

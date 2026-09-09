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

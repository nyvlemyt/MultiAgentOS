import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { extractOffice, makeOfficeExtractor, type OfficeRunner } from './office';
import { ExtractorEmptyError } from './pdf';

function fakeRunner(md: string, bytes = Buffer.from('OFFICEBYTES')): OfficeRunner {
  return { markitdown: () => md, readBytes: () => bytes };
}

describe('extractOffice', () => {
  it('returns markitdown markdown, docx content-hash source_key, untrusted trust', () => {
    const bytes = Buffer.from('hello-docx');
    const r = extractOffice('/x.docx', 'docx', fakeRunner('# Notes\n\nBody text here, long enough.', bytes));
    expect(r.markdown).toContain('# Notes');
    expect(r.trust).toBe('untrusted');
    expect(r.ocr_confidence).toBeUndefined();
    expect(r.source_key).toBe(`docx:${createHash('sha256').update(bytes).digest('hex')}`);
  });

  it('prefixes the source_key with pptx for slide decks', () => {
    const bytes = Buffer.from('hello-pptx');
    const r = extractOffice('/x.pptx', 'pptx', fakeRunner('# Slide 1\n\nEnough slide content here.', bytes));
    expect(r.source_key).toBe(`pptx:${createHash('sha256').update(bytes).digest('hex')}`);
  });

  it('throws ExtractorEmptyError when markitdown is empty (pipeline maps it to ocr_empty)', () => {
    expect(() => extractOffice('/x.docx', 'docx', fakeRunner('   '))).toThrow(ExtractorEmptyError);
  });

  it('makeOfficeExtractor adapts to the frozen async Extractor signature, keyed by sourceKind', async () => {
    const bytes = Buffer.from('deck');
    const ex = makeOfficeExtractor(fakeRunner('# Ok\n\nEnough body to pass the threshold.', bytes));
    const r = await ex('pptx', '/x.pptx');
    expect(r.markdown).toContain('# Ok');
    expect(r.trust).toBe('untrusted');
    expect(r.source_key).toBe(`pptx:${createHash('sha256').update(bytes).digest('hex')}`);
  });
});

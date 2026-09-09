import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { extractHtml, makeHtmlExtractor, htmlSourceKey } from './html';
import { ExtractorEmptyError } from './pdf';

describe('extractHtml', () => {
  it('cleans an HTML blob to markdown, untrusted, content-hash key', async () => {
    const html = '<html><head><title>My Article</title></head><body><article><h1>My Article</h1><p>This is the real body content, long enough to pass.</p></article></body></html>';
    const r = await extractHtml(html);
    expect(r.markdown).toContain('My Article');
    expect(r.markdown).toContain('real body content');
    expect(r.trust).toBe('untrusted');
    expect(r.source_key).toBe(`html:${createHash('sha256').update(html).digest('hex')}`);
  });

  it('passes already-clean plain text straight through', async () => {
    const text = 'Just some pre-extracted plain text the user pasted, no markup at all here.';
    const r = await extractHtml(text);
    expect(r.markdown).toContain('pre-extracted plain text');
    expect(r.trust).toBe('untrusted');
  });

  it('throws ExtractorEmptyError when the blob has no usable text', async () => {
    await expect(extractHtml('<html><body></body></html>')).rejects.toThrow(ExtractorEmptyError);
  });

  it('makeHtmlExtractor adapts to the frozen Extractor signature', async () => {
    const ex = makeHtmlExtractor();
    const r = await ex('html', 'A plain pasted note that is plenty long enough to clear the threshold.');
    expect(r.source_key.startsWith('html:')).toBe(true);
  });

  it('htmlSourceKey is content-addressed and stable', () => {
    expect(htmlSourceKey('abc')).toBe(htmlSourceKey('abc'));
    expect(htmlSourceKey('abc')).not.toBe(htmlSourceKey('abd'));
  });
});

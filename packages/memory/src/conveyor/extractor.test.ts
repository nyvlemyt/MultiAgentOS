import { describe, it, expect } from 'vitest';
import { ExtractorRegistry, type ExtractResult, type Extractor } from './extractor';

const fakeUrl: Extractor = async (_kind, source) => ({
  markdown: `# from ${source}`,
  source_key: `sha256:${source}`,
  trust: 'untrusted',
});

describe('ExtractorRegistry (frozen Extractor interface, open string kind)', () => {
  it('resolves a registered extractor by its open string kind', async () => {
    const reg = new ExtractorRegistry();
    reg.register('url', fakeUrl);
    const extractor = reg.resolve('url');
    expect(extractor).toBe(fakeUrl);
    const out = await extractor!('url', 'https://x.test');
    expect(out).toMatchObject<Partial<ExtractResult>>({
      markdown: '# from https://x.test',
      trust: 'untrusted',
    });
  });

  it('returns undefined and has()=false for an unknown kind (→ caller dead-letters as capture_failed)', () => {
    const reg = new ExtractorRegistry();
    reg.register('url', fakeUrl);
    expect(reg.resolve('docx')).toBeUndefined();
    expect(reg.has('docx')).toBe(false);
    expect(reg.has('url')).toBe(true);
  });

  it('lists registered kinds and is open to any string kind (no closed Zod union)', () => {
    const reg = new ExtractorRegistry();
    reg.register('url', fakeUrl);
    reg.register('pdf', fakeUrl);
    reg.register('some-future-kind', fakeUrl);
    expect(reg.kinds().sort()).toEqual(['pdf', 'some-future-kind', 'url']);
  });

  it('last registration of a kind wins (idempotent re-register)', () => {
    const reg = new ExtractorRegistry();
    const a: Extractor = async () => ({ markdown: 'a', source_key: 'k', trust: 'trusted' });
    const b: Extractor = async () => ({ markdown: 'b', source_key: 'k', trust: 'trusted' });
    reg.register('url', a);
    reg.register('url', b);
    expect(reg.resolve('url')).toBe(b);
    expect(reg.kinds()).toEqual(['url']);
  });
});

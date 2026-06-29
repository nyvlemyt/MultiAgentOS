import { describe, it, expect } from 'vitest';
import { extractUrl, canonicalUrl, urlSourceKey, FetchFailedError, type UrlDeps } from './url';
import { BlockedHostError } from '../net-guard';
import { ExtractorEmptyError } from './pdf';

const ARTICLE = '<html><head><title>Obsidian Bases</title></head><body><article><h1>Obsidian Bases</h1><p>Bases turn any set of notes into a powerful database view with filters and formulas.</p></article></body></html>';

function okResponse(body: string, status = 200, headers: Record<string, string> = {}) {
  return { status, url: 'https://help.obsidian.md/bases', headers: { get: (n: string) => headers[n.toLowerCase()] ?? null }, text: async () => body };
}

function deps(over: Partial<UrlDeps> = {}): UrlDeps {
  return {
    allowedHosts: ['help.obsidian.md', 'evil.internal'],
    resolve: async () => ['185.199.108.153'],
    fetch: (async () => okResponse(ARTICLE)) as unknown as typeof fetch,
    ...over,
  };
}

describe('canonicalUrl / urlSourceKey', () => {
  it('strips fragment + tracking params and lowercases host', () => {
    expect(canonicalUrl('https://Help.Obsidian.MD/bases?utm_source=x#top')).toBe('https://help.obsidian.md/bases');
  });
  it('source_key is a stable url: hash of the canonical URL', () => {
    expect(urlSourceKey('https://help.obsidian.md/bases#a')).toBe(urlSourceKey('https://help.obsidian.md/bases'));
  });
});

describe('extractUrl', () => {
  it('fetches → Defuddle → markdown with title + source header, untrusted', async () => {
    const r = await extractUrl('https://help.obsidian.md/bases', deps());
    expect(r.markdown).toContain('# Obsidian Bases');
    expect(r.markdown).toContain('> source: https://help.obsidian.md/bases');
    expect(r.markdown).toContain('powerful database view');
    expect(r.trust).toBe('untrusted');
    expect(r.source_key.startsWith('url:')).toBe(true);
  });

  it('blocks a non-allowlisted host before any fetch', async () => {
    let called = false;
    const d = deps({ fetch: (async () => { called = true; return okResponse(ARTICLE); }) as unknown as typeof fetch });
    await expect(extractUrl('https://not-allowed.example/x', d)).rejects.toThrow(BlockedHostError);
    expect(called).toBe(false);
  });

  it('re-checks the guard on a redirect to an internal host (SSRF bypass blocked)', async () => {
    const fetch = (async (url: string) => {
      if (url === 'https://help.obsidian.md/bases') return okResponse('', 302, { location: 'https://evil.internal/secret' });
      return okResponse(ARTICLE);
    }) as unknown as typeof fetch;
    const d = deps({ fetch, resolve: async (h: string) => (h === 'evil.internal' ? ['10.0.0.5'] : ['185.199.108.153']) });
    await expect(extractUrl('https://help.obsidian.md/bases', d)).rejects.toThrow(/private/);
  });

  it('maps an HTTP 404 to FetchFailedError', async () => {
    const d = deps({ fetch: (async () => okResponse('nope', 404)) as unknown as typeof fetch });
    await expect(extractUrl('https://help.obsidian.md/bases', d)).rejects.toThrow(FetchFailedError);
  });

  it('throws ExtractorEmptyError when Defuddle yields nothing', async () => {
    const d = deps({ fetch: (async () => okResponse('<html><body></body></html>')) as unknown as typeof fetch });
    await expect(extractUrl('https://help.obsidian.md/bases', d)).rejects.toThrow(ExtractorEmptyError);
  });
});

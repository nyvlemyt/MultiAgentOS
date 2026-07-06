// Article URL → clean markdown. Guarded fetch (net-guard re-checked on EVERY redirect hop — a 3xx to
// an internal host is the classic SSRF bypass), then Defuddle (useAsync:false, no third-party fetch).
import { createHash } from 'node:crypto';
import type { ExtractResult, Extractor } from '../extractor';
import { assertFetchAllowed, type NetGuardDeps } from '../net-guard';
import { ExtractorEmptyError } from './pdf';
import { htmlToMarkdown } from './html-to-markdown';

export const MIN_EXTRACT_CHARS = 20;
export const MAX_HTML_BYTES = 10 * 1024 * 1024;
export const MAX_REDIRECTS = 5;
export const FETCH_TIMEOUT_MS = 15_000;

const TRACKING_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];

export class FetchFailedError extends Error {
  constructor(target: string, status: number | string) {
    super(`fetch failed: ${target} — ${status}`);
    this.name = 'FetchFailedError';
  }
}

/** Lowercase host, drop fragment + tracking params → a stable identity for the content-hash key. */
export function canonicalUrl(raw: string): string {
  const u = new URL(raw);
  u.hash = '';
  u.hostname = u.hostname.toLowerCase();
  for (const p of TRACKING_PARAMS) u.searchParams.delete(p);
  return u.toString();
}

export function urlSourceKey(finalUrl: string): string {
  return `url:${createHash('sha256').update(canonicalUrl(finalUrl)).digest('hex')}`;
}

export interface UrlDeps extends NetGuardDeps {
  fetch: typeof fetch;
}

async function fetchGuarded(rawUrl: string, deps: UrlDeps): Promise<{ html: string; finalUrl: string }> {
  let url = rawUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertFetchAllowed(url, deps); // re-check every hop
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    let resp: Awaited<ReturnType<typeof fetch>>;
    try {
      resp = await deps.fetch(url, { redirect: 'manual', signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
    }
    if (resp.status >= 300 && resp.status < 400) {
      const loc = resp.headers.get('location');
      if (!loc) throw new FetchFailedError(url, `${resp.status} without Location`);
      url = new URL(loc, url).toString();
      continue;
    }
    if (resp.status >= 400) throw new FetchFailedError(url, resp.status);
    const declared = Number(resp.headers.get('content-length') ?? '0');
    if (declared > MAX_HTML_BYTES) throw new FetchFailedError(url, `oversize ${declared}`);
    const html = await resp.text();
    if (html.length > MAX_HTML_BYTES) throw new FetchFailedError(url, 'oversize body');
    return { html, finalUrl: url };
  }
  throw new FetchFailedError(rawUrl, 'too many redirects');
}

export async function extractUrl(rawUrl: string, deps: UrlDeps): Promise<ExtractResult> {
  const { html, finalUrl } = await fetchGuarded(rawUrl, deps);
  const { markdown, title } = await htmlToMarkdown(html, finalUrl);
  if (markdown.length < MIN_EXTRACT_CHARS) throw new ExtractorEmptyError(finalUrl);
  const heading = title || finalUrl;
  const body = `# ${heading}\n\n> source: ${finalUrl}\n\n${markdown}`;
  return { markdown: body, source_key: urlSourceKey(finalUrl), trust: 'untrusted' };
}

export function makeUrlExtractor(deps: UrlDeps): Extractor {
  return async (_kind, source) => extractUrl(source, deps);
}

# Web + Video Extractors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three conveyor extractor leaves — `url` (article → markdown via Defuddle), `html` (pasted page/text → markdown, the paywall escape-hatch), `youtube` (video → transcript+metadata via yt-dlp) — behind the project's first network-egress guard.

**Architecture:** Each leaf implements the frozen `Extractor = (kind, source) => Promise<ExtractResult>` and registers into the existing `ExtractorRegistry`; `runCapturePipeline` already orchestrates extract→classify→one-door, so no pipeline rewrite — only a new `host_not_allowed` dead-letter cause and CLI routing. A pure `assertFetchAllowed` net-guard (SSRF block + `allowed_hosts` allowlist, injected DNS resolver) gates the URL fetch and pre-screens the YouTube host; the `html` leaf touches no network.

**Tech Stack:** TypeScript, Vitest, Drizzle/SQLite, `defuddle@0.19.1` (`defuddle/node`, `markdown:true`, `useAsync:false`), `linkedom@0.18.12` (DOM for Defuddle), `yt-dlp` (pinned binary, `execFileSync`), Node `fetch` + `node:dns/promises`.

---

## File Structure

- **Create** `packages/memory/src/conveyor/net-guard.ts` — `assertFetchAllowed`, `BlockedHostError`, `NetGuardDeps`. SSRF + allowlist gate. Pure, injected DNS.
- **Create** `packages/memory/src/conveyor/extractors/bin.ts` — `resolveBin`, `BIN_DIRS` (lifted out of `pdf.ts`, shared with yt-dlp).
- **Create** `packages/memory/src/conveyor/extractors/html-to-markdown.ts` — `htmlToMarkdown(html, url?)` Defuddle wrapper (shared by `url` + `html`).
- **Create** `packages/memory/src/conveyor/extractors/url.ts` — `extractUrl`, `makeUrlExtractor`, `FetchFailedError`, `canonicalUrl`, `urlSourceKey`.
- **Create** `packages/memory/src/conveyor/extractors/html.ts` — `extractHtml`, `makeHtmlExtractor`, `htmlSourceKey`.
- **Create** `packages/memory/src/conveyor/extractors/youtube.ts` — `extractYoutube`, `makeYoutubeExtractor`, `realYoutubeRunner`, `vttToText`, `buildYoutubeMarkdown`, `youtubeVideoId`, `YOUTUBE_HOSTS`.
- **Modify** `packages/memory/src/conveyor/extractors/pdf.ts` — import `resolveBin`/`BIN_DIRS` from `./bin` (drop local copies; no behaviour change).
- **Modify** `packages/memory/src/conveyor/admission.ts` — add `host_not_allowed` to `DeadLetterCause` + `CAUSE_PHRASE`.
- **Modify** `packages/memory/src/conveyor/pipeline.ts` — map `BlockedHostError`→`host_not_allowed`, `FetchFailedError`→`paywall_404` via a shared `causeFor`.
- **Modify** `packages/memory/src/conveyor/cli.ts` — `inferKind` (youtube/url), `captureHtmlBlob`.
- **Modify** `packages/memory/src/mas-cli.ts` — register the 3 leaves with real deps; `--html [file|-]`.
- **Modify** `config/permissions.json` — seed `allowed_hosts`.
- **Modify** `docs/backlog/allowed-hosts-runtime-gate.md` — mark resolved.
- Tests co-located: `net-guard.test.ts`, `extractors/url.test.ts`, `extractors/html.test.ts`, `extractors/youtube.test.ts`, plus pipeline-cause cases in `pipeline.test.ts` and routing cases in `cli.test.ts`.

**Test command convention:** `pnpm --filter @mas/memory test <file-substring>` runs Vitest filtered to that file. Full gate: `pnpm -r test`.

---

### Task 1: Lock the new dependencies

**Files:**
- Modify: `packages/memory/package.json` (already carries `defuddle`/`linkedom` as uncommitted WIP)
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Verify the deps resolve**

Run: `pnpm install --filter @mas/memory`
Expected: lockfile already satisfied (`defuddle@0.19.1`, `linkedom@0.18.12` present), no errors.

- [ ] **Step 2: Sanity-check the Defuddle node entry imports**

Run: `pnpm --filter @mas/memory exec node -e "import('defuddle/node').then(m=>console.log(typeof m.Defuddle))"`
Expected: `function`

- [ ] **Step 3: Commit the dependency lock**

```bash
git add packages/memory/package.json pnpm-lock.yaml
git commit -m "build(memory): add defuddle + linkedom for web extractors"
```

---

### Task 2: Extract `resolveBin` into a shared `bin.ts`

**Files:**
- Create: `packages/memory/src/conveyor/extractors/bin.ts`
- Modify: `packages/memory/src/conveyor/extractors/pdf.ts`
- Test: `packages/memory/src/conveyor/extractors/bin.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/memory/src/conveyor/extractors/bin.test.ts
import { describe, it, expect } from 'vitest';
import { resolveBin, BIN_DIRS } from './bin';

describe('resolveBin', () => {
  it('exposes a fixed absolute-path allowlist (no PATH lookup)', () => {
    expect(BIN_DIRS.every((d) => d.startsWith('/'))).toBe(true);
  });

  it('throws a clear error when a binary is absent from every BIN_DIR', () => {
    expect(() => resolveBin('definitely-not-a-real-binary-xyz')).toThrow(/not found/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mas/memory test bin.test`
Expected: FAIL — `Cannot find module './bin'`.

- [ ] **Step 3: Create `bin.ts`**

```typescript
// packages/memory/src/conveyor/extractors/bin.ts
// Shared binary resolver: absolute path from a fixed allowlist, never a PATH lookup (S4036).
// Lifted out of pdf.ts so the YouTube leaf (yt-dlp) reuses the same hardened resolution.
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/** Fixed, unwriteable-by-default install dirs — resolve binaries here, never via PATH. */
export const BIN_DIRS = ['/opt/homebrew/bin', '/usr/local/bin', '/usr/bin', '/bin'];

/** Resolve a binary to an absolute path from the fixed allowlist; throw if absent (no silent fallback). */
export function resolveBin(name: string): string {
  for (const dir of BIN_DIRS) {
    const abs = join(dir, name);
    if (existsSync(abs)) return abs;
  }
  throw new Error(`required executable not found in ${BIN_DIRS.join(', ')}: ${name}`);
}
```

- [ ] **Step 4: Point `pdf.ts` at the shared resolver**

In `packages/memory/src/conveyor/extractors/pdf.ts`, delete the local `BIN_DIRS` const and `resolveBin` function, and add this import near the top (after the existing `node:*` imports):

```typescript
import { resolveBin } from './bin';
```

(Leave everything else in `pdf.ts` unchanged — `realPdfRunner` still calls `resolveBin('python3')` / `resolveBin('pdftotext')`.)

- [ ] **Step 5: Run tests to verify bin + pdf still pass**

Run: `pnpm --filter @mas/memory test bin.test pdf.test`
Expected: PASS (both files).

- [ ] **Step 6: Commit**

```bash
git add packages/memory/src/conveyor/extractors/bin.ts packages/memory/src/conveyor/extractors/bin.test.ts packages/memory/src/conveyor/extractors/pdf.ts
git commit -m "refactor(memory): share resolveBin via extractors/bin.ts"
```

---

### Task 3: `net-guard` — SSRF block + allowlist gate

**Files:**
- Create: `packages/memory/src/conveyor/net-guard.ts`
- Test: `packages/memory/src/conveyor/net-guard.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/memory/src/conveyor/net-guard.test.ts
import { describe, it, expect } from 'vitest';
import { assertFetchAllowed, BlockedHostError, type NetGuardDeps } from './net-guard';

const deps = (allowedHosts: string[], ips: string[]): NetGuardDeps => ({
  allowedHosts,
  resolve: async () => ips,
});

describe('assertFetchAllowed', () => {
  it('passes an allowlisted host that resolves to a public IP', async () => {
    const u = await assertFetchAllowed('https://help.obsidian.md/bases', deps(['help.obsidian.md'], ['185.199.108.153']));
    expect(u.hostname).toBe('help.obsidian.md');
  });

  it('rejects a non-http(s) scheme', async () => {
    await expect(assertFetchAllowed('file:///etc/passwd', deps(['x'], ['1.1.1.1']))).rejects.toThrow(BlockedHostError);
  });

  it('rejects a host not in the allowlist', async () => {
    await expect(assertFetchAllowed('https://evil.example.com/', deps(['help.obsidian.md'], ['1.1.1.1']))).rejects.toThrow(/not in allowed_hosts/);
  });

  it('rejects DNS-rebind: allowlisted host resolving to a private IP', async () => {
    await expect(assertFetchAllowed('https://help.obsidian.md/', deps(['help.obsidian.md'], ['127.0.0.1']))).rejects.toThrow(/private/);
  });

  it('rejects a v4-mapped IPv6 loopback', async () => {
    await expect(assertFetchAllowed('https://help.obsidian.md/', deps(['help.obsidian.md'], ['::ffff:127.0.0.1']))).rejects.toThrow(/private/);
  });

  it('rejects when the host does not resolve at all', async () => {
    await expect(assertFetchAllowed('https://help.obsidian.md/', deps(['help.obsidian.md'], []))).rejects.toThrow(/did not resolve/);
  });

  it('empty allowlist denies everything (secure default)', async () => {
    await expect(assertFetchAllowed('https://help.obsidian.md/', deps([], ['1.1.1.1']))).rejects.toThrow(BlockedHostError);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mas/memory test net-guard.test`
Expected: FAIL — `Cannot find module './net-guard'`.

- [ ] **Step 3: Create `net-guard.ts`**

```typescript
// packages/memory/src/conveyor/net-guard.ts
// The project's FIRST network-egress control (CLAUDE.md §5). Every outbound fetch the conveyor
// makes passes through assertFetchAllowed: scheme allowlist + host allowlist + SSRF/DNS-rebind
// block. This is the runtime enforcement the schema-only allowed_hosts field always promised
// (docs/backlog/allowed-hosts-runtime-gate.md). DNS is injected so units run with zero network.
export class BlockedHostError extends Error {
  constructor(public readonly target: string, reason: string) {
    super(`blocked outbound fetch: ${target} — ${reason}`);
    this.name = 'BlockedHostError';
  }
}

export interface NetGuardDeps {
  /** Exact-match host allowlist from config/permissions.json#allowed_hosts. Empty ⇒ deny all. */
  allowedHosts: string[];
  /** DNS seam: the IPs a host resolves to (injected; real impl uses node:dns/promises lookup). */
  resolve: (host: string) => Promise<string[]>;
}

/** Private / loopback / link-local / unspecified ranges, v4 + v6 (incl. v4-mapped v6). */
export function isPrivateIp(ip: string): boolean {
  const addr = ip.toLowerCase().replace(/^::ffff:/, '');
  if (addr.includes('.')) {
    const o = addr.split('.').map((n) => Number(n));
    if (o.length !== 4 || o.some((n) => Number.isNaN(n))) return true; // unparsable ⇒ treat as unsafe
    const [a, b] = o as [number, number, number, number];
    return a === 127 || a === 10 || a === 0 || (a === 192 && b === 168) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31);
  }
  // IPv6: ::1 loopback, :: unspecified, fc00::/7 ULA (fc/fd), fe80::/10 link-local (fe8–feb).
  return addr === '::1' || addr === '::' || /^f[cd]/.test(addr) || /^fe[89ab]/.test(addr);
}

/** Throws BlockedHostError unless: scheme is http(s), host ∈ allowlist, and every resolved IP is public. */
export async function assertFetchAllowed(rawUrl: string, deps: NetGuardDeps): Promise<URL> {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    throw new BlockedHostError(rawUrl, 'malformed URL');
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new BlockedHostError(rawUrl, `scheme ${u.protocol} not allowed`);
  }
  const host = u.hostname.toLowerCase();
  const allow = deps.allowedHosts.map((h) => h.toLowerCase());
  if (!allow.includes(host)) {
    throw new BlockedHostError(rawUrl, `host ${host} not in allowed_hosts`);
  }
  const ips = await deps.resolve(host);
  if (ips.length === 0) {
    throw new BlockedHostError(rawUrl, `host ${host} did not resolve`);
  }
  for (const ip of ips) {
    if (isPrivateIp(ip)) {
      throw new BlockedHostError(rawUrl, `host ${host} resolves to private/internal IP ${ip}`);
    }
  }
  return u;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mas/memory test net-guard.test`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/memory/src/conveyor/net-guard.ts packages/memory/src/conveyor/net-guard.test.ts
git commit -m "feat(memory): net-guard — SSRF + allowed_hosts egress gate (§5)"
```

---

### Task 4: `html` leaf — pasted page/text escape-hatch (no network)

**Files:**
- Create: `packages/memory/src/conveyor/extractors/html-to-markdown.ts`
- Create: `packages/memory/src/conveyor/extractors/html.ts`
- Test: `packages/memory/src/conveyor/extractors/html.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/memory/src/conveyor/extractors/html.test.ts
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mas/memory test html.test`
Expected: FAIL — `Cannot find module './html'`.

- [ ] **Step 3: Create the shared Defuddle wrapper**

```typescript
// packages/memory/src/conveyor/extractors/html-to-markdown.ts
// Shared Defuddle cleaner used by both the url leaf (with a source URL) and the html leaf (without).
// useAsync:false is a SECURITY requirement: Defuddle ships built-in extractors that fetch
// third-party APIs (incl. its own YouTube fetcher); leaving it on would bypass net-guard (§5).
import { Defuddle } from 'defuddle/node';

export async function htmlToMarkdown(html: string, url?: string): Promise<{ markdown: string; title: string }> {
  const res = await Defuddle(html, url, { markdown: true, useAsync: false });
  return { markdown: (res.content ?? '').trim(), title: (res.title ?? '').trim() };
}
```

- [ ] **Step 4: Create `html.ts`**

```typescript
// packages/memory/src/conveyor/extractors/html.ts
// The paste escape-hatch: a blocked/paywalled page the user copies in. Source = the raw blob
// (HTML or already-clean text), NO network, NO net-guard. HTML → Defuddle; plain text → passthrough.
import { createHash } from 'node:crypto';
import type { ExtractResult, Extractor } from '../extractor';
import { ExtractorEmptyError } from './pdf';
import { htmlToMarkdown } from './html-to-markdown';

/** Below this many chars an extraction counts as empty. Mirrors the pdf leaf threshold. */
export const MIN_EXTRACT_CHARS = 20;

const looksLikeHtml = (s: string): boolean => /<[a-z!][\s\S]*>/i.test(s);

/** Content-addressed, idempotent re-paste key. */
export function htmlSourceKey(blob: string): string {
  return `html:${createHash('sha256').update(blob).digest('hex')}`;
}

export async function extractHtml(blob: string): Promise<ExtractResult> {
  const source_key = htmlSourceKey(blob);
  let markdown: string;
  let title = '';
  if (looksLikeHtml(blob)) {
    const r = await htmlToMarkdown(blob);
    markdown = r.markdown;
    title = r.title;
  } else {
    markdown = blob.trim();
  }
  if (markdown.length < MIN_EXTRACT_CHARS) throw new ExtractorEmptyError('<pasted blob>');
  const body = title ? `# ${title}\n\n${markdown}` : markdown;
  return { markdown: body, source_key, trust: 'untrusted' };
}

/** Adapt to the frozen Extractor signature: source IS the pasted blob (not a path/URL). */
export function makeHtmlExtractor(): Extractor {
  return async (_kind, source) => extractHtml(source);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @mas/memory test html.test`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add packages/memory/src/conveyor/extractors/html-to-markdown.ts packages/memory/src/conveyor/extractors/html.ts packages/memory/src/conveyor/extractors/html.test.ts
git commit -m "feat(memory): html paste extractor (paywall escape-hatch)"
```

---

### Task 5: `url` leaf — guarded fetch + Defuddle, redirect-safe

**Files:**
- Create: `packages/memory/src/conveyor/extractors/url.ts`
- Test: `packages/memory/src/conveyor/extractors/url.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/memory/src/conveyor/extractors/url.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mas/memory test url.test`
Expected: FAIL — `Cannot find module './url'`.

- [ ] **Step 3: Create `url.ts`**

```typescript
// packages/memory/src/conveyor/extractors/url.ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mas/memory test url.test`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/memory/src/conveyor/extractors/url.ts packages/memory/src/conveyor/extractors/url.test.ts
git commit -m "feat(memory): url extractor — guarded fetch + Defuddle, redirect-safe"
```

---

### Task 6: Pipeline dead-letter causes for blocked/failed fetches

**Files:**
- Modify: `packages/memory/src/conveyor/admission.ts:6-12` (`DeadLetterCause` + `CAUSE_PHRASE`)
- Modify: `packages/memory/src/conveyor/pipeline.ts` (`causeFor` mapping)
- Test: `packages/memory/src/conveyor/pipeline.test.ts` (add cases)

- [ ] **Step 1: Write the failing tests (append to `pipeline.test.ts`)**

```typescript
// append inside packages/memory/src/conveyor/pipeline.test.ts
import { BlockedHostError } from './net-guard';
import { FetchFailedError } from './extractors/url';
import { memoryCandidates as candTable } from '@mas/db'; // alias if memoryCandidates already imported; otherwise reuse existing import

describe('runCapturePipeline — fetch dead-letters', () => {
  it('maps BlockedHostError to a host_not_allowed dead-letter', async () => {
    const db = getDb();
    const registry = new ExtractorRegistry();
    registry.register('url', async () => { throw new BlockedHostError('https://evil/x', 'host evil not in allowed_hosts'); });
    const res = await runCapturePipeline(db, { kind: 'url', source: 'https://evil/x' }, { registry });
    expect(res.failed).toHaveLength(1);
    const [row] = await db.select().from(candTable).where(eq(candTable.id, res.failed[0]!));
    expect(row!.status).toBe('capture_failed');
    expect(row!.body).toContain('host_not_allowed');
  });

  it('maps FetchFailedError to a paywall_404 dead-letter', async () => {
    const db = getDb();
    const registry = new ExtractorRegistry();
    registry.register('url', async () => { throw new FetchFailedError('https://x/a', 404); });
    const res = await runCapturePipeline(db, { kind: 'url', source: 'https://x/a' }, { registry });
    expect(res.failed).toHaveLength(1);
    const [row] = await db.select().from(candTable).where(eq(candTable.id, res.failed[0]!));
    expect(row!.body).toContain('paywall_404');
  });
});
```

> If `memoryCandidates` is already imported at the top of `pipeline.test.ts`, drop the aliased import line and use `memoryCandidates` directly instead of `candTable`.

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter @mas/memory test pipeline.test`
Expected: FAIL — body contains `extractor_crash`, not `host_not_allowed` (current mapping is `ExtractorEmptyError ? ocr_empty : extractor_crash`).

- [ ] **Step 3: Add the `host_not_allowed` cause**

In `packages/memory/src/conveyor/admission.ts`, extend the union (after `'oversize'`) and the phrase map:

```typescript
export type DeadLetterCause =
  | 'extractor_crash'
  | 'ocr_empty'
  | 'paywall_404'
  | 'oversize'
  | 'host_not_allowed'
  | 'double_abstain'
  | 'unknown_source_kind';
```

```typescript
const CAUSE_PHRASE: Record<DeadLetterCause, string> = {
  extractor_crash: 'extractor crashed',
  ocr_empty: 'extraction produced no text (OCR empty)',
  paywall_404: 'source unreachable (404 / paywall)',
  oversize: 'source exceeds the size limit',
  host_not_allowed: 'outbound host not in allowed_hosts (blocked by net-guard §5)',
  double_abstain: 'classifier double-abstain (rules + LLM)',
  unknown_source_kind: 'no extractor registered for this source kind',
};
```

- [ ] **Step 4: Add the `causeFor` mapping in `pipeline.ts`**

Add imports near the existing `ExtractorEmptyError` import:

```typescript
import { BlockedHostError } from './net-guard';
import { FetchFailedError } from './extractors/url';
```

Add this helper (after the `failed` function):

```typescript
function causeFor(e: unknown): DeadLetterCause {
  if (e instanceof ExtractorEmptyError) return 'ocr_empty';
  if (e instanceof BlockedHostError) return 'host_not_allowed';
  if (e instanceof FetchFailedError) return 'paywall_404';
  return 'extractor_crash';
}
```

Replace the two inline cause expressions. In `runCapturePipeline`:

```typescript
  } catch (e) {
    const cause = causeFor(e);
    return failed(db, taskId, `[${cause}] ${src.source}`, cause, (e as Error).message);
  }
```

In `extractAll`:

```typescript
    } catch (e) {
      const cause = causeFor(e);
      dead.push({ type: 'reference', body: `[${cause}] ${src.source}`, captureFailed: { cause, detail: (e as Error).message } });
    }
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm --filter @mas/memory test pipeline.test`
Expected: PASS (existing + 2 new).

- [ ] **Step 6: Commit**

```bash
git add packages/memory/src/conveyor/admission.ts packages/memory/src/conveyor/pipeline.ts packages/memory/src/conveyor/pipeline.test.ts
git commit -m "feat(memory): map blocked/failed fetch to host_not_allowed/paywall_404"
```

---

### Task 7: `youtube` leaf — yt-dlp transcript + metadata

**Files:**
- Create: `packages/memory/src/conveyor/extractors/youtube.ts`
- Test: `packages/memory/src/conveyor/extractors/youtube.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/memory/src/conveyor/extractors/youtube.test.ts
import { describe, it, expect } from 'vitest';
import { extractYoutube, makeYoutubeExtractor, vttToText, youtubeVideoId, buildYoutubeMarkdown, YOUTUBE_HOSTS, type YoutubeRunner } from './youtube';
import { BlockedHostError, type NetGuardDeps } from '../net-guard';
import { ExtractorEmptyError } from './pdf';

const guard: NetGuardDeps = { allowedHosts: YOUTUBE_HOSTS, resolve: async () => ['142.250.0.1'] };

const META = JSON.stringify({ id: 'abc123', title: 'Great Talk', channel: 'ACME', upload_date: '20260101', duration: 600, description: 'A description line.', chapters: [{ title: 'Intro', start_time: 0 }, { title: 'Core', start_time: 90 }] });
const VTT = 'WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nHello <c>everyone</c>\n\n00:00:03.000 --> 00:00:05.000\nHello everyone\n\n00:00:05.000 --> 00:00:07.000\nwelcome to the talk';

const runner = (over: Partial<{ metadataJson: string; vtt: string | null }> = {}): YoutubeRunner => () => ({ metadataJson: META, vtt: VTT, ...over });

describe('youtubeVideoId', () => {
  it('parses watch, youtu.be and shorts forms', () => {
    expect(youtubeVideoId('https://www.youtube.com/watch?v=abc123')).toBe('abc123');
    expect(youtubeVideoId('https://youtu.be/abc123')).toBe('abc123');
    expect(youtubeVideoId('https://www.youtube.com/shorts/abc123')).toBe('abc123');
  });
});

describe('vttToText', () => {
  it('strips timestamps/tags and dedups consecutive repeats', () => {
    expect(vttToText(VTT)).toBe('Hello everyone welcome to the talk');
  });
});

describe('extractYoutube', () => {
  it('composes title + chapters + description + transcript markdown, untrusted, youtube: key', async () => {
    const r = await extractYoutube('https://www.youtube.com/watch?v=abc123', runner(), guard);
    expect(r.markdown).toContain('# Great Talk');
    expect(r.markdown).toContain('## Chapters');
    expect(r.markdown).toContain('## Transcript');
    expect(r.markdown).toContain('welcome to the talk');
    expect(r.source_key).toBe('youtube:abc123');
    expect(r.trust).toBe('untrusted');
  });

  it('still produces a candidate from description alone when there are no subtitles', async () => {
    const r = await extractYoutube('https://youtu.be/abc123', runner({ vtt: null }), guard);
    expect(r.markdown).toContain('## Description');
    expect(r.markdown).not.toContain('## Transcript');
  });

  it('throws ExtractorEmptyError when both transcript and description are empty', async () => {
    const empty = JSON.stringify({ id: 'abc123', title: 'X' });
    await expect(extractYoutube('https://youtu.be/abc123', runner({ metadataJson: empty, vtt: null }), guard)).rejects.toThrow(ExtractorEmptyError);
  });

  it('blocks a non-allowlisted host before spawning the runner', async () => {
    let spawned = false;
    const r: YoutubeRunner = () => { spawned = true; return { metadataJson: META, vtt: VTT }; };
    const blocked: NetGuardDeps = { allowedHosts: [], resolve: async () => ['142.250.0.1'] };
    await expect(extractYoutube('https://www.youtube.com/watch?v=abc123', r, blocked)).rejects.toThrow(BlockedHostError);
    expect(spawned).toBe(false);
  });

  it('makeYoutubeExtractor adapts to the frozen Extractor signature', async () => {
    const ex = makeYoutubeExtractor(runner(), guard);
    const r = await ex('youtube', 'https://youtu.be/abc123');
    expect(r.source_key).toBe('youtube:abc123');
  });
});

describe('buildYoutubeMarkdown', () => {
  it('omits empty sections', () => {
    const md = buildYoutubeMarkdown({ id: 'z', title: 'T' }, '');
    expect(md).toContain('# T');
    expect(md).not.toContain('## Transcript');
    expect(md).not.toContain('## Chapters');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mas/memory test youtube.test`
Expected: FAIL — `Cannot find module './youtube'`.

- [ ] **Step 3: Create `youtube.ts`**

```typescript
// packages/memory/src/conveyor/extractors/youtube.ts
// YouTube video → transcript + metadata markdown via pinned yt-dlp (the pdf.ts subprocess pattern:
// resolveBin + execFileSync args-array + injected runner so units spawn zero processes).
// EGRESS TRUST BOUNDARY: yt-dlp does its own HTTP, so net-guard cannot wrap its fetch. Instead we
// (a) assertFetchAllowed on the INPUT host before spawning (must be an allowlisted YouTube domain),
// and (b) trust the pinned binary. Visual-frame capture is a deferred bolt-on (--frames), see
// docs/backlog/youtube-visual-frames-extractor.md.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ExtractResult, Extractor } from '../extractor';
import { assertFetchAllowed, type NetGuardDeps } from '../net-guard';
import { ExtractorEmptyError } from './pdf';
import { resolveBin } from './bin';

const MAX_SUBPROCESS_BUFFER = 64 * 1024 * 1024;

/** Exact hosts for both the allowlist seed and CLI kind-inference. */
export const YOUTUBE_HOSTS = ['www.youtube.com', 'youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be'];

export function youtubeVideoId(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    if (host === 'youtu.be') return u.pathname.slice(1) || null;
    const v = u.searchParams.get('v');
    if (v) return v;
    const m = u.pathname.match(/\/(?:shorts|embed|live)\/([^/?]+)/);
    return m ? m[1]! : null;
  } catch {
    return null;
  }
}

export interface YoutubeData {
  metadataJson: string;
  vtt: string | null;
}

/** Subprocess seam — injected so tests run with zero child processes. */
export type YoutubeRunner = (url: string) => YoutubeData;

/** The real runner: `yt-dlp -J` for metadata + a temp-dir subtitle write, then VTT read + cleanup. */
export const realYoutubeRunner: YoutubeRunner = (url) => {
  const bin = resolveBin('yt-dlp');
  const metadataJson = execFileSync(bin, ['-J', '--skip-download', '--no-warnings', url], { encoding: 'utf8', maxBuffer: MAX_SUBPROCESS_BUFFER });
  const dir = mkdtempSync(join(tmpdir(), 'mas-yt-'));
  try {
    execFileSync(
      bin,
      ['--skip-download', '--write-subs', '--write-auto-subs', '--sub-langs', 'en.*,en,fr,.*', '--sub-format', 'vtt', '--no-warnings', '-o', join(dir, '%(id)s.%(ext)s'), url],
      { encoding: 'utf8', maxBuffer: MAX_SUBPROCESS_BUFFER },
    );
    const vttFile = readdirSync(dir).find((f) => f.endsWith('.vtt'));
    const vtt = vttFile ? readFileSync(join(dir, vttFile), 'utf8') : null;
    return { metadataJson, vtt };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

/** Strip WEBVTT header/cue-index/timestamps/inline tags; collapse consecutive duplicate lines. */
export function vttToText(vtt: string): string {
  const out: string[] = [];
  for (const raw of vtt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line === 'WEBVTT') continue;
    if (line.startsWith('NOTE') || line.startsWith('Kind:') || line.startsWith('Language:')) continue;
    if (line.includes('-->') || /^\d+$/.test(line)) continue;
    const text = line.replace(/<[^>]+>/g, '').trim();
    if (text && out[out.length - 1] !== text) out.push(text);
  }
  return out.join(' ');
}

interface YtMeta {
  id?: string;
  title?: string;
  channel?: string;
  uploader?: string;
  upload_date?: string;
  duration?: number;
  description?: string;
  chapters?: { title: string; start_time: number }[];
}

function fmtTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

export function buildYoutubeMarkdown(meta: YtMeta, transcript: string): string {
  const title = meta.title ?? meta.id ?? 'YouTube video';
  const sub = [meta.channel ?? meta.uploader, meta.upload_date, meta.duration != null ? `${meta.duration}s` : null].filter(Boolean).join(' · ');
  const parts = [sub ? `# ${title}\n\n> ${sub}` : `# ${title}`];
  if (meta.chapters?.length) {
    parts.push(`## Chapters\n\n${meta.chapters.map((c) => `- ${fmtTime(c.start_time)} ${c.title}`).join('\n')}`);
  }
  if (meta.description?.trim()) parts.push(`## Description\n\n${meta.description.trim()}`);
  if (transcript.trim()) parts.push(`## Transcript\n\n${transcript.trim()}`);
  return parts.join('\n\n');
}

export async function extractYoutube(rawUrl: string, runner: YoutubeRunner, guard: NetGuardDeps): Promise<ExtractResult> {
  await assertFetchAllowed(rawUrl, guard); // host must be an allowlisted YouTube domain (throws BlockedHostError)
  const data = runner(rawUrl);
  let meta: YtMeta;
  try {
    meta = JSON.parse(data.metadataJson) as YtMeta;
  } catch {
    meta = {};
  }
  const transcript = data.vtt ? vttToText(data.vtt) : '';
  if (!transcript && !meta.description?.trim()) throw new ExtractorEmptyError(rawUrl);
  const id = meta.id ?? youtubeVideoId(rawUrl) ?? 'unknown';
  return { markdown: buildYoutubeMarkdown(meta, transcript), source_key: `youtube:${id}`, trust: 'untrusted' };
}

export function makeYoutubeExtractor(runner: YoutubeRunner, guard: NetGuardDeps): Extractor {
  return async (_kind, source) => extractYoutube(source, runner, guard);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mas/memory test youtube.test`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/memory/src/conveyor/extractors/youtube.ts packages/memory/src/conveyor/extractors/youtube.test.ts
git commit -m "feat(memory): youtube extractor — yt-dlp transcript + metadata"
```

---

### Task 8: CLI routing — youtube/url inference + `captureHtmlBlob`

**Files:**
- Modify: `packages/memory/src/conveyor/cli.ts`
- Test: `packages/memory/src/conveyor/cli.test.ts`

- [ ] **Step 1: Write the failing tests (append to `cli.test.ts`)**

```typescript
// append inside packages/memory/src/conveyor/cli.test.ts
import { inferKind } from './cli';

describe('inferKind (web/video)', () => {
  it('routes YouTube hosts to the youtube leaf', () => {
    expect(inferKind('https://www.youtube.com/watch?v=abc')).toBe('youtube');
    expect(inferKind('https://youtu.be/abc')).toBe('youtube');
  });
  it('routes other http(s) to the url leaf', () => {
    expect(inferKind('https://help.obsidian.md/bases')).toBe('url');
  });
  it('keeps pdf + unknown routing', () => {
    expect(inferKind('/x/y.pdf')).toBe('pdf');
    expect(inferKind('/x/y.docx')).toBe('unknown');
  });
});
```

> `captureHtmlBlob` is exercised end-to-end in Task 9's smoke; here we cover the pure router. If `describe`/`expect` are already imported at the top of `cli.test.ts`, do not re-import them.

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter @mas/memory test cli.test`
Expected: FAIL — `inferKind('https://www.youtube.com/...')` returns `'url'`, not `'youtube'`.

- [ ] **Step 3: Update `cli.ts`**

Add the import at the top:

```typescript
import { YOUTUBE_HOSTS } from './extractors/youtube';
```

Replace `inferKind` with:

```typescript
const YT_BARE = new Set(YOUTUBE_HOSTS.map((h) => h.replace(/^www\./, '')));

export function inferKind(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    try {
      const host = new URL(pathOrUrl).hostname.toLowerCase().replace(/^www\./, '');
      if (YT_BARE.has(host)) return 'youtube';
    } catch {
      /* fall through to url */
    }
    return 'url';
  }
  if (pathOrUrl.toLowerCase().endsWith('.pdf')) return 'pdf';
  return 'unknown';
}
```

Add `captureHtmlBlob` (after `captureOne`):

```typescript
/** Capture a pasted blob (HTML or clean text) — the paywall escape-hatch. source = the blob itself. */
export function captureHtmlBlob(db: Db, blob: string, title: string, deps: PipelineDeps): Promise<CaptureResult> {
  return runCapturePipeline(db, { kind: 'html', source: blob, title, bytes: Buffer.byteLength(blob) }, deps);
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm --filter @mas/memory test cli.test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/memory/src/conveyor/cli.ts packages/memory/src/conveyor/cli.test.ts
git commit -m "feat(memory): CLI routes youtube/url + captureHtmlBlob"
```

---

### Task 9: Wire real extractors + `--html` into `mas-cli.ts`; seed allowlist

**Files:**
- Modify: `packages/memory/src/mas-cli.ts`
- Modify: `config/permissions.json`

- [ ] **Step 1: Seed `config/permissions.json` allowed_hosts**

Replace the `allowed_hosts` line so the verification hosts are allowed:

```json
{
  "version": 1,
  "categories": [],
  "allowed_hosts": [
    "help.obsidian.md",
    "www.youtube.com",
    "youtube.com",
    "m.youtube.com",
    "music.youtube.com",
    "youtu.be"
  ]
}
```

- [ ] **Step 2: Rewrite `buildDeps` + add `--html` in `mas-cli.ts`**

Add imports:

```typescript
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { lookup } from 'node:dns/promises';
import { makeHtmlExtractor } from './conveyor/extractors/html';
import { makeUrlExtractor } from './conveyor/extractors/url';
import { makeYoutubeExtractor, realYoutubeRunner } from './conveyor/extractors/youtube';
import { captureHtmlBlob } from './conveyor/cli';
import type { NetGuardDeps } from './conveyor/net-guard';
```

Replace `buildDeps()` with a root-aware version:

```typescript
const resolveHost = async (host: string): Promise<string[]> => (await lookup(host, { all: true })).map((a) => a.address);

function loadAllowedHosts(root: string): string[] {
  try {
    const cfg = JSON.parse(readFileSync(resolve(root, 'config/permissions.json'), 'utf8')) as { allowed_hosts?: string[] };
    return cfg.allowed_hosts ?? [];
  } catch {
    return [];
  }
}

function buildDeps(root: string): PipelineDeps {
  const guard: NetGuardDeps = { allowedHosts: loadAllowedHosts(root), resolve: resolveHost };
  const registry = new ExtractorRegistry();
  registry.register('pdf', makePdfExtractor());
  registry.register('html', makeHtmlExtractor());
  registry.register('url', makeUrlExtractor({ ...guard, fetch }));
  registry.register('youtube', makeYoutubeExtractor(realYoutubeRunner, guard));
  return { registry }; // no llm/budget → rules-only, §11-safe
}
```

Update `main()` to compute `root` once, pass it to `buildDeps`, and handle `--html` before the `--inbox` branch:

```typescript
async function main(): Promise<void> {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd !== 'capture' || rest.length === 0) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }
  const root = findRepoRoot();
  const db = getDb();
  const deps = buildDeps(root);
  if (rest[0] === '--html') {
    const arg = rest[1];
    const fromStdin = !arg || arg === '-';
    const blob = fromStdin ? readFileSync(0, 'utf8') : readFileSync(resolve(arg), 'utf8');
    const title = fromStdin ? 'pasted-html' : basename(arg);
    console.log(formatSummary(await captureHtmlBlob(db, blob, title, deps)));
    return;
  }
  if (rest[0] === '--inbox') {
    const dir = rest[1] ?? resolve(root, 'docs/resources/inbox');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    console.log(formatSummary(await captureInbox(db, dir, deps)));
    return;
  }
  console.log(formatSummary(await captureOne(db, rest[0]!, deps)));
}
```

Update the `USAGE` string:

```typescript
const USAGE = 'usage: mas capture <path|url> | mas capture --html [file|-] | mas capture --inbox [dir]';
```

- [ ] **Step 3: Type-check the wiring (no unit test — covered by build + smokes)**

Run: `pnpm --filter @mas/memory build`
Expected: PASS (tsc clean — confirms every import + signature lines up).

- [ ] **Step 4: Commit**

```bash
git add packages/memory/src/mas-cli.ts config/permissions.json
git commit -m "feat(memory): wire url/html/youtube leaves + --html; seed allowed_hosts"
```

---

### Task 10: Resolve the backlog card, run the gate + smokes, open the PR

**Files:**
- Modify: `docs/backlog/allowed-hosts-runtime-gate.md`

- [ ] **Step 1: Mark the allowed_hosts card resolved**

Append to `docs/backlog/allowed-hosts-runtime-gate.md`:

```markdown

## RESOLVED — 2026-06-29 (Brique 6 increment 3)

The host-check seam shipped as `packages/memory/src/conveyor/net-guard.ts` (`assertFetchAllowed`): scheme allowlist + `allowed_hosts` exact-match + SSRF/DNS-rebind block, DNS injected for tests. Its first consumers are the conveyor's `url` and `youtube` extractors — the "first outbound-calling" trigger this card was waiting for. A blocked host dead-letters as `host_not_allowed` (visible + relaunchable, never silent). The broader dispatch-path reuse (domain agents routing a miss through the interactive §5 pause) consumes the same seam when it lands.
```

- [ ] **Step 2: Run the full 5-check gate**

```bash
pnpm -r test
pnpm lint
pnpm build
pnpm --filter @mas/web smoke
```
Expected: all green. (Sonar runs after push — Step 5.)

- [ ] **Step 3: Real end-to-end smokes (network on; hosts seeded in Task 9)**

```bash
pnpm mas capture https://help.obsidian.md/bases
pnpm mas capture 'https://www.youtube.com/watch?v=<a-real-talk-id>'
printf '<html><body><article><h1>Pasted</h1><p>Pasted paywalled content here.</p></article></body></html>' | pnpm mas capture --html -
```
Expected: each prints `[mas capture] 1 pending, 0 failed, 0 rejected.` (the URL smoke ingests Obsidian Bases for real; `--html -` makes no network call). If yt-dlp is absent, the youtube smoke dead-letters with `extractor_crash: required executable not found …` — install via `brew install yt-dlp` then re-run (never a silent skip).

- [ ] **Step 4: Commit the card + push**

```bash
git add docs/backlog/allowed-hosts-runtime-gate.md
git commit -m "docs(memory): resolve allowed-hosts-runtime-gate (net-guard shipped)"
git push -u origin knowledge-os/brique-6-url-extractor
```

- [ ] **Step 5: Sonar (the 5th check) + draft PR**

- Poll until SonarCloud analysis of the pushed HEAD sha lands, then run `scripts/sonar-pr-issues.sh <pr>` and fix everything it lists (read `docs/knowledge/sonar-recurring-rules.md` first). Done = exit 0 **and** `qualitygates/project_status == OK`, analysis sha == HEAD.
- Open the PR **as draft** with base `knowledge-os/brique-1` (per the increment chain): `gh pr create --draft --base knowledge-os/brique-1 --title "feat(memory): Brique 6 inc-3 — web/video extractors" --body "<summary + links to spec/plan>"`.

---

## Self-Review

**Spec coverage:** net-guard (D1)→T3; url (D2)→T5; html (D3)→T4; youtube (D4)→T7; CLI routing + allowlist seed (D5)→T8+T9; visual-frames deferred (D6)→backlog card (already written, referenced in T7 header); `host_not_allowed` never-silent + closes the allowed-hosts card (§1, done-criteria)→T6+T10; `bin.ts` shared resolver (scope §2 build item 2)→T2; deps lock→T1. All BUILD items covered; all DEFER items remain unbuilt with sockets noted.

**Placeholder scan:** every code step carries full code; the only intentional fill-in is `<a-real-talk-id>` / `<pr>` / `<summary>` in Task 10 runtime commands (real values supplied at execution, not code). No "TBD"/"handle edge cases"/"similar to Task N".

**Type consistency:** `ExtractResult {markdown, source_key, trust}` used identically across all leaves; `NetGuardDeps {allowedHosts, resolve}` shared by net-guard/url/youtube; `Extractor = (kind, source) => Promise<ExtractResult>` honored by every `make*Extractor`; `BlockedHostError`/`FetchFailedError`/`ExtractorEmptyError` defined before `causeFor` consumes them (T3/T5/pdf precede T6); `YOUTUBE_HOSTS` exported from youtube.ts and consumed by cli.ts (T7 precedes T8); `useAsync:false` consistent in `html-to-markdown.ts` (shared by url+html). `DeadLetterCause` gains `host_not_allowed`; `paywall_404` reused (already present). No signature drift.

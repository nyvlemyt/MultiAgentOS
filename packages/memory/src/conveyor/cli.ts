// packages/memory/src/conveyor/cli.ts
// CLI logic for `pnpm mas capture` (testable, subprocess-free here — the real PdfRunner is injected
// by mas-cli.ts). Grouping decision A: an inbox SUBFOLDER = one matière (→ manifest); loose files at
// the inbox root = single candidates. Unknown kinds dead-letter, never silently skip.
import { readdirSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import type { getDb } from '@mas/db';
import type { CaptureResult } from '../capture';
import { runCapturePipeline, runMatierePipeline, type PipelineDeps, type PipelineSource } from './pipeline';
import { YOUTUBE_HOSTS } from './extractors/youtube';

type Db = ReturnType<typeof getDb>;

const YT_BARE = new Set(YOUTUBE_HOSTS.map((h) => h.replace(/^www\./, '')));

const EXT_KINDS: Record<string, string> = { '.pdf': 'pdf', '.docx': 'docx', '.pptx': 'pptx' };

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
  return EXT_KINDS[extname(pathOrUrl.toLowerCase())] ?? 'unknown';
}

function toSource(path: string): PipelineSource {
  let bytes: number | undefined;
  try { bytes = statSync(path).size; } catch { bytes = undefined; }
  return { kind: inferKind(path), source: path, title: basename(path), bytes };
}

/** Capture a single path/URL. */
export function captureOne(db: Db, pathOrUrl: string, deps: PipelineDeps): Promise<CaptureResult> {
  return runCapturePipeline(db, toSource(pathOrUrl), deps);
}

/** Capture a pasted blob (HTML or clean text) — the paywall escape-hatch. source = the blob itself. */
export function captureHtmlBlob(db: Db, blob: string, title: string, deps: PipelineDeps): Promise<CaptureResult> {
  return runCapturePipeline(db, { kind: 'html', source: blob, title, bytes: Buffer.byteLength(blob) }, deps);
}

function mergeResults(a: CaptureResult, b: CaptureResult): CaptureResult {
  return {
    pending: [...a.pending, ...b.pending],
    failed: [...a.failed, ...b.failed],
    rejected: [...a.rejected, ...b.rejected],
    duplicate: [...a.duplicate, ...b.duplicate],
  };
}

/** Process a drop folder: subfolders → matières (manifest), loose files → singles. */
export async function captureInbox(db: Db, dir: string, deps: PipelineDeps): Promise<CaptureResult> {
  let acc: CaptureResult = { pending: [], failed: [], rejected: [], duplicate: [] };
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const files = readdirSync(full).filter((f) => !f.startsWith('.')).map((f) => toSource(join(full, f)));
      if (files.length === 0) continue;
      acc = mergeResults(acc, await runMatierePipeline(db, { parentId: entry.name, title: entry.name, derivedFrom: full, sources: files }, deps));
    } else if (!entry.name.startsWith('.')) {
      acc = mergeResults(acc, await runCapturePipeline(db, toSource(full), deps));
    }
  }
  return acc;
}

export function formatSummary(res: CaptureResult): string {
  return `[mas capture] ${res.pending.length} pending, ${res.failed.length} failed, ${res.rejected.length} rejected, ${res.duplicate.length} duplicate.`;
}

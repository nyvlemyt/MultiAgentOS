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
    const m = /\/(?:shorts|embed|live)\/([^/?]+)/.exec(u.pathname);
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

/** Strip complete `<…>` inline tags via linear scan (no regex backtracking, S8786); unmatched `<` kept verbatim. */
function stripVttTags(line: string): string {
  let out = '';
  let i = 0;
  while (i < line.length) {
    if (line[i] === '<') {
      const close = line.indexOf('>', i + 1);
      if (close > i + 1) {
        i = close + 1;
        continue;
      }
    }
    out += line[i];
    i++;
  }
  return out;
}

/** Strip WEBVTT header/cue-index/timestamps/inline tags; collapse consecutive duplicate lines. */
export function vttToText(vtt: string): string {
  const out: string[] = [];
  for (const raw of vtt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line === 'WEBVTT') continue;
    if (line.startsWith('NOTE') || line.startsWith('Kind:') || line.startsWith('Language:')) continue;
    if (line.includes('-->') || /^\d+$/.test(line)) continue;
    const text = stripVttTags(line).trim();
    if (text && out.at(-1) !== text) out.push(text);
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
  const subParts = [meta.channel ?? meta.uploader, meta.upload_date];
  if (meta.duration != null) subParts.push(`${meta.duration}s`);
  const sub = subParts.filter(Boolean).join(' · ');
  const parts = [sub ? `# ${title}\n\n> ${sub}` : `# ${title}`];
  if (meta.chapters?.length) {
    const chapterLines = meta.chapters.map((c) => `- ${fmtTime(c.start_time)} ${c.title}`).join('\n');
    parts.push(`## Chapters\n\n${chapterLines}`);
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

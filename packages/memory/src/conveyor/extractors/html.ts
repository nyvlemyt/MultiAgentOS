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

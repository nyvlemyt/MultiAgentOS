// Shared Defuddle cleaner used by both the url leaf (with a source URL) and the html leaf (without).
// useAsync:false is a SECURITY requirement: Defuddle ships built-in extractors that fetch
// third-party APIs (incl. its own YouTube fetcher); leaving it on would bypass net-guard (§5).
import { Defuddle } from 'defuddle/node';

export async function htmlToMarkdown(html: string, url?: string): Promise<{ markdown: string; title: string }> {
  const res = await Defuddle(html, url, { markdown: true, useAsync: false });
  return { markdown: (res.content ?? '').trim(), title: (res.title ?? '').trim() };
}

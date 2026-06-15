// Minimal, dependency-free Markdown → safe HTML for agent reports.
// Escapes HTML first (no XSS), then a small subset: headings, bold, inline code,
// fenced code blocks, bullet lists, links. Bounded quantifiers (no ReDoS).

function escapeHtml(s: string): string {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function inline(s: string): string {
  return s
    .replace(/`([^`]{1,200})`/g, '<code>$1</code>')
    .replace(/\*\*([^*]{1,200})\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]{1,200})\]\((https?:\/\/[^\s)]{1,500})\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

type Block =
  | { kind: 'code'; lines: string[] }
  | { kind: 'list'; items: string[] }
  | { kind: 'h'; level: number; text: string }
  | { kind: 'p'; text: string };

const HEADING = /^(#{1,3}) (.{1,300})$/;
const LIST_ITEM = /^[-*] (.{1,300})$/;

type ParseState = { blocks: Block[]; code: string[] | null; list: string[] | null };

function flushList(st: ParseState): void {
  if (st.list) { st.blocks.push({ kind: 'list', items: st.list }); st.list = null; }
}

// A non-fence, non-code line → heading / list item / paragraph.
function consumeText(st: ParseState, line: string): void {
  const h = HEADING.exec(line);
  if (h) { flushList(st); st.blocks.push({ kind: 'h', level: h[1]!.length, text: h[2]! }); return; }
  const li = LIST_ITEM.exec(line);
  if (li) { st.list ??= []; st.list.push(li[1]!); return; }
  flushList(st);
  if (line.trim() !== '') st.blocks.push({ kind: 'p', text: line });
}

// Pass 1: group escaped lines into blocks (keeps each function simple).
function parseBlocks(lines: string[]): Block[] {
  const st: ParseState = { blocks: [], code: null, list: null };
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (st.code) { st.blocks.push({ kind: 'code', lines: st.code }); st.code = null; }
      else { flushList(st); st.code = []; }
    } else if (st.code) {
      st.code.push(line);
    } else {
      consumeText(st, line);
    }
  }
  flushList(st);
  if (st.code) st.blocks.push({ kind: 'code', lines: st.code });
  return st.blocks;
}

// Pass 2: render blocks to HTML.
function renderBlock(b: Block): string {
  switch (b.kind) {
    case 'code':
      return `<pre><code>${b.lines.join('\n')}</code></pre>`;
    case 'list': {
      const items = b.items.map((i) => `<li>${inline(i)}</li>`).join('');
      return `<ul>${items}</ul>`;
    }
    case 'h':
      return `<h${b.level}>${inline(b.text)}</h${b.level}>`;
    default:
      return `<p>${inline(b.text)}</p>`;
  }
}

export function renderMarkdown(src: string): string {
  return parseBlocks(escapeHtml(src).split('\n')).map(renderBlock).join('\n');
}

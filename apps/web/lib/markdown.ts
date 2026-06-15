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

// Pass 1: group escaped lines into blocks (keeps each function simple).
function parseBlocks(lines: string[]): Block[] {
  const blocks: Block[] = [];
  let code: string[] | null = null;
  let list: string[] | null = null;
  const flushList = () => { if (list) { blocks.push({ kind: 'list', items: list }); list = null; } };

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (code) { blocks.push({ kind: 'code', lines: code }); code = null; }
      else { flushList(); code = []; }
      continue;
    }
    if (code) { code.push(line); continue; }

    const h = HEADING.exec(line);
    if (h) { flushList(); blocks.push({ kind: 'h', level: h[1]!.length, text: h[2]! }); continue; }

    const li = LIST_ITEM.exec(line);
    if (li) { list ??= []; list.push(li[1]!); continue; }

    flushList();
    if (line.trim() !== '') blocks.push({ kind: 'p', text: line });
  }
  flushList();
  if (code) blocks.push({ kind: 'code', lines: code });
  return blocks;
}

// Pass 2: render blocks to HTML.
function renderBlock(b: Block): string {
  switch (b.kind) {
    case 'code':
      return `<pre><code>${b.lines.join('\n')}</code></pre>`;
    case 'list':
      return `<ul>${b.items.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>`;
    case 'h':
      return `<h${b.level}>${inline(b.text)}</h${b.level}>`;
    default:
      return `<p>${inline(b.text)}</p>`;
  }
}

export function renderMarkdown(src: string): string {
  return parseBlocks(escapeHtml(src).split('\n')).map(renderBlock).join('\n');
}

// Minimal, dependency-free Markdown → safe HTML for agent reports.
// Escapes HTML first (no XSS), then applies a small, predictable subset:
// headings, bold, inline code, fenced code blocks, bullet lists, links.
// Not a full CommonMark engine — just enough for readable deliverable reports.

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s: string): string {
  return s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

export function renderMarkdown(src: string): string {
  const escaped = escapeHtml(src);
  const lines = escaped.split('\n');
  const out: string[] = [];
  let inList = false;
  let inCode = false;
  const closeList = () => { if (inList) { out.push('</ul>'); inList = false; } };

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inCode) { out.push('</code></pre>'); inCode = false; }
      else { closeList(); out.push('<pre><code>'); inCode = true; }
      continue;
    }
    if (inCode) { out.push(line); continue; }

    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) { closeList(); const lvl = h[1]!.length; out.push(`<h${lvl}>${inline(h[2]!)}</h${lvl}>`); continue; }

    const li = /^[-*]\s+(.*)$/.exec(line);
    if (li) { if (!inList) { out.push('<ul>'); inList = true; } out.push(`<li>${inline(li[1]!)}</li>`); continue; }

    if (line.trim() === '') { closeList(); continue; }
    closeList();
    out.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  if (inCode) out.push('</code></pre>');
  return out.join('\n');
}

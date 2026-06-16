import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('escapes HTML to prevent injection', () => {
    expect(renderMarkdown('<script>alert(1)</script>')).not.toContain('<script>');
    expect(renderMarkdown('<script>x</script>')).toContain('&lt;script&gt;');
  });

  it('renders headings, bold, inline code', () => {
    expect(renderMarkdown('# Titre')).toContain('<h1>Titre</h1>');
    expect(renderMarkdown('**gras**')).toContain('<strong>gras</strong>');
    expect(renderMarkdown('`x`')).toContain('<code>x</code>');
  });

  it('renders bullet lists', () => {
    const html = renderMarkdown('- a\n- b');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>a</li>');
    expect(html).toContain('<li>b</li>');
  });

  it('renders fenced code blocks', () => {
    const html = renderMarkdown('```\nconst x = 1\n```');
    expect(html).toContain('<pre><code>');
    expect(html).toContain('const x = 1');
  });

  it('renders links to safe anchors', () => {
    expect(renderMarkdown('[a](https://x.io)')).toContain('<a href="https://x.io"');
  });
});

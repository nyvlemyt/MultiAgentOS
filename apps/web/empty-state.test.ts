import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EmptyState } from './components/EmptyState';

function render(props: Parameters<typeof EmptyState>[0]): string {
  return renderToStaticMarkup(createElement(EmptyState, props));
}

describe('EmptyState', () => {
  it('renders the title and a status landmark', () => {
    const html = render({ title: 'No projects yet' });
    // <output> carries an implicit ARIA status role (S6819 — preferred over role="status").
    expect(html).toContain('<output');
    expect(html).toContain('No projects yet');
  });

  it('renders the hint when provided', () => {
    expect(render({ title: 'T', hint: 'Register one to start' })).toContain('Register one to start');
  });

  it('renders a CTA link when provided', () => {
    const html = render({ title: 'T', cta: { label: '+ New project', href: '/projects/new' } });
    expect(html).toContain('href="/projects/new"');
    expect(html).toContain('+ New project');
  });

  it('omits the CTA and hint when not provided', () => {
    const html = render({ title: 'Only title' });
    expect(html).not.toContain('<a');
  });
});

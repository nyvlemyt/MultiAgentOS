import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AlertBanner, AlertBadge } from './components/AlertSurface';
import type { Alert } from './lib/alerts';

const ALERT: Alert = {
  what: 'Quota journalier atteint — le dispatch est en pause.',
  why: "Aucune tâche ne partira tant que le plafond n'est pas relevé.",
  action: 'Relève le plafond dans Jetons.',
  route: '/tokens',
  severity: 'danger',
};

describe('AlertSurface — seul rendu d’alerte autorisé', () => {
  it('bannière : rend les trois phrases et la route', () => {
    const html = renderToStaticMarkup(createElement(AlertBanner, { alert: ALERT }));
    expect(html).toContain('Quota journalier atteint');
    expect(html).toContain('plafond');
    expect(html).toContain('href="/tokens"');
  });

  it('bannière : alerte absente ⇒ aucun rendu', () => {
    expect(renderToStaticMarkup(createElement(AlertBanner, { alert: null }))).toBe('');
  });

  it('badge : rend le « quoi » et porte pourquoi + action en title', () => {
    const html = renderToStaticMarkup(createElement(AlertBadge, { alert: ALERT, testId: 'x-badge' }));
    expect(html).toContain('data-testid="x-badge"');
    expect(html).toContain('Quota journalier atteint');
    expect(html).toContain('title=');
  });

  it('badge : alerte absente ⇒ aucun rendu', () => {
    expect(renderToStaticMarkup(createElement(AlertBadge, { alert: null }))).toBe('');
  });
});

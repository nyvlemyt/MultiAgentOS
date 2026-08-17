import { describe, it, expect } from 'vitest';
import { makeAlert } from './alerts';

describe('makeAlert — contrat C12 (P15)', () => {
  it('accepte une alerte dont les trois phrases + la route sont remplies', () => {
    const a = makeAlert({
      what: 'Quota journalier atteint — le dispatch est en pause.',
      why: "Aucune tâche ne partira tant que le plafond n'est pas relevé.",
      action: 'Relève le plafond dans Jetons.',
      route: '/tokens',
      severity: 'danger',
    });
    expect(a.route).toBe('/tokens');
    expect(a.severity).toBe('danger');
  });

  it.each(['what', 'why', 'action'])('refuse une alerte dont %s est vide', (field) => {
    const base: Record<string, unknown> = {
      what: 'x', why: 'y', action: 'z', route: '/tokens', severity: 'info',
    };
    expect(() => makeAlert({ ...base, [field]: '   ' })).toThrow(/contrat C12/);
  });

  it('refuse une route qui ne commence pas par /', () => {
    expect(() => makeAlert({
      what: 'x', why: 'y', action: 'z', route: 'tokens', severity: 'info',
    })).toThrow(/contrat C12/);
  });

  it('refuse une sévérité hors contrat', () => {
    expect(() => makeAlert({
      what: 'x', why: 'y', action: 'z', route: '/tokens', severity: 'catastrophe',
    })).toThrow(/contrat C12/);
  });
});

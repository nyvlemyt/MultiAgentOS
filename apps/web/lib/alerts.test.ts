import { describe, it, expect } from 'vitest';
import { budgetPauseAlert, pendingValidationsAlert, projectBudgetAlert, makeAlert } from './alerts';

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

describe('familles d’alertes — null ≠ zéro', () => {
  it('budget pause : aucun fait (null) ⇒ aucune alerte', () => {
    expect(budgetPauseAlert(null)).toBeNull();
  });

  it('budget pause : fait présent ⇒ alerte danger routée vers /tokens', () => {
    const a = budgetPauseAlert({ window: 'day', at: new Date('2026-08-14T10:00:00Z') });
    expect(a?.severity).toBe('danger');
    expect(a?.route).toBe('/tokens');
    expect(a?.what).toContain('journalier');
  });

  it('validations : liste vide = zéro RÉEL ⇒ aucune alerte', () => {
    expect(pendingValidationsAlert([])).toBeNull();
  });

  it('validations : 2 en attente ⇒ une alerte qui dit quoi faire', () => {
    const a = pendingValidationsAlert([{ risk: 'high' }, { risk: 'low' }]);
    expect(a?.what).toContain('2');
    expect(a?.action).not.toBe('');
    expect(a?.route).toBe('/');
    expect(a?.severity).toBe('danger');
  });

  it('validations : aucun risque élevé ⇒ alerte warning', () => {
    const a = pendingValidationsAlert([{ risk: 'low' }, { risk: 'medium' }]);
    expect(a?.severity).toBe('warning');
  });

  it('budget projet : aucun plafond déclaré (null) ⇒ aucune alerte, PAS une alerte à 0 %', () => {
    expect(projectBudgetAlert(null, '/projects/otakugo')).toBeNull();
  });

  it('budget projet : 40 % consommés ⇒ sous le seuil, aucune alerte', () => {
    expect(projectBudgetAlert(40, '/projects/otakugo')).toBeNull();
  });

  it('budget projet : 90 % consommés ⇒ seuil inclus, alerte warning', () => {
    const a = projectBudgetAlert(90, '/projects/otakugo');
    expect(a?.severity).toBe('warning');
  });

  it('budget projet : 92 % consommés ⇒ alerte warning', () => {
    const a = projectBudgetAlert(92, '/projects/otakugo');
    expect(a?.severity).toBe('warning');
    expect(a?.what).toContain('92');
  });
});

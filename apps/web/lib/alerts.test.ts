import { describe, it, expect } from 'vitest';
import { budgetPauseAlert, pendingValidationsAlert, projectBudgetAlert, makeAlert, missionDesyncAlert } from './alerts';
import type { Reconciliation } from './mission-truth';

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

describe('famille désync (C1 × C12)', () => {
  it('mission synchronisée ⇒ aucune alerte', () => {
    const r: Reconciliation = { declared: 'executing', computed: 'active', desynced: false, reason: null };
    expect(missionDesyncAlert('m1', r)).toBeNull();
  });

  it('mission périmée ⇒ alerte qui porte la raison, la route et le geste', () => {
    const r: Reconciliation = {
      declared: 'executing',
      computed: 'stalled',
      desynced: true,
      reason: 'aucune activité depuis 120 min alors que la mission est déclarée « executing »',
    };
    const a = missionDesyncAlert('m1', r);
    expect(a?.what).toContain('Désynchronisé');
    expect(a?.what).toContain('120 min');
    expect(a?.route).toBe('/missions/m1');
    expect(a?.severity).toBe('warning');
    expect(a?.action).not.toBe('');
  });

  it('désync bloquante ⇒ sévérité danger', () => {
    const r: Reconciliation = { declared: 'executing', computed: 'blocked', desynced: true, reason: '1 tâche(s) bloquée(s)' };
    expect(missionDesyncAlert('m1', r)?.severity).toBe('danger');
  });
});

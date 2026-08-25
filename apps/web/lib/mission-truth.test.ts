import { describe, it, expect } from 'vitest';
import { reconcileMissionStatus, STALE_AFTER_MS, type MissionFacts } from './mission-truth';

const NOW = new Date('2026-08-14T12:00:00Z');
const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60_000);

function facts(over: Partial<MissionFacts> = {}): MissionFacts {
  return {
    missionId: 'm1',
    declared: 'executing',
    lastEventAt: minutesAgo(1),
    taskCount: 3,
    blockedTaskCount: 0,
    pendingValidationCount: 0,
    budgetExceeded: false,
    reportVerdict: null,
    ...over,
  };
}

describe('reconcileMissionStatus — aucun fait ⇒ aucune alerte', () => {
  it('mission sans aucun event et sans tâche ⇒ unknown, jamais désynchronisée', () => {
    const r = reconcileMissionStatus(
      facts({ declared: 'executing', lastEventAt: null, taskCount: 0, budgetExceeded: null }),
      NOW,
    );
    expect(r.computed).toBe('unknown');
    expect(r.desynced).toBe(false);
    expect(r.reason).toBeNull();
  });

  it('budget non déclaré (null) ne fabrique pas un dépassement', () => {
    const r = reconcileMissionStatus(facts({ budgetExceeded: null }), NOW);
    expect(r.computed).toBe('active');
    expect(r.desynced).toBe(false);
  });
});

describe('reconcileMissionStatus — worker mort en plein executing', () => {
  it('déclaré executing + dernier event vieux de 11 min ⇒ stalled + désynchronisé + raison', () => {
    const r = reconcileMissionStatus(facts({ lastEventAt: minutesAgo(11) }), NOW);
    expect(r.computed).toBe('stalled');
    expect(r.desynced).toBe(true);
    expect(r.reason).toContain('11 min');
    expect(r.reason).toContain('executing');
  });

  it('déclaré executing + event il y a 9 min ⇒ active, PAS de faux désync', () => {
    const r = reconcileMissionStatus(facts({ lastEventAt: minutesAgo(9) }), NOW);
    expect(r.computed).toBe('active');
    expect(r.desynced).toBe(false);
  });

  it('le seuil est injectable (le défaut est 10 min)', () => {
    expect(STALE_AFTER_MS).toBe(10 * 60_000);
    const r = reconcileMissionStatus(facts({ lastEventAt: minutesAgo(2) }), NOW, 60_000);
    expect(r.computed).toBe('stalled');
  });

  it('une mission déclarée draft qui dort n’est pas désynchronisée', () => {
    const r = reconcileMissionStatus(facts({ declared: 'draft', lastEventAt: minutesAgo(600) }), NOW);
    expect(r.computed).toBe('stalled');
    expect(r.desynced).toBe(false);
  });
});

describe('reconcileMissionStatus — ordre strict des règles (P1)', () => {
  it('budget dépassé passe avant tout le reste', () => {
    const r = reconcileMissionStatus(
      facts({ budgetExceeded: true, blockedTaskCount: 2, pendingValidationCount: 1 }),
      NOW,
    );
    expect(r.computed).toBe('halted_budget');
    expect(r.desynced).toBe(true);
  });

  it('tâche bloquée ⇒ blocked, désynchronisé quand la mission se dit executing', () => {
    const r = reconcileMissionStatus(facts({ blockedTaskCount: 1 }), NOW);
    expect(r.computed).toBe('blocked');
    expect(r.desynced).toBe(true);
    expect(r.reason).toContain('1');
  });

  // Option B (carte §Suite) : une pause au gate §5 laisse la mission déclarée
  // « executing » par construction — c'est le système qui marche, pas un
  // mensonge. L'âge de l'attente est porté par la famille 2, pas par un désync.
  it('validation en attente en executing ⇒ awaiting_human, PAS un désync', () => {
    const r = reconcileMissionStatus(facts({ pendingValidationCount: 2 }), NOW);
    expect(r.computed).toBe('awaiting_human');
    expect(r.desynced).toBe(false);
  });

  it('idem en dispatched, l’autre palier où le gate peut mordre', () => {
    const r = reconcileMissionStatus(facts({ declared: 'dispatched', pendingValidationCount: 1 }), NOW);
    expect(r.desynced).toBe(false);
  });

  it('ni en review, où l’attente humaine est le sens même du statut', () => {
    const r = reconcileMissionStatus(facts({ declared: 'review', pendingValidationCount: 2 }), NOW);
    expect(r.computed).toBe('awaiting_human');
    expect(r.desynced).toBe(false);
  });

  it('mais une validation ouverte sur une mission déclarée planned ⇒ désync', () => {
    const r = reconcileMissionStatus(facts({ declared: 'planned', pendingValidationCount: 1 }), NOW);
    expect(r.computed).toBe('awaiting_human');
    expect(r.desynced).toBe(true);
    expect(r.reason).toContain('planned');
  });

  it('mission déclarée blocked mais qui produit des events ⇒ désynchronisée', () => {
    const r = reconcileMissionStatus(facts({ declared: 'blocked', lastEventAt: minutesAgo(1) }), NOW);
    expect(r.computed).toBe('active');
    expect(r.desynced).toBe(true);
  });

  it('mission archivée avec une validation encore ouverte ⇒ désynchronisée', () => {
    const r = reconcileMissionStatus(facts({ declared: 'archived', pendingValidationCount: 1 }), NOW);
    expect(r.desynced).toBe(true);
  });
});

// Couture C3 (docs/backlog/contrat-rapport-mission.md) : la colonne reports.verdict
// n'existe pas encore, le collecteur renvoie null. La RÈGLE, elle, est écrite et
// testée dès maintenant — C3 n'aura qu'à alimenter le fait.
describe('reconcileMissionStatus — verdict de rapport (couture C3)', () => {
  it('verdict absent (null) ne produit aucun effet', () => {
    const r = reconcileMissionStatus(facts({ declared: 'validated', lastEventAt: minutesAgo(90), reportVerdict: null }), NOW);
    expect(r.desynced).toBe(false);
  });

  it('verdict BLOCK sur une mission déclarée validated ⇒ désynchronisée', () => {
    const r = reconcileMissionStatus(facts({ declared: 'validated', reportVerdict: 'BLOCK' }), NOW);
    expect(r.computed).toBe('blocked');
    expect(r.desynced).toBe(true);
    expect(r.reason).toContain('BLOCK');
  });

  it('verdict NEEDS_WORK ⇒ needs_attention', () => {
    const r = reconcileMissionStatus(facts({ declared: 'archived', reportVerdict: 'NEEDS_WORK' }), NOW);
    expect(r.computed).toBe('needs_attention');
    expect(r.desynced).toBe(true);
  });

  it('verdict PASS ne crée pas d’alerte', () => {
    const r = reconcileMissionStatus(facts({ declared: 'validated', reportVerdict: 'PASS' }), NOW);
    expect(r.desynced).toBe(false);
  });
});

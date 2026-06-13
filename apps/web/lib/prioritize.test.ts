import { describe, it, expect } from 'vitest';
import {
  priorityScore,
  remainingCapacity,
  isDeadlineSoon,
  isDeadlineUnrealistic,
} from './prioritize';

describe('priorityScore — deterministic, no LLM', () => {
  it('computes the ROADMAP weighted formula', () => {
    // 80*.35 + 60*.30 + (100-20)*.20 + (100-10)*.15 = 28 + 18 + 16 + 13.5 = 75.5 → 76
    expect(priorityScore({ impact: 80, urgency: 60, effortEst: 20, riskScore: 10 })).toBe(76);
  });

  it('all-max inputs with zero effort/risk clamp to 100', () => {
    expect(priorityScore({ impact: 100, urgency: 100, effortEst: 0, riskScore: 0 })).toBe(100);
  });

  it('all-zero impact/urgency, max effort/risk floors at 0', () => {
    expect(priorityScore({ impact: 0, urgency: 0, effortEst: 100, riskScore: 100 })).toBe(0);
  });

  it('clamps out-of-range inputs into 0–100 before weighting', () => {
    expect(priorityScore({ impact: 999, urgency: 100, effortEst: -50, riskScore: 0 })).toBe(100);
  });
});

describe('remainingCapacity — rolling 30-day arithmetic', () => {
  it('returns ~N missions when budget covers several', () => {
    const r = remainingCapacity({ monthlyCapCents: 1500, spentCents: 240, avgMissionCostCents: 100 });
    expect(r.missionsRemaining).toBe(12); // floor((1500-240)/100) = 12
    expect(r.label).toBe('~12 missions');
  });

  it('floors to "< 1 mission" when budget covers a fraction', () => {
    const r = remainingCapacity({ monthlyCapCents: 300, spentCents: 250, avgMissionCostCents: 100 });
    expect(r.label).toBe('< 1 mission');
  });

  it('no spend history ⇒ cannot estimate', () => {
    const r = remainingCapacity({ monthlyCapCents: 1500, spentCents: 0, avgMissionCostCents: 0 });
    expect(r.missionsRemaining).toBe(0);
    expect(r.label).toBe('—');
  });

  it('over budget ⇒ 0 missions', () => {
    const r = remainingCapacity({ monthlyCapCents: 100, spentCents: 200, avgMissionCostCents: 50 });
    expect(r.label).toBe('0 missions');
  });
});

describe('deadline arithmetic — pure, no LLM', () => {
  const now = new Date('2026-06-13T00:00:00Z');

  it('flags a deadline within 7 days', () => {
    expect(isDeadlineSoon(new Date('2026-06-18T00:00:00Z'), now)).toBe(true);
  });

  it('does not flag a deadline beyond 7 days', () => {
    expect(isDeadlineSoon(new Date('2026-06-30T00:00:00Z'), now)).toBe(false);
  });

  it('null deadline is never soon', () => {
    expect(isDeadlineSoon(null, now)).toBe(false);
  });

  it('flags unrealistic when projected finish exceeds the deadline', () => {
    // createdAt + spentTokens/monthlyRate*30d. spent=600k, rate=300k/mo → 2 months projection.
    const createdAt = new Date('2026-06-01T00:00:00Z');
    const deadline = new Date('2026-06-20T00:00:00Z'); // < createdAt + ~60d
    expect(
      isDeadlineUnrealistic({ deadline, createdAt, spentTokens: 600_000, monthlyTokenRate: 300_000 }),
    ).toBe(true);
  });

  it('not unrealistic when the deadline is comfortably past the projection', () => {
    const createdAt = new Date('2026-06-01T00:00:00Z');
    const deadline = new Date('2026-12-01T00:00:00Z');
    expect(
      isDeadlineUnrealistic({ deadline, createdAt, spentTokens: 600_000, monthlyTokenRate: 300_000 }),
    ).toBe(false);
  });

  it('null deadline or zero rate ⇒ not unrealistic', () => {
    expect(isDeadlineUnrealistic({ deadline: null, createdAt: now, spentTokens: 1, monthlyTokenRate: 1 })).toBe(false);
    expect(isDeadlineUnrealistic({ deadline: now, createdAt: now, spentTokens: 1, monthlyTokenRate: 0 })).toBe(false);
  });
});

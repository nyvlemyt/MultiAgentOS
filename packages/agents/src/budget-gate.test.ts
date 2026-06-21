import { describe, it, expect } from 'vitest';
import { evaluateBudget } from './budget-gate';

describe('evaluateBudget — pure window decision', () => {
  it('passes when both windows are under cap', () => {
    const s = evaluateBudget({ spent: 10, cap: 100 }, { spent: 50, cap: 500 });
    expect(s.blocked).toBe(false);
    expect(s.window).toBeNull();
  });

  it('blocks on day when day spent reaches its cap', () => {
    const s = evaluateBudget({ spent: 100, cap: 100 }, { spent: 50, cap: 500 });
    expect(s.blocked).toBe(true);
    expect(s.window).toBe('day');
  });

  it('blocks on week when only the week cap is reached', () => {
    const s = evaluateBudget({ spent: 10, cap: 100 }, { spent: 500, cap: 500 });
    expect(s.blocked).toBe(true);
    expect(s.window).toBe('week');
  });

  it('reports day first when both windows are over cap', () => {
    const s = evaluateBudget({ spent: 200, cap: 100 }, { spent: 999, cap: 500 });
    expect(s.blocked).toBe(true);
    expect(s.window).toBe('day');
  });

  it('treats a cap of 0 as unlimited (never blocks)', () => {
    const s = evaluateBudget({ spent: 9_999, cap: 0 }, { spent: 9_999, cap: 0 });
    expect(s.blocked).toBe(false);
    expect(s.window).toBeNull();
  });

  it('echoes the window figures back for telemetry', () => {
    const s = evaluateBudget({ spent: 100, cap: 100 }, { spent: 50, cap: 500 });
    expect(s.day).toEqual({ spent: 100, cap: 100 });
    expect(s.week).toEqual({ spent: 50, cap: 500 });
  });
});

import { describe, it, expect } from 'vitest';
import { evaluateBudget } from './budget-gate';

const w = (spent: number, reserved: number, cap: number) => ({ spent, reserved, cap });

describe('evaluateBudget — concurrency-aware window decision', () => {
  it('passes when logged + reserved stay under cap', () => {
    const s = evaluateBudget(w(10, 5, 100), w(50, 5, 500));
    expect(s.blocked).toBe(false);
    expect(s.window).toBeNull();
  });

  it('counts in-flight reserved tokens toward the estimate (concurrent agents)', () => {
    // logged 60 alone is under 100, but two running tasks reserve 50 more → 110 ≥ 100.
    const s = evaluateBudget(w(60, 50, 100), w(60, 50, 500));
    expect(s.blocked).toBe(true);
    expect(s.window).toBe('day');
    expect(s.day.estimate).toBe(110);
  });

  it('blocks on day when logged spend alone reaches the cap', () => {
    const s = evaluateBudget(w(100, 0, 100), w(50, 0, 500));
    expect(s.blocked).toBe(true);
    expect(s.window).toBe('day');
  });

  it('blocks on week when only the week estimate is exhausted', () => {
    const s = evaluateBudget(w(10, 0, 100), w(480, 30, 500));
    expect(s.blocked).toBe(true);
    expect(s.window).toBe('week');
  });

  it('reports day first when both windows are over cap', () => {
    const s = evaluateBudget(w(200, 0, 100), w(999, 0, 500));
    expect(s.window).toBe('day');
  });

  it('treats a cap of 0 as unlimited (never blocks, remaining null)', () => {
    const s = evaluateBudget(w(9999, 9999, 0), w(9999, 9999, 0));
    expect(s.blocked).toBe(false);
    expect(s.window).toBeNull();
    expect(s.day.remaining).toBeNull();
  });

  it('exposes remaining = cap − estimate for the meter', () => {
    const s = evaluateBudget(w(60, 10, 100), w(60, 10, 500));
    expect(s.day.remaining).toBe(30);
    expect(s.week.remaining).toBe(430);
  });

  it('clamps remaining at 0 once exhausted (never negative)', () => {
    const s = evaluateBudget(w(120, 40, 100), w(0, 0, 500));
    expect(s.day.remaining).toBe(0);
  });

  it('blocks on month when only the month estimate is exhausted', () => {
    const s = evaluateBudget(w(10, 0, 100), w(50, 0, 500), w(990, 20, 1000));
    expect(s.blocked).toBe(true);
    expect(s.window).toBe('month');
    expect(s.month.estimate).toBe(1010);
  });

  it('reports day before week before month when all over cap', () => {
    const s = evaluateBudget(w(200, 0, 100), w(999, 0, 500), w(9999, 0, 1000));
    expect(s.window).toBe('day');
  });

  it('reports week before month when both over cap (day clear)', () => {
    const s = evaluateBudget(w(10, 0, 100), w(600, 0, 500), w(9999, 0, 1000));
    expect(s.window).toBe('week');
  });

  it('defaults month to an unlimited, non-blocking window when omitted', () => {
    const s = evaluateBudget(w(10, 0, 100), w(50, 0, 500));
    expect(s.month.cap).toBe(0);
    expect(s.month.remaining).toBeNull();
    expect(s.blocked).toBe(false);
  });

  it('treats a month cap of 0 as unlimited (never blocks)', () => {
    const s = evaluateBudget(w(1, 0, 100), w(1, 0, 500), w(9_999_999, 0, 0));
    expect(s.blocked).toBe(false);
    expect(s.month.remaining).toBeNull();
  });
});
